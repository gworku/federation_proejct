<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Concerns\HandlesCrud;
use App\Models\Contribution;
use App\Models\ContributionPayment;
use App\Support\ApiTransforms;
use App\Support\Audit;
use App\Support\Roles;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ContributionController extends Controller
{
    use HandlesCrud;

    public function __construct()
    {
        $this->modelClass = Contribution::class;
        $this->lookupField = 'id';
        $this->fillable = [
            'utility_id', 'organization_name', 'invoice_number', 'period_label',
            'amount', 'amount_paid', 'currency', 'issued_at', 'due_at', 'status', 'notes',
            'attachment_url', 'attachment_name',
        ];
        $this->inputAliases = ['utility' => 'utility_id'];
        $this->transform = fn (Contribution $row) => ApiTransforms::contribution($row);
        $this->staffWriteCheck = fn ($user, $method) => Roles::isFinanceStaff($user);
    }

    protected function storeRules(Request $request): array
    {
        return [
            'utility_id' => ['nullable', 'integer', 'exists:utilities,id'],
            'organization_name' => ['required', 'string', 'max:255'],
            'invoice_number' => ['required', 'string', 'max:64', 'unique:contributions,invoice_number'],
            'period_label' => ['required', 'string', 'max:64'],
            'amount' => ['required', 'numeric', 'min:0'],
            'amount_paid' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'max:8'],
            'issued_at' => ['nullable', 'date'],
            'due_at' => ['nullable', 'date'],
            'status' => ['nullable', 'in:draft,issued,partial,paid,overdue,waived,cancelled'],
            'notes' => ['nullable', 'string'],
            'attachment_url' => ['nullable', 'string', 'max:500'],
            'attachment_name' => ['nullable', 'string', 'max:255'],
        ];
    }

    protected function updateRules(Request $request, Model $model): array
    {
        return [
            'utility_id' => ['sometimes', 'nullable', 'integer', 'exists:utilities,id'],
            'organization_name' => ['sometimes', 'string', 'max:255'],
            'invoice_number' => ['sometimes', 'string', 'max:64', 'unique:contributions,invoice_number,'.$model->id],
            'period_label' => ['sometimes', 'string', 'max:64'],
            'amount' => ['sometimes', 'numeric', 'min:0'],
            'amount_paid' => ['sometimes', 'numeric', 'min:0'],
            'currency' => ['sometimes', 'string', 'max:8'],
            'issued_at' => ['sometimes', 'nullable', 'date'],
            'due_at' => ['sometimes', 'nullable', 'date'],
            'status' => ['sometimes', 'in:draft,issued,partial,paid,overdue,waived,cancelled'],
            'notes' => ['sometimes', 'nullable', 'string'],
            'attachment_url' => ['sometimes', 'nullable', 'string', 'max:500'],
            'attachment_name' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }

    protected function baseQuery(Request $request): \Illuminate\Database\Eloquent\Builder
    {
        $query = Contribution::query()->with(['utility', 'payments']);
        $user = $request->user('api');

        if ($user !== null && $user->role === Roles::UTILITY_USER && ! $user->is_superuser) {
            $org = strtolower(trim((string) $user->organization));
            if ($org !== '') {
                $query->where('organization_name', 'like', '%'.$org.'%');
            } else {
                $query->whereRaw('1 = 0');
            }
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return $query->orderByDesc('id');
    }

    protected function afterStore(Request $request, Model $model): void
    {
        Audit::record($request->user('api'), 'membership.contribution.create', $request->ip(), [
            'id' => $model->id,
            'invoice' => $model->invoice_number,
        ]);
    }

    public function summary(Request $request): JsonResponse
    {
        $rows = $this->baseQuery($request)->get();
        $outstanding = 0.0;

        foreach ($rows as $row) {
            if (! in_array($row->status, ['paid', 'cancelled', 'waived'], true)) {
                $outstanding += (float) $row->balance;
            }
        }

        return response()->json([
            'total' => $rows->count(),
            'issued' => $rows->where('status', 'issued')->count(),
            'paid' => $rows->where('status', 'paid')->count(),
            'overdue' => $rows->where('status', 'overdue')->count(),
            'outstanding_amount' => (string) round($outstanding, 2),
        ]);
    }

    public function recordPayment(Request $request): JsonResponse
    {
        if (! Roles::isFinanceStaff($request->user('api'))) {
            return response()->json(['detail' => 'You do not have permission to perform this action.'], 403);
        }

        $data = $request->validate([
            'contribution' => ['required', 'integer', 'exists:contributions,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'paid_at' => ['required', 'date'],
            'reference' => ['nullable', 'string', 'max:120'],
            'method' => ['nullable', 'string', 'max:64'],
            'notes' => ['nullable', 'string'],
            'receipt_url' => ['nullable', 'string', 'max:500'],
            'receipt_name' => ['nullable', 'string', 'max:255'],
        ]);

        $payment = ContributionPayment::create([
            'contribution_id' => $data['contribution'],
            'submitted_by_id' => $request->user('api')?->id,
            'amount' => $data['amount'],
            'paid_at' => $data['paid_at'],
            'reference' => $data['reference'] ?? '',
            'method' => $data['method'] ?? '',
            'notes' => $data['notes'] ?? '',
            'receipt_url' => $data['receipt_url'] ?? null,
            'receipt_name' => $data['receipt_name'] ?? null,
            'status' => 'approved',
            'reviewed_by_id' => $request->user('api')?->id,
            'reviewed_at' => now(),
        ]);

        $contribution = Contribution::query()->with(['utility', 'payments'])->findOrFail($data['contribution']);
        $this->updateContributionTotals($contribution);

        Audit::record($request->user('api'), 'membership.payment.create', $request->ip(), [
            'contribution_id' => $contribution->id,
            'payment_id' => $payment->id,
            'amount' => (string) $payment->amount,
        ]);

        return response()->json(
            ApiTransforms::contribution($contribution->fresh(['utility', 'payments'])),
            201,
        );
    }

    public function submitPayment(Request $request): JsonResponse
    {
        $user = $request->user('api');
        if ($user === null || ($user->role !== Roles::UTILITY_USER && ! $user->is_superuser)) {
            return response()->json([
                'detail' => 'Only an authorized utility account can submit contribution payments.',
            ], 403);
        }

        $data = $request->validate([
            'contribution' => ['required', 'integer', 'exists:contributions,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'paid_at' => ['required', 'date', 'before_or_equal:today'],
            'reference' => ['required', 'string', 'max:120'],
            'method' => ['required', 'in:bank_transfer,mobile_money,cash,other'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'receipt_url' => ['required', 'string', 'max:500'],
            'receipt_name' => ['required', 'string', 'max:255'],
        ]);

        $payment = DB::transaction(function () use ($data, $user): ContributionPayment {
            $contribution = Contribution::query()->lockForUpdate()->findOrFail($data['contribution']);
            $organization = strtolower(trim((string) $user->organization));
            $contributionOrganization = strtolower(trim((string) $contribution->organization_name));

            if (
                $organization === ''
                || (
                    ! str_contains($contributionOrganization, $organization)
                    && ! str_contains($organization, $contributionOrganization)
                )
            ) {
                abort(403, 'This contribution invoice does not belong to your utility.');
            }

            $committed = (float) ContributionPayment::query()
                ->where('contribution_id', $contribution->id)
                ->whereIn('status', ['pending', 'approved'])
                ->sum('amount');
            $available = max(0, (float) $contribution->amount - $committed);

            if ((float) $data['amount'] > $available + 0.001) {
                abort(422, 'The submitted amount exceeds the outstanding balance.');
            }

            return ContributionPayment::create([
                'contribution_id' => $contribution->id,
                'submitted_by_id' => $user->id,
                'amount' => $data['amount'],
                'paid_at' => $data['paid_at'],
                'reference' => $data['reference'],
                'method' => $data['method'],
                'notes' => $data['notes'] ?? '',
                'receipt_url' => $data['receipt_url'],
                'receipt_name' => $data['receipt_name'],
                'status' => 'pending',
            ]);
        });

        Audit::record($user, 'membership.payment.submit', $request->ip(), [
            'contribution_id' => $payment->contribution_id,
            'payment_id' => $payment->id,
            'amount' => (string) $payment->amount,
        ]);

        $contribution = Contribution::query()
            ->with(['utility', 'payments'])
            ->findOrFail($payment->contribution_id);

        return response()->json(ApiTransforms::contribution($contribution), 201);
    }

    public function reviewPayment(Request $request, ContributionPayment $payment): JsonResponse
    {
        $user = $request->user('api');
        if (! Roles::isFinanceStaff($user)) {
            return response()->json(['detail' => 'Finance staff access is required.'], 403);
        }

        $data = $request->validate([
            'status' => ['required', 'in:approved,rejected'],
            'review_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        if ($payment->status !== 'pending') {
            return response()->json(['detail' => 'This payment submission has already been reviewed.'], 422);
        }

        $contribution = DB::transaction(function () use ($payment, $data, $user): Contribution {
            $payment->status = $data['status'];
            $payment->review_notes = $data['review_notes'] ?? '';
            $payment->reviewed_by_id = $user?->id;
            $payment->reviewed_at = now();
            $payment->save();

            $contribution = Contribution::query()->lockForUpdate()->findOrFail($payment->contribution_id);
            $this->updateContributionTotals($contribution);

            return $contribution;
        });

        Audit::record($user, 'membership.payment.review', $request->ip(), [
            'contribution_id' => $contribution->id,
            'payment_id' => $payment->id,
            'status' => $payment->status,
        ]);

        return response()->json(
            ApiTransforms::contribution($contribution->fresh(['utility', 'payments'])),
        );
    }

    private function updateContributionTotals(Contribution $contribution): void
    {
        $total = ContributionPayment::query()
            ->where('contribution_id', $contribution->id)
            ->where('status', 'approved')
            ->sum('amount');
        $contribution->amount_paid = $total;

        if ((float) $total >= (float) $contribution->amount) {
            $contribution->status = 'paid';
        } elseif ((float) $total > 0) {
            $contribution->status = 'partial';
        } elseif (! in_array($contribution->status, ['draft', 'overdue', 'waived', 'cancelled'], true)) {
            $contribution->status = 'issued';
        }

        $contribution->save();
    }
}

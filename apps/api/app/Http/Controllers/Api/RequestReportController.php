<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccessRequest;
use App\Models\ConsultancyRequest;
use App\Models\ContactMessage;
use App\Models\EventRegistration;
use App\Models\MembershipApplication;
use App\Models\PartnershipInquiry;
use App\Models\ProcurementInterest;
use App\Models\ServiceRequest;
use App\Models\TrainingRegistration;
use App\Support\Roles;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RequestReportController extends Controller
{
    /** @return array<string, array{model: class-string, label: string, open: callable}> */
    private function sources(): array
    {
        return [
            'service-requests' => [
                'model' => ServiceRequest::class,
                'label' => 'Technical support',
                'open' => fn ($q) => $q->where('status', '!=', 'closed'),
            ],
            'contact' => [
                'model' => ContactMessage::class,
                'label' => 'Contact messages',
                'open' => fn ($q) => $q->where('status', '!=', 'closed'),
            ],
            'consultancy-requests' => [
                'model' => ConsultancyRequest::class,
                'label' => 'Consultancy',
                'open' => fn ($q) => $q->where('status', '!=', 'closed'),
            ],
            'membership-applications' => [
                'model' => MembershipApplication::class,
                'label' => 'Membership',
                'open' => fn ($q) => $q->whereIn('status', ['pending', 'under_review']),
            ],
            'partnership-inquiries' => [
                'model' => PartnershipInquiry::class,
                'label' => 'Partnerships',
                'open' => fn ($q) => $q->where('status', '!=', 'closed'),
            ],
            'event-registrations' => [
                'model' => EventRegistration::class,
                'label' => 'Event registrations',
                'open' => fn ($q) => $q->whereIn('status', ['registered', 'waitlisted']),
            ],
            'training-registrations' => [
                'model' => TrainingRegistration::class,
                'label' => 'Training registrations',
                'open' => fn ($q) => $q->whereIn('status', ['registered', 'waitlisted']),
            ],
            'procurement-interests' => [
                'model' => ProcurementInterest::class,
                'label' => 'Procurement interests',
                'open' => fn ($q) => $q->whereIn('status', ['submitted', 'under_review', 'shortlisted']),
            ],
            'access-requests' => [
                'model' => AccessRequest::class,
                'label' => 'Access requests',
                'open' => fn ($q) => $q->where('status', 'pending'),
            ],
        ];
    }

    public function feed(Request $request): JsonResponse
    {
        if (! Roles::isAdminOrManagement($request->user('api'))
            && ! Roles::isAdministrator($request->user('api'))) {
            // Allow any authenticated staff that can see at least one inbox.
            if ($request->user('api') === null) {
                return response()->json(['detail' => 'Authentication required.'], 401);
            }
        }

        $items = [];
        foreach ($this->sources() as $key => $cfg) {
            $model = $cfg['model'];
            $rows = $model::query()
                ->tap($cfg['open'])
                ->orderByDesc('id')
                ->limit(25)
                ->get();

            foreach ($rows as $row) {
                $items[] = [
                    'id' => $row->id,
                    'resource' => $key,
                    'label' => $cfg['label'],
                    'status' => $row->status,
                    'title' => $row->subject
                        ?? $row->title
                        ?? $row->organization_name
                        ?? $row->organization
                        ?? $row->full_name
                        ?? $row->name
                        ?? ('#'.$row->id),
                    'requester' => $row->email
                        ?? $row->contact_name
                        ?? $row->name
                        ?? '',
                    'created_at' => optional($row->created_at)?->toIso8601String(),
                    'href' => $this->hrefFor($key),
                ];
            }
        }

        usort($items, fn ($a, $b) => strcmp((string) ($b['created_at'] ?? ''), (string) ($a['created_at'] ?? '')));

        return response()->json([
            'count' => count($items),
            'results' => array_slice($items, 0, 100),
        ]);
    }

    public function summary(Request $request): JsonResponse
    {
        if ($request->user('api') === null) {
            return response()->json(['detail' => 'Authentication required.'], 401);
        }

        $byType = [];
        $openTotal = 0;
        foreach ($this->sources() as $key => $cfg) {
            $model = $cfg['model'];
            $open = $model::query()->tap($cfg['open'])->count();
            $total = $model::query()->count();
            $byType[] = [
                'resource' => $key,
                'label' => $cfg['label'],
                'open' => $open,
                'total' => $total,
                'href' => $this->hrefFor($key),
            ];
            $openTotal += $open;
        }

        return response()->json([
            'open_total' => $openTotal,
            'by_type' => $byType,
        ]);
    }

    public function export(Request $request, string $resource): StreamedResponse|JsonResponse
    {
        $sources = $this->sources();
        if (! isset($sources[$resource]) && $resource !== 'all') {
            return response()->json(['detail' => 'Not found.'], 404);
        }

        if ($request->user('api') === null) {
            return response()->json(['detail' => 'Authentication required.'], 401);
        }

        $filename = 'owuf-requests-'.($resource === 'all' ? 'all' : $resource).'-'.now()->format('Ymd-His').'.csv';

        return response()->streamDownload(function () use ($resource, $sources): void {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['resource', 'id', 'status', 'title', 'requester', 'organization', 'created_at', 'staff_notes']);

            $targets = $resource === 'all' ? $sources : [$resource => $sources[$resource]];
            foreach ($targets as $key => $cfg) {
                $model = $cfg['model'];
                $query = $model::query()->orderByDesc('id');
                if ($status = request()->query('status')) {
                    $query->where('status', $status);
                }
                $query->chunk(200, function ($rows) use ($out, $key): void {
                    foreach ($rows as $row) {
                        fputcsv($out, [
                            $key,
                            $row->id,
                            $row->status,
                            $row->subject
                                ?? $row->title
                                ?? $row->organization_name
                                ?? $row->organization
                                ?? $row->full_name
                                ?? $row->name
                                ?? '',
                            $row->email ?? '',
                            $row->organization
                                ?? $row->organization_name
                                ?? '',
                            optional($row->created_at)?->toDateTimeString(),
                            $row->staff_notes ?? '',
                        ]);
                    }
                });
            }
            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function hrefFor(string $resource): string
    {
        return match ($resource) {
            'service-requests' => '/app/service-requests',
            'contact' => '/app/messages',
            'consultancy-requests' => '/app/consultancy',
            'membership-applications' => '/app/membership',
            'partnership-inquiries' => '/app/partnerships',
            'event-registrations' => '/app/event-registrations',
            'training-registrations' => '/app/training',
            'procurement-interests' => '/app/procurement',
            'access-requests' => '/app/access',
            default => '/app/dashboard',
        };
    }
}

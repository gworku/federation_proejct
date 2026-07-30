<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Concerns\HandlesCrud;
use App\Models\UtilityKpi;
use App\Support\ApiTransforms;
use App\Support\Audit;
use App\Support\Roles;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class UtilityKpiController extends Controller
{
    use HandlesCrud;

    public function __construct()
    {
        $this->modelClass = UtilityKpi::class;
        $this->lookupField = 'id';
        $this->fillable = [
            'utility_id', 'period_label', 'period_start', 'period_end',
            'water_production_m3', 'nrw_percent', 'meter_coverage_percent',
            'billing_efficiency_percent', 'collection_efficiency_percent',
            'service_coverage_percent', 'water_quality_compliance_percent',
            'customer_complaints', 'notes', 'status',
        ];
        $this->inputAliases = ['utility' => 'utility_id'];
        $this->transform = fn (UtilityKpi $row) => ApiTransforms::utilityKpi($row);
        $this->staffWriteCheck = function ($user, $method) {
            if (in_array(strtoupper((string) $method), ['DELETE'], true)) {
                return Roles::isAdminOrManagement($user);
            }

            return Roles::roleOk($user, [
                Roles::ADMINISTRATOR,
                Roles::MANAGEMENT,
                Roles::PROJECT_OFFICER,
                Roles::UTILITY_USER,
            ]);
        };
    }

    protected function storeRules(Request $request): array
    {
        return [
            'utility_id' => ['required', 'integer', 'exists:utilities,id'],
            'period_label' => ['required', 'string', 'max:64'],
            'period_start' => ['required', 'date'],
            'period_end' => ['required', 'date'],
            'water_production_m3' => ['nullable', 'numeric'],
            'nrw_percent' => ['nullable', 'numeric'],
            'meter_coverage_percent' => ['nullable', 'numeric'],
            'billing_efficiency_percent' => ['nullable', 'numeric'],
            'collection_efficiency_percent' => ['nullable', 'numeric'],
            'service_coverage_percent' => ['nullable', 'numeric'],
            'water_quality_compliance_percent' => ['nullable', 'numeric'],
            'customer_complaints' => ['nullable', 'integer', 'min:0'],
            'notes' => ['nullable', 'string'],
            'status' => ['nullable', 'in:draft,submitted,approved,rejected'],
        ];
    }

    protected function baseQuery(Request $request): \Illuminate\Database\Eloquent\Builder
    {
        $query = UtilityKpi::query()->with('utility');
        $user = $request->user('api');

        if ($user !== null && $user->role === Roles::UTILITY_USER && ! $user->is_superuser) {
            $org = strtolower(trim((string) $user->organization));
            if ($org !== '') {
                $query->whereHas('utility', fn ($q) => $q->where('name', 'like', '%'.$org.'%'));
            } else {
                $query->whereRaw('1 = 0');
            }
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return $query->orderByDesc('period_end');
    }

    protected function afterStore(Request $request, Model $model): void
    {
        $model->submitted_by_id = $request->user('api')?->id;
        $model->save();
        Audit::record($request->user('api'), 'benchmarking.kpi.create', $request->ip(), [
            'id' => $model->id,
            'utility' => $model->utility_id,
        ]);
    }
}

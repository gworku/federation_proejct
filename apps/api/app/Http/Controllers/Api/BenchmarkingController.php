<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UtilityKpi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BenchmarkingController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $query = UtilityKpi::query()
            ->with('utility')
            ->where('status', 'approved');

        if ($period = $request->query('period')) {
            $query->where('period_label', $period);
        }

        $rows = $query->orderByDesc('period_end')->get();
        $latestByUtility = [];

        foreach ($rows as $row) {
            if (! isset($latestByUtility[$row->utility_id])) {
                $latestByUtility[$row->utility_id] = $row;
            }
        }

        $data = collect($latestByUtility)->map(fn (UtilityKpi $row) => [
            'utility' => $row->utility?->name ?? '',
            'zone' => $row->utility?->zone ?? '',
            'period_label' => $row->period_label,
            'nrw_percent' => $row->nrw_percent !== null ? (string) $row->nrw_percent : null,
            'billing_efficiency_percent' => $row->billing_efficiency_percent !== null ? (string) $row->billing_efficiency_percent : null,
            'collection_efficiency_percent' => $row->collection_efficiency_percent !== null ? (string) $row->collection_efficiency_percent : null,
            'service_coverage_percent' => $row->service_coverage_percent !== null ? (string) $row->service_coverage_percent : null,
            'meter_coverage_percent' => $row->meter_coverage_percent !== null ? (string) $row->meter_coverage_percent : null,
        ])->values();

        return response()->json([
            'results' => $data,
            'count' => $data->count(),
        ]);
    }
}

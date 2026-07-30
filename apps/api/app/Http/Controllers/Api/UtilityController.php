<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Concerns\HandlesCrud;
use App\Models\Utility;
use App\Support\ApiTransforms;
use App\Support\Roles;
use App\Support\ZoneCoordinates;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UtilityController extends Controller
{
    use HandlesCrud;

    protected function pageSize(Request $request): int
    {
        return max(1, min(500, (int) $request->query('page_size', 50)));
    }

    public function __construct()
    {
        $this->modelClass = Utility::class;
        $this->lookupField = 'slug';
        $this->fillable = [
            'name', 'slug', 'zone', 'city', 'grade', 'status', 'membership_status',
            'customers', 'population_served', 'service_type', 'water_sources',
            'website', 'contact_email', 'contact_phone', 'is_public',
        ];
        $this->searchFields = ['name'];
        $this->defaultOrderBy = 'name';
        $this->defaultOrderDirection = 'asc';
        $this->transform = fn (Utility $row) => ApiTransforms::utility($row);
        $this->publicScope = function ($query): void {
            $query->where('is_public', true);
        };
        $this->staffWriteCheck = fn ($user, $method) => Roles::isProjectStaff($user, $method);
    }

    protected function baseQuery(Request $request): \Illuminate\Database\Eloquent\Builder
    {
        /** @var \Illuminate\Database\Eloquent\Builder $query */
        $query = Utility::query();
        $user = $request->user('api');

        if ($user === null) {
            $query->where('is_public', true);
        }

        if ($term = trim((string) $request->query('search', $request->query('q', '')))) {
            $query->where('name', 'like', '%'.$term.'%');
        }

        if ($zone = $request->query('zone')) {
            $query->whereRaw('LOWER(zone) = ?', [strtolower((string) $zone)]);
        }
        if ($status = $request->query('status')) {
            $query->whereRaw('LOWER(status) = ?', [strtolower((string) $status)]);
        }
        if ($grade = $request->query('grade')) {
            $query->whereRaw('LOWER(grade) = ?', [strtolower((string) $grade)]);
        }

        return $query->orderBy('name');
    }

    protected function storeRules(Request $request): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:utilities,slug'],
            'zone' => ['required', 'string', 'max:120'],
            'city' => ['nullable', 'string', 'max:120'],
            'grade' => ['required', 'string', 'max:32'],
            'status' => ['nullable', 'string', 'max:32'],
            'membership_status' => ['nullable', 'string', 'max:32'],
            'customers' => ['nullable', 'integer', 'min:0'],
            'population_served' => ['nullable', 'integer', 'min:0'],
            'service_type' => ['nullable', 'string', 'max:120'],
            'water_sources' => ['nullable', 'string'],
            'website' => ['nullable', 'url', 'max:255'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:64'],
            'is_public' => ['nullable', 'boolean'],
        ];
    }

    protected function updateRules(Request $request, Model $model): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', 'unique:utilities,slug,'.$model->id],
            'zone' => ['sometimes', 'string', 'max:120'],
            'city' => ['sometimes', 'nullable', 'string', 'max:120'],
            'grade' => ['sometimes', 'string', 'max:32'],
            'status' => ['sometimes', 'string', 'max:32'],
            'membership_status' => ['sometimes', 'string', 'max:32'],
            'customers' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'population_served' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'service_type' => ['sometimes', 'nullable', 'string', 'max:120'],
            'water_sources' => ['sometimes', 'nullable', 'string'],
            'website' => ['sometimes', 'nullable', 'url', 'max:255'],
            'contact_email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'contact_phone' => ['sometimes', 'nullable', 'string', 'max:64'],
            'is_public' => ['sometimes', 'boolean'],
        ];
    }

    public function coverage(Request $request): JsonResponse
    {
        $query = Utility::query();
        if ($request->user('api') === null) {
            $query->where('is_public', true);
        }

        $count = (clone $query)->count();
        $activeCount = (clone $query)->where('status', 'Active')->count();
        $memberCount = (clone $query)->where('membership_status', 'Member')->count();

        $rows = (clone $query)
            ->selectRaw('zone')
            ->selectRaw('COUNT(*) as total')
            ->selectRaw("SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active")
            ->selectRaw("SUM(CASE WHEN status = 'Digitizing' THEN 1 ELSE 0 END) as digitizing")
            ->selectRaw("SUM(CASE WHEN status = 'Support Needed' THEN 1 ELSE 0 END) as support_needed")
            ->groupBy('zone')
            ->orderBy('zone')
            ->get();

        $zones = $rows->map(function ($row) {
            $coords = ZoneCoordinates::forZone((string) $row->zone);

            return [
                'zone' => $row->zone,
                'total' => (int) $row->total,
                'active' => (int) $row->active,
                'digitizing' => (int) $row->digitizing,
                'support_needed' => (int) $row->support_needed,
                'lat' => $coords['lat'],
                'lng' => $coords['lng'],
            ];
        })->values();

        $grades = (clone $query)
            ->selectRaw('grade')
            ->selectRaw('COUNT(*) as total')
            ->groupBy('grade')
            ->get()
            ->map(fn ($row) => [
                'grade' => (string) $row->grade,
                'total' => (int) $row->total,
            ])
            ->sortBy(function (array $row): int {
                return match ($row['grade']) {
                    'Special Level One' => 1,
                    'Level One' => 2,
                    'Level Two' => 3,
                    'Level Three' => 4,
                    'Level Four' => 5,
                    'Level Five' => 6,
                    default => 99,
                };
            })
            ->values();

        return response()->json([
            'count' => $count,
            'active_count' => $activeCount,
            'member_count' => $memberCount,
            'zone_count' => $zones->count(),
            'grades' => $grades,
            'zones' => $zones,
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Concerns\HandlesCrud;
use App\Models\IndicatorResult;
use App\Support\ApiTransforms;
use App\Support\Audit;
use App\Support\Roles;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class IndicatorResultController extends Controller
{
    use HandlesCrud;

    public function __construct()
    {
        $this->modelClass = IndicatorResult::class;
        $this->lookupField = 'id';
        $this->fillable = [
            'indicator_id', 'period_label', 'period_start', 'period_end',
            'actual_value', 'variance_notes', 'evidence_url', 'status',
        ];
        $this->inputAliases = ['indicator' => 'indicator_id'];
        $this->transform = fn (IndicatorResult $row) => ApiTransforms::indicatorResult($row);
        $this->staffWriteCheck = fn ($user, $method) => Roles::isProjectStaff($user, $method);
    }

    protected function storeRules(Request $request): array
    {
        return [
            'indicator_id' => ['required', 'integer', 'exists:indicators,id'],
            'period_label' => ['required', 'string', 'max:64'],
            'period_start' => ['required', 'date'],
            'period_end' => ['required', 'date'],
            'actual_value' => ['required', 'numeric'],
            'variance_notes' => ['nullable', 'string'],
            'evidence_url' => ['nullable', 'string', 'max:500'],
            'status' => ['nullable', 'in:draft,submitted,approved,rejected'],
        ];
    }

    protected function updateRules(Request $request, \Illuminate\Database\Eloquent\Model $model): array
    {
        return [
            'indicator_id' => ['sometimes', 'integer', 'exists:indicators,id'],
            'period_label' => ['sometimes', 'string', 'max:64'],
            'period_start' => ['sometimes', 'date'],
            'period_end' => ['sometimes', 'date'],
            'actual_value' => ['sometimes', 'numeric'],
            'variance_notes' => ['nullable', 'string'],
            'evidence_url' => ['nullable', 'string', 'max:500'],
            'status' => ['sometimes', 'in:draft,submitted,approved,rejected'],
        ];
    }

    protected function baseQuery(Request $request): \Illuminate\Database\Eloquent\Builder
    {
        return IndicatorResult::query()->with('indicator')->orderByDesc('id');
    }

    protected function afterStore(Request $request, Model $model): void
    {
        $model->submitted_by_id = $request->user('api')?->id;
        $model->save();
        Audit::record($request->user('api'), 'me.indicator_result.create', $request->ip(), [
            'id' => $model->id,
            'indicator' => $model->indicator_id,
        ]);
    }
}

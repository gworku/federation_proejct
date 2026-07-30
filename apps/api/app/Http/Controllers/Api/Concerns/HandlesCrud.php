<?php

namespace App\Http\Controllers\Api\Concerns;

use App\Support\DrfPaginator;
use App\Support\Roles;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

trait HandlesCrud
{
    /** @var class-string<Model> */
    protected string $modelClass;

    protected string $lookupField = 'id';

    /** @var array<int, string> */
    protected array $fillable = [];

    /** @var callable|null */
    protected $publicScope = null;

    /** @var callable|null */
    protected $staffWriteCheck = null;

    /** @var callable */
    protected $transform;

    /** @var array<int, string> */
    protected array $searchFields = [];

    protected string $defaultOrderBy = 'id';

    protected string $defaultOrderDirection = 'desc';

    /** @var array<string, string> frontend alias => fillable column */
    protected array $inputAliases = [];

    protected function pageSize(Request $request): int
    {
        $size = (int) $request->query('page_size', 20);

        return max(1, min(200, $size));
    }

    /** @return array<string, mixed> */
    protected function inputData(Request $request): array
    {
        $data = $request->all();
        foreach ($this->inputAliases as $alias => $column) {
            if (array_key_exists($alias, $data) && ! array_key_exists($column, $data)) {
                $data[$column] = $data[$alias];
            }
        }

        return collect($data)->only($this->fillable)->all();
    }

    protected function baseQuery(Request $request): Builder
    {
        /** @var Builder $query */
        $query = ($this->modelClass)::query();
        $user = $request->user('api');

        if ($user === null && $this->publicScope !== null) {
            ($this->publicScope)($query, $request);
        }

        if ($this->searchFields !== []) {
            $term = trim((string) $request->query('search', $request->query('q', '')));
            if ($term !== '') {
                $query->where(function (Builder $inner) use ($term): void {
                    foreach ($this->searchFields as $index => $field) {
                        if ($index === 0) {
                            $inner->where($field, 'like', '%'.$term.'%');
                        } else {
                            $inner->orWhere($field, 'like', '%'.$term.'%');
                        }
                    }
                });
            }
        }

        return $query->orderBy($this->defaultOrderBy, $this->defaultOrderDirection);
    }

    protected function canWrite(Request $request): bool
    {
        if ($this->staffWriteCheck !== null) {
            return (bool) ($this->staffWriteCheck)($request->user('api'), $request->method());
        }

        return Roles::isAdminOrManagement($request->user('api'));
    }

    protected function denyWrite(): JsonResponse
    {
        return response()->json([
            'detail' => 'You do not have permission to perform this action.',
        ], 403);
    }

    protected function notFound(): JsonResponse
    {
        return response()->json(['detail' => 'Not found.'], 404);
    }

    protected function findModel(Request $request, string $value): ?Model
    {
        $query = $this->baseQuery($request);

        return $query->where($this->lookupField, $value)->first();
    }

    protected function serialize(Model $model): array
    {
        return ($this->transform)($model);
    }

    public function index(Request $request): JsonResponse
    {
        return $this->crudIndex($request);
    }

    public function store(Request $request): JsonResponse
    {
        return $this->crudStore($request);
    }

    public function show(Request $request, string $value): JsonResponse
    {
        return $this->crudShow($request, $value);
    }

    public function update(Request $request, string $value): JsonResponse
    {
        return $this->crudUpdate($request, $value);
    }

    public function destroy(Request $request, string $value): JsonResponse
    {
        return $this->crudDestroy($request, $value);
    }

    protected function crudIndex(Request $request): JsonResponse
    {
        $paginator = $this->baseQuery($request)->paginate($this->pageSize($request));
        $paginator->getCollection()->transform(fn (Model $row) => $this->serialize($row));

        return response()->json(DrfPaginator::paginate($paginator, $request));
    }

    protected function crudStore(Request $request): JsonResponse
    {
        if (! $this->canWrite($request)) {
            return $this->denyWrite();
        }

        $data = $this->inputData($request);
        $validator = Validator::make($data, $this->storeRules($request));
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        /** @var Model $model */
        $model = ($this->modelClass)::create($validator->validated());
        $this->afterStore($request, $model->fresh() ?? $model);

        return response()->json($this->serialize($model->fresh() ?? $model), 201);
    }

    protected function crudShow(Request $request, string $value): JsonResponse
    {
        $model = $this->findModel($request, $value);
        if ($model === null) {
            return $this->notFound();
        }

        return response()->json($this->serialize($model));
    }

    protected function crudUpdate(Request $request, string $value): JsonResponse
    {
        if (! $this->canWrite($request)) {
            return $this->denyWrite();
        }

        $model = ($this->modelClass)::query()->where($this->lookupField, $value)->first();
        if ($model === null) {
            return $this->notFound();
        }

        $data = $this->inputData($request);
        $validator = Validator::make($data, $this->updateRules($request, $model));
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $model->fill($validator->validated());
        $model->save();
        $this->afterUpdate($request, $model);

        return response()->json($this->serialize($model->fresh() ?? $model));
    }

    protected function crudDestroy(Request $request, string $value): JsonResponse
    {
        if (! $this->canWrite($request)) {
            return $this->denyWrite();
        }

        $model = ($this->modelClass)::query()->where($this->lookupField, $value)->first();
        if ($model === null) {
            return $this->notFound();
        }

        $model->delete();
        $this->afterDestroy($request, $model);

        return response()->json(null, 204);
    }

    /** @return array<string, mixed> */
    protected function storeRules(Request $request): array
    {
        return [];
    }

    /** @return array<string, mixed> */
    protected function updateRules(Request $request, Model $model): array
    {
        return [];
    }

    protected function afterStore(Request $request, Model $model): void {}

    protected function afterUpdate(Request $request, Model $model): void {}

    protected function afterDestroy(Request $request, Model $model): void {}
}

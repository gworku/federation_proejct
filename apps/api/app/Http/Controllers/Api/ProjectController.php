<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Concerns\HandlesCrud;
use App\Models\Project;
use App\Support\ApiTransforms;
use App\Support\Audit;
use App\Support\Roles;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    use HandlesCrud;

    public function __construct()
    {
        $this->modelClass = Project::class;
        $this->lookupField = 'slug';
        $this->fillable = [
            'title', 'slug', 'location', 'category', 'status', 'progress', 'description',
            'objectives', 'funding_partner', 'implementing_partners', 'start_date',
            'end_date', 'budget_visible', 'contact_person', 'is_public',
        ];
        $this->searchFields = ['title', 'location', 'category', 'description'];
        $this->defaultOrderBy = 'title';
        $this->defaultOrderDirection = 'asc';
        $this->transform = fn (Project $row) => ApiTransforms::project($row, false);
        $this->publicScope = function ($query): void {
            $query->where('is_public', true);
        };
        $this->staffWriteCheck = fn ($user, $method) => Roles::isProjectStaff($user, $method);
    }

    public function show(Request $request, string $value): JsonResponse
    {
        $model = $this->findModel($request, $value);
        if ($model === null) {
            return $this->notFound();
        }

        /** @var Project $model */
        $model->load('milestones');

        return response()->json(ApiTransforms::project($model, true));
    }

    protected function afterStore(Request $request, Model $model): void
    {
        Audit::record($request->user('api'), 'project.create', $request->ip(), [
            'slug' => $model->slug,
        ]);
    }

    protected function afterUpdate(Request $request, Model $model): void
    {
        Audit::record($request->user('api'), 'project.update', $request->ip(), [
            'slug' => $model->slug,
            'status' => $model->status,
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Concerns\HandlesCrud;
use App\Models\Risk;
use App\Support\ApiTransforms;
use App\Support\Roles;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RiskController extends Controller
{
    use HandlesCrud;

    public function __construct()
    {
        $this->modelClass = Risk::class;
        $this->lookupField = 'id';
        $this->fillable = [
            'title', 'category', 'description', 'probability', 'impact',
            'mitigation', 'residual_risk', 'owner', 'due_date', 'review_status',
        ];
        $this->transform = fn (Risk $row) => ApiTransforms::risk($row);
        $this->staffWriteCheck = fn ($user) => Roles::isAdminOrManagement($user);
    }

    protected function storeRules(Request $request): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:32'],
            'description' => ['required', 'string'],
            'probability' => ['required', 'integer', 'min:1', 'max:5'],
            'impact' => ['required', 'integer', 'min:1', 'max:5'],
            'mitigation' => ['nullable', 'string'],
            'residual_risk' => ['nullable', 'string', 'max:255'],
            'owner' => ['nullable', 'string', 'max:255'],
            'due_date' => ['nullable', 'date'],
            'review_status' => ['nullable', 'in:open,monitoring,mitigated,closed'],
        ];
    }

    public function index(Request $request): JsonResponse
    {
        if (! Roles::isAuditorOrAdmin($request->user('api'))) {
            return response()->json(['detail' => 'You do not have permission to perform this action.'], 403);
        }

        return $this->crudIndex($request);
    }

    public function show(Request $request, string $value): JsonResponse
    {
        if (! Roles::isAuditorOrAdmin($request->user('api'))) {
            return response()->json(['detail' => 'You do not have permission to perform this action.'], 403);
        }

        return $this->crudShow($request, $value);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Concerns\HandlesCrud;
use App\Models\StrategicKra;
use App\Support\ApiTransforms;
use App\Support\Roles;
use Illuminate\Http\Request;

class StrategicKraController extends Controller
{
    use HandlesCrud;

    public function __construct()
    {
        $this->modelClass = StrategicKra::class;
        $this->lookupField = 'id';
        $this->fillable = ['code', 'title', 'objective', 'sort_order', 'is_active'];
        $this->defaultOrderBy = 'sort_order';
        $this->defaultOrderDirection = 'asc';
        $this->transform = fn (StrategicKra $row) => ApiTransforms::strategicKra($row);
        $this->staffWriteCheck = fn ($user) => Roles::isAdminOrManagement($user);
    }

    protected function baseQuery(Request $request): \Illuminate\Database\Eloquent\Builder
    {
        return StrategicKra::query()
            ->with('indicators')
            ->orderBy($this->defaultOrderBy, $this->defaultOrderDirection);
    }
}

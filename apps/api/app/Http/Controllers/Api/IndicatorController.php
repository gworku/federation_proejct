<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Concerns\HandlesCrud;
use App\Models\Indicator;
use App\Support\ApiTransforms;
use App\Support\Roles;
use Illuminate\Http\Request;

class IndicatorController extends Controller
{
    use HandlesCrud;

    public function __construct()
    {
        $this->modelClass = Indicator::class;
        $this->lookupField = 'id';
        $this->fillable = [
            'kra_id', 'code', 'title', 'description', 'unit', 'baseline',
            'annual_target', 'frequency', 'responsible_officer', 'is_active',
        ];
        $this->transform = fn (Indicator $row) => ApiTransforms::indicator($row);
        $this->staffWriteCheck = fn ($user) => Roles::isAdminOrManagement($user);
    }

    protected function baseQuery(Request $request): \Illuminate\Database\Eloquent\Builder
    {
        return Indicator::query()->with('kra')->orderBy('code');
    }
}

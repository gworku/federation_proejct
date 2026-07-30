<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StrategicKra extends Model
{
    public $timestamps = false;

    protected $table = 'strategic_kras';

    protected $fillable = [
        'code',
        'title',
        'objective',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function indicators(): HasMany
    {
        return $this->hasMany(Indicator::class, 'kra_id');
    }
}

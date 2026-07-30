<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Indicator extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'kra_id',
        'code',
        'title',
        'description',
        'unit',
        'baseline',
        'annual_target',
        'frequency',
        'responsible_officer',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'baseline' => 'decimal:2',
            'annual_target' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function kra(): BelongsTo
    {
        return $this->belongsTo(StrategicKra::class, 'kra_id');
    }

    public function results(): HasMany
    {
        return $this->hasMany(IndicatorResult::class);
    }
}

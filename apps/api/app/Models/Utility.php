<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Utility extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'zone',
        'city',
        'grade',
        'status',
        'membership_status',
        'customers',
        'population_served',
        'service_type',
        'water_sources',
        'website',
        'contact_email',
        'contact_phone',
        'is_public',
    ];

    protected function casts(): array
    {
        return [
            'customers' => 'integer',
            'population_served' => 'integer',
            'is_public' => 'boolean',
        ];
    }

    public function kpiReports(): HasMany
    {
        return $this->hasMany(UtilityKpi::class);
    }

    public function contributions(): HasMany
    {
        return $this->hasMany(Contribution::class);
    }
}

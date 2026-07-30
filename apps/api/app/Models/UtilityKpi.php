<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UtilityKpi extends Model
{
    protected $table = 'utility_kpis';

    protected $fillable = [
        'utility_id',
        'period_label',
        'period_start',
        'period_end',
        'water_production_m3',
        'nrw_percent',
        'meter_coverage_percent',
        'billing_efficiency_percent',
        'collection_efficiency_percent',
        'service_coverage_percent',
        'water_quality_compliance_percent',
        'customer_complaints',
        'notes',
        'status',
        'submitted_by_id',
    ];

    protected function casts(): array
    {
        return [
            'period_start' => 'date',
            'period_end' => 'date',
            'water_production_m3' => 'decimal:2',
            'nrw_percent' => 'decimal:2',
            'meter_coverage_percent' => 'decimal:2',
            'billing_efficiency_percent' => 'decimal:2',
            'collection_efficiency_percent' => 'decimal:2',
            'service_coverage_percent' => 'decimal:2',
            'water_quality_compliance_percent' => 'decimal:2',
            'customer_complaints' => 'integer',
        ];
    }

    public function utility(): BelongsTo
    {
        return $this->belongsTo(Utility::class);
    }

    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by_id');
    }
}

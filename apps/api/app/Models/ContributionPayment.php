<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContributionPayment extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'contribution_id',
        'submitted_by_id',
        'amount',
        'paid_at',
        'reference',
        'method',
        'notes',
        'receipt_url',
        'receipt_name',
        'status',
        'reviewed_by_id',
        'reviewed_at',
        'review_notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'paid_at' => 'date',
            'reviewed_at' => 'datetime',
        ];
    }

    public function contribution(): BelongsTo
    {
        return $this->belongsTo(Contribution::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Contribution extends Model
{
    protected $fillable = [
        'utility_id',
        'organization_name',
        'invoice_number',
        'period_label',
        'amount',
        'amount_paid',
        'currency',
        'issued_at',
        'due_at',
        'status',
        'notes',
        'attachment_url',
        'attachment_name',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'amount_paid' => 'decimal:2',
            'issued_at' => 'date',
            'due_at' => 'date',
        ];
    }

    public function utility(): BelongsTo
    {
        return $this->belongsTo(Utility::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(ContributionPayment::class);
    }

    public function getBalanceAttribute(): string
    {
        return (string) ((float) $this->amount - (float) $this->amount_paid);
    }
}

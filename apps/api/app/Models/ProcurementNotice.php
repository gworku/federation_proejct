<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProcurementNotice extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'category',
        'summary',
        'reference_code',
        'closing_at',
        'document_url',
        'status',
        'is_public',
    ];

    protected function casts(): array
    {
        return [
            'closing_at' => 'datetime',
            'is_public' => 'boolean',
        ];
    }

    public function interests(): HasMany
    {
        return $this->hasMany(ProcurementInterest::class, 'notice_id');
    }
}

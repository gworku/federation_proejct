<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Risk extends Model
{
    protected $fillable = [
        'title',
        'category',
        'description',
        'probability',
        'impact',
        'mitigation',
        'residual_risk',
        'owner',
        'due_date',
        'review_status',
    ];

    protected function casts(): array
    {
        return [
            'probability' => 'integer',
            'impact' => 'integer',
            'due_date' => 'date',
        ];
    }

    public function getRatingAttribute(): int
    {
        return (int) $this->probability * (int) $this->impact;
    }
}

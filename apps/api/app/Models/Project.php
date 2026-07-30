<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'location',
        'category',
        'status',
        'progress',
        'description',
        'objectives',
        'funding_partner',
        'implementing_partners',
        'start_date',
        'end_date',
        'budget_visible',
        'contact_person',
        'is_public',
    ];

    protected function casts(): array
    {
        return [
            'progress' => 'integer',
            'start_date' => 'date',
            'end_date' => 'date',
            'budget_visible' => 'boolean',
            'is_public' => 'boolean',
        ];
    }

    public function milestones(): HasMany
    {
        return $this->hasMany(ProjectMilestone::class);
    }
}

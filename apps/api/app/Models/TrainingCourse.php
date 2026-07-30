<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TrainingCourse extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'summary',
        'topic',
        'venue',
        'is_online',
        'meeting_url',
        'starts_at',
        'ends_at',
        'registration_deadline',
        'capacity',
        'facilitator',
        'status',
        'is_public',
    ];

    protected function casts(): array
    {
        return [
            'is_online' => 'boolean',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'registration_deadline' => 'datetime',
            'capacity' => 'integer',
            'is_public' => 'boolean',
        ];
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(TrainingRegistration::class, 'course_id');
    }
}

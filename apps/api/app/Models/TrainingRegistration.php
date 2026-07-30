<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingRegistration extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'course_id',
        'name',
        'email',
        'organization',
        'phone',
        'status',
        'staff_notes',
        'processed_at',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(TrainingCourse::class, 'course_id');
    }
}

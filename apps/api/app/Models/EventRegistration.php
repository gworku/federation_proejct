<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventRegistration extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'event_id',
        'name',
        'email',
        'organization',
        'phone',
        'status',
        'staff_notes',
        'processed_at',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}

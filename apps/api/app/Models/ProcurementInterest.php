<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProcurementInterest extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'notice_id',
        'organization',
        'contact_name',
        'email',
        'phone',
        'message',
        'status',
        'staff_notes',
        'processed_at',
    ];

    public function notice(): BelongsTo
    {
        return $this->belongsTo(ProcurementNotice::class, 'notice_id');
    }
}

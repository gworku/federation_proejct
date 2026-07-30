<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccessRequest extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'full_name',
        'email',
        'organization',
        'role_requested',
        'justification',
        'status',
        'staff_notes',
        'processed_at',
    ];
}

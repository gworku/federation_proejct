<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceRequest extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'name',
        'email',
        'organization',
        'category',
        'subject',
        'description',
        'status',
        'staff_notes',
        'processed_at',
    ];
}

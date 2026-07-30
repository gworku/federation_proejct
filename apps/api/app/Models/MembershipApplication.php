<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MembershipApplication extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'organization_name',
        'contact_name',
        'email',
        'phone',
        'zone',
        'city',
        'category',
        'justification',
        'status',
        'staff_notes',
        'processed_at',
    ];
}

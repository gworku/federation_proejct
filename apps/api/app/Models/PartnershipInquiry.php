<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PartnershipInquiry extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'organization',
        'contact_name',
        'email',
        'partnership_interest',
        'message',
        'status',
        'staff_notes',
        'processed_at',
    ];
}

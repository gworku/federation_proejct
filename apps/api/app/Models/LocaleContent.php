<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LocaleContent extends Model
{
    public const CREATED_AT = null;

    protected $fillable = [
        'key',
        'locale',
        'title',
        'body',
        'is_approved',
    ];

    protected function casts(): array
    {
        return [
            'is_approved' => 'boolean',
            'updated_at' => 'datetime',
        ];
    }
}

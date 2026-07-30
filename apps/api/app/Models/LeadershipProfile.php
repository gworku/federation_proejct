<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeadershipProfile extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'name',
        'role',
        'bio',
        'photo_url',
        'sort_order',
        'is_public',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_public' => 'boolean',
        ];
    }
}

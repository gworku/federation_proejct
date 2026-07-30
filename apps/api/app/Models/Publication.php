<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Publication extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'category',
        'description',
        'file_type',
        'file_size',
        'file_url',
        'published_at',
        'status',
        'is_public',
    ];

    protected function casts(): array
    {
        return [
            'published_at' => 'date',
            'is_public' => 'boolean',
        ];
    }
}

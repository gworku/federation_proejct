<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteStatistic extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'key',
        'label',
        'value',
        'suffix',
        'sort_order',
        'is_public',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'integer',
            'sort_order' => 'integer',
            'is_public' => 'boolean',
        ];
    }
}

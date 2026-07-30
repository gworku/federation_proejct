<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KnowledgeDocument extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'document_type',
        'topic',
        'year',
        'language',
        'author',
        'summary',
        'file_url',
        'file_type',
        'version',
        'download_count',
        'access_level',
        'status',
        'is_public',
    ];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'download_count' => 'integer',
            'is_public' => 'boolean',
        ];
    }
}

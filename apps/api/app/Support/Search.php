<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class Search
{
    /**
     * @param  array<int, string>  $fields
     */
    public static function apply(Builder $query, Request $request, array $fields): Builder
    {
        $term = trim((string) $request->query('search', $request->query('q', '')));

        if ($term === '' || $fields === []) {
            return $query;
        }

        return $query->where(function (Builder $inner) use ($fields, $term): void {
            foreach ($fields as $index => $field) {
                if ($index === 0) {
                    $inner->where($field, 'like', '%'.$term.'%');
                } else {
                    $inner->orWhere($field, 'like', '%'.$term.'%');
                }
            }
        });
    }
}

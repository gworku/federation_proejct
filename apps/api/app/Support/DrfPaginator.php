<?php

namespace App\Support;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;

class DrfPaginator
{
    public static function paginate(LengthAwarePaginator $paginator, ?Request $request = null): array
    {
        $request ??= request();

        return [
            'count' => $paginator->total(),
            'next' => self::pageUrl($paginator, $request, $paginator->currentPage() + 1),
            'previous' => self::pageUrl($paginator, $request, $paginator->currentPage() - 1),
            'results' => $paginator->items(),
        ];
    }

    private static function pageUrl(LengthAwarePaginator $paginator, Request $request, int $page): ?string
    {
        if ($page < 1 || $page > $paginator->lastPage()) {
            return null;
        }

        $query = array_merge($request->query(), ['page' => $page]);

        if ($request->has('page_size')) {
            $query['page_size'] = $request->query('page_size');
        }

        $baseUrl = $request->url();

        return $baseUrl.(empty($query) ? '' : '?'.http_build_query($query));
    }
}

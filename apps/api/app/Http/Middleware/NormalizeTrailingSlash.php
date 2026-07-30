<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class NormalizeTrailingSlash
{
    public function handle(Request $request, Closure $next): Response
    {
        $pathInfo = $request->getPathInfo();

        if ($pathInfo !== '/' && str_ends_with($pathInfo, '/')) {
            $normalizedPath = rtrim($pathInfo, '/');
            $queryString = $request->server->get('QUERY_STRING');

            $request->server->set('PATH_INFO', $normalizedPath);
            $request->server->set(
                'REQUEST_URI',
                $normalizedPath.($queryString ? '?'.$queryString : '')
            );
        }

        return $next($request);
    }
}

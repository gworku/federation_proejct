<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PublicApiCache
{
    private const SKIP_PREFIXES = [
        '/api/auth/',
        '/api/audit/',
        '/api/backups/',
        '/api/dashboard/',
        '/api/ops/',
        '/api/membership/',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        $apiPath = '/'.$request->path();

        if (! in_array($request->method(), ['GET', 'HEAD'], true)) {
            return $response;
        }

        if (! str_starts_with($apiPath, '/api/') && $apiPath !== '/api') {
            return $response;
        }

        if ($response->getStatusCode() !== 200) {
            return $response;
        }

        foreach (self::SKIP_PREFIXES as $prefix) {
            if (str_starts_with($apiPath.'/', $prefix) || str_starts_with($apiPath, rtrim($prefix, '/'))) {
                return $response;
            }
        }

        if (str_contains($apiPath, '/manage')) {
            return $response;
        }

        if (str_starts_with($apiPath, '/api/health')) {
            $response->headers->set('Cache-Control', 'no-store');

            return $response;
        }

        $user = $request->user('api') ?? $request->user();

        if ($user !== null) {
            $response->headers->set('Cache-Control', 'private, no-store');
        } else {
            $response->headers->set(
                'Cache-Control',
                'public, s-maxage=60, stale-while-revalidate=600'
            );
        }

        return $response;
    }
}

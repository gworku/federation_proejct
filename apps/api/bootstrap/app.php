<?php

use App\Http\Middleware\NormalizeTrailingSlash;
use App\Http\Middleware\PublicApiCache;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $trusted = env('TRUSTED_PROXIES', '*');
        $at = $trusted === '*' || $trusted === null || $trusted === ''
            ? '*'
            : array_values(array_filter(array_map('trim', explode(',', (string) $trusted))));

        $middleware->trustProxies(
            at: $at,
            headers: Request::HEADER_X_FORWARDED_FOR
                | Request::HEADER_X_FORWARDED_HOST
                | Request::HEADER_X_FORWARDED_PORT
                | Request::HEADER_X_FORWARDED_PROTO
                | Request::HEADER_X_FORWARDED_AWS_ELB,
        );

        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureRole::class,
            'public.cache' => PublicApiCache::class,
            'optional.jwt' => \App\Http\Middleware\OptionalJwt::class,
            'jwt.access' => \App\Http\Middleware\EnsureAccessToken::class,
        ]);

        $middleware->prepend(SecurityHeaders::class);

        $middleware->prependToGroup('api', [
            NormalizeTrailingSlash::class,
            \App\Http\Middleware\OptionalJwt::class,
        ]);
        $middleware->appendToGroup('api', [
            'throttle:api',
            PublicApiCache::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();

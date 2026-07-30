<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }

        RateLimiter::for('auth', function (Request $request) {
            $key = strtolower((string) ($request->input('identifier')
                ?? $request->input('email')
                ?? $request->ip()));

            return [
                Limit::perMinute(10)->by('auth-ip:'.$request->ip()),
                Limit::perMinute(5)->by('auth-id:'.$key),
            ];
        });

        RateLimiter::for('intake', function (Request $request) {
            return Limit::perMinute(20)->by('intake:'.$request->ip());
        });

        RateLimiter::for('api', function (Request $request) {
            $user = $request->user('api');

            return Limit::perMinute(120)->by($user ? 'user:'.$user->id : 'ip:'.$request->ip());
        });
    }
}

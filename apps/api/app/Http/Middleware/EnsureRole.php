<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user('api') ?? $request->user();

        if ($user === null) {
            return response()->json([
                'detail' => 'Authentication credentials were not provided.',
            ], 401);
        }

        $allowedRoles = collect($roles)
            ->flatMap(fn (string $role) => array_map('trim', explode(',', $role)))
            ->filter()
            ->all();

        if ($user->is_superuser || $user->hasRole($allowedRoles)) {
            return $next($request);
        }

        return response()->json([
            'detail' => 'You do not have permission to perform this action.',
        ], 403);
    }
}

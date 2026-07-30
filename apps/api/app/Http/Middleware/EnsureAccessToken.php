<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccessToken
{
    public function handle(Request $request, Closure $next): Response
    {
        try {
            $payload = JWTAuth::parseToken()->getPayload();
            $use = $payload->get('token_use');
            if ($use !== null && $use !== 'access') {
                return response()->json([
                    'detail' => 'Access token required.',
                ], 401);
            }
        } catch (\Throwable) {
            // Let auth:api handle missing/invalid tokens.
        }

        return $next($request);
    }
}

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Authenticate when a Bearer token is present; otherwise continue as guest.
 * Lets staff CMS GETs see drafts while public GETs stay unauthenticated.
 */
class OptionalJwt
{
    public function handle(Request $request, Closure $next): Response
    {
        $header = $request->bearerToken();
        if ($header) {
            try {
                $payload = JWTAuth::parseToken()->getPayload();
                $use = $payload->get('token_use');
                if ($use !== null && $use !== 'access') {
                    return $next($request);
                }

                $user = JWTAuth::authenticate();
                if ($user) {
                    auth('api')->setUser($user);
                    $request->setUserResolver(fn () => $user);
                }
            } catch (\Throwable) {
                // Invalid/expired token — treat as guest for public reads.
            }
        }

        return $next($request);
    }
}

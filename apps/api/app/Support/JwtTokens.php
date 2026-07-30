<?php

namespace App\Support;

use App\Models\User;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use RuntimeException;

class JwtTokens
{
    /**
     * @return array{access: string, refresh: string}
     */
    public static function pairFor(User $user): array
    {
        $accessTtl = max(1, (int) config('jwt.ttl', 30));
        $refreshTtl = max($accessTtl, (int) config('jwt.refresh_ttl', 20160));

        JWTAuth::factory()->setTTL($accessTtl);
        $access = JWTAuth::customClaims(['token_use' => 'access'])->fromUser($user);

        JWTAuth::factory()->setTTL($refreshTtl);
        $refresh = JWTAuth::customClaims(['token_use' => 'refresh'])->fromUser($user);

        JWTAuth::factory()->setTTL($accessTtl);

        return [
            'access' => (string) $access,
            'refresh' => (string) $refresh,
        ];
    }

    /**
     * @return array{access: string, refresh: string}
     */
    public static function rotate(string $refreshToken): array
    {
        JWTAuth::setToken($refreshToken);
        $payload = JWTAuth::getPayload();

        if (($payload->get('token_use') ?? null) !== 'refresh') {
            throw new RuntimeException('Refresh token required.');
        }

        /** @var User|null $user */
        $user = User::query()->find($payload->get('sub'));
        if ($user === null) {
            throw new RuntimeException('User not found.');
        }

        if (! $user->is_active) {
            throw new RuntimeException('Account inactive.');
        }

        if ($user->locked_until !== null && $user->locked_until->isFuture()) {
            throw new RuntimeException('Account locked.');
        }

        try {
            JWTAuth::invalidate(true);
        } catch (\Throwable) {
            // Blacklist may be off.
        }

        return self::pairFor($user);
    }
}

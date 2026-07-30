<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\JwtTokens;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_locks_after_five_failures(): void
    {
        $user = User::factory()->create([
            'email' => 'lock@example.com',
            'password' => 'Password123!',
        ]);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/auth/login', [
                'identifier' => 'lock@example.com',
                'password' => 'wrong-password',
            ])->assertStatus(400);
        }

        $user->refresh();
        $this->assertNotNull($user->locked_until);
        $this->assertTrue($user->locked_until->isFuture());
    }

    public function test_refresh_rejects_locked_user(): void
    {
        $user = User::factory()->create([
            'locked_until' => now()->addMinutes(15),
        ]);
        $tokens = JwtTokens::pairFor($user);

        $this->postJson('/api/auth/refresh', [
            'refresh' => $tokens['refresh'],
        ])->assertStatus(401);
    }

    public function test_refresh_rejects_inactive_user(): void
    {
        $user = User::factory()->create([
            'is_active' => false,
        ]);
        $tokens = JwtTokens::pairFor($user);

        $this->postJson('/api/auth/refresh', [
            'refresh' => $tokens['refresh'],
        ])->assertStatus(401);
    }

    public function test_password_reset_flow(): void
    {
        $user = User::factory()->create([
            'email' => 'reset@example.com',
            'password' => 'OldPassword1!',
        ]);

        $forgot = $this->postJson('/api/auth/forgot-password', [
            'email' => 'reset@example.com',
        ])->assertOk();

        $token = $forgot->json('reset_token');
        $this->assertNotEmpty($token);

        $this->postJson('/api/auth/reset-password', [
            'email' => 'reset@example.com',
            'token' => $token,
            'password' => 'NewPassword1!',
            'password_confirmation' => 'NewPassword1!',
        ])->assertOk();

        $user->refresh();
        $this->assertTrue(Hash::check('NewPassword1!', $user->password));
        $this->assertFalse($user->must_change_password);
        $this->assertDatabaseMissing('password_reset_tokens', ['email' => 'reset@example.com']);
    }

    public function test_change_password_requires_auth(): void
    {
        $user = User::factory()->create([
            'password' => 'Password123!',
            'must_change_password' => true,
        ]);
        $tokens = JwtTokens::pairFor($user);

        $this->withHeader('Authorization', 'Bearer '.$tokens['access'])
            ->postJson('/api/auth/change-password', [
                'current_password' => 'Password123!',
                'password' => 'ChangedPass1!',
                'password_confirmation' => 'ChangedPass1!',
            ])
            ->assertOk();

        $user->refresh();
        $this->assertTrue(Hash::check('ChangedPass1!', $user->password));
        $this->assertFalse($user->must_change_password);
    }

    public function test_access_approval_does_not_return_temporary_password(): void
    {
        $admin = User::factory()->administrator()->create();
        $tokens = JwtTokens::pairFor($admin);

        $create = $this->postJson('/api/auth/access-requests', [
            'full_name' => 'New Member',
            'email' => 'new.member@example.com',
            'organization' => 'Utility A',
            'role_requested' => 'utility_user',
            'justification' => 'Need access for reporting.',
        ])->assertCreated();

        $id = $create->json('id');

        $approve = $this->withHeader('Authorization', 'Bearer '.$tokens['access'])
            ->patchJson("/api/auth/access-requests/{$id}", [
                'status' => 'approved',
                'role' => 'utility_user',
            ])
            ->assertOk();

        $this->assertArrayNotHasKey('temporary_password', $approve->json());
        $this->assertNotEmpty($approve->json('setup_token'));
        $this->assertDatabaseHas('users', [
            'email' => 'new.member@example.com',
            'must_change_password' => 1,
        ]);
    }
}

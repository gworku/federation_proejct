<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccessRequest;
use App\Models\User;
use App\Support\ApiTransforms;
use App\Support\Audit;
use App\Support\DrfPaginator;
use App\Support\JwtTokens;
use App\Support\Roles;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        if (! $request->filled('identifier') && $request->filled('email')) {
            $request->merge(['identifier' => $request->input('email')]);
        }

        $request->validate([
            'identifier' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $identifier = trim((string) $request->input('identifier'));
        $password = (string) $request->input('password');

        $user = User::query()
            ->where(function ($query) use ($identifier): void {
                $query->whereRaw('LOWER(email) = ?', [strtolower($identifier)])
                    ->orWhereRaw('LOWER(username) = ?', [strtolower($identifier)])
                    ->orWhereRaw('LOWER(employee_id) = ?', [strtolower($identifier)]);
            })
            ->first();

        if ($user !== null && $user->locked_until !== null && $user->locked_until->isFuture()) {
            return response()->json([
                'non_field_errors' => ['Account temporarily locked due to failed login attempts.'],
            ], 400);
        }

        if ($user === null || ! Hash::check($password, $user->password)) {
            if ($user !== null) {
                $user->failed_login_attempts++;
                if ($user->failed_login_attempts >= 5) {
                    $user->locked_until = now()->addMinutes(15);
                    $user->failed_login_attempts = 0;
                }
                $user->save();
            }

            return response()->json([
                'non_field_errors' => ['Invalid credentials.'],
            ], 400);
        }

        if (! $user->is_active) {
            return response()->json([
                'non_field_errors' => ['Invalid credentials.'],
            ], 400);
        }

        $user->failed_login_attempts = 0;
        $user->locked_until = null;
        $user->save();

        $tokens = JwtTokens::pairFor($user);
        Audit::record($user, 'login.success', $request->ip(), ['role' => $user->role], 'user', $user->id);

        return response()->json([
            'access' => $tokens['access'],
            'refresh' => $tokens['refresh'],
            'user' => ApiTransforms::user($user),
            'dashboard' => $this->dashboardForRole($user->role),
        ]);
    }

    public function refresh(Request $request): JsonResponse
    {
        $request->validate([
            'refresh' => ['required', 'string'],
        ]);

        try {
            $tokens = JwtTokens::rotate((string) $request->input('refresh'));
        } catch (\Throwable) {
            return response()->json(['detail' => 'Token is invalid or expired.'], 401);
        }

        return response()->json($tokens);
    }

    public function logout(Request $request): JsonResponse
    {
        $refresh = $request->input('refresh');
        if (! $refresh) {
            return response()->json(['detail' => 'Refresh token required.'], 400);
        }

        try {
            JWTAuth::setToken($refresh)->invalidate(true);
        } catch (\Throwable) {
            // Already invalid — still clear client session.
        }

        try {
            if ($request->bearerToken()) {
                JWTAuth::setToken($request->bearerToken())->invalidate(true);
            }
        } catch (\Throwable) {
            // Ignore access token blacklist failures.
        }

        $actor = $request->user('api');
        if ($actor) {
            Audit::record($actor, 'logout', $request->ip(), [], 'user', $actor->id);
        }

        return response()->json(null, 204);
    }

    public function me(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user('api');

        return response()->json(ApiTransforms::user($user));
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        $email = strtolower($data['email']);
        $user = User::query()->whereRaw('LOWER(email) = ?', [$email])->first();

        // Always return the same shape to avoid account enumeration.
        $response = [
            'detail' => 'If an account exists for that email, password reset instructions have been issued.',
        ];

        if ($user === null || ! $user->is_active) {
            return response()->json($response);
        }

        $plain = Str::random(64);
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            ['token' => Hash::make($plain), 'created_at' => now()],
        );

        $frontend = rtrim((string) env('FRONTEND_URL', 'http://localhost:3000'), '/');
        $resetUrl = $frontend.'/reset-password?token='.urlencode($plain).'&email='.urlencode($user->email);

        try {
            Mail::raw(
                "OWUF password reset\n\nUse this link within 60 minutes:\n{$resetUrl}\n\nIf you did not request this, ignore this email.",
                function ($message) use ($user): void {
                    $message->to($user->email)->subject('OWUF password reset');
                },
            );
        } catch (\Throwable) {
            // Mail may be log/null in local; still allow debug token below.
        }

        Audit::record(null, 'password.forgot', $request->ip(), ['email' => $user->email], 'user', $user->id);

        if (! app()->environment('production')) {
            $response['reset_token'] = $plain;
            $response['reset_url'] = $resetUrl;
        }

        return response()->json($response);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:10', 'confirmed'],
        ]);

        $email = strtolower($data['email']);
        $row = DB::table('password_reset_tokens')->where('email', $email)->first();
        if ($row === null) {
            // Also try exact case match from stored email
            $row = DB::table('password_reset_tokens')
                ->whereRaw('LOWER(email) = ?', [$email])
                ->first();
        }

        if ($row === null || ! Hash::check($data['token'], $row->token)) {
            return response()->json(['detail' => 'Invalid or expired reset token.'], 400);
        }

        if (
            $row->created_at !== null
            && \Illuminate\Support\Carbon::parse($row->created_at)->addMinutes(60)->isPast()
        ) {
            DB::table('password_reset_tokens')->where('email', $row->email)->delete();

            return response()->json(['detail' => 'Invalid or expired reset token.'], 400);
        }

        $user = User::query()->whereRaw('LOWER(email) = ?', [strtolower($row->email)])->first();
        if ($user === null || ! $user->is_active) {
            return response()->json(['detail' => 'Invalid or expired reset token.'], 400);
        }

        $user->password = $data['password'];
        $user->must_change_password = false;
        $user->failed_login_attempts = 0;
        $user->locked_until = null;
        $user->save();

        DB::table('password_reset_tokens')->where('email', $row->email)->delete();

        Audit::record($user, 'password.reset', $request->ip(), [], 'user', $user->id);

        return response()->json(['detail' => 'Password updated. You can sign in with your new password.']);
    }

    public function changePassword(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user('api');

        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:10', 'confirmed'],
        ]);

        if (! Hash::check($data['current_password'], $user->password)) {
            return response()->json(['detail' => 'Current password is incorrect.'], 400);
        }

        $user->password = $data['password'];
        $user->must_change_password = false;
        $user->save();

        Audit::record($user, 'password.change', $request->ip(), [], 'user', $user->id);

        return response()->json(['detail' => 'Password updated successfully.']);
    }

    public function createAccessRequest(Request $request): JsonResponse
    {
        $data = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'organization' => ['required', 'string', 'max:255'],
            'role_requested' => ['required', 'string', 'max:255'],
            'justification' => ['required', 'string', 'max:5000'],
        ]);

        $row = AccessRequest::create($data);

        return response()->json(ApiTransforms::accessRequest($row), 201);
    }

    public function listAccessRequests(Request $request): JsonResponse
    {
        if (! Roles::isAdminOrManagement($request->user('api'))) {
            return response()->json(['detail' => 'You do not have permission to perform this action.'], 403);
        }

        $pageSize = max(1, min(200, (int) $request->query('page_size', 20)));
        $paginator = AccessRequest::query()
            ->orderByDesc('id')
            ->paginate($pageSize);
        $paginator->getCollection()->transform(
            fn (AccessRequest $row) => ApiTransforms::accessRequest($row),
        );

        return response()->json(DrfPaginator::paginate($paginator, $request));
    }

    public function updateAccessRequest(Request $request, int $id): JsonResponse
    {
        if (! Roles::isAdminOrManagement($request->user('api'))) {
            return response()->json(['detail' => 'You do not have permission to perform this action.'], 403);
        }

        $row = AccessRequest::query()->find($id);
        if ($row === null) {
            return response()->json(['detail' => 'Not found.'], 404);
        }

        $data = $request->validate([
            'status' => ['required', 'in:pending,approved,rejected'],
            'staff_notes' => ['nullable', 'string', 'max:5000'],
            'role' => ['nullable', 'string', 'max:64'],
        ]);

        $createdUser = null;
        $setupToken = null;

        if ($data['status'] === 'approved') {
            $role = $data['role'] ?? $row->role_requested;
            $allowed = [
                Roles::CONTENT_EDITOR,
                Roles::PROJECT_OFFICER,
                Roles::FINANCE_OFFICER,
                Roles::PROCUREMENT_OFFICER,
                Roles::UTILITY_USER,
                Roles::AUDITOR,
                Roles::MANAGEMENT,
            ];
            if (! in_array($role, $allowed, true)) {
                $role = Roles::UTILITY_USER;
            }

            $existing = User::query()->whereRaw('LOWER(email) = ?', [strtolower($row->email)])->first();
            if ($existing === null) {
                $temporaryPassword = 'Owuf@'.random_int(100000, 999999).Str::random(4);
                $parts = preg_split('/\s+/', trim($row->full_name)) ?: ['User'];
                $first = (string) array_shift($parts);
                $last = trim(implode(' ', $parts));
                $usernameBase = strtolower(preg_replace('/[^a-z0-9]+/i', '', $first.$last) ?: 'user');
                $username = $usernameBase;
                $i = 1;
                while (User::query()->where('username', $username)->exists()) {
                    $username = $usernameBase.$i;
                    $i++;
                }

                $createdUser = User::query()->create([
                    'username' => $username,
                    'email' => strtolower($row->email),
                    'password' => $temporaryPassword,
                    'role' => $role,
                    'first_name' => $first,
                    'last_name' => $last,
                    'organization' => $row->organization,
                    'is_active' => true,
                    'is_staff' => in_array($role, [Roles::ADMINISTRATOR, Roles::MANAGEMENT], true),
                    'is_superuser' => false,
                    'must_change_password' => true,
                ]);

                $setupToken = Str::random(64);
                DB::table('password_reset_tokens')->updateOrInsert(
                    ['email' => $createdUser->email],
                    ['token' => Hash::make($setupToken), 'created_at' => now()],
                );
            } else {
                $existing->is_active = true;
                $existing->role = $role;
                $existing->organization = $row->organization ?: $existing->organization;
                $existing->must_change_password = true;
                $existing->save();
                $createdUser = $existing;

                $setupToken = Str::random(64);
                DB::table('password_reset_tokens')->updateOrInsert(
                    ['email' => $createdUser->email],
                    ['token' => Hash::make($setupToken), 'created_at' => now()],
                );
            }
            $data['processed_at'] = now();
        }

        if (array_key_exists('staff_notes', $data)) {
            $row->staff_notes = $data['staff_notes'];
        }
        $row->status = $data['status'];
        if (isset($data['processed_at'])) {
            $row->processed_at = $data['processed_at'];
        }
        $row->save();

        Audit::record($request->user('api'), 'access_request.update', $request->ip(), [
            'id' => $row->id,
            'status' => $row->status,
            'user_id' => $createdUser?->id,
        ], 'access_request', $row->id);

        $payload = ApiTransforms::accessRequest($row);
        if ($setupToken && $createdUser) {
            $frontend = rtrim((string) env('FRONTEND_URL', 'http://localhost:3000'), '/');
            $payload['created_username'] = $createdUser->username;
            $payload['setup_token'] = $setupToken;
            $payload['setup_url'] = $frontend.'/reset-password?token='.urlencode($setupToken).'&email='.urlencode($createdUser->email);
            // Never return plaintext temporary_password.
        }

        return response()->json($payload);
    }

    private function dashboardForRole(string $role): string
    {
        return match ($role) {
            Roles::ADMINISTRATOR, Roles::MANAGEMENT => '/app/dashboard',
            Roles::PROJECT_OFFICER => '/app/projects',
            Roles::FINANCE_OFFICER => '/app/finance',
            Roles::PROCUREMENT_OFFICER => '/app/procurement',
            Roles::UTILITY_USER => '/app/utilities',
            Roles::AUDITOR => '/app/audit',
            Roles::CONTENT_EDITOR => '/app/cms',
            default => '/app/dashboard',
        };
    }
}

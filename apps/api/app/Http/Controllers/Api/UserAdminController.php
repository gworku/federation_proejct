<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\ApiTransforms;
use App\Support\Audit;
use App\Support\DrfPaginator;
use App\Support\Roles;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class UserAdminController extends Controller
{
    private const ASSIGNABLE = [
        Roles::CONTENT_EDITOR,
        Roles::PROJECT_OFFICER,
        Roles::FINANCE_OFFICER,
        Roles::PROCUREMENT_OFFICER,
        Roles::UTILITY_USER,
        Roles::AUDITOR,
        Roles::MANAGEMENT,
        Roles::ADMINISTRATOR,
    ];

    public function index(Request $request): JsonResponse
    {
        if (! Roles::isAdministrator($request->user('api'))) {
            return response()->json(['detail' => 'You do not have permission to perform this action.'], 403);
        }

        $pageSize = max(1, min(200, (int) $request->query('page_size', 20)));
        $query = User::query()->orderByDesc('id');

        $search = trim((string) $request->query('search', ''));
        if ($search !== '') {
            $query->where(function ($inner) use ($search): void {
                $inner->where('email', 'like', '%'.$search.'%')
                    ->orWhere('username', 'like', '%'.$search.'%')
                    ->orWhere('first_name', 'like', '%'.$search.'%')
                    ->orWhere('last_name', 'like', '%'.$search.'%');
            });
        }

        $role = trim((string) $request->query('role', ''));
        if ($role !== '' && $role !== 'all') {
            $query->where('role', $role);
        }

        $active = $request->query('is_active');
        if ($active !== null && $active !== '') {
            $query->where('is_active', filter_var($active, FILTER_VALIDATE_BOOLEAN));
        }

        $paginator = $query->paginate($pageSize);
        $paginator->getCollection()->transform(fn (User $user) => ApiTransforms::userAdmin($user));

        return response()->json(DrfPaginator::paginate($paginator, $request));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        /** @var User $actor */
        $actor = $request->user('api');
        if (! Roles::isAdministrator($actor)) {
            return response()->json(['detail' => 'You do not have permission to perform this action.'], 403);
        }

        $user = User::query()->find($id);
        if ($user === null) {
            return response()->json(['detail' => 'Not found.'], 404);
        }

        $data = $request->validate([
            'role' => ['sometimes', 'string', 'in:'.implode(',', self::ASSIGNABLE)],
            'is_active' => ['sometimes', 'boolean'],
            'must_change_password' => ['sometimes', 'boolean'],
            'organization' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        if ($user->id === $actor->id && array_key_exists('is_active', $data) && ! $data['is_active']) {
            return response()->json(['detail' => 'You cannot deactivate your own account.'], 400);
        }

        if ($user->id === $actor->id && isset($data['role']) && $data['role'] !== Roles::ADMINISTRATOR) {
            return response()->json(['detail' => 'You cannot remove your own administrator role.'], 400);
        }

        $user->fill($data);
        if (isset($data['role'])) {
            $user->is_staff = in_array($data['role'], [Roles::ADMINISTRATOR, Roles::MANAGEMENT], true);
        }
        $user->save();

        Audit::record($actor, 'user.update', $request->ip(), [
            'changes' => $data,
        ], 'user', $user->id);

        return response()->json(ApiTransforms::userAdmin($user->fresh()));
    }

    public function export(Request $request): StreamedResponse|JsonResponse
    {
        if (! Roles::isAdministrator($request->user('api'))) {
            return response()->json(['detail' => 'You do not have permission to perform this action.'], 403);
        }

        $rows = User::query()->orderBy('id')->get();

        return Response::streamDownload(function () use ($rows): void {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['id', 'username', 'email', 'role', 'is_active', 'organization', 'created_at']);
            foreach ($rows as $user) {
                fputcsv($out, [
                    $user->id,
                    $user->username,
                    $user->email,
                    $user->role,
                    $user->is_active ? '1' : '0',
                    $user->organization,
                    optional($user->created_at)?->toIso8601String(),
                ]);
            }
            fclose($out);
        }, 'owuf-users.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }
}

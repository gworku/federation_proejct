<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\BackupService;
use App\Support\Audit;
use App\Support\Roles;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class BackupController extends Controller
{
    public function __construct(private readonly BackupService $backups) {}

    public function index(Request $request): JsonResponse
    {
        if (! Roles::isAdministrator($request->user('api'))) {
            return response()->json(['detail' => 'You do not have permission to perform this action.'], 403);
        }

        return response()->json($this->backups->list());
    }

    public function store(Request $request): JsonResponse
    {
        if (! Roles::isAdministrator($request->user('api'))) {
            return response()->json(['detail' => 'You do not have permission to perform this action.'], 403);
        }

        $label = trim((string) $request->input('label', 'manual')) ?: 'manual';
        $row = $this->backups->create($label);

        Audit::record($request->user('api'), 'backup.create', $request->ip(), [
            'filename' => $row['filename'],
            'label' => $label,
        ]);

        return response()->json($row, 201);
    }

    public function download(Request $request, string $filename): BinaryFileResponse|JsonResponse
    {
        if (! Roles::isAdministrator($request->user('api'))) {
            return response()->json(['detail' => 'You do not have permission to perform this action.'], 403);
        }

        $path = $this->backups->resolve($filename);
        if ($path === null) {
            return response()->json(['detail' => 'Backup not found.'], 404);
        }

        return response()->download($path, basename($path), [
            'Content-Type' => 'application/zip',
        ]);
    }

    public function destroy(Request $request, string $filename): JsonResponse
    {
        if (! Roles::isAdministrator($request->user('api'))) {
            return response()->json(['detail' => 'You do not have permission to perform this action.'], 403);
        }

        if (! $this->backups->delete($filename)) {
            return response()->json(['detail' => 'Backup not found.'], 404);
        }

        Audit::record($request->user('api'), 'backup.delete', $request->ip(), [
            'filename' => $filename,
        ]);

        return response()->json(null, 204);
    }

    public function restore(Request $request, string $filename): JsonResponse
    {
        if (! Roles::isAdministrator($request->user('api'))) {
            return response()->json(['detail' => 'You do not have permission to perform this action.'], 403);
        }

        if (app()->environment('production') && ! filter_var(env('ALLOW_BACKUP_RESTORE', false), FILTER_VALIDATE_BOOLEAN)) {
            return response()->json([
                'detail' => 'HTTP backup restore is disabled in production. Use artisan restore on the server, or set ALLOW_BACKUP_RESTORE=true deliberately.',
            ], 403);
        }

        try {
            $result = $this->backups->restore($filename);
        } catch (\InvalidArgumentException) {
            return response()->json(['detail' => 'Backup not found.'], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'detail' => app()->environment('production')
                    ? 'Restore failed.'
                    : 'Restore failed: '.$e->getMessage(),
            ], 500);
        }

        Audit::record($request->user('api'), 'backup.restore', $request->ip(), [
            'filename' => $filename,
            'rows_total' => $result['rows_total'] ?? 0,
        ]);

        return response()->json($result);
    }
}

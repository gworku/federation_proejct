<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditEvent;
use App\Support\ApiTransforms;
use App\Support\DrfPaginator;
use App\Support\Roles;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditController extends Controller
{
    public function events(Request $request): JsonResponse
    {
        if (! Roles::isAuditorOrAdmin($request->user('api'))) {
            return response()->json(['detail' => 'You do not have permission to perform this action.'], 403);
        }

        $pageSize = max(1, min(200, (int) $request->query('page_size', 20)));
        $query = AuditEvent::query()->with('actor')->orderByDesc('id');

        $action = trim((string) $request->query('action', ''));
        if ($action !== '') {
            $query->where('action', 'like', '%'.$action.'%');
        }

        $entityType = trim((string) $request->query('entity_type', ''));
        if ($entityType !== '') {
            $query->where('entity_type', $entityType);
        }

        $from = trim((string) $request->query('from', ''));
        if ($from !== '') {
            $query->whereDate('created_at', '>=', $from);
        }

        $to = trim((string) $request->query('to', ''));
        if ($to !== '') {
            $query->whereDate('created_at', '<=', $to);
        }

        $paginator = $query->paginate($pageSize);
        $paginator->getCollection()->transform(fn (AuditEvent $row) => ApiTransforms::auditEvent($row));

        return response()->json(DrfPaginator::paginate($paginator, $request));
    }
}

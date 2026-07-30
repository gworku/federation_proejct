<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\NotificationRead;
use App\Support\ApiTransforms;
use App\Support\DrfPaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user('api');
        $pageSize = max(1, min(200, (int) $request->query('page_size', 20)));
        $readBroadcastIds = NotificationRead::query()
            ->where('user_id', $user->id)
            ->pluck('notification_id')
            ->all();

        $paginator = Notification::query()
            ->where(function ($query) use ($user): void {
                $query->where('user_id', $user->id)->orWhereNull('user_id');
            })
            ->orderByDesc('id')
            ->paginate($pageSize);

        $paginator->getCollection()->transform(function (Notification $row) use ($user, $readBroadcastIds) {
            $payload = ApiTransforms::notification($row);
            if ($row->user_id === null) {
                $payload['is_read'] = in_array($row->id, $readBroadcastIds, true);
                $payload['broadcast'] = true;
            }

            return $payload;
        });

        return response()->json(DrfPaginator::paginate($paginator, $request));
    }

    public function markRead(Request $request, int $id): JsonResponse
    {
        $user = $request->user('api');
        $note = Notification::query()
            ->where('id', $id)
            ->where(function ($query) use ($user): void {
                $query->where('user_id', $user->id)->orWhereNull('user_id');
            })
            ->first();

        if ($note === null) {
            return response()->json(['detail' => 'Not found.'], 404);
        }

        if ($note->user_id === null) {
            NotificationRead::query()->firstOrCreate(
                [
                    'user_id' => $user->id,
                    'notification_id' => $note->id,
                ],
                ['read_at' => now()],
            );

            return response()->json([
                'id' => $note->id,
                'is_read' => true,
                'broadcast' => true,
            ]);
        }

        $note->is_read = true;
        $note->save();

        return response()->json(ApiTransforms::notification($note));
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $user = $request->user('api');
        $updated = Notification::query()
            ->where('user_id', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        $broadcastIds = Notification::query()->whereNull('user_id')->pluck('id');
        foreach ($broadcastIds as $notificationId) {
            NotificationRead::query()->firstOrCreate(
                [
                    'user_id' => $user->id,
                    'notification_id' => $notificationId,
                ],
                ['read_at' => now()],
            );
        }

        return response()->json([
            'updated' => $updated + $broadcastIds->count(),
        ]);
    }
}

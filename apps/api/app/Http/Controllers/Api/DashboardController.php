<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccessRequest;
use App\Models\Contribution;
use App\Models\MembershipApplication;
use App\Models\NewsArticle;
use App\Models\Notification;
use App\Models\NotificationRead;
use App\Models\Project;
use App\Models\Risk;
use App\Models\ServiceRequest;
use App\Models\Utility;
use App\Models\UtilityKpi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $user = $request->user('api');

        $personalUnread = Notification::query()
            ->where('user_id', $user->id)
            ->where('is_read', false)
            ->count();

        $readBroadcastIds = NotificationRead::query()
            ->where('user_id', $user->id)
            ->pluck('notification_id');

        $broadcastUnread = Notification::query()
            ->whereNull('user_id')
            ->when(
                $readBroadcastIds->isNotEmpty(),
                fn ($q) => $q->whereNotIn('id', $readBroadcastIds),
            )
            ->count();

        return response()->json([
            'utilities' => Utility::query()->count(),
            'projects' => Project::query()->count(),
            'published_news' => NewsArticle::query()->where('status', 'published')->count(),
            'draft_news' => NewsArticle::query()->where('status', 'draft')->count(),
            'pending_access_requests' => AccessRequest::query()->where('status', 'pending')->count(),
            'open_service_requests' => ServiceRequest::query()->where('status', '!=', 'closed')->count(),
            'pending_membership' => MembershipApplication::query()->where('status', 'pending')->count(),
            'open_risks' => Risk::query()->where('review_status', '!=', 'closed')->count(),
            'kpi_submitted' => UtilityKpi::query()->where('status', 'submitted')->count(),
            'contributions_overdue' => Contribution::query()->where('status', 'overdue')->count(),
            'unread_notifications' => $personalUnread + $broadcastUnread,
        ]);
    }
}

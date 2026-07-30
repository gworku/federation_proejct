<?php

use App\Http\Controllers\Api\AuditController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BackupController;
use App\Http\Controllers\Api\BenchmarkingController;
use App\Http\Controllers\Api\CmsResourceController;
use App\Http\Controllers\Api\ContributionController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\IndicatorController;
use App\Http\Controllers\Api\IndicatorResultController;
use App\Http\Controllers\Api\IntakeController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\RequestReportController;
use App\Http\Controllers\Api\RiskController;
use App\Http\Controllers\Api\StrategicKraController;
use App\Http\Controllers\Api\UserAdminController;
use App\Http\Controllers\Api\UtilityController;
use App\Http\Controllers\Api\UtilityKpiController;
use Illuminate\Support\Facades\Route;

Route::get('health', HealthController::class);

Route::prefix('auth')->group(function (): void {
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:auth');
    Route::post('refresh', [AuthController::class, 'refresh'])->middleware('throttle:auth');
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:auth');
    Route::post('reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:auth');
    Route::post('access-requests', [AuthController::class, 'createAccessRequest'])
        ->middleware('throttle:intake');

    Route::middleware(['auth:api', 'jwt.access'])->group(function (): void {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('change-password', [AuthController::class, 'changePassword']);
        Route::get('access-requests/manage', [AuthController::class, 'listAccessRequests'])
            ->middleware('role:administrator,management');
        Route::patch('access-requests/{id}', [AuthController::class, 'updateAccessRequest'])
            ->middleware('role:administrator,management');
    });
});

Route::middleware(['auth:api', 'jwt.access', 'role:administrator'])->prefix('admin')->group(function (): void {
    Route::get('users', [UserAdminController::class, 'index']);
    Route::get('users/export', [UserAdminController::class, 'export']);
    Route::patch('users/{id}', [UserAdminController::class, 'update']);
});

Route::get('utilities/coverage', [UtilityController::class, 'coverage']);
Route::get('utilities', [UtilityController::class, 'index']);
Route::get('utilities/{slug}', [UtilityController::class, 'show']);
Route::middleware(['auth:api', 'jwt.access'])->group(function (): void {
    Route::post('utilities', [UtilityController::class, 'store']);
    Route::match(['put', 'patch'], 'utilities/{slug}', [UtilityController::class, 'update']);
    Route::delete('utilities/{slug}', [UtilityController::class, 'destroy']);
});

Route::get('projects', [ProjectController::class, 'index']);
Route::get('projects/{slug}', [ProjectController::class, 'show']);
Route::middleware(['auth:api', 'jwt.access'])->group(function (): void {
    Route::post('projects', [ProjectController::class, 'store']);
    Route::match(['put', 'patch'], 'projects/{slug}', [ProjectController::class, 'update']);
    Route::delete('projects/{slug}', [ProjectController::class, 'destroy']);
});

Route::prefix('cms')->group(function (): void {
    Route::post('media', [MediaController::class, 'store'])
        ->middleware(['auth:api', 'jwt.access', 'throttle:intake']);

    Route::post('newsletter', [CmsResourceController::class, 'subscribeNewsletter'])
        ->middleware('throttle:intake');
    Route::post('knowledge-docs/{slug}/download', [CmsResourceController::class, 'downloadKnowledgeDoc'])
        ->middleware('throttle:intake');

    foreach ([
        'contact',
        'service-requests',
        'membership-applications',
        'event-registrations',
        'training-registrations',
        'partnership-inquiries',
        'procurement-interests',
        'consultancy-requests',
    ] as $resource) {
        Route::post($resource, [IntakeController::class, 'create'])
            ->middleware('throttle:intake')
            ->defaults('resource', $resource);
        Route::get("{$resource}/manage", [IntakeController::class, 'manage'])
            ->middleware(['auth:api', 'jwt.access'])
            ->defaults('resource', $resource);
        Route::patch("{$resource}/{id}", [IntakeController::class, 'update'])
            ->middleware(['auth:api', 'jwt.access'])
            ->defaults('resource', $resource);
        Route::delete("{$resource}/{id}", [IntakeController::class, 'destroy'])
            ->middleware(['auth:api', 'jwt.access'])
            ->defaults('resource', $resource);
    }

    foreach ([
        'news',
        'statistics',
        'publications',
        'leadership',
        'events',
        'gallery',
        'training',
        'partners',
        'procurement',
        'knowledge-docs',
        'locale-content',
        'newsletter-subscribers',
    ] as $resource) {
        Route::get($resource, [CmsResourceController::class, 'index'])->defaults('resource', $resource);
        Route::post($resource, [CmsResourceController::class, 'store'])
            ->middleware(['auth:api', 'jwt.access', 'role:administrator,management,content_editor'])
            ->defaults('resource', $resource);
        Route::get("{$resource}/{key}", [CmsResourceController::class, 'show'])->defaults('resource', $resource);
        Route::match(['put', 'patch'], "{$resource}/{key}", [CmsResourceController::class, 'update'])
            ->middleware(['auth:api', 'jwt.access', 'role:administrator,management,content_editor'])
            ->defaults('resource', $resource);
        Route::delete("{$resource}/{key}", [CmsResourceController::class, 'destroy'])
            ->middleware(['auth:api', 'jwt.access', 'role:administrator,management,content_editor'])
            ->defaults('resource', $resource);
    }
});

Route::middleware(['auth:api', 'jwt.access'])->prefix('dashboard')->group(function (): void {
    Route::get('summary', [DashboardController::class, 'summary']);
});

Route::middleware(['auth:api', 'jwt.access'])->prefix('requests')->group(function (): void {
    Route::get('feed', [RequestReportController::class, 'feed']);
    Route::get('summary', [RequestReportController::class, 'summary']);
    Route::get('export/{resource}', [RequestReportController::class, 'export']);
});

Route::middleware(['auth:api', 'jwt.access'])->prefix('audit')->group(function (): void {
    Route::get('events', [AuditController::class, 'events']);
});

Route::middleware(['auth:api', 'jwt.access'])->prefix('ops')->group(function (): void {
    Route::apiResource('risks', RiskController::class);
    Route::apiResource('kras', StrategicKraController::class);
    Route::apiResource('indicators', IndicatorController::class);
    Route::apiResource('indicator-results', IndicatorResultController::class);
    Route::apiResource('utility-kpis', UtilityKpiController::class);
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::post('notifications/mark-all-read', [NotificationController::class, 'markAllRead']);
    Route::post('notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::get('benchmarking/summary', [BenchmarkingController::class, 'summary']);
});

Route::middleware(['auth:api', 'jwt.access'])->prefix('membership')->group(function (): void {
    Route::get('contributions/summary', [ContributionController::class, 'summary']);
    Route::post('payment-submissions', [ContributionController::class, 'submitPayment'])
        ->middleware('throttle:intake');
    Route::patch('payments/{payment}/review', [ContributionController::class, 'reviewPayment']);
    Route::post('payments', [ContributionController::class, 'recordPayment']);
    Route::apiResource('contributions', ContributionController::class);
});

Route::middleware(['auth:api', 'jwt.access', 'role:administrator'])->prefix('backups')->group(function (): void {
    Route::get('/', [BackupController::class, 'index']);
    Route::post('/', [BackupController::class, 'store']);
    Route::post('{filename}/restore', [BackupController::class, 'restore']);
    Route::get('{filename}', [BackupController::class, 'download']);
    Route::delete('{filename}', [BackupController::class, 'destroy']);
});

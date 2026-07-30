<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConsultancyRequest;
use App\Models\ContactMessage;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\MembershipApplication;
use App\Models\PartnershipInquiry;
use App\Models\ProcurementInterest;
use App\Models\ProcurementNotice;
use App\Models\ServiceRequest;
use App\Models\TrainingCourse;
use App\Models\TrainingRegistration;
use App\Support\ApiTransforms;
use App\Support\Audit;
use App\Support\DrfPaginator;
use App\Support\Roles;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class IntakeController extends Controller
{
    /** @var array<string, array<string, mixed>> */
    private array $configs;

    public function __construct()
    {
        $this->configs = [
            'contact' => [
                'model' => ContactMessage::class,
                'transform' => fn (ContactMessage $r) => ApiTransforms::contact($r),
                'create_fields' => ['name', 'email', 'subject', 'message'],
                'update_fields' => ['status', 'staff_notes'],
                'list_staff' => fn ($u) => Roles::isAdministrator($u) || Roles::isContentInboxStaff($u),
                'audit' => 'contact.message.create',
            ],
            'service-requests' => [
                'model' => ServiceRequest::class,
                'transform' => fn (ServiceRequest $r) => ApiTransforms::serviceRequest($r),
                'create_fields' => ['name', 'email', 'organization', 'category', 'subject', 'description'],
                'update_fields' => ['status', 'staff_notes'],
                'list_staff' => fn ($u) => Roles::isAdministrator($u) || Roles::isServiceRequestStaff($u),
                'audit' => 'service_request.create',
            ],
            'membership-applications' => [
                'model' => MembershipApplication::class,
                'transform' => fn (MembershipApplication $r) => ApiTransforms::membershipApplication($r),
                'create_fields' => ['organization_name', 'contact_name', 'email', 'phone', 'zone', 'city', 'category', 'justification'],
                'update_fields' => ['status', 'staff_notes'],
                'list_staff' => fn ($u) => Roles::isAdministrator($u) || Roles::isMembershipStaff($u),
                'audit' => 'membership_application.create',
            ],
            'event-registrations' => [
                'model' => EventRegistration::class,
                'transform' => fn (EventRegistration $r) => ApiTransforms::eventRegistration($r),
                'create_fields' => ['name', 'email', 'organization', 'phone'],
                'create_resolver' => function (array $data): array {
                    $event = Event::query()->where('slug', $data['event_slug'] ?? '')->firstOrFail();

                    return [
                        'event_id' => $event->id,
                        'name' => $data['name'],
                        'email' => $data['email'],
                        'organization' => $data['organization'] ?? '',
                        'phone' => $data['phone'] ?? '',
                    ];
                },
                'create_validate' => ['event_slug' => 'required|string'],
                'update_fields' => ['status', 'staff_notes'],
                'list_staff' => fn ($u) => Roles::isAdministrator($u) || Roles::isContentInboxStaff($u),
                'audit' => 'event_registration.create',
                'with' => ['event'],
            ],
            'training-registrations' => [
                'model' => TrainingRegistration::class,
                'transform' => fn (TrainingRegistration $r) => ApiTransforms::trainingRegistration($r),
                'create_fields' => ['name', 'email', 'organization', 'phone'],
                'create_resolver' => function (array $data): array {
                    $course = TrainingCourse::query()->where('slug', $data['course_slug'] ?? '')->firstOrFail();
                    if ($course->registration_deadline && now()->gt($course->registration_deadline)) {
                        throw ValidationException::withMessages([
                            'detail' => 'Registration deadline has passed.',
                        ]);
                    }
                    $registered = $course->registrations()->where('status', '!=', 'cancelled')->count();
                    $status = ($course->capacity && $registered >= $course->capacity) ? 'waitlisted' : 'registered';

                    return [
                        'course_id' => $course->id,
                        'name' => $data['name'],
                        'email' => $data['email'],
                        'organization' => $data['organization'] ?? '',
                        'phone' => $data['phone'] ?? '',
                        'status' => $status,
                    ];
                },
                'create_validate' => ['course_slug' => 'required|string'],
                'update_fields' => ['status', 'staff_notes'],
                'list_staff' => fn ($u) => Roles::isAdministrator($u) || Roles::isTrainingStaff($u),
                'audit' => 'training_registration.create',
                'with' => ['course'],
            ],
            'partnership-inquiries' => [
                'model' => PartnershipInquiry::class,
                'transform' => fn (PartnershipInquiry $r) => ApiTransforms::partnershipInquiry($r),
                'create_fields' => ['organization', 'contact_name', 'email', 'partnership_interest', 'message'],
                'update_fields' => ['status', 'staff_notes'],
                'list_staff' => fn ($u) => Roles::isAdministrator($u) || Roles::isAdminOrManagement($u),
                'audit' => 'partnership_inquiry.create',
            ],
            'procurement-interests' => [
                'model' => ProcurementInterest::class,
                'transform' => fn (ProcurementInterest $r) => ApiTransforms::procurementInterest($r),
                'create_fields' => ['organization', 'contact_name', 'email', 'phone', 'message'],
                'create_resolver' => function (array $data): array {
                    $notice = ProcurementNotice::query()->where('slug', $data['notice_slug'] ?? '')->firstOrFail();

                    return [
                        'notice_id' => $notice->id,
                        'organization' => $data['organization'],
                        'contact_name' => $data['contact_name'],
                        'email' => $data['email'],
                        'phone' => $data['phone'] ?? '',
                        'message' => $data['message'] ?? '',
                    ];
                },
                'create_validate' => ['notice_slug' => 'required|string'],
                'update_fields' => ['status', 'staff_notes'],
                'list_staff' => fn ($u) => Roles::isAdministrator($u) || Roles::isProcurementStaff($u),
                'audit' => 'procurement_interest.create',
                'with' => ['notice'],
            ],
            'consultancy-requests' => [
                'model' => ConsultancyRequest::class,
                'transform' => fn (ConsultancyRequest $r) => ApiTransforms::consultancyRequest($r),
                'create_fields' => ['name', 'email', 'organization', 'category', 'subject', 'description'],
                'update_fields' => ['status', 'staff_notes'],
                'list_staff' => fn ($u) => Roles::isAdministrator($u) || Roles::isServiceRequestStaff($u),
                'audit' => 'consultancy_request.create',
            ],
        ];
    }

    private function cfg(string $resource): array
    {
        if (! isset($this->configs[$resource])) {
            abort(404, 'Not found.');
        }

        return $this->configs[$resource];
    }

    public function create(Request $request): JsonResponse
    {
        $resource = (string) $request->route('resource');
        $cfg = $this->cfg($resource);
        $optionalFields = ['organization', 'phone', 'message', 'zone', 'city', 'meeting_url'];
        $rules = [];
        foreach ($cfg['create_fields'] as $field) {
            $rules[$field] = in_array($field, $optionalFields, true)
                ? 'nullable|string'
                : 'required|string';
        }
        if (isset($cfg['create_validate'])) {
            $rules = array_merge($rules, $cfg['create_validate']);
        }
        if (isset($rules['email'])) {
            $rules['email'] = 'required|email';
        }
        $data = $request->validate($rules);

        if (isset($cfg['create_resolver'])) {
            $payload = ($cfg['create_resolver'])($data);
        } else {
            $payload = $request->only($cfg['create_fields']);
        }

        $modelClass = $cfg['model'];
        $row = $modelClass::create($payload);

        Audit::record(null, $cfg['audit'], $request->ip(), ['id' => $row->id]);

        if (isset($cfg['with'])) {
            $row->load($cfg['with']);
        }

        return response()->json(($cfg['transform'])($row), 201);
    }

    public function manage(Request $request): JsonResponse
    {
        $resource = (string) $request->route('resource');
        $cfg = $this->cfg($resource);
        if (! ($cfg['list_staff'])($request->user('api'))) {
            return response()->json(['detail' => 'You do not have permission to perform this action.'], 403);
        }

        $modelClass = $cfg['model'];
        $query = $modelClass::query();
        if (isset($cfg['with'])) {
            $query->with($cfg['with']);
        }

        $pageSize = max(1, min(200, (int) $request->query('page_size', 20)));
        $paginator = $query->orderByDesc('id')->paginate($pageSize);
        $paginator->getCollection()->transform(fn ($row) => ($cfg['transform'])($row));

        return response()->json(DrfPaginator::paginate($paginator, $request));
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $resource = (string) $request->route('resource');
        $cfg = $this->cfg($resource);
        if (! ($cfg['list_staff'])($request->user('api'))) {
            return response()->json(['detail' => 'You do not have permission to perform this action.'], 403);
        }

        $modelClass = $cfg['model'];
        $row = $modelClass::query()->find((int) $id);
        if ($row === null) {
            return response()->json(['detail' => 'Not found.'], 404);
        }

        $statusRules = match ($resource) {
            'contact', 'service-requests', 'partnership-inquiries', 'consultancy-requests' => 'in:new,in_progress,closed',
            'membership-applications' => 'in:pending,under_review,approved,rejected',
            'event-registrations' => 'in:registered,waitlisted,cancelled,attended',
            'training-registrations' => 'in:registered,waitlisted,cancelled,attended,certified',
            'procurement-interests' => 'in:submitted,under_review,shortlisted,declined',
            default => 'string',
        };

        $rules = [
            'status' => ['sometimes', 'required', $statusRules],
        ];
        if (in_array('staff_notes', $cfg['update_fields'] ?? [], true)) {
            $rules['staff_notes'] = ['sometimes', 'nullable', 'string'];
        }

        $data = $request->validate($rules);
        if ($data === []) {
            return response()->json(['detail' => 'No fields to update.'], 422);
        }

        if (array_key_exists('status', $data)) {
            $closedLike = in_array($data['status'], ['closed', 'approved', 'rejected', 'declined', 'attended', 'certified', 'cancelled'], true);
            if ($closedLike && Schema::hasColumn($row->getTable(), 'processed_at')) {
                $data['processed_at'] = now();
            }
        }

        $row->update($data);
        Audit::record($request->user('api'), str_replace('.create', '.update', (string) ($cfg['audit'] ?? 'intake.update')), $request->ip(), [
            'id' => $row->id,
            'resource' => $resource,
            'fields' => array_keys($data),
        ]);

        if (isset($cfg['with'])) {
            $row->load($cfg['with']);
        }

        return response()->json(($cfg['transform'])($row));
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $resource = (string) $request->route('resource');
        $cfg = $this->cfg($resource);
        if (! ($cfg['list_staff'])($request->user('api'))) {
            return response()->json(['detail' => 'You do not have permission to perform this action.'], 403);
        }

        $modelClass = $cfg['model'];
        $row = $modelClass::query()->find((int) $id);
        if ($row === null) {
            return response()->json(['detail' => 'Not found.'], 404);
        }

        $row->delete();

        return response()->json(null, 204);
    }
}

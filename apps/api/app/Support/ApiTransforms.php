<?php

namespace App\Support;

use App\Models\AccessRequest;
use App\Models\AuditEvent;
use App\Models\ConsultancyRequest;
use App\Models\ContactMessage;
use App\Models\Contribution;
use App\Models\ContributionPayment;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\GalleryItem;
use App\Models\Indicator;
use App\Models\IndicatorResult;
use App\Models\KnowledgeDocument;
use App\Models\LeadershipProfile;
use App\Models\LocaleContent;
use App\Models\MembershipApplication;
use App\Models\NewsArticle;
use App\Models\NewsletterSubscriber;
use App\Models\Notification;
use App\Models\Partner;
use App\Models\PartnershipInquiry;
use App\Models\ProcurementInterest;
use App\Models\ProcurementNotice;
use App\Models\Project;
use App\Models\ProjectMilestone;
use App\Models\Publication;
use App\Models\Risk;
use App\Models\ServiceRequest;
use App\Models\SiteStatistic;
use App\Models\StrategicKra;
use App\Models\TrainingCourse;
use App\Models\TrainingRegistration;
use App\Models\User;
use App\Models\Utility;
use App\Models\UtilityKpi;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class ApiTransforms
{
    public static function iso(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        if ($value instanceof Carbon) {
            return $value->toIso8601String();
        }

        return (string) $value;
    }

    public static function user(User $user): array
    {
        return [
            'id' => $user->id,
            'username' => $user->username,
            'email' => $user->email,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'role' => $user->role,
            'employee_id' => $user->employee_id,
            'organization' => $user->organization,
            'is_active' => (bool) $user->is_active,
            'must_change_password' => (bool) $user->must_change_password,
        ];
    }

    public static function userAdmin(User $user): array
    {
        return array_merge(self::user($user), [
            'created_at' => self::iso($user->created_at),
            'updated_at' => self::iso($user->updated_at),
            'locked_until' => self::iso($user->locked_until),
        ]);
    }

    public static function accessRequest(AccessRequest $row): array
    {
        return [
            'id' => $row->id,
            'full_name' => $row->full_name,
            'email' => $row->email,
            'organization' => $row->organization,
            'role_requested' => $row->role_requested,
            'justification' => $row->justification,
            'status' => $row->status,
            'staff_notes' => $row->staff_notes ?? '',
            'processed_at' => self::iso($row->processed_at ?? null),
            'created_at' => self::iso($row->created_at),
        ];
    }

    public static function utility(Utility $row): array
    {
        return [
            'id' => $row->id,
            'name' => $row->name,
            'slug' => $row->slug,
            'zone' => $row->zone,
            'city' => $row->city,
            'grade' => $row->grade,
            'status' => $row->status,
            'membership_status' => $row->membership_status,
            'customers' => $row->customers,
            'population_served' => $row->population_served,
            'service_type' => $row->service_type,
            'water_sources' => $row->water_sources,
            'website' => $row->website,
            'contact_email' => $row->contact_email,
            'contact_phone' => $row->contact_phone,
            'is_public' => $row->is_public,
            'updated_at' => self::iso($row->updated_at),
        ];
    }

    public static function projectMilestone(ProjectMilestone $row): array
    {
        return [
            'id' => $row->id,
            'title' => $row->title,
            'due_date' => self::iso($row->due_date),
            'status' => $row->status,
            'sort_order' => $row->sort_order,
        ];
    }

    public static function project(Project $row, bool $withMilestones = false): array
    {
        $data = [
            'id' => $row->id,
            'title' => $row->title,
            'slug' => $row->slug,
            'location' => $row->location,
            'category' => $row->category,
            'status' => $row->status,
            'progress' => $row->progress,
            'description' => $row->description,
            'objectives' => $row->objectives,
            'funding_partner' => $row->funding_partner,
            'implementing_partners' => $row->implementing_partners,
            'start_date' => self::iso($row->start_date),
            'end_date' => self::iso($row->end_date),
            'budget_visible' => $row->budget_visible,
            'contact_person' => $row->contact_person,
            'is_public' => $row->is_public,
            'updated_at' => self::iso($row->updated_at),
        ];

        if ($withMilestones) {
            $row->loadMissing('milestones');
            $data['milestones'] = $row->milestones
                ->sortBy('sort_order')
                ->values()
                ->map(fn (ProjectMilestone $m) => self::projectMilestone($m))
                ->all();
        }

        return $data;
    }

    public static function news(NewsArticle $row): array
    {
        return [
            'id' => $row->id,
            'title' => $row->title,
            'slug' => $row->slug,
            'category' => $row->category,
            'excerpt' => $row->excerpt,
            'body' => $row->body,
            'status' => $row->status,
            'featured' => $row->featured,
            'published_at' => self::iso($row->published_at),
            'updated_at' => self::iso($row->updated_at),
        ];
    }

    public static function statistic(SiteStatistic $row): array
    {
        return [
            'id' => $row->id,
            'key' => $row->key,
            'label' => $row->label,
            'value' => $row->value,
            'suffix' => $row->suffix,
            'sort_order' => $row->sort_order,
        ];
    }

    public static function publication(Publication $row): array
    {
        return [
            'id' => $row->id,
            'title' => $row->title,
            'slug' => $row->slug,
            'category' => $row->category,
            'description' => $row->description,
            'file_type' => $row->file_type,
            'file_size' => $row->file_size,
            'file_url' => $row->file_url,
            'published_at' => self::iso($row->published_at),
            'status' => $row->status,
            'is_public' => $row->is_public,
            'updated_at' => self::iso($row->updated_at),
        ];
    }

    public static function leader(LeadershipProfile $row): array
    {
        return [
            'id' => $row->id,
            'name' => $row->name,
            'role' => $row->role,
            'bio' => $row->bio,
            'photo_url' => $row->photo_url,
            'sort_order' => $row->sort_order,
            'is_public' => $row->is_public,
        ];
    }

    public static function event(Event $row): array
    {
        return [
            'id' => $row->id,
            'title' => $row->title,
            'slug' => $row->slug,
            'summary' => $row->summary,
            'location' => $row->location,
            'starts_at' => self::iso($row->starts_at),
            'ends_at' => self::iso($row->ends_at),
            'status' => $row->status,
            'is_public' => $row->is_public,
        ];
    }

    public static function gallery(GalleryItem $row): array
    {
        return [
            'id' => $row->id,
            'title' => $row->title,
            'caption' => $row->caption,
            'image_url' => $row->image_url,
            'category' => $row->category,
            'sort_order' => $row->sort_order,
        ];
    }

    public static function training(TrainingCourse $row): array
    {
        $row->loadCount([
            'registrations as registered_count' => fn ($q) => $q->where('status', '!=', 'cancelled'),
        ]);

        return [
            'id' => $row->id,
            'title' => $row->title,
            'slug' => $row->slug,
            'summary' => $row->summary,
            'topic' => $row->topic,
            'venue' => $row->venue,
            'is_online' => $row->is_online,
            'meeting_url' => $row->meeting_url,
            'starts_at' => self::iso($row->starts_at),
            'ends_at' => self::iso($row->ends_at),
            'registration_deadline' => self::iso($row->registration_deadline),
            'capacity' => $row->capacity,
            'facilitator' => $row->facilitator,
            'status' => $row->status,
            'is_public' => $row->is_public,
            'registered_count' => (int) ($row->registered_count ?? 0),
            'updated_at' => self::iso($row->updated_at),
        ];
    }

    public static function partner(Partner $row): array
    {
        return [
            'id' => $row->id,
            'name' => $row->name,
            'slug' => $row->slug,
            'category' => $row->category,
            'summary' => $row->summary,
            'website' => $row->website,
            'logo_url' => $row->logo_url,
            'sort_order' => $row->sort_order,
            'is_public' => $row->is_public,
        ];
    }

    public static function procurement(ProcurementNotice $row): array
    {
        return [
            'id' => $row->id,
            'title' => $row->title,
            'slug' => $row->slug,
            'category' => $row->category,
            'summary' => $row->summary,
            'reference_code' => $row->reference_code,
            'closing_at' => self::iso($row->closing_at),
            'document_url' => $row->document_url,
            'status' => $row->status,
            'is_public' => $row->is_public,
        ];
    }

    public static function knowledgeDoc(KnowledgeDocument $row): array
    {
        return [
            'id' => $row->id,
            'title' => $row->title,
            'slug' => $row->slug,
            'document_type' => $row->document_type,
            'topic' => $row->topic,
            'year' => $row->year,
            'language' => $row->language,
            'author' => $row->author,
            'summary' => $row->summary,
            'file_url' => $row->file_url,
            'file_type' => $row->file_type,
            'version' => $row->version,
            'download_count' => $row->download_count,
            'access_level' => $row->access_level,
            'status' => $row->status,
            'is_public' => $row->is_public,
        ];
    }

    public static function localeContent(LocaleContent $row): array
    {
        return [
            'id' => $row->id,
            'key' => $row->key,
            'locale' => $row->locale,
            'title' => $row->title,
            'body' => $row->body,
            'is_approved' => $row->is_approved,
            'updated_at' => self::iso($row->updated_at),
        ];
    }

    public static function newsletterSubscriber(NewsletterSubscriber $row): array
    {
        return [
            'id' => $row->id,
            'email' => $row->email,
            'created_at' => self::iso($row->created_at),
        ];
    }

    public static function contact(ContactMessage $row): array
    {
        return [
            'id' => $row->id,
            'name' => $row->name,
            'email' => $row->email,
            'subject' => $row->subject,
            'message' => $row->message,
            'status' => $row->status,
            'staff_notes' => $row->staff_notes ?? '',
            'processed_at' => self::iso($row->processed_at ?? null),
            'created_at' => self::iso($row->created_at),
        ];
    }

    public static function serviceRequest(ServiceRequest $row): array
    {
        return [
            'id' => $row->id,
            'name' => $row->name,
            'email' => $row->email,
            'organization' => $row->organization,
            'category' => $row->category,
            'subject' => $row->subject,
            'description' => $row->description,
            'status' => $row->status,
            'staff_notes' => $row->staff_notes ?? '',
            'processed_at' => self::iso($row->processed_at ?? null),
            'created_at' => self::iso($row->created_at),
        ];
    }

    public static function membershipApplication(MembershipApplication $row): array
    {
        return [
            'id' => $row->id,
            'organization_name' => $row->organization_name,
            'contact_name' => $row->contact_name,
            'email' => $row->email,
            'phone' => $row->phone,
            'zone' => $row->zone,
            'city' => $row->city,
            'category' => $row->category,
            'justification' => $row->justification,
            'status' => $row->status,
            'staff_notes' => $row->staff_notes ?? '',
            'processed_at' => self::iso($row->processed_at ?? null),
            'created_at' => self::iso($row->created_at),
        ];
    }

    public static function eventRegistration(EventRegistration $row): array
    {
        $row->loadMissing('event');

        return [
            'id' => $row->id,
            'event_id' => $row->event_id,
            'event_title' => $row->event?->title ?? '',
            'name' => $row->name,
            'email' => $row->email,
            'organization' => $row->organization,
            'phone' => $row->phone,
            'status' => $row->status,
            'staff_notes' => $row->staff_notes ?? '',
            'processed_at' => self::iso($row->processed_at ?? null),
            'created_at' => self::iso($row->created_at),
        ];
    }

    public static function trainingRegistration(TrainingRegistration $row): array
    {
        $row->loadMissing('course');

        return [
            'id' => $row->id,
            'course_id' => $row->course_id,
            'course_title' => $row->course?->title ?? '',
            'name' => $row->name,
            'email' => $row->email,
            'organization' => $row->organization,
            'phone' => $row->phone,
            'status' => $row->status,
            'staff_notes' => $row->staff_notes ?? '',
            'processed_at' => self::iso($row->processed_at ?? null),
            'created_at' => self::iso($row->created_at),
        ];
    }

    public static function partnershipInquiry(PartnershipInquiry $row): array
    {
        return [
            'id' => $row->id,
            'organization' => $row->organization,
            'contact_name' => $row->contact_name,
            'email' => $row->email,
            'partnership_interest' => $row->partnership_interest,
            'message' => $row->message,
            'status' => $row->status,
            'staff_notes' => $row->staff_notes ?? '',
            'processed_at' => self::iso($row->processed_at ?? null),
            'created_at' => self::iso($row->created_at),
        ];
    }

    public static function procurementInterest(ProcurementInterest $row): array
    {
        $row->loadMissing('notice');

        return [
            'id' => $row->id,
            'notice_id' => $row->notice_id,
            'notice_title' => $row->notice?->title ?? '',
            'organization' => $row->organization,
            'contact_name' => $row->contact_name,
            'email' => $row->email,
            'phone' => $row->phone,
            'message' => $row->message,
            'status' => $row->status,
            'staff_notes' => $row->staff_notes ?? '',
            'processed_at' => self::iso($row->processed_at ?? null),
            'created_at' => self::iso($row->created_at),
        ];
    }

    public static function consultancyRequest(ConsultancyRequest $row): array
    {
        return [
            'id' => $row->id,
            'name' => $row->name,
            'email' => $row->email,
            'organization' => $row->organization,
            'category' => $row->category,
            'subject' => $row->subject,
            'description' => $row->description,
            'status' => $row->status,
            'staff_notes' => $row->staff_notes ?? '',
            'processed_at' => self::iso($row->processed_at ?? null),
            'created_at' => self::iso($row->created_at),
        ];
    }

    public static function risk(Risk $row): array
    {
        return [
            'id' => $row->id,
            'title' => $row->title,
            'category' => $row->category,
            'description' => $row->description,
            'probability' => $row->probability,
            'impact' => $row->impact,
            'rating' => $row->rating,
            'mitigation' => $row->mitigation,
            'residual_risk' => $row->residual_risk,
            'owner' => $row->owner,
            'due_date' => self::iso($row->due_date),
            'review_status' => $row->review_status,
            'updated_at' => self::iso($row->updated_at),
        ];
    }

    public static function indicator(Indicator $row): array
    {
        $row->loadMissing('kra');

        return [
            'id' => $row->id,
            'kra' => $row->kra_id,
            'kra_code' => $row->kra?->code,
            'kra_title' => $row->kra?->title,
            'code' => $row->code,
            'title' => $row->title,
            'description' => $row->description,
            'unit' => $row->unit,
            'baseline' => (string) $row->baseline,
            'annual_target' => (string) $row->annual_target,
            'frequency' => $row->frequency,
            'responsible_officer' => $row->responsible_officer,
            'is_active' => $row->is_active,
        ];
    }

    public static function strategicKra(StrategicKra $row): array
    {
        $row->loadMissing('indicators');

        return [
            'id' => $row->id,
            'code' => $row->code,
            'title' => $row->title,
            'objective' => $row->objective,
            'sort_order' => $row->sort_order,
            'is_active' => $row->is_active,
            'indicators' => $row->indicators->map(fn (Indicator $i) => [
                'id' => $i->id,
                'code' => $i->code,
                'title' => $i->title,
                'unit' => $i->unit,
                'baseline' => (string) $i->baseline,
                'annual_target' => (string) $i->annual_target,
                'frequency' => $i->frequency,
                'responsible_officer' => $i->responsible_officer,
            ])->values()->all(),
        ];
    }

    public static function indicatorResult(IndicatorResult $row): array
    {
        $row->loadMissing('indicator');

        return [
            'id' => $row->id,
            'indicator' => $row->indicator_id,
            'indicator_code' => $row->indicator?->code,
            'indicator_title' => $row->indicator?->title,
            'annual_target' => (string) ($row->indicator?->annual_target ?? 0),
            'period_label' => $row->period_label,
            'period_start' => self::iso($row->period_start),
            'period_end' => self::iso($row->period_end),
            'actual_value' => (string) $row->actual_value,
            'variance_notes' => $row->variance_notes,
            'evidence_url' => $row->evidence_url,
            'status' => $row->status,
            'created_at' => self::iso($row->created_at),
            'updated_at' => self::iso($row->updated_at),
        ];
    }

    public static function utilityKpi(UtilityKpi $row): array
    {
        $row->loadMissing('utility');

        return [
            'id' => $row->id,
            'utility' => $row->utility_id,
            'utility_name' => $row->utility?->name ?? '',
            'utility_slug' => $row->utility?->slug ?? '',
            'zone' => $row->utility?->zone ?? '',
            'period_label' => $row->period_label,
            'period_start' => self::iso($row->period_start),
            'period_end' => self::iso($row->period_end),
            'water_production_m3' => $row->water_production_m3 !== null ? (string) $row->water_production_m3 : null,
            'nrw_percent' => $row->nrw_percent !== null ? (string) $row->nrw_percent : null,
            'meter_coverage_percent' => $row->meter_coverage_percent !== null ? (string) $row->meter_coverage_percent : null,
            'billing_efficiency_percent' => $row->billing_efficiency_percent !== null ? (string) $row->billing_efficiency_percent : null,
            'collection_efficiency_percent' => $row->collection_efficiency_percent !== null ? (string) $row->collection_efficiency_percent : null,
            'service_coverage_percent' => $row->service_coverage_percent !== null ? (string) $row->service_coverage_percent : null,
            'water_quality_compliance_percent' => $row->water_quality_compliance_percent !== null ? (string) $row->water_quality_compliance_percent : null,
            'customer_complaints' => $row->customer_complaints,
            'notes' => $row->notes,
            'status' => $row->status,
            'created_at' => self::iso($row->created_at),
            'updated_at' => self::iso($row->updated_at),
        ];
    }

    public static function notification(Notification $row): array
    {
        return [
            'id' => $row->id,
            'title' => $row->title,
            'body' => $row->body,
            'level' => $row->level,
            'link' => $row->link,
            'is_read' => $row->is_read,
            'created_at' => self::iso($row->created_at),
        ];
    }

    public static function contribution(Contribution $row): array
    {
        $row->loadMissing(['utility', 'payments']);

        return [
            'id' => $row->id,
            'utility' => $row->utility_id,
            'utility_name' => $row->utility?->name ?? '',
            'organization_name' => $row->organization_name,
            'invoice_number' => $row->invoice_number,
            'period_label' => $row->period_label,
            'amount' => (string) $row->amount,
            'amount_paid' => (string) $row->amount_paid,
            'balance' => $row->balance,
            'currency' => $row->currency,
            'issued_at' => self::iso($row->issued_at),
            'due_at' => self::iso($row->due_at),
            'status' => $row->status,
            'notes' => $row->notes,
            'attachment_url' => $row->attachment_url ?? '',
            'attachment_name' => $row->attachment_name ?? '',
            'payments' => $row->payments
                ->sortByDesc('id')
                ->values()
                ->map(fn (ContributionPayment $payment) => self::contributionPayment($payment))
                ->all(),
            'created_at' => self::iso($row->created_at),
            'updated_at' => self::iso($row->updated_at),
        ];
    }

    public static function contributionPayment(ContributionPayment $row): array
    {
        return [
            'id' => $row->id,
            'contribution_id' => $row->contribution_id,
            'amount' => (string) $row->amount,
            'paid_at' => self::iso($row->paid_at),
            'reference' => $row->reference ?? '',
            'method' => $row->method ?? '',
            'notes' => $row->notes ?? '',
            'receipt_url' => $row->receipt_url ?? '',
            'receipt_name' => $row->receipt_name ?? '',
            'status' => $row->status ?? 'approved',
            'submitted_by' => $row->submitted_by_id,
            'reviewed_by' => $row->reviewed_by_id,
            'reviewed_at' => self::iso($row->reviewed_at),
            'review_notes' => $row->review_notes ?? '',
            'created_at' => self::iso($row->created_at),
        ];
    }

    public static function auditEvent(AuditEvent $row): array
    {
        $row->loadMissing('actor');

        return [
            'id' => $row->id,
            'action' => $row->action,
            'entity_type' => $row->entity_type,
            'entity_id' => $row->entity_id,
            'actor_email' => $row->actor?->email,
            'ip_address' => $row->ip_address,
            'metadata' => $row->metadata ?? [],
            'created_at' => self::iso($row->created_at),
        ];
    }

    public static function mapModel(Model $model, callable $transformer): array
    {
        return $transformer($model);
    }
}

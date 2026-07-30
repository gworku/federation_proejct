<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\Concerns\HandlesCrud;
use App\Models\Event;
use App\Models\GalleryItem;
use App\Models\KnowledgeDocument;
use App\Models\LeadershipProfile;
use App\Models\LocaleContent;
use App\Models\NewsArticle;
use App\Models\NewsletterSubscriber;
use App\Models\Partner;
use App\Models\ProcurementNotice;
use App\Models\Publication;
use App\Models\SiteStatistic;
use App\Models\TrainingCourse;
use App\Models\User;
use App\Support\ApiTransforms;
use App\Support\Audit;
use App\Support\DrfPaginator;
use App\Support\Roles;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CmsResourceController extends Controller
{
    use HandlesCrud;

    /** @var array<string, array<string, mixed>> */
    private array $resources = [];

    public function __construct()
    {
        $this->resources = [
            'news' => [
                'model' => NewsArticle::class,
                'lookup' => 'slug',
                'transform' => fn (NewsArticle $row) => ApiTransforms::news($row),
                'fillable' => ['title', 'slug', 'category', 'excerpt', 'body', 'status', 'featured', 'published_at'],
                'search' => ['title', 'excerpt', 'category', 'body'],
                'order' => ['published_at', 'desc'],
                'public' => fn (Builder $q, Request $r) => $q->where('status', 'published'),
                'staff' => fn (?User $u, string $m) => Roles::isContentEditorOrAdmin($u, $m),
                'staff_roles' => ['administrator', 'content_editor', 'management'],
                'published_field' => 'status',
                'published_value' => 'published',
            ],
            'statistics' => [
                'model' => SiteStatistic::class,
                'lookup' => 'key',
                'transform' => fn (SiteStatistic $row) => ApiTransforms::statistic($row),
                'fillable' => ['key', 'label', 'value', 'suffix', 'sort_order', 'is_public'],
                'search' => [],
                'order' => ['sort_order', 'asc'],
                'public' => fn (Builder $q) => $q->where('is_public', true),
                'staff' => fn (?User $u, string $m) => Roles::isContentEditorOrAdmin($u, $m),
            ],
            'publications' => [
                'model' => Publication::class,
                'lookup' => 'slug',
                'transform' => fn (Publication $row) => ApiTransforms::publication($row),
                'fillable' => ['title', 'slug', 'category', 'description', 'file_type', 'file_size', 'file_url', 'published_at', 'status', 'is_public'],
                'search' => ['title', 'description', 'category'],
                'order' => ['published_at', 'desc'],
                'public' => fn (Builder $q) => $q->where('status', 'published')->where('is_public', true),
                'staff' => fn (?User $u, string $m) => Roles::isContentEditorOrAdmin($u, $m),
                'staff_roles' => ['administrator', 'content_editor', 'management'],
            ],
            'leadership' => [
                'model' => LeadershipProfile::class,
                'lookup' => 'id',
                'transform' => fn (LeadershipProfile $row) => ApiTransforms::leader($row),
                'fillable' => ['name', 'role', 'bio', 'photo_url', 'sort_order', 'is_public'],
                'search' => [],
                'order' => ['sort_order', 'asc'],
                'public' => fn (Builder $q) => $q->where('is_public', true),
                'staff' => fn (?User $u, string $m) => Roles::isContentEditorOrAdmin($u, $m),
            ],
            'events' => [
                'model' => Event::class,
                'lookup' => 'slug',
                'transform' => fn (Event $row) => ApiTransforms::event($row),
                'fillable' => ['title', 'slug', 'summary', 'location', 'starts_at', 'ends_at', 'status', 'is_public'],
                'search' => ['title', 'summary', 'location'],
                'order' => ['starts_at', 'asc'],
                'public' => fn (Builder $q) => $q->where('status', 'published')->where('is_public', true),
                'staff' => fn (?User $u, string $m) => Roles::isContentEditorOrAdmin($u, $m),
                'staff_roles' => ['administrator', 'content_editor', 'management'],
            ],
            'gallery' => [
                'model' => GalleryItem::class,
                'lookup' => 'id',
                'transform' => fn (GalleryItem $row) => ApiTransforms::gallery($row),
                'fillable' => ['title', 'caption', 'image_url', 'category', 'sort_order', 'is_public'],
                'search' => [],
                'order' => ['sort_order', 'asc'],
                'public' => fn (Builder $q) => $q->where('is_public', true),
                'staff' => fn (?User $u, string $m) => Roles::isContentEditorOrAdmin($u, $m),
            ],
            'training' => [
                'model' => TrainingCourse::class,
                'lookup' => 'slug',
                'transform' => fn (TrainingCourse $row) => ApiTransforms::training($row),
                'fillable' => ['title', 'slug', 'summary', 'topic', 'venue', 'is_online', 'meeting_url', 'starts_at', 'ends_at', 'registration_deadline', 'capacity', 'facilitator', 'status', 'is_public'],
                'search' => [],
                'order' => ['starts_at', 'asc'],
                'public' => fn (Builder $q) => $q->where('is_public', true)->whereIn('status', ['open', 'full', 'closed', 'completed']),
                'staff' => fn (?User $u, string $m) => Roles::isContentEditorOrAdmin($u, $m),
                'staff_roles' => ['administrator', 'content_editor', 'management', 'project_officer'],
            ],
            'partners' => [
                'model' => Partner::class,
                'lookup' => 'slug',
                'transform' => fn (Partner $row) => ApiTransforms::partner($row),
                'fillable' => ['name', 'slug', 'category', 'summary', 'website', 'logo_url', 'sort_order', 'is_public'],
                'search' => [],
                'order' => ['sort_order', 'asc'],
                'public' => fn (Builder $q) => $q->where('is_public', true),
                'staff' => fn (?User $u, string $m) => Roles::isContentEditorOrAdmin($u, $m),
            ],
            'procurement' => [
                'model' => ProcurementNotice::class,
                'lookup' => 'slug',
                'transform' => fn (ProcurementNotice $row) => ApiTransforms::procurement($row),
                'fillable' => ['title', 'slug', 'category', 'summary', 'reference_code', 'closing_at', 'document_url', 'status', 'is_public'],
                'search' => [],
                'order' => ['closing_at', 'desc'],
                'public' => fn (Builder $q) => $q->where('is_public', true)->whereIn('status', ['open', 'closed', 'awarded']),
                'staff' => fn (?User $u, string $m) => Roles::isProcurementNoticeStaff($u, $m),
                'staff_roles' => ['administrator', 'management', 'procurement_officer', 'content_editor'],
            ],
            'knowledge-docs' => [
                'model' => KnowledgeDocument::class,
                'lookup' => 'slug',
                'transform' => fn (KnowledgeDocument $row) => ApiTransforms::knowledgeDoc($row),
                'fillable' => ['title', 'slug', 'document_type', 'topic', 'year', 'language', 'author', 'summary', 'file_url', 'file_type', 'version', 'access_level', 'status', 'is_public'],
                'search' => ['title', 'summary'],
                'order' => ['title', 'asc'],
                'public' => fn (Builder $q) => $q->where('status', 'published')->where('is_public', true)->where('access_level', 'public'),
                'staff' => fn (?User $u, string $m) => Roles::isContentEditorOrAdmin($u, $m),
                'staff_roles' => ['administrator', 'management', 'content_editor', 'project_officer'],
                'filters' => ['document_type', 'topic', 'language', 'year'],
            ],
            'locale-content' => [
                'model' => LocaleContent::class,
                'lookup' => 'id',
                'transform' => fn (LocaleContent $row) => ApiTransforms::localeContent($row),
                'fillable' => ['key', 'locale', 'title', 'body', 'is_approved'],
                'search' => [],
                'order' => ['key', 'asc'],
                'public' => fn (Builder $q) => $q->where('is_approved', true),
                'staff' => fn (?User $u, string $m) => Roles::isContentEditorOrAdmin($u, $m),
                'staff_roles' => ['administrator', 'content_editor', 'management'],
            ],
            'newsletter-subscribers' => [
                'model' => NewsletterSubscriber::class,
                'lookup' => 'id',
                'transform' => fn (NewsletterSubscriber $row) => ApiTransforms::newsletterSubscriber($row),
                'fillable' => [],
                'search' => [],
                'order' => ['created_at', 'desc'],
                'public' => null,
                'staff' => fn (?User $u, string $m) => Roles::isContentInboxStaff($u),
                'read_only' => true,
            ],
        ];
    }

    private function configure(string $resource): bool
    {
        if (! isset($this->resources[$resource])) {
            return false;
        }

        $cfg = $this->resources[$resource];
        $this->modelClass = $cfg['model'];
        $this->lookupField = $cfg['lookup'];
        $this->fillable = $cfg['fillable'];
        $this->searchFields = $cfg['search'];
        $this->defaultOrderBy = $cfg['order'][0];
        $this->defaultOrderDirection = $cfg['order'][1];
        $this->transform = $cfg['transform'];
        $this->publicScope = $cfg['public'] ?? null;
        $this->staffWriteCheck = $cfg['staff'];

        return true;
    }

    private function isStaffUser(?User $user, array $cfg): bool
    {
        if ($user === null) {
            return false;
        }
        if ($user->is_superuser) {
            return true;
        }
        $roles = $cfg['staff_roles'] ?? ['administrator', 'content_editor', 'management'];

        return in_array($user->role, $roles, true);
    }

    protected function baseQuery(Request $request): Builder
    {
        $resource = (string) $request->route('resource');
        $this->configure($resource);
        $cfg = $this->resources[$resource];

        /** @var Builder $query */
        $query = ($this->modelClass)::query();
        $user = $request->user('api');

        if ($user === null || ! $this->isStaffUser($user, $cfg)) {
            if ($this->publicScope !== null) {
                ($this->publicScope)($query, $request);
            }
        }

        if ($resource === 'locale-content') {
            if ($locale = $request->query('locale')) {
                $query->where('locale', $locale);
            }
            if ($key = $request->query('key')) {
                $query->where('key', $key);
            }
        }

        if ($resource === 'knowledge-docs') {
            foreach (['document_type', 'topic', 'language', 'year'] as $field) {
                if ($value = $request->query($field)) {
                    $query->where($field, $value);
                }
            }
        }

        if ($this->searchFields !== []) {
            $term = trim((string) $request->query('search', $request->query('q', '')));
            if ($term !== '') {
                $query->where(function (Builder $inner) use ($term): void {
                    foreach ($this->searchFields as $index => $field) {
                        if ($index === 0) {
                            $inner->where($field, 'like', '%'.$term.'%');
                        } else {
                            $inner->orWhere($field, 'like', '%'.$term.'%');
                        }
                    }
                });
            }
        }

        return $query->orderBy($this->defaultOrderBy, $this->defaultOrderDirection);
    }

    public function index(Request $request, string $resource): JsonResponse
    {
        if (! $this->configure($resource)) {
            return response()->json(['detail' => 'Not found.'], 404);
        }

        if ($resource === 'newsletter-subscribers' && ! Roles::isContentInboxStaff($request->user('api'))) {
            return response()->json(['detail' => 'You do not have permission to perform this action.'], 403);
        }

        return $this->crudIndex($request);
    }

    public function store(Request $request, string $resource): JsonResponse
    {
        if (! $this->configure($resource)) {
            return response()->json(['detail' => 'Not found.'], 404);
        }

        $cfg = $this->resources[$resource];
        if (! empty($cfg['read_only'])) {
            return response()->json(['detail' => 'You do not have permission to perform this action.'], 403);
        }

        $this->applyEditorialStatusGate($request, $resource);

        $response = $this->crudStore($request);
        if ($response->getStatusCode() === 201 && $resource === 'news') {
            Audit::record($request->user('api'), 'cms.news.create', $request->ip(), [
                'slug' => $response->getData(true)['slug'] ?? null,
            ]);
        }

        return $response;
    }

    public function show(Request $request, string $resource, string $key): JsonResponse
    {
        if (! $this->configure($resource)) {
            return response()->json(['detail' => 'Not found.'], 404);
        }

        if ($resource === 'newsletter-subscribers' && ! Roles::isContentInboxStaff($request->user('api'))) {
            return response()->json(['detail' => 'You do not have permission to perform this action.'], 403);
        }

        return $this->crudShow($request, $key);
    }

    public function update(Request $request, string $resource, string $key): JsonResponse
    {
        if (! $this->configure($resource)) {
            return response()->json(['detail' => 'Not found.'], 404);
        }

        $cfg = $this->resources[$resource];
        if (! empty($cfg['read_only'])) {
            return response()->json(['detail' => 'You do not have permission to perform this action.'], 403);
        }

        $this->applyEditorialStatusGate($request, $resource);

        $response = $this->crudUpdate($request, $key);
        if ($response->getStatusCode() === 200 && $resource === 'news') {
            Audit::record($request->user('api'), 'cms.news.update', $request->ip(), [
                'slug' => $response->getData(true)['slug'] ?? $key,
            ]);
        }

        return $response;
    }

    public function destroy(Request $request, string $resource, string $key): JsonResponse
    {
        if (! $this->configure($resource)) {
            return response()->json(['detail' => 'Not found.'], 404);
        }

        if ($resource === 'newsletter-subscribers' && ! Roles::isContentInboxStaff($request->user('api'))) {
            return response()->json(['detail' => 'You do not have permission to perform this action.'], 403);
        }

        if ($resource === 'news') {
            Audit::record($request->user('api'), 'cms.news.delete', $request->ip(), ['slug' => $key]);
        }

        return $this->crudDestroy($request, $key);
    }

    protected function storeRules(Request $request): array
    {
        $resource = (string) $request->route('resource');

        return match ($resource) {
            'news' => [
                'title' => ['required', 'string', 'max:255'],
                'slug' => ['required', 'string', 'max:255', 'unique:news_articles,slug'],
                'category' => ['required', 'string', 'max:120'],
                'excerpt' => ['required', 'string'],
                'body' => ['nullable', 'string'],
                'status' => ['nullable', 'in:draft,pending_review,published,archived'],
                'featured' => ['nullable', 'boolean'],
                'published_at' => ['nullable', 'date'],
            ],
            'events' => [
                'title' => ['required', 'string', 'max:255'],
                'slug' => ['required', 'string', 'max:255', 'unique:events,slug'],
                'summary' => ['required', 'string'],
                'location' => ['required', 'string', 'max:255'],
                'starts_at' => ['required', 'date'],
                'status' => ['nullable', 'in:draft,pending_review,published,cancelled'],
            ],
            'statistics' => [
                'key' => ['required', 'string', 'max:120', 'unique:site_statistics,key'],
                'label' => ['required', 'string', 'max:120'],
                'value' => ['required', 'integer', 'min:0'],
            ],
            'gallery' => [
                'title' => ['required', 'string', 'max:255'],
                'image_url' => ['required', 'string', 'max:500', 'regex:/^(\/|https?:\/\/).+/i'],
                'caption' => ['nullable', 'string'],
                'category' => ['nullable', 'string', 'max:120'],
                'sort_order' => ['nullable', 'integer', 'min:0'],
                'is_public' => ['nullable', 'boolean'],
            ],
            'leadership' => [
                'name' => ['required', 'string', 'max:255'],
                'role' => ['required', 'string', 'max:255'],
                'bio' => ['nullable', 'string'],
                'photo_url' => ['nullable', 'string', 'max:500'],
                'sort_order' => ['nullable', 'integer', 'min:0'],
                'is_public' => ['nullable', 'boolean'],
            ],
            'partners' => [
                'name' => ['required', 'string', 'max:255'],
                'slug' => ['required', 'string', 'max:255'],
                'category' => ['nullable', 'string', 'max:32'],
                'summary' => ['nullable', 'string'],
                'website' => ['nullable', 'string', 'max:255'],
                'logo_url' => ['nullable', 'string', 'max:500'],
                'sort_order' => ['nullable', 'integer', 'min:0'],
                'is_public' => ['nullable', 'boolean'],
            ],
            'publications' => [
                'title' => ['required', 'string', 'max:255'],
                'slug' => ['required', 'string', 'max:255'],
                'category' => ['nullable', 'string', 'max:120'],
                'description' => ['nullable', 'string', 'max:10000'],
                'file_type' => ['nullable', 'string', 'max:40'],
                'file_size' => ['nullable', 'string', 'max:40'],
                'file_url' => ['nullable', 'string', 'max:500'],
                'published_at' => ['nullable', 'date'],
                'status' => ['nullable', 'in:draft,pending_review,published,archived'],
                'is_public' => ['nullable', 'boolean'],
            ],
            'training' => [
                'title' => ['required', 'string', 'max:255'],
                'slug' => ['required', 'string', 'max:255'],
                'summary' => ['required', 'string', 'max:5000'],
                'location' => ['nullable', 'string', 'max:255'],
                'starts_at' => ['nullable', 'date'],
                'ends_at' => ['nullable', 'date'],
                'capacity' => ['nullable', 'integer', 'min:1', 'max:10000'],
                'status' => ['nullable', 'in:draft,pending_review,published,cancelled'],
                'is_public' => ['nullable', 'boolean'],
            ],
            'procurement' => [
                'title' => ['required', 'string', 'max:255'],
                'slug' => ['required', 'string', 'max:255'],
                'summary' => ['required', 'string', 'max:10000'],
                'reference_code' => ['nullable', 'string', 'max:64'],
                'closing_at' => ['nullable', 'date'],
                'document_url' => ['nullable', 'string', 'max:500'],
                'status' => ['nullable', 'in:draft,pending_review,published,closed,cancelled'],
                'is_public' => ['nullable', 'boolean'],
            ],
            'knowledge-docs' => [
                'title' => ['required', 'string', 'max:255'],
                'slug' => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string', 'max:10000'],
                'file_url' => ['nullable', 'string', 'max:500'],
                'file_type' => ['nullable', 'string', 'max:40'],
                'access_level' => ['nullable', 'in:public,members,staff'],
                'status' => ['nullable', 'in:draft,pending_review,published,archived'],
                'is_public' => ['nullable', 'boolean'],
            ],
            'locale-content' => [
                'key' => ['required', 'string', 'max:120'],
                'locale' => ['required', 'string', 'max:8'],
                'title' => ['nullable', 'string', 'max:255'],
                'body' => ['nullable', 'string', 'max:20000'],
            ],
            default => collect($this->fillable)
                ->mapWithKeys(fn (string $field) => [$field => ['nullable', 'string', 'max:5000']])
                ->all(),
        };
    }

    /** @return array<string, mixed> */
    protected function updateRules(Request $request, Model $model): array
    {
        $rules = $this->storeRules($request);
        $resource = (string) $request->route('resource');

        if ($resource === 'news' && isset($rules['slug'])) {
            $rules['slug'] = [
                'sometimes',
                'string',
                'max:255',
                'unique:news_articles,slug,'.$model->getKey(),
            ];
        }

        if ($resource === 'events' && isset($rules['slug'])) {
            $rules['slug'] = [
                'sometimes',
                'string',
                'max:255',
                'unique:events,slug,'.$model->getKey(),
            ];
        }

        if ($resource === 'publications' && isset($rules['slug'])) {
            $rules['slug'] = [
                'sometimes',
                'string',
                'max:255',
                'unique:publications,slug,'.$model->getKey(),
            ];
        }

        foreach ($rules as $field => $rule) {
            if (is_array($rule) && ($rule[0] ?? null) === 'required') {
                $rules[$field] = array_merge(['sometimes'], array_slice($rule, 1));
            }
        }

        return $rules;
    }

    /**
     * Content editors may submit for review; only administrator/management may publish.
     */
    protected function applyEditorialStatusGate(Request $request, string $resource): void
    {
        if (! in_array($resource, ['news', 'events', 'publications'], true)) {
            return;
        }

        $status = $request->input('status');
        if ($status !== 'published') {
            return;
        }

        $user = $request->user('api');
        $canPublish = Roles::isAdministrator($user)
            || Roles::roleOk($user, [Roles::MANAGEMENT]);

        if (! $canPublish) {
            $request->merge(['status' => 'pending_review']);
        }
    }

    public function downloadKnowledgeDoc(Request $request, string $slug): JsonResponse
    {
        $doc = KnowledgeDocument::query()->where('slug', $slug)->first();
        if ($doc === null) {
            return response()->json(['detail' => 'Not found.'], 404);
        }

        $user = $request->user('api');
        $isStaff = Roles::roleOk($user, [
            Roles::ADMINISTRATOR,
            Roles::MANAGEMENT,
            Roles::CONTENT_EDITOR,
            Roles::PROJECT_OFFICER,
        ]);

        if ($doc->status !== 'published' && ! $isStaff) {
            return response()->json(['detail' => 'Not found.'], 404);
        }

        if ($doc->access_level === 'staff' && ! $isStaff) {
            return response()->json([
                'detail' => $user ? 'You do not have permission to download this document.' : 'Authentication required.',
            ], $user ? 403 : 401);
        }

        if ($doc->access_level === 'members' && $user === null) {
            return response()->json(['detail' => 'Authentication required.'], 401);
        }

        if ($doc->access_level === 'public' && ! $doc->is_public && ! $isStaff) {
            return response()->json(['detail' => 'Not found.'], 404);
        }

        $doc->increment('download_count');

        return response()->json([
            'slug' => $doc->slug,
            'file_url' => $doc->file_url,
            'download_count' => $doc->download_count,
        ]);
    }

    public function subscribeNewsletter(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);
        $email = strtolower(trim($data['email']));

        $subscriber = NewsletterSubscriber::query()->firstOrCreate(
            ['email' => $email],
            ['is_active' => true]
        );

        $created = $subscriber->wasRecentlyCreated;
        if (! $created && ! $subscriber->is_active) {
            $subscriber->is_active = true;
            $subscriber->save();
        }

        Audit::record(null, 'newsletter.subscribe', $request->ip(), [
            'email' => $email,
            'created' => $created,
        ]);

        return response()->json([
            'detail' => 'Subscribed successfully.',
            'email' => $email,
        ], $created ? 201 : 200);
    }
}

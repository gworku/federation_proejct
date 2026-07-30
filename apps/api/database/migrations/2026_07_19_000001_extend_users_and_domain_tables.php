<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->nullable()->unique()->after('id');
            $table->string('first_name')->default('')->after('name');
            $table->string('last_name')->default('')->after('first_name');
            $table->string('role', 32)->default('utility_user')->after('email');
            $table->string('employee_id', 64)->default('')->after('role');
            $table->string('organization')->default('')->after('employee_id');
            $table->unsignedInteger('failed_login_attempts')->default(0)->after('organization');
            $table->timestamp('locked_until')->nullable()->after('failed_login_attempts');
            $table->boolean('is_superuser')->default(false)->after('locked_until');
            $table->boolean('is_staff')->default(false)->after('is_superuser');
            $table->boolean('is_active')->default(true)->after('is_staff');
        });

        Schema::create('access_requests', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->string('email');
            $table->string('organization');
            $table->string('role_requested');
            $table->text('justification');
            $table->string('status', 20)->default('pending');
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('utilities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('zone', 120);
            $table->string('city', 120);
            $table->string('grade', 64);
            $table->string('status', 32)->default('Active');
            $table->string('membership_status', 20)->default('active');
            $table->unsignedInteger('customers')->nullable();
            $table->unsignedInteger('population_served')->nullable();
            $table->string('service_type', 120)->default('Water supply');
            $table->string('water_sources')->default('');
            $table->string('website')->default('');
            $table->string('contact_email')->default('');
            $table->string('contact_phone', 64)->default('');
            $table->boolean('is_public')->default(true);
            $table->timestamps();
        });

        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('location');
            $table->string('category', 120);
            $table->string('status', 32)->default('Planning');
            $table->unsignedInteger('progress')->default(0);
            $table->text('description')->nullable();
            $table->text('objectives')->nullable();
            $table->string('funding_partner')->default('');
            $table->text('implementing_partners')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->boolean('budget_visible')->default(false);
            $table->string('contact_person')->default('');
            $table->boolean('is_public')->default(true);
            $table->timestamps();
        });

        Schema::create('project_milestones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->string('title');
            $table->date('due_date')->nullable();
            $table->string('status', 20)->default('pending');
            $table->unsignedInteger('sort_order')->default(0);
        });

        Schema::create('news_articles', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('category', 120);
            $table->text('excerpt');
            $table->text('body')->nullable();
            $table->string('status', 20)->default('draft');
            $table->boolean('featured')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('site_statistics', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('label', 120);
            $table->unsignedInteger('value')->default(0);
            $table->string('suffix', 16)->default('');
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_public')->default(true);
        });

        Schema::create('publications', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('category', 120);
            $table->text('description')->nullable();
            $table->string('file_type', 20)->default('PDF');
            $table->string('file_size', 40)->default('');
            $table->string('file_url')->default('');
            $table->date('published_at')->nullable();
            $table->string('status', 20)->default('draft');
            $table->boolean('is_public')->default(true);
            $table->timestamps();
        });

        Schema::create('contact_messages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('subject');
            $table->text('message');
            $table->string('status', 20)->default('new');
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('service_requests', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('organization');
            $table->string('category', 32)->default('other');
            $table->string('subject');
            $table->text('description');
            $table->string('status', 20)->default('new');
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('leadership_profiles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('role');
            $table->text('bio')->nullable();
            $table->string('photo_url', 500)->default('');
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_public')->default(true);
        });

        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('summary');
            $table->string('location');
            $table->timestamp('starts_at');
            $table->timestamp('ends_at')->nullable();
            $table->string('status', 20)->default('draft');
            $table->boolean('is_public')->default(true);
            $table->timestamps();
        });

        Schema::create('gallery_items', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('caption')->nullable();
            $table->string('image_url', 500);
            $table->string('category', 120)->default('');
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_public')->default(true);
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('newsletter_subscribers', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('membership_applications', function (Blueprint $table) {
            $table->id();
            $table->string('organization_name');
            $table->string('contact_name');
            $table->string('email');
            $table->string('phone', 64)->default('');
            $table->string('zone', 120)->default('');
            $table->string('city', 120)->default('');
            $table->string('category', 20)->default('full');
            $table->text('justification');
            $table->string('status', 20)->default('pending');
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('event_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->string('name');
            $table->string('email');
            $table->string('organization')->default('');
            $table->string('phone', 64)->default('');
            $table->string('status', 20)->default('registered');
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['event_id', 'email']);
        });

        Schema::create('training_courses', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('summary');
            $table->string('topic', 120);
            $table->string('venue')->default('');
            $table->boolean('is_online')->default(false);
            $table->string('meeting_url')->default('');
            $table->timestamp('starts_at');
            $table->timestamp('ends_at')->nullable();
            $table->timestamp('registration_deadline')->nullable();
            $table->unsignedInteger('capacity')->default(40);
            $table->string('facilitator')->default('');
            $table->string('status', 20)->default('draft');
            $table->boolean('is_public')->default(true);
            $table->timestamps();
        });

        Schema::create('training_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('training_courses')->cascadeOnDelete();
            $table->string('name');
            $table->string('email');
            $table->string('organization')->default('');
            $table->string('phone', 64)->default('');
            $table->string('status', 20)->default('registered');
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['course_id', 'email']);
        });

        Schema::create('partners', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('category', 32)->default('other');
            $table->text('summary')->nullable();
            $table->string('website')->default('');
            $table->string('logo_url', 500)->default('');
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_public')->default(true);
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('partnership_inquiries', function (Blueprint $table) {
            $table->id();
            $table->string('organization');
            $table->string('contact_name');
            $table->string('email');
            $table->string('partnership_interest');
            $table->text('message');
            $table->string('status', 20)->default('new');
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('procurement_notices', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('category', 120);
            $table->text('summary');
            $table->string('reference_code', 64)->default('');
            $table->timestamp('closing_at')->nullable();
            $table->string('document_url')->default('');
            $table->string('status', 20)->default('draft');
            $table->boolean('is_public')->default(true);
            $table->timestamps();
        });

        Schema::create('procurement_interests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('notice_id')->constrained('procurement_notices')->cascadeOnDelete();
            $table->string('organization');
            $table->string('contact_name');
            $table->string('email');
            $table->string('phone', 64)->default('');
            $table->text('message')->nullable();
            $table->string('status', 20)->default('submitted');
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('knowledge_documents', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('document_type', 120);
            $table->string('topic', 120)->default('');
            $table->unsignedInteger('year')->nullable();
            $table->string('language', 16)->default('en');
            $table->string('author')->default('');
            $table->text('summary')->nullable();
            $table->string('file_url')->default('');
            $table->string('file_type', 20)->default('PDF');
            $table->string('version', 32)->default('1.0');
            $table->unsignedInteger('download_count')->default(0);
            $table->string('access_level', 20)->default('public');
            $table->string('status', 20)->default('draft');
            $table->boolean('is_public')->default(true);
            $table->timestamps();
        });

        Schema::create('consultancy_requests', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('organization');
            $table->string('category', 32)->default('other');
            $table->string('subject');
            $table->text('description');
            $table->string('status', 20)->default('new');
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('locale_contents', function (Blueprint $table) {
            $table->id();
            $table->string('key', 120);
            $table->string('locale', 8);
            $table->string('title')->default('');
            $table->text('body');
            $table->boolean('is_approved')->default(false);
            $table->timestamp('updated_at')->useCurrent();
            $table->unique(['key', 'locale']);
        });

        Schema::create('risks', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('category', 32)->default('operational');
            $table->text('description');
            $table->unsignedTinyInteger('probability')->default(3);
            $table->unsignedTinyInteger('impact')->default(3);
            $table->text('mitigation')->nullable();
            $table->string('residual_risk')->default('');
            $table->string('owner')->default('');
            $table->date('due_date')->nullable();
            $table->string('review_status', 20)->default('open');
            $table->timestamps();
        });

        Schema::create('strategic_kras', function (Blueprint $table) {
            $table->id();
            $table->string('code', 32)->unique();
            $table->string('title');
            $table->text('objective');
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
        });

        Schema::create('indicators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kra_id')->constrained('strategic_kras')->cascadeOnDelete();
            $table->string('code', 32);
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('unit', 64)->default('');
            $table->decimal('baseline', 12, 2)->default(0);
            $table->decimal('annual_target', 12, 2)->default(0);
            $table->string('frequency', 20)->default('quarterly');
            $table->string('responsible_officer')->default('');
            $table->boolean('is_active')->default(true);
            $table->unique(['kra_id', 'code']);
        });

        Schema::create('indicator_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('indicator_id')->constrained('indicators')->cascadeOnDelete();
            $table->string('period_label', 64);
            $table->date('period_start');
            $table->date('period_end');
            $table->decimal('actual_value', 12, 2);
            $table->text('variance_notes')->nullable();
            $table->string('evidence_url')->default('');
            $table->string('status', 20)->default('draft');
            $table->foreignId('submitted_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('utility_kpis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('utility_id')->constrained('utilities')->cascadeOnDelete();
            $table->string('period_label', 64);
            $table->date('period_start');
            $table->date('period_end');
            $table->decimal('water_production_m3', 14, 2)->nullable();
            $table->decimal('nrw_percent', 5, 2)->nullable();
            $table->decimal('meter_coverage_percent', 5, 2)->nullable();
            $table->decimal('billing_efficiency_percent', 5, 2)->nullable();
            $table->decimal('collection_efficiency_percent', 5, 2)->nullable();
            $table->decimal('service_coverage_percent', 5, 2)->nullable();
            $table->decimal('water_quality_compliance_percent', 5, 2)->nullable();
            $table->unsignedInteger('customer_complaints')->nullable();
            $table->text('notes')->nullable();
            $table->string('status', 20)->default('draft');
            $table->foreignId('submitted_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['utility_id', 'period_label']);
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('body');
            $table->string('level', 16)->default('info');
            $table->string('link', 500)->default('');
            $table->boolean('is_read')->default(false);
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('contributions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('utility_id')->nullable()->constrained('utilities')->nullOnDelete();
            $table->string('organization_name');
            $table->string('invoice_number', 64)->unique();
            $table->string('period_label', 64);
            $table->decimal('amount', 14, 2);
            $table->decimal('amount_paid', 14, 2)->default(0);
            $table->string('currency', 8)->default('ETB');
            $table->date('issued_at')->nullable();
            $table->date('due_at')->nullable();
            $table->string('status', 20)->default('draft');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('contribution_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contribution_id')->constrained('contributions')->cascadeOnDelete();
            $table->decimal('amount', 14, 2);
            $table->date('paid_at');
            $table->string('reference', 120)->default('');
            $table->string('method', 64)->default('');
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('audit_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 120);
            $table->string('ip_address', 45)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_events');
        Schema::dropIfExists('contribution_payments');
        Schema::dropIfExists('contributions');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('utility_kpis');
        Schema::dropIfExists('indicator_results');
        Schema::dropIfExists('indicators');
        Schema::dropIfExists('strategic_kras');
        Schema::dropIfExists('risks');
        Schema::dropIfExists('locale_contents');
        Schema::dropIfExists('consultancy_requests');
        Schema::dropIfExists('knowledge_documents');
        Schema::dropIfExists('procurement_interests');
        Schema::dropIfExists('procurement_notices');
        Schema::dropIfExists('partnership_inquiries');
        Schema::dropIfExists('partners');
        Schema::dropIfExists('training_registrations');
        Schema::dropIfExists('training_courses');
        Schema::dropIfExists('event_registrations');
        Schema::dropIfExists('membership_applications');
        Schema::dropIfExists('newsletter_subscribers');
        Schema::dropIfExists('gallery_items');
        Schema::dropIfExists('events');
        Schema::dropIfExists('leadership_profiles');
        Schema::dropIfExists('service_requests');
        Schema::dropIfExists('contact_messages');
        Schema::dropIfExists('publications');
        Schema::dropIfExists('site_statistics');
        Schema::dropIfExists('news_articles');
        Schema::dropIfExists('project_milestones');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('utilities');
        Schema::dropIfExists('access_requests');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'username',
                'first_name',
                'last_name',
                'role',
                'employee_id',
                'organization',
                'failed_login_attempts',
                'locked_until',
                'is_superuser',
                'is_staff',
                'is_active',
            ]);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->boolean('must_change_password')->default(false)->after('is_active');
            $table->index('role');
            $table->index('is_active');
        });

        Schema::table('news_articles', function (Blueprint $table): void {
            $table->softDeletes();
            $table->index('status');
            $table->index('published_at');
            $table->index(['status', 'published_at']);
        });

        Schema::table('events', function (Blueprint $table): void {
            $table->softDeletes();
            $table->index('status');
            $table->index('starts_at');
        });

        Schema::table('publications', function (Blueprint $table): void {
            $table->softDeletes();
            $table->index('status');
            $table->index('is_public');
            $table->index('published_at');
        });

        Schema::table('gallery_items', function (Blueprint $table): void {
            $table->softDeletes();
            $table->index('is_public');
            $table->index('sort_order');
        });

        Schema::table('partners', function (Blueprint $table): void {
            $table->softDeletes();
            $table->index('is_public');
            $table->index('sort_order');
        });

        Schema::table('projects', function (Blueprint $table): void {
            $table->softDeletes();
            $table->index('status');
            $table->index('is_public');
        });

        Schema::table('audit_events', function (Blueprint $table): void {
            $table->string('entity_type', 120)->nullable()->after('action');
            $table->unsignedBigInteger('entity_id')->nullable()->after('entity_type');
            $table->index('action');
            $table->index('created_at');
            $table->index(['entity_type', 'entity_id']);
        });
    }

    public function down(): void
    {
        Schema::table('audit_events', function (Blueprint $table): void {
            $table->dropIndex(['action']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['entity_type', 'entity_id']);
            $table->dropColumn(['entity_type', 'entity_id']);
        });

        Schema::table('projects', function (Blueprint $table): void {
            $table->dropIndex(['status']);
            $table->dropIndex(['is_public']);
            $table->dropSoftDeletes();
        });

        Schema::table('partners', function (Blueprint $table): void {
            $table->dropIndex(['is_public']);
            $table->dropIndex(['sort_order']);
            $table->dropSoftDeletes();
        });

        Schema::table('gallery_items', function (Blueprint $table): void {
            $table->dropIndex(['is_public']);
            $table->dropIndex(['sort_order']);
            $table->dropSoftDeletes();
        });

        Schema::table('publications', function (Blueprint $table): void {
            $table->dropIndex(['status']);
            $table->dropIndex(['is_public']);
            $table->dropIndex(['published_at']);
            $table->dropSoftDeletes();
        });

        Schema::table('events', function (Blueprint $table): void {
            $table->dropIndex(['status']);
            $table->dropIndex(['starts_at']);
            $table->dropSoftDeletes();
        });

        Schema::table('news_articles', function (Blueprint $table): void {
            $table->dropIndex(['status']);
            $table->dropIndex(['published_at']);
            $table->dropIndex(['status', 'published_at']);
            $table->dropSoftDeletes();
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->dropIndex(['role']);
            $table->dropIndex(['is_active']);
            $table->dropColumn('must_change_password');
        });
    }
};

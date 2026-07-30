<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** @var list<string> */
    private array $tables = [
        'contact_messages',
        'service_requests',
        'consultancy_requests',
        'membership_applications',
        'partnership_inquiries',
        'event_registrations',
        'training_registrations',
        'procurement_interests',
        'access_requests',
    ];

    public function up(): void
    {
        foreach ($this->tables as $table) {
            if (! Schema::hasTable($table)) {
                continue;
            }
            Schema::table($table, function (Blueprint $blueprint) use ($table): void {
                if (! Schema::hasColumn($table, 'staff_notes')) {
                    $blueprint->text('staff_notes')->nullable()->after('status');
                }
                if (! Schema::hasColumn($table, 'processed_at')) {
                    $blueprint->timestamp('processed_at')->nullable()->after('staff_notes');
                }
            });
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $table) {
            if (! Schema::hasTable($table)) {
                continue;
            }
            Schema::table($table, function (Blueprint $blueprint) use ($table): void {
                if (Schema::hasColumn($table, 'processed_at')) {
                    $blueprint->dropColumn('processed_at');
                }
                if (Schema::hasColumn($table, 'staff_notes')) {
                    $blueprint->dropColumn('staff_notes');
                }
            });
        }
    }
};

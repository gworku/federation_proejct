<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contribution_payments', function (Blueprint $table): void {
            $table->foreignId('submitted_by_id')->nullable()->after('contribution_id')
                ->constrained('users')->nullOnDelete();
            $table->string('status', 20)->default('approved')->after('receipt_name');
            $table->foreignId('reviewed_by_id')->nullable()->after('status')
                ->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable()->after('reviewed_by_id');
            $table->text('review_notes')->nullable()->after('reviewed_at');
            $table->index(['contribution_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('contribution_payments', function (Blueprint $table): void {
            $table->dropIndex(['contribution_id', 'status']);
            $table->dropConstrainedForeignId('reviewed_by_id');
            $table->dropConstrainedForeignId('submitted_by_id');
            $table->dropColumn(['status', 'reviewed_at', 'review_notes']);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('contributions')) {
            Schema::table('contributions', function (Blueprint $table): void {
                if (! Schema::hasColumn('contributions', 'attachment_url')) {
                    $table->string('attachment_url', 500)->nullable()->after('notes');
                }
                if (! Schema::hasColumn('contributions', 'attachment_name')) {
                    $table->string('attachment_name', 255)->nullable()->after('attachment_url');
                }
            });
        }

        if (Schema::hasTable('contribution_payments')) {
            Schema::table('contribution_payments', function (Blueprint $table): void {
                if (! Schema::hasColumn('contribution_payments', 'receipt_url')) {
                    $table->string('receipt_url', 500)->nullable()->after('notes');
                }
                if (! Schema::hasColumn('contribution_payments', 'receipt_name')) {
                    $table->string('receipt_name', 255)->nullable()->after('receipt_url');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('contributions')) {
            Schema::table('contributions', function (Blueprint $table): void {
                if (Schema::hasColumn('contributions', 'attachment_name')) {
                    $table->dropColumn('attachment_name');
                }
                if (Schema::hasColumn('contributions', 'attachment_url')) {
                    $table->dropColumn('attachment_url');
                }
            });
        }

        if (Schema::hasTable('contribution_payments')) {
            Schema::table('contribution_payments', function (Blueprint $table): void {
                if (Schema::hasColumn('contribution_payments', 'receipt_name')) {
                    $table->dropColumn('receipt_name');
                }
                if (Schema::hasColumn('contribution_payments', 'receipt_url')) {
                    $table->dropColumn('receipt_url');
                }
            });
        }
    }
};

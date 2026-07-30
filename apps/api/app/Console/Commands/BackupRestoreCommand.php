<?php

namespace App\Console\Commands;

use App\Services\BackupService;
use Illuminate\Console\Command;

class BackupRestoreCommand extends Command
{
    protected $signature = 'app:backup-restore
        {filename : Backup ZIP filename under storage/app/backups}
        {--force : Skip confirmation}';

    protected $description = 'Restore OWUF application tables from a backup ZIP';

    public function handle(BackupService $backups): int
    {
        $filename = (string) $this->argument('filename');

        if ($backups->resolve($filename) === null) {
            $this->error("Backup not found: {$filename}");

            return self::FAILURE;
        }

        if (
            ! $this->option('force')
            && ! $this->confirm(
                'This will REPLACE current application data with the backup. Continue?',
                false,
            )
        ) {
            $this->warn('Restore cancelled.');

            return self::FAILURE;
        }

        try {
            $result = $backups->restore($filename);
        } catch (\Throwable $e) {
            $this->error('Restore failed: '.$e->getMessage());

            return self::FAILURE;
        }

        $this->info("Restored {$result['filename']} ({$result['rows_total']} rows).");
        foreach ($result['tables'] as $table => $count) {
            $this->line("  {$table}: {$count}");
        }

        return self::SUCCESS;
    }
}

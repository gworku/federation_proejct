<?php

namespace App\Console\Commands;

use App\Services\BackupService;
use Illuminate\Console\Command;

class BackupCreateCommand extends Command
{
    protected $signature = 'app:backup-create {--label=manual}';

    protected $description = 'Create a ZIP backup of OWUF database tables';

    public function handle(BackupService $backups): int
    {
        $label = (string) $this->option('label');
        $row = $backups->create($label);

        $this->info("Backup created: {$row['filename']} ({$row['size_bytes']} bytes)");

        return self::SUCCESS;
    }
}

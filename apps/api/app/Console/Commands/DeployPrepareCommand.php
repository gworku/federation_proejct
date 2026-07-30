<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class DeployPrepareCommand extends Command
{
    protected $signature = 'app:deploy-prepare
        {--migrate : Run migrations with --force}
        {--skip-cache : Skip config/route/view caching}';

    protected $description = 'Prepare the API for production (storage link, optional migrate, caches)';

    public function handle(): int
    {
        if (
            ! $this->laravel->environment('production')
            && ! $this->option('no-interaction')
            && ! $this->confirm('APP_ENV is not production. Continue?', true)
        ) {
            return self::FAILURE;
        }

        if ($this->option('migrate')) {
            $this->info('Running migrations…');
            Artisan::call('migrate', ['--force' => true]);
            $this->line(Artisan::output());
        }

        $this->info('Ensuring public storage link…');
        try {
            Artisan::call('storage:link');
            $this->line(trim(Artisan::output()) ?: 'Storage link ready.');
        } catch (\Throwable $e) {
            $this->warn('storage:link: '.$e->getMessage());
        }

        if (! $this->option('skip-cache')) {
            $this->info('Caching config, routes, and views…');
            Artisan::call('config:cache');
            Artisan::call('route:cache');
            Artisan::call('view:cache');
            $this->line('Caches written.');
        }

        $this->info('Deploy prepare complete.');

        return self::SUCCESS;
    }
}

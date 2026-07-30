<?php

namespace App\Console\Commands;

use Database\Seeders\DemoSeeder;
use Illuminate\Console\Command;

class SeedDemoCommand extends Command
{
    protected $signature = 'app:seed-demo';

    protected $description = 'Seed demo users and OWUF sample data (local/staging only)';

    public function handle(): int
    {
        if ($this->laravel->environment('production')) {
            $this->error('Demo seeding is disabled in production.');
            $this->line('Create an admin with: php artisan app:create-admin');

            return self::FAILURE;
        }

        $this->call('db:seed', ['--class' => DemoSeeder::class]);

        $this->info('Demo seed complete.');

        return self::SUCCESS;
    }
}

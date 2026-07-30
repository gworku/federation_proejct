<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command?->warn(
                'Skipping DemoSeeder in production. Use: php artisan app:create-admin',
            );

            return;
        }

        $this->call([
            DemoSeeder::class,
        ]);
    }
}

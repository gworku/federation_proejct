<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Support\Roles;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class CreateAdminCommand extends Command
{
    protected $signature = 'app:create-admin
        {email : Administrator email}
        {--name=System Admin : Display name}
        {--password= : Plain password (generated if omitted)}
        {--username= : Login username (defaults from email)}';

    protected $description = 'Create or promote a production administrator account';

    public function handle(): int
    {
        $email = strtolower(trim((string) $this->argument('email')));
        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Invalid email address.');

            return self::FAILURE;
        }

        $name = trim((string) $this->option('name')) ?: 'System Admin';
        $parts = preg_split('/\s+/', $name, 2) ?: [$name];
        $firstName = $parts[0] ?? 'System';
        $lastName = $parts[1] ?? 'Admin';
        $username = trim((string) ($this->option('username') ?: Str::before($email, '@')));
        $password = (string) ($this->option('password') ?: Str::password(16));
        $generated = ! $this->option('password');

        $user = User::query()->where('email', $email)->first();
        if ($user === null) {
            $user = User::query()->create([
                'username' => $username,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'name' => $name,
                'email' => $email,
                'password' => $password,
                'role' => Roles::ADMINISTRATOR,
                'organization' => 'OWUF',
                'is_superuser' => true,
                'is_staff' => true,
                'is_active' => true,
            ]);
            $this->info("Created administrator: {$email}");
        } else {
            $user->fill([
                'username' => $username ?: $user->username,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'name' => $name,
                'password' => $password,
                'role' => Roles::ADMINISTRATOR,
                'is_superuser' => true,
                'is_staff' => true,
                'is_active' => true,
                'failed_login_attempts' => 0,
                'locked_until' => null,
            ]);
            $user->save();
            $this->info("Updated existing user to administrator: {$email}");
        }

        if ($generated) {
            $this->warn("Temporary password: {$password}");
            $this->line('Store this securely and change it after first login.');
        }

        return self::SUCCESS;
    }
}

<?php

namespace Database\Factories;

use App\Models\User;
use App\Support\Roles;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        $first = fake()->firstName();
        $last = fake()->lastName();

        return [
            'username' => Str::lower(Str::slug($first.$last.fake()->unique()->numerify('###'), '')),
            'name' => trim("$first $last"),
            'first_name' => $first,
            'last_name' => $last,
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('Password123!'),
            'role' => Roles::UTILITY_USER,
            'employee_id' => '',
            'organization' => 'OWUF',
            'is_superuser' => false,
            'is_staff' => false,
            'is_active' => true,
            'must_change_password' => false,
            'failed_login_attempts' => 0,
            'locked_until' => null,
            'remember_token' => Str::random(10),
        ];
    }

    public function administrator(): static
    {
        return $this->state(fn () => [
            'role' => Roles::ADMINISTRATOR,
            'is_staff' => true,
            'is_superuser' => true,
        ]);
    }

    public function contentEditor(): static
    {
        return $this->state(fn () => [
            'role' => Roles::CONTENT_EDITOR,
            'is_staff' => true,
        ]);
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}

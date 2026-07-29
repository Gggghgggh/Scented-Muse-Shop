<?php

namespace Database\Seeders;

use App\Models\ProductCategory;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::query()->updateOrCreate(
            ['email' => 'admin@hodshop.test'],
            [
                'name' => 'HOD Shop Admin',
                'password' => Hash::make('password'),
                'is_admin' => true,
                'email_verified_at' => now(),
            ],
        );

        User::query()->updateOrCreate(
            ['email' => 'customer@hodshop.test'],
            [
                'name' => 'HOD Customer',
                'password' => Hash::make('password'),
                'is_admin' => false,
                'email_verified_at' => now(),
            ],
        );

        collect([
            'Perfumes',
            'Deodorants',
            'Watches',
            'Body Wash',
            'Body Spray',
            'Body Splash',
        ])->each(fn (string $name) => ProductCategory::query()->updateOrCreate(
            ['slug' => Str::slug($name)],
            [
                'name' => $name,
                'description' => 'Scented Muse '.$name.' collection.',
                'is_active' => true,
            ],
        ));
    }
}

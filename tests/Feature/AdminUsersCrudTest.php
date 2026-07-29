<?php

use App\Models\User;

function adminUserForUsers(): User
{
    return User::factory()->create(['is_admin' => true]);
}

test('admin can create update and delete a user', function () {
    $admin = adminUserForUsers();

    $this->actingAs($admin)
        ->post(route('admin.users.store'), [
            'name' => 'New Admin',
            'email' => 'new-admin@example.com',
            'password' => 'password123',
            'is_admin' => true,
        ])
        ->assertRedirect(route('admin.users.index'));

    $created = User::query()->where('email', 'new-admin@example.com')->firstOrFail();
    expect($created->is_admin)->toBeTrue();

    $this->actingAs($admin)
        ->put(route('admin.users.update', $created), [
            'name' => 'Updated Name',
            'email' => 'new-admin@example.com',
            'password' => '',
            'is_admin' => false,
        ])
        ->assertRedirect(route('admin.users.index'));

    expect($created->refresh())
        ->name->toBe('Updated Name')
        ->is_admin->toBeFalse();

    $this->actingAs($admin)
        ->delete(route('admin.users.destroy', $created))
        ->assertRedirect(route('admin.users.index'));

    expect(User::query()->whereKey($created->id)->exists())->toBeFalse();
});

test('admin cannot delete their own account', function () {
    $admin = adminUserForUsers();

    $this->actingAs($admin)
        ->delete(route('admin.users.destroy', $admin))
        ->assertStatus(422);

    expect(User::query()->whereKey($admin->id)->exists())->toBeTrue();
});

test('admin users index paginates and search narrows results', function () {
    $admin = adminUserForUsers();

    foreach (range(1, 20) as $index) {
        User::factory()->create([
            'name' => "Searchable User {$index}",
            'email' => "searchable{$index}@example.com",
            'is_admin' => false,
        ]);
    }

    $this->actingAs($admin)
        ->get(route('admin.users.index'))
        ->assertInertia(fn ($page) => $page
            ->component('admin/users/index')
            ->where('users.total', 21)
            ->where('users.last_page', 2)
            ->has('users.data', 15));

    $this->actingAs($admin)
        ->get(route('admin.users.index', ['search' => 'searchable7@example.com']))
        ->assertInertia(fn ($page) => $page
            ->where('users.total', 1)
            ->where('users.data.0.email', 'searchable7@example.com'));
});

test('non admin users cannot manage users', function () {
    $user = User::factory()->create(['is_admin' => false]);
    $other = User::factory()->create(['is_admin' => false]);

    $routes = [
        ['get', route('admin.users.index')],
        ['get', route('admin.users.create')],
        ['get', route('admin.users.edit', $other)],
        ['post', route('admin.users.store')],
        ['put', route('admin.users.update', $other)],
        ['delete', route('admin.users.destroy', $other)],
    ];

    foreach ($routes as [$method, $url]) {
        $this->actingAs($user)->{$method}($url)->assertForbidden();
    }
});

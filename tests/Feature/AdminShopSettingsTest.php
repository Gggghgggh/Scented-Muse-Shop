<?php

use App\Models\ShopSetting;
use App\Models\User;

function adminUserForShopSettings(): User
{
    return User::factory()->create(['is_admin' => true]);
}

test('admin can view and update shop settings', function () {
    $admin = adminUserForShopSettings();

    $this->actingAs($admin)
        ->get(route('admin.shop-settings.edit'))
        ->assertOk();

    $this->actingAs($admin)
        ->put(route('admin.shop-settings.update'), [
            'shop_location' => 'Nairobi CBD',
            'shop_phone' => '+254711000000',
            'shopping_points_percentage' => 15,
        ])
        ->assertRedirect(route('admin.shop-settings.edit'));

    $settings = ShopSetting::current();
    expect($settings->shop_location)->toBe('Nairobi CBD');
    expect($settings->shop_phone)->toBe('+254711000000');
    expect((float) $settings->shopping_points_percentage)->toBe(15.0);
});

test('shop settings update rejects an out of range percentage', function () {
    $admin = adminUserForShopSettings();

    $this->actingAs($admin)
        ->put(route('admin.shop-settings.update'), [
            'shop_location' => 'Nairobi CBD',
            'shop_phone' => '+254711000000',
            'shopping_points_percentage' => 150,
        ])
        ->assertSessionHasErrors('shopping_points_percentage');
});

test('non admin users cannot manage shop settings', function () {
    $user = User::factory()->create(['is_admin' => false]);

    $this->actingAs($user)->get(route('admin.shop-settings.edit'))->assertForbidden();
    $this->actingAs($user)->put(route('admin.shop-settings.update'), [
        'shopping_points_percentage' => 10,
    ])->assertForbidden();
});

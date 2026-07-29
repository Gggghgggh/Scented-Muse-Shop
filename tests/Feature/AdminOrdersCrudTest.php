<?php

use App\Models\Order;
use App\Models\User;

function adminUserForOrders(): User
{
    return User::factory()->create(['is_admin' => true]);
}

function baseOrderPayload(array $overrides = []): array
{
    return [
        ...[
            'user_id' => null,
            'customer_name' => 'Jane Doe',
            'customer_email' => 'jane@example.com',
            'customer_phone' => '0700000000',
            'county' => 'Nairobi',
            'town' => 'Westlands',
            'items' => "Bed sheet\nDuvet",
            'delivery_fee' => 200,
            'total_amount' => 3200,
            'status' => 'processing',
            'notes' => '',
        ],
        ...$overrides,
    ];
}

test('admin can create an order linked to a registered user', function () {
    $admin = adminUserForOrders();
    $customer = User::factory()->create(['is_admin' => false]);

    $this->actingAs($admin)
        ->post(route('admin.orders.store'), baseOrderPayload(['user_id' => $customer->id]))
        ->assertRedirect(route('admin.orders.index'));

    $order = Order::query()->where('customer_email', 'jane@example.com')->firstOrFail();

    expect($order->user_id)->toBe($customer->id);
});

test('admin can update an order to link or unlink a user', function () {
    $admin = adminUserForOrders();
    $customer = User::factory()->create(['is_admin' => false]);
    $order = Order::create(baseOrderPayload() + ['order_number' => 'HOD-TEST0001']);

    $this->actingAs($admin)
        ->put(route('admin.orders.update', $order), baseOrderPayload(['user_id' => $customer->id]))
        ->assertRedirect(route('admin.orders.index'));

    expect($order->refresh()->user_id)->toBe($customer->id);

    $this->actingAs($admin)
        ->put(route('admin.orders.update', $order), baseOrderPayload(['user_id' => '']))
        ->assertRedirect(route('admin.orders.index'));

    expect($order->refresh()->user_id)->toBeNull();
});

test('admin orders index paginates and search narrows results', function () {
    $admin = adminUserForOrders();

    foreach (range(1, 20) as $index) {
        Order::create(baseOrderPayload([
            'customer_name' => "Customer {$index}",
            'customer_email' => "customer{$index}@example.com",
        ]) + ['order_number' => "HOD-PAGE{$index}"]);
    }

    $this->actingAs($admin)
        ->get(route('admin.orders.index'))
        ->assertInertia(fn ($page) => $page
            ->component('admin/orders/index')
            ->where('orders.total', 20)
            ->where('orders.last_page', 2)
            ->has('orders.data', 15));

    $this->actingAs($admin)
        ->get(route('admin.orders.index', ['search' => 'HOD-PAGE7']))
        ->assertInertia(fn ($page) => $page
            ->where('orders.total', 1)
            ->where('orders.data.0.order_number', 'HOD-PAGE7'));
});

test('non admin users cannot manage orders', function () {
    $user = User::factory()->create(['is_admin' => false]);
    $order = Order::create(baseOrderPayload() + ['order_number' => 'HOD-TEST0002']);

    $routes = [
        ['get', route('admin.orders.index')],
        ['get', route('admin.orders.create')],
        ['get', route('admin.orders.edit', $order)],
        ['post', route('admin.orders.store')],
        ['put', route('admin.orders.update', $order)],
        ['delete', route('admin.orders.destroy', $order)],
    ];

    foreach ($routes as [$method, $url]) {
        $this->actingAs($user)->{$method}($url)->assertForbidden();
    }
});

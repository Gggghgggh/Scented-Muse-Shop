<?php

use App\Models\Order;
use App\Models\User;

function adminUserForCustomers(): User
{
    return User::factory()->create(['is_admin' => true]);
}

test('admin can view customers index and a customer detail page', function () {
    $admin = adminUserForCustomers();
    $customer = User::factory()->create(['is_admin' => false, 'name' => 'Alice Customer']);

    Order::create([
        'user_id' => $customer->id,
        'customer_name' => $customer->name,
        'customer_email' => $customer->email,
        'customer_phone' => '0711000000',
        'county' => 'Nairobi',
        'town' => 'CBD',
        'items' => [['name' => 'Pillow']],
        'delivery_fee' => 100,
        'total_amount' => 1500,
        'status' => 'processing',
        'order_number' => 'HOD-CUST0001',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.customers.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/customers/index')
            ->has('customers.data', 1));

    $this->actingAs($admin)
        ->get(route('admin.customers.show', $customer))
        ->assertOk();
});

test('admin customers index search narrows by phone', function () {
    $admin = adminUserForCustomers();
    $matching = User::factory()->create(['is_admin' => false, 'name' => 'Match Customer']);
    $other = User::factory()->create(['is_admin' => false, 'name' => 'Other Customer']);

    Order::create([
        'user_id' => $matching->id,
        'customer_name' => $matching->name,
        'customer_phone' => '0799999999',
        'county' => 'Nairobi',
        'town' => 'CBD',
        'items' => [['name' => 'Duvet']],
        'delivery_fee' => 100,
        'total_amount' => 2500,
        'status' => 'processing',
        'order_number' => 'HOD-CUST0002',
    ]);

    Order::create([
        'user_id' => $other->id,
        'customer_name' => $other->name,
        'customer_phone' => '0700000001',
        'county' => 'Nairobi',
        'town' => 'CBD',
        'items' => [['name' => 'Blanket']],
        'delivery_fee' => 100,
        'total_amount' => 1800,
        'status' => 'processing',
        'order_number' => 'HOD-CUST0003',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.customers.index', ['search' => '0799999999']))
        ->assertInertia(fn ($page) => $page
            ->has('customers.data', 1)
            ->where('customers.data.0.name', 'Match Customer'));
});

test('non admin users cannot view customers', function () {
    $user = User::factory()->create(['is_admin' => false]);

    $this->actingAs($user)->get(route('admin.customers.index'))->assertForbidden();
    $this->actingAs($user)->get(route('admin.customers.show', $user))->assertForbidden();
});

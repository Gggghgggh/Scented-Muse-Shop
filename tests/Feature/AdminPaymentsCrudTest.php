<?php

use App\Models\Order;
use App\Models\Payment;
use App\Models\User;

function adminUserForPayments(): User
{
    return User::factory()->create(['is_admin' => true]);
}

function baseOrderForPayment(array $overrides = []): Order
{
    return Order::create([
        ...[
            'customer_name' => 'Jane Doe',
            'customer_email' => 'jane@example.com',
            'county' => 'Nairobi',
            'town' => 'Westlands',
            'items' => [['name' => 'Bed sheet']],
            'delivery_fee' => 200,
            'total_amount' => 3200,
            'status' => 'processing',
            'order_number' => 'HOD-PAYTEST'.uniqid(),
        ],
        ...$overrides,
    ]);
}

function basePaymentPayload(array $overrides = []): array
{
    return [
        ...[
            'order_id' => null,
            'customer_name' => 'Jane Doe',
            'method' => 'cash_on_delivery',
            'amount' => 3200,
            'status' => 'pending',
            'transaction_reference' => '',
            'notes' => '',
        ],
        ...$overrides,
    ];
}

test('admin can create a payment linked to an order', function () {
    $admin = adminUserForPayments();
    $order = baseOrderForPayment();

    $this->actingAs($admin)
        ->post(route('admin.payments.store'), basePaymentPayload(['order_id' => $order->id]))
        ->assertRedirect(route('admin.payments.index'));

    $payment = Payment::query()->where('customer_name', 'Jane Doe')->firstOrFail();

    expect($payment->order_id)->toBe($order->id);
});

test('admin can update a payment to link or unlink an order', function () {
    $admin = adminUserForPayments();
    $order = baseOrderForPayment();
    $payment = Payment::create(basePaymentPayload() + ['payment_number' => 'PAY-TEST0001']);

    $this->actingAs($admin)
        ->put(route('admin.payments.update', $payment), basePaymentPayload(['order_id' => $order->id]))
        ->assertRedirect(route('admin.payments.index'));

    expect($payment->refresh()->order_id)->toBe($order->id);

    $this->actingAs($admin)
        ->put(route('admin.payments.update', $payment), basePaymentPayload(['order_id' => '']))
        ->assertRedirect(route('admin.payments.index'));

    expect($payment->refresh()->order_id)->toBeNull();
});

test('admin payments index paginates and search narrows results', function () {
    $admin = adminUserForPayments();

    foreach (range(1, 20) as $index) {
        Payment::create(basePaymentPayload([
            'customer_name' => "Customer {$index}",
        ]) + ['payment_number' => "PAY-PAGE{$index}"]);
    }

    $this->actingAs($admin)
        ->get(route('admin.payments.index'))
        ->assertInertia(fn ($page) => $page
            ->component('admin/payments/index')
            ->where('payments.total', 20)
            ->where('payments.last_page', 2)
            ->has('payments.data', 15));

    $this->actingAs($admin)
        ->get(route('admin.payments.index', ['search' => 'PAY-PAGE7']))
        ->assertInertia(fn ($page) => $page
            ->where('payments.total', 1)
            ->where('payments.data.0.payment_number', 'PAY-PAGE7'));
});

test('non admin users cannot manage payments', function () {
    $user = User::factory()->create(['is_admin' => false]);
    $payment = Payment::create(basePaymentPayload() + ['payment_number' => 'PAY-TEST0002']);

    $routes = [
        ['get', route('admin.payments.index')],
        ['get', route('admin.payments.create')],
        ['get', route('admin.payments.edit', $payment)],
        ['post', route('admin.payments.store')],
        ['put', route('admin.payments.update', $payment)],
        ['delete', route('admin.payments.destroy', $payment)],
    ];

    foreach ($routes as [$method, $url]) {
        $this->actingAs($user)->{$method}($url)->assertForbidden();
    }
});

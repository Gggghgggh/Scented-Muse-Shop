<?php

use App\Models\Order;
use App\Models\Payment;
use App\Models\User;

function lipanaWebhookOrder(): Order
{
    return Order::create([
        'customer_name' => 'Jane Doe',
        'customer_email' => 'jane@example.com',
        'customer_phone' => '0700000000',
        'county' => 'Nairobi',
        'town' => 'Westlands',
        'items' => [['name' => 'Room Spray', 'quantity' => 1]],
        'delivery_fee' => 200,
        'total_amount' => 1200,
        'status' => 'processing',
        'order_number' => 'HOD-LIPANA'.uniqid(),
    ]);
}

function lipanaSignature(string $payload): string
{
    return hash_hmac('sha256', $payload, 'test-webhook-secret');
}

test('lipana success webhook marks payment and order as paid', function () {
    config(['services.lipana.webhook_secret' => 'test-webhook-secret']);

    $order = lipanaWebhookOrder();
    $payment = Payment::create([
        'order_id' => $order->id,
        'payment_number' => 'PAY-LIPANA'.uniqid(),
        'customer_name' => 'Jane Doe',
        'method' => 'mpesa',
        'amount' => 1200,
        'status' => 'pending',
        'transaction_reference' => 'TXN1234567890',
        'lipana_transaction_id' => 'TXN1234567890',
        'lipana_checkout_request_id' => 'ws_CO_123456789',
    ]);

    $payload = json_encode([
        'event' => 'transaction.success',
        'data' => [
            'transactionId' => 'TXN1234567890',
            'checkoutRequestID' => 'ws_CO_123456789',
            'amount' => 1200,
            'currency' => 'KES',
            'status' => 'success',
            'phone' => '+254700000000',
            'receipt' => 'RHQ123ABC',
            'customerName' => 'Jane M-Pesa Payer',
        ],
    ], JSON_THROW_ON_ERROR);

    $this->call('POST', route('lipana.webhook'), [], [], [], [
        'CONTENT_TYPE' => 'application/json',
        'HTTP_X_LIPANA_SIGNATURE' => lipanaSignature($payload),
    ], $payload)
        ->assertOk()
        ->assertJson(['status' => 'success']);

    expect($payment->refresh())
        ->status->toBe('paid')
        ->transaction_reference->toBe('RHQ123ABC')
        ->lipana_receipt_number->toBe('RHQ123ABC')
        ->lipana_customer_name->toBe('Jane M-Pesa Payer')
        ->lipana_event->toBe('transaction.success')
        ->and($order->refresh()->status)->toBe('paid');
});

test('lipana failed webhook marks payment and order as failed', function () {
    config(['services.lipana.webhook_secret' => 'test-webhook-secret']);

    $order = lipanaWebhookOrder();
    $payment = Payment::create([
        'order_id' => $order->id,
        'payment_number' => 'PAY-LIPANA'.uniqid(),
        'customer_name' => 'Jane Doe',
        'method' => 'mpesa',
        'amount' => 1200,
        'status' => 'pending',
        'transaction_reference' => 'TXN9876543210',
        'lipana_transaction_id' => 'TXN9876543210',
    ]);

    $payload = json_encode([
        'event' => 'transaction.failed',
        'data' => [
            'transactionId' => 'TXN9876543210',
            'amount' => 1200,
            'status' => 'failed',
            'phone' => '+254700000000',
        ],
    ], JSON_THROW_ON_ERROR);

    $this->call('POST', route('lipana.webhook'), [], [], [], [
        'CONTENT_TYPE' => 'application/json',
        'HTTP_X_LIPANA_SIGNATURE' => lipanaSignature($payload),
    ], $payload)
        ->assertOk()
        ->assertJson(['status' => 'success']);

    expect($payment->refresh())
        ->status->toBe('failed')
        ->lipana_event->toBe('transaction.failed')
        ->and($order->refresh()->status)->toBe('payment_failed');
});

test('lipana webhook rejects invalid signatures when a webhook secret is configured', function () {
    config(['services.lipana.webhook_secret' => 'test-webhook-secret']);

    $payload = json_encode([
        'event' => 'transaction.success',
        'data' => ['transactionId' => 'TXN1234567890'],
    ], JSON_THROW_ON_ERROR);

    $this->call('POST', route('lipana.webhook'), [], [], [], [
        'CONTENT_TYPE' => 'application/json',
        'HTTP_X_LIPANA_SIGNATURE' => 'invalid-signature',
    ], $payload)
        ->assertUnauthorized();
});

test('customer can poll their checkout payment status', function () {
    $user = User::factory()->create();
    $order = Order::create([
        'user_id' => $user->id,
        'customer_name' => $user->name,
        'customer_email' => $user->email,
        'customer_phone' => '0700000000',
        'county' => 'Nairobi',
        'town' => 'Westlands',
        'items' => [['name' => 'Room Spray', 'quantity' => 1]],
        'delivery_fee' => 200,
        'total_amount' => 1200,
        'status' => 'paid',
        'order_number' => 'HOD-POLL'.uniqid(),
    ]);
    $payment = Payment::create([
        'order_id' => $order->id,
        'payment_number' => 'PAY-POLL'.uniqid(),
        'customer_name' => $user->name,
        'method' => 'mpesa',
        'amount' => 1200,
        'status' => 'paid',
        'lipana_receipt_number' => 'RHQ123ABC',
    ]);

    $this->actingAs($user)
        ->getJson(route('checkout.payment-status', $payment))
        ->assertOk()
        ->assertJson([
            'payment_id' => $payment->id,
            'payment_status' => 'paid',
            'order_number' => $order->order_number,
            'receipt_number' => 'RHQ123ABC',
        ]);
});

<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;

function flashSaleProduct(array $overrides = []): Product
{
    return Product::factory()->create([
        ...[
            'product_category_id' => ProductCategory::factory()->create()->id,
            'price' => 1000,
            'flash_sale_price' => 600,
            'is_flash_sale' => true,
            'is_active' => true,
            'stock_quantity' => 10,
        ],
        ...$overrides,
    ]);
}

test('is_flash_sale_active is true while the flash sale has no end date or is in the future', function () {
    $noEndDate = flashSaleProduct(['flash_sale_ends_at' => null]);
    $future = flashSaleProduct(['flash_sale_ends_at' => now()->addDay()]);

    expect($noEndDate->is_flash_sale_active)->toBeTrue();
    expect($future->is_flash_sale_active)->toBeTrue();
});

test('is_flash_sale_active is false once the flash sale end date has passed', function () {
    $expired = flashSaleProduct(['flash_sale_ends_at' => now()->subDay()]);

    expect($expired->is_flash_sale_active)->toBeFalse();
});

test('is_flash_sale_active is false when is_flash_sale is off regardless of end date', function () {
    $product = flashSaleProduct(['is_flash_sale' => false, 'flash_sale_ends_at' => now()->addDay()]);

    expect($product->is_flash_sale_active)->toBeFalse();
});

test('the homepage and product page report an expired flash sale as inactive', function () {
    $user = User::factory()->create();
    $expired = flashSaleProduct(['flash_sale_ends_at' => now()->subHour()]);

    $this->actingAs($user)
        ->get(route('home'))
        ->assertInertia(fn ($page) => $page
            ->where('products.0.is_flash_sale_active', false));

    $this->actingAs($user)
        ->get(route('products.show', $expired->slug))
        ->assertInertia(fn ($page) => $page
            ->where('product.is_flash_sale_active', false));
});

test('checkout charges the regular price once a flash sale has expired', function () {
    $user = User::factory()->create();
    $product = flashSaleProduct(['flash_sale_ends_at' => now()->subHour()]);

    $this->actingAs($user)
        ->post(route('checkout.store'), [
            'county' => 'Nairobi',
            'town' => 'CBD',
            'customer_phone' => '0700000000',
            'payment_method' => 'cash_on_delivery',
            'items' => [
                ['id' => $product->id, 'size' => null, 'color' => null, 'quantity' => 1],
            ],
        ])
        ->assertRedirect(route('orders.mine'));

    $order = Order::query()->where('user_id', $user->id)->latest()->firstOrFail();

    expect((float) $order->items[0]['unit_price'])->toBe(1000.0);
});

test('checkout still charges the flash sale price while it is active', function () {
    $user = User::factory()->create();
    $product = flashSaleProduct(['flash_sale_ends_at' => now()->addDay()]);

    $this->actingAs($user)
        ->post(route('checkout.store'), [
            'county' => 'Nairobi',
            'town' => 'CBD',
            'customer_phone' => '0700000000',
            'payment_method' => 'cash_on_delivery',
            'items' => [
                ['id' => $product->id, 'size' => null, 'color' => null, 'quantity' => 1],
            ],
        ])
        ->assertRedirect(route('orders.mine'));

    $order = Order::query()->where('user_id', $user->id)->latest()->firstOrFail();

    expect((float) $order->items[0]['unit_price'])->toBe(600.0);
});

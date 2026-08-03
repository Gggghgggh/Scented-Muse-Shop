<?php

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

function adminUser(): User
{
    return User::factory()->create(['is_admin' => true]);
}

test('admin can access product and category management pages', function () {
    $admin = adminUser();
    $category = ProductCategory::factory()->create();
    $product = Product::factory()->create(['product_category_id' => $category->id]);

    $this->actingAs($admin)
        ->get(route('admin.products.index'))
        ->assertOk();

    $this->actingAs($admin)
        ->get(route('admin.products.create'))
        ->assertOk();

    $this->actingAs($admin)
        ->get(route('admin.products.edit', $product))
        ->assertOk();

    $this->actingAs($admin)
        ->get(route('admin.categories.index'))
        ->assertOk();

    $this->actingAs($admin)
        ->get(route('admin.categories.create'))
        ->assertOk();

    $this->actingAs($admin)
        ->get(route('admin.categories.edit', $category))
        ->assertOk();
});

test('admin can create update and delete categories', function () {
    $admin = adminUser();

    $this->actingAs($admin)
        ->post(route('admin.categories.store'), [
            'name' => 'Test Category',
            'slug' => 'test-category',
            'description' => 'Category for admin CRUD testing.',
            'is_active' => true,
        ])
        ->assertRedirect(route('admin.categories.index'));

    $category = ProductCategory::query()->where('slug', 'test-category')->firstOrFail();

    $this->actingAs($admin)
        ->put(route('admin.categories.update', $category), [
            'name' => 'Updated Category',
            'slug' => 'updated-category',
            'description' => 'Updated category description.',
            'is_active' => false,
        ])
        ->assertRedirect(route('admin.categories.index'));

    expect($category->refresh())
        ->name->toBe('Updated Category')
        ->is_active->toBeFalse();

    $this->actingAs($admin)
        ->delete(route('admin.categories.destroy', $category))
        ->assertRedirect(route('admin.categories.index'));

    expect(ProductCategory::query()->whereKey($category->id)->exists())->toBeFalse();
});

test('admin can create update and delete products', function () {
    Storage::fake('public');

    $admin = adminUser();
    $category = ProductCategory::factory()->create();

    $this->actingAs($admin)
        ->post(route('admin.products.store'), [
            'product_category_id' => $category->id,
            'name' => 'Test Product',
            'slug' => 'test-product',
            'description' => 'Product for admin CRUD testing.',
            'brand' => 'House of De',
            'original_price' => 1500,
            'price' => 1200,
            'stock_quantity' => 8,
            'weight_kg' => 1.5,
            'sizes' => ['Queen', 'King', 'Queen', ''],
            'colors' => ['White', 'Navy', 'White', ''],
            'photo' => UploadedFile::fake()->image('product.jpg'),
            'is_active' => true,
            'is_flash_sale' => true,
        ])
        ->assertRedirect(route('admin.products.index'));

    $product = Product::query()->where('slug', 'test-product')->firstOrFail();

    expect($product->product_code)->toStartWith('SM-');
    expect($product)
        ->name->toBe('Test Product')
        ->price->toBe('1200.00')
        ->weight_kg->toBe('1.50')
        ->photo_path->not->toBeNull();

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'name' => 'Test Product',
        'slug' => 'test-product',
        'weight_kg' => 1.5,
    ]);

    $this->actingAs($admin)
        ->put(route('admin.products.update', $product), [
            'product_category_id' => $category->id,
            'name' => 'Updated Product',
            'slug' => 'updated-product',
            'description' => 'Updated product description.',
            'brand' => 'HOD Premium',
            'original_price' => 2000,
            'price' => 1500,
            'stock_quantity' => 10,
            'weight_kg' => 2,
            'sizes' => ['S', 'M', 'L'],
            'colors' => ['Black', 'Cream'],
            'is_active' => false,
            'is_flash_sale' => false,
        ])
        ->assertRedirect(route('admin.products.index'));

    expect($product->refresh())
        ->name->toBe('Updated Product')
        ->brand->toBe('HOD Premium')
        ->original_price->toBe('2000.00')
        ->discount_percentage->toBe(25)
        ->stock_quantity->toBe(10)
        ->sizes->toBe(['S', 'M', 'L'])
        ->colors->toBe(['Black', 'Cream'])
        ->is_active->toBeFalse()
        ->is_flash_sale->toBeFalse();

    $this->actingAs($admin)
        ->delete(route('admin.products.destroy', $product))
        ->assertRedirect(route('admin.products.index'));

    expect(Product::query()->whereKey($product->id)->exists())->toBeFalse();
});

test('creating a product without any price fails validation', function () {
    Storage::fake('public');

    $admin = adminUser();
    $category = ProductCategory::factory()->create();

    $this->actingAs($admin)
        ->post(route('admin.products.store'), [
            'product_category_id' => $category->id,
            'name' => 'No Price Product',
            'description' => 'A product with no price anywhere.',
            'stock_quantity' => 5,
            'weight_kg' => 1,
            'photo' => UploadedFile::fake()->image('product.jpg'),
            'is_active' => true,
        ])
        ->assertSessionHasErrors('price');

    expect(Product::query()->where('name', 'No Price Product')->exists())->toBeFalse();
});

test('non admin users cannot manage products or categories', function () {
    $user = User::factory()->create(['is_admin' => false]);
    $category = ProductCategory::factory()->create();
    $product = Product::factory()->create(['product_category_id' => $category->id]);

    $adminRoutes = [
        ['get', route('admin.products.index')],
        ['get', route('admin.products.create')],
        ['get', route('admin.products.edit', $product)],
        ['post', route('admin.products.store')],
        ['put', route('admin.products.update', $product)],
        ['delete', route('admin.products.destroy', $product)],
        ['get', route('admin.categories.index')],
        ['get', route('admin.categories.create')],
        ['get', route('admin.categories.edit', $category)],
        ['post', route('admin.categories.store')],
        ['put', route('admin.categories.update', $category)],
        ['delete', route('admin.categories.destroy', $category)],
    ];

    foreach ($adminRoutes as [$method, $url]) {
        $this->actingAs($user)->{$method}($url)->assertForbidden();
    }
});

<?php

namespace App\Models;

use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string|null $product_code
 * @property int $product_category_id
 * @property string $name
 * @property string $slug
 * @property string $description
 * @property string|null $brand
 * @property string|null $fragrance_type
 * @property string $price
 * @property string|null $flash_sale_price
 * @property string|null $original_price
 * @property int|null $discount_percentage
 * @property int $stock_quantity
 * @property string $weight_kg
 * @property array<int, string>|null $sizes
 * @property array<string, numeric>|null $size_prices
 * @property array<string, int>|null $size_quantities
 * @property array<int, string>|null $colors
 * @property array<int, array<string, mixed>>|null $variants
 * @property string|null $photo_path
 * @property array<int, string>|null $photo_paths
 * @property bool $is_active
 * @property bool $is_flash_sale
 * @property Carbon|null $flash_sale_ends_at
 * @property array<string, int>|null $flash_sale_size_quantities
 */
#[Fillable([
    'product_code',
    'product_category_id',
    'name',
    'slug',
    'description',
    'brand',
    'fragrance_type',
    'price',
    'flash_sale_price',
    'original_price',
    'discount_percentage',
    'stock_quantity',
    'weight_kg',
    'sizes',
    'size_prices',
    'size_quantities',
    'colors',
    'variants',
    'photo_path',
    'photo_paths',
    'is_active',
    'is_flash_sale',
    'flash_sale_ends_at',
    'flash_sale_size_quantities',
])]
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    protected $appends = ['photo_url', 'photo_urls', 'is_flash_sale_active'];

    protected static function booted(): void
    {
        static::created(function (Product $product): void {
            if ($product->product_code) {
                return;
            }

            $product->forceFill([
                'product_code' => self::codeForId((int) $product->id),
            ])->saveQuietly();
        });
    }

    public static function codeForId(int $id): string
    {
        return 'SM-'.str_pad((string) (100000 + $id), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'flash_sale_price' => 'decimal:2',
            'original_price' => 'decimal:2',
            'discount_percentage' => 'integer',
            'stock_quantity' => 'integer',
            'weight_kg' => 'decimal:2',
            'sizes' => 'array',
            'size_prices' => 'array',
            'size_quantities' => 'array',
            'colors' => 'array',
            'variants' => 'array',
            'photo_paths' => 'array',
            'is_active' => 'boolean',
            'is_flash_sale' => 'boolean',
            'flash_sale_ends_at' => 'datetime',
            'flash_sale_size_quantities' => 'array',
        ];
    }

    /**
     * @return BelongsTo<ProductCategory, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'product_category_id');
    }

    /**
     * @return HasMany<ProductReview, $this>
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }

    public function getIsFlashSaleActiveAttribute(): bool
    {
        return (bool) $this->is_flash_sale
            && (! $this->flash_sale_ends_at || $this->flash_sale_ends_at->isFuture());
    }

    public function getPhotoUrlAttribute(): ?string
    {
        $firstPhotoPath = $this->photo_paths[0] ?? $this->photo_path;

        return $firstPhotoPath ? asset($firstPhotoPath) : null;
    }

    /**
     * @return array<int, string>
     */
    public function getPhotoUrlsAttribute(): array
    {
        $paths = $this->photo_paths ?? [];

        if ($paths === [] && $this->photo_path) {
            $paths = [$this->photo_path];
        }

        return collect($paths)
            ->filter()
            ->map(fn (string $path) => asset($path))
            ->values()
            ->all();
    }
}

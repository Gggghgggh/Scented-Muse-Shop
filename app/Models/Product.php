<?php

namespace App\Models;

use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

#[Fillable([
    'product_category_id',
    'name',
    'slug',
    'description',
    'brand',
    'price',
    'flash_sale_price',
    'original_price',
    'discount_percentage',
    'stock_quantity',
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

        return $firstPhotoPath ? Storage::disk('public')->url($firstPhotoPath) : null;
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
            ->map(fn (string $path) => Storage::disk('public')->url($path))
            ->values()
            ->all();
    }
}

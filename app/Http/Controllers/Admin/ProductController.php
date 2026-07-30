<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Throwable;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));

        return Inertia::render('admin/products/index', [
            'products' => Product::query()
                ->with('category:id,name')
                ->when($search !== '', function ($query) use ($search): void {
                    $query->where(function ($query) use ($search): void {
                        $query->where('name', 'like', "%{$search}%")
                            ->orWhere('slug', 'like', "%{$search}%")
                            ->orWhere('brand', 'like', "%{$search}%")
                            ->orWhere('description', 'like', "%{$search}%")
                            ->orWhereHas('category', fn ($query) => $query->where('name', 'like', "%{$search}%"));
                    });
                })
                ->latest()
                ->paginate(15)
                ->withQueryString(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/products/create', [
            'categories' => $this->categoriesForSelect(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatedData($request);

        try {
            $photoPaths = $this->storeUploadedPhotos($request);

            if ($photoPaths !== []) {
                $data['photo_path'] = $photoPaths[0];
                $data['photo_paths'] = $photoPaths;
            }

            Product::create($data);
        } catch (Throwable $exception) {
            Log::error('Product creation failed.', ['message' => $exception->getMessage()]);

            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Product could not be created. Please try again.',
            ]);
        }

        return to_route('admin.products.index')->with('toast', [
            'type' => 'success',
            'message' => 'Product created successfully.',
        ]);
    }

    public function edit(Product $product): Response
    {
        return Inertia::render('admin/products/edit', [
            'product' => $product->load('category:id,name'),
            'categories' => $this->categoriesForSelect(),
        ]);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $data = $this->validatedData($request, $product);

        try {
            $photoPaths = $this->storeUploadedPhotos($request);

            if ($photoPaths !== []) {
                $this->deleteProductMainPhotos($product);
                $data['photo_path'] = $photoPaths[0];
                $data['photo_paths'] = $photoPaths;
            }

            $product->update($data);
        } catch (Throwable $exception) {
            Log::error('Product update failed.', ['product_id' => $product->id, 'message' => $exception->getMessage()]);

            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Product could not be saved. Please try again.',
            ]);
        }

        return to_route('admin.products.index')->with('toast', [
            'type' => 'success',
            'message' => 'Product updated successfully.',
        ]);
    }

    public function destroy(Product $product): RedirectResponse
    {
        try {
            $this->deleteProductPhotos($product);

            $product->delete();
        } catch (Throwable $exception) {
            Log::error('Product deletion failed.', ['product_id' => $product->id, 'message' => $exception->getMessage()]);

            return back()->with('toast', [
                'type' => 'error',
                'message' => 'This product could not be deleted. Please try again.',
            ]);
        }

        return to_route('admin.products.index')->with('toast', [
            'type' => 'success',
            'message' => 'Product deleted successfully.',
        ]);
    }

    /**
     * @return array<int, ProductCategory>
     */
    private function categoriesForSelect(): array
    {
        return ProductCategory::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->all();
    }

    /**
     * @return array{
     *     product_category_id: int,
     *     name: string,
     *     slug: string,
     *     description: string,
     *     brand: string|null,
     *     fragrance_type: string|null,
     *     price: numeric,
     *     flash_sale_price: numeric|null,
     *     original_price: numeric|null,
     *     discount_percentage: int|null,
     *     stock_quantity: int,
     *     sizes: array<int, string>|null,
     *     size_prices: array<string, numeric>|null,
     *     size_quantities: array<string, int>|null,
     *     colors: array<int, string>|null,
     *     variants: array<int, array{size: string, color: string|null, price: numeric, flash_sale_price: numeric|null, quantity: int, flash_sale_quantity: int, photo_paths?: array<int, string>, photo_urls?: array<int, string>}>|null,
     *     photo_path?: string,
     *     photo_paths?: array<int, string>,
     *     is_active: bool,
     *     is_flash_sale: bool,
     *     flash_sale_ends_at: string|null,
     *     flash_sale_size_quantities: array<string, int>|null
     * }
     */
    private function validatedData(Request $request, ?Product $product = null): array
    {
        $data = $request->validate([
            'product_category_id' => ['required', 'integer', 'exists:product_categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('products', 'slug')->ignore($product),
            ],
            'description' => ['required', 'string'],
            'brand' => ['nullable', 'string', 'max:120'],
            'fragrance_type' => ['nullable', 'string', Rule::in(['EDP', 'EDT', 'Perfume', 'Pour Homme', 'Arabic'])],
            'price' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'flash_sale_price' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'original_price' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'sizes' => ['nullable', 'array', 'max:30'],
            'sizes.*' => ['nullable', 'string', 'max:50'],
            'size_prices' => ['nullable', 'array', 'max:30'],
            'size_prices.*' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'size_quantities' => ['nullable', 'array', 'max:30'],
            'size_quantities.*' => ['nullable', 'integer', 'min:0'],
            'colors' => ['nullable', 'array', 'max:30'],
            'colors.*' => ['nullable', 'string', 'max:50'],
            'variants' => ['nullable', 'array', 'max:120'],
            'variants.*.size' => ['nullable', 'string', 'max:50'],
            'variants.*.color' => ['nullable', 'string', 'max:50'],
            'variants.*.original_price' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'variants.*.price' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'variants.*.flash_sale_price' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'variants.*.quantity' => ['nullable', 'integer', 'min:0'],
            'variants.*.flash_sale_quantity' => ['nullable', 'integer', 'min:0'],
            'variants.*.photo_paths' => ['nullable', 'array', 'max:6'],
            'variants.*.photo_paths.*' => ['string', 'max:255'],
            'variants.*.photos' => ['nullable', 'array', 'max:6'],
            'variants.*.photos.*' => ['image', 'max:4096'],
            'photo' => ['nullable', 'image', 'max:4096'],
            'photos' => [$product ? 'nullable' : 'required_without:photo', 'array', 'max:8'],
            'photos.*' => ['image', 'max:4096'],
            'is_active' => ['boolean'],
            'is_flash_sale' => ['boolean'],
            'flash_sale_ends_at' => ['nullable', 'date'],
            'flash_sale_size_quantities' => ['nullable', 'array', 'max:30'],
            'flash_sale_size_quantities.*' => ['nullable', 'integer', 'min:0'],
        ]);

        $slug = filled($data['slug'] ?? null) ? $data['slug'] : $data['name'];
        $fallbackPrice = filled($data['price'] ?? null)
            ? (float) $data['price']
            : 0.0;
        $fallbackFlashSalePrice = filled($data['flash_sale_price'] ?? null)
            ? (float) $data['flash_sale_price']
            : null;

        $variants = collect($this->toArrayList($data['variants'] ?? []))
            ->map(function (array $variant, int $index) use ($request, $fallbackPrice, $fallbackFlashSalePrice): array {
                $size = trim((string) ($variant['size'] ?? ''));
                $color = trim((string) ($variant['color'] ?? ''));
                $variantPrice = filled($variant['price'] ?? null)
                    ? (float) $variant['price']
                    : $fallbackPrice;
                $variantOriginalPrice = filled($variant['original_price'] ?? null)
                    ? (float) $variant['original_price']
                    : null;
                $variantDiscountPercentage = $variantOriginalPrice && $variantOriginalPrice > $variantPrice
                    ? (int) round((($variantOriginalPrice - $variantPrice) / $variantOriginalPrice) * 100)
                    : null;
                $quantity = (int) ($variant['quantity'] ?? 0);
                $flashSaleQuantity = min(
                    (int) ($variant['flash_sale_quantity'] ?? 0),
                    $quantity,
                );

                $photoPaths = $this->storeUploadedVariantPhotos($request, $index);
                $existingPhotoPaths = collect($this->toStringList($variant['photo_paths'] ?? []))
                    ->filter()
                    ->values()
                    ->all();
                $variantPhotoPaths = $photoPaths !== [] ? $photoPaths : $existingPhotoPaths;

                return [
                    'size' => $size,
                    'color' => $color === '' ? null : $color,
                    'original_price' => $variantOriginalPrice,
                    'price' => $variantPrice,
                    'discount_percentage' => $variantDiscountPercentage,
                    'flash_sale_price' => filled($variant['flash_sale_price'] ?? null)
                        ? (float) $variant['flash_sale_price']
                        : $fallbackFlashSalePrice,
                    'quantity' => $quantity,
                    'flash_sale_quantity' => $flashSaleQuantity,
                    'photo_paths' => $variantPhotoPaths,
                    'photo_urls' => $this->photoUrls($variantPhotoPaths),
                ];
            })
            ->filter(fn (array $variant): bool => $variant['size'] !== '')
            ->values();

        $price = filled($data['price'] ?? null)
            ? (float) $data['price']
            : (float) ($variants->pluck('price')->filter(fn ($value): bool => $value !== null)->min() ?? 0);
        $flashSalePrice = filled($data['flash_sale_price'] ?? null)
            ? (float) $data['flash_sale_price']
            : $variants
                ->pluck('flash_sale_price')
                ->filter(fn ($value): bool => $value !== null)
                ->min();
        $originalPrice = filled($data['original_price'] ?? null)
            ? (float) $data['original_price']
            : $variants
                ->pluck('original_price')
                ->filter(fn ($value): bool => $value !== null && (float) $value > $price)
                ->max();
        $discountPercentage = $originalPrice && $originalPrice > $price
            ? (int) round((($originalPrice - $price) / $originalPrice) * 100)
            : null;

        if ($price <= 0.0) {
            throw ValidationException::withMessages([
                'price' => 'Set a base price, or add at least one size/color option with a price.',
            ]);
        }

        $sizes = $variants->isNotEmpty()
            ? $variants->pluck('size')->unique()->values()
            : collect($this->toStringList($data['sizes'] ?? []))
                ->map(fn (?string $size) => trim((string) $size))
                ->filter()
                ->unique()
                ->values();
        $colors = $variants->isNotEmpty()
            ? $variants->pluck('color')->filter()->unique()->values()->all()
            : collect($this->toStringList($data['colors'] ?? []))
                ->map(fn (?string $color) => trim((string) $color))
                ->filter()
                ->unique()
                ->values()
                ->all();
        $sizePrices = $sizes
            ->mapWithKeys(function (string $size) use ($data, $variants): array {
                if ($variants->isNotEmpty()) {
                    $variantPrices = $variants
                        ->where('size', $size)
                        ->pluck('price')
                        ->unique()
                        ->values();

                    return $variantPrices->count() === 1
                        ? [$size => (float) $variantPrices->first()]
                        : [];
                }

                $value = $data['size_prices'][$size] ?? null;

                return filled($value) ? [$size => (float) $value] : [];
            })
            ->all();
        $sizeQuantities = $sizes
            ->mapWithKeys(function (string $size) use ($data, $variants): array {
                if ($variants->isNotEmpty()) {
                    return [
                        $size => (int) $variants
                            ->where('size', $size)
                            ->sum('quantity'),
                    ];
                }

                $value = $data['size_quantities'][$size] ?? null;

                return filled($value) ? [$size => (int) $value] : [];
            })
            ->all();
        $flashSaleSizeQuantities = $sizes
            ->mapWithKeys(function (string $size) use ($data, $sizeQuantities, $variants): array {
                if ($variants->isNotEmpty()) {
                    $quantity = (int) $variants
                        ->where('size', $size)
                        ->sum('flash_sale_quantity');

                    return $quantity > 0 ? [$size => $quantity] : [];
                }

                $value = $data['flash_sale_size_quantities'][$size] ?? null;

                if (! filled($value)) {
                    return [];
                }

                $quantity = (int) $value;
                $availableQuantity = $sizeQuantities[$size] ?? null;

                return [$size => $availableQuantity === null ? $quantity : min($quantity, $availableQuantity)];
            })
            ->filter(fn (int $quantity): bool => $quantity > 0)
            ->all();
        $stockQuantity = $sizeQuantities === []
            ? (int) $data['stock_quantity']
            : array_sum($sizeQuantities);

        return [
            'product_category_id' => (int) $data['product_category_id'],
            'name' => $data['name'],
            'slug' => Str::slug($slug),
            'description' => $data['description'],
            'brand' => $data['brand'] ?? null,
            'fragrance_type' => $data['fragrance_type'] ?? null,
            'price' => $price,
            'flash_sale_price' => (bool) ($data['is_flash_sale'] ?? false)
                ? $flashSalePrice
                : null,
            'original_price' => $originalPrice,
            'discount_percentage' => $discountPercentage,
            'stock_quantity' => $stockQuantity,
            'sizes' => $sizes->all(),
            'size_prices' => $sizePrices,
            'size_quantities' => $sizeQuantities,
            'colors' => $colors,
            'variants' => $variants->all(),
            'is_active' => (bool) ($data['is_active'] ?? false),
            'is_flash_sale' => (bool) ($data['is_flash_sale'] ?? false),
            'flash_sale_ends_at' => $data['flash_sale_ends_at'] ?? null,
            'flash_sale_size_quantities' => (bool) ($data['is_flash_sale'] ?? false)
                ? $flashSaleSizeQuantities
                : [],
        ];
    }

    /**
     * @return array<int, string>
     */
    private function storeUploadedPhotos(Request $request): array
    {
        $files = [];

        if ($request->hasFile('photos')) {
            $files = $request->file('photos', []);

            if (! is_array($files)) {
                $files = [$files];
            }
        } elseif ($request->hasFile('photo')) {
            $files = [$request->file('photo')];
        }

        return collect($files)
            ->filter()
            ->map(fn (UploadedFile $file) => $this->storeOrFail($file, 'products'))
            ->values()
            ->all();
    }

    /**
     * @return array<int, string>
     */
    private function storeUploadedVariantPhotos(Request $request, int $index): array
    {
        $files = $request->file("variants.$index.photos", []);

        if (! is_array($files)) {
            $files = [$files];
        }

        return collect($files)
            ->filter()
            ->map(fn (UploadedFile $file) => $this->storeOrFail($file, 'products/variants'))
            ->values()
            ->all();
    }

    private function storeOrFail(UploadedFile $file, string $directory): string
    {
        $targetDirectory = public_path('uploads/'.$directory);

        if (! is_dir($targetDirectory) && ! mkdir($targetDirectory, 0755, true) && ! is_dir($targetDirectory)) {
            throw new RuntimeException("Failed to create upload directory \"{$directory}\".");
        }

        $filename = uniqid().'_'.$file->getClientOriginalName();
        $file->move($targetDirectory, $filename);

        return 'uploads/'.$directory.'/'.$filename;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function toArrayList(mixed $value): array
    {
        if (! is_array($value)) {
            return [];
        }

        return array_values(array_filter($value, 'is_array'));
    }

    /**
     * @return array<int, string>
     */
    private function toStringList(mixed $value): array
    {
        if (! is_array($value)) {
            return [];
        }

        return array_values(array_filter($value, 'is_string'));
    }

    /**
     * @param  array<int, string>  $paths
     * @return array<int, string>
     */
    private function photoUrls(array $paths): array
    {
        return collect($paths)
            ->filter()
            ->map(fn (string $path) => asset($path))
            ->values()
            ->all();
    }

    private function deleteProductPhotos(Product $product): void
    {
        $paths = $this->productMainPhotoPaths($product);

        foreach ($product->variants ?? [] as $variant) {
            $paths = [
                ...$paths,
                ...($variant['photo_paths'] ?? []),
            ];
        }

        $this->deletePublicFiles($paths);
    }

    private function deleteProductMainPhotos(Product $product): void
    {
        $paths = $this->productMainPhotoPaths($product);

        $this->deletePublicFiles($paths);
    }

    /**
     * @return array<int, string>
     */
    private function productMainPhotoPaths(Product $product): array
    {
        $paths = $product->photo_paths ?? [];

        if ($paths === [] && $product->photo_path) {
            $paths = [$product->photo_path];
        }

        return $paths;
    }

    /**
     * @param  array<int, string>  $paths
     */
    private function deletePublicFiles(array $paths): void
    {
        foreach ($paths as $path) {
            $file = public_path($path);

            if (file_exists($file)) {
                unlink($file);
            }
        }
    }
}

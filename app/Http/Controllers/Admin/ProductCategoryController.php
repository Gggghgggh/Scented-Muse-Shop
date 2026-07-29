<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ProductCategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));

        return Inertia::render('admin/categories/index', [
            'categories' => ProductCategory::query()
                ->withCount('products')
                ->when($search !== '', function ($query) use ($search): void {
                    $query->where(function ($query) use ($search): void {
                        $query->where('name', 'like', "%{$search}%")
                            ->orWhere('slug', 'like', "%{$search}%")
                            ->orWhere('description', 'like', "%{$search}%");
                    });
                })
                ->latest()
                ->paginate(15)
                ->withQueryString(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/categories/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatedData($request);

        try {
            ProductCategory::create($data);
        } catch (Throwable $exception) {
            Log::error('Category creation failed.', ['message' => $exception->getMessage()]);

            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Category could not be created. Please try again.',
            ]);
        }

        return to_route('admin.categories.index')->with('toast', [
            'type' => 'success',
            'message' => 'Category created successfully.',
        ]);
    }

    public function edit(ProductCategory $category): Response
    {
        return Inertia::render('admin/categories/edit', [
            'category' => $category->loadCount('products'),
        ]);
    }

    public function update(Request $request, ProductCategory $category): RedirectResponse
    {
        $data = $this->validatedData($request, $category);

        try {
            $category->update($data);
        } catch (Throwable $exception) {
            Log::error('Category update failed.', ['category_id' => $category->id, 'message' => $exception->getMessage()]);

            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Category could not be saved. Please try again.',
            ]);
        }

        return to_route('admin.categories.index')->with('toast', [
            'type' => 'success',
            'message' => 'Category updated successfully.',
        ]);
    }

    public function destroy(ProductCategory $category): RedirectResponse
    {
        try {
            $category->products()->each(function ($product): void {
                $paths = $product->photo_paths ?? [];

                if ($paths === [] && $product->photo_path) {
                    $paths = [$product->photo_path];
                }

                if ($paths !== []) {
                    Storage::disk('public')->delete($paths);
                }
            });

            $category->delete();
        } catch (Throwable $exception) {
            Log::error('Category deletion failed.', ['category_id' => $category->id, 'message' => $exception->getMessage()]);

            return back()->with('toast', [
                'type' => 'error',
                'message' => 'This category could not be deleted. Please try again.',
            ]);
        }

        return to_route('admin.categories.index')->with('toast', [
            'type' => 'success',
            'message' => 'Category deleted successfully.',
        ]);
    }

    /**
     * @return array{name: string, slug: string, description: string|null, is_active: bool}
     */
    private function validatedData(Request $request, ?ProductCategory $category = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('product_categories', 'slug')->ignore($category),
            ],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $slug = filled($data['slug'] ?? null) ? $data['slug'] : $data['name'];

        return [
            'name' => $data['name'],
            'slug' => Str::slug($slug),
            'description' => $data['description'] ?? null,
            'is_active' => (bool) ($data['is_active'] ?? false),
        ];
    }
}

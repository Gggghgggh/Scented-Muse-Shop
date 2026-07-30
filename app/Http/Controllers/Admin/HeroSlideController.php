<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HeroSlide;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Throwable;

class HeroSlideController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/hero-slides/index', [
            'heroSlides' => HeroSlide::query()->ordered()->paginate(15),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/hero-slides/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatedData($request);

        try {
            $data['image_path'] = $this->storeHeroSlideImage($request);

            HeroSlide::create($data);
        } catch (Throwable $exception) {
            Log::error('Hero slide creation failed.', ['message' => $exception->getMessage()]);

            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Hero slide could not be created. Please try again.',
            ]);
        }

        return to_route('admin.hero-slides.index')->with('toast', [
            'type' => 'success',
            'message' => 'Hero slide created successfully.',
        ]);
    }

    public function edit(HeroSlide $heroSlide): Response
    {
        return Inertia::render('admin/hero-slides/edit', [
            'heroSlide' => $heroSlide,
        ]);
    }

    public function update(Request $request, HeroSlide $heroSlide): RedirectResponse
    {
        $data = $this->validatedData($request, $heroSlide);

        try {
            if ($request->hasFile('image')) {
                $this->deletePublicFile($heroSlide->image_path);
                $data['image_path'] = $this->storeHeroSlideImage($request);
            }

            $heroSlide->update($data);
        } catch (Throwable $exception) {
            Log::error('Hero slide update failed.', ['hero_slide_id' => $heroSlide->id, 'message' => $exception->getMessage()]);

            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Hero slide could not be saved. Please try again.',
            ]);
        }

        return to_route('admin.hero-slides.index')->with('toast', [
            'type' => 'success',
            'message' => 'Hero slide updated successfully.',
        ]);
    }

    public function destroy(HeroSlide $heroSlide): RedirectResponse
    {
        try {
            $this->deletePublicFile($heroSlide->image_path);
            $heroSlide->delete();
        } catch (Throwable $exception) {
            Log::error('Hero slide deletion failed.', ['hero_slide_id' => $heroSlide->id, 'message' => $exception->getMessage()]);

            return back()->with('toast', [
                'type' => 'error',
                'message' => 'This hero slide could not be deleted. Please try again.',
            ]);
        }

        return to_route('admin.hero-slides.index')->with('toast', [
            'type' => 'success',
            'message' => 'Hero slide deleted successfully.',
        ]);
    }

    /**
     * @return array{eyebrow: string|null, heading: string|null, subheading: string|null, sort_order: int, is_active: bool}
     */
    private function validatedData(Request $request, ?HeroSlide $heroSlide = null): array
    {
        $data = $request->validate([
            'image' => [$heroSlide ? 'nullable' : 'required', 'image', 'max:8192'],
            'eyebrow' => ['nullable', 'string', 'max:120'],
            'heading' => ['nullable', 'string', 'max:150'],
            'subheading' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        return [
            'eyebrow' => $data['eyebrow'] ?? null,
            'heading' => $data['heading'] ?? null,
            'subheading' => $data['subheading'] ?? null,
            'sort_order' => (int) ($data['sort_order'] ?? 0),
            'is_active' => (bool) ($data['is_active'] ?? false),
        ];
    }

    private function storeHeroSlideImage(Request $request): string
    {
        $file = $request->file('image');

        if (! $file instanceof UploadedFile) {
            throw new RuntimeException('Hero slide image upload is missing.');
        }

        $directory = public_path('uploads/hero-slides');

        if (! is_dir($directory) && ! mkdir($directory, 0755, true) && ! is_dir($directory)) {
            throw new RuntimeException('Failed to create hero slide upload directory.');
        }

        $filename = time().'_'.$file->getClientOriginalName();
        $file->move($directory, $filename);

        return 'uploads/hero-slides/'.$filename;
    }

    private function deletePublicFile(string $path): void
    {
        $file = public_path($path);

        if (file_exists($file)) {
            unlink($file);
        }
    }
}

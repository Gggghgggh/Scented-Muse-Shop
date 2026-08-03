<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('hero_slides')
            ->select(['id', 'image_path'])
            ->orderBy('id')
            ->each(function (object $heroSlide): void {
                DB::table('hero_slides')
                    ->where('id', $heroSlide->id)
                    ->update([
                        'image_path' => $this->normalizePath((string) $heroSlide->image_path),
                    ]);
            });

        DB::table('products')
            ->select(['id', 'photo_path', 'photo_paths', 'variants'])
            ->orderBy('id')
            ->each(function (object $product): void {
                $photoPaths = $this->decodeArray($product->photo_paths);
                $variants = $this->decodeArray($product->variants);

                DB::table('products')
                    ->where('id', $product->id)
                    ->update([
                        'photo_path' => $product->photo_path ? $this->normalizePath((string) $product->photo_path) : null,
                        'photo_paths' => $photoPaths === []
                            ? null
                            : json_encode(array_map(fn (string $path): string => $this->normalizePath($path), $photoPaths)),
                        'variants' => $variants === []
                            ? null
                            : json_encode(array_map(fn (array $variant): array => $this->normalizeVariant($variant), $variants)),
                    ]);
            });
    }

    public function down(): void
    {
        DB::table('hero_slides')
            ->select(['id', 'image_path'])
            ->orderBy('id')
            ->each(function (object $heroSlide): void {
                DB::table('hero_slides')
                    ->where('id', $heroSlide->id)
                    ->update([
                        'image_path' => $this->denormalizePath((string) $heroSlide->image_path),
                    ]);
            });

        DB::table('products')
            ->select(['id', 'photo_path', 'photo_paths', 'variants'])
            ->orderBy('id')
            ->each(function (object $product): void {
                $photoPaths = $this->decodeArray($product->photo_paths);
                $variants = $this->decodeArray($product->variants);

                DB::table('products')
                    ->where('id', $product->id)
                    ->update([
                        'photo_path' => $product->photo_path ? $this->denormalizePath((string) $product->photo_path) : null,
                        'photo_paths' => $photoPaths === []
                            ? null
                            : json_encode(array_map(fn (string $path): string => $this->denormalizePath($path), $photoPaths)),
                        'variants' => $variants === []
                            ? null
                            : json_encode(array_map(fn (array $variant): array => $this->denormalizeVariant($variant), $variants)),
                    ]);
            });
    }

    private function normalizeVariant(array $variant): array
    {
        if (isset($variant['photo_paths']) && is_array($variant['photo_paths'])) {
            $variant['photo_paths'] = array_values(array_map(
                fn (string $path): string => $this->normalizePath($path),
                array_filter($variant['photo_paths'], 'is_string'),
            ));
        }

        if (isset($variant['photo_urls'])) {
            unset($variant['photo_urls']);
        }

        return $variant;
    }

    private function denormalizeVariant(array $variant): array
    {
        if (isset($variant['photo_paths']) && is_array($variant['photo_paths'])) {
            $variant['photo_paths'] = array_values(array_map(
                fn (string $path): string => $this->denormalizePath($path),
                array_filter($variant['photo_paths'], 'is_string'),
            ));
        }

        if (isset($variant['photo_urls'])) {
            unset($variant['photo_urls']);
        }

        return $variant;
    }

    /**
     * @return array<int, mixed>
     */
    private function decodeArray(mixed $value): array
    {
        if (! is_string($value) || $value === '') {
            return [];
        }

        $decoded = json_decode($value, true);

        return is_array($decoded) ? $decoded : [];
    }

    private function normalizePath(string $path): string
    {
        $path = ltrim($path, '/');

        $legacyPrefix = 'stor'.'age/';

        if (str_starts_with($path, $legacyPrefix)) {
            $path = substr($path, strlen($legacyPrefix));
        }

        if (str_starts_with($path, 'uploads/')) {
            return $path;
        }

        return 'uploads/'.$path;
    }

    private function denormalizePath(string $path): string
    {
        return str_starts_with($path, 'uploads/')
            ? substr($path, strlen('uploads/'))
            : $path;
    }
};

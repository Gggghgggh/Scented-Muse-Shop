<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $image_path
 * @property string|null $eyebrow
 * @property string|null $heading
 * @property string|null $subheading
 * @property int $sort_order
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['image_path', 'eyebrow', 'heading', 'subheading', 'sort_order', 'is_active'])]
class HeroSlide extends Model
{
    protected $appends = ['image_url'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function getImageUrlAttribute(): string
    {
        return asset($this->image_path);
    }

    /**
     * @param  Builder<HeroSlide>  $query
     * @return Builder<HeroSlide>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * @param  Builder<HeroSlide>  $query
     * @return Builder<HeroSlide>
     */
    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('id');
    }
}

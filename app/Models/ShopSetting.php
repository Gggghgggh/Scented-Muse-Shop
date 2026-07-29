<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'shop_location',
    'shop_phone',
    'shopping_points_percentage',
])]
class ShopSetting extends Model
{
    protected function casts(): array
    {
        return [
            'shopping_points_percentage' => 'decimal:2',
        ];
    }

    public static function current(): self
    {
        return self::query()->firstOrCreate([], [
            'shop_location' => 'Online Ecommerce Shopping',
            'shop_phone' => '+254 700 000 000',
            'shopping_points_percentage' => 10,
        ]);
    }
}

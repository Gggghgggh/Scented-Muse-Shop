<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string|null $shop_location
 * @property string|null $shop_phone
 * @property string|null $whatsapp_number
 * @property string $shopping_points_percentage
 */
#[Fillable([
    'shop_location',
    'shop_phone',
    'whatsapp_number',
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
            'whatsapp_number' => null,
            'shopping_points_percentage' => 10,
        ]);
    }
}

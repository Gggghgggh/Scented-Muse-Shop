<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $county
 * @property string $town
 * @property string $base_fee
 * @property string $fee_per_kg
 * @property bool $is_active
 */
#[Fillable(['county', 'town', 'base_fee', 'fee_per_kg', 'is_active'])]
class DeliveryRate extends Model
{
    protected function casts(): array
    {
        return [
            'base_fee' => 'decimal:2',
            'fee_per_kg' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public static function quote(string $county, string $town, float $weightKg): float
    {
        $rate = self::query()
            ->where('county', $county)
            ->where('town', $town)
            ->where('is_active', true)
            ->first();

        if (! $rate) {
            return 200.0;
        }

        return round((float) $rate->base_fee + max(0.0, $weightKg) * (float) $rate->fee_per_kg, 2);
    }
}

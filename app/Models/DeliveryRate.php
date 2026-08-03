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
 * @property string $fee_0_1kg
 * @property string $fee_1_3kg
 * @property string $fee_3_5kg
 * @property string $fee_over_5kg
 * @property bool $is_active
 */
#[Fillable(['county', 'town', 'base_fee', 'fee_per_kg', 'fee_0_1kg', 'fee_1_3kg', 'fee_3_5kg', 'fee_over_5kg', 'is_active'])]
class DeliveryRate extends Model
{
    protected function casts(): array
    {
        return [
            'base_fee' => 'decimal:2',
            'fee_per_kg' => 'decimal:2',
            'fee_0_1kg' => 'decimal:2',
            'fee_1_3kg' => 'decimal:2',
            'fee_3_5kg' => 'decimal:2',
            'fee_over_5kg' => 'decimal:2',
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

        $weightKg = max(0.0, $weightKg);

        return match (true) {
            $weightKg <= 1.0 => (float) $rate->fee_0_1kg,
            $weightKg <= 3.0 => (float) $rate->fee_1_3kg,
            $weightKg <= 5.0 => (float) $rate->fee_3_5kg,
            default => (float) $rate->fee_over_5kg,
        };
    }
}

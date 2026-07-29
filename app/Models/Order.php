<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'user_id',
    'order_number',
    'customer_name',
    'customer_email',
    'customer_phone',
    'county',
    'town',
    'items',
    'delivery_fee',
    'total_amount',
    'status',
    'notes',
])]
class Order extends Model
{
    protected function casts(): array
    {
        return [
            'items' => 'array',
            'delivery_fee' => 'decimal:2',
            'total_amount' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $order_id
 * @property string $payment_number
 * @property string $customer_name
 * @property string $method
 * @property string $amount
 * @property string $status
 * @property string|null $transaction_reference
 * @property string|null $lipana_transaction_id
 * @property string|null $lipana_checkout_request_id
 * @property string|null $lipana_receipt_number
 * @property string|null $lipana_customer_name
 * @property string|null $lipana_event
 * @property array<string, mixed>|null $lipana_webhook_payload
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'order_id',
    'payment_number',
    'customer_name',
    'method',
    'amount',
    'status',
    'transaction_reference',
    'lipana_transaction_id',
    'lipana_checkout_request_id',
    'lipana_receipt_number',
    'lipana_customer_name',
    'lipana_event',
    'lipana_webhook_payload',
    'notes',
])]
class Payment extends Model
{
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'lipana_webhook_payload' => 'array',
        ];
    }

    /**
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}

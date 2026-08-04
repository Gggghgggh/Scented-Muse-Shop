<?php

namespace App\Http\Controllers;

use App\Models\DeliveryRate;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ShopSetting;
use App\Services\LipanaService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class CheckoutController extends Controller
{
    public function store(Request $request, LipanaService $lipana): JsonResponse|RedirectResponse
    {
        $data = $request->validate([
            'county' => ['required', 'string', 'max:80'],
            'town' => ['required', 'string', 'max:80'],
            'customer_phone' => ['required', 'string', 'max:40'],
            'payment_method' => ['required', Rule::in(['cash_on_delivery', 'mpesa', 'card'])],
            'items' => ['required', 'array', 'min:1', 'max:60'],
            'items.*.id' => ['required', 'integer', 'exists:products,id'],
            'items.*.size' => ['nullable', 'string', 'max:50'],
            'items.*.color' => ['nullable', 'string', 'max:50'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:999'],
        ]);

        $checkout = DB::transaction(function () use ($data, $request): array {
            $orderItems = [];
            $subtotal = 0;
            $totalWeightKg = 0.0;

            foreach ($data['items'] as $item) {
                $product = Product::query()
                    ->whereKey($item['id'])
                    ->where('is_active', true)
                    ->lockForUpdate()
                    ->firstOrFail();

                $size = (string) ($item['size'] ?? '');
                $color = (string) ($item['color'] ?? '');
                $quantity = (int) $item['quantity'];
                [$unitPrice, $availableQuantity, $variantIndex] = $this->pricedAvailability($product, $size, $color);

                if ($availableQuantity < $quantity) {
                    throw ValidationException::withMessages([
                        'items' => "{$product->name} only has {$availableQuantity} available for the selected option.",
                    ]);
                }

                $this->decrementProductQuantity($product, $quantity, $variantIndex);

                $lineTotal = $unitPrice * $quantity;
                $subtotal += $lineTotal;
                $lineWeightKg = (float) $product->weight_kg * $quantity;
                $totalWeightKg += $lineWeightKg;
                $orderItems[] = [
                    'product_id' => $product->id,
                    'product_code' => $product->product_code,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'size' => $size === '' ? null : $size,
                    'color' => $color === '' ? null : $color,
                    'quantity' => $quantity,
                    'weight_kg' => (float) $product->weight_kg,
                    'line_weight_kg' => $lineWeightKg,
                    'unit_price' => $unitPrice,
                    'line_total' => $lineTotal,
                    'photo_url' => $product->photo_url,
                ];
            }

            $deliveryFee = DeliveryRate::quote($data['county'], $data['town'], $totalWeightKg);
            $total = $subtotal + $deliveryFee;

            $order = Order::create([
                'user_id' => $request->user()->id,
                'order_number' => 'HOD-'.Str::upper(Str::random(8)),
                'customer_name' => $request->user()->name,
                'customer_email' => $request->user()->email,
                'customer_phone' => $data['customer_phone'],
                'county' => $data['county'],
                'town' => $data['town'],
                'items' => $orderItems,
                'delivery_fee' => $deliveryFee,
                'total_amount' => $total,
                'status' => 'processing',
                'notes' => 'Customer checkout order.',
            ]);

            $payment = Payment::create([
                'order_id' => $order->id,
                'payment_number' => 'PAY-'.Str::upper(Str::random(8)),
                'customer_name' => $request->user()->name,
                'method' => $data['payment_method'],
                'amount' => $total,
                'status' => 'pending',
                'transaction_reference' => null,
                'notes' => $data['payment_method'] === 'cash_on_delivery'
                    ? 'Payment to be collected on delivery.'
                    : 'Awaiting M-Pesa confirmation.',
            ]);

            return [$order, $payment];
        });

        [$order, $payment] = $checkout;
        $message = 'Your order has been placed successfully.';

        if ($payment->method === 'mpesa') {
            try {
                $response = $lipana->initiateStkPush((float) $payment->amount, $data['customer_phone'], $order->order_number);

                $payment->update([
                    'lipana_transaction_id' => data_get($response, 'data.transactionId'),
                    'lipana_checkout_request_id' => data_get($response, 'data.checkoutRequestID'),
                    'transaction_reference' => data_get($response, 'data.transactionId', data_get($response, 'data.checkoutRequestID')),
                    'notes' => data_get($response, 'data.message', data_get($response, 'message', 'Lipana STK prompt sent. Awaiting confirmation.')),
                ]);

                $message = 'Your order has been placed. Check your phone and enter your M-Pesa PIN to complete payment.';
            } catch (\Throwable $exception) {
                Log::error('Lipana STK push failed', [
                    'order_id' => $order->id,
                    'payment_id' => $payment->id,
                    'message' => $exception->getMessage(),
                ]);

                $payment->update([
                    'status' => 'failed',
                    'notes' => 'M-Pesa prompt could not be sent. Please contact support or choose cash on delivery.',
                ]);
                $order->update(['status' => 'payment_failed']);

                throw ValidationException::withMessages([
                    'payment_method' => 'M-Pesa payment could not start. Please confirm production Lipana credentials and try again.',
                ]);
            }
        }

        if ($request->expectsJson()) {
            return response()->json([
                'message' => $message,
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'payment_id' => $payment->id,
                'payment_status' => $payment->status,
                'status_url' => route('checkout.payment-status', $payment),
                'orders_url' => route('orders.mine'),
            ]);
        }

        return to_route('orders.mine')->with('checkout', [
            'type' => 'success',
            'message' => $message,
            'order_number' => $order->order_number,
            'receipt_url' => route('orders.receipt', $order),
        ]);
    }

    public function paymentStatus(Request $request, Payment $payment): JsonResponse
    {
        $payment->load('order:id,user_id,order_number,status,total_amount');
        $order = $payment->order;

        abort_unless(
            $order !== null && ((int) $order->user_id === (int) $request->user()->id || $request->user()->is_admin),
            403,
        );

        return response()->json([
            'payment_id' => $payment->id,
            'payment_number' => $payment->payment_number,
            'payment_status' => $payment->status,
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'order_status' => $order->status,
            'amount' => $payment->amount,
            'receipt_number' => $payment->lipana_receipt_number,
            'orders_url' => route('orders.mine'),
        ]);
    }

    public function lipanaWebhook(Request $request, LipanaService $lipana): JsonResponse
    {
        if (! $lipana->verifyWebhook($request)) {
            Log::warning('Lipana webhook signature verification failed');

            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $payload = $request->all();
        $event = (string) data_get($payload, 'event', '');
        $metadata = $lipana->extractWebhookData($payload);
        $transactionId = $metadata['transaction_id'];
        $checkoutRequestId = $metadata['checkout_request_id'];

        if ($transactionId === null && $checkoutRequestId === null) {
            Log::warning('Lipana webhook missing transaction identifiers', ['payload' => $payload]);

            return response()->json(['status' => 'success']);
        }

        $payment = Payment::query()
            ->where(function ($query) use ($transactionId, $checkoutRequestId): void {
                if ($transactionId !== null) {
                    $query->where('lipana_transaction_id', $transactionId)
                        ->orWhere('transaction_reference', $transactionId);
                }

                if ($checkoutRequestId !== null) {
                    $query->orWhere('lipana_checkout_request_id', $checkoutRequestId)
                        ->orWhere('transaction_reference', $checkoutRequestId);
                }
            })
            ->first();

        if ($payment === null) {
            Log::warning('Lipana webhook for unknown transaction', [
                'transaction_id' => $transactionId,
                'checkout_request_id' => $checkoutRequestId,
                'payload' => $payload,
            ]);

            return response()->json(['status' => 'success']);
        }

        $successful = $event === 'transaction.success' || $metadata['status'] === 'success';
        $failed = in_array($event, ['transaction.failed', 'transaction.cancelled'], true)
            || in_array($metadata['status'], ['failed', 'cancelled'], true);

        DB::transaction(function () use ($payment, $payload, $event, $metadata, $successful, $failed): void {
            $payment->update([
                'status' => $successful ? 'paid' : ($failed ? 'failed' : $payment->status),
                'transaction_reference' => $metadata['receipt'] ?? $metadata['transaction_id'] ?? $payment->transaction_reference,
                'lipana_transaction_id' => $metadata['transaction_id'] ?? $payment->lipana_transaction_id,
                'lipana_checkout_request_id' => $metadata['checkout_request_id'] ?? $payment->lipana_checkout_request_id,
                'lipana_receipt_number' => $metadata['receipt'] ?? $payment->lipana_receipt_number,
                'lipana_customer_name' => $metadata['customer_name'] ?? $payment->lipana_customer_name,
                'lipana_event' => $event !== '' ? $event : $payment->lipana_event,
                'lipana_webhook_payload' => $payload,
                'notes' => $successful ? 'Lipana payment confirmed.' : ($failed ? 'Lipana payment failed or was cancelled.' : $payment->notes),
            ]);

            if ($successful || $failed) {
                $payment->order?->update([
                    'status' => $successful ? 'paid' : 'payment_failed',
                ]);
            }
        });

        return response()->json(['status' => 'success']);
    }

    public function receipt(Request $request, Order $order): Response
    {
        $user = $request->user();
        $ownsOrder = (int) $order->user_id === (int) $user->id
            || ($order->customer_email && $order->customer_email === $user->email);

        abort_unless($ownsOrder || $user->is_admin, 403);

        return Pdf::loadView('pdf.receipt', $this->receiptData($order))
            ->setPaper('a4')
            ->download($order->order_number.'-receipt.pdf');
    }

    /**
     * @return array{0: float, 1: int, 2: int|null}
     */
    private function pricedAvailability(Product $product, string $size, string $color): array
    {
        foreach ($product->variants ?? [] as $index => $variant) {
            if (($variant['size'] ?? '') === $size && ($variant['color'] ?? '') === $color) {
                $price = $product->is_flash_sale_active && (int) ($variant['flash_sale_quantity'] ?? 0) > 0
                    ? (float) ($variant['flash_sale_price'] ?? $variant['price'])
                    : (float) $variant['price'];
                $quantity = $product->is_flash_sale_active && (int) ($variant['flash_sale_quantity'] ?? 0) > 0
                    ? min((int) $variant['quantity'], (int) $variant['flash_sale_quantity'])
                    : (int) $variant['quantity'];

                return [$price, $quantity, $index];
            }
        }

        $price = $product->is_flash_sale_active && $product->flash_sale_price
            ? (float) $product->flash_sale_price
            : (float) $product->price;

        return [$price, $product->stock_quantity, null];
    }

    private function decrementProductQuantity(Product $product, int $quantity, ?int $variantIndex): void
    {
        if ($variantIndex === null) {
            $product->decrement('stock_quantity', $quantity);

            return;
        }

        $variants = $product->variants ?? [];
        $variants[$variantIndex]['quantity'] = max(0, (int) $variants[$variantIndex]['quantity'] - $quantity);

        if ((int) ($variants[$variantIndex]['flash_sale_quantity'] ?? 0) > 0) {
            $variants[$variantIndex]['flash_sale_quantity'] = max(0, (int) $variants[$variantIndex]['flash_sale_quantity'] - $quantity);
        }

        $product->variants = $variants;
        $product->stock_quantity = collect($variants)->sum(fn (array $variant): int => (int) $variant['quantity']);
        $product->size_quantities = collect($variants)
            ->groupBy('size')
            ->map(fn ($items): int => collect($items)->sum(fn (array $variant): int => (int) $variant['quantity']))
            ->all();
        $product->save();
    }

    /**
     * @return array{
     *     shop: array{name: string, location: string, phone: string},
     *     receipt: array{number: string, date: string, status: string},
     *     customer: array{name: string, phone: string, email: string, delivery_address: string},
     *     items: array<int, array{name: string, sku: string, size: string|null, color: string|null, qty: int, unit_price: float, discount: float, amount: float}>,
     *     totals: array{subtotal: float, discount: float, delivery_fee: float, total: float},
     *     payment: array{method: string, reference: string}
     * }
     */
    private function receiptData(Order $order): array
    {
        $payment = $order->payments()->latest()->first();
        $paymentNumber = $payment !== null ? $payment->payment_number : null;
        $paymentStatus = $payment !== null ? $payment->status : null;
        $paymentMethod = $payment !== null ? $payment->method : null;
        $paymentReference = $payment !== null ? $payment->transaction_reference : null;
        $settings = ShopSetting::current();
        $items = collect($order->items ?? [])->map(function (array $item): array {
            $unitPrice = (float) ($item['unit_price'] ?? 0);
            $quantity = (int) ($item['quantity'] ?? 1);
            $amount = (float) ($item['line_total'] ?? ($unitPrice * $quantity));

            return [
                'name' => (string) ($item['name'] ?? 'Product'),
                'sku' => (string) ($item['product_code'] ?? $item['slug'] ?? $item['product_id'] ?? 'SM'),
                'size' => $item['size'] ?? null,
                'color' => $item['color'] ?? null,
                'qty' => $quantity,
                'unit_price' => $unitPrice,
                'discount' => (float) ($item['discount'] ?? 0),
                'amount' => $amount,
            ];
        });
        $subtotal = $items->sum(fn (array $item): float => (float) $item['amount']);
        $discount = $items->sum(fn (array $item): float => (float) $item['discount']);
        $deliveryAddress = collect([$order->town, $order->county])
            ->filter()
            ->implode(', ');

        return [
            'shop' => [
                'name' => 'Scented Muse',
                'location' => $settings->shop_location ?: 'Online Ecommerce Shopping',
                'phone' => $settings->shop_phone ?: '+254 700 000 000',
            ],
            'receipt' => [
                'number' => $paymentNumber ?? $order->order_number,
                'date' => $order->created_at->format('d M Y, g:i A'),
                'status' => $paymentStatus ?? $order->status,
            ],
            'customer' => [
                'name' => $order->customer_name,
                'phone' => $order->customer_phone ?? 'Not provided',
                'email' => $order->customer_email ?? 'Not provided',
                'delivery_address' => $deliveryAddress !== '' ? $deliveryAddress : 'Not provided',
            ],
            'items' => $items->values()->all(),
            'totals' => [
                'subtotal' => $subtotal,
                'discount' => $discount,
                'delivery_fee' => (float) $order->delivery_fee,
                'total' => (float) $order->total_amount,
            ],
            'payment' => [
                'method' => Str::headline($paymentMethod ?? 'cash_on_delivery'),
                'reference' => $paymentReference ?? $paymentNumber ?? 'Pending',
            ],
        ];
    }
}

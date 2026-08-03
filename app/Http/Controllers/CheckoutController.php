<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ShopSetting;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class CheckoutController extends Controller
{
    public function store(Request $request): RedirectResponse
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

        $order = DB::transaction(function () use ($data, $request): Order {
            $orderItems = [];
            $subtotal = 0;
            $deliveryFee = 200;

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
                $orderItems[] = [
                    'product_id' => $product->id,
                    'product_code' => $product->product_code,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'size' => $size === '' ? null : $size,
                    'color' => $color === '' ? null : $color,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'line_total' => $lineTotal,
                    'photo_url' => $product->photo_url,
                ];
            }

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

            Payment::create([
                'order_id' => $order->id,
                'payment_number' => 'PAY-'.Str::upper(Str::random(8)),
                'customer_name' => $request->user()->name,
                'method' => $data['payment_method'],
                'amount' => $total,
                'status' => $data['payment_method'] === 'cash_on_delivery' ? 'pending' : 'paid',
                'transaction_reference' => $data['payment_method'] === 'cash_on_delivery'
                    ? null
                    : 'FAKE-'.Str::upper(Str::random(10)),
                'notes' => $data['payment_method'] === 'cash_on_delivery'
                    ? 'Payment to be collected on delivery.'
                    : 'Simulated successful checkout payment.',
            ]);

            return $order;
        });

        return to_route('orders.mine')->with('checkout', [
            'type' => 'success',
            'message' => 'Your order has been placed successfully.',
            'order_number' => $order->order_number,
            'receipt_url' => route('orders.receipt', $order),
        ]);
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

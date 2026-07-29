<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));

        return Inertia::render('admin/orders/index', [
            'orders' => Order::query()
                ->with([
                    'user:id,name,email',
                    'payments:id,order_id,payment_number,method,amount,status,transaction_reference',
                ])
                ->when($search !== '', function ($query) use ($search): void {
                    $query->where(function ($query) use ($search): void {
                        $query->where('order_number', 'like', "%{$search}%")
                            ->orWhere('customer_name', 'like', "%{$search}%")
                            ->orWhere('customer_email', 'like', "%{$search}%")
                            ->orWhere('customer_phone', 'like', "%{$search}%")
                            ->orWhere('county', 'like', "%{$search}%")
                            ->orWhere('town', 'like', "%{$search}%")
                            ->orWhere('status', 'like', "%{$search}%")
                            ->orWhere('notes', 'like', "%{$search}%")
                            ->orWhereHas('user', fn ($query) => $query
                                ->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%"))
                            ->orWhereHas('payments', fn ($query) => $query
                                ->where('payment_number', 'like', "%{$search}%")
                                ->orWhere('method', 'like', "%{$search}%")
                                ->orWhere('status', 'like', "%{$search}%")
                                ->orWhere('transaction_reference', 'like', "%{$search}%"));
                    });
                })
                ->latest()
                ->paginate(15)
                ->withQueryString(),
            'users' => User::query()->orderBy('name')->get(['id', 'name', 'email']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/orders/create', [
            'users' => User::query()->orderBy('name')->get(['id', 'name', 'email']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatedData($request);

        try {
            Order::create($data + [
                'order_number' => 'HOD-'.Str::upper(Str::random(8)),
            ]);
        } catch (Throwable $exception) {
            Log::error('Order creation failed.', ['message' => $exception->getMessage()]);

            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Order could not be created. Please try again.',
            ]);
        }

        return to_route('admin.orders.index')->with('toast', [
            'type' => 'success',
            'message' => 'Order created successfully.',
        ]);
    }

    public function edit(Order $order): Response
    {
        return Inertia::render('admin/orders/edit', [
            'order' => $order,
            'users' => User::query()->orderBy('name')->get(['id', 'name', 'email']),
        ]);
    }

    public function update(Request $request, Order $order): RedirectResponse
    {
        $data = $this->validatedData($request, $order);

        try {
            $order->update($data);
        } catch (Throwable $exception) {
            Log::error('Order update failed.', ['order_id' => $order->id, 'message' => $exception->getMessage()]);

            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Order could not be saved. Please try again.',
            ]);
        }

        return to_route('admin.orders.index')->with('toast', [
            'type' => 'success',
            'message' => 'Order updated successfully.',
        ]);
    }

    public function destroy(Order $order): RedirectResponse
    {
        try {
            $order->delete();
        } catch (Throwable $exception) {
            Log::error('Order deletion failed.', ['order_id' => $order->id, 'message' => $exception->getMessage()]);

            return back()->with('toast', [
                'type' => 'error',
                'message' => 'This order could not be deleted. Please try again.',
            ]);
        }

        return to_route('admin.orders.index')->with('toast', [
            'type' => 'success',
            'message' => 'Order deleted successfully.',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedData(Request $request, ?Order $order = null): array
    {
        $data = $request->validate([
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_email' => ['nullable', 'email', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:40'],
            'county' => ['required', 'string', 'max:80'],
            'town' => ['required', 'string', 'max:80'],
            'items' => ['sometimes', 'required', 'string'],
            'delivery_fee' => ['nullable', 'numeric', 'min:0'],
            'total_amount' => ['required', 'numeric', 'min:0'],
            'status' => ['required', Rule::in(['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'])],
            'notes' => ['nullable', 'string'],
        ]);

        $lines = isset($data['items']) ? preg_split('/\r\n|\r|\n/', $data['items']) : null;

        return [
            ...$data,
            'delivery_fee' => $data['delivery_fee'] ?? 0,
            'items' => $lines !== null
                ? collect($lines === false ? [] : $lines)
                    ->filter()
                    ->map(fn (string $item) => ['name' => trim($item)])
                    ->values()
                    ->all()
                : $order?->items,
        ];
    }
}

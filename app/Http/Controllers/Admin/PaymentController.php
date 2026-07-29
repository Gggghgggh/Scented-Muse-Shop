<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));

        return Inertia::render('admin/payments/index', [
            'payments' => Payment::query()
                ->with('order:id,order_number')
                ->when($search !== '', function ($query) use ($search): void {
                    $query->where(function ($query) use ($search): void {
                        $query->where('payment_number', 'like', "%{$search}%")
                            ->orWhere('customer_name', 'like', "%{$search}%")
                            ->orWhere('method', 'like', "%{$search}%")
                            ->orWhere('status', 'like', "%{$search}%")
                            ->orWhere('transaction_reference', 'like', "%{$search}%")
                            ->orWhereHas('order', fn ($query) => $query->where('order_number', 'like', "%{$search}%"));
                    });
                })
                ->latest()
                ->paginate(15)
                ->withQueryString(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/payments/create', [
            'orders' => Order::query()->latest()->get(['id', 'order_number', 'customer_name', 'total_amount']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatedData($request);

        try {
            Payment::create($data + [
                'payment_number' => 'PAY-'.Str::upper(Str::random(8)),
            ]);
        } catch (Throwable $exception) {
            Log::error('Payment creation failed.', ['message' => $exception->getMessage()]);

            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Payment could not be created. Please try again.',
            ]);
        }

        return to_route('admin.payments.index')->with('toast', [
            'type' => 'success',
            'message' => 'Payment created successfully.',
        ]);
    }

    public function edit(Payment $payment): Response
    {
        return Inertia::render('admin/payments/edit', [
            'payment' => $payment,
            'orders' => Order::query()->latest()->get(['id', 'order_number', 'customer_name', 'total_amount']),
        ]);
    }

    public function update(Request $request, Payment $payment): RedirectResponse
    {
        $data = $this->validatedData($request);

        try {
            $payment->update($data);
        } catch (Throwable $exception) {
            Log::error('Payment update failed.', ['payment_id' => $payment->id, 'message' => $exception->getMessage()]);

            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Payment could not be saved. Please try again.',
            ]);
        }

        return to_route('admin.payments.index')->with('toast', [
            'type' => 'success',
            'message' => 'Payment updated successfully.',
        ]);
    }

    public function destroy(Payment $payment): RedirectResponse
    {
        try {
            $payment->delete();
        } catch (Throwable $exception) {
            Log::error('Payment deletion failed.', ['payment_id' => $payment->id, 'message' => $exception->getMessage()]);

            return back()->with('toast', [
                'type' => 'error',
                'message' => 'This payment could not be deleted. Please try again.',
            ]);
        }

        return to_route('admin.payments.index')->with('toast', [
            'type' => 'success',
            'message' => 'Payment deleted successfully.',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedData(Request $request): array
    {
        return $request->validate([
            'order_id' => ['nullable', 'integer', 'exists:orders,id'],
            'customer_name' => ['required', 'string', 'max:255'],
            'method' => ['required', 'string', 'max:80'],
            'amount' => ['required', 'numeric', 'min:0'],
            'status' => ['required', Rule::in(['pending', 'paid', 'failed', 'refunded'])],
            'transaction_reference' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);
    }
}

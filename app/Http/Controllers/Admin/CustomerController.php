<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));

        return Inertia::render('admin/customers/index', [
            'customers' => User::query()
                ->where('is_admin', false)
                ->withCount('orders')
                ->with(['orders' => fn ($query) => $query
                    ->latest()
                    ->select(['id', 'user_id', 'customer_phone', 'total_amount', 'status', 'created_at'])])
                ->when($search !== '', function ($query) use ($search): void {
                    $query->where(function ($query) use ($search): void {
                        $query->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhereHas('orders', fn ($query) => $query
                                ->where('customer_phone', 'like', "%{$search}%")
                                ->orWhere('status', 'like', "%{$search}%"));
                    });
                })
                ->latest()
                ->paginate(15, ['id', 'name', 'email', 'created_at'])
                ->withQueryString(),
        ]);
    }

    public function show(User $customer): Response
    {
        abort_if($customer->is_admin, 404);

        return Inertia::render('admin/customers/show', [
            'customer' => $customer->load([
                'orders' => fn ($query) => $query
                    ->with('payments:id,order_id,payment_number,method,amount,status,transaction_reference')
                    ->latest(),
            ]),
        ]);
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DeliveryRate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DeliveryRateController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('admin/delivery-rates/edit', [
            'rates' => DeliveryRate::query()
                ->orderBy('county')
                ->orderBy('town')
                ->get(['id', 'county', 'town', 'fee_0_1kg', 'fee_1_3kg', 'fee_3_5kg', 'fee_over_5kg', 'is_active']),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'rates' => ['required', 'array'],
            'rates.*.id' => ['required', 'integer', 'exists:delivery_rates,id'],
            'rates.*.fee_0_1kg' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'rates.*.fee_1_3kg' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'rates.*.fee_3_5kg' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'rates.*.fee_over_5kg' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'rates.*.is_active' => ['boolean'],
        ]);

        foreach ($data['rates'] as $rate) {
            DeliveryRate::query()
                ->whereKey($rate['id'])
                ->update([
                    'fee_0_1kg' => $rate['fee_0_1kg'],
                    'fee_1_3kg' => $rate['fee_1_3kg'],
                    'fee_3_5kg' => $rate['fee_3_5kg'],
                    'fee_over_5kg' => $rate['fee_over_5kg'],
                    'is_active' => (bool) ($rate['is_active'] ?? false),
                ]);
        }

        return to_route('admin.delivery-rates.edit')->with('toast', [
            'type' => 'success',
            'message' => 'Delivery prices updated successfully.',
        ]);
    }
}

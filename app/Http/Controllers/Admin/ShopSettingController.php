<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ShopSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ShopSettingController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('admin/shop-settings/edit', [
            'settings' => ShopSetting::current(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'shop_location' => ['nullable', 'string', 'max:255'],
            'shop_phone' => ['nullable', 'string', 'max:80'],
            'shopping_points_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
        ]);

        try {
            ShopSetting::current()->update($data);
        } catch (Throwable $exception) {
            Log::error('Shop settings update failed.', [
                'message' => $exception->getMessage(),
            ]);

            return back()->with('toast', [
                'type' => 'error',
                'message' => 'Shop contact settings could not be saved. Please try again.',
            ]);
        }

        return to_route('admin.shop-settings.edit')->with('toast', [
            'type' => 'success',
            'message' => 'Shop contact settings updated successfully.',
        ]);
    }
}

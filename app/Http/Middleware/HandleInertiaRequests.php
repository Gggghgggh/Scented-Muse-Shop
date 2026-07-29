<?php

namespace App\Http\Middleware;

use App\Models\ShopSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'toast' => fn () => $request->session()->get('toast'),
                'checkout' => fn () => $request->session()->get('checkout'),
            ],
            'shopSettings' => fn () => Schema::hasTable('shop_settings')
                ? ShopSetting::current()->only(['shop_location', 'shop_phone', 'whatsapp_number', 'shopping_points_percentage'])
                : [
                    'shop_location' => 'Online Ecommerce Shopping',
                    'shop_phone' => '+254 700 000 000',
                    'whatsapp_number' => null,
                    'shopping_points_percentage' => 10,
                ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}

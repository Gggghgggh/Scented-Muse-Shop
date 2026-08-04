<?php

use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\DeliveryRateController;
use App\Http\Controllers\Admin\HeroSlideController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\ProductCategoryController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ShopSettingController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\CheckoutController;
use App\Models\DeliveryRate;
use App\Models\HeroSlide;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductReview;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

$applyActiveFlashSaleWindow = function ($query) {
    if (! Schema::hasColumn('products', 'flash_sale_ends_at')) {
        return $query;
    }

    return $query->where(fn ($query) => $query
        ->whereNull('flash_sale_ends_at')
        ->orWhere('flash_sale_ends_at', '>', now()));
};

$shopProps = fn () => [
    'heroSlides' => HeroSlide::query()
        ->active()
        ->ordered()
        ->get(['id', 'image_path', 'eyebrow', 'heading', 'subheading']),
    'categories' => ProductCategory::query()
        ->where('is_active', true)
        ->withCount(['products' => fn ($query) => $query->where('is_active', true)])
        ->orderBy('name')
        ->get(['id', 'name', 'slug', 'description']),
    'products' => Product::query()
        ->with('category:id,name,slug')
        ->where('is_active', true)
        ->latest()
        ->get(),
    'flashSaleProducts' => Product::query()
        ->with('category:id,name,slug')
        ->where('is_active', true)
        ->where('is_flash_sale', true)
        ->tap($applyActiveFlashSaleWindow)
        ->latest()
        ->limit(4)
        ->get(),
];

Route::get('/', function () use ($shopProps) {
    return Inertia::render('welcome', $shopProps());
})->name('home');

Route::get('flash-sale', function () use ($applyActiveFlashSaleWindow) {
    return Inertia::render('flash-sale', [
        'products' => Product::query()
            ->with('category:id,name,slug')
            ->where('is_active', true)
            ->where('is_flash_sale', true)
            ->tap($applyActiveFlashSaleWindow)
            ->latest()
            ->get(),
    ]);
})->name('flash-sale');

Route::get('cart', fn () => Inertia::render('cart', [
    'deliveryRates' => DeliveryRate::query()
        ->where('is_active', true)
        ->get(['county', 'town', 'fee_0_1kg', 'fee_1_3kg', 'fee_3_5kg', 'fee_over_5kg']),
]))->name('cart');
Route::post('lipana/webhook', [CheckoutController::class, 'lipanaWebhook'])->name('lipana.webhook');
Route::get('my-orders', fn (Request $request) => Inertia::render('orders', [
    'orders' => $request->user()
        ->orders()
        ->with('payments:id,order_id,status,method,amount,payment_number')
        ->latest()
        ->get([
            'id',
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
            'created_at',
        ]),
]))
    ->middleware(['auth', 'verified'])
    ->name('orders.mine');
Route::get('my-account', fn (Request $request) => Inertia::render('my-account', [
    'orders' => Order::query()
        ->where(fn ($query) => $query
            ->where('user_id', $request->user()->id)
            ->orWhere('customer_email', $request->user()->email))
        ->with('payments:id,order_id,status,method,amount,payment_number')
        ->latest()
        ->get(),
]))
    ->middleware(['auth', 'verified'])
    ->name('account.mine');

Route::get('products/{slug}', function (string $slug) {
    $product = Product::query()
        ->with('category:id,name,slug')
        ->where('slug', $slug)
        ->where('is_active', true)
        ->firstOrFail();

    return Inertia::render('products/show', [
        'product' => $product,
        'slug' => $slug,
        'reviews' => $product->reviews()
            ->with('user:id,name')
            ->latest()
            ->limit(10)
            ->get(['id', 'product_id', 'user_id', 'rating', 'title', 'body', 'is_verified_purchase', 'created_at']),
        'ratingSummary' => [
            'average' => round((float) $product->reviews()->avg('rating'), 1),
            'count' => $product->reviews()->count(),
            'distribution' => collect(range(5, 1))->mapWithKeys(fn (int $rating) => [
                $rating => $product->reviews()->where('rating', $rating)->count(),
            ]),
        ],
        'relatedProducts' => Product::query()
            ->with('category:id,name,slug')
            ->where('is_active', true)
            ->whereKeyNot($product->id)
            ->latest()
            ->limit(4)
            ->get(),
    ]);
})->name('products.show');

Route::post('products/{product}/reviews', function (Request $request, Product $product) {
    $data = $request->validate([
        'rating' => ['required', 'integer', 'min:1', 'max:5'],
        'title' => ['required', 'string', 'max:120'],
        'body' => ['required', 'string', 'max:1000'],
    ]);

    ProductReview::query()->updateOrCreate(
        [
            'product_id' => $product->id,
            'user_id' => $request->user()->id,
        ],
        [
            ...$data,
            'is_verified_purchase' => false,
        ],
    );

    return back();
})->middleware(['auth', 'verified'])->name('products.reviews.store');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('checkout', [CheckoutController::class, 'store'])->name('checkout.store');
    Route::get('my-orders/{order}/receipt', [CheckoutController::class, 'receipt'])->name('orders.receipt');
});

Route::middleware(['auth', 'verified'])->group(function () use ($shopProps) {
    Route::get('dashboard', function (Request $request) use ($shopProps) {
        if (! $request->user()->is_admin) {
            return Inertia::render('welcome', $shopProps());
        }

        $today = CarbonImmutable::today();
        $startOfWeek = $today->startOfWeek();
        $previousWeekStart = $startOfWeek->subWeek();
        $startOfMonth = $today->startOfMonth();
        $previousMonthStart = $startOfMonth->subMonth();

        $trend = function (float|int $current, float|int $previous, string $suffix): array {
            $change = $previous > 0
                ? (($current - $previous) / $previous) * 100
                : ($current > 0 ? 100 : 0);

            return [
                'direction' => $change >= 0 ? 'up' : 'down',
                'value' => round(abs($change)).'% '.$suffix,
            ];
        };

        $dailyOrders = Order::query()
            ->where('created_at', '>=', $today->subDays(364)->startOfDay())
            ->get(['created_at', 'total_amount']);

        $analyticsSeries = collect(range(364, 0))
            ->map(function (int $daysAgo) use ($today, $dailyOrders): array {
                $date = $today->subDays($daysAgo);
                $orders = $dailyOrders->filter(
                    fn (Order $order): bool => $order->created_at->isSameDay($date),
                );

                return [
                    'day' => $date->format('M j'),
                    'date' => $date->toDateString(),
                    'orders' => $orders->count(),
                    'revenue' => (float) $orders->sum('total_amount'),
                ];
            })
            ->values();

        $ordersThisWeek = Order::query()
            ->where('created_at', '>=', $startOfWeek)
            ->count();
        $ordersPreviousWeek = Order::query()
            ->whereBetween('created_at', [$previousWeekStart, $startOfWeek])
            ->count();
        $revenueThisMonth = Order::query()
            ->where('created_at', '>=', $startOfMonth)
            ->sum('total_amount');
        $revenuePreviousMonth = Order::query()
            ->whereBetween('created_at', [$previousMonthStart, $startOfMonth])
            ->sum('total_amount');
        $avgOrderValue = (float) (Order::query()->avg('total_amount') ?? 0);
        $previousAvgOrderValue = (float) (Order::query()
            ->whereBetween('created_at', [$previousWeekStart, $startOfWeek])
            ->avg('total_amount') ?? 0);
        $activeCategoryCount = ProductCategory::query()
            ->where('is_active', true)
            ->count();
        $activeProductCount = Product::query()
            ->where('is_active', true)
            ->count();
        $customerCount = User::query()
            ->where('is_admin', false)
            ->count();
        $pendingPaymentAmount = Payment::query()
            ->where('status', 'pending')
            ->sum('amount');

        $paymentStatusBreakdown = Payment::query()
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get()
            ->map(fn (Payment $payment): array => [
                'label' => ucfirst((string) $payment->status),
                'value' => (int) $payment->getAttribute('count'),
            ])
            ->values();

        $paymentMethods = Payment::query()
            ->selectRaw('method, count(*) as count')
            ->groupBy('method')
            ->get();
        $paymentMethodTotal = max(1, (int) $paymentMethods->sum('count'));
        $paymentMethodBreakdown = $paymentMethods
            ->map(fn (Payment $payment): array => [
                'label' => str((string) $payment->method)->replace('_', ' ')->title()->toString(),
                'value' => round(((int) $payment->getAttribute('count') / $paymentMethodTotal) * 100),
            ])
            ->values();

        $productsById = Product::query()
            ->with('category:id,name')
            ->get(['id', 'product_category_id'])
            ->keyBy('id');
        $categorySales = Order::query()
            ->get(['items'])
            ->flatMap(fn (Order $order) => $order->items ?? [])
            ->groupBy(fn (array $item): string => optional($productsById->get($item['product_id'] ?? null)?->category)->name ?? 'Uncategorized')
            ->map(fn ($items, string $category): array => [
                'label' => $category,
                'value' => collect($items)->sum(fn (array $item): int => (int) ($item['quantity'] ?? 0)),
            ])
            ->sortByDesc('value')
            ->take(5)
            ->values();

        return Inertia::render('dashboard', [
            'activeCategoryCount' => $activeCategoryCount,
            'adminStats' => [
                'activeProducts' => $activeProductCount,
                'ordersThisWeek' => $ordersThisWeek,
                'pendingPaymentAmount' => $pendingPaymentAmount,
                'customerCount' => $customerCount,
                'revenueThisMonth' => $revenueThisMonth,
                'avgOrderValue' => $avgOrderValue,
                'trends' => [
                    'activeCategories' => ['direction' => 'up', 'value' => '0% vs last week'],
                    'ordersThisWeek' => $trend($ordersThisWeek, $ordersPreviousWeek, 'vs last week'),
                    'pendingPayments' => ['direction' => $pendingPaymentAmount > 0 ? 'up' : 'down', 'value' => 'current pending'],
                    'customers' => ['direction' => 'up', 'value' => $customerCount.' total'],
                    'revenueThisMonth' => $trend((float) $revenueThisMonth, (float) $revenuePreviousMonth, 'vs last month'),
                    'avgOrderValue' => $trend($avgOrderValue, $previousAvgOrderValue, 'vs last week'),
                ],
                'sparklines' => [
                    'activeCategories' => array_fill(0, 7, $activeCategoryCount),
                    'ordersThisWeek' => $analyticsSeries->slice(-7)->pluck('orders')->all(),
                    'pendingPayments' => array_fill(0, 7, (float) $pendingPaymentAmount),
                    'customers' => array_fill(0, 7, $customerCount),
                    'revenueThisMonth' => $analyticsSeries->slice(-7)->pluck('revenue')->all(),
                    'avgOrderValue' => array_fill(0, 7, $avgOrderValue),
                ],
                'analyticsSeries' => $analyticsSeries,
                'paymentStatusBreakdown' => $paymentStatusBreakdown,
                'categorySales' => $categorySales,
                'paymentMethodBreakdown' => $paymentMethodBreakdown,
            ],
        ]);
    })->name('dashboard');

    Route::prefix('admin')
        ->name('admin.')
        ->middleware('admin')
        ->group(function () {
            Route::resource('categories', ProductCategoryController::class)->except('show');
            Route::resource('products', ProductController::class)->except('show');
            Route::get('customers', [CustomerController::class, 'index'])->name('customers.index');
            Route::get('customers/{customer}', [CustomerController::class, 'show'])->name('customers.show');
            Route::resource('users', UserController::class)->except('show');
            Route::resource('orders', OrderController::class)->except('show');
            Route::resource('payments', PaymentController::class)->except('show');
            Route::resource('hero-slides', HeroSlideController::class)->except('show');
            Route::get('delivery-rates', [DeliveryRateController::class, 'edit'])->name('delivery-rates.edit');
            Route::put('delivery-rates', [DeliveryRateController::class, 'update'])->name('delivery-rates.update');
            Route::get('shop-settings', [ShopSettingController::class, 'edit'])->name('shop-settings.edit');
            Route::put('shop-settings', [ShopSettingController::class, 'update'])->name('shop-settings.update');
        });
});

require __DIR__.'/settings.php';

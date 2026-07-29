import { Head, Link, usePage } from '@inertiajs/react';
import {
    CreditCard,
    Heart,
    Menu,
    Package,
    PackageCheck,
    Plus,
    Search,
    Settings,
    ShoppingBag,
    ShoppingCart,
    Star,
    Tags,
    Truck,
    UserRound,
    Users,
} from 'lucide-react';
import { useState } from 'react';

type AuthUser = {
    name: string;
    email: string;
    is_admin: boolean;
};

type Trend = {
    direction: 'up' | 'down';
    value: string;
};

type AnalyticsPoint = {
    day: string;
    date: string;
    orders: number;
    revenue: number;
};

type BreakdownItem = {
    label: string;
    value: number;
};

type DashboardProps = {
    activeCategoryCount: number;
    adminStats?: {
        activeProducts: number;
        ordersThisWeek: number;
        pendingPaymentAmount: string | number;
        customerCount: number;
        revenueThisMonth: string | number;
        avgOrderValue: string | number;
        trends: {
            activeCategories: Trend;
            ordersThisWeek: Trend;
            pendingPayments: Trend;
            customers: Trend;
            revenueThisMonth: Trend;
            avgOrderValue: Trend;
        };
        sparklines: {
            activeCategories: number[];
            ordersThisWeek: number[];
            pendingPayments: number[];
            customers: number[];
            revenueThisMonth: number[];
            avgOrderValue: number[];
        };
        analyticsSeries: AnalyticsPoint[];
        paymentStatusBreakdown: BreakdownItem[];
        categorySales: BreakdownItem[];
        paymentMethodBreakdown: BreakdownItem[];
    };
};

const defaultTrend: Trend = {
    direction: 'up',
    value: '0%',
};

const defaultAdminStats = {
    trends: {
        activeCategories: defaultTrend,
        ordersThisWeek: defaultTrend,
        pendingPayments: defaultTrend,
        customers: defaultTrend,
        revenueThisMonth: defaultTrend,
        avgOrderValue: defaultTrend,
    },
    sparklines: {
        activeCategories: [],
        ordersThisWeek: [],
        pendingPayments: [],
        customers: [],
        revenueThisMonth: [],
        avgOrderValue: [],
    },
};

export default function Dashboard({
    activeCategoryCount,
    adminStats,
}: DashboardProps) {
    const { auth } = usePage().props as unknown as {
        auth: { user: AuthUser };
    };

    return auth.user.is_admin ? (
        <AdminDashboard
            activeCategoryCount={activeCategoryCount}
            adminStats={
                adminStats ?? {
                    activeProducts: 0,
                    ordersThisWeek: 0,
                    pendingPaymentAmount: 0,
                    customerCount: 0,
                    revenueThisMonth: 0,
                    avgOrderValue: 0,
                    trends: defaultAdminStats.trends,
                    sparklines: defaultAdminStats.sparklines,
                    analyticsSeries: [],
                    paymentStatusBreakdown: [],
                    categorySales: [],
                    paymentMethodBreakdown: [],
                }
            }
        />
    ) : (
        <CustomerDashboard user={auth.user} />
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }],
};

function AdminDashboard({
    activeCategoryCount,
    adminStats,
}: {
    activeCategoryCount: number;
    adminStats: NonNullable<DashboardProps['adminStats']>;
}) {
    return (
        <>
            <Head title="Admin Dashboard" />
            <main className="min-h-screen bg-hod-surface text-hod-ink">
                <DashboardShell
                    eyebrow="Scented Muse Admin"
                    title="Command center"
                    description="Manage catalog, customers, orders, payments, and shop operations from one place."
                >
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                        <Metric
                            label="Active categories"
                            value={activeCategoryCount.toString()}
                            helper="Organize catalog"
                            href="/admin/categories"
                            icon={Tags}
                            trend={adminStats.trends.activeCategories}
                            sparkline={adminStats.sparklines.activeCategories}
                        />
                        <Metric
                            label="Orders this week"
                            value={adminStats.ordersThisWeek.toString()}
                            helper="Track now"
                            href="/admin/orders"
                            icon={Truck}
                            trend={adminStats.trends.ordersThisWeek}
                            sparkline={adminStats.sparklines.ordersThisWeek}
                        />
                        <Metric
                            label="Pending payments"
                            value={formatCompactCurrency(
                                adminStats.pendingPaymentAmount,
                            )}
                            helper="Review payments"
                            href="/admin/payments"
                            icon={CreditCard}
                            trend={adminStats.trends.pendingPayments}
                            sparkline={adminStats.sparklines.pendingPayments}
                        />
                        <Metric
                            label="Customers"
                            value={adminStats.customerCount.toString()}
                            helper={`${adminStats.activeProducts} active products`}
                            href="/admin/customers"
                            icon={Users}
                            trend={adminStats.trends.customers}
                            sparkline={adminStats.sparklines.customers}
                        />
                        <Metric
                            label="Revenue this month"
                            value={formatCompactCurrency(adminStats.revenueThisMonth)}
                            helper="View orders"
                            href="/admin/orders"
                            icon={ShoppingBag}
                            trend={adminStats.trends.revenueThisMonth}
                            sparkline={adminStats.sparklines.revenueThisMonth}
                        />
                        <Metric
                            label="Avg order value"
                            value={formatCompactCurrency(adminStats.avgOrderValue)}
                            helper="Review payments"
                            href="/admin/payments"
                            icon={PackageCheck}
                            trend={adminStats.trends.avgOrderValue}
                            sparkline={adminStats.sparklines.avgOrderValue}
                        />
                    </div>

                    <AnalyticsSection stats={adminStats} />

                    <div className="grid items-stretch gap-4 lg:grid-cols-2 xl:grid-cols-3">
                        <ActionCard
                            icon={Package}
                            title="Products"
                            description="Stock, prices, variants."
                            primaryHref="/admin/products/create"
                            primaryLabel="Add product"
                            secondaryHref="/admin/products"
                            secondaryLabel="Manage products"
                        />
                        <ActionCard
                            icon={Tags}
                            title="Categories"
                            description="Groups and storefront flow."
                            primaryHref="/admin/categories/create"
                            primaryLabel="Add category"
                            secondaryHref="/admin/categories"
                            secondaryLabel="Manage categories"
                        />
                        <ActionCard
                            icon={Users}
                            title="Users"
                            description="Roles and admin access."
                            primaryHref="/admin/users"
                            primaryLabel="Open users"
                            secondaryHref="/dashboard"
                            secondaryLabel="Overview"
                        />
                        <ActionCard
                            icon={Users}
                            title="Customers"
                            description="Profiles and order history."
                            primaryHref="/admin/customers"
                            primaryLabel="Open customers"
                            secondaryHref="/admin/orders"
                            secondaryLabel="Track orders"
                        />
                        <ActionCard
                            icon={PackageCheck}
                            title="Orders"
                            description="Fulfillment and delivery."
                            primaryHref="/admin/orders"
                            primaryLabel="Track orders"
                            secondaryHref="/dashboard"
                            secondaryLabel="Order summary"
                        />
                        <ActionCard
                            icon={CreditCard}
                            title="Payments"
                            description="Status and reconciliation."
                            primaryHref="/admin/payments"
                            primaryLabel="Track payments"
                            secondaryHref="/dashboard"
                            secondaryLabel="Payment summary"
                        />
                        <ActionCard
                            icon={Settings}
                            title="Shop settings"
                            description="Contacts and reward rules."
                            primaryHref="/admin/shop-settings"
                            primaryLabel="Update settings"
                            secondaryHref="/"
                            secondaryLabel="View shop"
                        />
                    </div>
                </DashboardShell>
            </main>
        </>
    );
}

function CustomerDashboard({ user }: { user: AuthUser }) {
    return (
        <>
            <Head title="My Dashboard" />
            <main className="min-h-screen bg-[#fff7f2] text-[#17131f]">
                <ShopNavbar user={user} />
                <DashboardShell
                    eyebrow="My Scented Muse"
                    title={`Welcome back, ${user.name.split(' ')[0]}.`}
                    description="Track your orders, return to saved products, review purchases, and continue shopping."
                >
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <Metric
                            label="Cart items"
                            value="0"
                            helper="Open cart"
                            href="/cart"
                            icon={ShoppingBag}
                        />
                        <Metric
                            label="Wishlist"
                            value="Saved"
                            helper="Browse products"
                            href="/"
                            icon={Heart}
                        />
                        <Metric
                            label="Orders"
                            value="Track"
                            helper="View orders"
                            href="/my-orders"
                            icon={Truck}
                        />
                        <Metric
                            label="Reviews"
                            value="Rate items"
                            helper="View products"
                            href="/"
                            icon={Star}
                        />
                    </div>

                    <div className="grid gap-5 lg:grid-cols-3">
                        <ActionCard
                            icon={ShoppingBag}
                            title="Continue shopping"
                            description="Browse Scented Muse products and add the right size and quantity from product pages."
                            primaryHref="/"
                            primaryLabel="Shop now"
                            secondaryHref="/"
                            secondaryLabel="View deals"
                        />
                        <ActionCard
                            icon={Heart}
                            title="Wishlist"
                            description="Use the heart icon on product cards to save products you want to revisit."
                            primaryHref="/"
                            primaryLabel="Browse products"
                            secondaryHref="/dashboard"
                            secondaryLabel="Saved items"
                        />
                        <ActionCard
                            icon={Truck}
                            title="Delivery"
                            description="Choose your Kenyan county and town on product pages before checkout."
                            primaryHref="/"
                            primaryLabel="Choose product"
                            secondaryHref="/dashboard"
                            secondaryLabel="Track delivery"
                        />
                    </div>
                </DashboardShell>
            </main>
        </>
    );
}

function ShopNavbar({ user }: { user: AuthUser }) {
    return (
        <header className="sticky top-0 z-40 bg-white shadow-sm shadow-[#3b2147]/5">
            <div className="mx-auto flex max-w-[1540px] items-center gap-3 px-4 py-3 lg:gap-6 lg:px-8 lg:py-5">
                <button
                    type="button"
                    className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#3b2147] text-white lg:hidden"
                    aria-label="Open menu"
                >
                    <Menu className="size-5" />
                </button>
                <Link
                    href="/"
                    className="flex min-w-fit items-center gap-2 lg:gap-3"
                >
                    <span className="flex h-11 w-20 items-center justify-center overflow-visible border-0 bg-transparent sm:h-12 sm:w-24 lg:h-14 lg:w-28">
                        <img
                            src="/logo.png"
                            alt="Scented Muse logo"
                            className="h-full w-full object-contain object-center"
                        />
                    </span>
                    <span className="hidden sm:block">
                        <span className="block text-2xl leading-6 font-black text-[#3b2147]">
                            Scented Muse
                        </span>
                        <span className="text-xs font-bold text-[#7f5f53]">
                            customer dashboard
                        </span>
                    </span>
                </Link>

                <SearchBar className="hidden lg:flex" />

                <div className="ml-auto flex items-center gap-2 text-sm sm:gap-4">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 font-semibold text-[#3b2147]"
                    >
                        <UserRound className="size-10 rounded-full border border-[#d7dce5] p-2.5 text-[#8b93a3]" />
                        <span className="hidden max-w-28 truncate sm:inline">
                            {user.name.split(' ')[0]}
                        </span>
                    </Link>
                    <button
                        className="flex size-10 items-center justify-center rounded-full bg-[#3b2147] text-white transition hover:bg-[#e85d4f]"
                        aria-label="Open cart"
                    >
                        <ShoppingCart className="size-5" />
                    </button>
                </div>
            </div>
            <div className="border-t border-[#f0e2dc] px-4 pb-3 lg:hidden">
                <SearchBar />
            </div>
        </header>
    );
}

const formatCompactCurrency = (price: string | number) =>
    new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        notation: 'compact',
        maximumFractionDigits: 1,
    })
        .format(Number(price))
        .replace('KES', 'KSh');

function SearchBar({ className = 'flex' }: { className?: string }) {
    return (
        <label
            className={`${className} h-11 flex-1 items-center rounded-full border border-[#d7dce5] bg-white px-4 lg:h-12 lg:px-5`}
        >
            <span className="sr-only">Search products</span>
            <input
                className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-[#8b93a3]"
                placeholder="Search Scented Muse products..."
            />
            <Search className="size-5 text-[#8b93a3] lg:size-6" />
        </label>
    );
}

function DashboardShell({
    eyebrow,
    title,
    description,
    children,
}: React.PropsWithChildren<{
    eyebrow: string;
    title: string;
    description: string;
}>) {
    return (
        <div className="mx-auto max-w-[1540px] p-3 sm:p-4 lg:p-8">
            <section className="relative overflow-hidden rounded-lg border border-hod-navy/10 bg-hod-navy p-6 text-white shadow-sm sm:p-8">
                <div className="relative max-w-3xl">
                    <p className="text-xs font-bold tracking-[0.16em] text-white/68 uppercase">
                        {eyebrow}
                    </p>
                    <h1 className="mt-3 text-[28px] leading-tight font-black sm:text-4xl">
                        {title}
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-white/72 sm:text-base">
                        {description}
                    </p>
                </div>
            </section>

            <div className="mt-5 space-y-5 sm:mt-6">{children}</div>
        </div>
    );
}

const analyticsIntervals = [
    { label: '7 days', days: 7 },
    { label: '30 days', days: 30 },
    { label: '2 months', days: 60 },
    { label: '3 months', days: 90 },
    { label: '4 months', days: 120 },
    { label: '5 months', days: 150 },
    { label: '6 months', days: 180 },
    { label: '7 months', days: 210 },
    { label: '8 months', days: 240 },
    { label: '9 months', days: 270 },
    { label: '10 months', days: 300 },
    { label: '11 months', days: 330 },
    { label: '12 months', days: 365 },
];

const chartColors = ['#1a2f5e', '#e8293f', '#7b8aa8', '#d8dee9', '#f3b8c0'];

function AnalyticsSection({
    stats,
}: {
    stats: NonNullable<DashboardProps['adminStats']>;
}) {
    const [mode, setMode] = useState<'orders' | 'revenue'>('orders');
    const [intervalDays, setIntervalDays] = useState(30);
    const selectedInterval =
        analyticsIntervals.find((interval) => interval.days === intervalDays) ??
        analyticsIntervals[1];
    const visibleSeries = stats.analyticsSeries.slice(-selectedInterval.days);
    const totalOrders = visibleSeries.reduce((sum, item) => sum + item.orders, 0);
    const totalRevenue = visibleSeries.reduce(
        (sum, item) => sum + item.revenue,
        0,
    );
    const statusData = withChartColors(stats.paymentStatusBreakdown);
    const methodData = withChartColors(stats.paymentMethodBreakdown);

    return (
        <section className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.85fr)_minmax(320px,1fr)]">
                <ChartCard
                    title="Orders and revenue"
                    action={
                        <div className="flex flex-wrap items-center justify-end gap-2">
                            <select
                                value={intervalDays}
                                onChange={(event) =>
                                    setIntervalDays(Number(event.target.value))
                                }
                                className="h-9 rounded-md border border-hod-line bg-white px-3 text-xs font-bold text-hod-navy outline-none transition hover:bg-hod-surface focus-visible:ring-2 focus-visible:ring-hod-red/60"
                                aria-label="Select analytics interval"
                            >
                                {analyticsIntervals.map((interval) => (
                                    <option
                                        key={interval.days}
                                        value={interval.days}
                                    >
                                        {interval.label}
                                    </option>
                                ))}
                            </select>
                            <div className="flex rounded-md border border-hod-line bg-hod-surface p-1">
                                {(['orders', 'revenue'] as const).map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => setMode(option)}
                                        className={`h-8 rounded px-3 text-xs font-bold capitalize outline-none transition focus-visible:ring-2 focus-visible:ring-hod-red/60 ${
                                            mode === option
                                                ? 'bg-hod-navy text-white shadow-sm'
                                                : 'text-hod-muted hover:bg-white hover:text-hod-navy'
                                        }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    }
                >
                    <p className="mb-4 text-sm font-semibold text-hod-muted">
                        {totalOrders.toLocaleString('en-KE')} orders,{' '}
                        {formatCompactCurrency(totalRevenue)} revenue in the last{' '}
                        {selectedInterval.label}
                    </p>
                    <LineChart
                        data={visibleSeries.map((item) => ({
                            label: String(item.day),
                            date: item.date,
                            value: mode === 'orders' ? item.orders : item.revenue,
                        }))}
                        valuePrefix={mode === 'revenue' ? 'KSh ' : ''}
                        rangeLabel={selectedInterval.label}
                        rangeDays={selectedInterval.days}
                        mode={mode}
                    />
                </ChartCard>

                <ChartCard title="Order status">
                    <DonutChart data={statusData} />
                </ChartCard>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <ChartCard title="Top categories by sales">
                    <CategoryBars data={stats.categorySales} />
                </ChartCard>
                <ChartCard title="Payment methods">
                    <PaymentBreakdown data={methodData} />
                </ChartCard>
            </div>
        </section>
    );
}

function withChartColors(data: BreakdownItem[]) {
    return data.map((item, index) => ({
        ...item,
        color: chartColors[index % chartColors.length],
    }));
}

function ChartCard({
    title,
    action,
    children,
}: React.PropsWithChildren<{ title: string; action?: React.ReactNode }>) {
    return (
        <article className="rounded-lg border border-hod-line bg-hod-panel p-5 shadow-[0_1px_2px_rgba(16,32,68,0.04)] sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-lg leading-6 font-black text-hod-navy">
                    {title}
                </h2>
                {action}
            </div>
            {children}
        </article>
    );
}

function LineChart({
    data,
    valuePrefix = '',
    rangeLabel = '30 days',
    rangeDays,
    mode,
}: {
    data: { label: string; date: string; value: number }[];
    valuePrefix?: string;
    rangeLabel?: string;
    rangeDays: number;
    mode: 'orders' | 'revenue';
}) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    if (data.length === 0) {
        return <EmptyChart message="No order data yet." />;
    }

    const width = 720;
    const height = 230;
    const padding = 18;
    const values = data.map((item) => item.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const spread = max - min || 1;
    const chartPoints = data.map((item, index) => {
            const x = padding + (index / (data.length - 1)) * (width - padding * 2);
            const y = height - padding - ((item.value - min) / spread) * (height - padding * 2);

            return { ...item, x, y };
        });
    const points = chartPoints.map((item) => `${item.x},${item.y}`).join(' ');
    const latest = data.at(-1)?.value ?? 0;
    const hoveredPoint =
        hoveredIndex === null ? null : chartPoints[hoveredIndex] ?? null;
    const tooltipSide =
        hoveredPoint && hoveredPoint.x > width * 0.72 ? 'right' : 'left';

    return (
        <div>
            <div className="mb-2 flex items-end justify-between text-sm">
                <span className="font-bold text-hod-navy">
                    Latest: {valuePrefix}
                    {valuePrefix ? latest.toLocaleString('en-KE') : latest}
                </span>
                <span className="text-hod-muted">Last {rangeLabel}</span>
            </div>
            <div
                className="relative"
                onMouseMove={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect();
                    const x = event.clientX - rect.left;
                    const ratio = Math.min(Math.max(x / rect.width, 0), 1);
                    const index = Math.round(ratio * (data.length - 1));

                    setHoveredIndex(index);
                }}
                onMouseLeave={() => setHoveredIndex(null)}
            >
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    role="img"
                    aria-label={`${mode} trend for the last ${rangeLabel}`}
                    className="h-56 w-full overflow-visible"
                    preserveAspectRatio="none"
                >
                    {[0, 1, 2, 3].map((line) => (
                        <line
                            key={line}
                            x1={padding}
                            x2={width - padding}
                            y1={padding + line * ((height - padding * 2) / 3)}
                            y2={padding + line * ((height - padding * 2) / 3)}
                            stroke="#e8ecf3"
                            strokeWidth="1"
                        />
                    ))}
                    {hoveredPoint && (
                        <line
                            x1={hoveredPoint.x}
                            x2={hoveredPoint.x}
                            y1={padding}
                            y2={height - padding}
                            stroke="#e8293f"
                            strokeDasharray="4 5"
                            strokeOpacity="0.55"
                            strokeWidth="2"
                        />
                    )}
                    <polyline
                        fill="none"
                        stroke={hoveredPoint ? '#e8293f' : '#1a2f5e'}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={hoveredPoint ? '5' : '4'}
                        points={points}
                        className="transition-all duration-200"
                    />
                    {hoveredPoint && (
                        <circle
                            cx={hoveredPoint.x}
                            cy={hoveredPoint.y}
                            r="7"
                            fill="#ffffff"
                            stroke="#e8293f"
                            strokeWidth="4"
                        />
                    )}
                </svg>
                {hoveredPoint && (
                    <div
                        className={`pointer-events-none absolute top-5 z-10 min-w-44 rounded-md border border-hod-line bg-white px-3 py-2 text-sm shadow-[0_14px_30px_rgba(26,47,94,0.16)] ${
                            tooltipSide === 'right'
                                ? 'right-3'
                                : 'left-3'
                        }`}
                    >
                        <p className="text-xs font-black tracking-[0.12em] text-hod-muted uppercase">
                            {formatAnalyticsHoverLabel(
                                hoveredPoint.date,
                                rangeDays,
                            )}
                        </p>
                        <p className="mt-1 text-lg leading-6 font-black text-hod-navy">
                            {formatAnalyticsValue(hoveredPoint.value, mode)}
                        </p>
                        <p className="text-xs font-semibold text-hod-muted">
                            {mode === 'orders'
                                ? 'orders placed'
                                : 'revenue collected'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function formatAnalyticsHoverLabel(dateValue: string, rangeDays: number) {
    const date = new Date(`${dateValue}T12:00:00`);

    if (rangeDays <= 7) {
        return new Intl.DateTimeFormat('en-KE', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
        }).format(date);
    }

    if (rangeDays <= 90) {
        return new Intl.DateTimeFormat('en-KE', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        }).format(date);
    }

    return new Intl.DateTimeFormat('en-KE', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
}

function formatAnalyticsValue(value: number, mode: 'orders' | 'revenue') {
    if (mode === 'revenue') {
        return formatCompactCurrency(value);
    }

    return value.toLocaleString('en-KE');
}

function DonutChart({
    data,
}: {
    data: { label: string; value: number; color: string }[];
}) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const total = data.reduce((sum, item) => sum + item.value, 0);

    if (data.length === 0 || total === 0) {
        return <EmptyChart message="No payment status data yet." />;
    }

    const strokeOffsets = data.reduce<{ offsets: number[]; cumulative: number }>(
        (accumulated, item) => {
            const percent = (item.value / total) * 100;

            return {
                offsets: [...accumulated.offsets, accumulated.cumulative],
                cumulative: accumulated.cumulative - percent,
            };
        },
        { offsets: [], cumulative: 25 },
    ).offsets;

    return (
        <div className="grid items-center gap-5 sm:grid-cols-[180px_1fr] xl:grid-cols-1 2xl:grid-cols-[180px_1fr]">
            <svg viewBox="0 0 42 42" className="mx-auto size-44 -rotate-90">
                <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#eef1f6" strokeWidth="6" />
                {data.map((item, index) => {
                    const percent = (item.value / total) * 100;
                    const isHovered = hoveredIndex === index;
                    const isDimmed = hoveredIndex !== null && hoveredIndex !== index;

                    return (
                        <circle
                            key={item.label}
                            cx="21"
                            cy="21"
                            r="15.9"
                            fill="transparent"
                            stroke={item.color}
                            strokeDasharray={`${percent} ${100 - percent}`}
                            strokeDashoffset={strokeOffsets[index]}
                            strokeWidth={isHovered ? '7.5' : '6'}
                            opacity={isDimmed ? 0.28 : 1}
                            className="cursor-pointer transition-all duration-200"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        />
                    );
                })}
            </svg>
            <div className="space-y-3">
                {data.map((item, index) => {
                    const percent = Math.round((item.value / total) * 100);
                    const isHovered = hoveredIndex === index;
                    const isDimmed = hoveredIndex !== null && hoveredIndex !== index;

                    return (
                        <div
                            key={item.label}
                            className={`flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm transition ${
                                isHovered
                                    ? 'bg-hod-chip text-hod-navy'
                                    : isDimmed
                                      ? 'opacity-45'
                                      : 'hover:bg-hod-surface'
                            }`}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <span className="flex items-center gap-2 font-semibold text-hod-navy">
                                <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                {item.label}
                            </span>
                            <span className="font-bold text-hod-ink">
                                {item.value} ({percent}%)
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function CategoryBars({ data }: { data: { label: string; value: number }[] }) {
    if (data.length === 0) {
        return <EmptyChart message="No category sales yet." />;
    }

    const max = Math.max(...data.map((item) => item.value));

    return (
        <div className="space-y-4">
            {data.map((item) => (
                <div key={item.label} className="grid gap-2 sm:grid-cols-[150px_1fr_44px] sm:items-center">
                    <span className="truncate text-sm font-bold text-hod-navy">
                        {item.label}
                    </span>
                    <div className="h-3 overflow-hidden rounded-full bg-hod-chip">
                        <div
                            className="h-full rounded-full bg-hod-navy"
                            style={{ width: `${(item.value / max) * 100}%` }}
                        />
                    </div>
                    <span className="text-sm font-black text-hod-ink">
                        {item.value}
                    </span>
                </div>
            ))}
        </div>
    );
}

function PaymentBreakdown({
    data,
}: {
    data: { label: string; value: number; color: string }[];
}) {
    if (data.length === 0) {
        return <EmptyChart message="No payment method data yet." />;
    }

    return (
        <div className="space-y-5">
            {data.map((item) => (
                <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-bold text-hod-navy">{item.label}</span>
                        <span className="font-black text-hod-ink">{item.value}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-hod-chip">
                        <div
                            className="h-full rounded-full"
                            style={{
                                width: `${item.value}%`,
                                backgroundColor: item.color,
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

function Metric({
    label,
    value,
    helper,
    href,
    icon: Icon,
    trend,
    sparkline,
}: {
    label: string;
    value: string;
    helper: string;
    href: string;
    icon: typeof Package;
    trend?: { direction: 'up' | 'down'; value: string };
    sparkline?: number[];
}) {
    return (
        <Link
            href={href}
            className="group flex min-h-[160px] flex-col rounded-lg border border-hod-line bg-hod-panel p-5 shadow-[0_1px_2px_rgba(16,32,68,0.04)] outline-none transition hover:-translate-y-0.5 hover:border-hod-navy/20 hover:shadow-[0_10px_24px_rgba(26,47,94,0.08)] focus-visible:ring-2 focus-visible:ring-hod-red/70 active:translate-y-0 sm:p-6"
        >
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-hod-muted">{label}</p>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-hod-chip text-hod-navy transition group-hover:bg-hod-navy group-hover:text-white">
                    <Icon className="size-5" />
                </span>
            </div>
            <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                    <p className="text-[28px] leading-none font-black text-hod-navy">
                        {value}
                    </p>
                    {trend && (
                        <p
                            className={`mt-2 text-xs font-black ${
                                trend.direction === 'up'
                                    ? 'text-emerald-600'
                                    : 'text-hod-red'
                            }`}
                        >
                            {trend.direction === 'up' ? '+' : '-'}
                            {trend.value}
                        </p>
                    )}
                </div>
                {sparkline && <Sparkline values={sparkline} />}
            </div>
            <p className="mt-auto pt-3 text-sm font-semibold text-hod-red transition group-hover:text-hod-red-700">
                {helper}
            </p>
        </Link>
    );
}

function Sparkline({ values }: { values: number[] }) {
    if (values.length < 2) {
        return null;
    }

    const width = 74;
    const height = 30;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const spread = max - min || 1;
    const points = values
        .map((value, index) => {
            const x = (index / (values.length - 1)) * width;
            const y = height - ((value - min) / spread) * height;

            return `${x},${y}`;
        })
        .join(' ');

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            aria-hidden="true"
            className="hidden h-8 w-20 text-hod-navy sm:block"
            preserveAspectRatio="none"
        >
            <polyline
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                points={points}
            />
        </svg>
    );
}

function EmptyChart({ message }: { message: string }) {
    return (
        <div className="flex min-h-44 items-center justify-center rounded-md border border-dashed border-hod-line bg-hod-surface text-sm font-semibold text-hod-muted">
            {message}
        </div>
    );
}

function ActionCard({
    icon: Icon,
    title,
    description,
    primaryHref,
    primaryLabel,
    secondaryHref,
    secondaryLabel,
}: {
    icon: typeof Package;
    title: string;
    description: string;
    primaryHref: string;
    primaryLabel: string;
    secondaryHref: string;
    secondaryLabel: string;
}) {
    return (
        <article className="group flex min-h-[176px] flex-col rounded-lg border border-hod-line bg-hod-panel p-5 shadow-[0_1px_2px_rgba(16,32,68,0.04)] outline-none transition hover:-translate-y-0.5 hover:border-hod-navy/20 hover:shadow-[0_10px_24px_rgba(26,47,94,0.08)]">
            <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-hod-chip text-hod-navy">
                    <Icon className="size-[18px]" />
                </span>
                <div className="min-w-0">
                    <h2 className="text-base leading-5 font-black text-hod-navy">
                        {title}
                    </h2>
                    <p className="mt-1.5 text-sm leading-5 text-hod-muted">
                        {description}
                    </p>
                </div>
            </div>
            <div className="mt-auto flex flex-wrap gap-2 pt-4">
                <Link
                    href={primaryHref}
                    className="inline-flex h-9 items-center gap-2 rounded-md bg-hod-red px-3 text-sm font-bold text-white outline-none transition hover:bg-hod-red-700 focus-visible:ring-2 focus-visible:ring-hod-red/60 focus-visible:ring-offset-2 active:translate-y-px"
                >
                    <Plus className="size-4" />
                    {primaryLabel}
                </Link>
                <Link
                    href={secondaryHref}
                    className="inline-flex h-9 items-center rounded-md px-3 text-sm font-bold text-hod-navy outline-none transition hover:bg-hod-chip focus-visible:ring-2 focus-visible:ring-hod-red/60 focus-visible:ring-offset-2 active:translate-y-px"
                >
                    {secondaryLabel}
                </Link>
            </div>
        </article>
    );
}

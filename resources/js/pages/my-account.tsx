import { Head, Link, usePage } from '@inertiajs/react';
import { Award, PackageCheck, ShoppingBag, Ticket, Truck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CustomerNavbar } from '@/components/customer-navbar';

type Order = {
    id: number;
    order_number: string;
    county: string;
    town: string;
    total_amount: string | number;
    status: string;
    payments?: {
        status: string;
        method: string;
        amount?: string | number;
    }[];
};

export default function MyAccount({ orders = [] }: { orders: Order[] }) {
    const { shopSettings } = usePage().props as unknown as {
        shopSettings?: { shopping_points_percentage?: string | number | null };
    };
    const [activeTab, setActiveTab] = useState<
        'active' | 'past' | 'points'
    >('active');
    const pastStatuses = ['shipped', 'delivered', 'completed', 'cancelled'];
    const pointsPercentage = Number(
        shopSettings?.shopping_points_percentage ?? 10,
    );
    const normalizeStatus = (status: string) => status.trim().toLowerCase();
    const activeOrders = orders.filter(
        (order) => !pastStatuses.includes(normalizeStatus(order.status)),
    );
    const pastOrders = orders.filter((order) =>
        pastStatuses.includes(normalizeStatus(order.status)),
    );
    const pointsHistory = useMemo(
        () =>
            orders
                .filter((order) => order.payments?.[0]?.status === 'paid')
                .map((order) => {
                    const totalAmount = Number(order.total_amount);
                    const points = Math.floor(
                        (totalAmount * pointsPercentage) / 100,
                    );

                    return {
                        ...order,
                        points,
                        totalAmount,
                    };
                }),
        [orders, pointsPercentage],
    );
    const shoppingPoints = useMemo(
        () => pointsHistory.reduce((total, order) => total + order.points, 0),
        [pointsHistory],
    );

    return (
        <>
            <Head title="My Account | Scented Muse" />
            <main className="min-h-screen bg-[#fff7f2] text-[#17131f]">
                <CustomerNavbar />
                <section className="mx-auto grid max-w-[1200px] gap-5 p-4">
                    <div className="rounded-md bg-white p-5 shadow-sm">
                        <h1 className="text-2xl font-black text-[#3b2147]">
                            My Account
                        </h1>

                        <div className="mt-6 grid gap-2 sm:grid-cols-3">
                            <TabButton
                                active={activeTab === 'active'}
                                icon={Truck}
                                label="My Active Orders"
                                onClick={() => setActiveTab('active')}
                            />
                            <TabButton
                                active={activeTab === 'past'}
                                icon={PackageCheck}
                                label="Past Orders"
                                onClick={() => setActiveTab('past')}
                            />
                            <TabButton
                                active={activeTab === 'points'}
                                icon={Award}
                                label="My HOD Shopping Points"
                                onClick={() => setActiveTab('points')}
                            />
                        </div>

                        <div className="mt-5">
                            {activeTab === 'active' && (
                                <OrderList
                                    orders={activeOrders}
                                    emptyMessage="You do not have active orders at the moment."
                                />
                            )}
                            {activeTab === 'past' && (
                                <OrderList
                                    orders={pastOrders}
                                    emptyMessage="Your shipped, delivered, completed, and cancelled orders will appear here."
                                />
                            )}
                            {activeTab === 'points' && (
                                <section className="rounded-md border border-[#ead9d1] bg-[#fff7f2] p-5">
                                    <div className="flex items-center gap-3">
                                        <span className="flex size-12 items-center justify-center rounded-md bg-[#3b2147] text-white">
                                            <Award className="size-6" />
                                        </span>
                                        <div>
                                            <p className="text-sm font-bold text-[#7f5f53]">
                                                Available points
                                            </p>
                                            <p className="text-3xl font-black text-[#3b2147]">
                                                {shoppingPoints.toLocaleString(
                                                    'en-KE',
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-sm leading-6 text-[#7f5f53]">
                                        Points are calculated from paid orders
                                        at {pointsPercentage}% of the total
                                        amount and will be redeemable when the
                                        admin activates rewards.
                                    </p>
                                    <div className="mt-5 overflow-hidden rounded-md border border-[#ead9d1] bg-white">
                                        <div className="grid grid-cols-[1fr_auto_auto] gap-3 bg-[#3b2147] px-4 py-3 text-xs font-black text-white">
                                            <span>Order</span>
                                            <span className="text-right">
                                                Total
                                            </span>
                                            <span className="text-right">
                                                Points
                                            </span>
                                        </div>
                                        {pointsHistory.length > 0 ? (
                                            pointsHistory.map((order) => (
                                                <div
                                                    key={order.id}
                                                    className="grid grid-cols-[1fr_auto_auto] gap-3 border-t border-[#ead9d1] px-4 py-3 text-sm"
                                                >
                                                    <div>
                                                        <p className="font-black text-[#3b2147]">
                                                            {
                                                                order.order_number
                                                            }
                                                        </p>
                                                        <p className="text-xs text-[#7f5f53]">
                                                            Paid order |{' '}
                                                            {pointsPercentage}%
                                                            reward
                                                        </p>
                                                    </div>
                                                    <span className="text-right font-semibold text-[#17131f]">
                                                        KSh{' '}
                                                        {order.totalAmount.toLocaleString(
                                                            'en-KE',
                                                        )}
                                                    </span>
                                                    <span className="text-right font-black text-[#e85d4f]">
                                                        +{order.points}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-4 py-6 text-center text-sm text-[#7f5f53]">
                                                Paid orders will appear here
                                                once points are earned.
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>

                    <section className="rounded-md bg-white p-5 shadow-sm">
                        <h2 className="flex items-center gap-2 text-xl font-black text-[#3b2147]">
                            <Ticket className="size-5 text-[#e85d4f]" />
                            Coupons
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-[#7f5f53]">
                            Active coupons and customer offers will appear here.
                        </p>
                        <div className="mt-4 rounded-md bg-[#fff1ea] p-4 font-black text-[#3b2147]">
                            HOD-SOFT-LIVING
                        </div>
                        <Link
                            href="/my-orders"
                            className="mt-5 inline-flex h-11 items-center rounded-md bg-[#3b2147] px-5 font-black text-white"
                        >
                            View receipts
                        </Link>
                    </section>
                </section>
            </main>
        </>
    );
}

function TabButton({
    active,
    icon: Icon,
    label,
    onClick,
}: {
    active: boolean;
    icon: typeof Truck;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex min-h-12 items-center justify-center gap-2 rounded-md border px-3 text-sm font-black transition ${
                active
                    ? 'border-[#3b2147] bg-[#3b2147] text-white'
                    : 'border-[#ead9d1] bg-white text-[#3b2147] hover:border-[#e85d4f] hover:text-[#e85d4f]'
            }`}
        >
            <Icon className="size-5" />
            {label}
        </button>
    );
}

function OrderList({
    orders,
    emptyMessage,
}: {
    orders: Order[];
    emptyMessage: string;
}) {
    return orders.length > 0 ? (
        <div className="space-y-3">
            {orders.map((order) => (
                <article
                    key={order.id}
                    className="rounded-md border border-[#ead9d1] p-4"
                >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="font-black">{order.order_number}</p>
                            <p className="mt-1 text-sm text-[#7f5f53]">
                                Status: {order.status} | Payment:{' '}
                                {order.payments?.[0]?.status ?? 'pending'} |
                                Delivery: {order.town}, {order.county}
                            </p>
                        </div>
                        <p className="font-black text-[#3b2147]">
                            KSh{' '}
                            {Number(order.total_amount).toLocaleString(
                                'en-KE',
                            )}
                        </p>
                    </div>
                    <Link
                        href="/my-orders"
                        className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-[#e85d4f] px-4 text-sm font-black text-white transition hover:bg-[#3b2147]"
                    >
                        <ShoppingBag className="size-4" />
                        View order
                    </Link>
                </article>
            ))}
        </div>
    ) : (
        <div className="rounded-md bg-[#fff7f2] p-6 text-center text-[#7f5f53]">
            {emptyMessage}
        </div>
    );
}

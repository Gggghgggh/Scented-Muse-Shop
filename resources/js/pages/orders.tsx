import { Head, Link, usePage } from '@inertiajs/react';
import { Download, Eye, X } from 'lucide-react';
import { useState } from 'react';
import { CustomerNavbar } from '@/components/customer-navbar';

type OrderItem = {
    product_code?: string | null;
    name: string;
    size?: string | null;
    color?: string | null;
    quantity?: number;
    unit_price?: string | number;
    line_total?: string | number;
};

type Order = {
    id: number;
    order_number: string;
    customer_name?: string;
    customer_email?: string | null;
    customer_phone?: string | null;
    county: string;
    town: string;
    items?: OrderItem[];
    delivery_fee?: string | number;
    total_amount: string | number;
    status: string;
    created_at: string;
    payments?: {
        id: number;
        status: string;
        method: string;
        amount: string | number;
        payment_number: string;
    }[];
};

export default function OrdersPage({ orders = [] }: { orders: Order[] }) {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const { flash } = usePage().props as {
        flash?: {
            checkout?: {
                message: string;
                receipt_url: string;
                order_number: string;
            };
        };
    };

    return (
        <>
            <Head title="My Orders | Scented Muse" />
            <main className="min-h-screen bg-[#fff7f2] text-[#17131f]">
                <CustomerNavbar />
                {selectedOrder && (
                    <ReceiptModal
                        order={selectedOrder}
                        onClose={() => setSelectedOrder(null)}
                    />
                )}
                <section className="mx-auto mt-4 max-w-5xl rounded-md bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-black text-[#3b2147]">
                            My Orders
                        </h1>
                        <Link href="/" className="font-black text-[#e85d4f]">
                            Back to shop
                        </Link>
                    </div>
                    {flash?.checkout && (
                        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-md bg-[#fff1ea] p-4 font-bold text-[#3b2147]">
                            {flash.checkout.message}
                            <a
                                href={flash.checkout.receipt_url}
                                className="ml-auto inline-flex h-10 items-center gap-2 rounded-md bg-[#3b2147] px-4 text-sm font-black text-white"
                            >
                                <Download className="size-4" />
                                Download receipt
                            </a>
                        </div>
                    )}
                    <div className="mt-6 space-y-3">
                        {orders.length > 0 ? (
                            orders.map((order) => (
                                <article
                                    key={order.id}
                                    className="rounded-md border border-[#ead9d1] p-4"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="font-black">
                                                {order.order_number}
                                            </p>
                                            <p className="text-sm text-[#7f5f53]">
                                                {order.town}, {order.county} |
                                                KSh{' '}
                                                {Number(
                                                    order.total_amount,
                                                ).toLocaleString('en-KE')}{' '}
                                                | Status: {order.status}
                                            </p>
                                            <p className="mt-1 text-xs text-[#7f5f53]">
                                                Payment:{' '}
                                                {order.payments?.[0]?.status ??
                                                    'pending'}{' '}
                                                via{' '}
                                                {order.payments?.[0]?.method ??
                                                    'cash_on_delivery'}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedOrder(order)
                                            }
                                            className="inline-flex h-10 items-center gap-2 rounded-md bg-[#3b2147] px-4 font-black text-white"
                                        >
                                            <Eye className="size-4" />
                                            View receipt
                                        </button>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <div className="rounded-md bg-[#fff7f2] p-8 text-center text-[#7f5f53]">
                                No orders yet.
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </>
    );
}

function ReceiptModal({
    order,
    onClose,
}: {
    order: Order;
    onClose: () => void;
}) {
    const payment = order.payments?.[0];
    const productsTotal = (order.items ?? []).reduce(
        (sum, item) => sum + Number(item.line_total ?? 0),
        0,
    );

    return (
        <div className="fixed inset-0 z-50 bg-black/50 p-4">
            <div className="mx-auto max-h-[calc(100vh-2rem)] max-w-3xl overflow-y-auto rounded-md bg-white shadow-2xl">
                <div className="sticky top-0 flex items-center justify-between border-b border-[#ead9d1] bg-white px-5 py-4">
                    <div>
                        <p className="text-xs font-black text-[#e85d4f] uppercase">
                            Scented Muse receipt
                        </p>
                        <h2 className="text-xl font-black text-[#3b2147]">
                            {order.order_number}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex size-10 items-center justify-center rounded-full border border-[#ead9d1]"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <div className="space-y-5 p-5">
                    <div className="grid gap-3 rounded-md bg-[#fff7f2] p-4 text-sm text-[#7f5f53] sm:grid-cols-2">
                        <ReceiptLine
                            label="Date of order"
                            value={new Date(order.created_at).toLocaleString(
                                'en-KE',
                            )}
                        />
                        <ReceiptLine label="Status" value={order.status} />
                        <ReceiptLine
                            label="Customer"
                            value={order.customer_name ?? 'Customer'}
                        />
                        <ReceiptLine
                            label="Phone"
                            value={order.customer_phone ?? 'Not provided'}
                        />
                        <ReceiptLine
                            label="Email"
                            value={order.customer_email ?? 'Not provided'}
                        />
                        <ReceiptLine
                            label="Delivery"
                            value={`${order.town}, ${order.county}`}
                        />
                    </div>

                    <section>
                        <h3 className="font-black text-[#3b2147]">Products</h3>
                        <div className="mt-3 divide-y divide-[#ead9d1] rounded-md border border-[#ead9d1]">
                            {(order.items ?? []).map((item, index) => (
                                <div
                                    key={`${item.name}-${index}`}
                                    className="grid gap-2 p-3 text-sm sm:grid-cols-[minmax(0,1fr)_auto]"
                                >
                                    <div>
                                        <p className="font-black">
                                            {item.name}
                                        </p>
                                        {item.product_code && (
                                            <p className="font-mono text-xs font-bold text-[#3b2147]">
                                                Code: {item.product_code}
                                            </p>
                                        )}
                                        <p className="text-[#7f5f53]">
                                            Size: {item.size ?? 'Default'} |
                                            Color: {item.color ?? 'Default'} |
                                            Qty: {item.quantity ?? 1}
                                        </p>
                                    </div>
                                    <div className="font-black text-[#3b2147]">
                                        {formatPrice(item.line_total ?? 0)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="grid gap-2 rounded-md bg-[#fff7f2] p-4 text-sm">
                        <ReceiptLine
                            label="Payment number"
                            value={payment?.payment_number ?? 'Pending'}
                        />
                        <ReceiptLine
                            label="Payment method"
                            value={payment?.method ?? 'cash_on_delivery'}
                        />
                        <ReceiptLine
                            label="Payment status"
                            value={payment?.status ?? 'pending'}
                        />
                        <ReceiptLine
                            label="Products total"
                            value={formatPrice(productsTotal)}
                        />
                        <ReceiptLine
                            label="Delivery fee"
                            value={formatPrice(order.delivery_fee ?? 0)}
                        />
                        <ReceiptLine
                            label="Total amount paid"
                            value={formatPrice(order.total_amount)}
                            strong
                        />
                    </section>

                    <a
                        href={`/my-orders/${order.id}/receipt`}
                        className="flex h-12 items-center justify-center gap-2 rounded-md bg-[#e85d4f] font-black text-white"
                    >
                        <Download className="size-5" />
                        Download PDF receipt
                    </a>
                </div>
            </div>
        </div>
    );
}

function ReceiptLine({
    label,
    value,
    strong = false,
}: {
    label: string;
    value: string;
    strong?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-[#7f5f53]">{label}</span>
            <span
                className={`text-right ${strong ? 'text-base font-black text-[#3b2147]' : 'font-semibold text-[#17131f]'}`}
            >
                {value}
            </span>
        </div>
    );
}

const formatPrice = (price: string | number) =>
    new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        maximumFractionDigits: 0,
    })
        .format(Number(price))
        .replace('KES', 'KSh');

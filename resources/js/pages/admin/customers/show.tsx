import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type OrderItem = {
    name?: string;
    size?: string | null;
    color?: string | null;
    quantity?: number;
    line_total?: string | number;
};

type Order = {
    id: number;
    order_number: string;
    customer_phone?: string | null;
    county: string;
    town: string;
    items?: OrderItem[];
    delivery_fee?: string | number;
    total_amount: string | number;
    status: string;
    created_at: string;
    payments?: {
        payment_number: string;
        method: string;
        amount: string | number;
        status: string;
        transaction_reference?: string | null;
    }[];
};

type Customer = {
    id: number;
    name: string;
    email: string;
    created_at: string;
    orders: Order[];
};

const pastStatuses = ['shipped', 'delivered', 'completed', 'cancelled'];

export default function CustomerShow({ customer }: { customer: Customer }) {
    const [query, setQuery] = useState('');
    const normalizedQuery = query.trim().toLowerCase();
    const filteredOrders = useMemo(
        () =>
            normalizedQuery
                ? customer.orders.filter((order) =>
                      [
                          order.order_number,
                          order.status,
                          order.customer_phone ?? '',
                          order.county,
                          order.town,
                          order.payments?.[0]?.payment_number ?? '',
                          order.payments?.[0]?.method ?? '',
                          order.payments?.[0]?.status ?? '',
                          ...(order.items ?? []).map((item) =>
                              [
                                  item.name ?? '',
                                  item.size ?? '',
                                  item.color ?? '',
                              ].join(' '),
                          ),
                      ]
                          .join(' ')
                          .toLowerCase()
                          .includes(normalizedQuery),
                  )
                : customer.orders,
        [customer.orders, normalizedQuery],
    );
    const currentOrders = filteredOrders.filter(
        (order) => !pastStatuses.includes(order.status.toLowerCase()),
    );
    const pastOrders = filteredOrders.filter((order) =>
        pastStatuses.includes(order.status.toLowerCase()),
    );
    const phone =
        customer.orders.find((order) => order.customer_phone)?.customer_phone ??
        'Not provided';

    return (
        <>
            <Head title={`${customer.name} | Customer`} />
            <div className="space-y-6 p-4 md:p-6">
                <Button asChild variant="ghost" className="px-0">
                    <Link href="/admin/customers">
                        <ArrowLeft className="size-4" />
                        Back to customers
                    </Link>
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle>{customer.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 text-sm md:grid-cols-3">
                        <Detail label="Email" value={customer.email} />
                        <Detail label="Phone" value={phone} />
                        <Detail
                            label="Joined"
                            value={new Date(
                                customer.created_at,
                            ).toLocaleDateString('en-KE')}
                        />
                    </CardContent>
                </Card>

                <label className="flex h-10 max-w-2xl items-center gap-2 rounded-md border bg-background px-3">
                    <Search className="size-4 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        className="h-full border-0 px-0 shadow-none focus-visible:ring-0"
                        placeholder="Search this customer's orders, products, status, phone, payment, or location"
                    />
                </label>

                <OrderSection title="Current Orders" orders={currentOrders} />
                <OrderSection title="Past Orders" orders={pastOrders} />
            </div>
        </>
    );
}

CustomerShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Customers', href: '/admin/customers' },
    ],
};

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 font-medium">{value}</p>
        </div>
    );
}

function OrderSection({ title, orders }: { title: string; orders: Order[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {orders.length > 0 ? (
                    orders.map((order) => (
                        <article
                            key={order.id}
                            className="rounded-md border p-4"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="font-semibold">
                                        {order.order_number}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(
                                            order.created_at,
                                        ).toLocaleString('en-KE')}{' '}
                                        | {order.town}, {order.county}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">
                                        {formatPrice(order.total_amount)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {order.status}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 overflow-hidden rounded-md border">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted text-muted-foreground">
                                        <tr>
                                            <th className="px-3 py-2 text-left">
                                                Product
                                            </th>
                                            <th className="px-3 py-2 text-left">
                                                Option
                                            </th>
                                            <th className="px-3 py-2 text-right">
                                                Qty
                                            </th>
                                            <th className="px-3 py-2 text-right">
                                                Amount
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {(order.items ?? []).map(
                                            (item, index) => (
                                                <tr key={index}>
                                                    <td className="px-3 py-2">
                                                        {item.name}
                                                    </td>
                                                    <td className="px-3 py-2 text-muted-foreground">
                                                        {item.size ?? 'Default'}{' '}
                                                        |{' '}
                                                        {item.color ??
                                                            'Default'}
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        {item.quantity ?? 1}
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        {formatPrice(
                                                            item.line_total ??
                                                                0,
                                                        )}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-3 grid gap-1 text-sm text-muted-foreground sm:grid-cols-3">
                                <span>
                                    Delivery fee:{' '}
                                    {formatPrice(order.delivery_fee ?? 0)}
                                </span>
                                <span>
                                    Payment:{' '}
                                    {order.payments?.[0]?.status ?? 'pending'}
                                </span>
                                <span>
                                    Method:{' '}
                                    {order.payments?.[0]?.method ??
                                        'cash_on_delivery'}
                                </span>
                            </div>
                        </article>
                    ))
                ) : (
                    <div className="rounded-md border p-6 text-center text-muted-foreground">
                        No matching orders in this section.
                    </div>
                )}
            </CardContent>
        </Card>
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

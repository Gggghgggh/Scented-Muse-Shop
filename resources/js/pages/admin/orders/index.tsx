import { Head, Link, useForm } from '@inertiajs/react';
import { Edit, Eye, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminConfirmDialog } from '@/components/admin-confirm-dialog';
import { AdminPagination } from '@/components/admin-pagination';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminServerSearch } from '@/hooks/use-admin-search-query';
import { deleteAdminResource } from '@/lib/admin-actions';
import type { Paginated } from '@/types/pagination';

type OrderItem = {
    product_code?: string | null;
    name: string;
    size?: string | null;
    color?: string | null;
    quantity?: number;
    unit_price?: string | number;
    line_total?: string | number;
};

type OrderFormUser = {
    id: number;
    name: string;
    email: string;
};

type Order = {
    id: number;
    order_number: string;
    user_id: number | null;
    customer_name: string;
    customer_email?: string | null;
    customer_phone?: string | null;
    county: string;
    town: string;
    items?: OrderItem[];
    delivery_fee?: string | number;
    total_amount: string | number;
    status: string;
    notes?: string | null;
    created_at: string;
    payments?: {
        payment_number: string;
        method: string;
        amount: string | number;
        status: string;
        transaction_reference?: string | null;
    }[];
};

const statuses = [
    'processing',
    'confirmed',
    'shipped',
    'delivered',
    'cancelled',
];

export default function OrderIndex({
    orders,
    users,
}: {
    orders: Paginated<Order>;
    users: OrderFormUser[];
}) {
    const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [query, setQuery] = useAdminServerSearch('/admin/orders', [
        'orders',
    ]);

    return (
        <>
            <Head title="Orders" />
            <AdminConfirmDialog
                open={Boolean(orderToDelete)}
                title="Delete order?"
                description={
                    orderToDelete
                        ? `This will permanently delete order "${orderToDelete.order_number}".`
                        : ''
                }
                confirmLabel="Delete order"
                onCancel={() => setOrderToDelete(null)}
                onConfirm={() => {
                    if (!orderToDelete) {
                        return;
                    }

                    deleteAdminResource(`/admin/orders/${orderToDelete.id}`, {
                        onFinish: () => setOrderToDelete(null),
                    });
                }}
            />
            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    users={users}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
            <div className="space-y-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Orders</h1>
                    <Button asChild>
                        <Link href="/admin/orders/create">
                            <Plus className="size-4" />
                            New order
                        </Link>
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Order management</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <label className="flex h-10 max-w-xl items-center gap-2 rounded-md border px-3">
                            <Search className="size-4 text-muted-foreground" />
                            <Input
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                className="h-full border-0 px-0 shadow-none focus-visible:ring-0"
                                placeholder="Search by order, customer, phone, location, status, product, payment, or amount"
                            />
                        </label>
                        <Table
                            headers={[
                                'Order',
                                'Customer',
                                'Location',
                                'Total',
                                'Status',
                                'Actions',
                            ]}
                            rows={orders.data.map((order) => [
                                order.order_number,
                                order.customer_name,
                                `${order.town}, ${order.county}`,
                                formatPrice(order.total_amount),
                                order.status,
                                <Actions
                                    key={order.id}
                                    editHref={`/admin/orders/${order.id}/edit`}
                                    onView={() => setSelectedOrder(order)}
                                    onDelete={() => setOrderToDelete(order)}
                                />,
                            ])}
                        />
                        <AdminPagination pagination={orders} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

OrderIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Orders', href: '/admin/orders' },
    ],
};

function Actions({
    editHref,
    onView,
    onDelete,
}: {
    editHref: string;
    onView: () => void;
    onDelete: () => void;
}) {
    return (
        <div className="flex justify-end gap-2">
            <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onView}
            >
                <Eye className="size-4" />
            </Button>
            <Button asChild variant="outline" size="icon">
                <Link href={editHref}>
                    <Edit className="size-4" />
                </Link>
            </Button>
            <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={onDelete}
            >
                <Trash2 className="size-4" />
            </Button>
        </div>
    );
}

function OrderDetailsModal({
    order,
    users,
    onClose,
}: {
    order: Order;
    users: OrderFormUser[];
    onClose: () => void;
}) {
    const { data, setData, put, processing, errors, reset } = useForm({
        user_id: order.user_id ? String(order.user_id) : '',
        customer_name: order.customer_name,
        customer_email: order.customer_email ?? '',
        customer_phone: order.customer_phone ?? '',
        county: order.county,
        town: order.town,
        delivery_fee: String(order.delivery_fee ?? 0),
        total_amount: String(order.total_amount),
        status: order.status,
        notes: order.notes ?? '',
    });

    useEffect(() => {
        reset();
    }, [order.id, reset]);

    const itemsTotal = (order.items ?? []).reduce(
        (sum, item) => sum + Number(item.line_total ?? 0),
        0,
    );

    return (
        <div className="fixed inset-0 z-50 bg-black/45 p-4">
            <div className="mx-auto max-h-[calc(100vh-2rem)] max-w-5xl overflow-y-auto rounded-md bg-background shadow-xl">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-5 py-4">
                    <div>
                        <h2 className="text-xl font-semibold">
                            {order.order_number}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Ordered on{' '}
                            {new Date(order.created_at).toLocaleString('en-KE')}
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                    >
                        <X className="size-5" />
                    </Button>
                </div>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        put(`/admin/orders/${order.id}`, {
                            preserveScroll: true,
                            onSuccess: onClose,
                        });
                    }}
                    className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_340px]"
                >
                    <div className="space-y-5">
                        <section className="rounded-md border p-4">
                            <h3 className="font-semibold">Products</h3>
                            <div className="mt-3 overflow-hidden rounded-md border">
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
                                                    <td className="px-3 py-2 font-medium">
                                                        {item.name}
                                                        {item.product_code && (
                                                            <div className="mt-1 font-mono text-xs text-muted-foreground">
                                                                {
                                                                    item.product_code
                                                                }
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-muted-foreground">
                                                        Size:{' '}
                                                        {item.size ?? 'Default'}{' '}
                                                        | Color:{' '}
                                                        {item.color ??
                                                            'Default'}
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        {item.quantity ?? 1}
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        {formatPrice(
                                                            item.line_total ??
                                                                item.unit_price ??
                                                                0,
                                                        )}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="rounded-md border p-4">
                            <h3 className="font-semibold">Payment summary</h3>
                            <div className="mt-3 grid gap-2 text-sm">
                                <SummaryRow
                                    label="Products total"
                                    value={formatPrice(itemsTotal)}
                                />
                                <SummaryRow
                                    label="Delivery fee"
                                    value={formatPrice(order.delivery_fee ?? 0)}
                                />
                                <SummaryRow
                                    label="Total paid"
                                    value={formatPrice(order.total_amount)}
                                    strong
                                />
                                <SummaryRow
                                    label="Payment status"
                                    value={
                                        order.payments?.[0]?.status ?? 'pending'
                                    }
                                />
                                <SummaryRow
                                    label="Payment method"
                                    value={
                                        order.payments?.[0]?.method ??
                                        'cash_on_delivery'
                                    }
                                />
                            </div>
                        </section>
                    </div>

                    <section className="space-y-4 rounded-md border p-4">
                        <h3 className="font-semibold">Editable details</h3>
                        <div className="space-y-2">
                            <Label>Linked customer account</Label>
                            <select
                                value={data.user_id}
                                onChange={(event) =>
                                    setData('user_id', event.target.value)
                                }
                                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                            >
                                <option value="">No linked account</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} &lt;{user.email}&gt;
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.user_id} />
                        </div>
                        <Field
                            label="Customer full name"
                            value={data.customer_name}
                            onChange={(value) =>
                                setData('customer_name', value)
                            }
                            error={errors.customer_name}
                        />
                        <Field
                            label="Customer email"
                            type="email"
                            value={data.customer_email}
                            onChange={(value) =>
                                setData('customer_email', value)
                            }
                            error={errors.customer_email}
                        />
                        <Field
                            label="Phone number"
                            value={data.customer_phone}
                            onChange={(value) =>
                                setData('customer_phone', value)
                            }
                            error={errors.customer_phone}
                        />
                        <Field
                            label="County"
                            value={data.county}
                            onChange={(value) => setData('county', value)}
                            error={errors.county}
                        />
                        <Field
                            label="Town"
                            value={data.town}
                            onChange={(value) => setData('town', value)}
                            error={errors.town}
                        />
                        <Field
                            label="Delivery fee"
                            type="number"
                            value={data.delivery_fee}
                            onChange={(value) => setData('delivery_fee', value)}
                            error={errors.delivery_fee}
                        />
                        <Field
                            label="Total amount paid"
                            type="number"
                            value={data.total_amount}
                            onChange={(value) => setData('total_amount', value)}
                            error={errors.total_amount}
                        />
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <select
                                value={data.status}
                                onChange={(event) =>
                                    setData('status', event.target.value)
                                }
                                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                            >
                                {statuses.map((status) => (
                                    <option key={status}>{status}</option>
                                ))}
                            </select>
                            <InputError message={errors.status} />
                        </div>
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <textarea
                                value={data.notes}
                                onChange={(event) =>
                                    setData('notes', event.target.value)
                                }
                                className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>
                        <Button disabled={processing} className="w-full">
                            Save changes
                        </Button>
                    </section>
                </form>
            </div>
        </div>
    );
}

function Field({
    label,
    value,
    onChange,
    error,
    type = 'text',
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    type?: string;
}) {
    const id = label.toLowerCase().replaceAll(' ', '-');

    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
            <InputError message={error} />
        </div>
    );
}

function SummaryRow({
    label,
    value,
    strong = false,
}: {
    label: string;
    value: string;
    strong?: boolean;
}) {
    return (
        <div
            className={`flex items-center justify-between gap-4 ${strong ? 'font-semibold' : ''}`}
        >
            <span className="text-muted-foreground">{label}</span>
            <span>{value}</span>
        </div>
    );
}

function Table({
    headers,
    rows,
}: {
    headers: string[];
    rows: React.ReactNode[][];
}) {
    return (
        <div className="overflow-hidden rounded-md border">
            <table className="w-full text-sm">
                <thead className="bg-muted text-muted-foreground">
                    <tr>
                        {headers.map((header) => (
                            <th
                                key={header}
                                className="px-4 py-3 text-left font-medium last:text-right"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {rows.length ? (
                        rows.map((row, index) => (
                            <tr key={index}>
                                {row.map((cell, cellIndex) => (
                                    <td
                                        key={cellIndex}
                                        className="px-4 py-3 last:text-right"
                                    >
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={headers.length}
                                className="px-4 py-8 text-center text-muted-foreground"
                            >
                                No orders yet.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
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

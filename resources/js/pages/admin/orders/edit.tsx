import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Order = {
    id: number;
    user_id: number | null;
    customer_name: string;
    customer_email: string | null;
    customer_phone?: string | null;
    county: string;
    town: string;
    items: Array<{ name: string }>;
    delivery_fee?: string | number;
    total_amount: string;
    status: string;
    notes: string | null;
};

type OrderFormUser = {
    id: number;
    name: string;
    email: string;
};

export default function OrderEdit({
    order,
    users,
}: {
    order: Order;
    users: OrderFormUser[];
}) {
    const { data, setData, put, processing, errors } = useForm({
        user_id: order.user_id ? String(order.user_id) : '',
        customer_name: order.customer_name,
        customer_email: order.customer_email ?? '',
        customer_phone: order.customer_phone ?? '',
        county: order.county,
        town: order.town,
        items: (order.items ?? []).map((item) => item.name).join('\n'),
        delivery_fee: String(order.delivery_fee ?? 0),
        total_amount: order.total_amount,
        status: order.status,
        notes: order.notes ?? '',
    });

    return (
        <>
            <Head title="Edit order" />
            <div className="max-w-3xl space-y-6 p-4 md:p-6">
                <Button asChild variant="ghost" className="px-0">
                    <Link href="/admin/orders">
                        <ArrowLeft className="size-4" />
                        Back to orders
                    </Link>
                </Button>
                <Card>
                    <CardHeader>
                        <CardTitle>Edit order</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                put(`/admin/orders/${order.id}`);
                            }}
                            className="grid gap-4 md:grid-cols-2"
                        >
                            <div className="space-y-2 md:col-span-2">
                                <Label>Linked customer account</Label>
                                <select
                                    value={data.user_id}
                                    onChange={(event) =>
                                        setData('user_id', event.target.value)
                                    }
                                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                                >
                                    <option value="">
                                        No linked account
                                    </option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} &lt;{user.email}&gt;
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.user_id} />
                            </div>
                            <Field
                                label="Customer name"
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
                                onChange={(value) =>
                                    setData('delivery_fee', value)
                                }
                                error={errors.delivery_fee}
                            />
                            <Field
                                label="Total amount"
                                type="number"
                                value={data.total_amount}
                                onChange={(value) =>
                                    setData('total_amount', value)
                                }
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
                                    {[
                                        'processing',
                                        'confirmed',
                                        'shipped',
                                        'delivered',
                                        'cancelled',
                                    ].map((status) => (
                                        <option key={status}>{status}</option>
                                    ))}
                                </select>
                                <InputError message={errors.status} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Items, one per line</Label>
                                <textarea
                                    value={data.items}
                                    onChange={(event) =>
                                        setData('items', event.target.value)
                                    }
                                    className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                                <InputError message={errors.items} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Notes</Label>
                                <textarea
                                    value={data.notes}
                                    onChange={(event) =>
                                        setData('notes', event.target.value)
                                    }
                                    className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <Button
                                disabled={processing}
                                className="md:col-span-2"
                            >
                                Save order
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

OrderEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Orders', href: '/admin/orders' },
    ],
};

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

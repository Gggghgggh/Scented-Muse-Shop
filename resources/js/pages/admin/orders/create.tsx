import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type OrderFormUser = {
    id: number;
    name: string;
    email: string;
};

export default function OrderCreate({ users }: { users: OrderFormUser[] }) {
    const { data, setData, post, processing, errors } = useForm({
        user_id: '',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        county: '',
        town: '',
        items: '',
        delivery_fee: '0',
        total_amount: '0',
        status: 'processing',
        notes: '',
    });
    return (
        <OrderForm
            title="Create order"
            data={data}
            setData={setData}
            users={users}
            submit={(event: React.FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                post('/admin/orders');
            }}
            processing={processing}
            errors={errors}
        />
    );
}

OrderCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Orders', href: '/admin/orders' },
        { title: 'Create', href: '/admin/orders/create' },
    ],
};

function OrderForm({
    title,
    data,
    setData,
    users,
    submit,
    processing,
    errors,
}: any) {
    return (
        <>
            <Head title={title} />
            <div className="max-w-3xl space-y-6 p-4 md:p-6">
                <Button asChild variant="ghost" className="px-0">
                    <Link href="/admin/orders">
                        <ArrowLeft className="size-4" />
                        Back to orders
                    </Link>
                </Button>
                <Card>
                    <CardHeader>
                        <CardTitle>{title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={submit}
                            className="grid gap-4 md:grid-cols-2"
                        >
                            <div className="space-y-2 md:col-span-2">
                                <Label>Linked customer account</Label>
                                <select
                                    value={data.user_id}
                                    onChange={(e) =>
                                        setData('user_id', e.target.value)
                                    }
                                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                                >
                                    <option value="">
                                        No linked account
                                    </option>
                                    {users.map((user: OrderFormUser) => (
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
                                onChange={(v) => setData('customer_name', v)}
                                error={errors.customer_name}
                            />
                            <Field
                                label="Customer email"
                                type="email"
                                value={data.customer_email}
                                onChange={(v) => setData('customer_email', v)}
                                error={errors.customer_email}
                            />
                            <Field
                                label="Phone number"
                                value={data.customer_phone}
                                onChange={(v) => setData('customer_phone', v)}
                                error={errors.customer_phone}
                            />
                            <Field
                                label="County"
                                value={data.county}
                                onChange={(v) => setData('county', v)}
                                error={errors.county}
                            />
                            <Field
                                label="Town"
                                value={data.town}
                                onChange={(v) => setData('town', v)}
                                error={errors.town}
                            />
                            <Field
                                label="Delivery fee"
                                type="number"
                                value={data.delivery_fee}
                                onChange={(v) => setData('delivery_fee', v)}
                                error={errors.delivery_fee}
                            />
                            <Field
                                label="Total amount"
                                type="number"
                                value={data.total_amount}
                                onChange={(v) => setData('total_amount', v)}
                                error={errors.total_amount}
                            />
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <select
                                    value={data.status}
                                    onChange={(e) =>
                                        setData('status', e.target.value)
                                    }
                                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                                >
                                    {[
                                        'processing',
                                        'confirmed',
                                        'shipped',
                                        'delivered',
                                        'cancelled',
                                    ].map((s) => (
                                        <option key={s}>{s}</option>
                                    ))}
                                </select>
                                <InputError message={errors.status} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Items, one per line</Label>
                                <textarea
                                    value={data.items}
                                    onChange={(e) =>
                                        setData('items', e.target.value)
                                    }
                                    className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                                <InputError message={errors.items} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Notes</Label>
                                <textarea
                                    value={data.notes}
                                    onChange={(e) =>
                                        setData('notes', e.target.value)
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
                onChange={(e) => onChange(e.target.value)}
            />
            <InputError message={error} />
        </div>
    );
}

import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type PaymentFormOrder = {
    id: number;
    order_number: string;
    customer_name: string;
    total_amount: string | number;
};

export default function PaymentCreate({
    orders,
}: {
    orders: PaymentFormOrder[];
}) {
    const { data, setData, post, processing, errors } = useForm({
        order_id: '',
        customer_name: '',
        method: 'cash_on_delivery',
        amount: '0',
        status: 'pending',
        transaction_reference: '',
        notes: '',
    });

    return (
        <PaymentForm
            title="Create payment"
            data={data}
            setData={setData}
            orders={orders}
            processing={processing}
            errors={errors}
            submit={(event: React.FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                post('/admin/payments');
            }}
        />
    );
}

PaymentCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Payments', href: '/admin/payments' },
        { title: 'Create', href: '/admin/payments/create' },
    ],
};

export function PaymentForm({
    title,
    data,
    setData,
    orders,
    submit,
    processing,
    errors,
}: any) {
    return (
        <>
            <Head title={title} />
            <div className="max-w-2xl space-y-6 p-4 md:p-6">
                <Button asChild variant="ghost" className="px-0">
                    <Link href="/admin/payments">
                        <ArrowLeft className="size-4" />
                        Back to payments
                    </Link>
                </Button>
                <Card>
                    <CardHeader>
                        <CardTitle>{title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Linked order</Label>
                                <select
                                    value={data.order_id}
                                    onChange={(event) =>
                                        setData('order_id', event.target.value)
                                    }
                                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                                >
                                    <option value="">No linked order</option>
                                    {orders.map((order: PaymentFormOrder) => (
                                        <option key={order.id} value={order.id}>
                                            {order.order_number} —{' '}
                                            {order.customer_name} — KSh{' '}
                                            {order.total_amount}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.order_id} />
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
                                label="Method"
                                value={data.method}
                                onChange={(value) => setData('method', value)}
                                error={errors.method}
                            />
                            <Field
                                label="Amount"
                                type="number"
                                value={data.amount}
                                onChange={(value) => setData('amount', value)}
                                error={errors.amount}
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
                                        'pending',
                                        'paid',
                                        'failed',
                                        'refunded',
                                    ].map((status) => (
                                        <option key={status}>{status}</option>
                                    ))}
                                </select>
                                <InputError message={errors.status} />
                            </div>
                            <Field
                                label="Transaction reference"
                                value={data.transaction_reference}
                                onChange={(value) =>
                                    setData('transaction_reference', value)
                                }
                                error={errors.transaction_reference}
                            />
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
                            <Button disabled={processing}>Save payment</Button>
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
                onChange={(event) => onChange(event.target.value)}
            />
            <InputError message={error} />
        </div>
    );
}

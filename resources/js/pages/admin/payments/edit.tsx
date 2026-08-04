import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentForm } from './create';
import type { PaymentFormOrder } from './create';

type Payment = {
    id: number;
    order_id: number | null;
    customer_name: string;
    method: string;
    amount: string;
    status: string;
    transaction_reference: string | null;
    lipana_transaction_id: string | null;
    lipana_checkout_request_id: string | null;
    lipana_receipt_number: string | null;
    lipana_customer_name: string | null;
    lipana_event: string | null;
    notes: string | null;
};

export default function PaymentEdit({
    payment,
    orders,
}: {
    payment: Payment;
    orders: PaymentFormOrder[];
}) {
    const { data, setData, put, processing, errors } = useForm({
        order_id: payment.order_id ? String(payment.order_id) : '',
        customer_name: payment.customer_name,
        method: payment.method,
        amount: payment.amount,
        status: payment.status,
        transaction_reference: payment.transaction_reference ?? '',
        notes: payment.notes ?? '',
    });

    return (
        <>
            <PaymentForm
                title="Edit payment"
                data={data}
                setData={setData}
                orders={orders}
                processing={processing}
                errors={errors}
                submit={(event: React.FormEvent<HTMLFormElement>) => {
                    event.preventDefault();
                    put(`/admin/payments/${payment.id}`);
                }}
            />
            <div className="max-w-2xl px-4 pb-6 md:px-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Lipana details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
                        <Detail
                            label="Safaricom code"
                            value={payment.lipana_receipt_number}
                        />
                        <Detail
                            label="Lipana customer"
                            value={payment.lipana_customer_name}
                        />
                        <Detail
                            label="Lipana transaction ID"
                            value={payment.lipana_transaction_id}
                        />
                        <Detail
                            label="Checkout request ID"
                            value={payment.lipana_checkout_request_id}
                        />
                        <Detail label="Last webhook event" value={payment.lipana_event} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function Detail({ label, value }: { label: string; value: string | null }) {
    return (
        <div className="rounded-md border p-3">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 break-words font-medium">{value ?? '-'}</p>
        </div>
    );
}

PaymentEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Payments', href: '/admin/payments' },
    ],
};

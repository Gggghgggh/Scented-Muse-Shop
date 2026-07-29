import { useForm } from '@inertiajs/react';
import { PaymentForm, type PaymentFormOrder } from './create';

type Payment = {
    id: number;
    order_id: number | null;
    customer_name: string;
    method: string;
    amount: string;
    status: string;
    transaction_reference: string | null;
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
    );
}

PaymentEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Payments', href: '/admin/payments' },
    ],
};

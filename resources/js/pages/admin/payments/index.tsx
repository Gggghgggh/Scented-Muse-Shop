import { Head, Link } from '@inertiajs/react';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { AdminConfirmDialog } from '@/components/admin-confirm-dialog';
import { AdminPagination } from '@/components/admin-pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAdminServerSearch } from '@/hooks/use-admin-search-query';
import { deleteAdminResource } from '@/lib/admin-actions';
import type { Paginated } from '@/types/pagination';

type Payment = {
    id: number;
    payment_number: string;
    customer_name: string;
    method: string;
    amount: string;
    status: string;
    transaction_reference: string | null;
    lipana_receipt_number: string | null;
    lipana_customer_name: string | null;
    lipana_transaction_id: string | null;
};

export default function PaymentIndex({
    payments,
}: {
    payments: Paginated<Payment>;
}) {
    const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(
        null,
    );
    const [query, setQuery] = useAdminServerSearch('/admin/payments', [
        'payments',
    ]);

    return (
        <>
            <Head title="Payments" />
            <AdminConfirmDialog
                open={Boolean(paymentToDelete)}
                title="Delete payment?"
                description={
                    paymentToDelete
                        ? `This will permanently delete payment "${paymentToDelete.payment_number}".`
                        : ''
                }
                confirmLabel="Delete payment"
                onCancel={() => setPaymentToDelete(null)}
                onConfirm={() => {
                    if (!paymentToDelete) {
                        return;
                    }

                    deleteAdminResource(
                        `/admin/payments/${paymentToDelete.id}`,
                        {
                            onFinish: () => setPaymentToDelete(null),
                        },
                    );
                }}
            />
            <div className="space-y-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Payments</h1>
                    <Button asChild>
                        <Link href="/admin/payments/create">
                            <Plus className="size-4" />
                            New payment
                        </Link>
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Payment management</CardTitle>
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
                                placeholder="Search by payment number, customer, method, status, receipt, or Lipana ID"
                            />
                        </label>
                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full min-w-[980px] text-sm">
                                <thead className="bg-muted text-muted-foreground">
                                    <tr>
                                        {[
                                            'Payment',
                                            'Customer',
                                            'Method',
                                            'Amount',
                                            'Status',
                                            'Safaricom Code',
                                            'Lipana Customer',
                                            'Actions',
                                        ].map((header) => (
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
                                    {payments.data.map((payment) => (
                                        <tr key={payment.id}>
                                            <td className="px-4 py-3">
                                                {payment.payment_number}
                                            </td>
                                            <td className="px-4 py-3">
                                                {payment.customer_name}
                                            </td>
                                            <td className="px-4 py-3">
                                                {payment.method}
                                            </td>
                                            <td className="px-4 py-3">
                                                KSh{' '}
                                                {Number(
                                                    payment.amount,
                                                ).toLocaleString('en-KE')}
                                            </td>
                                            <td className="px-4 py-3">
                                                {payment.status}
                                            </td>
                                            <td className="px-4 py-3 font-medium">
                                                {payment.lipana_receipt_number ??
                                                    payment.transaction_reference ??
                                                    '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {payment.lipana_customer_name ??
                                                    '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        size="icon"
                                                    >
                                                        <Link
                                                            href={`/admin/payments/${payment.id}/edit`}
                                                        >
                                                            <Edit className="size-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() =>
                                                            setPaymentToDelete(
                                                                payment,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {payments.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="px-4 py-8 text-center text-muted-foreground"
                                            >
                                                No payments yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <AdminPagination pagination={payments} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

PaymentIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Payments', href: '/admin/payments' },
    ],
};

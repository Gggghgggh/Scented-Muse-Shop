import { Head, Link } from '@inertiajs/react';
import { Eye, Search } from 'lucide-react';
import { AdminPagination } from '@/components/admin-pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAdminServerSearch } from '@/hooks/use-admin-search-query';
import type { Paginated } from '@/types/pagination';

type Customer = {
    id: number;
    name: string;
    email: string;
    created_at: string;
    orders_count: number;
    orders?: {
        customer_phone?: string | null;
        total_amount?: string | number;
        status?: string;
        created_at?: string;
    }[];
};

export default function CustomerIndex({
    customers,
}: {
    customers: Paginated<Customer>;
}) {
    const [query, setQuery] = useAdminServerSearch('/admin/customers', [
        'customers',
    ]);

    return (
        <>
            <Head title="Customers" />
            <div className="space-y-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Customers</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Search customers by name, email, phone number, order
                        status, or order activity.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Customer management</CardTitle>
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
                                placeholder="Search by email, phone, name, or order status"
                            />
                        </label>

                        <div className="overflow-hidden rounded-md border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Customer
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Phone
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Orders
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Last status
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {customers.data.map((customer) => (
                                        <tr key={customer.id}>
                                            <td className="px-4 py-3">
                                                <div className="font-medium">
                                                    {customer.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {customer.email}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {(customer.orders ?? []).find(
                                                    (order) =>
                                                        order.customer_phone,
                                                )?.customer_phone ??
                                                    customer.orders?.[0]
                                                    ?.customer_phone ??
                                                    'Not provided'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {customer.orders_count}
                                            </td>
                                            <td className="px-4 py-3">
                                                {customer.orders?.[0]?.status ??
                                                    'No orders'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end">
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        size="icon"
                                                    >
                                                        <Link
                                                            href={`/admin/customers/${customer.id}`}
                                                        >
                                                            <Eye className="size-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {customers.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-4 py-8 text-center text-muted-foreground"
                                            >
                                                No matching customers found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <AdminPagination pagination={customers} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

CustomerIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Customers', href: '/admin/customers' },
    ],
};

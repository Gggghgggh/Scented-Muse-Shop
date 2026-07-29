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

type User = {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
    created_at: string;
};

export default function UserIndex({ users }: { users: Paginated<User> }) {
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [query, setQuery] = useAdminServerSearch('/admin/users', ['users']);

    return (
        <>
            <Head title="Users" />
            <AdminConfirmDialog
                open={Boolean(userToDelete)}
                title="Delete user?"
                description={
                    userToDelete
                        ? `This will permanently delete "${userToDelete.name}".`
                        : ''
                }
                confirmLabel="Delete user"
                onCancel={() => setUserToDelete(null)}
                onConfirm={() => {
                    if (!userToDelete) {
                        return;
                    }

                    deleteAdminResource(`/admin/users/${userToDelete.id}`, {
                        onFinish: () => setUserToDelete(null),
                    });
                }}
            />
            <div className="space-y-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Users</h1>
                    <Button asChild>
                        <Link href="/admin/users/create">
                            <Plus className="size-4" />
                            New user
                        </Link>
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>User management</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <SearchBox
                            value={query}
                            onChange={setQuery}
                            placeholder="Search by name, email, role, or date"
                        />
                        <AdminTable
                            headers={['Name', 'Email', 'Role', 'Actions']}
                            rows={users.data.map((user) => [
                                user.name,
                                user.email,
                                user.is_admin ? 'Admin' : 'Customer',
                                <Actions
                                    key={user.id}
                                    editHref={`/admin/users/${user.id}/edit`}
                                    onDelete={() => setUserToDelete(user)}
                                />,
                            ])}
                        />
                        <AdminPagination pagination={users} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function SearchBox({
    value,
    onChange,
    placeholder,
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
}) {
    return (
        <label className="flex h-10 max-w-xl items-center gap-2 rounded-md border px-3">
            <Search className="size-4 text-muted-foreground" />
            <Input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-full border-0 px-0 shadow-none focus-visible:ring-0"
                placeholder={placeholder}
            />
        </label>
    );
}

UserIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Users', href: '/admin/users' },
    ],
};

function Actions({
    editHref,
    onDelete,
}: {
    editHref: string;
    onDelete: () => void;
}) {
    return (
        <div className="flex justify-end gap-2">
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

function AdminTable({
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
                                No records yet.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

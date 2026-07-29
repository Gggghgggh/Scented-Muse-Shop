import { Head, Link } from '@inertiajs/react';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { AdminConfirmDialog } from '@/components/admin-confirm-dialog';
import { AdminPagination } from '@/components/admin-pagination';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAdminServerSearch } from '@/hooks/use-admin-search-query';
import { deleteAdminResource } from '@/lib/admin-actions';
import type { Paginated } from '@/types/pagination';

type Category = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    products_count: number;
};

export default function CategoryIndex({
    categories,
}: {
    categories: Paginated<Category>;
}) {
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
        null,
    );
    const [query, setQuery] = useAdminServerSearch('/admin/categories', [
        'categories',
    ]);

    return (
        <>
            <Head title="Product categories" />
            <AdminConfirmDialog
                open={Boolean(categoryToDelete)}
                title="Delete category?"
                description={
                    categoryToDelete
                        ? `This will permanently delete "${categoryToDelete.name}" and all products in this category.`
                        : ''
                }
                confirmLabel="Delete category"
                onCancel={() => setCategoryToDelete(null)}
                onConfirm={() => {
                    if (!categoryToDelete) {
                        return;
                    }

                    deleteAdminResource(
                        `/admin/categories/${categoryToDelete.id}`,
                        {
                            onFinish: () => setCategoryToDelete(null),
                        },
                    );
                }}
            />
            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Product categories
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage perfumes, deodorants, watches, body wash,
                            body spray, and body splash.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/categories/create">
                            <Plus className="size-4" />
                            New category
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Categories</CardTitle>
                        <CardDescription>
                            Categories control how products are grouped in the
                            shop.
                        </CardDescription>
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
                                placeholder="Search by name, slug, description, product count, or status"
                            />
                        </label>
                        <div className="overflow-hidden rounded-md border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Name
                                        </th>
                                        <th className="hidden px-4 py-3 text-left font-medium md:table-cell">
                                            Slug
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Products
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {categories.data.map((category) => (
                                        <tr key={category.id}>
                                            <td className="px-4 py-3">
                                                <div className="font-medium">
                                                    {category.name}
                                                </div>
                                                {category.description && (
                                                    <div className="mt-1 max-w-sm truncate text-xs text-muted-foreground">
                                                        {category.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                                                {category.slug}
                                            </td>
                                            <td className="px-4 py-3">
                                                {category.products_count}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="rounded-md border px-2 py-1 text-xs">
                                                    {category.is_active
                                                        ? 'Active'
                                                        : 'Hidden'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        size="icon"
                                                    >
                                                        <Link
                                                            href={`/admin/categories/${category.id}/edit`}
                                                            aria-label={`Edit ${category.name}`}
                                                        >
                                                            <Edit className="size-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() =>
                                                            setCategoryToDelete(
                                                                category,
                                                            )
                                                        }
                                                        aria-label={`Delete ${category.name}`}
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {categories.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-4 py-8 text-center text-muted-foreground"
                                            >
                                                No categories yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <AdminPagination pagination={categories} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

CategoryIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Categories', href: '/admin/categories' },
    ],
};

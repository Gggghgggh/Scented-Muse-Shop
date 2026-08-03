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

type Product = {
    id: number;
    product_code: string | null;
    name: string;
    slug: string;
    description: string;
    brand: string | null;
    price: string;
    flash_sale_price: string | null;
    original_price: string | null;
    discount_percentage: number | null;
    stock_quantity: number;
    sizes: string[] | null;
    size_prices: Record<string, string | number> | null;
    size_quantities: Record<string, string | number> | null;
    flash_sale_size_quantities: Record<string, string | number> | null;
    colors: string[] | null;
    photo_url: string | null;
    is_active: boolean;
    is_flash_sale: boolean;
    category: {
        id: number;
        name: string;
    };
};

export default function ProductIndex({
    products,
}: {
    products: Paginated<Product>;
}) {
    const [productToDelete, setProductToDelete] = useState<Product | null>(
        null,
    );
    const [query, setQuery] = useAdminServerSearch('/admin/products', [
        'products',
    ]);

    return (
        <>
            <Head title="Products" />
            <AdminConfirmDialog
                open={Boolean(productToDelete)}
                title="Delete product?"
                description={
                    productToDelete
                        ? `This will permanently delete "${productToDelete.name}" and its uploaded images.`
                        : ''
                }
                confirmLabel="Delete product"
                onCancel={() => setProductToDelete(null)}
                onConfirm={() => {
                    if (!productToDelete) {
                        return;
                    }

                    deleteAdminResource(
                        `/admin/products/${productToDelete.id}`,
                        {
                            onFinish: () => setProductToDelete(null),
                        },
                    );
                }}
            />
            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-2xl font-semibold">Products</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage photos, descriptions, pricing, stock, and
                            visibility, offers, and flash sales.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/products/create">
                            <Plus className="size-4" />
                            New product
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Catalog</CardTitle>
                        <CardDescription>
                            These products can power the public shop catalog
                            later.
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
                                placeholder="Search by code, name, category, brand, price, size, color, status, or stock"
                            />
                        </label>
                        <div className="overflow-hidden rounded-md border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Product
                                        </th>
                                        <th className="hidden px-4 py-3 text-left font-medium lg:table-cell">
                                            Category
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Price
                                        </th>
                                        <th className="hidden px-4 py-3 text-left font-medium md:table-cell">
                                            Quantity
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
                                    {products.data.map((product) => (
                                        <tr key={product.id}>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                                                        {product.photo_url ? (
                                                            <img
                                                                src={
                                                                    product.photo_url
                                                                }
                                                                alt={
                                                                    product.name
                                                                }
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">
                                                                No photo
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="truncate font-medium">
                                                            {product.name}
                                                        </div>
                                                        <div className="truncate text-xs text-muted-foreground">
                                                            {product.brand ??
                                                                product.slug}
                                                        </div>
                                                        {product.product_code && (
                                                            <div className="mt-1 inline-flex rounded-md border px-2 py-0.5 font-mono text-xs font-bold">
                                                                {
                                                                    product.product_code
                                                                }
                                                            </div>
                                                        )}
                                                        {product.is_flash_sale && (
                                                            <div className="mt-1 inline-flex rounded-md bg-[#fff1ea] px-2 py-0.5 text-xs font-bold text-[#e85d4f]">
                                                                Flash sale
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="hidden px-4 py-3 lg:table-cell">
                                                {product.category.name}
                                            </td>
                                            <td className="px-4 py-3">
                                                {product.original_price ? (
                                                    <div className="text-xs text-muted-foreground line-through">
                                                        KSh{' '}
                                                        {product.original_price}
                                                    </div>
                                                ) : null}
                                                <div className="font-medium">
                                                    KSh {product.price}
                                                </div>
                                                {product.flash_sale_price ? (
                                                    <div className="text-xs font-semibold text-[#e85d4f]">
                                                        Flash KSh{' '}
                                                        {
                                                            product.flash_sale_price
                                                        }
                                                    </div>
                                                ) : null}
                                                {product.discount_percentage ? (
                                                    <div className="text-xs font-semibold text-[#e85d4f]">
                                                        -
                                                        {
                                                            product.discount_percentage
                                                        }
                                                        % offer
                                                    </div>
                                                ) : null}
                                            </td>
                                            <td className="hidden px-4 py-3 md:table-cell">
                                                <div>
                                                    {product.stock_quantity}
                                                </div>
                                                {product.sizes &&
                                                    product.sizes.length >
                                                        0 && (
                                                        <div className="mt-1 text-xs text-muted-foreground">
                                                            {product.sizes
                                                                .map((size) =>
                                                                    [
                                                                        size,
                                                                        product
                                                                            .size_quantities?.[
                                                                            size
                                                                        ] !==
                                                                        undefined
                                                                            ? `${product.size_quantities[size]} pcs`
                                                                            : null,
                                                                        product
                                                                            .size_prices?.[
                                                                            size
                                                                        ]
                                                                            ? `KSh ${product.size_prices[size]}`
                                                                            : null,
                                                                        product
                                                                            .flash_sale_size_quantities?.[
                                                                            size
                                                                        ]
                                                                            ? `flash: ${product.flash_sale_size_quantities[size]}`
                                                                            : null,
                                                                    ]
                                                                        .filter(
                                                                            Boolean,
                                                                        )
                                                                        .join(
                                                                            ' - ',
                                                                        ),
                                                                )
                                                                .join(', ')}
                                                        </div>
                                                    )}
                                                {product.colors &&
                                                    product.colors.length >
                                                        0 && (
                                                        <div className="mt-1 text-xs text-muted-foreground">
                                                            {product.colors.join(
                                                                ', ',
                                                            )}
                                                        </div>
                                                    )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="rounded-md border px-2 py-1 text-xs">
                                                    {product.is_active
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
                                                            href={`/admin/products/${product.id}/edit`}
                                                            aria-label={`Edit ${product.name}`}
                                                        >
                                                            <Edit className="size-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() =>
                                                            setProductToDelete(
                                                                product,
                                                            )
                                                        }
                                                        aria-label={`Delete ${product.name}`}
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {products.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-4 py-8 text-center text-muted-foreground"
                                            >
                                                No products yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <AdminPagination pagination={products} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ProductIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Products', href: '/admin/products' },
    ],
};

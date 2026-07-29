import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, X } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Category = {
    id: number;
    name: string;
};

type ProductVariant = {
    size: string;
    color: string;
    original_price: string;
    price: string;
    flash_sale_price: string;
    quantity: string;
    flash_sale_quantity: string;
    photos: File[];
};

export default function ProductCreate({
    categories,
}: {
    categories: Category[];
}) {
    const { data, setData, post, processing, errors } = useForm({
        product_category_id: categories[0]?.id.toString() ?? '',
        name: '',
        slug: '',
        description: '',
        brand: '',
        original_price: '',
        price: '',
        flash_sale_price: '',
        stock_quantity: '0',
        variants: [
            {
                size: '',
                color: '',
                original_price: '',
                price: '',
                flash_sale_price: '',
                quantity: '',
                flash_sale_quantity: '',
                photos: [],
            },
        ] as ProductVariant[],
        photos: [] as File[],
        is_active: true,
        is_flash_sale: false,
        flash_sale_ends_at: '',
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post('/admin/products', { forceFormData: true });
    }

    function updateVariant(
        index: number,
        field: keyof ProductVariant,
        value: string,
    ) {
        setData(
            'variants',
            data.variants.map((variant, variantIndex) =>
                variantIndex === index
                    ? { ...variant, [field]: value }
                    : variant,
            ),
        );
    }

    function addVariant() {
        setData('variants', [
            ...data.variants,
            {
                size: '',
                color: '',
                original_price: '',
                price: '',
                flash_sale_price: '',
                quantity: '',
                flash_sale_quantity: '',
                photos: [],
            },
        ]);
    }

    function removeVariant(index: number) {
        setData(
            'variants',
            data.variants.length > 1
                ? data.variants.filter(
                      (_, variantIndex) => variantIndex !== index,
                  )
                : [
                      {
                          size: '',
                          color: '',
                          original_price: '',
                          price: '',
                          flash_sale_price: '',
                          quantity: '',
                          flash_sale_quantity: '',
                          photos: [],
                      },
                  ],
        );
    }

    function updateVariantPhotos(index: number, files: File[]) {
        setData(
            'variants',
            data.variants.map((variant, variantIndex) =>
                variantIndex === index
                    ? { ...variant, photos: files }
                    : variant,
            ),
        );
    }

    return (
        <>
            <Head title="New product" />
            <div className="max-w-4xl space-y-6 p-4 md:p-6">
                <Button asChild variant="ghost" className="px-0">
                    <Link href="/admin/products">
                        <ArrowLeft className="size-4" />
                        Back to products
                    </Link>
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle>Create product</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-5">
                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(event) =>
                                            setData('name', event.target.value)
                                        }
                                        placeholder="Signature Eau de Parfum 100ml"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <select
                                        id="category"
                                        value={data.product_category_id}
                                        onChange={(event) =>
                                            setData(
                                                'product_category_id',
                                                event.target.value,
                                            )
                                        }
                                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    >
                                        {categories.map((category) => (
                                            <option
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError
                                        message={errors.product_category_id}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input
                                        id="slug"
                                        value={data.slug}
                                        onChange={(event) =>
                                            setData('slug', event.target.value)
                                        }
                                        placeholder="Auto-generated if left blank"
                                    />
                                    <InputError message={errors.slug} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="brand">Brand</Label>
                                    <Input
                                        id="brand"
                                        value={data.brand}
                                        onChange={(event) =>
                                            setData('brand', event.target.value)
                                        }
                                        placeholder="Scented Muse"
                                    />
                                    <InputError message={errors.brand} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(event) =>
                                        setData(
                                            'description',
                                            event.target.value,
                                        )
                                    }
                                    className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="Describe the materials, comfort, fit, sizing, or care details."
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="space-y-3 rounded-md border p-3">
                                <div>
                                    <Label>Base pricing</Label>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Used when a size/color row below
                                        doesn't set its own price. Required if
                                        you don't add any size/color pricing.
                                    </p>
                                </div>
                                <div className="grid gap-3 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Price</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={data.price}
                                            onChange={(event) =>
                                                setData(
                                                    'price',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <InputError message={errors.price} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="original_price">
                                            Original price
                                        </Label>
                                        <Input
                                            id="original_price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={data.original_price}
                                            onChange={(event) =>
                                                setData(
                                                    'original_price',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={errors.original_price}
                                        />
                                    </div>
                                    {data.is_flash_sale && (
                                        <div className="space-y-2">
                                            <Label htmlFor="flash_sale_price">
                                                Flash sale price
                                            </Label>
                                            <Input
                                                id="flash_sale_price"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={data.flash_sale_price}
                                                onChange={(event) =>
                                                    setData(
                                                        'flash_sale_price',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    errors.flash_sale_price
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <Label>Available sizes and colors</Label>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Add each available combination. The same
                                        size can have different colors and
                                        prices, and different sizes can share
                                        the same price.
                                    </p>
                                </div>
                                <div className="grid gap-3">
                                    {data.variants.map((variant, index) => (
                                        <div
                                            key={index}
                                            className="grid gap-2 rounded-md border p-3 md:grid-cols-[1fr_1fr_130px_130px_120px_120px_auto]"
                                        >
                                            <Input
                                                value={variant.size}
                                                onChange={(event) =>
                                                    updateVariant(
                                                        index,
                                                        'size',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Size"
                                            />
                                            <Input
                                                value={variant.color}
                                                onChange={(event) =>
                                                    updateVariant(
                                                        index,
                                                        'color',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Color"
                                            />
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={variant.original_price}
                                                onChange={(event) =>
                                                    updateVariant(
                                                        index,
                                                        'original_price',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Original price"
                                            />
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={variant.price}
                                                onChange={(event) =>
                                                    updateVariant(
                                                        index,
                                                        'price',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Selling price"
                                            />
                                            <div className="flex h-9 items-center rounded-md border border-input bg-muted/40 px-3 text-xs font-semibold text-muted-foreground">
                                                {calculateDiscount(
                                                    variant.original_price,
                                                    variant.price,
                                                ) > 0
                                                    ? `${calculateDiscount(
                                                          variant.original_price,
                                                          variant.price,
                                                      )}% off`
                                                    : 'No discount'}
                                            </div>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={variant.quantity}
                                                onChange={(event) =>
                                                    updateVariant(
                                                        index,
                                                        'quantity',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Qty"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() =>
                                                    removeVariant(index)
                                                }
                                                aria-label={`Remove variant ${index + 1}`}
                                            >
                                                <X className="size-4" />
                                            </Button>
                                            <div className="md:col-span-7">
                                                <Label className="text-xs">
                                                    Photos for this size/color
                                                </Label>
                                                <Input
                                                    id={`variant-photos-${index}`}
                                                    className="sr-only"
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={(event) =>
                                                        updateVariantPhotos(
                                                            index,
                                                            Array.from(
                                                                event.target
                                                                    .files ??
                                                                    [],
                                                            ),
                                                        )
                                                    }
                                                />
                                                <Label
                                                    htmlFor={`variant-photos-${index}`}
                                                    className="mt-1 inline-flex h-9 cursor-pointer items-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-xs transition hover:bg-accent hover:text-accent-foreground"
                                                >
                                                    Choose images
                                                </Label>
                                            </div>
                                            {data.is_flash_sale && (
                                                <div className="grid gap-3 md:col-span-7 md:grid-cols-2">
                                                    <label className="space-y-1">
                                                        <span className="text-xs font-medium">
                                                            Flash sale amount
                                                        </span>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={
                                                                variant.flash_sale_price
                                                            }
                                                            onChange={(event) =>
                                                                updateVariant(
                                                                    index,
                                                                    'flash_sale_price',
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Variant flash price"
                                                        />
                                                    </label>
                                                    <label className="space-y-1">
                                                        <span className="text-xs font-medium">
                                                            Flash sale quantity
                                                        </span>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max={
                                                                variant.quantity ||
                                                                undefined
                                                            }
                                                            value={
                                                                variant.flash_sale_quantity
                                                            }
                                                            onChange={(event) =>
                                                                updateVariant(
                                                                    index,
                                                                    'flash_sale_quantity',
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Flash sale qty"
                                                        />
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addVariant}
                                >
                                    <Plus className="size-4" />
                                    Add size/color
                                </Button>
                                <InputError message={errors.variants} />
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="stock_quantity">
                                        Fallback quantity
                                    </Label>
                                    <Input
                                        id="stock_quantity"
                                        type="number"
                                        min="0"
                                        value={data.stock_quantity}
                                        onChange={(event) =>
                                            setData(
                                                'stock_quantity',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.stock_quantity}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Used only when no size quantities are
                                        added.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="photos">
                                        Product images
                                    </Label>
                                    <Input
                                        id="photos"
                                        className="sr-only"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(event) =>
                                            setData(
                                                'photos',
                                                Array.from(
                                                    event.target.files ?? [],
                                                ),
                                            )
                                        }
                                    />
                                    <Label
                                        htmlFor="photos"
                                        className="inline-flex h-9 cursor-pointer items-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-xs transition hover:bg-accent hover:text-accent-foreground"
                                    >
                                        Choose images
                                    </Label>
                                    <InputError message={errors.photos} />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-5">
                                <label className="flex items-center gap-3 text-sm font-medium">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(event) =>
                                            setData(
                                                'is_active',
                                                event.target.checked,
                                            )
                                        }
                                    />
                                    Active in catalog
                                </label>

                                <label className="flex items-center gap-3 text-sm font-medium">
                                    <input
                                        type="checkbox"
                                        checked={data.is_flash_sale}
                                        onChange={(event) =>
                                            setData(
                                                'is_flash_sale',
                                                event.target.checked,
                                            )
                                        }
                                    />
                                    Put under flash sale
                                </label>
                            </div>
                            {data.is_flash_sale && (
                                <div className="space-y-4 rounded-md border border-dashed p-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="flash_sale_ends_at">
                                            Flash sale ends at
                                        </Label>
                                        <Input
                                            id="flash_sale_ends_at"
                                            type="datetime-local"
                                            value={data.flash_sale_ends_at}
                                            onChange={(event) =>
                                                setData(
                                                    'flash_sale_ends_at',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={errors.flash_sale_ends_at}
                                        />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Set each flash-sale amount and quantity
                                        inside the size/color rows above.
                                    </p>
                                </div>
                            )}

                            <Button disabled={processing}>
                                Create product
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ProductCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Products', href: '/admin/products' },
        { title: 'Create', href: '/admin/products/create' },
    ],
};

function calculateDiscount(originalPrice: string, sellingPrice: string) {
    const original = Number(originalPrice);
    const selling = Number(sellingPrice);

    if (!original || !selling || original <= selling) {
        return 0;
    }

    return Math.round(((original - selling) / original) * 100);
}

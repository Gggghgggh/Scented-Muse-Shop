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

const FRAGRANCE_TYPES = ['EDP', 'EDT', 'Perfume', 'Pour Homme', 'Arabic'];

type Product = {
    id: number;
    product_code: string | null;
    product_category_id: number;
    name: string;
    slug: string;
    description: string;
    brand: string | null;
    fragrance_type: string | null;
    price: string;
    original_price: string | null;
    discount_percentage: number | null;
    flash_sale_price: string | null;
    stock_quantity: number;
    weight_kg: string | number;
    sizes: string[] | null;
    colors: string[] | null;
    variants:
        | {
              size: string;
              color: string | null;
              original_price?: string | number | null;
              price: string | number;
              flash_sale_price?: string | number | null;
              quantity: string | number;
              flash_sale_quantity: string | number;
              photo_paths?: string[];
              photo_urls?: string[];
          }[]
        | null;
    size_prices: Record<string, string | number> | null;
    size_quantities: Record<string, string | number> | null;
    flash_sale_size_quantities: Record<string, string | number> | null;
    photo_url: string | null;
    photo_urls: string[];
    is_active: boolean;
    is_flash_sale: boolean;
    flash_sale_ends_at: string | null;
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
    photo_paths?: string[];
    photo_urls?: string[];
};

export default function ProductEdit({
    product,
    categories,
}: {
    product: Product;
    categories: Category[];
}) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        product_category_id: product.product_category_id.toString(),
        name: product.name,
        slug: product.slug,
        description: product.description,
        brand: product.brand ?? '',
        fragrance_type: product.fragrance_type ?? '',
        original_price: product.original_price ?? '',
        price: product.price,
        flash_sale_price: product.flash_sale_price ?? '',
        stock_quantity: product.stock_quantity.toString(),
        weight_kg: String(product.weight_kg ?? 1),
        variants:
            product.variants && product.variants.length > 0
                ? product.variants.map((variant) => ({
                      size: variant.size ?? '',
                      color: variant.color ?? '',
                      original_price: String(
                          variant.original_price ??
                              product.original_price ??
                              '',
                      ),
                      price: String(variant.price ?? product.price),
                      flash_sale_price: String(
                          variant.flash_sale_price ??
                              product.flash_sale_price ??
                              '',
                      ),
                      quantity: String(variant.quantity ?? ''),
                      flash_sale_quantity: String(
                          variant.flash_sale_quantity ?? '',
                      ),
                      photos: [],
                      photo_paths: variant.photo_paths ?? [],
                      photo_urls: variant.photo_urls ?? [],
                  }))
                : ([
                      {
                          size: '',
                          color: '',
                          original_price: String(product.original_price ?? ''),
                          price: '',
                          flash_sale_price: '',
                          quantity: '',
                          flash_sale_quantity: '',
                          photos: [],
                          photo_paths: [],
                          photo_urls: [],
                      },
                  ] as ProductVariant[]),
        photos: [] as File[],
        is_active: product.is_active,
        is_flash_sale: product.is_flash_sale,
        flash_sale_ends_at: product.flash_sale_ends_at
            ? product.flash_sale_ends_at.slice(0, 16)
            : '',
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post(`/admin/products/${product.id}`, { forceFormData: true });
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
                photo_paths: [],
                photo_urls: [],
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
                          photo_paths: [],
                          photo_urls: [],
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
            <Head title={`Edit ${product.name}`} />
            <div className="max-w-4xl space-y-6 p-4 md:p-6">
                <Button asChild variant="ghost" className="px-0">
                    <Link href="/admin/products">
                        <ArrowLeft className="size-4" />
                        Back to products
                    </Link>
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle>Edit product</CardTitle>
                        {product.product_code && (
                            <p className="font-mono text-sm font-bold text-muted-foreground">
                                Product code: {product.product_code}
                            </p>
                        )}
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-5">
                            {product.photo_urls.length > 0 && (
                                <div className="rounded-md border p-3">
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        {product.photo_urls.map(
                                            (photoUrl, index) => (
                                                <img
                                                    key={photoUrl}
                                                    src={photoUrl}
                                                    alt={`${product.name} image ${index + 1}`}
                                                    className="h-24 w-full rounded-md object-cover"
                                                />
                                            ),
                                        )}
                                    </div>
                                    <div>
                                        <p className="mt-3 text-sm font-medium">
                                            Current product images
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Upload new images below to replace
                                            the current set. The first image is
                                            used as the product thumbnail.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(event) =>
                                            setData('name', event.target.value)
                                        }
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
                                    />
                                    <InputError message={errors.brand} />
                                </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="fragrance_type">
                                        Fragrance type
                                    </Label>
                                    <select
                                        id="fragrance_type"
                                        value={data.fragrance_type}
                                        onChange={(event) =>
                                            setData(
                                                'fragrance_type',
                                                event.target.value,
                                            )
                                        }
                                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    >
                                        <option value="">
                                            Not applicable
                                        </option>
                                        {FRAGRANCE_TYPES.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError
                                        message={errors.fragrance_type}
                                    />
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
                                                {variant.photo_urls &&
                                                    variant.photo_urls.length >
                                                        0 && (
                                                        <div className="mt-2 flex gap-2 overflow-x-auto">
                                                            {variant.photo_urls.map(
                                                                (photoUrl) => (
                                                                    <img
                                                                        key={
                                                                            photoUrl
                                                                        }
                                                                        src={
                                                                            photoUrl
                                                                        }
                                                                        alt=""
                                                                        className="size-16 rounded-md border object-cover"
                                                                    />
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
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
                                                    className="mt-2 inline-flex h-9 cursor-pointer items-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-xs transition hover:bg-accent hover:text-accent-foreground"
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
                                    <Label htmlFor="weight_kg">
                                        Product weight (kg)
                                    </Label>
                                    <Input
                                        id="weight_kg"
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={data.weight_kg}
                                        onChange={(event) =>
                                            setData(
                                                'weight_kg',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError message={errors.weight_kg} />
                                    <p className="text-xs text-muted-foreground">
                                        Used to calculate delivery fees at
                                        checkout.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="photos">
                                        Replace images
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

                            <Button disabled={processing}>Save changes</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ProductEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Products', href: '/admin/products' },
        { title: 'Edit', href: '#' },
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

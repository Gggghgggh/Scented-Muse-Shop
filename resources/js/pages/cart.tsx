import { Head, Link, router, usePage } from '@inertiajs/react';
import { CheckCircle, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CustomerNavbar } from '@/components/customer-navbar';
import { kenyaLocations } from '@/lib/kenya-locations';
import { getCartItems  } from '@/lib/shop-storage';
import type {StoredCartItem} from '@/lib/shop-storage';
import { login, register } from '@/routes';

type DeliveryRate = {
    county: string;
    town: string;
    fee_0_1kg: string | number;
    fee_1_3kg: string | number;
    fee_3_5kg: string | number;
    fee_over_5kg: string | number;
};

const formatPrice = (price: string | number) =>
    new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        maximumFractionDigits: 0,
    })
        .format(Number(price))
        .replace('KES', 'KSh');

export default function CartPage({
    deliveryRates = [],
}: {
    deliveryRates?: DeliveryRate[];
}) {
    const { auth } = usePage().props;
    const [items, setItems] = useState<StoredCartItem[]>(() => getCartItems());
    const countyNames = Object.keys(kenyaLocations);
    const [county, setCounty] = useState('Nairobi');
    const [town, setTown] = useState(kenyaLocations.Nairobi[0]);
    const [phone, setPhone] = useState('');
    const paymentMethod = 'mpesa';
    const [processing, setProcessing] = useState(false);
    const [placed, setPlaced] = useState(false);
    const [notice, setNotice] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);
    const towns = kenyaLocations[county] ?? [];
    const total = useMemo(
        () =>
            items.reduce(
                (sum, item) => sum + Number(item.price) * (item.quantity ?? 1),
                0,
            ),
        [items],
    );
    const totalWeightKg = useMemo(
        () =>
            items.reduce(
                (sum, item) =>
                    sum + Number(item.weight_kg ?? 1) * (item.quantity ?? 1),
                0,
            ),
        [items],
    );
    const deliveryFee = useMemo(
        () =>
            items.length > 0
                ? getDeliveryFee(deliveryRates, county, town, totalWeightKg)
                : 0,
        [county, deliveryRates, items.length, totalWeightKg, town],
    );
    const grandTotal = total + deliveryFee;

    function persistCart(nextItems: StoredCartItem[]) {
        localStorage.setItem('hod_cart', JSON.stringify(nextItems));
        setItems(nextItems);
        window.dispatchEvent(new Event('hod-cart-updated'));
    }

    function clearCart() {
        localStorage.removeItem('hod_cart');
        setItems([]);
        window.dispatchEvent(new Event('hod-cart-updated'));
    }

    function updateItem(index: number, updates: Partial<StoredCartItem>) {
        persistCart(
            items.map((item, itemIndex) =>
                itemIndex === index ? { ...item, ...updates } : item,
            ),
        );
    }

    function updateQuantity(index: number, quantity: number) {
        updateItem(index, {
            quantity: Math.min(
                getItemMaxQuantity(items[index]),
                Math.max(1, quantity),
            ),
        });
    }

    function updateSize(index: number, size: string) {
        const item = items[index];
        const sizeColors = getItemColorsForSize(item, size);
        const nextColor = sizeColors.includes(item.color ?? '')
            ? (item.color ?? '')
            : (sizeColors[0] ?? '');
        const nextPrice = getItemVariantPrice(item, size, nextColor);

        updateItem(index, {
            size,
            color: nextColor,
            price: nextPrice,
            quantity: Math.min(
                item.quantity ?? 1,
                getItemMaxQuantity({ ...item, size, color: nextColor }),
            ),
        });
    }

    function updateColor(index: number, color: string) {
        const item = items[index];

        updateItem(index, {
            color,
            price: getItemVariantPrice(item, item.size ?? '', color),
            quantity: Math.min(
                item.quantity ?? 1,
                getItemMaxQuantity({ ...item, color }),
            ),
        });
    }

    function removeItem(index: number) {
        persistCart(items.filter((_, itemIndex) => itemIndex !== index));
        showNotice('success', 'Product removed from cart.');
    }

    function placeOrder() {
        if (items.length === 0) {
            showNotice('error', 'Your cart is empty.');

            return;
        }

        if (!phone.trim()) {
            showNotice('error', 'Enter your phone number before checkout.');

            return;
        }

        const invalidItem = items.find(
            (item) =>
                getItemMaxQuantity(item) <= 0 ||
                (item.quantity ?? 1) > getItemMaxQuantity(item),
        );

        if (invalidItem) {
            showNotice(
                'error',
                getItemMaxQuantity(invalidItem) <= 0
                    ? `${invalidItem.name} is currently out of stock.`
                    : `${invalidItem.name} has less stock than the quantity selected.`,
            );

            return;
        }

        setProcessing(true);
        router.post(
            '/checkout',
            {
                county,
                town,
                customer_phone: phone,
                payment_method: paymentMethod,
                items: items.map((item) => ({
                    id: item.id,
                    size: item.size ?? '',
                    color: item.color ?? '',
                    quantity: Math.min(
                        item.quantity ?? 1,
                        getItemMaxQuantity(item),
                    ),
                })),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setPlaced(true);
                    clearCart();
                    showNotice('success', 'Check your phone for the M-Pesa prompt.');
                },
                onError: (errors) => {
                    showNotice(
                        'error',
                        Object.values(errors)[0] ??
                            'Unable to place the order. Please check your cart.',
                    );
                },
                onFinish: () => setProcessing(false),
            },
        );
    }

    function showNotice(type: 'success' | 'error', message: string) {
        setNotice({ type, message });
        window.setTimeout(() => setNotice(null), 2400);
    }

    return (
        <>
            <Head title="Cart | Scented Muse" />
            <main className="min-h-screen bg-[#fff7f2] text-[#17131f]">
                <CustomerNavbar />
                {notice && <FeedbackModal {...notice} />}
                <section className="mx-auto mt-4 max-w-5xl rounded-md bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                        <h1 className="flex items-center gap-3 text-2xl font-black text-[#3b2147]">
                            <ShoppingCart className="size-7" />
                            Cart
                        </h1>
                        <Link
                            href="/"
                            className="font-black text-[#e85d4f] hover:text-[#3b2147]"
                        >
                            Continue shopping
                        </Link>
                    </div>

                    {placed && (
                        <div className="mt-5 flex items-center gap-3 rounded-md bg-[#fff1ea] p-4 font-bold text-[#3b2147]">
                            <CheckCircle className="size-6 text-[#e85d4f]" />
                            Order placed for {town}, {county}. You can download
                            the receipt under My Orders.
                        </div>
                    )}

                    <div className="mt-6 grid gap-5">
                        <div className="space-y-3">
                            {items.length > 0 ? (
                                items.map((item, index) => (
                                    <article
                                        key={`${item.slug}-${item.size}-${item.color}-${index}`}
                                        className="grid gap-4 rounded-md border border-[#ead9d1] p-3 md:grid-cols-[96px_minmax(0,1fr)_auto]"
                                    >
                                        {item.photo_url ? (
                                            <img
                                                src={item.photo_url}
                                                alt={item.name}
                                                className="size-24 object-contain"
                                            />
                                        ) : (
                                            <span className="flex size-24 items-center justify-center rounded-md bg-[#fff7f2] text-xs text-[#7f5f53]">
                                                No image
                                            </span>
                                        )}
                                        <div className="min-w-0">
                                            <p className="font-black">
                                                {item.name}
                                            </p>
                                            <div className="mt-3 grid gap-3 sm:grid-cols-3">
                                                <label className="grid gap-1 text-sm font-semibold text-[#7f5f53]">
                                                    Size
                                                    <select
                                                        value={item.size ?? ''}
                                                        disabled={
                                                            !item.sizes ||
                                                            item.sizes
                                                                .length === 0
                                                        }
                                                        onChange={(event) =>
                                                            updateSize(
                                                                index,
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        className="h-10 rounded-md border border-[#d7c4bd] bg-white px-3 text-[#17131f] disabled:bg-[#f7f2ef]"
                                                    >
                                                        <option value="">
                                                            Default
                                                        </option>
                                                        {item.sizes?.map(
                                                            (size) => {
                                                                const quantity =
                                                                    getItemSizeQuantity(
                                                                        item,
                                                                        size,
                                                                    );

                                                                return (
                                                                    <option
                                                                        key={
                                                                            size
                                                                        }
                                                                        value={
                                                                            size
                                                                        }
                                                                        disabled={
                                                                            quantity <=
                                                                            0
                                                                        }
                                                                    >
                                                                        {size}
                                                                        {quantity <=
                                                                        0
                                                                            ? ' (out of stock)'
                                                                            : ''}
                                                                    </option>
                                                                );
                                                            },
                                                        )}
                                                    </select>
                                                </label>
                                                <label className="grid gap-1 text-sm font-semibold text-[#7f5f53]">
                                                    Color
                                                    <select
                                                        value={item.color ?? ''}
                                                        disabled={
                                                            getItemColorsForSize(
                                                                item,
                                                                item.size ?? '',
                                                            ).length === 0
                                                        }
                                                        onChange={(event) =>
                                                            updateColor(
                                                                index,
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        className="h-10 rounded-md border border-[#d7c4bd] bg-white px-3 text-[#17131f] disabled:bg-[#f7f2ef]"
                                                    >
                                                        <option value="">
                                                            Default
                                                        </option>
                                                        {getItemColorsForSize(
                                                            item,
                                                            item.size ?? '',
                                                        ).map((color) => (
                                                            <option
                                                                key={color}
                                                                value={color}
                                                            >
                                                                {color}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </label>
                                                <div className="grid gap-1 text-sm font-semibold text-[#7f5f53]">
                                                    Quantity
                                                    <div className="flex h-10 overflow-hidden rounded-md border border-[#d7c4bd] bg-white">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    index,
                                                                    (item.quantity ??
                                                                        1) - 1,
                                                                )
                                                            }
                                                            className="flex w-10 items-center justify-center text-[#3b2147] transition hover:bg-[#fff1ea]"
                                                            aria-label={`Decrease ${item.name} quantity`}
                                                        >
                                                            <Minus className="size-4" />
                                                        </button>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={getItemMaxQuantity(
                                                                item,
                                                            )}
                                                            value={
                                                                item.quantity ??
                                                                1
                                                            }
                                                            onChange={(event) =>
                                                                updateQuantity(
                                                                    index,
                                                                    Number(
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    ) || 1,
                                                                )
                                                            }
                                                            className="w-16 border-x border-[#d7c4bd] text-center outline-none"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    index,
                                                                    (item.quantity ??
                                                                        1) + 1,
                                                                )
                                                            }
                                                            className="flex w-10 items-center justify-center text-[#3b2147] transition hover:bg-[#fff1ea]"
                                                            aria-label={`Increase ${item.name} quantity`}
                                                        >
                                                            <Plus className="size-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
                                            <div className="text-right">
                                                <p className="font-black text-[#3b2147]">
                                                    {formatPrice(
                                                        Number(item.price) *
                                                            (item.quantity ??
                                                                1),
                                                    )}
                                                </p>
                                                <p className="text-xs text-[#7f5f53]">
                                                    {formatPrice(item.price)}{' '}
                                                    each
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeItem(index)
                                                }
                                                className="inline-flex h-10 items-center gap-2 rounded-md border border-[#f1b5ad] px-3 text-sm font-black text-[#d71920] transition hover:bg-[#d71920] hover:text-white"
                                            >
                                                <Trash2 className="size-4" />
                                                Remove
                                            </button>
                                        </div>
                                    </article>
                                ))
                            ) : (
                                <div className="rounded-md bg-[#fff7f2] p-8 text-center text-[#7f5f53]">
                                    Your cart is empty.
                                </div>
                            )}
                        </div>

                        <section className="rounded-md border border-[#ead9d1] p-4">
                            <h2 className="text-xl font-black">Checkout</h2>
                            <p className="mt-2 text-2xl font-black text-[#3b2147]">
                                {formatPrice(grandTotal)}
                            </p>
                            {!auth.user ? (
                                <div className="mt-5 space-y-3">
                                    <p className="text-sm text-[#7f5f53]">
                                        Log in or create an account to checkout.
                                    </p>
                                    <Link
                                        href={login()}
                                        className="flex h-11 items-center justify-center rounded-md bg-[#e85d4f] font-black text-white"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="flex h-11 items-center justify-center rounded-md border border-[#ead9d1] font-black text-[#3b2147]"
                                    >
                                        Create account
                                    </Link>
                                </div>
                            ) : (
                                <div className="mt-5 space-y-4">
                                    <select
                                        value={county}
                                        onChange={(event) => {
                                            const nextCounty =
                                                event.target.value;
                                            setCounty(nextCounty);
                                            setTown(
                                                kenyaLocations[
                                                    nextCounty
                                                ]?.[0] ?? '',
                                            );
                                        }}
                                        className="h-12 w-full rounded-md border border-[#d7c4bd] px-3"
                                    >
                                        {countyNames.map((name) => (
                                            <option key={name}>{name}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={town}
                                        onChange={(event) =>
                                            setTown(event.target.value)
                                        }
                                        className="h-12 w-full rounded-md border border-[#d7c4bd] px-3"
                                    >
                                        {towns.map((name) => (
                                            <option key={name}>{name}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(event) =>
                                            setPhone(event.target.value)
                                        }
                                        placeholder="M-Pesa phone number"
                                        className="h-12 w-full rounded-md border border-[#d7c4bd] px-3"
                                    />
                                    <div className="rounded-md bg-[#fff7f2] p-3 text-sm text-[#7f5f53]">
                                        <p>Items: {formatPrice(total)}</p>
                                        <p>
                                            Delivery fee:{' '}
                                            {formatPrice(deliveryFee)}
                                        </p>
                                        <p>
                                            Weight:{' '}
                                            {totalWeightKg.toFixed(2)} kg
                                        </p>
                                        <p className="mt-1 font-black text-[#3b2147]">
                                            Total: {formatPrice(grandTotal)}
                                        </p>
                                        <p className="mt-2 font-semibold text-[#3b2147]">
                                            Payment: Lipa na M-Pesa STK prompt
                                        </p>
                                    </div>
                                    <button
                                        disabled={
                                            items.length === 0 || processing
                                        }
                                        onClick={placeOrder}
                                        className="h-12 w-full rounded-md bg-[#e85d4f] font-black text-white disabled:opacity-50"
                                    >
                                        {processing
                                            ? 'Sending M-Pesa prompt...'
                                            : 'Pay with M-Pesa'}
                                    </button>
                                </div>
                            )}
                        </section>
                    </div>
                </section>
            </main>
        </>
    );
}

function getDeliveryFee(
    rates: DeliveryRate[],
    county: string,
    town: string,
    totalWeightKg: number,
) {
    const rate = rates.find(
        (item) => item.county === county && item.town === town,
    );

    if (!rate) {
        return 200;
    }

    if (totalWeightKg <= 1) {
        return Number(rate.fee_0_1kg);
    }

    if (totalWeightKg <= 3) {
        return Number(rate.fee_1_3kg);
    }

    if (totalWeightKg <= 5) {
        return Number(rate.fee_3_5kg);
    }

    return Number(rate.fee_over_5kg);
}

function getItemSizeQuantity(item: StoredCartItem, size?: string) {
    const matchingVariant = item.variants?.find(
        (variant) =>
            variant.size === size &&
            (variant.color ?? '') === (item.color ?? ''),
    );

    if (matchingVariant) {
        return Number(matchingVariant.quantity) || 0;
    }

    if (size && item.size_quantities?.[size] !== undefined) {
        return Number(item.size_quantities[size]) || 0;
    }

    return Number(item.stock_quantity ?? 99) || 99;
}

function getItemMaxQuantity(item: StoredCartItem) {
    return Math.max(0, getItemSizeQuantity(item, item.size));
}

function getItemColorsForSize(item: StoredCartItem, size: string) {
    if (item.variants && item.variants.length > 0) {
        return item.variants
            .filter((variant) => variant.size === size)
            .map((variant) => variant.color ?? '')
            .filter((color, index, colors) => colors.indexOf(color) === index);
    }

    return item.colors ?? [];
}

function getItemVariantPrice(
    item: StoredCartItem,
    size: string,
    color: string,
) {
    const matchingVariant = item.variants?.find(
        (variant) =>
            variant.size === size && (variant.color ?? '') === (color ?? ''),
    );

    if (matchingVariant) {
        return item.is_flash_sale_active &&
            Number(matchingVariant.flash_sale_quantity ?? 0) > 0
            ? (matchingVariant.flash_sale_price ??
                  item.flash_sale_price ??
                  matchingVariant.price)
            : matchingVariant.price;
    }

    const regularPrice =
        size && item.size_prices?.[size]
            ? item.size_prices[size]
            : (item.base_price ?? item.price);

    return item.is_flash_sale_active && item.flash_sale_price
        ? item.flash_sale_price
        : regularPrice;
}

function FeedbackModal({
    type,
    message,
}: {
    type: 'success' | 'error';
    message: string;
}) {
    return (
        <div className="fixed top-8 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-md bg-white p-4 text-center shadow-2xl ring-1 ring-[#ead9d1]">
            <p
                className={`font-black ${
                    type === 'success' ? 'text-[#3b2147]' : 'text-[#d71920]'
                }`}
            >
                {type === 'success' ? 'Success' : 'Unable to continue'}
            </p>
            <p className="mt-1 text-sm text-[#7f5f53]">{message}</p>
        </div>
    );
}

import { Head, Link } from '@inertiajs/react';
import { CreditCard, Tags } from 'lucide-react';
import { CustomerNavbar } from '@/components/customer-navbar';

type Product = {
    id: number;
    name: string;
    slug: string;
    price: string | number;
    original_price?: string | number | null;
    discount_percentage?: number | null;
    weight_kg?: string | number;
    photo_url?: string | null;
};

const formatPrice = (price: string | number) =>
    new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        maximumFractionDigits: 0,
    })
        .format(Number(price))
        .replace('KES', 'KSh');

const truncate = (text: string, length = 36) =>
    text.length > length ? `${text.slice(0, length - 3)}...` : text;

const getOriginalPrice = (product: Product) => {
    const originalPrice = Number(product.original_price ?? 0);

    return originalPrice > Number(product.price) ? originalPrice : null;
};

export default function FlashSalePage({
    products = [],
}: {
    products: Product[];
}) {
    return (
        <>
            <Head title="Flash Sale | Scented Muse" />
            <main className="min-h-screen bg-[#fff7f2] text-[#17131f]">
                <CustomerNavbar />
                <section className="mx-auto max-w-[1540px] px-3 py-5 sm:px-4 lg:px-8">
                    <div className="rounded-md bg-white p-4 shadow-sm ring-1 ring-[#ead9d1] sm:p-6">
                        <div className="flex items-center justify-between gap-4">
                            <h1 className="text-2xl font-black text-[#3b2147]">
                                Flash Sale
                            </h1>
                            <Link
                                href="/"
                                className="font-black text-[#e85d4f]"
                            >
                                Back to shop
                            </Link>
                        </div>

                        {products.length > 0 ? (
                            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                                {products.map((product) => (
                                    <Link
                                        key={product.slug}
                                        href={`/products/${product.slug}`}
                                        className="group relative rounded-md bg-white p-2 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-1 hover:shadow-[#3b2147]/15 hover:ring-[#e85d4f]"
                                    >
                                        {product.discount_percentage ? (
                                            <span className="absolute top-2 right-2 z-10 rounded-sm bg-[#fff1ea] px-1.5 py-0.5 text-[10px] font-black text-[#e85d4f]">
                                                -{product.discount_percentage}%
                                            </span>
                                        ) : null}
                                        {product.photo_url ? (
                                            <img
                                                src={product.photo_url}
                                                alt={product.name}
                                                className="mx-auto h-24 w-full object-contain transition duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <span className="flex h-24 w-full items-center justify-center rounded-md bg-[#fff7f2] text-xs text-[#7f5f53]">
                                                No image
                                            </span>
                                        )}
                                        <p className="mt-2 min-h-8 text-[11px] leading-4 text-[#252b36]">
                                            {truncate(product.name)}
                                        </p>
                                        <p className="mt-1 text-xs font-black text-[#3b2147]">
                                            <CreditCard className="mr-1 inline size-3" />
                                            {formatPrice(product.price)}
                                        </p>
                                        {getOriginalPrice(product) ? (
                                            <p className="mt-0.5 text-[11px] text-[#7f5f53] line-through">
                                                <Tags className="mr-1 inline size-3" />
                                                {formatPrice(
                                                    getOriginalPrice(product) ??
                                                        0,
                                                )}
                                            </p>
                                        ) : null}
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-6 rounded-md bg-[#fff7f2] p-8 text-center font-semibold text-[#7f5f53]">
                                There are no current deals at the moment.
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </>
    );
}

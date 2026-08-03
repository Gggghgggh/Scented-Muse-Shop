import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    BadgeCheck,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    CreditCard,
    Heart,
    MessageSquare,
    PackageCheck,
    RotateCcw,
    Shield,
    ShoppingCart,
    Star,
    Store,
    Tags,
    Truck,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { CustomerNavbar } from '@/components/customer-navbar';

type Product = {
    id: number;
    product_code?: string | null;
    name: string;
    slug: string;
    description?: string | null;
    brand?: string | null;
    fragrance_type?: string | null;
    price: string | number;
    base_price?: string | number;
    flash_sale_price?: string | number | null;
    original_price?: string | number | null;
    discount_percentage?: number | null;
    stock_quantity: number;
    sizes?: string[] | null;
    size_prices?: Record<string, string | number> | null;
    size_quantities?: Record<string, string | number> | null;
    flash_sale_size_quantities?: Record<string, string | number> | null;
    colors?: string[] | null;
    variants?:
        | {
              size: string;
              color?: string | null;
              original_price?: string | number | null;
              price: string | number;
              discount_percentage?: number | null;
              flash_sale_price?: string | number | null;
              quantity: string | number;
              flash_sale_quantity?: string | number;
              photo_urls?: string[];
          }[]
        | null;
    photo_url?: string | null;
    photo_urls?: string[];
    is_flash_sale?: boolean;
    is_flash_sale_active?: boolean;
    category?: {
        id: number;
        name: string;
        slug: string;
    } | null;
};

type ProductShowProps = {
    product: Product;
    relatedProducts?: Product[];
    reviews?: Review[];
    ratingSummary?: RatingSummary | null;
};

type Review = {
    id: number;
    rating: number;
    title: string;
    body: string;
    is_verified_purchase: boolean;
    created_at: string;
    user?: {
        id: number;
        name: string;
    } | null;
};

type RatingSummary = {
    average: number;
    count: number;
    distribution: Record<string, number>;
};

const kenyaLocations: Record<string, string[]> = {
    Baringo: ['Kabarnet', 'Eldama Ravine', 'Marigat', 'Mogotio', 'Chemolingot'],
    Bomet: ['Bomet', 'Sotik', 'Longisa', 'Mulot', 'Ndanai'],
    Bungoma: ['Bungoma', 'Webuye', 'Kimilili', 'Chwele', 'Sirisia'],
    Busia: ['Busia', 'Malaba', 'Nambale', 'Port Victoria', 'Funyula'],
    'Elgeyo-Marakwet': ['Iten', 'Kapsowar', 'Chepkorio', 'Tambach', 'Flax'],
    Embu: ['Embu', 'Runyenjes', 'Siakago', 'Manyatta', 'Kiritiri'],
    Garissa: ['Garissa', 'Dadaab', 'Balambala', 'Modogashe', 'Bura East'],
    'Homa Bay': ['Homa Bay', 'Mbita', 'Oyugis', 'Kendu Bay', 'Rangwe'],
    Isiolo: ['Isiolo', 'Merti', 'Garbatulla', 'Oldonyiro', 'Kinna'],
    Kajiado: ['Kajiado', 'Kitengela', 'Ngong', 'Ongata Rongai', 'Namanga'],
    Kakamega: ['Kakamega', 'Mumias', 'Butere', 'Khwisero', 'Malava'],
    Kericho: ['Kericho', 'Litein', 'Londiani', 'Kipkelion', 'Sosiot'],
    Kiambu: ['Kiambu', 'Thika', 'Ruiru', 'Kikuyu', 'Limuru', 'Githunguri'],
    Kilifi: ['Kilifi', 'Malindi', 'Watamu', 'Mariakani', 'Mtwapa'],
    Kirinyaga: ['Kerugoya', 'Kutus', 'Sagana', 'Kagio', 'Wanguru'],
    Kisii: ['Kisii', 'Ogembo', 'Suneka', 'Keroka', 'Keumbu'],
    Kisumu: ['Kisumu', 'Ahero', 'Maseno', 'Muhoroni', 'Kombewa'],
    Kitui: ['Kitui', 'Mwingi', 'Mutomo', 'Kisasi', 'Kabati'],
    Kwale: ['Kwale', 'Ukunda', 'Msambweni', 'Lunga Lunga', 'Kinango'],
    Laikipia: ['Nanyuki', 'Nyahururu', 'Rumuruti', 'Doldol', 'Kinamba'],
    Lamu: ['Lamu', 'Mpeketoni', 'Hindi', 'Witu', 'Faza'],
    Machakos: ['Machakos', 'Athi River', 'Kangundo', 'Matuu', 'Mwala'],
    Makueni: ['Wote', 'Makindu', 'Mtito Andei', 'Sultan Hamud', 'Emali'],
    Mandera: ['Mandera', 'Elwak', 'Rhamu', 'Banissa', 'Takaba'],
    Marsabit: ['Marsabit', 'Moyale', 'Laisamis', 'Loiyangalani', 'Sololo'],
    Meru: ['Meru', 'Maua', 'Nkubu', 'Timau', 'Laare'],
    Migori: ['Migori', 'Rongo', 'Awendo', 'Kehancha', 'Isebania'],
    Mombasa: ['Mombasa', 'Likoni', 'Changamwe', 'Nyali', 'Bamburi'],
    Muranga: ['Muranga', 'Kangema', 'Maragua', 'Kenol', 'Kangari'],
    Nairobi: ['CBD', 'Westlands', 'Karen', 'Kilimani', 'Embakasi', 'Kasarani'],
    Nakuru: ['Nakuru', 'Naivasha', 'Molo', 'Gilgil', 'Njoro'],
    Nandi: ['Kapsabet', 'Nandi Hills', 'Mosoriot', 'Kabiyet', 'Lessos'],
    Narok: ['Narok', 'Kilgoris', 'Ololulunga', 'Suswa', 'Mulot'],
    Nyamira: ['Nyamira', 'Keroka', 'Nyansiongo', 'Ekerenyo', 'Rigoma'],
    Nyandarua: ['Ol Kalou', 'Engineer', 'Njabini', 'Mairo Inya', 'Ndaragwa'],
    Nyeri: ['Nyeri', 'Karatina', 'Othaya', 'Mukurweini', 'Naromoru'],
    Samburu: ['Maralal', 'Baragoi', 'Wamba', 'Archers Post', 'Suguta Marmar'],
    Siaya: ['Siaya', 'Bondo', 'Ugunja', 'Yala', 'Usenge'],
    'Taita-Taveta': ['Voi', 'Wundanyi', 'Taveta', 'Mwatate', 'Mackinnon Road'],
    'Tana River': ['Hola', 'Garsen', 'Bura', 'Madogo', 'Kipini'],
    'Tharaka-Nithi': [
        'Chuka',
        'Chogoria',
        'Marimanti',
        'Kathwana',
        'Chiakariga',
    ],
    'Trans Nzoia': ['Kitale', 'Kiminini', 'Endebess', 'Maili Tisa', 'Saboti'],
    Turkana: ['Lodwar', 'Lokichogio', 'Kakuma', 'Lokichar', 'Kalokol'],
    'Uasin Gishu': ['Eldoret', 'Burnt Forest', 'Turbo', 'Moiben', 'Ziwa'],
    Vihiga: ['Mbale', 'Luanda', 'Chavakali', 'Majengo', 'Emuhaya'],
    Wajir: ['Wajir', 'Habaswein', 'Griftu', 'Bute', 'Eldas'],
    'West Pokot': ['Kapenguria', 'Makutano', 'Ortum', 'Chepareria', 'Sigor'],
};

const formatPrice = (price: string | number) =>
    new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        maximumFractionDigits: 0,
    })
        .format(Number(price))
        .replace('KES', 'KSh');

const getMatchingVariant = (product: Product, size?: string, color?: string) =>
    product.variants?.find(
        (variant) =>
            variant.size === size && (variant.color ?? '') === (color ?? ''),
    );

const getAvailableQuantity = (
    product: Product,
    size?: string,
    color?: string,
) => {
    const matchingVariant = getMatchingVariant(product, size, color);

    if (matchingVariant) {
        return Number(matchingVariant.quantity) || 0;
    }

    if (size && product.size_quantities?.[size] !== undefined) {
        return Number(product.size_quantities[size]) || 0;
    }

    return Number(product.stock_quantity) || 0;
};

const saveProductAction = (
    key: 'hod_cart' | 'hod_wishlist',
    product: Product,
    quantity = 1,
    options: { size?: string; color?: string } = {},
) => {
    const storedItems = JSON.parse(localStorage.getItem(key) ?? '[]') as Array<
        Product & { quantity?: number; size?: string; color?: string }
    >;
    const existingIndex = storedItems.findIndex(
        (item) =>
            item.slug === product.slug &&
            item.size === options.size &&
            item.color === options.color,
    );

    if (existingIndex >= 0) {
        const nextQuantity =
            (storedItems[existingIndex].quantity ?? 1) + quantity;
        storedItems[existingIndex] = {
            ...storedItems[existingIndex],
            quantity:
                key === 'hod_cart'
                    ? Math.min(
                          getAvailableQuantity(
                              product,
                              options.size,
                              options.color,
                          ),
                          nextQuantity,
                      )
                    : storedItems[existingIndex].quantity,
        };
    } else {
        storedItems.push({
            ...product,
            quantity:
                key === 'hod_cart'
                    ? Math.min(
                          getAvailableQuantity(
                              product,
                              options.size,
                              options.color,
                          ),
                          quantity,
                      )
                    : quantity,
            ...options,
        });
    }

    localStorage.setItem(key, JSON.stringify(storedItems));
};

export default function ProductShow({
    product,
    relatedProducts = [],
    reviews = [],
    ratingSummary,
}: ProductShowProps) {
    const { auth } = usePage().props;
    const currentProduct = product;
    const galleryImages =
        currentProduct.photo_urls && currentProduct.photo_urls.length > 0
            ? currentProduct.photo_urls
            : currentProduct.photo_url
              ? [currentProduct.photo_url]
              : [];
    const related = relatedProducts;
    const reviewCount = ratingSummary?.count ?? reviews.length;
    const ratingAverage =
        ratingSummary && ratingSummary.count > 0 ? ratingSummary.average : 0;
    const availableSizes =
        currentProduct.variants && currentProduct.variants.length > 0
            ? Array.from(
                  new Set(
                      currentProduct.variants.map((variant) => variant.size),
                  ),
              )
            : (currentProduct.sizes ?? []);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState(
        currentProduct.variants?.[0]?.size ?? currentProduct.sizes?.[0] ?? '',
    );
    const [selectedColor, setSelectedColor] = useState(
        currentProduct.variants?.[0]?.color ?? currentProduct.colors?.[0] ?? '',
    );
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [notice, setNotice] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);
    const availableColors =
        currentProduct.variants && currentProduct.variants.length > 0
            ? currentProduct.variants
                  .filter((variant) => variant.size === selectedSize)
                  .map((variant) => variant.color ?? '')
                  .filter(
                      (color, index, colors) => colors.indexOf(color) === index,
                  )
            : (currentProduct.colors ?? []);
    const selectedVariant = getMatchingVariant(
        currentProduct,
        selectedSize,
        selectedColor,
    );
    const activeGalleryImages =
        selectedVariant?.photo_urls && selectedVariant.photo_urls.length > 0
            ? selectedVariant.photo_urls
            : galleryImages;
    const regularSelectedPrice =
        selectedVariant?.price ??
        (selectedSize && currentProduct.size_prices?.[selectedSize]
            ? currentProduct.size_prices[selectedSize]
            : currentProduct.price);
    const selectedFlashSalePrice =
        currentProduct.is_flash_sale_active &&
        Number(selectedVariant?.flash_sale_quantity ?? 0) > 0
            ? (selectedVariant?.flash_sale_price ??
              currentProduct.flash_sale_price)
            : currentProduct.is_flash_sale_active
              ? currentProduct.flash_sale_price
              : null;
    const selectedPrice = selectedFlashSalePrice ?? regularSelectedPrice;
    const selectedOriginalPrice =
        selectedVariant?.original_price ?? currentProduct.original_price;
    const displayOldPrice =
        Number(regularSelectedPrice) > Number(selectedPrice)
            ? Number(regularSelectedPrice)
            : Number(selectedOriginalPrice ?? 0) > Number(selectedPrice)
              ? Number(selectedOriginalPrice)
              : null;
    const discountPercentage = displayOldPrice
        ? Math.round(
              ((displayOldPrice - Number(selectedPrice)) / displayOldPrice) *
                  100,
          )
        : 0;
    const selectedImage = activeGalleryImages[selectedImageIndex] ?? null;
    const selectedSizeQuantity = getAvailableQuantity(
        currentProduct,
        selectedSize,
        selectedColor,
    );
    const isOutOfStock = selectedSizeQuantity <= 0;

    function showPreviousImage() {
        setSelectedImageIndex((index) =>
            activeGalleryImages.length > 0
                ? (index - 1 + activeGalleryImages.length) %
                  activeGalleryImages.length
                : 0,
        );
    }

    function showNextImage() {
        setSelectedImageIndex((index) =>
            activeGalleryImages.length > 0
                ? (index + 1) % activeGalleryImages.length
                : 0,
        );
    }

    function addToCart() {
        if (isOutOfStock) {
            showNotice('error', `${currentProduct.name} is out of stock.`);

            return;
        }

        saveProductAction(
            'hod_cart',
            {
                ...currentProduct,
                base_price: regularSelectedPrice,
                price: selectedPrice,
                photo_url:
                    selectedVariant?.photo_urls?.[0] ??
                    currentProduct.photo_url,
            },
            quantity,
            {
                size: selectedSize,
                color: selectedColor,
            },
        );
        window.dispatchEvent(new Event('hod-cart-updated'));
        showNotice('success', `${currentProduct.name} added to cart.`);
    }

    function addToWishlist() {
        saveProductAction('hod_wishlist', currentProduct);
        showNotice('success', `${currentProduct.name} added to wishlist.`);
    }

    function showNotice(type: 'success' | 'error', message: string) {
        setNotice({ type, message });
        window.setTimeout(() => setNotice(null), 2400);
    }

    useEffect(() => {
        const storedProducts = JSON.parse(
            localStorage.getItem('hod_recently_viewed') ?? '[]',
        ) as Product[];
        const nextProducts = [
            currentProduct,
            ...storedProducts.filter(
                (item) => item.slug !== currentProduct.slug,
            ),
        ].slice(0, 8);

        localStorage.setItem(
            'hod_recently_viewed',
            JSON.stringify(nextProducts),
        );
    }, [currentProduct]);

    const [prevSizeQuantity, setPrevSizeQuantity] = useState(
        selectedSizeQuantity,
    );

    if (selectedSizeQuantity !== prevSizeQuantity) {
        setPrevSizeQuantity(selectedSizeQuantity);
        setQuantity((value) =>
            Math.min(Math.max(1, value), selectedSizeQuantity || 1),
        );
    }

    const [prevSelectedSize, setPrevSelectedSize] = useState(selectedSize);

    if (selectedSize !== prevSelectedSize) {
        setPrevSelectedSize(selectedSize);

        if (
            currentProduct.variants &&
            currentProduct.variants.length > 0 &&
            !availableColors.includes(selectedColor)
        ) {
            setSelectedColor(availableColors[0] ?? '');
        }
    }

    const imageResetKey = `${selectedSize}|${selectedColor}`;
    const [prevImageResetKey, setPrevImageResetKey] =
        useState(imageResetKey);

    if (imageResetKey !== prevImageResetKey) {
        setPrevImageResetKey(imageResetKey);
        setSelectedImageIndex(0);
    }

    return (
        <>
            <Head title={`${currentProduct.name} | Scented Muse`} />
            <main className="min-h-screen bg-[#f1f1f3] text-[#17131f]">
                {notice && <FeedbackModal {...notice} />}
                <CustomerNavbar />

                <section className="mx-auto grid max-w-[1320px] gap-4 px-3 py-4 sm:px-4">
                    <div className="grid gap-4 rounded-md bg-white p-3 shadow-sm sm:p-5 md:grid-cols-[minmax(260px,360px)_minmax(0,1fr)]">
                        <div>
                            <div className="flex h-[280px] items-center justify-center rounded-md bg-white sm:h-[360px]">
                                {selectedImage ? (
                                    <button
                                        type="button"
                                        onClick={() => setIsGalleryOpen(true)}
                                        className="flex h-full w-full items-center justify-center"
                                        aria-label="Open product image gallery"
                                    >
                                        <img
                                            src={selectedImage}
                                            alt={currentProduct.name}
                                            className="max-h-full w-full object-contain transition duration-300 hover:scale-[1.02]"
                                        />
                                    </button>
                                ) : (
                                    <span className="flex h-full w-full items-center justify-center rounded-md bg-[#fff7f2] text-[#7f5f53]">
                                        No product image uploaded
                                    </span>
                                )}
                            </div>
                            {activeGalleryImages.length > 0 && (
                                <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                                    {activeGalleryImages.map((image, index) => (
                                        <button
                                            key={`${image}-${index}`}
                                            type="button"
                                            onClick={() =>
                                                setSelectedImageIndex(index)
                                            }
                                            onDoubleClick={() =>
                                                setIsGalleryOpen(true)
                                            }
                                            className={`flex size-14 items-center justify-center rounded-sm border bg-white p-1 transition hover:border-[#e85d4f] ${
                                                selectedImageIndex === index
                                                    ? 'border-[#e85d4f] ring-2 ring-[#e85d4f]/25'
                                                    : 'border-[#ead9d1]'
                                            }`}
                                            aria-label={`View product image ${index + 1}`}
                                        >
                                            <img
                                                src={image}
                                                alt=""
                                                className="h-full w-full object-contain"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className="mt-6 border-t border-[#eee1dc] pt-4">
                                <p className="text-sm font-black uppercase">
                                    Share this product
                                </p>
                                <div className="mt-4 flex gap-3">
                                    {['f', 'x', 'wa'].map((item) => (
                                        <span
                                            key={item}
                                            className="flex size-9 items-center justify-center rounded-full border border-[#7f5f53] text-xs font-bold"
                                        >
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <button
                                className="absolute top-0 right-0 text-[#e85d4f]"
                                aria-label="Save product"
                                onClick={addToWishlist}
                            >
                                <Heart className="size-7" />
                            </button>
                            <div className="flex gap-2">
                                <span className="rounded-sm bg-[#3b2147] px-2 py-1 text-xs font-bold text-white">
                                    Official Store
                                </span>
                                {currentProduct.is_flash_sale_active && (
                                    <span className="rounded-sm bg-[#e85d4f] px-2 py-1 text-xs font-black text-white">
                                        Flash Sale
                                    </span>
                                )}
                            </div>
                            <h1 className="mt-3 max-w-2xl text-2xl leading-tight font-semibold">
                                {currentProduct.name}
                            </h1>
                            <p className="mt-3 text-sm">
                                Brand:{' '}
                                <span className="font-semibold text-[#3b2147]">
                                    {currentProduct.brand ?? 'Scented Muse'}
                                </span>{' '}
                                | Similar products from{' '}
                                {currentProduct.category?.name ?? 'Scented Muse'}
                            </p>
                            {currentProduct.product_code && (
                                <p className="mt-3 inline-flex rounded-sm border border-[#ead9d1] px-2 py-1 font-mono text-sm font-black text-[#3b2147]">
                                    Code: {currentProduct.product_code}
                                </p>
                            )}
                            <div className="mt-4 border-t border-[#eee1dc] pt-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-3xl font-black">
                                        {formatPrice(selectedPrice)}
                                    </span>
                                    {displayOldPrice ? (
                                        <span className="text-lg text-[#7f5f53] line-through">
                                            {formatPrice(displayOldPrice)}
                                        </span>
                                    ) : null}
                                    {discountPercentage > 0 ? (
                                        <span className="rounded-sm bg-[#fff1ea] px-2 py-1 text-sm font-bold text-[#e85d4f]">
                                            -{discountPercentage}%
                                        </span>
                                    ) : null}
                                </div>
                                <div className="mt-4 grid gap-2 rounded-md bg-[#fff7f2] p-3 text-sm sm:grid-cols-2">
                                    {displayOldPrice ? (
                                        <p className="flex items-center gap-2 text-[#7f5f53]">
                                            <Tags className="size-5 text-[#3b2147]" />
                                            <span>
                                                Before discount:{' '}
                                                <span className="line-through">
                                                    {formatPrice(
                                                        displayOldPrice,
                                                    )}
                                                </span>
                                            </span>
                                        </p>
                                    ) : (
                                        <p className="flex items-center gap-2 text-[#7f5f53]">
                                            <Tags className="size-5 text-[#3b2147]" />
                                            No discount applied
                                        </p>
                                    )}
                                    <p className="flex items-center gap-2 font-black text-[#e85d4f]">
                                        <CreditCard className="size-5" />
                                        After discount:{' '}
                                        {formatPrice(selectedPrice)}
                                    </p>
                                </div>
                                <p className="mt-3 text-sm text-[#6b7280]">
                                    {selectedSizeQuantity > 0
                                        ? `${selectedSizeQuantity} available${selectedSize ? ` in ${selectedSize}` : ''}`
                                        : 'Out of stock'}
                                </p>
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="rounded-sm bg-[#7c4be8] px-2 py-0.5 text-xs font-black text-white">
                                        SCENTED MUSE INSTANT
                                    </span>
                                    <span className="text-sm font-semibold">
                                        Get your order in 4 hours
                                    </span>
                                </div>
                                <div className="mt-3 flex items-center gap-1">
                                    <Stars rating={Math.round(ratingAverage)} />
                                    <span className="ml-2 text-sm text-[#2563eb]">
                                        ({reviewCount} customer ratings)
                                    </span>
                                </div>
                                {availableSizes.length > 0 && (
                                    <div className="mt-5">
                                        <p className="text-sm font-black uppercase">
                                            Select size
                                        </p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {availableSizes.map((size) => {
                                                const sizeQuantity =
                                                    getAvailableQuantity(
                                                        currentProduct,
                                                        size,
                                                    );

                                                const sizeClass =
                                                    sizeQuantity <= 0
                                                        ? 'cursor-not-allowed border-[#ead9d1] bg-[#f7f2ef] text-[#9f8b84]'
                                                        : selectedSize === size
                                                          ? 'border-[#e85d4f] bg-[#e85d4f] text-white'
                                                          : 'border-[#ead9d1] bg-white text-[#3b2147] hover:border-[#e85d4f]';

                                                return (
                                                    <button
                                                        key={size}
                                                        type="button"
                                                        disabled={
                                                            sizeQuantity <= 0
                                                        }
                                                        onClick={() =>
                                                            setSelectedSize(
                                                                size,
                                                            )
                                                        }
                                                        className={`min-w-12 rounded-md border px-4 py-2 text-sm font-black transition ${sizeClass}`}
                                                    >
                                                        {size}
                                                        {sizeQuantity <= 0 && (
                                                            <span className="ml-1 text-[10px]">
                                                                out
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                {availableColors.length > 0 && (
                                    <div className="mt-5">
                                        <p className="text-sm font-black uppercase">
                                            Select color
                                        </p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {availableColors.map((color) => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedColor(color)
                                                    }
                                                    className={`min-w-12 rounded-md border px-4 py-2 text-sm font-black transition ${
                                                        selectedColor === color
                                                            ? 'border-[#3b2147] bg-[#3b2147] text-white'
                                                            : 'border-[#ead9d1] bg-white text-[#3b2147] hover:border-[#e85d4f]'
                                                    }`}
                                                >
                                                    {color}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                                    <div className="flex h-14 w-full max-w-[170px] items-center justify-between rounded-md border border-[#d7c4bd] bg-white px-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setQuantity((value) =>
                                                    Math.max(1, value - 1),
                                                )
                                            }
                                            className="flex size-9 items-center justify-center rounded-sm bg-[#fff1ea] text-xl font-black text-[#3b2147]"
                                            aria-label="Decrease quantity"
                                        >
                                            -
                                        </button>
                                        <span className="text-lg font-black">
                                            {quantity}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setQuantity((value) =>
                                                    Math.min(
                                                        selectedSizeQuantity ||
                                                            99,
                                                        value + 1,
                                                    ),
                                                )
                                            }
                                            className="flex size-9 items-center justify-center rounded-sm bg-[#fff1ea] text-xl font-black text-[#3b2147]"
                                            aria-label="Increase quantity"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button
                                        onClick={addToCart}
                                        disabled={isOutOfStock}
                                        className={`flex h-14 flex-1 items-center justify-center gap-4 rounded-md text-lg font-black text-white shadow-xl transition ${
                                            isOutOfStock
                                                ? 'cursor-not-allowed bg-[#d71920]/80 shadow-[#d71920]/10 lg:hover:bg-[#d71920] lg:hover:shadow-[#d71920]/30'
                                                : 'bg-[#e85d4f] shadow-[#e85d4f]/20 hover:-translate-y-0.5 hover:bg-[#3b2147]'
                                        }`}
                                    >
                                        <ShoppingCart className="size-6" />
                                        {isOutOfStock
                                            ? 'Out of stock'
                                            : `Add ${quantity} to cart`}
                                    </button>
                                </div>
                                <button
                                    onClick={addToWishlist}
                                    className="mt-3 flex h-12 w-full items-center justify-center gap-3 rounded-md border border-[#ead9d1] bg-white font-black text-[#3b2147] transition hover:border-[#e85d4f] hover:text-[#e85d4f]"
                                >
                                    <Heart className="size-5" />
                                    Add to wishlist
                                </button>
                            </div>

                            <div className="mt-7 border-t border-[#eee1dc] pt-5">
                                <p className="font-black uppercase">
                                    Product description
                                </p>
                                <p className="mt-3 leading-7 whitespace-pre-wrap text-[#4b5563]">
                                    {currentProduct.description ??
                                        'No product description has been added yet.'}
                                </p>
                                {currentProduct.fragrance_type && (
                                    <p className="mt-3 text-sm">
                                        Type:{' '}
                                        <span className="font-semibold text-[#3b2147]">
                                            {currentProduct.fragrance_type}
                                        </span>
                                    </p>
                                )}
                            </div>

                        </div>
                    </div>

                    <DeliveryPanel />
                </section>

                {isGalleryOpen && selectedImage && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-[#17131f]/80 px-4 py-6"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Product image gallery"
                    >
                        <div className="relative flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-md bg-white shadow-2xl">
                            <div className="flex items-center justify-between border-b border-[#eee1dc] px-4 py-3">
                                <div>
                                    <p className="font-black text-[#3b2147]">
                                        {currentProduct.name}
                                    </p>
                                    <p className="text-sm text-[#7f5f53]">
                                        Image {selectedImageIndex + 1} of{' '}
                                        {activeGalleryImages.length}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsGalleryOpen(false)}
                                    className="flex size-10 items-center justify-center rounded-full bg-[#fff1ea] text-[#3b2147] transition hover:bg-[#e85d4f] hover:text-white"
                                    aria-label="Close gallery"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>

                            <div className="relative flex min-h-[320px] flex-1 items-center justify-center bg-[#fff7f2] p-4 md:min-h-[560px]">
                                {activeGalleryImages.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={showPreviousImage}
                                        className="absolute left-4 z-10 flex size-11 items-center justify-center rounded-full bg-white text-[#3b2147] shadow-lg transition hover:bg-[#e85d4f] hover:text-white"
                                        aria-label="Previous image"
                                    >
                                        <ChevronLeft className="size-6" />
                                    </button>
                                )}
                                <img
                                    src={selectedImage}
                                    alt={currentProduct.name}
                                    className="max-h-[70vh] w-full object-contain"
                                />
                                {activeGalleryImages.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={showNextImage}
                                        className="absolute right-4 z-10 flex size-11 items-center justify-center rounded-full bg-white text-[#3b2147] shadow-lg transition hover:bg-[#e85d4f] hover:text-white"
                                        aria-label="Next image"
                                    >
                                        <ChevronRight className="size-6" />
                                    </button>
                                )}
                            </div>

                            {activeGalleryImages.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto border-t border-[#eee1dc] p-4">
                                    {activeGalleryImages.map((image, index) => (
                                        <button
                                            key={`gallery-${image}-${index}`}
                                            type="button"
                                            onClick={() =>
                                                setSelectedImageIndex(index)
                                            }
                                            className={`flex size-20 shrink-0 items-center justify-center rounded-sm border bg-white p-1 transition hover:border-[#e85d4f] ${
                                                selectedImageIndex === index
                                                    ? 'border-[#e85d4f] ring-2 ring-[#e85d4f]/25'
                                                    : 'border-[#ead9d1]'
                                            }`}
                                            aria-label={`Open image ${index + 1}`}
                                        >
                                            <img
                                                src={image}
                                                alt=""
                                                className="h-full w-full object-contain"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <section className="mx-auto grid max-w-[1320px] gap-4 px-3 pb-8 sm:px-4">
                    <div className="overflow-hidden rounded-md bg-white shadow-sm">
                        <h2 className="border-b border-[#eee1dc] px-5 py-4 text-2xl font-black">
                            Customer Feedback
                        </h2>
                        <div className="grid gap-8 p-5 md:grid-cols-[230px_minmax(0,1fr)]">
                            <div>
                                <p className="font-black uppercase">
                                    Customer Ratings ({reviewCount})
                                </p>
                                <div className="mt-4 rounded-md bg-[#f2f2f4] p-7 text-center">
                                    <p className="text-4xl font-black text-[#f5a000]">
                                        {ratingAverage.toFixed(1)}/5
                                    </p>
                                    <Stars rating={Math.round(ratingAverage)} />
                                    <p className="mt-4 text-lg">
                                        {reviewCount} customer ratings
                                    </p>
                                </div>
                                <div className="mt-5 grid gap-2 text-sm">
                                    {[5, 4, 3, 2, 1].map((rating, index) => (
                                        <div
                                            key={rating}
                                            className="flex items-center gap-2"
                                        >
                                            <span className="w-3 font-bold">
                                                {rating}
                                            </span>
                                            <Star className="size-4 fill-[#f5a000] text-[#f5a000]" />
                                            <div className="h-2 flex-1 rounded-full bg-[#d4d4d8]">
                                                <div
                                                    className="h-full rounded-full bg-[#f5a000]"
                                                    style={{
                                                        width:
                                                            reviewCount > 0
                                                                ? `${(((ratingSummary?.distribution?.[rating] ?? 0) / reviewCount) * 100).toFixed(0)}%`
                                                                : `${80 - index * 13}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="font-black uppercase">
                                    Product Reviews ({reviews.length})
                                </p>
                                <ReviewForm
                                    product={currentProduct}
                                    canReview={Boolean(auth.user && product)}
                                />
                                {reviews.length > 0 ? (
                                    reviews.map((review) => (
                                        <article
                                            key={review.id}
                                            className="border-b border-[#eee1dc] py-5 last:border-b-0"
                                        >
                                            <Stars rating={review.rating} />
                                            <h3 className="mt-3 text-lg font-black">
                                                {review.title}
                                            </h3>
                                            <p className="mt-3">
                                                {review.body}
                                            </p>
                                            <div className="mt-4 flex items-center justify-between text-sm text-[#6b7280]">
                                                <span>
                                                    {new Date(
                                                        review.created_at,
                                                    ).toLocaleDateString(
                                                        'en-KE',
                                                    )}{' '}
                                                    by{' '}
                                                    {review.user?.name ??
                                                        'Customer'}
                                                </span>
                                                {review.is_verified_purchase && (
                                                    <span className="flex items-center gap-1 font-semibold text-[#3b2147]">
                                                        <BadgeCheck className="size-5" />
                                                        Verified Purchase
                                                    </span>
                                                )}
                                            </div>
                                        </article>
                                    ))
                                ) : (
                                    <div className="mt-5 rounded-md bg-[#fff7f2] p-5 text-sm text-[#7f5f53]">
                                        No customer reviews yet. Be the first
                                        customer to rate this product.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <section className="grid gap-4 lg:grid-cols-3">
                        <div className="overflow-hidden rounded-md bg-white shadow-sm">
                            {[
                                ['Product details', ClipboardList],
                                ['Specifications', PackageCheck],
                                ['Customer Feedback', MessageSquare],
                            ].map(([label, Icon], index) => {
                                const ItemIcon = Icon as typeof ClipboardList;

                                return (
                                    <a
                                        key={label as string}
                                        href="#"
                                        className={`flex items-center gap-5 border-b border-[#ddd] px-5 py-4 text-lg last:border-b-0 ${
                                            index === 2
                                                ? 'bg-[#d6d4d6] font-bold'
                                                : ''
                                        }`}
                                    >
                                        <ItemIcon className="size-6" />
                                        {label as string}
                                    </a>
                                );
                            })}
                        </div>
                        <div className="rounded-md bg-white p-3 shadow-sm">
                            <div className="flex gap-3">
                                {currentProduct.photo_url ? (
                                    <img
                                        src={currentProduct.photo_url}
                                        alt=""
                                        className="size-24 object-contain"
                                    />
                                ) : (
                                    <span className="flex size-24 items-center justify-center rounded-md bg-[#fff7f2] text-xs text-[#7f5f53]">
                                        No image
                                    </span>
                                )}
                                <div>
                                    <p>{currentProduct.name}</p>
                                    <p className="mt-1 text-xl font-black">
                                        {formatPrice(selectedPrice)}
                                    </p>
                                    {displayOldPrice ? (
                                        <span className="text-sm text-[#7f5f53] line-through">
                                            {formatPrice(displayOldPrice)}
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                            <button
                                onClick={addToCart}
                                disabled={isOutOfStock}
                                className={`mt-4 flex h-12 w-full items-center justify-center gap-3 rounded-md font-black text-white transition ${
                                    isOutOfStock
                                        ? 'cursor-not-allowed bg-[#d71920]/80 lg:hover:bg-[#d71920]'
                                        : 'bg-[#e85d4f] hover:bg-[#3b2147]'
                                }`}
                            >
                                <ShoppingCart className="size-5" />
                                {isOutOfStock
                                    ? 'Out of stock'
                                    : `Add ${quantity} to cart`}
                            </button>
                        </div>
                        <div className="rounded-md bg-white p-5 text-center shadow-sm">
                            <p>Questions about this product?</p>
                            <button className="mt-3 inline-flex items-center gap-2 font-black text-[#e85d4f]">
                                <MessageSquare className="size-5" />
                                Chat
                            </button>
                        </div>
                    </section>
                </section>

                <section className="mx-auto max-w-[1320px] px-4 pb-10">
                    <div className="rounded-md bg-white p-5 shadow-sm">
                        <h2 className="text-xl font-black">
                            More from Scented Muse
                        </h2>
                        {related.length > 0 ? (
                            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {related.map((item) => (
                                    <Link
                                        key={item.slug}
                                        href={`/products/${item.slug}`}
                                        className="group rounded-md border border-[#ead9d1] p-3 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#3b2147]/10"
                                    >
                                        {item.photo_url ? (
                                            <img
                                                src={item.photo_url}
                                                alt={item.name}
                                                className="h-36 w-full object-contain transition group-hover:scale-105"
                                            />
                                        ) : (
                                            <span className="flex h-36 w-full items-center justify-center rounded-md bg-[#fff7f2] text-sm text-[#7f5f53]">
                                                No image uploaded
                                            </span>
                                        )}
                                        <p className="mt-3 min-h-12 font-semibold">
                                            {item.name}
                                        </p>
                                        <p className="font-black text-[#3b2147]">
                                            {formatPrice(item.price)}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-5 rounded-md bg-[#fff7f2] p-5 text-center text-[#7f5f53]">
                                No related products yet.
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </>
    );
}

function DeliveryPanel() {
    const countyNames = Object.keys(kenyaLocations);
    const [county, setCounty] = useState('Nairobi');
    const [town, setTown] = useState(kenyaLocations.Nairobi[0]);
    const towns = kenyaLocations[county] ?? [];

    return (
        <section className="overflow-hidden rounded-md bg-white shadow-sm">
            <div className="border-b border-[#eee1dc] px-4 py-3">
                <h2 className="font-black uppercase">Delivery & Returns</h2>
                <p className="mt-2 text-sm">
                    Scented Muse Instant delivery in main cities{' '}
                    <span className="text-[#2563eb]">Details</span>
                </p>
            </div>
            <div className="p-4">
                <h3 className="text-xl font-semibold">Choose your location</h3>
                <label className="mt-4 block">
                    <span className="sr-only">County</span>
                    <select
                        value={county}
                        onChange={(event) => {
                            const nextCounty = event.target.value;
                            setCounty(nextCounty);
                            setTown(kenyaLocations[nextCounty]?.[0] ?? '');
                        }}
                        className="h-14 w-full rounded-sm border border-[#aaa] bg-white px-5 text-lg outline-none focus:border-[#e85d4f]"
                    >
                        {countyNames.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="mt-4 block">
                    <span className="sr-only">Town</span>
                    <select
                        value={town}
                        onChange={(event) => setTown(event.target.value)}
                        className="h-14 w-full rounded-sm border border-[#aaa] bg-white px-5 text-lg outline-none focus:border-[#e85d4f]"
                    >
                        {towns.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
            <div className="mx-4 rounded-sm border border-[#7c4be8]">
                <div className="flex justify-between bg-[#7c4be8] px-3 py-1 text-sm font-bold text-white">
                    <span>Get your order in 4 hours</span>
                    <span>Details</span>
                </div>
                <DeliveryOption
                    icon={Truck}
                    title="Instant Delivery"
                    text="Delivery Fees KSh 400"
                />
            </div>
            <DeliveryOption
                icon={Store}
                title="Pickup Station"
                text="Delivery Fees KSh 90. Ready for pickup on 23 July if you place your order within the next 7hrs 12mins"
            />
            <DeliveryOption
                icon={Truck}
                title="Door Delivery"
                text="Delivery Fees KSh 200. Ready for delivery on 23 July if you place your order within the next 7hrs 12mins"
            />
            <DeliveryOption
                icon={RotateCcw}
                title="Return Policy"
                text="Easy Return, Quick Refund. Details"
            />
            <DeliveryOption
                icon={Shield}
                title="Warranty"
                text="1 Year warranty from Scented Muse"
            />
        </section>
    );
}

function ReviewForm({
    product,
    canReview,
}: {
    product: Product;
    canReview: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        rating: '5',
        title: '',
        body: '',
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post(`/products/${product.id}/reviews`, {
            preserveScroll: true,
            onSuccess: () => reset('title', 'body'),
        });
    }

    if (!canReview) {
        return (
            <div className="mt-5 rounded-md border border-[#ead9d1] bg-[#fff7f2] p-4 text-sm">
                <Link href="/login" className="font-black text-[#e85d4f]">
                    Log in
                </Link>{' '}
                to rate and review this product.
            </div>
        );
    }

    return (
        <form
            onSubmit={submit}
            className="mt-5 rounded-md border border-[#ead9d1] bg-[#fff7f2] p-4"
        >
            <p className="font-black">Rate this product</p>
            <div className="mt-3 grid gap-3 md:grid-cols-[120px_minmax(0,1fr)]">
                <select
                    value={data.rating}
                    onChange={(event) => setData('rating', event.target.value)}
                    className="h-11 rounded-sm border border-[#d7c4bd] bg-white px-3"
                >
                    {[5, 4, 3, 2, 1].map((rating) => (
                        <option key={rating} value={rating}>
                            {rating} stars
                        </option>
                    ))}
                </select>
                <input
                    value={data.title}
                    onChange={(event) => setData('title', event.target.value)}
                    className="h-11 rounded-sm border border-[#d7c4bd] bg-white px-3"
                    placeholder="Review title"
                />
            </div>
            {errors.rating && (
                <p className="mt-2 text-sm text-[#d71920]">{errors.rating}</p>
            )}
            {errors.title && (
                <p className="mt-2 text-sm text-[#d71920]">{errors.title}</p>
            )}
            <textarea
                value={data.body}
                onChange={(event) => setData('body', event.target.value)}
                className="mt-3 min-h-24 w-full rounded-sm border border-[#d7c4bd] bg-white px-3 py-2"
                placeholder="Tell other customers what you think about this product."
            />
            {errors.body && (
                <p className="mt-2 text-sm text-[#d71920]">{errors.body}</p>
            )}
            <button
                disabled={processing}
                className="mt-3 rounded-sm bg-[#3b2147] px-5 py-2 font-black text-white transition hover:bg-[#e85d4f] disabled:opacity-60"
            >
                Submit review
            </button>
        </form>
    );
}

function DeliveryOption({
    icon: Icon,
    title,
    text,
}: {
    icon: typeof Truck;
    title: string;
    text: string;
}) {
    return (
        <div className="flex gap-3 border-b border-[#eee1dc] p-4 last:border-b-0">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-sm border border-[#d1d5db]">
                <Icon className="size-6 text-[#555]" />
            </span>
            <div>
                <h3 className="font-black">{title}</h3>
                <p className="text-sm leading-5 text-[#333]">{text}</p>
            </div>
        </div>
    );
}

function Stars({ rating = 5 }: { rating?: number }) {
    return (
        <div className="mt-2 flex items-center gap-1 text-[#f5a000]">
            {Array.from({ length: 5 }).map((_, index) => (
                <Star
                    key={index}
                    className={`size-5 ${index < rating ? 'fill-current' : 'fill-[#d4d4d8] text-[#d4d4d8]'}`}
                />
            ))}
        </div>
    );
}

function FeedbackModal({
    type,
    message,
}: {
    type: 'success' | 'error';
    message: string;
}) {
    return (
        <div className="fixed top-24 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-md bg-white p-4 text-center shadow-2xl ring-1 ring-[#ead9d1]">
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

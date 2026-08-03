import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    Facebook,
    Grid3X3,
    Heart,
    Menu,
    Music2,
    Search,
    ShoppingCart,
    Tags,
    UserRound,
    X,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { HeroSlideshow } from '@/components/hero-slideshow';
import type { HeroSlide } from '@/components/hero-slideshow';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import WhatsAppIcon from '@/components/whatsapp-icon';
import { getCartSummary } from '@/lib/shop-storage';
import { login, register } from '@/routes';
import type { User } from '@/types';

type Category = {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    products_count?: number;
};

type Product = {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    brand?: string | null;
    price: string | number;
    flash_sale_price?: string | number | null;
    original_price?: string | number | null;
    discount_percentage?: number | null;
    stock_quantity: number;
    size_quantities?: Record<string, string | number> | null;
    flash_sale_size_quantities?: Record<string, string | number> | null;
    photo_url?: string | null;
    is_flash_sale?: boolean;
    is_flash_sale_active?: boolean;
    flash_sale_ends_at?: string | null;
    category?: {
        id: number;
        name: string;
        slug: string;
    } | null;
};

type WelcomeProps = {
    heroSlides?: HeroSlide[];
    categories?: Category[];
    products?: Product[];
    flashSaleProducts?: Product[];
};

type SharedShopSettings = {
    shop_location?: string | null;
    shop_phone?: string | null;
    whatsapp_number?: string | null;
    whatsapp_url?: string | null;
    tiktok_url?: string | null;
    facebook_url?: string | null;
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
    const regularPrice = Number(product.price);
    const displayPrice = Number(getDisplayPrice(product));

    if (regularPrice > displayPrice) {
        return regularPrice;
    }

    return originalPrice > displayPrice ? originalPrice : null;
};

const getDisplayPrice = (product: Product) =>
    product.is_flash_sale_active && product.flash_sale_price
        ? product.flash_sale_price
        : product.price;

const getInitialUrlState = () => {
    const query = new URLSearchParams(window.location.search);

    return {
        search: query.get('search') ?? '',
        showAllProducts: query.get('show') === 'all-products',
    };
};

const readRecentlyViewed = (hasUser: boolean): Product[] =>
    hasUser
        ? (
              JSON.parse(
                  localStorage.getItem('hod_recently_viewed') ?? '[]',
              ) as Product[]
          ).slice(0, 6)
        : [];

const formatCountdown = (remainingMs: number) => {
    const hours = Math.floor(remainingMs / 3_600_000);
    const minutes = Math.floor((remainingMs % 3_600_000) / 60_000);
    const seconds = Math.floor((remainingMs % 60_000) / 1000);

    return `${hours.toString().padStart(2, '0')}h : ${minutes
        .toString()
        .padStart(2, '0')}m : ${seconds.toString().padStart(2, '0')}s`;
};

const saveProductAction = (
    key: 'hod_cart' | 'hod_wishlist',
    product: Product,
    quantity = 1,
) => {
    const storedItems = JSON.parse(localStorage.getItem(key) ?? '[]') as Array<
        Product & { quantity?: number }
    >;
    const existingIndex = storedItems.findIndex(
        (item) => item.slug === product.slug,
    );

    if (existingIndex >= 0) {
        const nextQuantity =
            (storedItems[existingIndex].quantity ?? 1) + quantity;
        storedItems[existingIndex] = {
            ...storedItems[existingIndex],
            quantity:
                key === 'hod_cart'
                    ? Math.min(product.stock_quantity, nextQuantity)
                    : storedItems[existingIndex].quantity,
        };
    } else {
        storedItems.push({
            ...product,
            quantity:
                key === 'hod_cart'
                    ? Math.min(product.stock_quantity, quantity)
                    : quantity,
        });
    }

    localStorage.setItem(key, JSON.stringify(storedItems));
};

export default function Welcome({
    heroSlides = [],
    categories = [],
    products = [],
    flashSaleProducts = [],
}: WelcomeProps) {
    const { auth, shopSettings } = usePage().props as unknown as {
        auth: { user?: User | null };
        shopSettings?: SharedShopSettings;
    };
    const [selectedCategorySlug, setSelectedCategorySlug] = useState<
        string | null
    >(null);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [isShowingAllProducts, setIsShowingAllProducts] = useState(
        () =>
            !getInitialUrlState().search &&
            getInitialUrlState().showAllProducts,
    );
    const [searchQuery, setSearchQuery] = useState(
        () => getInitialUrlState().search,
    );
    const [submittedSearchQuery, setSubmittedSearchQuery] = useState(
        () => getInitialUrlState().search,
    );
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<
        Product[]
    >(() => readRecentlyViewed(Boolean(auth.user)));
    const [cartSummary, setCartSummary] = useState({ count: 0, total: 0 });
    const [notice, setNotice] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);
    const activeProducts = products;
    const activeCategories = categories;
    const featuredProducts = products.slice(0, 6);
    const bestSellingProducts = [...products].reverse().slice(0, 6);
    const newArrivalProducts = products.slice(0, 6);
    const dealProducts = flashSaleProducts;
    const activeDealProducts = dealProducts.filter(
        (product) => product.is_flash_sale_active,
    );
    const dealEndsAt = activeDealProducts
        .map((product) =>
            product.flash_sale_ends_at
                ? new Date(product.flash_sale_ends_at).getTime()
                : null,
        )
        .filter((value): value is number => Boolean(value))
        .sort((a, b) => a - b)[0];
    const [timeLeft, setTimeLeft] = useState(() =>
        dealEndsAt ? formatCountdown(Math.max(0, dealEndsAt - Date.now())) : '',
    );
    const selectedCategory = activeCategories.find(
        (category) => category.slug === selectedCategorySlug,
    );
    const selectedCategoryProducts = selectedCategorySlug
        ? activeProducts.filter(
              (product) => product.category?.slug === selectedCategorySlug,
          )
        : [];
    const normalizedSearchQuery = submittedSearchQuery.trim().toLowerCase();
    const searchProducts = normalizedSearchQuery
        ? activeProducts.filter(
              (product) =>
                  product.name.toLowerCase().includes(normalizedSearchQuery) ||
                  (product.category?.name ?? '')
                      .toLowerCase()
                      .includes(normalizedSearchQuery),
          )
        : [];

    const [prevAuthUser, setPrevAuthUser] = useState(auth.user);

    if (auth.user !== prevAuthUser) {
        setPrevAuthUser(auth.user);
        setRecentlyViewedProducts(readRecentlyViewed(Boolean(auth.user)));
    }

    useEffect(() => {
        const { search, showAllProducts } = getInitialUrlState();

        if (search || showAllProducts) {
            window.setTimeout(() => {
                document.getElementById('category-products')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }, 0);
        }
    }, []);

    useEffect(() => {
        const refreshCart = () => setCartSummary(getCartSummary());

        refreshCart();
        window.addEventListener('storage', refreshCart);

        return () => window.removeEventListener('storage', refreshCart);
    }, []);

    useEffect(() => {
        const tick = () => {
            setTimeLeft(
                dealEndsAt
                    ? formatCountdown(Math.max(0, dealEndsAt - Date.now()))
                    : '',
            );
        };

        const resync = window.setTimeout(tick, 0);
        const interval = dealEndsAt
            ? window.setInterval(tick, 1000)
            : undefined;

        return () => {
            window.clearTimeout(resync);

            if (interval) {
                window.clearInterval(interval);
            }
        };
    }, [dealEndsAt]);

    function showNotice(type: 'success' | 'error', message: string) {
        setNotice({ type, message });
        window.setTimeout(() => setNotice(null), 2400);
    }

    function selectCategory(category: Category) {
        setSelectedCategorySlug(category.slug);
        setIsShowingAllProducts(false);
        setSubmittedSearchQuery('');
        setSearchQuery('');
        setShowCategoryDropdown(false);
        document.getElementById('category-products')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }

    function showAllProducts() {
        setSelectedCategorySlug(null);
        setIsShowingAllProducts(true);
        setSubmittedSearchQuery('');
        setSearchQuery('');
        document.getElementById('category-products')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }

    function searchShop(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSelectedCategorySlug(null);
        setIsShowingAllProducts(false);
        setSubmittedSearchQuery(searchQuery);
        document.getElementById('category-products')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }

    return (
        <>
            <Head title="Scented Muse Online Shop" />
            <main className="min-h-screen bg-[#fff7f2] text-[#17131f]">
                {notice && <FeedbackModal {...notice} />}
                <header className="sticky top-0 z-40 bg-white shadow-sm shadow-[#3b2147]/5">
                    <div className="mx-auto flex max-w-[1540px] items-center gap-2 px-3 py-2 lg:gap-6 lg:px-8 lg:py-5">
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="flex size-8 shrink-0 items-center justify-center rounded-md text-[#17131f] lg:hidden"
                            aria-label="Open menu"
                        >
                            <Menu className="size-5" />
                        </button>
                        <Link
                            href="/"
                            className="flex min-w-fit items-center gap-2 lg:gap-3"
                        >
                            <span className="flex h-8 w-16 items-center justify-center overflow-visible border-0 bg-transparent sm:h-12 sm:w-24 lg:h-14 lg:w-28">
                                <img
                                    src="/logo.png"
                                    alt="Scented Muse logo"
                                    className="h-full w-full object-contain object-center"
                                />
                            </span>
                            <span className="hidden sm:block">
                                <span className="block text-2xl leading-6 font-black text-[#3b2147]">
                                    Scented Muse
                                </span>
                                <span className="text-xs font-bold text-[#7f5f53]">
                                    perfumes, deodorants & body care
                                </span>
                            </span>
                        </Link>

                        <form
                            onSubmit={searchShop}
                            className="hidden h-12 flex-1 items-center rounded-full border border-[#d7dce5] bg-white px-5 lg:flex"
                        >
                            <label className="sr-only" htmlFor="desktop-search">
                                Search products
                            </label>
                            <input
                                id="desktop-search"
                                value={searchQuery}
                                onChange={(event) =>
                                    setSearchQuery(event.target.value)
                                }
                                className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-[#8b93a3]"
                                placeholder="I am shopping for perfume, deodorant, watches..."
                            />
                            <button
                                type="submit"
                                className="flex size-9 items-center justify-center rounded-full text-[#8b93a3] transition hover:bg-[#fff1ea] hover:text-[#e85d4f]"
                                aria-label="Search products"
                            >
                                <Search className="size-6" />
                            </button>
                        </form>

                        <div className="ml-auto flex items-center gap-2 text-sm text-[#6b7280] sm:gap-4">
                            {auth.user ? (
                                <>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                type="button"
                                                className="flex items-center gap-2 font-semibold text-[#3b2147]"
                                                aria-label="Open account menu"
                                            >
                                                <UserRound className="size-10 rounded-full border border-[#d7dce5] p-2.5 text-[#8b93a3]" />
                                                <span className="hidden max-w-28 truncate sm:inline">
                                                    {
                                                        auth.user.name.split(
                                                            ' ',
                                                        )[0]
                                                    }
                                                </span>
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            className="w-56"
                                            align="end"
                                        >
                                            <UserMenuContent
                                                user={auth.user as User}
                                            />
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </>
                            ) : (
                                <>
                                    <UserRound className="size-10 rounded-full border border-[#d7dce5] p-2.5 text-[#8b93a3]" />
                                    <Link
                                        href={login()}
                                        className="hidden hover:text-[#3b2147] sm:inline"
                                    >
                                        Login
                                    </Link>
                                    <span className="hidden h-6 w-px bg-[#d7dce5] sm:block" />
                                    <Link
                                        href={register()}
                                        className="hidden hover:text-[#3b2147] sm:inline"
                                    >
                                        Registration
                                    </Link>
                                </>
                            )}
                            <button
                                type="button"
                                onClick={() => router.visit('/cart')}
                                className="relative flex size-9 items-center justify-center rounded-full text-[#17131f] transition hover:text-[#e85d4f] sm:size-10 sm:bg-[#3b2147] sm:text-white"
                                aria-label="Open cart"
                            >
                                <ShoppingCart className="size-5" />
                                {cartSummary.count > 0 && (
                                    <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-[#e85d4f] text-xs font-black text-white">
                                        {cartSummary.count}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="px-3 pb-2 lg:hidden">
                        <form
                            onSubmit={searchShop}
                            className="flex h-10 items-center rounded-full bg-[#f1f1f3] px-4"
                        >
                            <label className="sr-only" htmlFor="mobile-search">
                                Search products
                            </label>
                            <input
                                id="mobile-search"
                                value={searchQuery}
                                onChange={(event) =>
                                    setSearchQuery(event.target.value)
                                }
                                className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-[#8b93a3]"
                                placeholder="Search Scented Muse products..."
                            />
                            <button
                                type="submit"
                                className="flex size-8 items-center justify-center rounded-full text-[#8b93a3] transition hover:bg-[#fff1ea] hover:text-[#e85d4f]"
                                aria-label="Search products"
                            >
                                <Search className="size-5" />
                            </button>
                        </form>
                    </div>
                </header>

                <nav className="relative hidden bg-[#3b2147] text-white lg:block">
                    <div className="mx-auto flex max-w-[1540px] items-center overflow-x-auto px-4 lg:px-8">
                        <button
                            type="button"
                            onClick={() => {
                                setShowCategoryDropdown((value) => !value);
                            }}
                            className="flex h-14 min-w-[250px] items-center justify-between bg-[#2a1833] px-5 text-left font-bold"
                        >
                            <span className="flex items-center gap-3">
                                <Grid3X3 className="size-5" />
                                Categories
                                <span className="text-sm font-semibold">
                                    (See All)
                                </span>
                            </span>
                            <ChevronDown className="size-5" />
                        </button>
                        {[
                            'Home',
                            'Flash Sale',
                            'All Categories',
                            'New Arrivals',
                            'Coupons',
                            'Contact',
                            'My Account',
                        ].map((item) =>
                            item === 'All Categories' ? (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={showAllProducts}
                                    className="flex h-14 min-w-fit items-center px-6 text-sm font-bold transition hover:bg-[#2a1833]"
                                >
                                    {item}
                                </button>
                            ) : (
                                <a
                                    key={item}
                                    href={
                                        item === 'Home'
                                            ? '#'
                                            : item === 'Flash Sale'
                                              ? '/flash-sale'
                                              : item === 'My Account'
                                                ? '/my-account'
                                                : `#${item.toLowerCase().replaceAll(' ', '-')}`
                                    }
                                    className="flex h-14 min-w-fit items-center px-6 text-sm font-bold transition hover:bg-[#2a1833]"
                                >
                                    {item}
                                </a>
                            ),
                        )}
                        <button
                            type="button"
                            onClick={() => router.visit('/cart')}
                            className="ml-auto hidden h-14 min-w-fit items-center gap-3 bg-[#e85d4f] px-6 font-bold xl:flex"
                        >
                            <ShoppingCart className="size-6" />
                            {formatPrice(cartSummary.total)}{' '}
                            <span className="font-semibold">
                                ({cartSummary.count} Items)
                            </span>
                        </button>
                    </div>
                    {showCategoryDropdown && (
                        <div className="absolute top-full left-4 z-40 w-[min(92vw,520px)] rounded-b-md bg-white p-3 text-[#17131f] shadow-2xl ring-1 ring-[#ead9d1] lg:left-8">
                            <div className="grid max-h-[420px] gap-2 overflow-y-auto sm:grid-cols-2">
                                {activeCategories.length > 0 ? (
                                    activeCategories.map((category) => (
                                        <button
                                            key={category.slug}
                                            type="button"
                                            onClick={() =>
                                                selectCategory(category)
                                            }
                                            className="flex items-center justify-between rounded-md px-4 py-3 text-left font-bold transition hover:bg-[#fff1ea] hover:text-[#e85d4f]"
                                        >
                                            <span>{category.name}</span>
                                            <span className="text-xs text-[#7f5f53]">
                                                {category.products_count ?? 0}
                                            </span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="rounded-md bg-[#fff7f2] p-4 text-sm text-[#7f5f53]">
                                        No categories have been added yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </nav>

                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <button
                            type="button"
                            className="absolute inset-0 bg-[#17131f]/55"
                            aria-label="Close menu"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <section className="relative left-0 flex h-full w-[min(84vw,320px)] translate-x-0 flex-col bg-white shadow-2xl transition-transform duration-300">
                            <div className="flex items-center justify-between border-b border-[#ead9d1] p-4">
                                <Link
                                    href="/"
                                    className="flex items-center gap-3"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <span className="flex h-11 w-20 items-center justify-center overflow-visible border-0 bg-transparent">
                                        <img
                                            src="/logo.png"
                                            alt="Scented Muse logo"
                                            className="h-full w-full object-contain object-center"
                                        />
                                    </span>
                                    <span className="font-black text-[#3b2147]">
                                        Scented Muse
                                    </span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex size-10 items-center justify-center rounded-md bg-[#fff1ea] text-[#3b2147]"
                                    aria-label="Close menu"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>
                            <nav className="grid gap-1 p-3">
                                {[
                                    ['Home', '/'],
                                    ['Flash Sale', '/flash-sale'],
                                    ['All Categories', '#all-categories'],
                                    ['New Arrivals', '#new-arrivals'],
                                    ['Coupons', '#coupons'],
                                    ['Contact', '#contact'],
                                    ['My Account', '/my-account'],
                                ].map(([label, href]) =>
                                    label === 'All Categories' ? (
                                        <button
                                            key={label}
                                            type="button"
                                            onClick={() => {
                                                setIsMobileMenuOpen(false);
                                                showAllProducts();
                                            }}
                                            className="rounded-md px-4 py-3 text-left font-black text-[#3b2147] transition hover:bg-[#fff1ea] hover:text-[#e85d4f]"
                                        >
                                            {label}
                                        </button>
                                    ) : (
                                        <a
                                            key={label}
                                            href={href}
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                            className="rounded-md px-4 py-3 font-black text-[#3b2147] transition hover:bg-[#fff1ea] hover:text-[#e85d4f]"
                                        >
                                            {label}
                                        </a>
                                    ),
                                )}
                            </nav>
                        </section>
                    </div>
                )}

                <section className="mx-auto max-w-[1540px] px-2 py-3 sm:px-4 lg:px-8 lg:py-7">
                    <div>
                        <div className="relative hidden h-[300px] overflow-hidden rounded-md bg-[#f5e5dc] sm:h-[340px] lg:block lg:h-[392px]">
                            <HeroSlideshow slides={heroSlides} />
                        </div>
                    </div>

                    {activeDealProducts.length > 0 && (
                        <section
                            id="flash-sale"
                            className="mt-5 scroll-mt-32 overflow-hidden rounded-md bg-[#fff1ea] shadow-sm ring-1 ring-[#f0d7ca]"
                        >
                            <div className="grid gap-2 px-4 py-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                                <div className="flex items-center justify-center gap-2 sm:justify-start">
                                    <h2 className="text-lg font-black sm:text-xl">
                                        Todays Deal
                                    </h2>
                                    <span className="rounded-sm bg-[#e85d4f] px-2 py-1 text-xs font-bold text-white">
                                        Hot
                                    </span>
                                </div>
                                {timeLeft && (
                                    <p className="text-center text-sm font-black text-[#3b2147] sm:text-lg">
                                        Time Left: {timeLeft}
                                    </p>
                                )}
                                <Link
                                    href="/flash-sale"
                                    className="text-center text-sm font-black text-[#e85d4f] hover:text-[#3b2147] sm:text-right"
                                >
                                    View All
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 gap-2 border-t border-[#f0d7ca] bg-white p-2 sm:grid-cols-3 lg:grid-cols-6">
                                {activeDealProducts.map((product) => (
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
                                        <div className="mt-1">
                                            <p className="text-xs font-black text-[#3b2147] transition group-hover:text-[#e85d4f]">
                                                {formatPrice(
                                                    getDisplayPrice(product),
                                                )}
                                            </p>
                                            {getOriginalPrice(product) ? (
                                                <p className="mt-0.5 text-[11px] text-[#7f5f53] line-through">
                                                    {formatPrice(
                                                        getOriginalPrice(
                                                            product,
                                                        ) ?? 0,
                                                    )}
                                                </p>
                                            ) : null}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </section>

                {submittedSearchQuery.trim() ? (
                    <ProductShelf
                        id="category-products"
                        title={`Search results for "${submittedSearchQuery.trim()}"`}
                        products={searchProducts}
                        emptyMessage="No products matched your search. Try searching by product name or category."
                        onNotify={showNotice}
                    />
                ) : isShowingAllProducts ? (
                    <ProductShelf
                        id="category-products"
                        title="All Products"
                        products={activeProducts}
                        emptyMessage="No products are available at the moment."
                        onNotify={showNotice}
                    />
                ) : selectedCategory ? (
                    <ProductShelf
                        id="category-products"
                        title={selectedCategory.name}
                        products={selectedCategoryProducts}
                        fallbackProducts={featuredProducts}
                        emptyMessage="The product category is not available at the moment but you may also like the following products"
                        onNotify={showNotice}
                    />
                ) : (
                    <ProductShelf
                        id="category-products"
                        title="Featured Products"
                        products={featuredProducts}
                        onNotify={showNotice}
                    />
                )}
                <ProductShelf
                    title="Best Selling"
                    products={bestSellingProducts}
                    onNotify={showNotice}
                />
                <ProductShelf
                    id="new-arrivals"
                    title="New Arrivals"
                    products={newArrivalProducts}
                    onNotify={showNotice}
                />

                {auth.user && (
                    <ProductShelf
                        title="Recently Viewed"
                        products={recentlyViewedProducts}
                        emptyMessage="Products you view will appear here."
                        onNotify={showNotice}
                    />
                )}

                <section className="mx-auto grid max-w-[1540px] gap-6 px-4 py-3 lg:grid-cols-3 lg:px-8">
                    {activeCategories.slice(0, 3).map((category) => (
                        <div
                            key={category.slug}
                            className="relative h-44 overflow-hidden rounded-md bg-[#3b2147] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#3b2147]/15"
                        >
                            <div className="absolute inset-0 bg-[#3b2147]/55" />
                            <div className="relative flex h-full flex-col justify-center px-8 text-white">
                                <p className="text-sm font-bold uppercase">
                                    Scented Muse
                                </p>
                                <h3 className="mt-1 text-2xl font-black">
                                    {category.name}
                                </h3>
                                <p className="mt-2 text-sm font-semibold">
                                    {category.products_count ?? 0} products
                                    posted by admin
                                </p>
                            </div>
                        </div>
                    ))}
                </section>

                <section
                    id="coupons"
                    className="mx-auto max-w-[1540px] scroll-mt-32 px-3 py-4 sm:px-4 lg:px-8"
                >
                    <div className="grid gap-4 rounded-md bg-[#3b2147] p-5 text-white shadow-sm sm:grid-cols-[1fr_auto] sm:items-center sm:p-7">
                        <div className="min-w-0">
                            <p className="text-sm font-black tracking-[0.18em] text-[#f0b36a] uppercase">
                                Coupons
                            </p>
                            <h2 className="mt-2 text-2xl font-black">
                                Scented Muse comfort deals
                            </h2>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                                Coupon codes and seasonal offers will appear
                                here when the admin activates them.
                            </p>
                        </div>
                        <span className="w-fit rounded-md bg-white px-5 py-3 font-black text-[#3b2147]">
                            HOD-SOFT-LIVING
                        </span>
                    </div>
                </section>

                <footer
                    id="contact"
                    className="mt-10 scroll-mt-32 bg-[#17131f] text-white"
                >
                    <div className="mx-auto grid max-w-[1540px] gap-8 px-4 py-10 sm:gap-10 sm:py-12 md:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_0.8fr] lg:px-8">
                        <div className="min-w-0 md:col-span-2 lg:col-span-1">
                            <div className="flex min-w-0 flex-wrap items-center gap-3">
                                <span className="flex h-12 w-24 shrink-0 items-center justify-center overflow-visible border-0 bg-transparent sm:h-14 sm:w-28">
                                    <img
                                        src="/logo.png"
                                        alt="Scented Muse logo"
                                        className="h-full w-full object-contain object-center"
                                    />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-xl font-black break-words text-[#f0b36a] sm:text-2xl">
                                        Scented Muse
                                    </p>
                                    <p className="text-sm leading-5 font-bold break-words">
                                        perfumes, deodorants & body care
                                    </p>
                                </div>
                            </div>
                            <p className="mt-6 max-w-3xl text-sm leading-7 break-words text-[#a8afbd] sm:mt-7 sm:text-base">
                                Scented Muse is an online shop for perfumes,
                                deodorants, watches, body wash, body spray and
                                body splash. Products are posted and managed by
                                the admin so shoppers always see the current
                                collection.
                            </p>
                            <div className="mt-7 flex max-w-3xl flex-col gap-3 sm:flex-row sm:gap-5">
                                <input
                                    className="h-12 min-w-0 flex-1 border border-[#6f7480] bg-transparent px-4 text-sm outline-none sm:px-5"
                                    placeholder="Your Email Address"
                                />
                                <button className="h-12 shrink-0 bg-[#e85d4f] px-6 text-sm font-bold transition hover:bg-[#f0b36a] hover:text-[#17131f] sm:px-10 md:px-12">
                                    Subscribe
                                </button>
                            </div>
                        </div>

                        <div className="min-w-0">
                            <h3 className="font-black text-[#a8afbd]">
                                MY ACCOUNT
                            </h3>
                            <div className="mt-5 grid gap-3 text-sm font-semibold">
                                <Link href={login()}>Login</Link>
                                <a href="#">Order History</a>
                                {auth.user && (
                                    <Link href="/my-orders">My Orders</Link>
                                )}
                                <a href="#">My Wishlist</a>
                                <a href="#">Track Order</a>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-black text-[#a8afbd]">
                                FOLLOW US
                            </h3>
                            <div className="mt-5 flex max-w-full flex-wrap gap-3">
                                {shopSettings?.whatsapp_url && (
                                    <SocialLink
                                        href={shopSettings.whatsapp_url}
                                        label="WhatsApp"
                                        className="bg-[#25d366] text-white shadow-[#25d366]/25 hover:bg-[#1ebe57]"
                                    >
                                        <WhatsAppIcon className="size-5" />
                                    </SocialLink>
                                )}
                                {shopSettings?.tiktok_url && (
                                    <SocialLink
                                        href={shopSettings.tiktok_url}
                                        label="TikTok"
                                        className="bg-white text-[#111827] shadow-white/10 hover:bg-[#ff2d55] hover:text-white"
                                    >
                                        <Music2 className="size-5" />
                                    </SocialLink>
                                )}
                                {shopSettings?.facebook_url && (
                                    <SocialLink
                                        href={shopSettings.facebook_url}
                                        label="Facebook"
                                        className="bg-[#1877f2] text-white shadow-[#1877f2]/25 hover:bg-[#0f5ec7]"
                                    >
                                        <Facebook className="size-5" />
                                    </SocialLink>
                                )}
                            </div>
                            <h3 className="mt-8 font-black text-[#a8afbd]">
                                CONTACTS
                            </h3>
                            <p className="mt-4 max-w-full text-sm leading-6 break-words text-[#a8afbd]">
                                {shopSettings?.shop_location ||
                                    'Online Ecommerce Shopping'}
                            </p>
                            <p className="mt-2 max-w-full text-sm leading-6 font-semibold break-words">
                                {shopSettings?.shop_phone || '+254 700 000 000'}
                            </p>
                        </div>
                    </div>
                    <div className="bg-[#100d17] px-4 py-7 text-center text-sm font-semibold lg:px-8">
                        © 2026 Scented Muse Online Shop
                    </div>
                </footer>

                {shopSettings?.whatsapp_url && (
                    <a
                        href={shopSettings.whatsapp_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="fixed bottom-4 left-4 z-30 hidden size-12 items-center justify-center rounded-full bg-[#25d366] text-white shadow-2xl shadow-[#25d366]/30 ring-4 ring-white/80 transition hover:-translate-y-1 hover:scale-105 hover:bg-[#1ebe57] sm:bottom-6 sm:left-6 sm:flex sm:size-16"
                        aria-label="Chat with us on WhatsApp"
                    >
                        <WhatsAppIcon className="size-6 sm:size-8" />
                    </a>
                )}

                <button
                    type="button"
                    onClick={() => router.visit('/cart')}
                    className="fixed right-4 bottom-4 z-30 hidden size-12 items-center justify-center rounded-full bg-[#3b2147] text-white shadow-2xl shadow-[#3b2147]/25 transition hover:-translate-y-1 hover:bg-[#e85d4f] sm:right-6 sm:bottom-6 sm:flex sm:size-16"
                    aria-label="Open cart"
                >
                    <ShoppingCart className="size-5 sm:size-7" />
                    <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-[#e85d4f] text-xs font-bold sm:size-6">
                        {cartSummary.count}
                    </span>
                </button>
            </main>
        </>
    );
}

function SocialLink({
    href,
    label,
    className,
    children,
}: {
    href: string;
    label: string;
    className: string;
    children: ReactNode;
}) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className={`flex size-10 shrink-0 items-center justify-center rounded-full shadow-xl ring-1 ring-white/15 transition hover:-translate-y-1 hover:scale-105 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none sm:size-11 ${className}`}
        >
            {children}
        </a>
    );
}

function ProductShelf({
    id,
    title,
    products,
    fallbackProducts = [],
    emptyMessage = 'No products have been posted by the admin yet.',
    onNotify,
}: {
    id?: string;
    title: string;
    products: Product[];
    fallbackProducts?: Product[];
    emptyMessage?: string;
    onNotify?: (type: 'success' | 'error', message: string) => void;
}) {
    const visibleProducts = products.length > 0 ? products : fallbackProducts;

    return (
        <section
            id={
                id ??
                (title === 'Featured Products'
                    ? 'featured-products'
                    : 'best-selling')
            }
            className="mx-auto my-3 max-w-[1540px] px-2 sm:my-9 sm:px-4 lg:px-8"
        >
            <div className="rounded-md bg-white px-2 py-3 shadow-sm sm:border sm:border-[#ead9d1] sm:px-9 sm:py-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold sm:text-2xl sm:font-black">
                        {title}
                    </h2>
                    <div className="hidden gap-7 text-[#9aa2b1] sm:flex">
                        <ChevronLeft className="size-7" />
                        <ChevronRight className="size-7 text-[#657084]" />
                    </div>
                    <a
                        href="#featured-products"
                        className="text-xs font-black text-[#17131f] sm:hidden"
                    >
                        See All
                    </a>
                </div>
                {products.length === 0 && fallbackProducts.length > 0 && (
                    <div className="mt-8 rounded-md bg-[#fff7f2] p-5 text-center font-semibold text-[#7f5f53]">
                        {emptyMessage}
                    </div>
                )}
                {visibleProducts.length > 0 ? (
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-6">
                        {visibleProducts.map((product) => (
                            <ProductCard
                                key={`${title}-${product.slug}`}
                                product={product}
                                title={title}
                                onNotify={onNotify}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="mt-8 rounded-md bg-[#fff7f2] p-8 text-center text-[#7f5f53]">
                        {emptyMessage}
                    </div>
                )}
            </div>
        </section>
    );
}

function ProductCard({
    product,
    title,
    onNotify,
}: {
    product: Product;
    title: string;
    onNotify?: (type: 'success' | 'error', message: string) => void;
}) {
    const isOutOfStock = product.stock_quantity <= 0;

    return (
        <Link
            key={`${title}-${product.slug}`}
            href={`/products/${product.slug}`}
            className={`group relative rounded-md bg-white p-2 text-center shadow-sm transition duration-300 hover:-translate-y-2 hover:bg-[#fff7f2] hover:shadow-2xl hover:ring-1 hover:shadow-[#3b2147]/10 hover:ring-[#ead9d1] sm:px-3 sm:pt-3 sm:pb-2 ${
                isOutOfStock ? 'opacity-80' : ''
            }`}
        >
            {isOutOfStock ? (
                <span className="absolute top-2 right-2 z-10 rounded-sm bg-[#d71920] px-1.5 py-0.5 text-[10px] font-black text-white sm:top-4 sm:right-auto sm:left-4 sm:px-2 sm:py-1 sm:text-xs">
                    Out of stock
                </span>
            ) : product.discount_percentage ? (
                <span className="absolute top-2 right-2 z-10 rounded-sm bg-[#fff1ea] px-1.5 py-0.5 text-[10px] font-black text-[#e85d4f] sm:top-4 sm:right-auto sm:left-4 sm:bg-[#e85d4f] sm:px-2 sm:py-1 sm:text-xs sm:text-white">
                    -{product.discount_percentage}%
                </span>
            ) : product.is_flash_sale_active ? (
                <span className="absolute top-2 right-2 z-10 rounded-sm bg-[#3b2147] px-1.5 py-0.5 text-[10px] font-black text-white sm:top-4 sm:right-auto sm:left-4 sm:px-2 sm:py-1 sm:text-xs">
                    Flash
                </span>
            ) : null}
            <div className="absolute top-4 right-4 z-10 hidden translate-y-2 gap-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:flex">
                <button
                    type="button"
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        saveProductAction('hod_wishlist', product);
                        onNotify?.(
                            'success',
                            `${product.name} added to wishlist.`,
                        );
                    }}
                    className="flex size-10 items-center justify-center rounded-full bg-white text-[#e85d4f] shadow-lg ring-1 ring-[#ead9d1] transition hover:bg-[#e85d4f] hover:text-white"
                    aria-label={`Add ${product.name} to wishlist`}
                >
                    <Heart className="size-5" />
                </button>
            </div>
            <div className="flex h-28 items-center justify-center sm:h-52 sm:border-b sm:border-[#d7c4bd]">
                {product.photo_url ? (
                    <img
                        src={product.photo_url}
                        alt={product.name}
                        className="max-h-24 w-full object-contain transition duration-300 group-hover:scale-[1.08] sm:max-h-48"
                    />
                ) : (
                    <span className="flex h-32 w-full items-center justify-center rounded-md bg-[#fff7f2] text-sm text-[#7f5f53]">
                        No image uploaded
                    </span>
                )}
            </div>
            <p className="mt-2 min-h-9 text-[11px] leading-4 text-[#252b36] sm:mt-2 sm:min-h-8 sm:text-[13px] sm:leading-4">
                {truncate(product.name)}
            </p>
            <p className="mt-1 text-xs font-black text-[#3b2147] transition group-hover:text-[#e85d4f] sm:text-[15px]">
                {formatPrice(getDisplayPrice(product))}
            </p>
            {getOriginalPrice(product) ? (
                <div className="mt-1 grid gap-0.5 text-xs">
                    <span className="flex items-center justify-center gap-1 text-[#7f5f53] line-through">
                        <Tags className="size-3.5" />
                        {formatPrice(getOriginalPrice(product) ?? 0)}
                    </span>
                    <span className="flex items-center justify-center gap-1 font-black text-[#e85d4f]">
                        <CreditCard className="size-3.5" />
                        Now {formatPrice(getDisplayPrice(product))}
                    </span>
                </div>
            ) : null}
            <div className="mt-2 hidden translate-y-1 gap-1.5 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:group-hover:grid">
                <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        if (isOutOfStock) {
                            onNotify?.(
                                'error',
                                `${product.name} is out of stock.`,
                            );

                            return;
                        }

                        router.visit(`/products/${product.slug}`);
                    }}
                    className={`flex h-10 items-center justify-center gap-2 rounded-md text-sm font-black text-white transition ${
                        isOutOfStock
                            ? 'cursor-not-allowed bg-[#d71920]/80 lg:hover:bg-[#d71920] lg:hover:shadow-lg lg:hover:shadow-[#d71920]/30'
                            : 'bg-[#e85d4f] hover:bg-[#3b2147]'
                    }`}
                >
                    <ShoppingCart className="size-4" />
                    {isOutOfStock ? 'Out of stock' : 'Add to cart'}
                </button>
                <span className="text-sm font-black text-[#3b2147]">
                    View details
                </span>
            </div>
        </Link>
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

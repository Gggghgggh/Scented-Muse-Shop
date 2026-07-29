import { Link, router, usePage } from '@inertiajs/react';
import { Menu, Search, ShoppingCart, UserRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { getCartSummary } from '@/lib/shop-storage';
import { login, register } from '@/routes';
import type { User } from '@/types';

const customerLinks = [
    ['Home', '/'],
    ['Flash Sale', '/flash-sale'],
    ['All Categories', '/?show=all-products'],
    ['New Arrivals', '/#new-arrivals'],
    ['Coupons', '/#coupons'],
    ['Contact', '/#contact'],
    ['My Account', '/my-account'],
] as const;

export function CustomerNavbar() {
    const { auth } = usePage().props as unknown as {
        auth: { user?: User | null };
    };
    const [cartSummary, setCartSummary] = useState({ count: 0, total: 0 });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const refreshCart = () => setCartSummary(getCartSummary());

        refreshCart();
        window.addEventListener('storage', refreshCart);
        window.addEventListener('hod-cart-updated', refreshCart);

        return () => {
            window.removeEventListener('storage', refreshCart);
            window.removeEventListener('hod-cart-updated', refreshCart);
        };
    }, []);

    function searchShop(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const term = searchQuery.trim();

        router.visit(term ? `/?search=${encodeURIComponent(term)}` : '/');
    }

    return (
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
                    <label
                        className="sr-only"
                        htmlFor="customer-desktop-search"
                    >
                        Search products
                    </label>
                    <input
                        id="customer-desktop-search"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-[#8b93a3]"
                        placeholder="Search Scented Muse products..."
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
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="flex items-center gap-2 font-semibold text-[#3b2147]"
                                    aria-label="Open account menu"
                                >
                                    <UserRound className="size-10 rounded-full border border-[#d7dce5] p-2.5 text-[#8b93a3]" />
                                    <span className="hidden max-w-28 truncate sm:inline">
                                        {auth.user.name.split(' ')[0]}
                                    </span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <UserMenuContent user={auth.user as User} />
                            </DropdownMenuContent>
                        </DropdownMenu>
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
                            <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-[#e85d4f] text-xs font-black">
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
                    <label className="sr-only" htmlFor="customer-mobile-search">
                        Search products
                    </label>
                    <input
                        id="customer-mobile-search"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
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
            <nav className="hidden bg-[#3b2147] text-white lg:block">
                <div className="mx-auto flex max-w-[1540px] items-center overflow-x-auto px-4 lg:px-8">
                    {customerLinks.map(([label, href]) => (
                        <Link
                            key={label}
                            href={href}
                            className="flex h-12 min-w-fit items-center px-5 text-sm font-bold transition hover:bg-[#2a1833]"
                        >
                            {label}
                        </Link>
                    ))}
                </div>
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
                            {customerLinks.map(([label, href]) => (
                                <Link
                                    key={label}
                                    href={href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="rounded-md px-4 py-3 font-black text-[#3b2147] transition hover:bg-[#fff1ea] hover:text-[#e85d4f]"
                                >
                                    {label}
                                </Link>
                            ))}
                        </nav>
                    </section>
                </div>
            )}
        </header>
    );
}

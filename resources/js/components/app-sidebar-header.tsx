import { router, usePage } from '@inertiajs/react';
import { Bell, Search, UserRound } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import type { User } from '@/types';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth } = usePage().props as unknown as {
        auth: { user: User };
    };
    const currentTitle = breadcrumbs.at(-1)?.title ?? 'Dashboard';
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 4);

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const searchableAdminRoutes = [
        {
            href: '/admin/products',
            keywords: ['product', 'products', 'catalog', 'stock', 'brand', 'size', 'color'],
        },
        {
            href: '/admin/categories',
            keywords: ['category', 'categories'],
        },
        {
            href: '/admin/orders',
            keywords: ['order', 'orders', 'delivery', 'status'],
        },
        {
            href: '/admin/delivery-rates',
            keywords: ['delivery', 'rates', 'prices', 'locations', 'town', 'county', 'weight'],
        },
        {
            href: '/admin/payments',
            keywords: ['payment', 'payments', 'mpesa', 'm-pesa', 'card', 'cash'],
        },
        {
            href: '/admin/customers',
            keywords: ['customer', 'customers'],
        },
        {
            href: '/admin/users',
            keywords: ['user', 'users', 'admin', 'role'],
        },
    ];

    const resolveAdminSearchTarget = (query: string) => {
        const currentPath =
            typeof window === 'undefined' ? '/dashboard' : window.location.pathname;
        const normalizedQuery = query.toLowerCase();
        const matchedRoute = searchableAdminRoutes.find((route) =>
            route.keywords.some((keyword) => normalizedQuery.includes(keyword)),
        );
        const currentSearchableRoute = searchableAdminRoutes.find(
            (route) => route.href === currentPath,
        );

        return matchedRoute?.href ?? currentSearchableRoute?.href ?? '/admin/products';
    };

    const submitAdminSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const query = searchQuery.trim();

        if (!query) {
            return;
        }

        router.visit(
            `${resolveAdminSearchTarget(query)}?search=${encodeURIComponent(query)}`,
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <header
            className={`sticky top-0 z-50 flex min-h-16 shrink-0 items-center gap-3 border-b bg-white/95 px-4 backdrop-blur transition-[border-color,box-shadow,width,height] ease-linear md:px-6 ${
                isScrolled
                    ? 'border-hod-line shadow-[0_8px_24px_rgba(26,47,94,0.08)]'
                    : 'border-transparent shadow-none'
            }`}
        >
            <SidebarTrigger className="size-10 rounded-md border border-hod-line bg-white text-hod-navy shadow-sm transition hover:bg-hod-chip hover:text-hod-navy focus-visible:ring-2 focus-visible:ring-hod-red/60 focus-visible:ring-offset-2" />

            <div className="min-w-0 flex-1">
                <h1 className="truncate text-base leading-5 font-black text-hod-navy">
                    {currentTitle}
                </h1>
                {breadcrumbs.length > 1 && (
                    <div className="mt-0.5 hidden sm:block">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                )}
            </div>

            <form
                onSubmit={submitAdminSearch}
                className="hidden h-10 w-full max-w-xs items-center gap-2 rounded-md border border-hod-line bg-hod-surface px-3 transition focus-within:border-hod-red focus-within:ring-2 focus-within:ring-hod-red/15 lg:flex"
            >
                <Search className="size-4 shrink-0 text-hod-muted" />
                <span className="sr-only">Search admin</span>
                <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="h-full min-w-0 flex-1 bg-transparent text-sm text-hod-ink outline-none placeholder:text-hod-muted"
                    placeholder="Search products, orders, users..."
                />
            </form>

            <button
                type="button"
                className="relative flex size-10 items-center justify-center rounded-md border border-hod-line bg-white text-hod-navy shadow-sm transition hover:bg-hod-chip focus-visible:ring-2 focus-visible:ring-hod-red/60 focus-visible:ring-offset-2"
                aria-label="Notifications"
            >
                <Bell className="size-5" />
                <span className="absolute top-2 right-2 size-2 rounded-full bg-hod-red" />
            </button>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        className="flex h-10 items-center gap-2 rounded-md border border-hod-line bg-white px-2 text-sm font-semibold text-hod-navy shadow-sm transition hover:bg-hod-chip focus-visible:ring-2 focus-visible:ring-hod-red/60 focus-visible:ring-offset-2"
                        aria-label="Open account menu"
                    >
                        <UserRound className="size-5" />
                        <span className="hidden max-w-28 truncate sm:inline">
                            {auth.user.name.split(' ')[0]}
                        </span>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <UserMenuContent user={auth.user} />
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}

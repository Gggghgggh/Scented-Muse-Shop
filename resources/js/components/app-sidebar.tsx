import { Link, usePage } from '@inertiajs/react';
import {
    CreditCard,
    LayoutGrid,
    Package,
    Settings,
    Tags,
    Truck,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Products',
        href: '/admin/products',
        icon: Package,
    },
    {
        title: 'Categories',
        href: '/admin/categories',
        icon: Tags,
    },
    {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Customers',
        href: '/admin/customers',
        icon: Users,
    },
    {
        title: 'Orders',
        href: '/admin/orders',
        icon: Truck,
    },
    {
        title: 'Payments',
        href: '/admin/payments',
        icon: CreditCard,
    },
    {
        title: 'Shop Settings',
        href: '/admin/shop-settings',
        icon: Settings,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const navItems = auth.user.is_admin
        ? mainNavItems
        : mainNavItems.filter((item) => item.href === dashboard());

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="border-b border-hod-line p-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter className="border-t border-hod-line p-3">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

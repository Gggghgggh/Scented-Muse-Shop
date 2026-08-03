import { router, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { logout } from '@/routes';
import type { AppVariant } from '@/types';

type Props = {
    children: ReactNode;
    variant?: AppVariant;
};

export function AppShell({ children, variant = 'sidebar' }: Props) {
    const { auth, sidebarOpen: isOpen } = usePage().props;

    useIdleLogout(Boolean(auth.user));

    if (variant === 'header') {
        return (
            <div className="flex min-h-screen w-full flex-col">{children}</div>
        );
    }

    return <SidebarProvider defaultOpen={isOpen}>{children}</SidebarProvider>;
}

function useIdleLogout(isAuthenticated: boolean) {
    const timeoutRef = useRef<number | null>(null);
    const loggingOutRef = useRef(false);

    useEffect(() => {
        if (!isAuthenticated || typeof window === 'undefined') {
            return;
        }

        const idleLimitMs = 5 * 60 * 1000;
        const events = [
            'click',
            'keydown',
            'mousedown',
            'mousemove',
            'scroll',
            'touchstart',
        ];

        const clearIdleTimer = () => {
            if (timeoutRef.current !== null) {
                window.clearTimeout(timeoutRef.current);
            }
        };

        const logoutInactiveUser = () => {
            if (loggingOutRef.current) {
                return;
            }

            loggingOutRef.current = true;
            router.post(logout.url(), {}, { replace: true });
        };

        const resetIdleTimer = () => {
            clearIdleTimer();
            timeoutRef.current = window.setTimeout(
                logoutInactiveUser,
                idleLimitMs,
            );
        };

        events.forEach((eventName) => {
            window.addEventListener(eventName, resetIdleTimer, {
                passive: true,
            });
        });
        resetIdleTimer();

        return () => {
            clearIdleTimer();
            events.forEach((eventName) => {
                window.removeEventListener(eventName, resetIdleTimer);
            });
        };
    }, [isAuthenticated]);
}

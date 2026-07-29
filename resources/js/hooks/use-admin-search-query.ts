import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export function getInitialAdminSearchQuery() {
    if (typeof window === 'undefined') {
        return '';
    }

    return new URLSearchParams(window.location.search).get('search') ?? '';
}

export function useAdminServerSearch(url: string, only: string[]) {
    const [query, setQuery] = useState(getInitialAdminSearchQuery);
    const isFirstRun = useRef(true);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            router.get(url, query ? { search: query } : {}, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only,
            });
        }, 300);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    return [query, setQuery] as const;
}

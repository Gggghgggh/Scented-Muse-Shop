import { Link } from '@inertiajs/react';
import type { Paginated, PaginationLink } from '@/types/pagination';

export function AdminPagination<T>({
    pagination,
}: {
    pagination: Paginated<T>;
}) {
    if (pagination.last_page <= 1) {
        return null;
    }

    return (
        <div className="flex flex-col items-center justify-between gap-3 border-t pt-4 text-sm text-muted-foreground sm:flex-row">
            <p>
                Showing {pagination.from ?? 0}–{pagination.to ?? 0} of{' '}
                {pagination.total}
            </p>
            <div className="flex flex-wrap gap-1">
                {pagination.links.map((link, index) => (
                    <PaginationLinkItem key={index} link={link} />
                ))}
            </div>
        </div>
    );
}

function PaginationLinkItem({ link }: { link: PaginationLink }) {
    const label = link.label
        .replace('&laquo;', '«')
        .replace('&raquo;', '»');

    if (!link.url) {
        return (
            <span className="rounded-md px-3 py-1.5 text-muted-foreground/50">
                {label}
            </span>
        );
    }

    return (
        <Link
            href={link.url}
            preserveScroll
            preserveState
            className={`rounded-md border px-3 py-1.5 transition ${
                link.active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
            }`}
        >
            {label}
        </Link>
    );
}

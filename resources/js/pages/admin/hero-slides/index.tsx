import { Head, Link } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { AdminConfirmDialog } from '@/components/admin-confirm-dialog';
import { AdminPagination } from '@/components/admin-pagination';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { deleteAdminResource } from '@/lib/admin-actions';
import type { Paginated } from '@/types/pagination';

type HeroSlide = {
    id: number;
    image_url: string;
    eyebrow: string | null;
    heading: string | null;
    subheading: string | null;
    sort_order: number;
    is_active: boolean;
};

export default function HeroSlideIndex({
    heroSlides,
}: {
    heroSlides: Paginated<HeroSlide>;
}) {
    const [slideToDelete, setSlideToDelete] = useState<HeroSlide | null>(null);

    return (
        <>
            <Head title="Hero slides" />
            <AdminConfirmDialog
                open={Boolean(slideToDelete)}
                title="Delete hero slide?"
                description={
                    slideToDelete
                        ? `This will permanently delete this hero slide${slideToDelete.heading ? ` ("${slideToDelete.heading}")` : ''}.`
                        : ''
                }
                confirmLabel="Delete slide"
                onCancel={() => setSlideToDelete(null)}
                onConfirm={() => {
                    if (!slideToDelete) {
                        return;
                    }

                    deleteAdminResource(
                        `/admin/hero-slides/${slideToDelete.id}`,
                        {
                            onFinish: () => setSlideToDelete(null),
                        },
                    );
                }}
            />
            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-2xl font-semibold">Hero slides</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage the homepage banner. Add more than one image
                            to turn it into a slideshow that changes every 5
                            seconds.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/hero-slides/create">
                            <Plus className="size-4" />
                            New slide
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Slides</CardTitle>
                        <CardDescription>
                            Slides are shown in position order on the homepage.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="overflow-hidden rounded-md border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Image
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Text
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Position
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {heroSlides.data.map((slide) => (
                                        <tr key={slide.id}>
                                            <td className="px-4 py-3">
                                                <img
                                                    src={slide.image_url}
                                                    alt={
                                                        slide.heading ??
                                                        'Hero slide'
                                                    }
                                                    className="h-14 w-24 rounded-md border object-cover"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-xs font-semibold text-[#c7984a]">
                                                    {slide.eyebrow || '—'}
                                                </div>
                                                <div className="font-medium">
                                                    {slide.heading || '—'}
                                                </div>
                                                <div className="mt-1 max-w-sm truncate text-xs text-muted-foreground">
                                                    {slide.subheading || '—'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {slide.sort_order}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="rounded-md border px-2 py-1 text-xs">
                                                    {slide.is_active
                                                        ? 'Active'
                                                        : 'Hidden'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        size="icon"
                                                    >
                                                        <Link
                                                            href={`/admin/hero-slides/${slide.id}/edit`}
                                                            aria-label="Edit slide"
                                                        >
                                                            <Edit className="size-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() =>
                                                            setSlideToDelete(
                                                                slide,
                                                            )
                                                        }
                                                        aria-label="Delete slide"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {heroSlides.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-4 py-8 text-center text-muted-foreground"
                                            >
                                                No hero slides yet. The homepage
                                                will show the default banner
                                                until you add one.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <AdminPagination pagination={heroSlides} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

HeroSlideIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Hero Slides', href: '/admin/hero-slides' },
    ],
};

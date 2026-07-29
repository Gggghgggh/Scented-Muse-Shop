import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type HeroSlide = {
    id: number;
    image_url: string;
    eyebrow: string | null;
    heading: string | null;
    subheading: string | null;
    sort_order: number;
    is_active: boolean;
};

export default function HeroSlideEdit({ heroSlide }: { heroSlide: HeroSlide }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        image: null as File | null,
        eyebrow: heroSlide.eyebrow ?? '',
        heading: heroSlide.heading ?? '',
        subheading: heroSlide.subheading ?? '',
        sort_order: heroSlide.sort_order.toString(),
        is_active: heroSlide.is_active,
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post(`/admin/hero-slides/${heroSlide.id}`, { forceFormData: true });
    }

    return (
        <>
            <Head title="Edit hero slide" />
            <div className="max-w-3xl space-y-6 p-4 md:p-6">
                <Button asChild variant="ghost" className="px-0">
                    <Link href="/admin/hero-slides">
                        <ArrowLeft className="size-4" />
                        Back to hero slides
                    </Link>
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle>Edit hero slide</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-5">
                            <div className="rounded-md border p-3">
                                <img
                                    src={heroSlide.image_url}
                                    alt={heroSlide.heading ?? 'Hero slide'}
                                    className="h-40 w-full rounded-md object-cover"
                                />
                                <p className="mt-3 text-sm text-muted-foreground">
                                    Upload a new image below to replace the
                                    current one.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="image">Replace image</Label>
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) =>
                                        setData(
                                            'image',
                                            event.target.files?.[0] ?? null,
                                        )
                                    }
                                />
                                <InputError message={errors.image} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="eyebrow">Eyebrow text</Label>
                                <Input
                                    id="eyebrow"
                                    value={data.eyebrow}
                                    onChange={(event) =>
                                        setData('eyebrow', event.target.value)
                                    }
                                    placeholder="Curated by Scented Muse"
                                />
                                <InputError message={errors.eyebrow} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="heading">Heading</Label>
                                <Input
                                    id="heading"
                                    value={data.heading}
                                    onChange={(event) =>
                                        setData('heading', event.target.value)
                                    }
                                    placeholder="Soft living, sharp style."
                                />
                                <InputError message={errors.heading} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subheading">Subheading</Label>
                                <textarea
                                    id="subheading"
                                    value={data.subheading}
                                    onChange={(event) =>
                                        setData(
                                            'subheading',
                                            event.target.value,
                                        )
                                    }
                                    className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="Shop perfumes, deodorants, watches, body wash, body spray and body splash."
                                />
                                <InputError message={errors.subheading} />
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="sort_order">Position</Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        min="0"
                                        value={data.sort_order}
                                        onChange={(event) =>
                                            setData(
                                                'sort_order',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError message={errors.sort_order} />
                                    <p className="text-xs text-muted-foreground">
                                        Lower numbers show first.
                                    </p>
                                </div>

                                <label className="flex items-center gap-3 self-center text-sm font-medium">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(event) =>
                                            setData(
                                                'is_active',
                                                event.target.checked,
                                            )
                                        }
                                    />
                                    Active on homepage
                                </label>
                            </div>

                            <Button disabled={processing}>Save changes</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

HeroSlideEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Hero Slides', href: '/admin/hero-slides' },
        { title: 'Edit', href: '#' },
    ],
};

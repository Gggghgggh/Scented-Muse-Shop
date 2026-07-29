import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CategoryCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        description: '',
        is_active: true,
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post('/admin/categories');
    }

    return (
        <>
            <Head title="New category" />
            <div className="max-w-3xl space-y-6 p-4 md:p-6">
                <Button asChild variant="ghost" className="px-0">
                    <Link href="/admin/categories">
                        <ArrowLeft className="size-4" />
                        Back to categories
                    </Link>
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle>Create category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(event) =>
                                        setData('name', event.target.value)
                                    }
                                    placeholder="Shoes"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    value={data.slug}
                                    onChange={(event) =>
                                        setData('slug', event.target.value)
                                    }
                                    placeholder="Auto-generated if left blank"
                                />
                                <InputError message={errors.slug} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(event) =>
                                        setData(
                                            'description',
                                            event.target.value,
                                        )
                                    }
                                    className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                                <InputError message={errors.description} />
                            </div>

                            <label className="flex items-center gap-3 text-sm font-medium">
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
                                Active in admin product forms
                            </label>

                            <Button disabled={processing}>
                                Create category
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

CategoryCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Categories', href: '/admin/categories' },
        { title: 'Create', href: '/admin/categories/create' },
    ],
};

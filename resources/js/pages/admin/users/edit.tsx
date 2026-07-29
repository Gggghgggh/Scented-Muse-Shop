import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type User = { id: number; name: string; email: string; is_admin: boolean };

export default function UserEdit({ user }: { user: User }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        is_admin: user.is_admin,
    });

    return (
        <>
            <Head title={`Edit ${user.name}`} />
            <div className="max-w-2xl space-y-6 p-4 md:p-6">
                <Button asChild variant="ghost" className="px-0">
                    <Link href="/admin/users">
                        <ArrowLeft className="size-4" />
                        Back to users
                    </Link>
                </Button>
                <Card>
                    <CardHeader>
                        <CardTitle>Edit user</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                put(`/admin/users/${user.id}`);
                            }}
                            className="space-y-4"
                        >
                            <Field
                                label="Name"
                                value={data.name}
                                onChange={(value) => setData('name', value)}
                                error={errors.name}
                            />
                            <Field
                                label="Email"
                                type="email"
                                value={data.email}
                                onChange={(value) => setData('email', value)}
                                error={errors.email}
                            />
                            <Field
                                label="Password"
                                type="password"
                                value={data.password}
                                onChange={(value) => setData('password', value)}
                                error={errors.password}
                                placeholder="Leave blank to keep current password"
                            />
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={data.is_admin}
                                    onChange={(e) =>
                                        setData('is_admin', e.target.checked)
                                    }
                                />{' '}
                                Admin user
                            </label>
                            <Button disabled={processing}>Save user</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

UserEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Users', href: '/admin/users' },
    ],
};

function Field({
    label,
    value,
    onChange,
    error,
    type = 'text',
    placeholder = '',
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    type?: string;
    placeholder?: string;
}) {
    const id = label.toLowerCase();

    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
            />
            <InputError message={error} />
        </div>
    );
}

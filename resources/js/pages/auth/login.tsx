import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Log in" />

            <Form {...store.form()} resetOnSuccess={['password']}>
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="relative">
                                <Label
                                    htmlFor="email"
                                    className="absolute -top-2 left-4 bg-white px-1 text-sm font-bold text-[#e85d4f]"
                                >
                                    Email address*
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder=""
                                    className="h-14 rounded-md border-[#ead9d1] bg-[#fff7f2] px-5 text-base focus-visible:border-[#e85d4f] focus-visible:ring-[#e85d4f]"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="relative">
                                <div className="absolute -top-2 right-4 left-4 z-10 flex items-center justify-between bg-white px-1">
                                    <Label
                                        htmlFor="password"
                                        className="text-sm font-bold text-[#e85d4f]"
                                    >
                                        Password*
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-sm font-bold text-[#3b2147] hover:text-[#e85d4f]"
                                            tabIndex={5}
                                        >
                                            Forgot?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder=""
                                    className="h-14 rounded-md border-[#ead9d1] bg-[#fff7f2] px-5 text-base focus-visible:border-[#e85d4f] focus-visible:ring-[#e85d4f]"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-6 h-14 w-full rounded-md bg-[#e85d4f] text-lg font-black text-white shadow-lg shadow-[#e85d4f]/20 hover:bg-[#3b2147]"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Continue
                            </Button>
                        </div>

                        <div className="mt-7 text-center text-sm text-[#7f5f53]">
                            New to Scented Muse?{' '}
                            <TextLink
                                href={register()}
                                tabIndex={5}
                                className="font-black text-[#e85d4f]"
                            >
                                Sign up
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mt-4 text-center text-sm font-medium text-[#3b2147]">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Welcome back',
    description: 'Log in to continue shopping.',
};

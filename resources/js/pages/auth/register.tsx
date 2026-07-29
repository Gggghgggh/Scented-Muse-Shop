import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="relative">
                                <Label
                                    htmlFor="name"
                                    className="absolute -top-2 left-4 bg-white px-1 text-sm font-bold text-[#e85d4f]"
                                >
                                    Full name*
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder=""
                                    className="h-14 rounded-md border-[#ead9d1] bg-[#fff7f2] px-5 text-base focus-visible:border-[#e85d4f] focus-visible:ring-[#e85d4f]"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

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
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder=""
                                    className="h-14 rounded-md border-[#ead9d1] bg-[#fff7f2] px-5 text-base focus-visible:border-[#e85d4f] focus-visible:ring-[#e85d4f]"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="relative">
                                <Label
                                    htmlFor="password"
                                    className="absolute -top-2 left-4 z-10 bg-white px-1 text-sm font-bold text-[#e85d4f]"
                                >
                                    Password*
                                </Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder=""
                                    className="h-14 rounded-md border-[#ead9d1] bg-[#fff7f2] px-5 text-base focus-visible:border-[#e85d4f] focus-visible:ring-[#e85d4f]"
                                    passwordrules={passwordRules}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="relative">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="absolute -top-2 left-4 z-10 bg-white px-1 text-sm font-bold text-[#e85d4f]"
                                >
                                    Confirm password*
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder=""
                                    className="h-14 rounded-md border-[#ead9d1] bg-[#fff7f2] px-5 text-base focus-visible:border-[#e85d4f] focus-visible:ring-[#e85d4f]"
                                    passwordrules={passwordRules}
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-6 h-14 w-full rounded-md bg-[#e85d4f] text-lg font-black text-white shadow-lg shadow-[#e85d4f]/20 hover:bg-[#3b2147]"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Continue
                            </Button>
                        </div>

                        <div className="mt-7 text-center text-sm text-[#7f5f53]">
                            Already have an account?{' '}
                            <TextLink
                                href={login()}
                                tabIndex={6}
                                className="font-black text-[#e85d4f]"
                            >
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Create account',
    description: 'Sign up to start shopping.',
};

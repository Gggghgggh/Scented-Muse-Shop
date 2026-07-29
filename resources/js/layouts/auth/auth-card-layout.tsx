import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { home } from '@/routes';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    return (
        <main className="min-h-svh bg-white px-6 py-10 text-[#17131f]">
            <div className="mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-lg flex-col items-center justify-center">
                <Link href={home()} className="mb-8 block">
                    <span className="mx-auto flex h-20 w-44 items-center justify-center overflow-visible border-0 bg-transparent">
                        <img
                            src="/logo.png"
                            alt="Scented Muse logo"
                            className="h-full w-full object-contain object-center"
                        />
                    </span>
                </Link>

                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-black text-[#3b2147]">
                        {title}
                    </h1>
                    <p className="mt-3 text-base text-[#7f5f53]">
                        {description}
                    </p>
                </div>

                <div className="w-full">{children}</div>
            </div>
        </main>
    );
}

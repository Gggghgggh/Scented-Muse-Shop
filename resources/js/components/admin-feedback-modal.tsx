import { router } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { FlashToast } from '@/types/ui';

const titles = {
    success: 'Action completed',
    info: 'Notice',
    warning: 'Please check',
    error: 'Action could not be completed',
};

const icons = {
    success: CheckCircle2,
    info: Info,
    warning: AlertCircle,
    error: AlertCircle,
};

export function AdminFeedbackModal() {
    const [feedback, setFeedback] = useState<FlashToast | null>(null);

    useEffect(() => {
        const removeFlashListener = router.on('flash', (event) => {
            const flash = (event as CustomEvent).detail?.flash;
            const data = flash?.toast as FlashToast | undefined;

            if (data) {
                setFeedback({
                    type: data.type,
                    message:
                        data.message ||
                        'The action has been processed successfully.',
                });
            }
        });

        const showFeedback = (event: Event) => {
            const data = (event as CustomEvent<FlashToast>).detail;

            setFeedback({
                type: data.type,
                message:
                    data.message ||
                    'The action could not be completed. Please review and try again.',
            });
        };

        window.addEventListener('hod-admin-feedback', showFeedback);

        return () => {
            removeFlashListener();
            window.removeEventListener('hod-admin-feedback', showFeedback);
        };
    }, []);

    if (!feedback) {
        return null;
    }

    const Icon = icons[feedback.type];
    const isError = feedback.type === 'error' || feedback.type === 'warning';

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4">
            <section className="w-full max-w-md rounded-lg bg-white p-6 text-[#17131f] shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                    <div
                        className={`flex size-12 shrink-0 items-center justify-center rounded-full ${
                            isError
                                ? 'bg-[#fff1ea] text-[#d71920]'
                                : 'bg-[#fff7f2] text-[#3b2147]'
                        }`}
                    >
                        <Icon className="size-6" />
                    </div>
                    <button
                        type="button"
                        onClick={() => setFeedback(null)}
                        className="flex size-9 items-center justify-center rounded-md text-[#7f5f53] transition hover:bg-[#fff7f2] hover:text-[#3b2147]"
                        aria-label="Close feedback"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <h2 className="mt-5 text-xl font-black text-[#3b2147]">
                    {titles[feedback.type]}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#7f5f53]">
                    {feedback.message}
                </p>

                <Button
                    type="button"
                    onClick={() => setFeedback(null)}
                    className="mt-6 w-full"
                >
                    OK
                </Button>
            </section>
        </div>
    );
}

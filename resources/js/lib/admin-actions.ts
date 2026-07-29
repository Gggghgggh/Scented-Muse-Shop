import { router } from '@inertiajs/react';

function showAdminFeedback(type: 'success' | 'error', message: string) {
    window.dispatchEvent(
        new CustomEvent('hod-admin-feedback', {
            detail: { type, message },
        }),
    );
}

export function deleteAdminResource(
    url: string,
    options: {
        onFinish?: () => void;
        failureMessage?: string;
    } = {},
) {
    router.delete(url, {
        preserveScroll: true,
        onError: () => {
            showAdminFeedback(
                'error',
                options.failureMessage ??
                    'The selected item could not be deleted. Please check that it is not linked to active records and try again.',
            );
        },
        onFinish: options.onFinish,
    });
}

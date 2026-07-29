import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type AdminConfirmDialogProps = {
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    processing?: boolean;
    onCancel: () => void;
    onConfirm: () => void;
};

export function AdminConfirmDialog({
    open,
    title,
    description,
    confirmLabel = 'Confirm',
    processing = false,
    onCancel,
    onConfirm,
}: AdminConfirmDialogProps) {
    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => !nextOpen && onCancel()}
        >
            <DialogContent>
                <DialogHeader>
                    <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                        <AlertTriangle className="size-5" />
                    </div>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={processing}
                    >
                        {processing ? 'Working...' : confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

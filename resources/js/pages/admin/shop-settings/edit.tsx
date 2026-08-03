import { Head, useForm } from '@inertiajs/react';
import {
    Award,
    Facebook,
    MapPin,
    MessageCircle,
    Music2,
    Phone,
    Save,
} from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ShopSettings = {
    shop_location?: string | null;
    shop_phone?: string | null;
    whatsapp_number?: string | null;
    whatsapp_url?: string | null;
    tiktok_url?: string | null;
    facebook_url?: string | null;
    shopping_points_percentage?: string | number | null;
};

export default function ShopSettingsEdit({
    settings,
}: {
    settings: ShopSettings;
}) {
    const { data, setData, put, processing, errors } = useForm({
        shop_location: settings.shop_location ?? '',
        shop_phone: settings.shop_phone ?? '',
        whatsapp_number: settings.whatsapp_number ?? '',
        whatsapp_url: settings.whatsapp_url ?? '',
        tiktok_url: settings.tiktok_url ?? '',
        facebook_url: settings.facebook_url ?? '',
        shopping_points_percentage: String(
            settings.shopping_points_percentage ?? 10,
        ),
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        put('/admin/shop-settings', {
            preserveScroll: true,
            onError: () => {
                window.dispatchEvent(
                    new CustomEvent('hod-admin-feedback', {
                        detail: {
                            type: 'error',
                            message:
                                'Shop contact settings could not be saved. Please review the fields and try again.',
                        },
                    }),
                );
            },
        });
    }

    return (
        <>
            <Head title="Shop settings" />
            <div className="max-w-3xl space-y-6 p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Shop contact settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-5">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="shop_location"
                                    className="flex items-center gap-2"
                                >
                                    <MapPin className="size-4" />
                                    Shop location
                                </Label>
                                <Input
                                    id="shop_location"
                                    value={data.shop_location}
                                    onChange={(event) =>
                                        setData(
                                            'shop_location',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="RNG Plaza, Ronald Ngala Street"
                                />
                                <InputError message={errors.shop_location} />
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="shop_phone"
                                    className="flex items-center gap-2"
                                >
                                    <Phone className="size-4" />
                                    Shop phone number
                                </Label>
                                <Input
                                    id="shop_phone"
                                    value={data.shop_phone}
                                    onChange={(event) =>
                                        setData(
                                            'shop_phone',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="+254 700 000 000"
                                />
                                <InputError message={errors.shop_phone} />
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="whatsapp_number"
                                    className="flex items-center gap-2"
                                >
                                    <MessageCircle className="size-4" />
                                    WhatsApp help number
                                </Label>
                                <Input
                                    id="whatsapp_number"
                                    value={data.whatsapp_number}
                                    onChange={(event) =>
                                        setData(
                                            'whatsapp_number',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="+254 700 000 000"
                                />
                                <InputError message={errors.whatsapp_number} />
                                <p className="text-xs text-muted-foreground">
                                    Used by the WhatsApp help button on the
                                    homepage. Leave blank to hide the button.
                                </p>
                            </div>

                            <div className="grid gap-5 border-t pt-5 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="whatsapp_url"
                                        className="flex items-center gap-2"
                                    >
                                        <MessageCircle className="size-4" />
                                        WhatsApp link
                                    </Label>
                                    <Input
                                        id="whatsapp_url"
                                        type="url"
                                        value={data.whatsapp_url}
                                        onChange={(event) =>
                                            setData(
                                                'whatsapp_url',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="https://wa.me/254700000000"
                                    />
                                    <InputError message={errors.whatsapp_url} />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="tiktok_url"
                                        className="flex items-center gap-2"
                                    >
                                        <Music2 className="size-4" />
                                        TikTok link
                                    </Label>
                                    <Input
                                        id="tiktok_url"
                                        type="url"
                                        value={data.tiktok_url}
                                        onChange={(event) =>
                                            setData(
                                                'tiktok_url',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="https://www.tiktok.com/@scentedmuse"
                                    />
                                    <InputError message={errors.tiktok_url} />
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="facebook_url"
                                        className="flex items-center gap-2"
                                    >
                                        <Facebook className="size-4" />
                                        Facebook link
                                    </Label>
                                    <Input
                                        id="facebook_url"
                                        type="url"
                                        value={data.facebook_url}
                                        onChange={(event) =>
                                            setData(
                                                'facebook_url',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="https://www.facebook.com/scentedmuse"
                                    />
                                    <InputError message={errors.facebook_url} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="shopping_points_percentage"
                                    className="flex items-center gap-2"
                                >
                                    <Award className="size-4" />
                                    HOD shopping points percentage
                                </Label>
                                <Input
                                    id="shopping_points_percentage"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={data.shopping_points_percentage}
                                    onChange={(event) =>
                                        setData(
                                            'shopping_points_percentage',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="10"
                                />
                                <InputError
                                    message={errors.shopping_points_percentage}
                                />
                            </div>

                            <Button disabled={processing}>
                                <Save className="size-4" />
                                {processing ? 'Saving...' : 'Save settings'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ShopSettingsEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Shop settings', href: '/admin/shop-settings' },
    ],
};

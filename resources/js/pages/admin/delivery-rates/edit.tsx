import { Head, useForm } from '@inertiajs/react';
import { Save, Search, Truck } from 'lucide-react';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type DeliveryRate = {
    id: number;
    county: string;
    town: string;
    base_fee: string | number;
    fee_per_kg: string | number;
    is_active: boolean;
};

export default function DeliveryRatesEdit({ rates }: { rates: DeliveryRate[] }) {
    const [query, setQuery] = useState('');
    const { data, setData, put, processing, errors } = useForm({
        rates: rates.map((rate) => ({
            id: rate.id,
            county: rate.county,
            town: rate.town,
            base_fee: String(rate.base_fee),
            fee_per_kg: String(rate.fee_per_kg),
            is_active: Boolean(rate.is_active),
        })),
    });
    const visibleRates = useMemo(
        () =>
            data.rates.filter((rate) =>
                `${rate.county} ${rate.town}`
                    .toLowerCase()
                    .includes(query.toLowerCase()),
            ),
        [data.rates, query],
    );

    function updateRate(
        id: number,
        field: 'base_fee' | 'fee_per_kg' | 'is_active',
        value: string | boolean,
    ) {
        setData(
            'rates',
            data.rates.map((rate) =>
                rate.id === id ? { ...rate, [field]: value } : rate,
            ),
        );
    }

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        put('/admin/delivery-rates', { preserveScroll: true });
    }

    return (
        <>
            <Head title="Delivery prices" />
            <div className="space-y-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold">Delivery prices</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Set base delivery fees and extra per-kg charges for each location.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="size-5" />
                            Location rates
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <label className="flex h-10 max-w-xl items-center gap-2 rounded-md border px-3">
                                <Search className="size-4 text-muted-foreground" />
                                <Input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    className="h-full border-0 px-0 shadow-none focus-visible:ring-0"
                                    placeholder="Search county or town"
                                />
                            </label>
                            <div className="overflow-x-auto rounded-md border">
                                <table className="min-w-[760px] text-sm">
                                    <thead className="bg-muted text-muted-foreground">
                                        <tr>
                                            <th className="px-3 py-3 text-left">County</th>
                                            <th className="px-3 py-3 text-left">Town</th>
                                            <th className="px-3 py-3 text-left">Base fee</th>
                                            <th className="px-3 py-3 text-left">Fee per kg</th>
                                            <th className="px-3 py-3 text-left">Active</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {visibleRates.map((rate) => (
                                            <tr key={rate.id}>
                                                <td className="px-3 py-2 font-medium">{rate.county}</td>
                                                <td className="px-3 py-2">{rate.town}</td>
                                                <td className="px-3 py-2">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={rate.base_fee}
                                                        onChange={(event) =>
                                                            updateRate(rate.id, 'base_fee', event.target.value)
                                                        }
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={rate.fee_per_kg}
                                                        onChange={(event) =>
                                                            updateRate(rate.id, 'fee_per_kg', event.target.value)
                                                        }
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={rate.is_active}
                                                        onChange={(event) =>
                                                            updateRate(rate.id, 'is_active', event.target.checked)
                                                        }
                                                        className="size-4"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <InputError message={errors.rates} />
                            <Button disabled={processing}>
                                <Save className="size-4" />
                                {processing ? 'Saving...' : 'Save delivery prices'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

DeliveryRatesEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Delivery prices', href: '/admin/delivery-rates' },
    ],
};

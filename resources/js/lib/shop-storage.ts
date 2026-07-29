export type StoredCartItem = {
    id: number;
    name: string;
    slug: string;
    price: string | number;
    base_price?: string | number;
    flash_sale_price?: string | number | null;
    is_flash_sale?: boolean;
    is_flash_sale_active?: boolean;
    stock_quantity?: number;
    quantity?: number;
    size?: string;
    color?: string;
    sizes?: string[] | null;
    colors?: string[] | null;
    size_prices?: Record<string, string | number> | null;
    size_quantities?: Record<string, string | number> | null;
    flash_sale_size_quantities?: Record<string, string | number> | null;
    variants?:
        | {
              size: string;
              color?: string | null;
              price: string | number;
              flash_sale_price?: string | number | null;
              quantity: string | number;
              flash_sale_quantity?: string | number;
              photo_urls?: string[];
          }[]
        | null;
    photo_url?: string | null;
};

export type StoredOrder = {
    id: string;
    createdAt: string;
    county: string;
    town: string;
    items: StoredCartItem[];
    total: number;
};

export const getCartItems = () =>
    JSON.parse(localStorage.getItem('hod_cart') ?? '[]') as StoredCartItem[];

export const getCartSummary = () => {
    const items = getCartItems();

    return {
        count: items.reduce((sum, item) => sum + (item.quantity ?? 1), 0),
        total: items.reduce(
            (sum, item) => sum + Number(item.price) * (item.quantity ?? 1),
            0,
        ),
    };
};

export const getOrders = () =>
    JSON.parse(localStorage.getItem('hod_orders') ?? '[]') as StoredOrder[];

export const saveOrder = (order: StoredOrder) => {
    localStorage.setItem('hod_orders', JSON.stringify([order, ...getOrders()]));
};

export const downloadReceipt = (order: StoredOrder) => {
    const lines = [
        'SCENTED MUSE',
        'perfumes, deodorants & body care',
        '',
        `Receipt: ${order.id}`,
        `Date: ${new Date(order.createdAt).toLocaleString('en-KE')}`,
        '',
        'Items',
        ...order.items.map(
            (item) =>
                `${item.name} | Size: ${item.size || 'Default'} | Color: ${item.color || 'Default'} | Qty: ${item.quantity ?? 1} | ${Number(item.price) * (item.quantity ?? 1)}`,
        ),
        '',
        `Total: KSh ${order.total.toLocaleString('en-KE')}`,
        `Delivery address: ${order.town}, ${order.county}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${order.id}-receipt.txt`;
    link.click();
    URL.revokeObjectURL(url);
};

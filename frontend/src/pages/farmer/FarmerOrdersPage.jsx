import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders, updateOrderStatus } from '../../services/api';
export default function FarmerOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');
    async function load() { const result = await getOrders(); setOrders(result.items); }
    useEffect(() => { load().catch(() => setError('Unable to load orders')); }, []);
    async function advance(order) { const next = order.status === 'PENDING' ? 'CONFIRMED' : order.status === 'CONFIRMED' ? 'LOGISTICS_REQUESTED' : ''; if (!next)
        return; try {
        await updateOrderStatus(order.id, next);
        await load();
    }
    catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Unable to update order');
    } }
    return <main className="min-h-screen p-6 text-white"><div className="container max-w-4xl"><Link className="text-sm text-emerald-200" to="/dashboard/farmer">Dashboard</Link><h1 className="mt-6 text-4xl font-black">Customer orders</h1>{error && <p className="mt-4 text-rose-300" role="alert">{error}</p>}<div className="mt-6 space-y-3">{orders.map((order) => <article className="card flex flex-wrap items-center justify-between gap-4 p-5" key={order.id}><div><h2 className="font-semibold">Order #{order.id}</h2><p className="mt-1 text-sm text-emerald-50/65">{order.items?.map((item) => `${item.product_name} x${item.quantity}`).join(', ') || 'Produce order'} · ₹{order.total_amount.toFixed(2)}</p><p className="mt-2 text-sm text-emerald-200">{order.status}</p></div>{['PENDING', 'CONFIRMED'].includes(order.status) && <button className="btn-secondary" type="button" onClick={() => advance(order)}>{order.status === 'PENDING' ? 'Confirm order' : 'Request logistics'}</button>}</article>)}{orders.length === 0 && <p className="card p-6 text-emerald-50/65">No orders yet.</p>}</div></div></main>;
}

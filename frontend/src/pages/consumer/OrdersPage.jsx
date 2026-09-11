import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../../services/api';
export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    useEffect(() => { getOrders().then((result) => setOrders(result.items)).catch(() => undefined); }, []);
    return <main className="min-h-screen p-6 text-white"><div className="container max-w-3xl"><Link className="text-sm text-emerald-200" to="/dashboard/consumer">Dashboard</Link><h1 className="mt-6 text-4xl font-black">Your orders</h1><div className="mt-6 space-y-3">{orders.map((order) => <article className="card p-5" key={order.id}><Link className="block" to={`/orders/${order.id}/tracking`}><div className="flex justify-between gap-4"><span className="font-semibold">Order #{order.id}</span><span className="text-emerald-200">{order.status}</span></div><p className="mt-2 text-sm text-emerald-50/65">₹{order.total_amount.toFixed(2)}{order.created_at ? ` · ${new Date(order.created_at).toLocaleDateString()}` : ''}</p></Link>{order.items?.map((item) => <Link className="mt-3 inline-block text-sm text-emerald-200 underline" to={`/review?product=${item.product_id}&order=${order.id}`} key={item.product_id}>Review {item.product_name}</Link>)}</article>)}{orders.length === 0 && <p className="card p-6 text-emerald-50/65">No orders yet.</p>}</div></div></main>;
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminOrders } from '../../services/api';
export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    useEffect(() => { getAdminOrders().then((result) => setOrders(result.items)).catch(() => undefined); }, []);
    return <main className="min-h-screen p-6 text-white"><div className="container"><Link className="text-sm text-emerald-200" to="/dashboard/admin">Admin dashboard</Link><h1 className="mt-6 text-4xl font-black">Orders</h1><div className="mt-6 space-y-3">{orders.map((order) => <article className="card flex flex-wrap justify-between gap-4 p-5" key={order.id}><div><h2 className="font-semibold">Order #{order.id}</h2><p className="mt-1 text-sm text-emerald-50/65">Customer #{order.customer_id} · ₹{order.total_amount.toFixed(2)}</p></div><span className="text-emerald-200">{order.status}</span></article>)}{orders.length === 0 && <p className="text-emerald-50/65">No orders yet.</p>}</div></div></main>;
}

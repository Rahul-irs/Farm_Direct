import { Check, ChevronRight, Clock3, PackageCheck, RefreshCw, Trash2, Truck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteOrder, getOrders, updateOrderStatus } from '../../services/api';
import { getProductImage } from '../../utils/productImages';

const filters = ['ALL', 'PENDING', 'CONFIRMED', 'LOGISTICS_REQUESTED', 'DELIVERED', 'COMPLETED'];
const filterLabels = { ALL: 'All Orders', PENDING: 'Pending', CONFIRMED: 'Confirmed', LOGISTICS_REQUESTED: 'In Progress', DELIVERED: 'Delivered', COMPLETED: 'Completed' };
const statusLabels = { PENDING: 'Pending', PAID: 'Paid', CONFIRMED: 'Confirmed', LOGISTICS_REQUESTED: 'In Progress', DELIVERED: 'Delivered', COMPLETED: 'Completed', CANCELLED: 'Cancelled' };

function orderDate(value) {
    return value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent order';
}

export default function FarmerOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    async function load() {
        setLoading(true);
        setError('');
        try { const result = await getOrders(); setOrders(result.items || []); }
        catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to load orders'); }
        finally { setLoading(false); }
    }

    useEffect(() => { load(); }, []);

    async function advance(order) {
        const next = order.status === 'PENDING' || order.status === 'PAID' ? 'CONFIRMED' : order.status === 'CONFIRMED' ? 'LOGISTICS_REQUESTED' : '';
        if (!next) return;
        try {
            await updateOrderStatus(order.id, next);
            setMessage(next === 'CONFIRMED' ? `Order #${order.id} confirmed.` : `Order #${order.id} sent to logistics.`);
            await load();
        } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to update order'); }
    }

    async function remove(order) {
        if (!window.confirm(`Delete order #${order.id}?`)) return;
        try { await deleteOrder(order.id); setOrders((current) => current.filter((item) => item.id !== order.id)); setMessage(`Order #${order.id} deleted.`); }
        catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to delete order'); }
    }

    const visibleOrders = useMemo(() => filter === 'ALL' ? orders : orders.filter((order) => filter === 'PENDING' ? ['PENDING', 'PAID'].includes(order.status) : order.status === filter), [filter, orders]);
    const filterCount = (item) => item === 'ALL' ? orders.length : orders.filter((order) => item === 'PENDING' ? ['PENDING', 'PAID'].includes(order.status) : order.status === item).length;

    return <main className="farmer-orders-page farmer-orders-reference"><div className="farmer-orders-container">
        <header className="farmer-orders-reference-header"><h1>Orders</h1><button className="farmer-orders-refresh" type="button" onClick={load} disabled={loading}><RefreshCw size={15} className={loading ? 'farmer-spin' : ''} /> Refresh</button></header>
        {message && <p className="farmer-orders-notice" role="status"><Check size={15} /> {message}</p>}{error && <p className="farmer-orders-error" role="alert">{error}</p>}
        <div className="farmer-orders-reference-toolbar"><div className="farmer-order-filters" role="tablist" aria-label="Filter orders">{filters.map((item) => <button className={filter === item ? 'is-active' : ''} type="button" key={item} onClick={() => setFilter(item)}>{filterLabels[item]} <b>{filterCount(item)}</b></button>)}</div><span>{visibleOrders.length} orders</span></div>
        <section className="farmer-orders-reference-list">{visibleOrders.map((order) => { const item = order.items?.[0]; const status = statusLabels[order.status] || order.status; return <article className="farmer-order-reference-row" key={order.id}>
            <div className="farmer-order-reference-product"><img src={getProductImage({ name: item?.product_name })} alt="" /><div><strong>{item?.product_name || `Order #${order.id}`}</strong><span>{item ? `${item.quantity} units · Order #${order.id}` : `Order #${order.id}`}</span></div></div>
            <div className="farmer-order-reference-amount"><span>Total Amount</span><strong>₹{Number(order.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</strong></div>
            <div className="farmer-order-reference-date"><span>Order Date</span><strong>{orderDate(order.created_at)}</strong></div>
            <span className={`farmer-order-reference-status status-${order.status.toLowerCase()}`}><Clock3 size={12} />{status}</span>
            <div className="farmer-order-reference-actions">{(order.status === 'PENDING' || order.status === 'PAID') && <button type="button" className="farmer-order-reference-primary" onClick={() => advance(order)}><Check size={13} /> Accept Order</button>}{order.status === 'CONFIRMED' && <button type="button" className="farmer-order-reference-primary" onClick={() => advance(order)}><Truck size={13} /> Logistics</button>}{['LOGISTICS_REQUESTED', 'DELIVERED'].includes(order.status) && <Link className="farmer-order-reference-primary" to={`/farmer/orders/${order.id}/tracking`}><Truck size={13} /> Track</Link>}{order.status === 'PENDING' && <button type="button" className="farmer-order-reference-delete" onClick={() => remove(order)} aria-label={`Delete order ${order.id}`}><Trash2 size={14} /></button>}<ChevronRight size={15} className="farmer-order-reference-arrow" /></div>
        </article>; })}{loading && <p className="farmer-orders-empty">Loading orders...</p>}{!loading && visibleOrders.length === 0 && <div className="farmer-orders-empty"><PackageCheck size={27} /><h2>No orders in this view</h2><p>New customer orders will appear here.</p></div>}</section>
    </div></main>;
}

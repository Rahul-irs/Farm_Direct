import { ArrowLeft, ArrowUpRight, Check, Clock3, PackageCheck, RefreshCw, Trash2, Truck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteOrder, getOrders, updateOrderStatus } from '../../services/api';
import { getProductImage } from '../../utils/productImages';

const filters = ['ALL', 'PENDING', 'PAID', 'CONFIRMED', 'LOGISTICS_REQUESTED', 'COMPLETED', 'CANCELLED'];
const statusLabels = { PENDING: 'Needs review', PAID: 'Paid · needs review', CONFIRMED: 'Confirmed', LOGISTICS_REQUESTED: 'In delivery queue', COMPLETED: 'Completed', CANCELLED: 'Cancelled' };

export default function FarmerOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    async function load() {
        setLoading(true);
        try { const result = await getOrders(); setOrders(result.items || []); }
        catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to load orders'); }
        finally { setLoading(false); }
    }

    useEffect(() => { load(); }, []);

    async function advance(order) {
        const next = order.status === 'PENDING' || order.status === 'PAID' ? 'CONFIRMED' : order.status === 'CONFIRMED' ? 'LOGISTICS_REQUESTED' : '';
        if (!next) return;
        try { setError(''); await updateOrderStatus(order.id, next); setMessage(next === 'CONFIRMED' ? `Order #${order.id} confirmed and ready for fulfilment.` : `Order #${order.id} sent to logistics.`); await load(); }
        catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to update order'); }
    }

    async function remove(order) {
        if (!window.confirm(`Delete order #${order.id}? This removes it permanently from your workspace.`)) return;
        try { setError(''); await deleteOrder(order.id); setOrders((current) => current.filter((item) => item.id !== order.id)); setMessage(`Order #${order.id} deleted permanently.`); }
        catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to delete order'); }
    }

    const visibleOrders = useMemo(() => filter === 'ALL' ? orders : orders.filter((order) => order.status === filter), [filter, orders]);
    const pendingCount = orders.filter((order) => order.status === 'PENDING' || order.status === 'PAID').length;
    const totalValue = orders.reduce((total, order) => total + Number(order.total_amount || 0), 0);

    return <main className="farmer-orders-page"><div className="farmer-orders-container">
        <div className="farmer-orders-breadcrumb"><Link to="/dashboard/farmer"><ArrowLeft size={15}/> Back to overview</Link><span>ORDERS / FIELD DESK</span></div>
        <header className="farmer-orders-header"><div><p className="farmer-kicker">Your customer desk</p><h1>Orders that need you.</h1><p>Review payment, confirm what is ready, and send every fulfilled order into the logistics queue.</p></div><button className="farmer-orders-refresh" type="button" onClick={load} disabled={loading}><RefreshCw size={16} className={loading ? 'farmer-spin' : ''}/> Refresh</button></header>
        {message && <p className="farmer-orders-notice" role="status"><Check size={16}/>{message}</p>}{error && <p className="farmer-orders-error" role="alert">{error}</p>}
        <section className="farmer-orders-summary"><div><span>Orders in view</span><strong>{orders.length}</strong><small>all customer requests</small></div><div><span>Needs your attention</span><strong>{pendingCount}</strong><small>pending or paid orders</small></div><div><span>Order value</span><strong>₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong><small>across this workspace</small></div></section>
        <div className="farmer-orders-toolbar"><div className="farmer-order-filters" role="tablist" aria-label="Filter orders">{filters.map((item) => <button className={filter === item ? 'is-active' : ''} type="button" key={item} onClick={() => setFilter(item)}>{item === 'ALL' ? 'All orders' : statusLabels[item]}</button>)}</div><span>{visibleOrders.length} showing</span></div>
        <section className="farmer-order-list">{visibleOrders.map((order) => <article className="farmer-order-card" key={order.id}><div className="farmer-order-card-top"><div className="farmer-order-id"><span className={`farmer-order-status status-${order.status.toLowerCase()}`}><Clock3 size={13}/>{statusLabels[order.status] || order.status}</span><h2>Order <b>#{order.id}</b></h2><p>{order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent request'}</p></div><div className="farmer-order-value"><span>Total value</span><strong>₹{Number(order.total_amount || 0).toFixed(2)}</strong></div></div><div className="farmer-order-items">{order.items?.map((item) => <div className="farmer-order-item" key={item.id}><img src={getProductImage({ name: item.product_name })} alt=""/><div><strong>{item.product_name}</strong><span>{item.quantity} units · ₹{Number(item.unit_price || 0).toFixed(2)} each</span></div><b>₹{Number(item.subtotal || 0).toFixed(2)}</b></div>)}</div><div className="farmer-order-card-footer"><span className="farmer-order-route"><PackageCheck size={15}/> {order.items?.length || 0} product line{order.items?.length === 1 ? '' : 's'} <i>·</i> {order.status === 'PAID' ? 'payment received' : 'ready to review'}</span><div className="farmer-order-actions">{(order.status === 'PENDING' || order.status === 'PAID') && <button className="farmer-order-primary" type="button" onClick={() => advance(order)}><Check size={15}/> Confirm order</button>}{order.status === 'CONFIRMED' && <button className="farmer-order-primary" type="button" onClick={() => advance(order)}><Truck size={15}/> Request logistics</button>}<button className="farmer-order-delete" type="button" onClick={() => remove(order)}><Trash2 size={14}/> Delete</button><ArrowUpRight size={16}/></div></div></article>)}{visibleOrders.length === 0 && <div className="farmer-orders-empty"><PackageCheck size={34}/><h2>{filter === 'ALL' ? 'No customer orders yet' : `No ${statusLabels[filter]?.toLowerCase() || 'matching'} orders`}</h2><p>New marketplace purchases will appear here.</p></div>}</section>
    </div></main>;
}

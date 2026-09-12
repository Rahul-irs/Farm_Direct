import { ArrowLeft, ClipboardList, LoaderCircle, PackageCheck, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminOrders } from '../../services/api';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getAdminOrders()
            .then((result) => setOrders(result.items || []))
            .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load orders'))
            .finally(() => setLoading(false));
    }, []);

    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    const paidCount = orders.filter((order) => String(order.status).toLowerCase() === 'paid').length;
    const pendingCount = orders.filter((order) => String(order.status).toLowerCase() === 'pending').length;

    return <main className="admin-command admin-management-page"><div className="admin-command-container">
        <div className="admin-management-breadcrumb"><Link to="/dashboard/admin"><ArrowLeft size={14}/> Admin dashboard</Link><span>TRANSACTIONS</span></div>
        <header className="admin-management-header"><div className="admin-management-copy"><p className="admin-kicker"><ClipboardList size={14}/> Orders ledger</p><h1>Follow every transaction from checkout to fulfilment.</h1><p>Keep the order flow visible, inspect payment status, and review where operational attention is needed.</p></div><div className="admin-command-mark"><ClipboardList size={32}/><span>ORDER<br/>FLOW</span></div></header>
        <section className="admin-stats admin-stats-compact">
            <div><ClipboardList size={18}/><span>Total orders</span><strong>{orders.length.toLocaleString()}</strong><small>all records</small></div>
            <div><PackageCheck size={18}/><span>Paid</span><strong>{paidCount.toLocaleString()}</strong><small>completed payment</small></div>
            <div><ShieldCheck size={18}/><span>Pending</span><strong>{pendingCount.toLocaleString()}</strong><small>awaiting action</small></div>
            <div><ClipboardList size={18}/><span>Revenue</span><strong>₹{totalRevenue.toLocaleString()}</strong><small>gross value</small></div>
        </section>
        {error && <p className="admin-error" role="alert">{error}</p>}
        {loading ? <div className="admin-loading"><LoaderCircle size={22}/><span>Loading order ledger...</span></div> : <section className="admin-management-panel"><div className="admin-panel-heading"><div><p className="admin-label"><ClipboardList size={14}/> Capture</p><h2>Transaction history</h2></div><span>{orders.length} orders</span></div><div className="admin-order-list">{orders.map((order) => <article className="admin-order-card" key={order.id}><div className="admin-order-card-head"><div><p className="admin-order-meta">ORDER #{order.id}</p><h3>{(order.items && order.items.length ? order.items.map((item) => item.product_name || item.name).join(', ') : 'Produce order')}</h3></div><span className={`admin-status-pill ${String(order.status || 'pending').toLowerCase() === 'paid' ? 'is-active' : 'is-inactive'}`}>{String(order.status || 'pending').replaceAll('_', ' ')}</span></div><div className="admin-order-card-body"><div><span>Customer</span><strong>#{order.customer_id || 'n/a'}</strong></div><div><span>Amount</span><strong>₹{Number(order.total_amount || 0).toLocaleString()}</strong></div><div><span>Created</span><strong>{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'n/a'}</strong></div><div><span>Items</span><strong>{Array.isArray(order.items) ? order.items.length : 0}</strong></div></div></article>)}{orders.length === 0 && <p className="admin-empty-state">No orders have been recorded yet.</p>}</div></section>}
    </div></main>;
}


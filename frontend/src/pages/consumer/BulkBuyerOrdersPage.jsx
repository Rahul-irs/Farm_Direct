import { CheckCircle2, Eye, Filter, MapPin, Package, Search, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { getOrders } from '../../services/api';
import { getProductImage } from '../../utils/productImages';

const tabs = ['All Orders', 'Pending', 'Confirmed', 'In Transit', 'Delivered'];
const statusLabel = (status) => String(status || 'PENDING').replaceAll('_', ' ');
const tabStatus = { Pending: 'PENDING', Confirmed: 'CONFIRMED', 'In Transit': 'IN_TRANSIT', Delivered: 'DELIVERED' };

export default function BulkBuyerOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('All Orders');
    const [search, setSearch] = useState('');
    const [state, setState] = useState({ loading: true, error: '' });

    useEffect(() => {
        getOrders()
            .then((result) => setOrders(result.items || []))
            .catch((error) => setState({ loading: false, error: error instanceof Error ? error.message : 'Unable to load orders' }))
            .finally(() => setState((current) => ({ ...current, loading: false })));
    }, []);

    const filteredOrders = useMemo(() => orders.filter((order) => {
        const matchesTab = activeTab === 'All Orders' || String(order.status || '').toUpperCase() === tabStatus[activeTab];
        const text = `${order.id} ${order.items?.map((item) => item.product_name).join(' ')} ${order.items?.map((item) => item.farmer_name).join(' ')}`.toLowerCase();
        return matchesTab && text.includes(search.trim().toLowerCase());
    }), [activeTab, orders, search]);
    const totalValue = orders.reduce((total, order) => total + Number(order.total_amount || 0), 0);
    const countFor = (status) => status ? orders.filter((order) => String(order.status || '').toUpperCase() === status).length : orders.length;

    return <main className="bulk-buyer-orders-page"><div className="bulk-buyer-orders-container">
        <header className="bulk-buyer-orders-heading"><div><span className="bulk-buyer-kicker">Bulk procurement</span><h1>Bulk Orders</h1><p>Track every high-volume purchase from supplier confirmation to delivery.</p></div><div className="bulk-buyer-orders-summary-mark"><Package size={23}/><strong>{orders.length}</strong><span>total orders</span></div></header>
        {state.error && <div className="bulk-buyer-orders-error" role="alert">{state.error}<button type="button" onClick={() => window.location.reload()}>Try again</button></div>}
        <section className="bulk-buyer-orders-metrics"><div><span>Total Purchases</span><strong>₹{totalValue.toLocaleString('en-IN')}</strong><small>all-time procurement</small></div><div><span>Total Quantity</span><strong>{orders.reduce((total, order) => total + (order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0), 0).toLocaleString('en-IN')} kg</strong><small>across all orders</small></div><div><span>Pending Orders</span><strong>{countFor('PENDING')}</strong><small>need attention</small></div><div><span>Delivered</span><strong>{countFor('DELIVERED')}</strong><small>completed routes</small></div></section>
        <section className="bulk-buyer-orders-panel"><div className="bulk-buyer-orders-panel-head"><div><span className="bulk-buyer-label">Order management</span><h2>Bulk order history</h2></div><div className="bulk-buyer-orders-search"><Search size={15}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by order ID or supplier..." aria-label="Search bulk orders"/></div><button className="bulk-buyer-orders-filter" type="button"><Filter size={14}/> Filter</button></div><div className="bulk-buyer-order-tabs">{tabs.map((tab) => <button type="button" className={activeTab === tab ? 'is-active' : ''} onClick={() => setActiveTab(tab)} key={tab}>{tab} <b>{tab === 'All Orders' ? orders.length : countFor(tabStatus[tab])}</b></button>)}</div>{state.loading ? <div className="bulk-buyer-orders-loading">Loading orders...</div> : <div className="bulk-buyer-orders-table-wrap"><table className="bulk-buyer-orders-table"><thead><tr><th>Order ID</th><th>Product</th><th>Supplier</th><th>Quantity</th><th>Price</th><th>Status</th><th>Action</th></tr></thead><tbody>{filteredOrders.map((order) => { const item = order.items?.[0] || {}; const status = String(order.status || 'PENDING').toUpperCase(); return <tr key={order.id}><td><strong>#{String(order.id).padStart(5, '0')}</strong><small>{order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN') : 'Recent'}</small></td><td><div className="bulk-buyer-order-product"><img src={getProductImage({ name: item.product_name || 'Produce' })} alt=""/><strong>{item.product_name || 'FarmDirect purchase'}</strong></div></td><td><span className="bulk-buyer-order-supplier">{item.farmer_name || item.supplier_name || 'Farm partner'}</span></td><td>{item.quantity || '--'} kg</td><td>₹{Number(order.total_amount || 0).toLocaleString('en-IN')}</td><td><span className={`bulk-buyer-order-status status-${status.toLowerCase()}`}><i/> {statusLabel(status)}</span></td><td><div className="bulk-buyer-order-actions"><Link to={`/orders/${order.id}/tracking`} title="Track order" aria-label={`Track order ${order.id}`}><Truck size={14}/><span>Track</span></Link><Link to={`/orders/${order.id}/tracking`} title="View order" aria-label={`View order ${order.id}`}><Eye size={14}/></Link></div></td></tr>; })}{filteredOrders.length === 0 && <tr><td colSpan="7"><div className="bulk-buyer-orders-empty"><CheckCircle2 size={28}/><h3>No orders in this view</h3><p>Try another status or search term.</p></div></td></tr>}</tbody></table></div>}</section>
        <Link className="bulk-buyer-orders-back" to="/dashboard/bulk-buyer">Back to buying desk</Link>
    </div></main>;
}

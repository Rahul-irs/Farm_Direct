import { Check, Circle, MapPin, Package, RefreshCw, Truck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getOrders, getTracking } from '../../services/api';

function dateLabel(value) { return value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'; }

export default function FarmerTrackingPage() {
    const navigate = useNavigate();
    const [deliveries, setDeliveries] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    async function load() {
        setLoading(true); setError('');
        try {
            const result = await getOrders();
            const activeOrders = (result.items || []).filter((order) => ['LOGISTICS_REQUESTED', 'DELIVERED'].includes(order.status));
            const tracked = await Promise.all(activeOrders.map(async (order) => { try { const response = await getTracking(order.id); return { ...response.delivery, order }; } catch { return null; } }));
            const next = tracked.filter(Boolean);
            setDeliveries(next);
            setSelectedId((current) => next.some((item) => item.order_id === current) ? current : next[0]?.order_id || null);
        } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to load deliveries'); }
        finally { setLoading(false); }
    }

    useEffect(() => { load(); }, []);
    const selected = useMemo(() => deliveries.find((item) => item.order_id === selectedId) || deliveries[0], [deliveries, selectedId]);
    const events = selected?.events || [];
    const completedEvents = events.filter((event) => ['DELIVERED', 'OUT_FOR_DELIVERY', 'IN_TRANSIT', 'PICKED_UP', 'VEHICLE_ASSIGNED', 'ACCEPTED'].includes(event.status)).length;

    return <main className="farmer-tracking-page"><div className="farmer-tracking-container">
        <header className="farmer-tracking-reference-header"><div><span>FARMER WORKSPACE</span><h1>Delivery Tracking</h1><p>Follow every handoff from your farm to the customer.</p></div><button type="button" className="farmer-tracking-refresh" onClick={load} disabled={loading}><RefreshCw size={15} className={loading ? 'farmer-tracking-spin' : ''} /> Refresh</button></header>
        {error && <p className="farmer-tracking-error" role="alert">{error}</p>}
        {deliveries.length > 1 && <div className="farmer-tracking-order-tabs">{deliveries.map((delivery) => <button type="button" className={selected?.order_id === delivery.order_id ? 'is-active' : ''} onClick={() => setSelectedId(delivery.order_id)} key={delivery.order_id}>Order #{delivery.order_id}</button>)}</div>}
        {loading && <p className="farmer-tracking-empty">Loading delivery tracking...</p>}{!loading && !selected && <div className="farmer-tracking-empty"><Package size={27} /><h2>No active deliveries</h2><p>Confirm an order and request logistics to see its live tracking here.</p><Link to="/farmer/orders">Review Orders</Link></div>}
        {selected && <><section className="farmer-tracking-summary"><div><span>Order</span><strong>#{selected.order_id}</strong><small>{dateLabel(selected.order?.created_at)}</small></div><div><span>Status</span><strong>{selected.status.replaceAll('_', ' ')}</strong><small>{completedEvents} updates recorded</small></div><div><span>Delivery route</span><strong>{selected.pickup_location}</strong><small>to {selected.destination}</small></div></section><div className="farmer-tracking-main-grid"><section className="farmer-tracking-map"><div className="farmer-tracking-map-grid" /><div className="farmer-tracking-route-line" /><div className="farmer-tracking-map-stop start"><MapPin size={18} /><span>{selected.pickup_location}</span></div><div className="farmer-tracking-map-stop end"><Truck size={18} /><span>{selected.destination}</span></div><div className="farmer-tracking-map-marker"><Truck size={19} /></div><div className="farmer-tracking-map-label">Live route</div></section><section className="farmer-tracking-timeline-panel"><div className="farmer-tracking-panel-heading"><div><span>DELIVERY TIMELINE</span><h2>Order #{selected.order_id}</h2></div><span className="farmer-tracking-status">{selected.status.replaceAll('_', ' ')}</span></div><div className="farmer-tracking-timeline">{events.map((event, index) => <div className={`farmer-tracking-event ${index === events.length - 1 ? 'current' : ''}`} key={event.id}><span className="farmer-tracking-event-icon">{index === events.length - 1 ? <Check size={13} /> : <Circle size={9} />}</span><div><strong>{event.status.replaceAll('_', ' ')}</strong><span>{event.note || 'Status updated'}</span></div></div>)}{!events.length && <p className="farmer-tracking-empty">No tracking events recorded yet.</p>}</div></section></div><section className="farmer-tracking-details"><div><span><MapPin size={15} /> Pickup location</span><strong>{selected.pickup_location}</strong></div><div><span><Package size={15} /> Destination</span><strong>{selected.destination}</strong></div><div><span><Truck size={15} /> Delivery status</span><strong>{selected.status.replaceAll('_', ' ')}</strong></div></section><Link className="farmer-tracking-back" to="/farmer/orders">Back to Orders</Link></>}
    </div></main>;
}

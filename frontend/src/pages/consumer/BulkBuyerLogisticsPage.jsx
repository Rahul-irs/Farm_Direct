import { Check, Circle, Clock3, MapPin, Package, RefreshCw, Search, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import BulkBuyerSidebar from '../../components/layout/BulkBuyerSidebar';
import { getOrders, getTracking } from '../../services/api';

export default function BulkBuyerLogisticsPage() {
    const [orders, setOrders] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [delivery, setDelivery] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    async function loadOrders() {
        setLoading(true);
        setError('');
        try {
            const result = await getOrders();
            const nextOrders = result.items || [];
            setOrders(nextOrders);
            if (!selectedId && nextOrders[0]?.id) setSelectedId(nextOrders[0].id);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to load deliveries');
        } finally { setLoading(false); }
    }

    useEffect(() => { loadOrders(); }, []);
    useEffect(() => {
        if (!selectedId) return;
        setLoading(true);
        getTracking(Number(selectedId))
            .then((result) => setDelivery(result.delivery))
            .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Tracking unavailable'))
            .finally(() => setLoading(false));
    }, [selectedId]);

    const selectedOrder = orders.find((order) => order.id === selectedId);
    const item = selectedOrder?.items?.[0];

    return <main className="bulk-buyer-page"><div className="bulk-buyer-shell">
        <BulkBuyerSidebar />
        <div className="bulk-buyer-main-panel bulk-buyer-logistics-page">
            <header className="bulk-buyer-toolbar"><div className="bulk-buyer-toolbar-copy"><span className="bulk-buyer-kicker"><Truck size={14}/> Delivery coordination</span><h1>Track Your Delivery</h1><p>Follow every bulk shipment from pickup to destination.</p></div><button className="bulk-buyer-refresh" type="button" onClick={loadOrders} disabled={loading}><RefreshCw size={15}/> {loading ? 'Refreshing' : 'Refresh routes'}</button></header>
            {error && <p className="bulk-buyer-error" role="alert">{error}</p>}
            <div className="bulk-buyer-logistics-layout">
                <aside className="bulk-buyer-delivery-list"><div className="bulk-buyer-logistics-panel-head"><div><span className="bulk-buyer-label">Your Deliveries</span><h2>Active routes</h2></div><Search size={15}/></div>{orders.length ? orders.map((order) => <button type="button" className={`bulk-buyer-delivery-option ${order.id === selectedId ? 'is-selected' : ''}`} onClick={() => setSelectedId(order.id)} key={order.id}><span>Order #{String(order.id).padStart(5, '0')}</span><strong>{order.items?.[0]?.product_name || 'Farm produce'}</strong><small>{order.items?.[0]?.quantity || '--'} kg · {order.status || 'PENDING'}</small></button>) : <div className="bulk-buyer-logistics-empty"><Package size={28}/><p>No deliveries yet.</p></div>}</aside>
                <section className="bulk-buyer-live-delivery"><div className="bulk-buyer-logistics-order-head"><div><span>ORDER #{selectedId ? String(selectedId).padStart(5, '0') : '-----'}</span><h2>{item?.product_name || 'Select an order'}</h2></div>{delivery && <b>{delivery.status?.replaceAll('_', ' ')}</b>}</div>{loading ? <div className="bulk-buyer-logistics-loading">Loading live route...</div> : delivery ? <><div className="bulk-buyer-delivery-summary"><div><span>Product</span><strong>{item?.product_name || 'Fresh produce'}</strong></div><div><span>Quantity</span><strong>{item?.quantity || '--'} kg</strong></div><div><span>Expected delivery</span><strong>{delivery.estimated_delivery ? new Date(delivery.estimated_delivery).toLocaleString('en-IN') : 'On schedule'}</strong></div></div><div className="bulk-buyer-logistics-map"><div className="bulk-buyer-road bulk-buyer-road-one"/><div className="bulk-buyer-road bulk-buyer-road-two"/><div className="bulk-buyer-map-pin bulk-buyer-map-start"><MapPin size={15}/><span>{delivery.pickup_location}</span></div><div className="bulk-buyer-map-pin bulk-buyer-map-end"><MapPin size={15}/><span>{delivery.destination}</span></div><div className="bulk-buyer-map-truck"><Truck size={18}/></div><div className="bulk-buyer-map-label bulk-buyer-map-label-start">Pickup</div><div className="bulk-buyer-map-label bulk-buyer-map-label-end">Destination</div></div><div className="bulk-buyer-delivery-route"><span>Picked Up</span><i className="is-done"/><span className={delivery.status === 'IN_TRANSIT' ? 'is-current' : ''}>In Transit</span><i/><span>Out for Delivery</span><i/><span>Delivered</span></div></> : <div className="bulk-buyer-logistics-empty"><Package size={30}/><h3>Tracking is not available</h3><p>Select another order or try refreshing.</p></div>}</section>
                <aside className="bulk-buyer-delivery-timeline"><div className="bulk-buyer-logistics-panel-head"><div><span className="bulk-buyer-label">Live Updates</span><h2>Journey timeline</h2></div><Clock3 size={16}/></div>{delivery?.events?.length ? <div className="bulk-buyer-timeline">{delivery.events.map((event, index) => <div className="bulk-buyer-timeline-event" key={event.id || `${event.status}-${index}`}><span>{index === delivery.events.length - 1 ? <Check size={13}/> : <Circle size={9}/>}</span><div><strong>{event.status?.replaceAll('_', ' ')}</strong><p>{event.note || 'Status updated'}</p><small>{event.created_at ? new Date(event.created_at).toLocaleString('en-IN') : 'Recent update'}</small></div></div>)}</div> : <p className="bulk-buyer-no-updates">Updates will appear when the carrier reports movement.</p>}</aside>
            </div>
        </div>
    </div></main>;
}

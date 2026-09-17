import { ArrowRight, Check, Circle, MapPin, Package, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getOrders, getTracking } from '../../services/api';

export default function TrackingPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('farmdirect_user') || '{}');
    const backPath = user.role === 'farmer' ? '/farmer/orders' : '/orders';
    const [delivery, setDelivery] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderId) {
            getOrders()
                .then((result) => {
                    const firstOrder = result.items?.[0];
                    if (firstOrder?.id) {
                        navigate(`/orders/${firstOrder.id}/tracking`, { replace: true });
                        return;
                    }
                    setError('No active order to track yet');
                })
                .catch((requestError) => {
                    setError(requestError instanceof Error ? requestError.message : 'Tracking unavailable');
                })
                .finally(() => setLoading(false));
            return;
        }

        getTracking(Number(orderId))
            .then((result) => setDelivery(result.delivery))
            .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Tracking unavailable'))
            .finally(() => setLoading(false));
    }, [navigate, orderId]);

    return (
        <main className="tracking-page">
            <div className="tracking-container">
                <div className="tracking-shell">
                    <div className="orders-topbar tracking-topbar">
                        <Link className="orders-back-link" to={backPath}>
                            <ArrowRight className="rotate-180" size={15} />
                            Orders
                        </Link>
                        <span className="orders-shell-chip">Live fulfilment</span>
                    </div>

                    <header className="tracking-header">
                        <div>
                            <p className="orders-kicker">Live fulfilment</p>
                            <h1>Track order #{orderId}</h1>
                        </div>
                        {delivery && <span className="status-chip tracking-status">{delivery.status}</span>}
                    </header>

                    {error && (
                        <div className="empty-state tracking-empty" role="alert">
                            <Package size={30} />
                            <h2>Tracking is not available yet</h2>
                            <p>{error}</p>
                        </div>
                    )}

                    {loading && <div className="tracking-loading" aria-label="Loading tracking details" />}

                    {delivery && (
                        <div className="tracking-grid">
                            <div className="tracking-map-panel">
                                <div className="tracking-map">
                                    <div className="tracking-route-line" />
                                    <div className="tracking-stop tracking-stop-start">
                                        <MapPin size={20} />
                                        <span>{delivery.pickup_location}</span>
                                    </div>
                                    <div className="tracking-stop tracking-stop-end">
                                        <Truck size={20} />
                                        <span>{delivery.destination}</span>
                                    </div>
                                    <div className="tracking-route-center">
                                        <Package size={25} />
                                    </div>
                                </div>

                                <div className="tracking-summary">
                                    <div>
                                        <span>Pickup</span>
                                        <strong>{delivery.pickup_location}</strong>
                                    </div>
                                    <div>
                                        <span>Destination</span>
                                        <strong>{delivery.destination}</strong>
                                    </div>
                                </div>
                            </div>

                            <aside className="tracking-timeline-panel">
                                <div className="tracking-panel-header">Journey timeline</div>
                                <div className="tracking-timeline">
                                    {delivery.events.map((event, index) => (
                                        <div className="tracking-event" key={event.id || `${event.status}-${index}`}>
                                            <span className="tracking-event-icon">
                                                {index === delivery.events.length - 1 ? <Check size={14} /> : <Circle size={10} />}
                                            </span>
                                            <div>
                                                <p className="tracking-event-status">{event.status}</p>
                                                <p className="tracking-event-note">{event.note || 'Status updated'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </aside>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}


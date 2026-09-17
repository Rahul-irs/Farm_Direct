import { ArrowRight, CheckCircle2, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getOrders } from '../../services/api';

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [state, setState] = useState({ loading: true, error: '' });

    useEffect(() => {
        getOrders()
            .then((result) => setOrders(result.items || []))
            .catch((error) => setState({
                loading: false,
                error: error instanceof Error ? error.message : 'Unable to load orders',
            }))
            .finally(() => setState((current) => ({ ...current, loading: false })));
    }, []);

    const user = JSON.parse(localStorage.getItem('farmdirect_user') || '{}');
    const isBulkBuyer = user.role === 'bulk_buyer';
    const dashboardPath = isBulkBuyer ? '/dashboard/bulk-buyer' : '/dashboard/consumer';
    const totalValue = orders.reduce((total, order) => total + Number(order.total_amount || 0), 0);

    return (
        <main className="orders-page">
            <div className="orders-container">
                <div className="orders-shell">
                    <div className="orders-topbar">
                        <Link className="orders-back-link" to={dashboardPath}>
                            <ArrowRight className="rotate-180" size={15} />
                            {isBulkBuyer ? 'Buying desk' : 'Dashboard'}
                        </Link>
                        <span className="orders-shell-chip">Orders</span>
                    </div>

                    <header className="orders-hero">
                        <div>
                            <p className="orders-kicker">{isBulkBuyer ? 'Bulk procurement history' : 'Commerce history'}</p>
                            <h1>{isBulkBuyer ? 'Orders for your buying desk.' : 'Your orders.'}</h1>
                            <p>
                                {isBulkBuyer
                                    ? 'Track every farm purchase, payment, and delivery from one clear record.'
                                    : 'Keep every purchase, payment, and delivery in view.'}
                            </p>
                        </div>

                        <div className="orders-hero-mark">
                            <Package size={30} />
                            <span>{orders.length} records</span>
                        </div>
                    </header>

                    {state.error && (
                        <div className="orders-alert" role="alert">
                            <span>{state.error}</span>
                            <button type="button" onClick={() => window.location.reload()}>
                                Try again
                            </button>
                        </div>
                    )}

                    {state.loading ? (
                        <div className="orders-loading" aria-label="Loading orders" />
                    ) : (
                        <>
                            <section className="orders-summary">
                                <div>
                                    <span>Total orders</span>
                                    <strong>{orders.length}</strong>
                                    <small>purchase records</small>
                                </div>
                                <div>
                                    <span>Order value</span>
                                    <strong>₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                                    <small>all-time total</small>
                                </div>
                                <div>
                                    <span>Latest status</span>
                                    <strong>{orders[0]?.status || 'Ready'}</strong>
                                    <small>{orders[0] ? `Order #${orders[0].id}` : 'No activity yet'}</small>
                                </div>
                            </section>

                            <div className="orders-list">
                                {orders.map((order) => (
                                    <article className="order-card" key={order.id}>
                                        <div className="order-card-main">
                                            <div className="order-card-top">
                                                <div className="order-card-copy">
                                                    <span className="order-number">ORDER #{order.id}</span>
                                                    <h2>
                                                        {order.items?.[0]?.product_name || 'FarmDirect purchase'}
                                                        {order.items?.length > 1 ? ` + ${order.items.length - 1} more` : ''}
                                                    </h2>
                                                </div>
                                                <span className="status-chip">
                                                    <CheckCircle2 size={13} />
                                                    {order.status}
                                                </span>
                                            </div>

                                            <div className="order-card-meta">
                                                <div className="order-meta-block">
                                                    <span>Amount</span>
                                                    <strong>₹{Number(order.total_amount || 0).toFixed(2)}</strong>
                                                </div>
                                                <div className="order-meta-block">
                                                    <span>Placed</span>
                                                    <strong>
                                                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Today'}
                                                    </strong>
                                                </div>
                                                <Link className="order-track-link" to={`/orders/${order.id}/tracking`}>
                                                    View tracking
                                                    <ArrowRight size={14} />
                                                </Link>
                                            </div>
                                        </div>

                                        {order.items?.length > 0 && (
                                            <div className="order-card-items">
                                                {order.items.map((item) => (
                                                    <Link to={`/review?product=${item.product_id}&order=${order.id}`} key={item.product_id}>
                                                        Review {item.product_name}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </article>
                                ))}

                                {orders.length === 0 && (
                                    <div className="orders-empty">
                                        <div className="orders-empty-icon">
                                            <Package size={28} />
                                        </div>
                                        <div>
                                            <span className="orders-kicker">No purchase records</span>
                                            <h2>{isBulkBuyer ? 'Your buying desk is ready.' : 'Your order history starts here.'}</h2>
                                            <p>
                                                {isBulkBuyer
                                                    ? 'Publish a requirement or browse the marketplace to make your first procurement.'
                                                    : 'Explore current farm listings and your completed purchases will appear here.'}
                                            </p>
                                            <Link className="orders-empty-action" to={isBulkBuyer ? '/dashboard/bulk-buyer' : '/marketplace'}>
                                                {isBulkBuyer ? 'Open buying desk' : 'Explore marketplace'}
                                                <ArrowRight size={15} />
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}


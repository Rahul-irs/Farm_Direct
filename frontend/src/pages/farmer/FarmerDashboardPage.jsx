import { ArrowRight, Bell, ClipboardList, PackageCheck, Tractor, WalletCards } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFarmerInventoryOverview, getFarmerPaymentSummary, getOrders } from '../../services/api';

const statusLabels = { PENDING: 'Pending', PAID: 'Paid', CONFIRMED: 'Confirmed', LOGISTICS_REQUESTED: 'In delivery', DELIVERED: 'Delivered', COMPLETED: 'Completed', CANCELLED: 'Cancelled' };
const emptyMetrics = { active_listings: 0, available_stock: 0, reserved_stock: 0, sold_stock: 0, catalogue_value: 0 };
const emptySummary = { revenue: 0, sold_quantity: 0, paid_orders: 0 };

function formatCurrency(value) {
    return `₹ ${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export default function FarmerDashboardPage() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('farmdirect_user') || '{}');
    const [metrics, setMetrics] = useState(emptyMetrics);
    const [summary, setSummary] = useState(emptySummary);
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');
    const name = user.full_name || 'Farmer';
    const pendingPayments = orders.filter((order) => order.status === 'PENDING').reduce((total, order) => total + Number(order.total_amount || 0), 0);

    useEffect(() => {
        Promise.all([getFarmerInventoryOverview(), getFarmerPaymentSummary(), getOrders()])
            .then(([inventoryResult, paymentResult, ordersResult]) => {
                setMetrics(inventoryResult.metrics || emptyMetrics);
                setSummary(paymentResult.summary || emptySummary);
                setOrders(ordersResult.items || []);
            })
            .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load your farm overview'));
    }, []);

    const orderRows = orders.slice(0, 3).map((order) => {
        const item = order.items?.[0];
        return {
            crop: item?.product_name || 'Order',
            quantity: item ? `${item.quantity} units` : 'Order details unavailable',
            amount: formatCurrency(order.total_amount),
            status: statusLabels[order.status] || order.status,
            date: order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent order',
            buyer: `Order #${order.id}`,
        };
    });

    const quickActions = [
        { label: 'Add Delivery', icon: Tractor, subtitle: 'Manage deliveries', path: '/farmer/tracking' },
        { label: 'Add & Sling', icon: PackageCheck, subtitle: 'Manage listings', path: '/farmer/add-product' },
        { label: 'Notifications', icon: Bell, subtitle: 'View alerts', path: '/farmer/notifications' },
    ];

    return (
        <main className="farmer-overview-page">
            <div className="farmer-overview-shell">
                <div className="farmer-overview-greeting-wrap">
                    <h1 className="farmer-overview-title">Good Morning, {name}!</h1>
                    <p className="farmer-overview-subtitle">Your hard work holds. We valued. Keep growing!</p>
                </div>

                <div className="farmer-overview-banner">
                    <img src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80" alt="Farm field" />
                    <div className="farmer-overview-banner-copy">
                        <span>Better Prices</span>
                        <strong>Bigger Markets</strong>
                        <em>Brighter Future</em>
                    </div>
                </div>

                <div className="farmer-overview-stats">
                    <div className="farmer-overview-stat-card">
                        <div className="farmer-overview-stat-icon tomato"><WalletCards size={18} /></div>
                        <div>
                            <span>Total Sales</span>
                            <strong>{formatCurrency(summary.revenue)}</strong>
                            <small>{summary.paid_orders} paid orders</small>
                        </div>
                    </div>

                    <div className="farmer-overview-stat-card">
                        <div className="farmer-overview-stat-icon acres"><ClipboardList size={18} /></div>
                        <div>
                            <span>Pending Payments</span>
                            <strong>{formatCurrency(pendingPayments)}</strong>
                            <small>{orders.filter((order) => order.status === 'PENDING').length} orders awaiting review</small>
                        </div>
                    </div>

                    <div className="farmer-overview-stat-card">
                        <div className="farmer-overview-stat-icon soil"><PackageCheck size={18} /></div>
                        <div>
                            <span>Total Orders</span>
                            <strong>{orders.length}</strong>
                            <small>{metrics.active_listings} active listings</small>
                        </div>
                    </div>
                </div>

                <div className="farmer-overview-lower-grid">
                    <section className="farmer-overview-order-panel">
                        <div className="farmer-overview-panel-head">
                            <h2>Recent Orders</h2>
                            <button type="button" className="farmer-overview-link" onClick={() => navigate('/farmer/orders')}>View all <ArrowRight size={13} /></button>
                        </div>

                        <div className="farmer-overview-order-list">
                            {orderRows.map((row) => (
                                <div key={`${row.crop}-${row.amount}`} className="farmer-overview-order-item">
                                    <div className="farmer-overview-order-avatar">🍅</div>
                                    <div className="farmer-overview-order-copy">
                                        <div className="farmer-overview-order-topline">
                                            <strong>{row.crop}</strong>
                                            <span>{row.date}</span>
                                        </div>
                                        <small>{row.buyer}</small>
                                    </div>
                                    <div className="farmer-overview-order-amount">
                                        <span>{row.amount}</span>
                                        <em>{row.status}</em>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="farmer-overview-action-panel">
                        <div className="farmer-overview-panel-head narrow">
                            <h2>Quick Actions</h2>
                        </div>
                        <div className="farmer-overview-actions-grid">
                            {quickActions.map(({ label, icon: Icon, subtitle, path }) => (
                                <button key={label} type="button" className="farmer-overview-action-button" onClick={() => navigate(path)}>
                                    <span className="farmer-overview-action-icon"><Icon size={18} /></span>
                                    <span className="farmer-overview-action-copy">
                                        <strong>{label}</strong>
                                        <small>{subtitle}</small>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
            {error && <p className="farmer-overview-error" role="alert">{error}</p>}
        </main>
    );
}
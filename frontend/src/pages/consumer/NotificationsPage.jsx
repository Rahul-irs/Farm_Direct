import { ArrowLeft, Bell, Check, CircleAlert, CreditCard, Info, RefreshCw, ShoppingBag, Truck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getNotifications, markNotificationRead } from '../../services/api';

const filters = ['ALL', 'ORDERS', 'PAYMENTS', 'ALERTS', 'SYSTEM'];
const filterLabels = { ALL: 'All', ORDERS: 'Orders', PAYMENTS: 'Payments', ALERTS: 'Alerts', SYSTEM: 'System' };

function categoryFor(item) {
    const value = `${item.title || ''} ${item.message || ''}`.toLowerCase();
    if (value.includes('payment') || value.includes('paid') || value.includes('sale')) return 'PAYMENTS';
    if (value.includes('order') || value.includes('delivery') || value.includes('logistics')) return 'ORDERS';
    if (value.includes('alert') || value.includes('warning')) return 'ALERTS';
    return 'SYSTEM';
}

function categoryTitle(category) {
    return filterLabels[category] || category;
}

function notificationIcon(item) {
    const category = categoryFor(item);
    if (category === 'PAYMENTS') return CreditCard;
    if (category === 'ORDERS') return item.title?.toLowerCase().includes('deliver') ? Truck : ShoppingBag;
    if (category === 'ALERTS') return CircleAlert;
    return Info;
}

export default function NotificationsPage() {
    const [items, setItems] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const user = JSON.parse(localStorage.getItem('farmdirect_user') || '{}');
    const dashboardPath = user.role === 'bulk_buyer' ? '/dashboard/bulk-buyer' : '/dashboard/consumer';

    async function load() {
        setLoading(true);
        setError('');
        try {
            const result = await getNotifications();
            setItems(result.items || []);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to load notifications');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function read(item) {
        try {
            await markNotificationRead(item.id);
            setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, is_read: true } : entry)));
            setMessage('Notification marked as read.');
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to update notification');
        }
    }

    const visibleItems = useMemo(() => (filter === 'ALL' ? items : items.filter((item) => categoryFor(item) === filter)), [filter, items]);
    const unread = items.filter((item) => !item.is_read).length;
    const countFor = (category) => (category === 'ALL' ? items.length : items.filter((item) => categoryFor(item) === category).length);

    return (
        <main className="notifications-page">
            <div className="notifications-container">
                <Link className="notifications-back-link" to={dashboardPath}>
                    <ArrowLeft size={15} />
                    Back to workspace
                </Link>

                <header className="notifications-hero">
                    <div>
                        <p className="notifications-kicker">
                            <Bell size={14} />
                            Updates
                        </p>
                        <h1>Everything you need, in one feed.</h1>
                        <p>Stay on top of orders, payments, deliveries, and account activity while you shop.</p>
                    </div>

                    <div className="notifications-hero-mark">
                        <strong>{unread}</strong>
                        <span>Unread</span>
                    </div>
                </header>

                {message && (
                    <p className="notifications-notice" role="status">
                        <Check size={15} />
                        {message}
                    </p>
                )}

                {error && (
                    <p className="notifications-error" role="alert">
                        {error}
                    </p>
                )}

                <section className="notifications-summary">
                    <div>
                        <span>Total updates</span>
                        <strong>{items.length}</strong>
                        <small>live feed</small>
                    </div>
                    <div>
                        <span>Unread</span>
                        <strong>{unread}</strong>
                        <small>waiting review</small>
                    </div>
                    <div>
                        <span>Latest</span>
                        <strong>{items[0]?.title ? items[0].title.slice(0, 12) : 'Clear'}</strong>
                        <small>{items[0] ? 'recent activity' : 'no activity yet'}</small>
                    </div>
                </section>

                <div className="notifications-toolbar" style={{ marginTop: '1.2rem', marginBottom: '1rem' }}>
                    <div className="notifications-filters" role="tablist" aria-label="Notification categories">
                        {filters.map((item) => (
                            <button
                                type="button"
                                key={item}
                                className={filter === item ? 'is-active' : ''}
                                onClick={() => setFilter(item)}
                            >
                                {filterLabels[item]} <b>{countFor(item)}</b>
                            </button>
                        ))}
                    </div>
                    <button className="notifications-refresh" type="button" onClick={load} disabled={loading}>
                        <RefreshCw size={15} className={loading ? 'notifications-spin' : ''} />
                        Refresh
                    </button>
                </div>

                <div className="notifications-list">
                    {loading ? (
                        <div className="notifications-loading" aria-label="Loading notifications" />
                    ) : visibleItems.length > 0 ? (
                        visibleItems.map((item) => {
                            const Icon = notificationIcon(item);
                            const typeLabel = categoryTitle(categoryFor(item));
                            const isNew = !item.is_read;

                            return (
                                <article className={`notification-card ${isNew ? 'is-new' : 'is-read'}`} key={item.id}>
                                    <div className="notification-icon">
                                        <Icon size={18} />
                                    </div>

                                    <div className="notification-copy">
                                        <div className="notification-title-row">
                                            <span className="notification-type">{typeLabel}</span>
                                            <time>{item.created_at ? new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'}</time>
                                        </div>
                                        <h2>{item.title}</h2>
                                        <p>{item.message}</p>
                                    </div>

                                    <div className="notification-trust">
                                        {isNew ? (
                                            <button type="button" onClick={() => read(item)}>
                                                Mark read
                                            </button>
                                        ) : (
                                            <span>Seen</span>
                                        )}
                                    </div>
                                </article>
                            );
                        })
                    ) : (
                        <div className="notifications-empty">
                            <div className="orders-empty-icon">
                                <Bell size={28} />
                            </div>
                            <div>
                                <span className="orders-kicker">No updates</span>
                                <h2>No notifications in this view</h2>
                                <p>New shopping updates and order activity will show up here.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

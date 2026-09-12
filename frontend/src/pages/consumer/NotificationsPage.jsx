import { Bell, Check, Circle, Radio, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getNotifications, markNotificationRead } from '../../services/api';
export default function NotificationsPage() {
    const [items, setItems] = useState([]);
    const [error, setError] = useState('');
    useEffect(() => { getNotifications().then((result) => setItems(result.items || [])).catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load notifications')); }, []);
    async function read(id) { try { await markNotificationRead(id); setItems((current) => current.map((item) => item.id === id ? { ...item, is_read: true } : item)); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to update notification'); } }
    const unread = items.filter((item) => !item.is_read).length;
    const user = JSON.parse(localStorage.getItem('farmdirect_user') || '{}');
    const dashboardPath = user.role === 'bulk_buyer' ? '/dashboard/bulk-buyer' : '/dashboard/consumer';
    return <main className="notifications-page"><div className="notifications-container"><Link className="notifications-back-link" to={dashboardPath}>Back to workspace <ArrowLeftIcon /></Link><header className="notifications-hero"><div><p className="notifications-kicker"><Radio size={14}/> Signal center</p><h1>Stay ahead of the handoffs.</h1><p>Order, payment, and delivery updates for your FarmDirect workspace.</p></div><div className="notifications-hero-mark"><Bell size={26}/><strong>{unread}</strong><span>unread signals</span></div></header>{error && <p className="notifications-error" role="alert">{error}</p>}<section className="notifications-summary"><div><span>All signals</span><strong>{items.length}</strong><small>account activity</small></div><div><span>Unread</span><strong>{unread}</strong><small>need your attention</small></div><div><span>Workspace</span><strong>{user.role === 'bulk_buyer' ? 'Buying' : 'Consumer'}</strong><small>notification stream</small></div></section><div className="notifications-list">{items.map((item) => <article className={`notification-card ${item.is_read ? 'is-read' : 'is-new'}`} key={item.id}><div className="notification-icon">{item.is_read ? <Check size={15}/> : <Circle size={10}/>}</div><div className="notification-copy"><div className="notification-title-row"><div><span className="notification-type">{item.is_read ? 'SEEN' : 'NEW SIGNAL'}</span><h2>{item.title}</h2></div>{!item.is_read && <button type="button" onClick={() => read(item.id)}>Mark read</button>}</div><p>{item.message}</p></div><ShieldCheck className="notification-trust" size={18}/></article>)}{items.length === 0 && <div className="notifications-empty"><Bell size={30}/><div><span className="notifications-kicker">Quiet for now</span><h2>Your signal center is clear.</h2><p>New order, payment, and route updates will appear here.</p></div></div>}</div></div></main>;
}

function ArrowLeftIcon() { return <span aria-hidden="true">←</span>; }

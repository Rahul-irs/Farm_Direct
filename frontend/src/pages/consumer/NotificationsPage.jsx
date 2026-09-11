import { Bell, Check, Circle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getNotifications, markNotificationRead } from '../../services/api';
export default function NotificationsPage() {
    const [items, setItems] = useState([]);
    const [error, setError] = useState('');
    useEffect(() => { getNotifications().then((result) => setItems(result.items || [])).catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load notifications')); }, []);
    async function read(id) { try { await markNotificationRead(id); setItems((current) => current.map((item) => item.id === id ? { ...item, is_read: true } : item)); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to update notification'); } }
    const unread = items.filter((item) => !item.is_read).length;
    return <main className="notifications-page min-h-screen p-6 text-white sm:p-8"><div className="container max-w-3xl"><Link className="text-sm text-emerald-200" to="/dashboard/consumer">Dashboard</Link><div className="mt-8 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200/70">Signal center</p><h1 className="mt-3 text-4xl font-black">Notifications</h1></div><div className="notification-count"><Bell size={16}/>{unread} unread</div></div>{error && <p className="mt-5 text-rose-300" role="alert">{error}</p>}<div className="mt-6 space-y-3">{items.map((item) => <article className={`notification-card card p-5 ${item.is_read ? 'opacity-60' : ''}`} key={item.id}><div className="flex gap-3"><span className="notification-icon">{item.is_read ? <Check size={15}/> : <Circle size={10}/>}</span><div className="min-w-0 flex-1"><div className="flex justify-between gap-4"><h2 className="font-semibold">{item.title}</h2>{!item.is_read && <button className="text-sm text-emerald-200" type="button" onClick={() => read(item.id)}>Mark read</button>}</div><p className="mt-2 text-sm text-emerald-50/70">{item.message}</p></div></div></article>)}{items.length === 0 && <div className="empty-state card"><Bell size={32}/><h2>You are all caught up</h2><p>New order, payment, and route updates will appear here.</p></div>}</div></div></main>;
}

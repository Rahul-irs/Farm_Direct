import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getNotifications, markNotificationRead } from '../../services/api';
export default function NotificationsPage() {
    const [items, setItems] = useState([]);
    useEffect(() => { getNotifications().then((result) => setItems(result.items)).catch(() => undefined); }, []);
    async function read(id) { await markNotificationRead(id); setItems((current) => current.map((item) => item.id === id ? { ...item, is_read: true } : item)); }
    return <main className="min-h-screen p-6 text-white"><div className="container max-w-2xl"><Link className="text-sm text-emerald-200" to="/dashboard/consumer">Dashboard</Link><h1 className="mt-6 text-4xl font-black">Notifications</h1><div className="mt-6 space-y-3">{items.map((item) => <article className={`card p-5 ${item.is_read ? 'opacity-60' : ''}`} key={item.id}><div className="flex justify-between gap-4"><h2 className="font-semibold">{item.title}</h2>{!item.is_read && <button className="text-sm text-emerald-200" type="button" onClick={() => read(item.id)}>Mark read</button>}</div><p className="mt-2 text-sm text-emerald-50/70">{item.message}</p></article>)}{items.length === 0 && <p className="card p-6 text-emerald-50/65">No notifications.</p>}</div></div></main>;
}

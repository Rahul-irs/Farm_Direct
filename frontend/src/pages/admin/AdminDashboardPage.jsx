import { Activity, BarChart3, Boxes, ClipboardList, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAdminAnalytics, getAdminOverview } from '../../services/api';
export default function AdminDashboardPage() {
    const [overview, setOverview] = useState({ users: 0, farmers: 0, orders: 0, revenue: 0 });
    const [analytics, setAnalytics] = useState(null);
    useEffect(() => {
        getAdminOverview().then((result) => setOverview(result.data));
        getAdminAnalytics().then((result) => setAnalytics(result.data)).catch(() => undefined);
    }, []);
    return (<div className="admin-page min-h-screen p-8 text-white">
      <div className="container">
        <p className="eyebrow inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]"><ShieldCheck size={14}/> Operations control</p>
        <h1 className="mt-4 text-4xl font-black md:text-6xl">Platform overview</h1>
        <p className="mt-4 max-w-2xl text-emerald-50/70">A calm control plane for the people, produce, orders, and decisions moving through FarmDirect.</p>
        <div className="mt-6 flex flex-wrap gap-3"><Link className="btn-secondary" to="/admin/users"><Users size={16}/> Users</Link><Link className="btn-secondary" to="/admin/products"><Boxes size={16}/> Products</Link><Link className="btn-secondary" to="/admin/orders"><ClipboardList size={16}/> Orders</Link><Link className="btn-secondary" to="/admin/audit-logs"><Activity size={16}/> Audit logs</Link></div>
        <div className="mt-8 grid gap-5 md:grid-cols-4">
          {['Users', 'Orders', 'Revenue', 'Farmers'].map((item) => (<div key={item} className="admin-stat card p-5">
              <p className="text-sm text-emerald-200/70">{item}</p>
              <p className="mt-3 text-3xl font-bold">{item === 'Users' ? overview.users.toLocaleString() : item === 'Orders' ? overview.orders.toLocaleString() : item === 'Revenue' ? `₹${(overview.revenue / 100000).toFixed(1)}L` : overview.farmers.toLocaleString()}</p>
            </div>))}
        </div>
        {analytics && <div className="mt-8 grid gap-5 lg:grid-cols-2"><section className="card p-6"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Orders by status</h2><BarChart3 className="text-emerald-300" size={20}/></div><div className="mt-4 space-y-3">{Object.entries(analytics.orders_by_status).map(([status, count]) => <div className="admin-row" key={status}><span>{status}</span><strong>{count}</strong></div>)}</div></section><section className="card p-6"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Users by role</h2><Users className="text-emerald-300" size={20}/></div><div className="mt-4 space-y-3">{Object.entries(analytics.users_by_role).map(([role, count]) => <div className="admin-row" key={role}><span className="capitalize">{role.replace('_', ' ')}</span><strong>{count}</strong></div>)}</div></section></div>}
      </div>
    </div>);
}

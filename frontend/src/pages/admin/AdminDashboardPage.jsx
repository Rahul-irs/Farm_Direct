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
    return (<div className="min-h-screen p-8 text-white">
      <div className="container">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-200/70">Operations control</p>
        <h1 className="mt-2 text-4xl font-black">Platform overview</h1>
        <div className="mt-5 flex flex-wrap gap-3"><Link className="btn-secondary" to="/admin/users">Users</Link><Link className="btn-secondary" to="/admin/products">Products</Link><Link className="btn-secondary" to="/admin/orders">Orders</Link><Link className="btn-secondary" to="/admin/audit-logs">Audit logs</Link></div>
        <div className="mt-8 grid gap-5 md:grid-cols-4">
          {['Users', 'Orders', 'Revenue', 'Farmers'].map((item) => (<div key={item} className="card p-5">
              <p className="text-sm text-emerald-200/70">{item}</p>
              <p className="mt-3 text-3xl font-bold">{item === 'Users' ? overview.users.toLocaleString() : item === 'Orders' ? overview.orders.toLocaleString() : item === 'Revenue' ? `₹${(overview.revenue / 100000).toFixed(1)}L` : overview.farmers.toLocaleString()}</p>
            </div>))}
        </div>
        {analytics && <div className="mt-8 grid gap-5 lg:grid-cols-2"><section className="card p-6"><h2 className="text-xl font-bold">Orders by status</h2><div className="mt-4 space-y-3">{Object.entries(analytics.orders_by_status).map(([status, count]) => <div className="flex justify-between border-b border-emerald-300/10 pb-2" key={status}><span>{status}</span><strong>{count}</strong></div>)}</div></section><section className="card p-6"><h2 className="text-xl font-bold">Users by role</h2><div className="mt-4 space-y-3">{Object.entries(analytics.users_by_role).map(([role, count]) => <div className="flex justify-between border-b border-emerald-300/10 pb-2" key={role}><span className="capitalize">{role.replace('_', ' ')}</span><strong>{count}</strong></div>)}</div></section></div>}
      </div>
    </div>);
}

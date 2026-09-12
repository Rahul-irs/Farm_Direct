import { Activity, ArrowRight, BarChart3, Boxes, ClipboardList, LoaderCircle, ShieldCheck, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminAnalytics, getAdminOverview } from '../../services/api';

export default function AdminDashboardPage() {
    const [overview, setOverview] = useState({ users: 0, farmers: 0, orders: 0, revenue: 0 });
    const [analytics, setAnalytics] = useState(null);
    const [state, setState] = useState({ loading: true, error: '' });

    useEffect(() => {
        Promise.all([getAdminOverview(), getAdminAnalytics()])
            .then(([overviewResult, analyticsResult]) => { setOverview(overviewResult.data); setAnalytics(analyticsResult.data); })
            .catch((requestError) => setState({ loading: false, error: requestError instanceof Error ? requestError.message : 'Unable to load admin overview' }))
            .finally(() => setState((current) => ({ ...current, loading: false })));
    }, []);

    const statusRows = Object.entries(analytics?.orders_by_status || {});
    const roleRows = Object.entries(analytics?.users_by_role || {});
    const maxStatus = Math.max(...statusRows.map(([, count]) => count), 1);
    const maxRole = Math.max(...roleRows.map(([, count]) => count), 1);

    return <main className="admin-command"><div className="admin-command-container">
        <header className="admin-command-hero"><div><p className="admin-kicker"><ShieldCheck size={14}/> Platform control room</p><h1>See the whole network clearly.</h1><p>Monitor the people, produce, orders, and decisions moving through FarmDirect from one accountable workspace.</p><div className="admin-hero-links"><Link to="/admin/users"><Users size={15}/> Manage people</Link><Link to="/admin/products"><Boxes size={15}/> Review catalogue</Link><Link to="/admin/orders"><ClipboardList size={15}/> Inspect orders</Link></div></div><div className="admin-command-mark"><ShieldCheck size={32}/><span>ADMIN<br/>CONTROL</span></div></header>
        {state.error && <p className="admin-error" role="alert">{state.error}</p>}
        {state.loading ? <div className="admin-loading"><LoaderCircle size={22}/><span>Loading platform signals...</span></div> : <><section className="admin-stats"><div><Users size={18}/><span>Total users</span><strong>{overview.users.toLocaleString()}</strong><small>all roles</small></div><div><ShieldCheck size={18}/><span>Farmers</span><strong>{overview.farmers.toLocaleString()}</strong><small>active supply side</small></div><div><ClipboardList size={18}/><span>Orders</span><strong>{overview.orders.toLocaleString()}</strong><small>recorded transactions</small></div><div><BarChart3 size={18}/><span>Gross value</span><strong>₹{(overview.revenue / 100000).toFixed(1)}L</strong><small>order value recorded</small></div></section><div className="admin-command-grid"><section className="admin-analytics-panel"><div className="admin-panel-heading"><div><p className="admin-label"><Activity size={14}/> Order health</p><h2>Orders by status</h2></div><span>LIVE DATA</span></div><div className="admin-bars">{statusRows.length ? statusRows.map(([status, count]) => <div className="admin-bar-row" key={status}><div><span>{status.replaceAll('_', ' ')}</span><strong>{count}</strong></div><div className="admin-bar-track"><i style={{ width: `${Math.max((count / maxStatus) * 100, 4)}%` }}/></div></div>) : <p className="admin-muted">No orders have been recorded yet.</p>}</div></section><section className="admin-analytics-panel"><div className="admin-panel-heading"><div><p className="admin-label"><Users size={14}/> Network mix</p><h2>Users by role</h2></div><span>LIVE DATA</span></div><div className="admin-bars">{roleRows.length ? roleRows.map(([role, count]) => <div className="admin-bar-row" key={role}><div><span>{role.replaceAll('_', ' ')}</span><strong>{count}</strong></div><div className="admin-bar-track admin-role-track"><i style={{ width: `${Math.max((count / maxRole) * 100, 4)}%` }}/></div></div>) : <p className="admin-muted">No user records have been created yet.</p>}</div></section></div><section className="admin-action-strip"><div><span className="admin-label">KEEP THE RECORDS HEALTHY</span><h2>Move from signal to action.</h2><p>Review user access, catalogue quality, and order status without leaving the control room.</p></div><Link to="/admin/audit-logs">Open audit trail <ArrowRight size={15}/></Link></section></>}
    </div></main>;
}

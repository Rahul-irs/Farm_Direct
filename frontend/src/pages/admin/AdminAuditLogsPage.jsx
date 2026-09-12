import { Activity, ArrowLeft, LoaderCircle, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminAuditLogs } from '../../services/api';

export default function AdminAuditLogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getAdminAuditLogs()
            .then((result) => setLogs(result.items || []))
            .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load audit logs'))
            .finally(() => setLoading(false));
    }, []);

    return <main className="admin-command admin-management-page"><div className="admin-command-container">
        <div className="admin-management-breadcrumb"><Link to="/dashboard/admin"><ArrowLeft size={14}/> Admin dashboard</Link><span>AUDIT TRAIL</span></div>
        <header className="admin-management-header"><div className="admin-management-copy"><p className="admin-kicker"><Activity size={14}/> Audit trail</p><h1>Review every meaningful operational event.</h1><p>Track changes to users, orders, and platform records so the system remains accountable and audit-ready.</p></div><div className="admin-command-mark"><ShieldCheck size={32}/><span>CHANGE<br/>LOG</span></div></header>
        <section className="admin-stats admin-stats-compact">
            <div><Activity size={18}/><span>Total events</span><strong>{logs.length.toLocaleString()}</strong><small>recent activity</small></div>
            <div><ShieldCheck size={18}/><span>Latest actor</span><strong>{logs[0]?.actor_id ?? 0}</strong><small>most recent id</small></div>
            <div><Activity size={18}/><span>Tracked types</span><strong>{new Set(logs.map((log) => log.target_type).filter(Boolean)).size.toLocaleString()}</strong><small>record categories</small></div>
            <div><ShieldCheck size={18}/><span>Window</span><strong>{logs.length ? '100' : '0'}</strong><small>last events</small></div>
        </section>
        {error && <p className="admin-error" role="alert">{error}</p>}
        {loading ? <div className="admin-loading"><LoaderCircle size={22}/><span>Loading audit trail...</span></div> : <section className="admin-management-panel"><div className="admin-panel-heading"><div><p className="admin-label"><Activity size={14}/> Platform events</p><h2>Recent activity</h2></div><span>{logs.length} entries</span></div><div className="admin-log-list">{logs.map((log) => <article className="admin-log-card" key={log.id}><div className="admin-log-marker" /><div className="admin-log-main"><div className="admin-log-header"><span className="admin-log-action">{log.action || 'event'}</span><time>{log.created_at ? new Date(log.created_at).toLocaleString() : 'Unknown time'}</time></div><p className="admin-log-target">{log.target_type || 'record'} #{log.target_id || 'n/a'} · Actor #{log.actor_id ?? 'system'}</p><p className="admin-log-details">{log.details || 'No additional details were recorded.'}</p></div></article>)}{logs.length === 0 && <p className="admin-empty-state">No audit events have been captured yet.</p>}</div></section>}
    </div></main>;
}


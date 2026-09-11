import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminAuditLogs } from '../../services/api';
export default function AdminAuditLogsPage() {
    const [logs, setLogs] = useState([]);
    useEffect(() => { getAdminAuditLogs().then((result) => setLogs(result.items)).catch(() => undefined); }, []);
    return <main className="min-h-screen p-6 text-white"><div className="container"><Link className="text-sm text-emerald-200" to="/dashboard/admin">Admin dashboard</Link><h1 className="mt-6 text-4xl font-black">Audit logs</h1><div className="mt-6 space-y-3">{logs.map((log) => <article className="card p-5" key={log.id}><p className="font-semibold">{log.action}</p><p className="mt-1 text-sm text-emerald-50/65">{log.target_type} #{log.target_id || 'n/a'} · {log.details || 'No details'}{log.created_at ? ` · ${new Date(log.created_at).toLocaleString()}` : ''}</p></article>)}{logs.length === 0 && <p className="card p-6 text-emerald-50/65">No audit events yet.</p>}</div></div></main>;
}

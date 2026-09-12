import { ArrowLeft, Ban, CheckCircle2, LoaderCircle, ShieldCheck, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminUsers, updateAdminUserStatus } from '../../services/api';

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadUsers = () => {
        getAdminUsers()
            .then((result) => setUsers(result.items || []))
            .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load users'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadUsers();
    }, []);

    async function toggle(user) {
        try {
            const result = await updateAdminUserStatus(user.id, !user.is_active);
            setUsers((current) => current.map((item) => item.id === user.id ? result.user : item));
            setError('');
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to change user status');
        }
    }

    const activeCount = users.filter((user) => user.is_active).length;
    const adminCount = users.filter((user) => user.role === 'admin').length;
    const farmerCount = users.filter((user) => user.role === 'farmer').length;

    return <main className="admin-command admin-management-page"><div className="admin-command-container">
        <div className="admin-management-breadcrumb"><Link to="/dashboard/admin"><ArrowLeft size={14}/> Admin dashboard</Link><span>PEOPLE DIRECTORY</span></div>
        <header className="admin-management-header"><div className="admin-management-copy"><p className="admin-kicker"><Users size={14}/> People directory</p><h1>Control who can operate the network.</h1><p>Review access, approve active accounts, and keep the platform aligned with the right operational roles.</p></div><div className="admin-command-mark"><Users size={32}/><span>PEOPLE<br/>ACCESS</span></div></header>
        <section className="admin-stats admin-stats-compact">
            <div><Users size={18}/><span>Total users</span><strong>{users.length.toLocaleString()}</strong><small>all roles</small></div>
            <div><ShieldCheck size={18}/><span>Active</span><strong>{activeCount.toLocaleString()}</strong><small>currently enabled</small></div>
            <div><CheckCircle2 size={18}/><span>Admins</span><strong>{adminCount.toLocaleString()}</strong><small>platform operators</small></div>
            <div><ShieldCheck size={18}/><span>Farmers</span><strong>{farmerCount.toLocaleString()}</strong><small>supply partners</small></div>
        </section>
        {error && <p className="admin-error" role="alert">{error}</p>}
        {loading ? <div className="admin-loading"><LoaderCircle size={22}/><span>Loading user directory...</span></div> : <section className="admin-management-panel"><div className="admin-panel-heading"><div><p className="admin-label"><Users size={14}/> Access</p><h2>Account roster</h2></div><span>{users.length} records</span></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td><div className="admin-user-cell"><span className="admin-user-avatar">{(user.full_name || user.email || 'U').charAt(0).toUpperCase()}</span><div><strong>{user.full_name || 'Unnamed user'}</strong><small>{user.phone || 'No phone on file'}</small></div></div></td><td>{user.email}</td><td><span className="admin-role-badge">{String(user.role || 'user').replaceAll('_', ' ')}</span></td><td><span className={`admin-status-pill ${user.is_active ? 'is-active' : 'is-inactive'}`}>{user.is_active ? 'Active' : 'Inactive'}</span></td><td><button className="admin-toggle-button" type="button" onClick={() => toggle(user)}>{user.is_active ? <><Ban size={14}/> Deactivate</> : <><CheckCircle2 size={14}/> Activate</>}</button></td></tr>)}</tbody></table>{users.length === 0 && <p className="admin-empty-state">No users have been registered yet.</p>}</div></section>}
    </div></main>;
}


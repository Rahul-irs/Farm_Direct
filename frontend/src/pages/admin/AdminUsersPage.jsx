import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminUsers, updateAdminUserStatus } from '../../services/api';
export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    useEffect(() => { getAdminUsers().then((result) => setUsers(result.items)).catch(() => undefined); }, []);
    async function toggle(user) { const result = await updateAdminUserStatus(user.id, !user.is_active); setUsers((current) => current.map((item) => item.id === user.id ? result.user : item)); }
    return <main className="min-h-screen p-6 text-white"><div className="container"><Link className="text-sm text-emerald-200" to="/dashboard/admin">Admin dashboard</Link><h1 className="mt-6 text-4xl font-black">Users</h1><div className="mt-6 overflow-x-auto"><table className="card w-full min-w-[760px] text-left"><thead><tr className="border-b border-emerald-300/10 text-sm text-emerald-200/70"><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead><tbody>{users.map((user) => <tr className="border-b border-emerald-300/10" key={user.id}><td className="p-4">{user.full_name}</td><td className="p-4">{user.email}</td><td className="p-4 capitalize">{user.role.replace('_', ' ')}</td><td className="p-4">{user.is_active ? 'Active' : 'Inactive'}</td><td className="p-4"><button className="btn-secondary" type="button" onClick={() => toggle(user)}>{user.is_active ? 'Deactivate' : 'Activate'}</button></td></tr>)}</tbody></table>{users.length === 0 && <p className="mt-5 text-emerald-50/65">No users registered yet.</p>}</div></div></main>;
}

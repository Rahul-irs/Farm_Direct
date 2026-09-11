import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
export default function DashboardShell() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const user = JSON.parse(localStorage.getItem('farmdirect_user') || '{}');
    const role = user.role || 'consumer';
    const links = role === 'farmer' ? [['/dashboard/farmer', 'Dashboard'], ['/farmer/products', 'Products'], ['/farmer/orders', 'Orders']] : role === 'admin' ? [['/dashboard/admin', 'Dashboard'], ['/admin/users', 'Users'], ['/admin/products', 'Products'], ['/admin/orders', 'Orders']] : role === 'logistics_provider' ? [['/dashboard/logistics', 'Operations'], ['/logistics/route-estimate', 'Routes']] : role === 'consumer' || role === 'bulk_buyer' ? [['/dashboard/consumer', 'Dashboard'], ['/marketplace', 'Marketplace'], ['/orders', 'Orders'], ['/payments', 'Payments'], ['/notifications', 'Notifications']] : [[`/dashboard/${role === 'field_assistant' ? 'field-assistant' : role}`, 'Workspace']];
    function logout() { localStorage.removeItem('farmdirect_token'); localStorage.removeItem('farmdirect_user'); navigate('/login'); }
    return <><header className="dashboard-header sticky top-0 z-20 px-4 py-3 md:px-6"><div className="container flex items-center justify-between"><Link className="dashboard-brand" to={links[0][0]}><span className="dashboard-brand-mark">FD</span>FarmDirect <em>AI</em></Link><button className="dashboard-menu" type="button" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>{open ? <X size={20}/> : <Menu size={20}/>}</button><nav className={`${open ? 'dashboard-nav-open' : ''} dashboard-nav`}>{links.map(([path, label]) => <Link className="dashboard-link" onClick={() => setOpen(false)} to={path} key={path}>{label}</Link>)}<Link className="dashboard-link" to="/profile">{user.full_name || 'Profile'}</Link><button className="dashboard-logout" type="button" onClick={logout}>Log out</button></nav></div></header><Outlet /></>;
}

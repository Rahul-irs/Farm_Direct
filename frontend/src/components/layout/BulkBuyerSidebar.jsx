import { BarChart3, Bell, ClipboardList, CreditCard, LayoutDashboard, LogOut, Search, Settings, ShoppingBasket, Sparkles, Truck, UserRound, Wheat } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export default function BulkBuyerSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const isActive = (path) => location.pathname === path || (path !== '/dashboard/bulk-buyer' && location.pathname.startsWith(`${path}/`));
    function logout() {
        localStorage.removeItem('farmdirect_token');
        localStorage.removeItem('farmdirect_user');
        navigate('/login');
    }
    return <aside className="bulk-buyer-sidebar">
        <div className="bulk-buyer-rail-brand"><div className="bulk-buyer-rail-logo"><Wheat size={18}/></div><div><strong>FarmDirect AI</strong><small>Direct from Farm to You</small></div></div>
        <div className="bulk-buyer-role-badge"><span className="bulk-buyer-role-icon"><ShoppingBasket size={13}/></span><div><strong>Bulk Buyer</strong><small>Wholesale · Institutional</small></div></div>
        <nav className="bulk-buyer-sidebar-nav" aria-label="Bulk buyer navigation">
            <Link className={`bulk-buyer-nav-item ${isActive('/dashboard/bulk-buyer') ? 'active' : ''}`} to="/dashboard/bulk-buyer"><LayoutDashboard size={15}/> Dashboard</Link>
            <Link className={`bulk-buyer-nav-item ${isActive('/marketplace') ? 'active' : ''}`} to="/marketplace"><Search size={15}/> Find Products</Link>
            <Link className={`bulk-buyer-nav-item ${isActive('/bulk-buyer/requirements') ? 'active' : ''}`} to="/bulk-buyer/requirements"><ClipboardList size={15}/> Requirements</Link>
            <Link className={`bulk-buyer-nav-item ${isActive('/bulk-buyer/matching') ? 'active' : ''}`} to="/bulk-buyer/matching"><Sparkles size={15}/> AI Matching</Link>
            <Link className={`bulk-buyer-nav-item ${isActive('/orders') ? 'active' : ''}`} to="/orders"><ShoppingBasket size={15}/> Bulk Orders</Link>
            <Link className={`bulk-buyer-nav-item ${isActive('/bulk-buyer/logistics') ? 'active' : ''}`} to="/bulk-buyer/logistics"><Truck size={15}/> Logistics</Link>
            <Link className={`bulk-buyer-nav-item ${isActive('/payments') ? 'active' : ''}`} to="/payments"><CreditCard size={15}/> Payments</Link>
            <Link className={`bulk-buyer-nav-item ${isActive('/bulk-buyer/analytics') ? 'active' : ''}`} to="/bulk-buyer/analytics"><BarChart3 size={15}/> Analytics</Link>
            <Link className={`bulk-buyer-nav-item ${isActive('/notifications') ? 'active' : ''}`} to="/notifications"><Bell size={15}/> Notifications <span className="bulk-buyer-nav-alert">1</span></Link>
            <Link className={`bulk-buyer-nav-item ${isActive('/profile') ? 'active' : ''}`} to="/profile"><UserRound size={15}/> Profile</Link>
            <Link className={`bulk-buyer-nav-item bulk-buyer-nav-button ${isActive('/bulk-buyer/settings') ? 'active' : ''}`} to="/bulk-buyer/settings"><Settings size={15}/> Settings</Link>
        </nav>
        <div className="bulk-buyer-sidebar-foot"><div className="bulk-buyer-support-card"><span className="bulk-buyer-support-mark"><Wheat size={13}/></span><div><strong>Growing Together</strong><small>Supporting Farmers</small></div></div><button type="button" className="bulk-buyer-nav-item bulk-buyer-logout" onClick={logout}><LogOut size={15}/> Log out</button></div>
    </aside>;
}

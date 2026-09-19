import { Outlet } from 'react-router-dom';
import BulkBuyerSidebar from './BulkBuyerSidebar';
import DashboardShell from './DashboardShell';

export default function BulkBuyerRoleShell() {
    const user = JSON.parse(localStorage.getItem('farmdirect_user') || '{}');
    if (user.role === 'consumer') return <DashboardShell />;
    return <main className="bulk-buyer-page"><div className="bulk-buyer-shell bulk-buyer-route-shell"><BulkBuyerSidebar /><div className="bulk-buyer-role-content"><Outlet /></div></div></main>;
}

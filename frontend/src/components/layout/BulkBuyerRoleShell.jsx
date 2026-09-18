import { Outlet } from 'react-router-dom';
import BulkBuyerSidebar from './BulkBuyerSidebar';

export default function BulkBuyerRoleShell() {
    return <main className="bulk-buyer-page"><div className="bulk-buyer-shell bulk-buyer-route-shell"><BulkBuyerSidebar /><div className="bulk-buyer-role-content"><Outlet /></div></div></main>;
}

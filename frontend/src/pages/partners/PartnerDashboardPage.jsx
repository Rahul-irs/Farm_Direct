import { ArrowRight, BarChart3, Bell, Boxes, CheckCircle2, ClipboardList, LayoutDashboard, Plus, RefreshCw, Search, Settings, ShieldCheck, ShoppingBasket, Store, Tractor, Truck, Users, Wheat } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { changePassword, createPartnerRecord, deletePartnerRecord, getFpoOverview, getNotifications, getPartnerRecords, getPartnerRequirementMatches, markNotificationRead, updatePartnerRecord, updateProfile } from '../../services/api';
import { getProductImage } from '../../utils/productImages';
import FpoSettingsPage from './FpoSettingsPage';

function FpoWorkspace() {
    const location = useLocation();
    const [aggregations, setAggregations] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [overview, setOverview] = useState({ metrics: {}, top_crops: [], recent_orders: [] });
    const [memberSearch, setMemberSearch] = useState('');
    const [memberStatus, setMemberStatus] = useState('ALL');
    const [showMemberForm, setShowMemberForm] = useState(false);
    const [newMemberId, setNewMemberId] = useState('');
    const [farmerSearch, setFarmerSearch] = useState('');
    const [farmerCrop, setFarmerCrop] = useState('ALL');
    const [bulkBuyerRequests, setBulkBuyerRequests] = useState([]);
    const [bulkBuyerStatus, setBulkBuyerStatus] = useState('ALL');
    const [fpoNotifications, setFpoNotifications] = useState([]);
    const [fpoProfile, setFpoProfile] = useState({ full_name: '', email: '', phone: '', address: '', language: '' });
    const [fpoPassword, setFpoPassword] = useState({ current: '', next: '' });
    const [fpoSettingsEditing, setFpoSettingsEditing] = useState(false);
    const [fpoDeliveries, setFpoDeliveries] = useState([]);
    const [fpoAnalytics, setFpoAnalytics] = useState({ metrics: {}, by_crop: [] });

    async function load() {
        setLoading(true);
        setError('');
        try {
            const [aggregationResult, memberResult] = await Promise.all([
                getPartnerRecords('fpo/aggregations'),
                getPartnerRecords('fpo/members'),
            ]);
            const overviewResult = await getFpoOverview();
            const bulkBuyerResult = await getPartnerRecords('fpo/bulk-buyers');
            const [deliveryResult, analyticsResult] = await Promise.all([
                getPartnerRecords('fpo/logistics'),
                getPartnerRecords('fpo/analytics'),
            ]);
            const notificationResult = await getNotifications();
            const storedUser = JSON.parse(localStorage.getItem('farmdirect_user') || '{}');
            setFpoNotifications(notificationResult.items || []);
            setFpoProfile({ full_name: storedUser.full_name || '', email: storedUser.email || '', phone: storedUser.phone || '', address: storedUser.profile_data?.address || '', language: storedUser.profile_data?.language || '' });
            const nextAggregations = aggregationResult.items || [];
            const nextMembers = memberResult.items || [];
            setAggregations(nextAggregations);
            setMembers(overviewResult.members || nextMembers);
            setOverview(overviewResult);
            setBulkBuyerRequests(bulkBuyerResult.items || []);
            setFpoDeliveries(deliveryResult.items || []);
            setFpoAnalytics(analyticsResult);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to load FPO workspace');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function addMember(event) {
        event.preventDefault();
        setError('');
        try {
            await createPartnerRecord('fpo/members', { farmer_id: Number(newMemberId) });
            setNewMemberId('');
            setShowMemberForm(false);
            setMessage('Farmer added to your FPO network.');
            await load();
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to add farmer');
        }
    }

    const totalVolume = useMemo(() => aggregations.reduce((total, record) => total + Number(record.quantity || 0), 0), [aggregations]);
    const cropCount = new Set((aggregations || []).map((record) => String(record.crop || '').toLowerCase()).filter(Boolean)).size;
    const memberPreview = members.slice(0, 3);
    const ledgerPreview = aggregations.slice(0, 3);
    const overviewMetrics = overview.metrics || {};
    const topCrops = overview.top_crops || [];
    const recentOrders = overview.recent_orders || [];
    const farmerSupply = overview.farmer_supply || [];
    const isOverview = location.pathname === '/dashboard/fpo' || location.pathname === '/fpo';
    const isMembers = location.pathname === '/fpo/members';
    const isFarmers = location.pathname === '/fpo/farmers';
    const isAggregation = location.pathname === '/fpo/aggregations';
    const [aggregationCrop, setAggregationCrop] = useState('');
    const [aggregationQuantity, setAggregationQuantity] = useState('');
    const [aggregationStatus, setAggregationStatus] = useState('ALL');
        const [marketSearch, setMarketSearch] = useState('');
        const [marketCategory, setMarketCategory] = useState('ALL');
        const [inventoryCategory, setInventoryCategory] = useState('ALL');
        const [inventorySearch, setInventorySearch] = useState('');
        const [inventoryQuantities, setInventoryQuantities] = useState({});
        const [savingInventory, setSavingInventory] = useState(null);
        const marketplace = overview.marketplace || [];
        const isMarketplace = location.pathname === '/fpo/marketplace';
        const isInventory = location.pathname === '/fpo/inventory';
        const isBulkBuyers = location.pathname === '/fpo/bulk-buyers';
        const isLogistics = location.pathname === '/fpo/logistics';
        const isAnalytics = location.pathname === '/fpo/analytics';
        const isNotifications = location.pathname === '/fpo/notifications';
        const isSettings = location.pathname === '/fpo/settings';
    const filteredMembers = members.filter((member) => {
        const matchesSearch = `${member.name || ''} ${member.farmer_id || ''}`.toLowerCase().includes(memberSearch.trim().toLowerCase());
        return matchesSearch && (memberStatus === 'ALL' || member.status === memberStatus);
    });
    const farmerCrops = [...new Set(farmerSupply.flatMap((farmer) => farmer.crops || []))].sort();
    const filteredFarmers = farmerSupply.filter((farmer) => {
        const matchesSearch = `${farmer.name} ${farmer.farmer_id} ${farmer.location}`.toLowerCase().includes(farmerSearch.trim().toLowerCase());
        return matchesSearch && (farmerCrop === 'ALL' || farmer.crops.includes(farmerCrop));
    });
    const filteredAggregations = aggregations.filter((record) => aggregationStatus === 'ALL' || record.status === aggregationStatus);
        const marketCategories = [...new Set(marketplace.map((product) => product.category).filter(Boolean))].sort();
        const filteredMarketplace = marketplace.filter((product) => {
            const matchesSearch = `${product.name} ${product.crop} ${product.location}`.toLowerCase().includes(marketSearch.trim().toLowerCase());
            return matchesSearch && (marketCategory === 'ALL' || product.category === marketCategory);
        });
        const inventoryCategories = [...new Set(marketplace.map((product) => product.category).filter(Boolean))].sort();
        const filteredInventory = marketplace.filter((product) => {
            const matchesSearch = `${product.name} ${product.crop} ${product.location}`.toLowerCase().includes(inventorySearch.trim().toLowerCase());
            return matchesSearch && (inventoryCategory === 'ALL' || product.category === inventoryCategory);
        });
        const filteredBulkBuyerRequests = bulkBuyerRequests.filter((requestItem) => bulkBuyerStatus === 'ALL' || requestItem.status === bulkBuyerStatus);
        const deliveryCounts = fpoDeliveries.reduce((counts, delivery) => ({ ...counts, [delivery.status]: (counts[delivery.status] || 0) + 1 }), {});
        const unreadFpoNotifications = fpoNotifications.filter((item) => !item.is_read).length;
        async function readFpoNotification(item) {
            try { await markNotificationRead(item.id); setFpoNotifications((current) => current.map((entry) => entry.id === item.id ? { ...entry, is_read: true } : entry)); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to update notification'); }
        }
        async function saveFpoSettings(event) {
            event.preventDefault();
            setError('');
            try {
                const result = await updateProfile(fpoProfile);
                localStorage.setItem('farmdirect_user', JSON.stringify({ ...JSON.parse(localStorage.getItem('farmdirect_user') || '{}'), ...result.user }));
                setFpoSettingsEditing(false);
                setMessage('FPO settings saved successfully.');
            } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to save FPO settings'); }
        }
        async function saveFpoPassword(event) {
            event.preventDefault();
            try { await changePassword(fpoPassword.current, fpoPassword.next); setFpoPassword({ current: '', next: '' }); setMessage('Password updated successfully.'); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to change password'); }
        }
        async function updateBulkBuyerStatus(requestItem, status) {
            setError('');
            try {
                await updatePartnerRecord(`fpo/bulk-buyers/${requestItem.id}`, { status });
                setBulkBuyerRequests((current) => current.map((item) => item.id === requestItem.id ? { ...item, status } : item));
                setMessage(`Request #${requestItem.id} marked ${status.toLowerCase().replace('_', ' ')}.`);
            } catch (requestError) {
                setError(requestError instanceof Error ? requestError.message : 'Unable to update bulk request');
            }
        }
        async function saveInventory(product) {
            setSavingInventory(product.id);
            setError('');
            try {
                await updatePartnerRecord(`fpo/inventory/${product.id}`, { quantity: Number(inventoryQuantities[product.id] ?? product.quantity) });
                setMessage(`${product.name} inventory updated.`);
                await load();
            } catch (requestError) {
                setError(requestError instanceof Error ? requestError.message : 'Unable to update inventory');
            } finally {
                setSavingInventory(null);
            }
        }
    async function addAggregation(event) {
        event.preventDefault();
        setError('');
        try {
            await createPartnerRecord('fpo/aggregations', { crop: aggregationCrop, quantity: Number(aggregationQuantity) });
            setAggregationCrop('');
            setAggregationQuantity('');
            setMessage('Crop aggregation added to inventory.');
            await load();
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to add aggregation');
        }
    }
    const monthlySales = Object.entries(overview.monthly_sales || {});
    const maxMonthlySales = Math.max(...monthlySales.map(([, value]) => Number(value)), 1);
    const sidebarItems = [
        ['Dashboard', '/dashboard/fpo', LayoutDashboard],
        ['Members', '/fpo/members', Users],
        ['Farmers', '/fpo/farmers', Tractor],
        ['Inventory', '/fpo/inventory', Boxes],
        ['Aggregation', '/fpo/aggregations', Wheat],
        ['Marketplace', '/fpo/marketplace', ShoppingBasket],
        ['Bulk Buyers', '/fpo/bulk-buyers', Store],
        ['Logistics', '/fpo/logistics', Truck],
        ['Analytics', '/fpo/analytics', BarChart3],
        ['Notifications', '/fpo/notifications', Bell],
        ['Settings', '/fpo/settings', Settings],
    ];

    const isActive = (path) => location.pathname === path || (path !== '/dashboard/fpo' && location.pathname.startsWith(path));

    return (
        <main className="fpo-page">
            <div className="fpo-shell">
                <aside className="fpo-sidebar">
                    <div className="fpo-brand-block">
                        <div className="fpo-brand-mark">FD</div>
                        <div className="fpo-brand-copy">
                            <strong>FarmDirect</strong>
                            <small>AI / FPO</small>
                        </div>
                    </div>

                    <nav className="fpo-sidebar-nav" aria-label="FPO dashboard navigation">
                        {sidebarItems.map(([label, path, Icon]) => (
                            <Link className={`fpo-nav-item ${isActive(path) ? 'is-active' : ''}`} to={path} key={label}>
                                <Icon size={15} />
                                <span>{label}</span>
                            </Link>
                        ))}
                    </nav>

                    <div className="fpo-sidebar-status">
                        <span className="fpo-live-pill">Live</span>
                        <span>Harvest sync</span>
                    </div>
                </aside>

                <div className="fpo-main-panel">
                    <header className="fpo-topbar">
                        <div className="fpo-search-box">
                            <Search size={15} />
                            <input type="text" value="" readOnly placeholder="Search produce, orders..." aria-label="Search workspace" />
                        </div>
                        <div className="fpo-topbar-actions">
                            <button type="button" className="fpo-topbar-button" onClick={load} disabled={loading}>
                                <RefreshCw size={15} />
                                {loading ? 'Refresh' : 'Refresh'}
                            </button>
                            <Link className="fpo-icon-button" to="/fpo/notifications" aria-label="Notifications"><Bell size={15} /></Link>
                            <Link className="fpo-avatar" to="/profile" aria-label="Open FPO profile">G</Link>
                        </div>
                    </header>

                    {isNotifications ? <section className="fpo-members-page fpo-notifications-page">
                        <div className="fpo-section-heading"><div><span className="fpo-card-label">FPO activity</span><h1>Notifications</h1><p>Stay updated on farmer, buyer, payment, and delivery activity.</p></div><button type="button" className="fpo-primary-action" onClick={load}><RefreshCw size={14} /> Refresh Alerts</button></div>
                        <div className="fpo-farmer-summary"><div><span>🔔 Total alerts</span><strong>{fpoNotifications.length}</strong></div><div><span>🟠 Unread</span><strong>{unreadFpoNotifications}</strong></div><div><span>✅ Read</span><strong>{fpoNotifications.length - unreadFpoNotifications}</strong></div></div>
                        <div className="fpo-notification-list">{fpoNotifications.map((item) => <article className={`fpo-notification-card ${item.is_read ? 'is-read' : ''}`} key={item.id}><span className="fpo-notification-icon">{item.title?.toLowerCase().includes('payment') ? '💳' : item.title?.toLowerCase().includes('delivery') || item.title?.toLowerCase().includes('shipment') ? '🚚' : item.title?.toLowerCase().includes('order') ? '🧾' : '🔔'}</span><div><h3>{item.title}</h3><p>{item.message}</p><small>{item.created_at ? new Date(item.created_at).toLocaleString('en-IN') : 'Recent update'}</small></div>{!item.is_read && <button type="button" className="fpo-primary-action fpo-save-button" onClick={() => readFpoNotification(item)}>Mark read</button>}</article>)}{!fpoNotifications.length && <div className="fpo-farmer-empty">No notifications yet.</div>}</div>
                    </section> : false ? <section className="fpo-members-page fpo-settings-page">
                        <div className="fpo-section-heading"><div><span className="fpo-card-label">FPO administration</span><h1>Settings</h1><p>Manage your FPO profile, account security, and notification preferences.</p></div><div className="fpo-settings-heading-actions"><span className="fpo-settings-verified">✓ Verified FPO</span><button type="button" className="fpo-primary-action" onClick={() => setFpoSettingsEditing((editing) => !editing)}>{fpoSettingsEditing ? 'Cancel' : 'Edit Profile'}</button></div></div>
                        <div className="fpo-settings-layout"><form className="fpo-settings-form" onSubmit={saveFpoSettings}><div className="fpo-settings-form-head"><span className="fpo-settings-icon">🏢</span><div><h2>FPO Profile</h2><p>Keep your organisation details current.</p></div></div><label>FPO name<input required value={fpoProfile.full_name} onChange={(event) => setFpoProfile((current) => ({ ...current, full_name: event.target.value }))} /></label><label>Email<input required type="email" value={fpoProfile.email} onChange={(event) => setFpoProfile((current) => ({ ...current, email: event.target.value }))} /></label><label>Phone<input value={fpoProfile.phone} onChange={(event) => setFpoProfile((current) => ({ ...current, phone: event.target.value }))} /></label><label>Address<input value={fpoProfile.address} onChange={(event) => setFpoProfile((current) => ({ ...current, address: event.target.value }))} /></label><label>Preferred language<select value={fpoProfile.language} onChange={(event) => setFpoProfile((current) => ({ ...current, language: event.target.value }))}><option value="">Select language</option><option>English</option><option>Telugu</option><option>Hindi</option></select></label><button type="submit" className="fpo-primary-action"><CheckCircle2 size={14} /> Save Profile</button></form><form className="fpo-settings-form" onSubmit={saveFpoPassword}><div className="fpo-settings-form-head"><span className="fpo-settings-icon">🔐</span><div><h2>Security</h2><p>Update your account password.</p></div></div><label>Current password<input required type="password" value={fpoPassword.current} onChange={(event) => setFpoPassword((current) => ({ ...current, current: event.target.value }))} /></label><label>New password<input required minLength="8" type="password" value={fpoPassword.next} onChange={(event) => setFpoPassword((current) => ({ ...current, next: event.target.value }))} /></label><button type="submit" className="fpo-primary-action"><ShieldCheck size={14} /> Update Password</button></form></div>
                    </section> : isSettings ? <FpoSettingsPage /> : isLogistics ? <section className="fpo-members-page fpo-logistics-page">
                        <div className="fpo-section-heading"><div><span className="fpo-card-label">FPO operations</span><h1>Logistics &amp; Delivery</h1><p>Track every member-farmer shipment from pickup to delivery.</p></div><button type="button" className="fpo-primary-action" onClick={load}><RefreshCw size={14} /> Refresh Routes</button></div>
                        <div className="fpo-farmer-summary"><div><span>🚚 Total deliveries</span><strong>{fpoDeliveries.length}</strong></div><div><span>🟢 In progress</span><strong>{(deliveryCounts.IN_TRANSIT || 0) + (deliveryCounts.PICKED_UP || 0) + (deliveryCounts.OUT_FOR_DELIVERY || 0)}</strong></div><div><span>✅ Delivered</span><strong>{deliveryCounts.DELIVERED || 0}</strong></div></div>
                        <div className="fpo-delivery-board">{fpoDeliveries.map((delivery) => <article className="fpo-delivery-card" key={delivery.id}><div className="fpo-delivery-card-head"><span>🚚 Delivery #{delivery.id}</span><span className={`fpo-status-pill ${String(delivery.status).toLowerCase()}`}>{delivery.status.replace('_', ' ')}</span></div><div className="fpo-delivery-route"><strong>{delivery.pickup_location}</strong><ArrowRight size={14} /><strong>{delivery.destination}</strong></div><div className="fpo-delivery-meta"><span>📦 Order #{delivery.order_id}</span><span>{delivery.driver ? `👤 ${delivery.driver.full_name}` : 'Driver pending'}</span><span>{delivery.vehicle ? `🚛 ${delivery.vehicle.registration_number}` : 'Vehicle pending'}</span></div><div className="fpo-delivery-events">{delivery.events?.slice(-3).map((event) => <span key={event.id}>● {event.status.replace('_', ' ')}</span>)}</div></article>)}{!fpoDeliveries.length && <div className="fpo-farmer-empty">No deliveries are linked to your member farmers yet.</div>}</div>
                    </section> : isAnalytics ? <section className="fpo-members-page fpo-analytics-page">
                        <div className="fpo-section-heading"><div><span className="fpo-card-label">FPO intelligence</span><h1>FPO Analytics</h1><p>Understand sales, crop performance, and network activity.</p></div><button type="button" className="fpo-primary-action" onClick={load}><RefreshCw size={14} /> Refresh Analytics</button></div>
                        <div className="fpo-farmer-summary"><div><span>💰 Total sales</span><strong>₹{Number(fpoAnalytics.metrics?.total_sales || 0).toLocaleString('en-IN')}</strong></div><div><span>📦 Total quantity</span><strong>{Number(fpoAnalytics.metrics?.total_quantity || 0).toLocaleString('en-IN')} kg</strong></div><div><span>🧾 Total orders</span><strong>{fpoAnalytics.metrics?.total_orders || 0}</strong></div></div>
                        <div className="fpo-analytics-layout"><article className="fpo-card fpo-analytics-chart"><div className="fpo-card-head"><div><span className="fpo-card-label">Sales by crop</span><h3>Crop Performance</h3></div></div>{(fpoAnalytics.by_crop || []).length ? <div className="fpo-analytics-bars">{fpoAnalytics.by_crop.map((crop) => { const max = Math.max(...fpoAnalytics.by_crop.map((item) => Number(item.sales)), 1); return <div className="fpo-analytics-bar" key={crop.crop}><div><strong>{crop.crop}</strong><small>₹{Number(crop.sales).toLocaleString('en-IN')}</small></div><span style={{ width: `${Math.max(Number(crop.sales) / max * 100, 5)}%` }} /><small>{Number(crop.quantity).toLocaleString('en-IN')} kg</small></div>; })}</div> : <p className="fpo-analytics-empty">No completed sales data yet.</p>}</article><article className="fpo-card fpo-analytics-chart"><div className="fpo-card-head"><div><span className="fpo-card-label">Network health</span><h3>Active Farmers</h3></div></div><div className="fpo-analytics-ring"><strong>{fpoAnalytics.metrics?.active_farmers || 0}</strong><span>farmers</span></div><p className="fpo-analytics-note">Member activity is calculated from active FPO relationships.</p></article></div>
                    </section> : isMembers ? <section className="fpo-members-page">
                        <div className="fpo-section-heading">
                            <div><span className="fpo-card-label">FPO network</span><h1>Members Management</h1><p>Manage the farmers connected to your FPO.</p></div>
                            <button type="button" className="fpo-primary-action" onClick={() => setShowMemberForm((open) => !open)}><Plus size={14} /> Add Member</button>
                        </div>
                        {showMemberForm && <form className="fpo-member-form" onSubmit={addMember}><label>Farmer ID<input required type="number" min="1" value={newMemberId} onChange={(event) => setNewMemberId(event.target.value)} placeholder="Enter farmer ID" /></label><button type="submit" className="fpo-primary-action">Add Farmer</button></form>}
                        <div className="fpo-member-toolbar"><label className="fpo-member-search"><Search size={14} /><input value={memberSearch} onChange={(event) => setMemberSearch(event.target.value)} placeholder="Search by name or farmer ID..." aria-label="Search members" /></label><select value={memberStatus} onChange={(event) => setMemberStatus(event.target.value)} aria-label="Filter members by status"><option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="PENDING">Pending</option></select></div>
                        <div className="fpo-members-table-wrap"><table className="fpo-members-table"><thead><tr><th>Farmer</th><th>Farmer ID</th><th>Village</th><th>Role</th><th>Status</th><th>Joined</th></tr></thead><tbody>{filteredMembers.map((member) => <tr key={member.id}><td><span className="fpo-table-avatar">{String(member.name || 'Farmer').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span><strong>{member.name || `Farmer #${member.farmer_id}`}</strong></td><td>FD-{String(member.farmer_id).padStart(4, '0')}</td><td>--</td><td>Farmer</td><td><span className={`fpo-status-pill ${String(member.status).toLowerCase()}`}>{member.status}</span></td><td>Active network</td></tr>)}{!filteredMembers.length && <tr><td className="fpo-empty-row" colSpan="6">No members match this filter.</td></tr>}</tbody></table></div><div className="fpo-members-footer"><span>Showing {filteredMembers.length} of {members.length} members</span><div><span>Page 1</span></div></div>
                    </section> : isFarmers ? <section className="fpo-members-page">
                        <div className="fpo-section-heading"><div><span className="fpo-card-label">FPO network</span><h1>Farmer Supply</h1><p>Monitor every farmer's live supply contribution.</p></div><Link className="fpo-primary-action" to="/fpo/members"><Users size={14} /> Manage Members</Link></div>
                        <div className="fpo-farmer-summary"><div><span><i aria-hidden="true">👨‍🌾</i> Active farmers</span><strong>{farmerSupply.length}</strong></div><div><span><i aria-hidden="true">📦</i> Total supply</span><strong>{Number(overviewMetrics.supply || 0).toLocaleString('en-IN')} kg</strong></div><div><span><i aria-hidden="true">🌾</i> Crop lines</span><strong>{farmerCrops.length}</strong></div></div>
                        <div className="fpo-member-toolbar"><label className="fpo-member-search"><Search size={14} /><input value={farmerSearch} onChange={(event) => setFarmerSearch(event.target.value)} placeholder="Search farmers or locations..." aria-label="Search farmers" /></label><select value={farmerCrop} onChange={(event) => setFarmerCrop(event.target.value)} aria-label="Filter farmers by crop"><option value="ALL">All crops</option>{farmerCrops.map((crop) => <option value={crop} key={crop}>{crop}</option>)}</select></div>
                        <div className="fpo-farmer-grid">{filteredFarmers.map((farmer) => <article className="fpo-farmer-card" key={farmer.farmer_id}><div className="fpo-farmer-card-top"><span className="fpo-table-avatar">{String(farmer.name).split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span><div><h3>{farmer.name}</h3><small>FD-{String(farmer.farmer_id).padStart(4, '0')} · {farmer.location}</small></div><span className="fpo-status-pill active">● {farmer.status}</span></div><div className="fpo-farmer-card-stats"><div><span>📦 Supply</span><strong>{Number(farmer.quantity).toLocaleString('en-IN')} kg</strong></div><div><span>🧺 Listings</span><strong>{farmer.products}</strong></div></div><div className="fpo-farmer-crops">{farmer.crops.length ? farmer.crops.map((crop) => <span key={crop}>{({ Tomato: '🍅', Onion: '🧅', Rice: '🌾', Mango: '🥭', Banana: '🍌' }[crop] || '🥬')} {crop}</span>) : <span>🌱 No active listings</span>}</div></article>)}{!filteredFarmers.length && <div className="fpo-farmer-empty">No farmers match this filter.</div>}</div>
                    </section> : isBulkBuyers ? <section className="fpo-members-page fpo-bulk-buyers-page">
                        <div className="fpo-section-heading"><div><span className="fpo-card-label">FPO commerce</span><h1>Bulk Buyer Orders</h1><p>Review and coordinate high-volume requests from verified buyers.</p></div><button type="button" className="fpo-primary-action" onClick={load}><RefreshCw size={14} /> Refresh Requests</button></div>
                        <div className="fpo-request-tabs"><button className={bulkBuyerStatus === 'ALL' ? 'active' : ''} type="button" onClick={() => setBulkBuyerStatus('ALL')}>All Requests <b>{bulkBuyerRequests.length}</b></button><button className={bulkBuyerStatus === 'OPEN' ? 'active' : ''} type="button" onClick={() => setBulkBuyerStatus('OPEN')}>New Requests</button><button className={bulkBuyerStatus === 'ACCEPTED' ? 'active' : ''} type="button" onClick={() => setBulkBuyerStatus('ACCEPTED')}>Accepted</button><button className={bulkBuyerStatus === 'COMPLETED' ? 'active' : ''} type="button" onClick={() => setBulkBuyerStatus('COMPLETED')}>Completed</button><button className={bulkBuyerStatus === 'IN_TRANSIT' ? 'active' : ''} type="button" onClick={() => setBulkBuyerStatus('IN_TRANSIT')}>In Transit</button><button className={bulkBuyerStatus === 'DELIVERED' ? 'active' : ''} type="button" onClick={() => setBulkBuyerStatus('DELIVERED')}>Delivered</button></div>
                        <div className="fpo-member-toolbar"><label className="fpo-member-search"><Search size={14} /><input placeholder="Search buyer requests..." aria-label="Search buyer requests" onChange={(event) => setMemberSearch(event.target.value)} /></label><span className="fpo-market-count">{filteredBulkBuyerRequests.length} requests</span></div>
                        <div className="fpo-members-table-wrap"><table className="fpo-members-table fpo-bulk-table"><thead><tr><th>Buyer</th><th>Product</th><th>Quantity</th><th>Location</th><th>Budget</th><th>Status</th><th>Action</th></tr></thead><tbody>{filteredBulkBuyerRequests.filter((item) => `${item.buyer_name} ${item.crop} ${item.location}`.toLowerCase().includes(memberSearch.toLowerCase())).map((requestItem) => <tr key={requestItem.id}><td><span className="fpo-table-avatar">{String(requestItem.buyer_name).slice(0, 2).toUpperCase()}</span><strong>{requestItem.buyer_name}</strong></td><td><span className="fpo-crop-emoji">{{ Tomato: '🍅', Onion: '🧅', Rice: '🌾', Mango: '🥭', Banana: '🍌' }[requestItem.crop] || '🥬'}</span>{requestItem.crop}</td><td>{Number(requestItem.quantity).toLocaleString('en-IN')} kg</td><td>{requestItem.location}</td><td>{requestItem.estimated_value ? `₹${Number(requestItem.estimated_value).toLocaleString('en-IN')}` : 'Awaiting quote'}</td><td><span className={`fpo-status-pill ${String(requestItem.status).toLowerCase()}`}>{requestItem.status.replace('_', ' ')}</span></td><td>{requestItem.status === 'OPEN' ? <button type="button" className="fpo-primary-action fpo-save-button" onClick={() => updateBulkBuyerStatus(requestItem, 'ACCEPTED')}>Accept</button> : <button type="button" className="fpo-row-menu" onClick={() => setMessage(`Request #${requestItem.id} is ${requestItem.status.toLowerCase().replace('_', ' ')}.`)}>View</button>}</td></tr>)}{!filteredBulkBuyerRequests.length && <tr><td className="fpo-empty-row" colSpan="7">No bulk buyer requests match this filter.</td></tr>}</tbody></table></div>
                    </section> : isInventory ? <section className="fpo-members-page fpo-inventory-page">
                        <div className="fpo-section-heading"><div><span className="fpo-card-label">FPO stockroom</span><h1>Inventory</h1><p>Track and update produce collected from your member farmers.</p></div><Link className="fpo-primary-action" to="/fpo/aggregations"><Wheat size={14} /> Add Aggregation</Link></div>
                        <div className="fpo-farmer-summary"><div><span>📦 Total inventory</span><strong>{Number(overviewMetrics.supply || 0).toLocaleString('en-IN')} kg</strong></div><div><span>🟢 Available listings</span><strong>{marketplace.length}</strong></div><div><span>⚠️ Low stock</span><strong>{marketplace.filter((product) => Number(product.quantity) < 100).length}</strong></div></div>
                        <div className="fpo-market-tabs"><button type="button" className={inventoryCategory === 'ALL' ? 'active' : ''} onClick={() => setInventoryCategory('ALL')}>All Products</button>{inventoryCategories.map((category) => <button type="button" className={inventoryCategory === category ? 'active' : ''} onClick={() => setInventoryCategory(category)} key={category}>{category}</button>)}</div>
                        <div className="fpo-member-toolbar"><label className="fpo-member-search"><Search size={14} /><input value={inventorySearch} onChange={(event) => setInventorySearch(event.target.value)} placeholder="Search inventory..." aria-label="Search inventory" /></label><span className="fpo-market-count">{filteredInventory.length} items</span></div>
                        <div className="fpo-members-table-wrap"><table className="fpo-members-table fpo-inventory-table"><thead><tr><th>Product</th><th>Farmer</th><th>Available</th><th>Price</th><th>Status</th><th>Update</th></tr></thead><tbody>{filteredInventory.map((product) => { const quantity = inventoryQuantities[product.id] ?? product.quantity; const lowStock = Number(quantity) < 100; return <tr key={product.id}><td><span className="fpo-crop-emoji">{{ Tomato: '🍅', Onion: '🧅', Rice: '🌾', Mango: '🥭', Banana: '🍌' }[product.crop] || '🥬'}</span><strong>{product.name}</strong></td><td>FD-{String(product.farmer_id).padStart(4, '0')}</td><td><input className="fpo-quantity-input" type="number" min="0" value={quantity} onChange={(event) => setInventoryQuantities((current) => ({ ...current, [product.id]: event.target.value }))} aria-label={`Quantity for ${product.name}`} /> {product.unit}</td><td>₹{Number(product.price || 0).toLocaleString('en-IN')}</td><td><span className={`fpo-status-pill ${lowStock ? 'pending' : 'active'}`}>{lowStock ? 'LOW STOCK' : 'AVAILABLE'}</span></td><td><button type="button" className="fpo-primary-action fpo-save-button" disabled={savingInventory === product.id} onClick={() => saveInventory(product)}>{savingInventory === product.id ? 'Saving...' : 'Save'}</button></td></tr>; })}{!filteredInventory.length && <tr><td className="fpo-empty-row" colSpan="6">No inventory items match this filter.</td></tr>}</tbody></table></div>
                    </section> : isMarketplace ? <section className="fpo-members-page fpo-marketplace-page">
                        <div className="fpo-section-heading"><div><span className="fpo-card-label">FPO marketplace</span><h1>Fresh Produce Marketplace</h1><p>Browse and manage your FPO's active farmer listings.</p></div><Link className="fpo-primary-action" to="/fpo/aggregations"><Wheat size={14} /> Aggregate Supply</Link></div>
                        <div className="fpo-market-tabs"><button type="button" className={marketCategory === 'ALL' ? 'active' : ''} onClick={() => setMarketCategory('ALL')}>All Products</button>{marketCategories.map((category) => <button type="button" className={marketCategory === category ? 'active' : ''} onClick={() => setMarketCategory(category)} key={category}>{category}</button>)}</div>
                        <div className="fpo-member-toolbar"><label className="fpo-member-search"><Search size={14} /><input value={marketSearch} onChange={(event) => setMarketSearch(event.target.value)} placeholder="Search products, crops, or farms..." aria-label="Search marketplace" /></label><span className="fpo-market-count">{filteredMarketplace.length} products</span></div>
                        <div className="fpo-product-grid">{filteredMarketplace.map((product) => <article className="fpo-product-card" key={product.id}><div className="fpo-product-image"><img src={getProductImage(product)} alt={product.name} /><span>{product.quality || 'Grade A'}</span></div><div className="fpo-product-copy"><div><h3>{product.name}</h3><small>{product.location} · {product.crop}</small></div><strong>₹{Number(product.price || 0).toLocaleString('en-IN')}<small>/{product.unit}</small></strong></div><div className="fpo-product-footer"><span>📦 {Number(product.quantity || 0).toLocaleString('en-IN')} {product.unit} available</span><button type="button" className="fpo-row-menu" onClick={() => setMessage(`${product.name} listing selected.`)}>View <ArrowRight size={13} /></button></div></article>)}{!filteredMarketplace.length && <div className="fpo-farmer-empty">No marketplace listings match this filter.</div>}</div>
                    </section> : isAggregation ? <section className="fpo-members-page">
                        <div className="fpo-section-heading"><div><span className="fpo-card-label">FPO operations</span><h1>Aggregation &amp; Farmer-wise Supply</h1><p>Combine farmer harvests into traceable, market-ready lots.</p></div><button type="button" className="fpo-primary-action" onClick={() => document.querySelector('.fpo-aggregation-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}><Plus size={14} /> Add Aggregation</button></div>
                        <div className="fpo-farmer-summary"><div><span>🌾 Aggregated volume</span><strong>{totalVolume.toLocaleString('en-IN')} kg</strong></div><div><span>📋 Active lots</span><strong>{aggregations.filter((record) => record.status === 'AVAILABLE').length}</strong></div><div><span>🥕 Crop lines</span><strong>{cropCount}</strong></div></div>
                        <form className="fpo-aggregation-form" onSubmit={addAggregation}><div><label>Crop<input required value={aggregationCrop} onChange={(event) => setAggregationCrop(event.target.value)} placeholder="e.g. Tomato" /></label><label>Quantity (kg)<input required min="0.1" step="0.1" type="number" value={aggregationQuantity} onChange={(event) => setAggregationQuantity(event.target.value)} placeholder="0" /></label></div><button type="submit" className="fpo-primary-action"><Plus size={14} /> Create Lot</button></form>
                        <div className="fpo-aggregation-toolbar"><span><strong>{filteredAggregations.length}</strong> aggregation lots</span><select value={aggregationStatus} onChange={(event) => setAggregationStatus(event.target.value)} aria-label="Filter aggregations by status"><option value="ALL">All statuses</option><option value="AVAILABLE">Available</option><option value="SOLD">Sold</option></select></div>
                        <div className="fpo-members-table-wrap"><table className="fpo-members-table"><thead><tr><th>Crop</th><th>Lot ID</th><th>Quantity</th><th>Status</th><th>Source</th></tr></thead><tbody>{filteredAggregations.map((record) => <tr key={record.id}><td><span className="fpo-crop-emoji">{{ Tomato: '🍅', Onion: '🧅', Rice: '🌾', Mango: '🥭', Banana: '🍌' }[record.crop] || '🥬'}</span><strong>{record.crop}</strong></td><td>AG-{String(record.id).padStart(4, '0')}</td><td>{Number(record.quantity).toLocaleString('en-IN')} kg</td><td><span className={`fpo-status-pill ${String(record.status).toLowerCase()}`}>{record.status}</span></td><td>FPO collection</td></tr>)}{!filteredAggregations.length && <tr><td className="fpo-empty-row" colSpan="5">No aggregation lots match this filter.</td></tr>}</tbody></table></div>
                    </section> : <div className={`fpo-dashboard-grid ${isOverview ? 'fpo-dashboard-grid--overview' : ''}`}>
                        <article className="fpo-card fpo-card--hero">
                            <div className="fpo-card-head small">
                                <span className="fpo-kicker">Together We Grow</span>
                            </div>
                            <div className="fpo-hero-body">
                                <div className="fpo-hero-copy">
                                    <h1>Coordinating harvests and trust across every farm.</h1>
                                    <p>Manage member participation, aggregate crop volumes, and keep every shipment moving with one connected operational view.</p>
                                </div>
                                <div className="fpo-hero-visual">
                                    <img src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80" alt="Farmer in field" />
                                    <div className="fpo-hero-badge">
                                        <span>Member strength</span>
                                        <strong>{overviewMetrics.farmers || 0}</strong>
                                    </div>
                                </div>
                            </div>
                            <div className="fpo-mini-stats">
                                <div className="fpo-mini-stat">
                                    <span>Members</span>
                                    <strong>{overviewMetrics.farmers || 0}</strong>
                                </div>
                                <div className="fpo-mini-stat">
                                    <span>Volume</span>
                                    <strong>{Number(overviewMetrics.supply || 0).toLocaleString('en-IN')} kg</strong>
                                </div>
                                <div className="fpo-mini-stat">
                                    <span>Crop lines</span>
                                    <strong>{topCrops.length}</strong>
                                </div>
                            </div>
                        </article>

                        {isOverview && <>
                            <section className="fpo-overview-metrics" aria-label="FPO overview metrics">
                                <div><span>Total Farmers</span><strong>{overviewMetrics.farmers || 0}</strong><small>Active members</small></div>
                                <div><span>Total Supply</span><strong>{(Number(overviewMetrics.supply || 0) / 1000).toFixed(1)} Ton</strong><small>Available inventory</small></div>
                                <div><span>Total Sales</span><strong>₹{Number(overviewMetrics.sales || 0).toLocaleString('en-IN')}</strong><small>Completed orders</small></div>
                                <div><span>Pending Orders</span><strong>{overviewMetrics.pending_orders || 0}</strong><small>Needs attention</small></div>
                            </section>
                            <article className="fpo-card fpo-overview-card fpo-overview-card--sales">
                                <div className="fpo-card-head"><div><span className="fpo-card-label">Performance</span><h3>Monthly Sales Overview</h3></div><span className="fpo-overview-period">This year</span></div>
                                <div className="fpo-sales-chart">
                                    {monthlySales.length ? monthlySales.map(([month, value]) => <div className="fpo-sales-bar" key={month}><span style={{ height: `${Math.max((Number(value) / maxMonthlySales) * 100, 8)}%` }} /><small>{month}</small></div>) : <p>No completed sales recorded yet.</p>}
                                </div>
                            </article>
                            <article className="fpo-card fpo-overview-card fpo-overview-card--crops">
                                <div className="fpo-card-head"><div><span className="fpo-card-label">Inventory mix</span><h3>Top Crops</h3></div><Link className="fpo-card-action" to="/fpo/inventory">View all</Link></div>
                                <div className="fpo-top-crops">{topCrops.length ? topCrops.slice(0, 5).map((crop) => <div key={crop.crop}><span className="fpo-crop-emoji" aria-hidden="true">{{ Tomato: '🍅', Onion: '🧅', Rice: '🌾', Mango: '🥭', Banana: '🍌' }[crop.crop] || '🥬'}</span><strong>{crop.crop}</strong><small>{Number(crop.quantity || 0).toLocaleString('en-IN')} kg</small></div>) : <p>No crop inventory recorded yet.</p>}</div>
                            </article>
                        </>}

                        <article className="fpo-card fpo-card--members">
                            <div className="fpo-card-head">
                                <div>
                                    <span className="fpo-card-label">Members</span>
                                    <h3>Members Management</h3>
                                </div>
                                <Link to="/fpo/members" className="fpo-card-action">View all</Link>
                            </div>
                            <div className="fpo-member-list">
                                {memberPreview.length ? memberPreview.map((member) => (
                                    <div className="fpo-member-item" key={member.id || member.farmer_id || member.name || Math.random()}>
                                        <span className="fpo-member-avatar">{String(member.farmer_id || 'F').slice(0, 2).toUpperCase()}</span>
                                        <div>
                                            <strong>Farmer #{member.farmer_id || member.id || 'N/A'}</strong>
                                            <small>{member.status || 'ACTIVE'} member</small>
                                        </div>
                                        <CheckCircle2 size={16} />
                                    </div>
                                )) : (
                                    <>
                                        <div className="fpo-member-item"><span className="fpo-member-avatar">FA</span><div><strong>Farmer #2</strong><small>ACTIVE member</small></div><CheckCircle2 size={16} /></div>
                                        <div className="fpo-member-item"><span className="fpo-member-avatar">KL</span><div><strong>Farmer #5</strong><small>ACTIVE member</small></div><CheckCircle2 size={16} /></div>
                                    </>
                                )}
                            </div>
                        </article>

                        <article className="fpo-card fpo-card--supply">
                            <div className="fpo-card-head">
                                <div>
                                    <span className="fpo-card-label">Farmer Supply</span>
                                    <h3>Farmer-wise Supply</h3>
                                </div>
                                <Link to="/fpo/farmers" className="fpo-card-action">Details</Link>
                            </div>
                            <div className="fpo-table-wrap">
                                <table className="fpo-data-table">
                                    <thead>
                                        <tr><th>Farmer</th><th>Tomato</th><th>Rice</th><th>Onion</th></tr>
                                    </thead>
                                    <tbody>
                                        <tr><td>Ramesh</td><td>120 kg</td><td>200 kg</td><td>110 kg</td></tr>
                                        <tr><td>Priya</td><td>80 kg</td><td>150 kg</td><td>90 kg</td></tr>
                                        <tr><td>Vikram</td><td>110 kg</td><td>180 kg</td><td>130 kg</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </article>

                        <article className="fpo-card fpo-card--buyers">
                            <div className="fpo-card-head">
                                <div>
                                    <span className="fpo-card-label">Bulk Buyers</span>
                                    <h3>Bulk Orders</h3>
                                </div>
                                <Link to="/fpo/bulk-buyers" className="fpo-card-action">Open</Link>
                            </div>
                            <div className="fpo-order-list">
                                {recentOrders.slice(0, 3).map((order) => <div className="fpo-order-row" key={order.id}><span>{order.crop}</span><strong>{order.quantity} kg</strong><small>₹{Number(order.amount || 0).toLocaleString('en-IN')}</small></div>)}
                                {!recentOrders.length && <div className="fpo-order-row"><span>No orders yet</span><strong>--</strong><small>--</small></div>}
                            </div>
                        </article>

                        <article className="fpo-card fpo-card--analytics">
                            <div className="fpo-card-head">
                                <div>
                                    <span className="fpo-card-label">Analytics</span>
                                    <h3>FPO Analytics</h3>
                                </div>
                                <span className="fpo-overview-period">This month</span>
                            </div>
                            <div className="fpo-chart-box">
                                <div className="fpo-chart-ring"><span>₹ {(Number(overviewMetrics.sales || 0) / 100000).toFixed(2)}L</span></div>
                                <div className="fpo-chart-legend">
                                    {topCrops.slice(0, 3).map((crop) => <div key={crop.crop}><i className="dot green" /> {crop.crop}</div>)}
                                </div>
                            </div>
                        </article>

                        <article className="fpo-card fpo-card--insights">
                            <div className="fpo-card-head">
                                <div>
                                    <span className="fpo-card-label">AI Insights</span>
                                    <h3>Demand Forecast</h3>
                                </div>
                                <Link to="/fpo/analytics" className="fpo-card-action">View</Link>
                            </div>
                            <div className="fpo-metric-list">
                                {topCrops.slice(0, 3).map((crop) => <div key={crop.crop}><span>{crop.crop}</span><strong>{Number(crop.quantity || 0).toLocaleString('en-IN')} kg</strong></div>)}
                                {!topCrops.length && <div><span>No crop data yet</span><strong>--</strong></div>}
                            </div>
                        </article>

                        <article className="fpo-card fpo-card--logistics">
                            <div className="fpo-card-head">
                                <div>
                                    <span className="fpo-card-label">Logistics</span>
                                    <h3>Delivery Status</h3>
                                </div>
                                <Link to="/fpo/logistics" className="fpo-card-action">Track</Link>
                            </div>
                            <div className="fpo-route-map">
                                <div className="route-dots">
                                    <span className="dot-point dot-one" />
                                    <span className="dot-point dot-two" />
                                    <span className="dot-point dot-three" />
                                </div>
                                <div className="route-line" />
                            </div>
                            <div className="fpo-route-labels">
                                <div><strong>Hub</strong><small>5 km</small></div>
                                <div><strong>Farm</strong><small>18 min</small></div>
                                <div><strong>Retail</strong><small>42 min</small></div>
                            </div>
                        </article>

                        <article className="fpo-card fpo-card--payments">
                            <div className="fpo-card-head">
                                <div>
                                    <span className="fpo-card-label">Payments</span>
                                    <h3>Settlements</h3>
                                </div>
                                <Link to="/fpo/analytics" className="fpo-card-action">Review</Link>
                            </div>
                            <div className="fpo-payment-list">
                                <div><span>Farmers</span><strong>₹ 32,500</strong></div>
                                <div><span>Logistics</span><strong>₹ 15,200</strong></div>
                                <div><span>Marketplace</span><strong>₹ 18,900</strong></div>
                            </div>
                        </article>

                        <article className="fpo-card fpo-card--marketplace">
                            <div className="fpo-card-head">
                                <div>
                                    <span className="fpo-card-label">Marketplace</span>
                                    <h3>Best Sellers</h3>
                                </div>
                                <Link to="/fpo/marketplace" className="fpo-card-action">Open</Link>
                            </div>
                            <div className="fpo-market-grid">
                                {['Tomato', 'Rice', 'Onion', 'Banana'].map((name, idx) => (
                                    <div className="fpo-market-card" key={name}>
                                        <img src={['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1586201375761-83865001fec6?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1576179635662-9d1983e97e1e?auto=format&fit=crop&w=900&q=80'][idx]} alt={name} />
                                        <div>
                                            <strong>{name}</strong>
                                            <small>{['₹4.4k', '₹3.2k', '₹2.8k', '₹5.1k'][idx]}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </article>

                        <article className="fpo-card fpo-card--notifications">
                            <div className="fpo-card-head">
                                <div>
                                    <span className="fpo-card-label">Notifications</span>
                                    <h3>Alerts</h3>
                                </div>
                                <Link to="/fpo/notifications" className="fpo-card-action">View all</Link>
                            </div>
                            <ul className="fpo-alert-list">
                                <li><strong>Shipment delay</strong><span>Tomato dispatch · 12 min</span></li>
                                <li><strong>Buyer request</strong><span>Rice order · 1.2 tons</span></li>
                                <li><strong>Farmer update</strong><span>Harvest ready · 2 villages</span></li>
                            </ul>
                        </article>

                        <article className="fpo-card fpo-card--settings">
                            <div className="fpo-card-head">
                                <div>
                                    <span className="fpo-card-label">Settings</span>
                                    <h3>Workspace Settings</h3>
                                </div>
                                <Link to="/fpo/settings" className="fpo-card-action">Manage</Link>
                            </div>
                            <div className="fpo-settings-stack">
                                <div><span>Profile</span><strong>Active</strong></div>
                                <div><span>Compliance</span><strong>Verified</strong></div>
                                <div><span>Pricing</span><strong>Synced</strong></div>
                            </div>
                        </article>
                    </div>}

                    {error && <p className="fpo-error" role="alert">{error}</p>}
                    {message && <p className="fpo-notice" role="status"><CheckCircle2 size={16} />{message}</p>}
                </div>
            </div>
        </main>
    );
}

export default function PartnerDashboardPage() {
    return <FpoWorkspace />;
}

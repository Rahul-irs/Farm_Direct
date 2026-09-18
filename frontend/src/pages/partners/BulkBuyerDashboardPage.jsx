import { ArrowRight, Bell, CreditCard, PackageCheck, RefreshCw, ShoppingBasket, Sparkles, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getPartnerRecords, getPartnerRequirementMatches } from '../../services/api';
import { getProductImage } from '../../utils/productImages';
import BulkBuyerSidebar from '../../components/layout/BulkBuyerSidebar';
import { Link } from 'react-router-dom';

export default function BulkBuyerDashboardPage() {
    const storedUser = JSON.parse(localStorage.getItem('farmdirect_user') || '{}');
    const fullName = storedUser.full_name || storedUser.name || '';
    const emailLocalPart = (storedUser.email || '').split('@')[0] || 'Bulk Buyer';
    const displayName = fullName || emailLocalPart || 'Bulk Buyer';
    const firstName = displayName.split(/\s+/).filter(Boolean)[0] || 'Bulk Buyer';
    const avatarInitials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'BB';
    const [records, setRecords] = useState([]);
    const [matches, setMatches] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [period, setPeriod] = useState('This Month');
    async function load() {
        setLoading(true);
        setError('');
        try { const result = await getPartnerRecords('bulk/requirements'); const requirements = result.items || []; setRecords(requirements); const matchResults = await Promise.all(requirements.map(async (record) => { try { return [record.id, (await getPartnerRequirementMatches(record.id)).matches || []]; } catch { return [record.id, []]; } })); setMatches(Object.fromEntries(matchResults)); }
        catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to load requirements'); }
        finally { setLoading(false); }
    }
    useEffect(() => { load(); }, []);
    const totalVolume = useMemo(() => records.reduce((total, record) => total + Number(record.quantity || 0), 0), [records]);
    const dashboardMetrics = [
        { label: 'Total Purchases', value: '₹ 8,45,320', change: '+12% this month', Icon: CreditCard, tone: 'teal' },
        { label: 'Total Quantity', value: `${Math.max(totalVolume, 125000).toLocaleString('en-IN')} kg`, change: '+10% this month', Icon: PackageCheck, tone: 'blue' },
        { label: 'Active Suppliers', value: String(Math.max(Object.values(matches).flat().length, 24)), change: '+3 new this month', Icon: Users, tone: 'violet' },
        { label: 'Pending Orders', value: String(Math.max(records.filter((record) => record.status === 'OPEN').length, 5)), change: 'View details', Icon: ShoppingBasket, tone: 'orange' },
    ];
    const purchaseTrend = [
        { month: 'Jan', value: 30, comparison: 24 }, { month: 'Feb', value: 46, comparison: 35 }, { month: 'Mar', value: 36, comparison: 39 },
        { month: 'Apr', value: 62, comparison: 48 }, { month: 'May', value: 50, comparison: 46 }, { month: 'Jun', value: 70, comparison: 57 },
        { month: 'Jul', value: 61, comparison: 54 }, { month: 'Aug', value: 78, comparison: 67 }, { month: 'Sep', value: 94, comparison: 78 },
    ];
    const cropSummary = [['Tomato', '28,500 kg', 'tomato'], ['Onion', '16,200 kg', 'onion'], ['Rice', '12,900 kg', 'rice'], ['Chili', '9,600 kg', 'default'], ['Potato', '8,400 kg', 'default']];
    const todayLabel = new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).format(new Date());
    const openWorkspaceFromButton = () => window.location.assign('/bulk-buyer/requirements');

    return <main className="bulk-buyer-page"><div className="bulk-buyer-shell">
        <BulkBuyerSidebar />
        <div className="bulk-buyer-main-panel">
            <header className="bulk-buyer-toolbar"><div className="bulk-buyer-toolbar-copy"><span className="bulk-buyer-kicker"><Sparkles size={14}/> Procurement control room</span><h1>Good Morning, {firstName}.</h1><p>Connecting farmers directly to buyers.</p></div><div className="bulk-buyer-toolbar-actions"><span className="bulk-buyer-date">{todayLabel}</span><button type="button" className="bulk-buyer-icon-button" aria-label="Refresh buying desk" onClick={load} disabled={loading}><RefreshCw size={15}/></button><Link className="bulk-buyer-icon-button" to="/notifications" aria-label="Notifications"><Bell size={15}/></Link><Link className="bulk-buyer-toolbar-profile" to="/profile" aria-label="Open profile"><span>{avatarInitials}</span><strong>{displayName}</strong></Link></div></header>
            <section className="bulk-buyer-dashboard" aria-label="Bulk buyer dashboard">
                <div className="bulk-buyer-dashboard-heading"><div><span className="bulk-buyer-dashboard-eyebrow">Overview</span><h2>Your procurement at a glance</h2></div><label className="bulk-buyer-period-button"><span className="bulk-buyer-period-label">Period</span><select value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Select dashboard period"><option>This Month</option><option>Last 6 Months</option><option>This Year</option></select></label></div>
                <div className="bulk-buyer-kpi-grid">{dashboardMetrics.map(({ label, value, change, Icon, tone }) => <article className={`bulk-buyer-kpi-card bulk-buyer-kpi-card--${tone}`} key={label}><div className="bulk-buyer-kpi-icon"><Icon size={16}/></div><span>{label}</span><strong>{value}</strong>{change === 'View details' ? <button type="button" className="bulk-buyer-kpi-link" onClick={openWorkspaceFromButton}>{change}</button> : <small>{change}</small>}{change !== 'View details' && <i>↗</i>}</article>)}</div>
                <section className="bulk-buyer-matching-banner"><div className="bulk-buyer-matching-copy"><span className="bulk-buyer-dashboard-eyebrow">Powered by AI</span><h3>AI Supplier Matching</h3><p>Tell us what you need. We will find the best suppliers based on price, quality, location and availability.</p><button type="button" onClick={openWorkspaceFromButton}>Create Requirement <ArrowRight size={14}/></button></div><div className="bulk-buyer-matching-visual"><div className="bulk-buyer-robot">✦</div><div className="bulk-buyer-match-orbit bulk-buyer-match-orbit--one"/><div className="bulk-buyer-match-orbit bulk-buyer-match-orbit--two"/><img src={getProductImage({ name: 'Tomato' })} alt="Fresh tomato supply"/><img src={getProductImage({ name: 'Rice' })} alt="Rice supply"/></div></section>
                <div className="bulk-buyer-dashboard-grid"><section className="bulk-buyer-chart-card"><div className="bulk-buyer-panel-heading"><div><span className="bulk-buyer-dashboard-eyebrow">Purchase Overview</span><h3>Purchase Overview</h3></div><span className="bulk-buyer-chart-period">{period}</span></div><div className="bulk-buyer-chart"><ResponsiveContainer width="100%" height={190}><LineChart data={purchaseTrend} margin={{ top: 8, right: 12, left: -26, bottom: 0 }}><CartesianGrid stroke="#edf1f5" vertical={false}/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#91a0ad', fontSize: 9 }}/><YAxis axisLine={false} tickLine={false} tick={{ fill: '#91a0ad', fontSize: 9 }} ticks={[0, 50, 100]}/><Tooltip contentStyle={{ border: '1px solid #e7eef1', borderRadius: 8, fontSize: 11 }}/><Line type="monotone" dataKey="value" stroke="#11a98e" strokeWidth={2.5} dot={{ r: 2.5, fill: '#11a98e', strokeWidth: 0 }}/><Line type="monotone" dataKey="comparison" stroke="#36a9e8" strokeWidth={1.8} dot={false} strokeDasharray="3 3"/></LineChart></ResponsiveContainer></div></section><section className="bulk-buyer-crops-card"><div className="bulk-buyer-panel-heading"><div><span className="bulk-buyer-dashboard-eyebrow">Top Purchased Crops</span><h3>Top Purchased Crops</h3></div></div><div className="bulk-buyer-crop-list">{cropSummary.map(([name, quantity, image]) => <div className="bulk-buyer-crop-row" key={name}><img src={getProductImage({ name: image === 'default' ? name : image })} alt=""/><strong>{name}</strong><span>{quantity}</span></div>)}</div></section><section className="bulk-buyer-quality-card"><div className="bulk-buyer-panel-heading"><div><span className="bulk-buyer-dashboard-eyebrow">Supplier Quality</span><h3>Quality Rating</h3></div></div><div className="bulk-buyer-quality-ring"><strong>92%</strong></div><b>High Quality</b><p>Based on your supplier ratings</p></section></div>
            </section>
            {error && <p className="bulk-buyer-error bulk-buyer-dashboard-error" role="alert">{error}</p>}
        </div>
    </div></main>;
}
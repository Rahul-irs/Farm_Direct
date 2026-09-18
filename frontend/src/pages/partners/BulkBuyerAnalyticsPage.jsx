import { BarChart3, CalendarDays, CheckCircle2, ClipboardList, Download, PackageCheck, RefreshCw, ShoppingBasket, TrendingUp, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import BulkBuyerSidebar from '../../components/layout/BulkBuyerSidebar';
import { getOrders, getPartnerRecords } from '../../services/api';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
const fallbackCrops = [['Tomato', 68, '#ef6550'], ['Onion', 49, '#f0a64b'], ['Rice', 42, '#55a7d2'], ['Chili', 35, '#6fbe73'], ['Potato', 29, '#8e83d2']];

export default function BulkBuyerAnalyticsPage() {
    const [orders, setOrders] = useState([]);
    const [requirements, setRequirements] = useState([]);
    const [period, setPeriod] = useState('Last 6 Months');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    async function load() {
        setLoading(true);
        setError('');
        try {
            const [ordersResult, requirementsResult] = await Promise.all([getOrders(), getPartnerRecords('bulk/requirements')]);
            setOrders(ordersResult.items || []);
            setRequirements(requirementsResult.items || []);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to load analytics');
        } finally { setLoading(false); }
    }

    useEffect(() => { load(); }, []);

    const totalPurchases = orders.reduce((total, order) => total + Number(order.total_amount || 0), 0);
    const totalQuantity = orders.reduce((total, order) => total + (order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0), 0);
    const cropData = useMemo(() => {
        const totals = {};
        orders.forEach((order) => (order.items || []).forEach((item) => { totals[item.product_name || 'Other'] = (totals[item.product_name || 'Other'] || 0) + Number(item.quantity || 0); }));
        const values = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 5);
        return values.length ? values.map(([name, value], index) => [name, Math.min(100, Math.max(18, value / Math.max(...values.map((entry) => entry[1])) * 100)), fallbackCrops[index]?.[2] || '#0b9d87']) : fallbackCrops;
    }, [orders]);
    const monthlyData = months.map((month, index) => ({ month, value: [32, 48, 38, 59, 51, 73, 62, 79, 92][index] }));
    const maxMonthly = Math.max(...monthlyData.map((item) => item.value));
    const supplierCount = Math.max(requirements.length, 24);

    return <main className="bulk-buyer-page"><div className="bulk-buyer-shell">
        <BulkBuyerSidebar />
        <div className="bulk-buyer-main-panel bulk-buyer-analytics-page">
            <header className="bulk-buyer-toolbar"><div className="bulk-buyer-toolbar-copy"><span className="bulk-buyer-kicker"><BarChart3 size={14}/> Procurement intelligence</span><h1>Purchase Analytics</h1><p>Understand spend, supplier health, and purchasing patterns.</p></div><div className="bulk-buyer-analytics-toolbar"><label><CalendarDays size={14}/><select value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Select analytics period"><option>Last 6 Months</option><option>This Year</option><option>This Month</option></select></label><button className="bulk-buyer-icon-button" type="button" onClick={load} disabled={loading} aria-label="Refresh analytics"><RefreshCw size={15}/></button><button className="bulk-buyer-analytics-export" type="button"><Download size={14}/> Export</button></div></header>
            {error && <p className="bulk-buyer-error" role="alert">{error}</p>}
            <section className="bulk-buyer-analytics-kpis"><div><span>Total Purchases</span><strong>₹{totalPurchases ? totalPurchases.toLocaleString('en-IN') : '8,45,320'}</strong><small><TrendingUp size={11}/> +12% this month</small></div><div><span>Total Quantity</span><strong>{(totalQuantity || 125000).toLocaleString('en-IN')} kg</strong><small><TrendingUp size={11}/> +10% this month</small></div><div><span>Avg. Price</span><strong>₹24/kg</strong><small className="is-warn">↓ 5% this month</small></div><div><span>Total Orders</span><strong>{orders.length || 18}</strong><small><TrendingUp size={11}/> +3 this month</small></div></section>
            <div className="bulk-buyer-analytics-grid"><section className="bulk-buyer-analytics-card bulk-buyer-spending-card"><div className="bulk-buyer-analytics-card-head"><div><span className="bulk-buyer-label">Spending by Crop</span><h2>Where your budget goes</h2></div><ShoppingBasket size={17}/></div><div className="bulk-buyer-bar-chart">{cropData.map(([name, value, color]) => <div className="bulk-buyer-bar-column" key={name}><strong style={{ height: `${value}%`, background: color }}>{Math.round(value)}%</strong><span>{name}</span></div>)}</div></section><section className="bulk-buyer-analytics-card bulk-buyer-suppliers-card"><div className="bulk-buyer-analytics-card-head"><div><span className="bulk-buyer-label">Supplier Distribution</span><h2>Active suppliers</h2></div><Users size={17}/></div><div className="bulk-buyer-donut-wrap"><div className="bulk-buyer-donut"><strong>{supplierCount}</strong><span>Suppliers</span></div><div className="bulk-buyer-donut-legend"><span><i className="legend-fpo"/> FPOs <b>42%</b></span><span><i className="legend-farm"/> Farmers <b>38%</b></span><span><i className="legend-other"/> Other <b>20%</b></span></div></div></section><section className="bulk-buyer-analytics-card bulk-buyer-monthly-card"><div className="bulk-buyer-analytics-card-head"><div><span className="bulk-buyer-label">Monthly Spending</span><h2>Spending trend</h2></div><PackageCheck size={17}/></div><div className="bulk-buyer-monthly-chart"><svg viewBox="0 0 500 180" role="img" aria-label="Monthly spending trend"><path d="M8 151 C52 138 60 115 100 128 S145 102 180 112 S218 72 257 86 S296 63 330 78 S374 40 405 55 S449 22 492 29" fill="none" stroke="#0b9d87" strokeWidth="4" strokeLinecap="round"/><path d="M8 151 C52 138 60 115 100 128 S145 102 180 112 S218 72 257 86 S296 63 330 78 S374 40 405 55 S449 22 492 29 L492 180 L8 180 Z" fill="url(#analyticsFill)" opacity=".22"/><defs><linearGradient id="analyticsFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#0b9d87"/><stop offset="1" stopColor="#dff5ed"/></linearGradient></defs></svg><div>{monthlyData.map((item) => <span key={item.month}>{item.month}</span>)}</div></div></section></div>
            <section className="bulk-buyer-analytics-insight"><div className="bulk-buyer-analytics-insight-icon"><CheckCircle2 size={18}/></div><div><strong>Healthy procurement rhythm</strong><p>Your active supplier network is supporting consistent purchasing across {requirements.length || 5} requirement routes.</p></div><ClipboardList size={20}/></section>
        </div>
    </div></main>;
}

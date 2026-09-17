import { ArrowUpRight, BarChart3, IndianRupee, RefreshCw, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFarmerPaymentSummary } from '../../services/api';

const emptySummary = { revenue: 0, sold_quantity: 0, paid_orders: 0, pending_amount: 0, completed_revenue: 0, revenue_by_crop: [], monthly_revenue: [], history: [] };
const chartColors = ['#1d805a', '#e3a443', '#4e9ab5', '#d46c4d', '#7b83b8'];

function money(value) {
    return `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export default function FarmerEarningsPage() {
    const [summary, setSummary] = useState(emptySummary);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    async function load() {
        setLoading(true);
        setError('');
        try { const result = await getFarmerPaymentSummary(); setSummary({ ...emptySummary, ...(result.summary || {}) }); }
        catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to load earnings'); }
        finally { setLoading(false); }
    }

    useEffect(() => { load(); }, []);

    const cropTotal = summary.revenue_by_crop.reduce((total, item) => total + Number(item.amount || 0), 0);
    const cropGradient = summary.revenue_by_crop.length ? summary.revenue_by_crop.reduce((gradient, item, index) => {
        const start = summary.revenue_by_crop.slice(0, index).reduce((total, crop) => total + Number(crop.amount || 0), 0) / cropTotal * 100;
        const end = (start + Number(item.amount || 0) / cropTotal * 100).toFixed(2);
        return `${gradient}${index ? ', ' : ''}${chartColors[index % chartColors.length]} ${start.toFixed(2)}% ${end}%`;
    }, '') : '#dce9e3 0 100%';
    const maxMonth = Math.max(...summary.monthly_revenue.map((item) => Number(item.amount || 0)), 1);

    return <main className="farmer-earnings-page"><div className="farmer-earnings-container">
        <header className="farmer-earnings-reference-header"><div><span>FARMER WORKSPACE</span><h1>Sales &amp; Earnings</h1><p>Track your sales, payments, and revenue from every completed order.</p></div><button className="farmer-earnings-refresh" type="button" onClick={load} disabled={loading}><RefreshCw size={15} className={loading ? 'farmer-earnings-spin' : ''} /> Refresh</button></header>
        {error && <p className="farmer-earnings-error" role="alert">{error}</p>}
        <section className="farmer-earnings-reference-metrics"><div><span>Total Sales</span><strong>{money(summary.revenue)}</strong><small>{summary.paid_orders} paid orders</small></div><div><span>Pending Payments</span><strong>{money(summary.pending_amount)}</strong><small>awaiting confirmation</small></div><div><span>Completed Payments</span><strong>{money(summary.completed_revenue)}</strong><small>settled sales</small></div></section>
        <div className="farmer-earnings-reference-grid"><section className="farmer-earnings-chart-panel"><div className="farmer-earnings-panel-heading"><div><span>REVENUE BY CROP</span><h2>Sales mix</h2></div><BarChart3 size={18} /></div>{summary.revenue_by_crop.length ? <div className="farmer-earnings-donut-layout"><div className="farmer-earnings-donut" style={{ background: `conic-gradient(${cropGradient})` }}><div><strong>{money(cropTotal)}</strong><span>Total revenue</span></div></div><div className="farmer-earnings-legend">{summary.revenue_by_crop.map((item, index) => <div key={item.crop}><span><i style={{ background: chartColors[index % chartColors.length] }} />{item.crop}</span><strong>{money(item.amount)}</strong></div>)}</div></div> : <p className="farmer-earnings-empty">Crop revenue will appear after a buyer completes an order.</p>}</section>
            <section className="farmer-earnings-chart-panel"><div className="farmer-earnings-panel-heading"><div><span>MONTHLY REVENUE</span><h2>Revenue trend</h2></div><IndianRupee size={18} /></div>{summary.monthly_revenue.length ? <div className="farmer-earnings-bars">{summary.monthly_revenue.slice(-6).map((item) => <div className="farmer-earnings-bar-column" key={item.month}><strong>{money(item.amount)}</strong><div className="farmer-earnings-bar-track"><i style={{ height: `${Math.max(Number(item.amount) / maxMonth * 100, 7)}%` }} /></div><span>{item.month}</span></div>)}</div> : <p className="farmer-earnings-empty">Monthly revenue will appear after paid orders are recorded.</p>}</section></div>
        <section className="farmer-earnings-history"><div className="farmer-earnings-history-heading"><div><span>ORDER HISTORY</span><h2>Recent sales</h2></div><Link to="/farmer/orders">View All <ArrowUpRight size={14} /></Link></div><div className="farmer-earnings-history-table"><div className="farmer-earnings-history-row header"><span>Order</span><span>Date</span><span>Status</span><span>Amount</span></div>{summary.history.slice(0, 6).map((item) => <div className="farmer-earnings-history-row" key={item.order_id}><strong>Order #{item.order_id}</strong><span>{item.created_at ? new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'}</span><span className="farmer-earnings-status">{item.status}</span><b>{money(item.amount)}</b></div>)}{!summary.history.length && <p className="farmer-earnings-empty">Paid order history will appear here.</p>}</div></section>
        <div className="farmer-earnings-footer-link"><Wallet size={15} /> Revenue is calculated from real paid order lines belonging to your farm.</div>
    </div></main>;
}

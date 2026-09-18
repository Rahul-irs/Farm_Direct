import { CheckCircle2, CreditCard, Download, Filter, Search, ShieldCheck, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getPayments } from '../../services/api';

const tabs = ['All Payments', 'Succeeded', 'Pending', 'Failed'];
const normalize = (status) => String(status || 'PENDING').toUpperCase();

export default function BulkBuyerPaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [tab, setTab] = useState('All Payments');
    const [search, setSearch] = useState('');
    const [state, setState] = useState({ loading: true, error: '' });

    async function load() {
        setState({ loading: true, error: '' });
        try { const result = await getPayments(); setPayments(result.items || []); }
        catch (error) { setState({ loading: false, error: error instanceof Error ? error.message : 'Unable to load payments' }); }
        finally { setState((current) => ({ ...current, loading: false })); }
    }

    useEffect(() => { load(); }, []);
    const totalPaid = payments.filter((payment) => normalize(payment.status) === 'SUCCEEDED').reduce((total, payment) => total + Number(payment.amount || 0), 0);
    const filtered = useMemo(() => payments.filter((payment) => {
        const status = normalize(payment.status);
        const matchesTab = tab === 'All Payments' || status === tab.toUpperCase();
        const text = `${payment.id} ${payment.order_id} ${payment.transaction_reference} ${payment.provider}`.toLowerCase();
        return matchesTab && text.includes(search.trim().toLowerCase());
    }), [payments, search, tab]);
    const count = (status) => status ? payments.filter((payment) => normalize(payment.status) === status).length : payments.length;

    return <main className="bulk-buyer-payments-page">
        <header className="bulk-buyer-toolbar"><div className="bulk-buyer-toolbar-copy"><span className="bulk-buyer-kicker"><ShieldCheck size={14}/> Secure payment ledger</span><h1>Payments</h1><p>Review procurement spend, transaction references, and settlement status.</p></div><div className="bulk-buyer-payments-actions"><button type="button" className="bulk-buyer-payments-export"><Download size={14}/> Export</button><button type="button" className="bulk-buyer-icon-button" onClick={load} disabled={state.loading} aria-label="Refresh payments"><CreditCard size={15}/></button></div></header>
        {state.error && <p className="bulk-buyer-error" role="alert">{state.error}</p>}
        <section className="bulk-buyer-payment-kpis"><div><span>Successful value</span><strong>₹{totalPaid.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong><small>settled through FarmDirect</small></div><div><span>Transactions</span><strong>{payments.length}</strong><small>recorded payments</small></div><div><span>Pending</span><strong>{count('PENDING')}</strong><small>awaiting settlement</small></div><div><span>Ledger status</span><strong>Clear</strong><small>all records available</small></div></section>
        <section className="bulk-buyer-payment-panel"><div className="bulk-buyer-payment-panel-head"><div><span className="bulk-buyer-label">Money trail</span><h2>Payment history</h2></div><div className="bulk-buyer-payment-search"><Search size={15}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search transaction or order..." aria-label="Search payments"/></div><button type="button" className="bulk-buyer-payment-filter"><Filter size={14}/> Filter</button></div><div className="bulk-buyer-payment-tabs">{tabs.map((item) => <button type="button" className={tab === item ? 'is-active' : ''} onClick={() => setTab(item)} key={item}>{item}<b>{item === 'All Payments' ? payments.length : count(item.toUpperCase())}</b></button>)}</div>{state.loading ? <div className="bulk-buyer-payment-loading">Loading payment history...</div> : <div className="bulk-buyer-payment-table-wrap"><table className="bulk-buyer-payment-table"><thead><tr><th>Reference</th><th>Order</th><th>Provider</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead><tbody>{filtered.map((payment) => { const status = normalize(payment.status); const succeeded = status === 'SUCCEEDED'; return <tr key={payment.id}><td><strong>{payment.transaction_reference || `PAY-${String(payment.id).padStart(5, '0')}`}</strong><small>Payment #{payment.id}</small></td><td><span>Order #{payment.order_id || '--'}</span></td><td>{payment.provider || 'Payment gateway'}</td><td>{payment.created_at ? new Date(payment.created_at).toLocaleDateString('en-IN') : 'Date unavailable'}</td><td><strong>₹{Number(payment.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td><td><span className={`bulk-buyer-payment-status ${succeeded ? 'is-success' : status === 'FAILED' ? 'is-failed' : 'is-pending'}`}>{succeeded ? <CheckCircle2 size={13}/> : <XCircle size={13}/>} {status}</span></td></tr>; })}{filtered.length === 0 && <tr><td colSpan="6"><div className="bulk-buyer-payment-empty"><CreditCard size={28}/><h3>No payments in this view</h3><p>Try another status or search term.</p></div></td></tr>}</tbody></table></div>}</section>
    </main>;
}

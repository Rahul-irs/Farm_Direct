import { ArrowLeft, BarChart3, CheckCircle2, ClipboardList, MapPin, Plus, RefreshCw, ShieldCheck, ShoppingBasket, Sparkles, Trash2, Users, Wheat } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPartnerRecord, deletePartnerRecord, getPartnerRecords, getPartnerRequirementMatches } from '../../services/api';
import { getProductImage } from '../../utils/productImages';

function BulkBuyerWorkspace() {
    const [records, setRecords] = useState([]);
    const [matches, setMatches] = useState({});
    const [form, setForm] = useState({ crop: '', quantity: '', location: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    async function load() {
        setLoading(true);
        setError('');
        try { const result = await getPartnerRecords('bulk/requirements'); const requirements = result.items || []; setRecords(requirements); const matchResults = await Promise.all(requirements.map(async (record) => { try { return [record.id, (await getPartnerRequirementMatches(record.id)).matches || []]; } catch { return [record.id, []]; } })); setMatches(Object.fromEntries(matchResults)); }
        catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to load requirements'); }
        finally { setLoading(false); }
    }
    useEffect(() => { load(); }, []);
    async function submit(event) {
        event.preventDefault();
        setError('');
        try { await createPartnerRecord('bulk/requirements', { crop: form.crop, quantity: Number(form.quantity), location: form.location }); setForm({ crop: '', quantity: '', location: '' }); setMessage('Requirement published to your buying desk.'); await load(); }
        catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to save requirement'); }
    }
    async function remove(record) {
        if (!window.confirm(`Delete the ${record.crop} requirement? It will be removed permanently.`)) return;
        try { await deletePartnerRecord('bulk/requirements', record.id); setRecords((current) => current.filter((item) => item.id !== record.id)); setMatches((current) => { const next = { ...current }; delete next[record.id]; return next; }); setMessage(`${record.crop} requirement deleted permanently.`); }
        catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to delete requirement'); }
    }
    const totalVolume = useMemo(() => records.reduce((total, record) => total + Number(record.quantity || 0), 0), [records]);
    const featuredProduct = useMemo(() => Object.values(matches).flat()[0], [matches]);
    return <main className="bulk-buyer-page bulk-buyer-command"><div className="bulk-buyer-container">
        <div className="bulk-buyer-breadcrumb"><Link to="/profile"><ArrowLeft size={15}/> Profile</Link><span>BUYING DESK / LIVE SOURCING</span></div>
        <header className="bulk-buyer-command-hero"><div className="bulk-buyer-command-copy"><p className="bulk-buyer-kicker"><Sparkles size={14}/> Procurement control room</p><h1>Turn demand into supply.</h1><p>Publish the brief. Watch the network answer. Keep every destination and delivery volume accountable.</p><div className="bulk-buyer-hero-meta"><span><CheckCircle2 size={14}/> Live partner inventory</span><span><ShieldIcon /> Private buying desk</span></div></div><div className="bulk-buyer-hero-panel">{featuredProduct ? <img src={getProductImage(featuredProduct)} alt={`${featuredProduct.name} from a farm partner`}/> : <img src={getProductImage({ name: 'Tomato' })} alt="Fresh produce from FarmDirect"/>}<div className="bulk-buyer-hero-overlay"><span>NETWORK SIGNAL</span><strong>{featuredProduct?.name || 'Fresh produce'}</strong><small>{featuredProduct ? `${featuredProduct.quantity} ${featuredProduct.unit} ready near ${featuredProduct.location}` : 'Your live supply picture will appear here'}</small></div><div className="bulk-buyer-hero-index">01<span>/ supply</span></div></div></header>
        {message && <p className="bulk-buyer-notice" role="status"><CheckCircle2 size={16}/>{message}</p>}{error && <p className="bulk-buyer-error" role="alert">{error}</p>}
        <section className="bulk-buyer-command-stats"><div><span>Active briefs</span><strong>{records.length}</strong><small>requests in motion</small></div><div><span>Demand volume</span><strong>{totalVolume.toLocaleString('en-IN')}</strong><small>units requested</small></div><div><span>Supply matches</span><strong>{Object.values(matches).flat().length}</strong><small>farm listings found</small></div><div><span>Destinations</span><strong>{new Set(records.map((record) => record.location)).size}</strong><small>buying routes covered</small></div></section>
        <div className="bulk-buyer-command-grid"><form className="bulk-buyer-form bulk-buyer-brief-panel" onSubmit={submit}><div className="bulk-buyer-heading"><div><span className="bulk-buyer-label">01 / PUBLISH A BRIEF</span><h2>What should we source?</h2><p className="bulk-buyer-heading-note">Your request is matched against live farm inventory.</p></div><div className="bulk-buyer-form-badge"><Plus size={18}/></div></div><div className="bulk-buyer-form-fields"><label><span>Crop or product</span><div className="bulk-buyer-input"><Wheat size={16}/><input value={form.crop} onChange={(event) => setForm({ ...form, crop: event.target.value })} placeholder="Onion, tomato, rice" required/></div></label><label><span>Quantity required</span><div className="bulk-buyer-input"><ClipboardList size={16}/><input type="number" min="0.01" step="0.01" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} placeholder="Enter volume" required/></div></label><label><span>Delivery location</span><div className="bulk-buyer-input"><MapPin size={16}/><input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="City or distribution hub" required/></div></label></div><button className="bulk-buyer-submit" type="submit" disabled={loading}><Plus size={16}/> {loading ? 'Updating buying desk...' : 'Publish requirement'}</button><p className="bulk-buyer-form-note">The brief stays private to your account until you remove it.</p></form>
            <section className="bulk-buyer-requirements bulk-buyer-queue-panel"><div className="bulk-buyer-list-heading"><div><span className="bulk-buyer-label">02 / ACTIVE QUEUE</span><h2>Requests in motion</h2><p className="bulk-buyer-heading-note">Open a requirement to compare available farm partners.</p></div><button className="bulk-buyer-refresh" type="button" onClick={load} disabled={loading}><RefreshCw size={15}/> {loading ? 'Refreshing' : 'Refresh'}</button></div><div className="bulk-buyer-list">{records.map((record, index) => <article className="bulk-buyer-record" key={record.id}><div className="bulk-buyer-record-number">0{index + 1}</div><div className="bulk-buyer-record-main"><div><h3>{record.crop}</h3><span className="bulk-buyer-open">{record.status || 'OPEN'}</span></div><p><ClipboardList size={14}/> {record.quantity} units <i>·</i> <MapPin size={14}/> {record.location}</p></div><div className="bulk-buyer-record-actions"><button type="button" title="Remove requirement" aria-label={`Delete ${record.crop} requirement`} onClick={() => remove(record)}><Trash2 size={15}/></button></div><div className="bulk-buyer-matches"><div className="bulk-buyer-matches-heading"><span>AVAILABLE FARM PARTNERS</span><b>{matches[record.id]?.length || 0} matches</b></div>{matches[record.id]?.length ? <div className="bulk-buyer-match-list">{matches[record.id].slice(0, 4).map((product) => <div className="bulk-buyer-match" key={product.id}><img src={getProductImage(product)} alt=""/><div><strong>{product.name}</strong><span>{product.quantity} {product.unit} · {product.location}</span></div><b>₹{product.price}<small>/{product.unit}</small></b></div>)}</div> : <p className="bulk-buyer-no-match">No available farm listing meets this volume yet.</p>}</div></article>)}{records.length === 0 && <div className="bulk-buyer-empty"><ShoppingBasket size={32}/><h3>Your buying queue is clear</h3><p>Publish a requirement to start sourcing from verified farm partners.</p></div>}</div></section>
        </div>
    </div></main>;
}

function ShieldIcon() { return <ShieldCheck size={14}/>; }

function FpoWorkspace() {
    const [aggregations, setAggregations] = useState([]);
    const [members, setMembers] = useState([]);
    const [form, setForm] = useState({ crop: '', quantity: '' });
    const [state, setState] = useState({ loading: true, saving: false, error: '', message: '' });
    async function load() {
        setState((current) => ({ ...current, loading: true, error: '' }));
        try {
            const [aggregationResult, memberResult] = await Promise.all([getPartnerRecords('fpo/aggregations'), getPartnerRecords('fpo/members')]);
            setAggregations(aggregationResult.items || []);
            setMembers(memberResult.items || []);
        } catch (requestError) {
            setState((current) => ({ ...current, error: requestError instanceof Error ? requestError.message : 'Unable to load FPO workspace' }));
        } finally { setState((current) => ({ ...current, loading: false })); }
    }
    useEffect(() => { load(); }, []);
    async function submit(event) {
        event.preventDefault();
        setState((current) => ({ ...current, saving: true, error: '', message: '' }));
        try {
            await createPartnerRecord('fpo/aggregations', { crop: form.crop, quantity: Number(form.quantity) });
            setForm({ crop: '', quantity: '' });
            setState((current) => ({ ...current, message: 'Aggregation added to the FPO supply ledger.' }));
            await load();
        } catch (requestError) { setState((current) => ({ ...current, error: requestError instanceof Error ? requestError.message : 'Unable to save aggregation' })); }
        finally { setState((current) => ({ ...current, saving: false })); }
    }
    const totalVolume = useMemo(() => aggregations.reduce((total, record) => total + Number(record.quantity || 0), 0), [aggregations]);
    const cropCount = new Set(aggregations.map((record) => record.crop.toLowerCase())).size;
    return <main className="fpo-page"><div className="fpo-container">
        <div className="fpo-breadcrumb"><Link to="/profile"><ArrowLeft size={15}/> Profile</Link><span>FPO / SUPPLY COORDINATION</span></div>
        <header className="fpo-hero"><div><p className="fpo-kicker"><Wheat size={14}/> Collective supply desk</p><h1>Coordinate the harvest together.</h1><p>Keep member participation and aggregated crop volume visible in one dependable operating view.</p></div><div className="fpo-hero-mark"><BarChart3 size={29}/><span>FPO<br/>NETWORK</span></div></header>
        {state.message && <p className="fpo-notice" role="status"><CheckCircle2 size={16}/>{state.message}</p>}{state.error && <p className="fpo-error" role="alert">{state.error}</p>}
        <section className="fpo-stats"><div><span>Aggregations</span><strong>{aggregations.length}</strong><small>records in ledger</small></div><div><span>Collected volume</span><strong>{totalVolume.toLocaleString('en-IN')}</strong><small>units coordinated</small></div><div><span>Crop lines</span><strong>{cropCount}</strong><small>active crop categories</small></div><div><span>Members</span><strong>{members.length}</strong><small>connected farmers</small></div></section>
        <div className="fpo-grid"><form className="fpo-form" onSubmit={submit}><div className="fpo-panel-heading"><div><span className="fpo-label">ADD TO LEDGER</span><h2>Record an aggregation</h2><p>Capture volume gathered from member farms.</p></div><div className="fpo-form-icon"><Plus size={18}/></div></div><label><span>Crop</span><div className="fpo-input"><Wheat size={16}/><input value={form.crop} onChange={(event) => setForm({ ...form, crop: event.target.value })} placeholder="e.g. Tomato" required/></div></label><label><span>Quantity</span><div className="fpo-input"><ClipboardList size={16}/><input type="number" min="0.01" step="0.01" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} placeholder="Enter volume" required/></div></label><button className="fpo-submit" type="submit" disabled={state.saving}>{state.saving ? 'Saving record...' : 'Add aggregation'} <Plus size={16}/></button></form>
            <section className="fpo-ledger"><div className="fpo-panel-heading"><div><span className="fpo-label">SUPPLY LEDGER</span><h2>Aggregated crops</h2><p>What the collective can move to market.</p></div><button className="fpo-refresh" type="button" onClick={load} disabled={state.loading}><RefreshCw size={15}/>{state.loading ? 'Loading' : 'Refresh'}</button></div>{state.loading ? <div className="fpo-loading"/> : <div className="fpo-records">{aggregations.map((record) => <article className="fpo-record" key={record.id}><div className="fpo-record-icon"><Wheat size={19}/></div><div><span>{record.status || 'AVAILABLE'}</span><h3>{record.crop}</h3></div><strong>{Number(record.quantity).toLocaleString('en-IN')} <small>units</small></strong></article>)}{aggregations.length === 0 && <div className="fpo-empty"><Wheat size={28}/><h3>The ledger is ready.</h3><p>Add your first crop aggregation to begin coordinating supply.</p></div>}</div>}</section>
        </div>
        <section className="fpo-members"><div className="fpo-panel-heading"><div><span className="fpo-label">MEMBER NETWORK</span><h2>Connected farmers</h2><p>Member records currently linked to this FPO.</p></div><div className="fpo-member-count"><Users size={16}/>{members.length}</div></div><div className="fpo-member-list">{members.map((member) => <div className="fpo-member" key={member.id}><span className="fpo-member-avatar">{String(member.farmer_id).padStart(2, '0')}</span><div><strong>Farmer #{member.farmer_id}</strong><small>{member.status || 'ACTIVE'} member</small></div><CheckCircle2 size={17}/></div>)}{members.length === 0 && <p className="fpo-empty-copy">No member records have been linked yet.</p>}</div></section>
    </div></main>;
}

export default function PartnerDashboardPage({ role }) {
    if (role === 'bulk_buyer') return <BulkBuyerWorkspace />;
    if (role === 'fpo') return <FpoWorkspace />;
    const [records, setRecords] = useState([]);
    const [form, setForm] = useState({ crop: '', quantity: '', location: '', farmer_id: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const path = role === 'fpo' ? 'fpo/aggregations' : 'field-assistant/farmers';
    async function load() { const result = await getPartnerRecords(path); setRecords(result.items); }
    useEffect(() => { load().catch(() => setError('Unable to load workspace records')); }, [path]);
    async function submit(event) {
        event.preventDefault();
        setError('');
        try { const data = role === 'field_assistant' ? { farmer_id: Number(form.farmer_id) } : { crop: form.crop, quantity: Number(form.quantity) }; await createPartnerRecord(path, data); setForm({ crop: '', quantity: '', location: '', farmer_id: '' }); setMessage('Saved to the database.'); await load(); }
        catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to save record'); }
    }
    const title = role === 'fpo' ? 'FPO aggregation' : 'Assigned farmers';
    return <main className="partner-page min-h-screen p-6 text-white"><div className="container max-w-5xl"><Link className="text-sm text-emerald-200" to="/profile">Profile</Link><p className="mt-6 text-sm uppercase tracking-[0.2em] text-emerald-200/70">Partner operations</p><h1 className="mt-2 text-4xl font-black">{title}</h1>{message && <p className="mt-4 text-emerald-200" role="status">{message}</p>}{error && <p className="mt-4 text-rose-300" role="alert">{error}</p>}<form className="card mt-8 grid gap-4 p-6 md:grid-cols-3" onSubmit={submit}>{role === 'field_assistant' ? <label className="block md:col-span-2"><span className="mb-2 block text-sm text-emerald-100/80">Farmer user ID</span><input className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3" type="number" min="1" value={form.farmer_id} onChange={(event) => setForm({ ...form, farmer_id: event.target.value })} required/></label> : <><label className="block"><span className="mb-2 block text-sm text-emerald-100/80">Crop</span><input className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3" value={form.crop} onChange={(event) => setForm({ ...form, crop: event.target.value })} required/></label><label className="block"><span className="mb-2 block text-sm text-emerald-100/80">Quantity</span><input className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3" type="number" min="0.01" step="0.01" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} required/></label></>}<button className="btn-primary md:col-span-3" type="submit">Save</button></form><section className="mt-8 space-y-3">{records.map((record) => <div className="partner-record card" key={record.id}><pre className="text-sm">{JSON.stringify(record, null, 2)}</pre></div>)}</section></div></main>;
}
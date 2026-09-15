import { ArrowLeft, ArrowRight, BarChart3, Building2, CheckCircle2, ClipboardList, Factory, MapPin, PackageCheck, Plus, RefreshCw, ShieldCheck, ShoppingBasket, Sparkles, Store, Trash2, Truck, Users, Wheat } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPartnerRecord, deletePartnerRecord, getPartnerRecords, getPartnerRequirementMatches } from '../../services/api';
import { getProductImage } from '../../utils/productImages';

function BulkBuyerWorkspace() {
    const storedUser = JSON.parse(localStorage.getItem('farmdirect_user') || '{}');
    const fullName = storedUser.full_name || storedUser.name || '';
    const emailLocalPart = (storedUser.email || '').split('@')[0] || 'Bulk Buyer';
    const displayName = fullName || emailLocalPart || 'Bulk Buyer';
    const firstName = displayName.split(/\s+/).filter(Boolean)[0] || 'Bulk Buyer';
    const avatarInitials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'BB';
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
    const buyerCategories = [
        { title: 'Government / Institutional Buyers', description: 'Bulk orders for public procurement, institutions, and catering needs.', Icon: Building2 },
        { title: 'Retailers', description: 'Multi-location orders with predictable supply planning and fast replenishment.', Icon: Store },
        { title: 'Distributors', description: 'Steady volumes, route coverage, and reliable sourcing across growing markets.', Icon: Factory },
        { title: 'Organizations', description: 'Consistent supply for schools, canteens, and network operations.', Icon: Users },
        { title: 'Other Bulk Purchasers', description: 'Flexible procurement for managed demand and multi-vendor buying programs.', Icon: PackageCheck },
    ];
    const benefits = [
        { title: 'Better procurement', description: 'Compare supply against demand in one live operating view.', Icon: ClipboardList },
        { title: 'Large-volume ordering', description: 'Set high-volume requirements with confidence and clarity.', Icon: ShoppingBasket },
        { title: 'Fast order management', description: 'Keep quantities, routes, and partner matches coordinated.', Icon: Truck },
        { title: 'Transparent process', description: 'Every requirement stays visible and easy to manage.', Icon: ShieldCheck },
    ];
    const workflowSteps = [
        'Select products',
        'Specify quantity',
        'Review bulk order',
        'Delivery coordination',
        'Secure payment',
    ];
    const scrollToBrief = () => {
        const formElement = document.getElementById('bulk-buyer-brief-form');
        if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return <main className="bulk-buyer-page"><div className="bulk-buyer-shell">
        <aside className="bulk-buyer-sidebar">
            <div className="bulk-buyer-profile">
                <div className="bulk-buyer-avatar"><span>{avatarInitials}</span></div>
                <div className="bulk-buyer-profile-meta">
                    <strong>{displayName}</strong>
                    <small>Bulk buyer desk</small>
                </div>
            </div>
            <nav className="bulk-buyer-sidebar-nav" aria-label="Bulk buyer navigation">
                <Link className="bulk-buyer-nav-item active" to="/dashboard/bulk-buyer"><ShoppingBasket size={16}/> Dashboard</Link>
                <Link className="bulk-buyer-nav-item" to="/profile"><ArrowLeft size={16}/> Profile</Link>
                <button className="bulk-buyer-nav-item bulk-buyer-nav-button" type="button"><ClipboardList size={16}/> Requirements</button>
                <button className="bulk-buyer-nav-item bulk-buyer-nav-button" type="button"><ShieldIcon /> Compliance</button>
            </nav>
            <div className="bulk-buyer-sidebar-foot">
                <div className="bulk-buyer-pill"><CheckCircle2 size={14}/> Live sourcing</div>
            </div>
        </aside>
        <div className="bulk-buyer-main-panel">
            <header className="bulk-buyer-toolbar">
                <div className="bulk-buyer-toolbar-copy">
                    <span className="bulk-buyer-kicker"><Sparkles size={14}/> Procurement control room</span>
                    <h1>Good Morning, {firstName}.</h1>
                    <p>Connecting farmers directly to buyers.</p>
                </div>
                <div className="bulk-buyer-toolbar-actions">
                    <button type="button" className="bulk-buyer-icon-button" aria-label="Refresh buying desk" onClick={load} disabled={loading}><RefreshCw size={15}/></button>
                    <button type="button" className="bulk-buyer-icon-button" aria-label="Notifications"><ShieldCheck size={16}/></button>
                    <button type="button" className="bulk-buyer-icon-button" aria-label="Settings"><Plus size={16}/></button>
                </div>
            </header>

            <section className="bulk-buyer-hero">
                <div className="bulk-buyer-hero-copy">
                    <span className="bulk-buyer-hero-badge"><Sparkles size={14}/> Bulk procurement</span>
                    <h2>Bulk Buying Made Simple</h2>
                    <p>Discover trusted supply, manage large-volume requirements, and keep your ordering process efficient from sourcing to delivery.</p>
                    <div className="bulk-buyer-hero-actions">
                        <button type="button" className="bulk-buyer-primary-cta" onClick={scrollToBrief}>Start Bulk Order <ArrowRight size={16}/></button>
                        <div className="bulk-buyer-mini-metric"><span>Live supply</span><strong>{Object.values(matches).flat().length}</strong></div>
                    </div>
                </div>
                <div className="bulk-buyer-hero-visual" aria-hidden="true">
                    <div className="bulk-buyer-floating-card bulk-buyer-floating-card--top">
                        <span>Procured</span>
                        <strong>{totalVolume.toLocaleString('en-IN')}</strong>
                        <small>units this cycle</small>
                    </div>
                    <div className="bulk-buyer-hero-panel">
                        {featuredProduct ? <img src={getProductImage(featuredProduct)} alt={`${featuredProduct.name} from a farm partner`}/> : <img src={getProductImage({ name: 'Tomato' })} alt="Fresh produce from FarmDirect"/>}
                    </div>
                    <div className="bulk-buyer-floating-card bulk-buyer-floating-card--bottom">
                        <span>Best match</span>
                        <strong>{featuredProduct?.name || 'Fresh produce'}</strong>
                        <small>{featuredProduct ? `${featuredProduct.location}` : 'Regional partner'}</small>
                    </div>
                </div>
            </section>

            <section className="bulk-buyer-category-panel">
                <div className="bulk-buyer-section-head">
                    <span className="bulk-buyer-kicker">Buyer segments</span>
                    <h3>Built for every bulk buyer</h3>
                </div>
                <div className="bulk-buyer-categories">
                    {buyerCategories.map(({ title, description, Icon }, index) => (
                        <article className="bulk-buyer-category-card" key={title} style={{ animationDelay: `${index * 90}ms` }}>
                            <div className="bulk-buyer-category-icon"><Icon size={18}/></div>
                            <h4>{title}</h4>
                            <p>{description}</p>
                        </article>
                    ))}
                </div>
            </section>

            {message && <p className="bulk-buyer-notice" role="status"><CheckCircle2 size={16}/>{message}</p>}{error && <p className="bulk-buyer-error" role="alert">{error}</p>}

            <section className="bulk-buyer-command-stats">
                <div className="bulk-buyer-stat-card bulk-buyer-stat-card--primary"><span>Active briefs</span><strong>{records.length}</strong><small>requests in motion</small></div>
                <div className="bulk-buyer-stat-card"><span>Demand volume</span><strong>{totalVolume.toLocaleString('en-IN')}</strong><small>units requested</small></div>
                <div className="bulk-buyer-stat-card"><span>Supply matches</span><strong>{Object.values(matches).flat().length}</strong><small>farm listings found</small></div>
                <div className="bulk-buyer-stat-card"><span>Destinations</span><strong>{new Set(records.map((record) => record.location)).size}</strong><small>buying routes covered</small></div>
            </section>

            <section className="bulk-buyer-workflow">
                <div className="bulk-buyer-section-head">
                    <span className="bulk-buyer-kicker">Procurement flow</span>
                    <h3>How bulk buying works</h3>
                </div>
                <div className="bulk-buyer-workflow-steps">
                    {workflowSteps.map((step, index) => (
                        <div className="bulk-buyer-workflow-step" key={step} style={{ animationDelay: `${index * 100}ms` }}>
                            <div className="bulk-buyer-workflow-icon">0{index + 1}</div>
                            <span>{step}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bulk-buyer-benefits">
                {benefits.map(({ title, description, Icon }, index) => (
                    <article className="bulk-buyer-benefit-card" key={title} style={{ animationDelay: `${index * 120}ms` }}>
                        <div className="bulk-buyer-benefit-icon"><Icon size={18}/></div>
                        <h4>{title}</h4>
                        <p>{description}</p>
                    </article>
                ))}
            </section>

            <div className="bulk-buyer-command-grid">
                <form id="bulk-buyer-brief-form" className="bulk-buyer-form bulk-buyer-brief-panel" onSubmit={submit}>
                    <div className="bulk-buyer-heading">
                        <div>
                            <span className="bulk-buyer-label">01 / Publish a brief</span>
                            <h2>What should we source?</h2>
                        </div>
                        <div className="bulk-buyer-form-badge"><Plus size={18}/></div>
                    </div>
                    <div className="bulk-buyer-form-fields">
                        <label>
                            <span>Crop or product</span>
                            <div className="bulk-buyer-input"><Wheat size={16}/><input value={form.crop} onChange={(event) => setForm({ ...form, crop: event.target.value })} placeholder="Onion, tomato, rice" required/></div>
                        </label>
                        <label>
                            <span>Quantity required</span>
                            <div className="bulk-buyer-input"><ClipboardList size={16}/><input type="number" min="0.01" step="0.01" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} placeholder="Enter volume" required/></div>
                        </label>
                        <label>
                            <span>Delivery location</span>
                            <div className="bulk-buyer-input"><MapPin size={16}/><input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="City or distribution hub" required/></div>
                        </label>
                    </div>
                    <button className="bulk-buyer-submit" type="submit" disabled={loading}><Plus size={16}/> {loading ? 'Updating buying desk...' : 'Publish requirement'}</button>
                    <p className="bulk-buyer-form-note">The brief stays private to your account until you remove it.</p>
                </form>

                <section className="bulk-buyer-requirements bulk-buyer-queue-panel">
                    <div className="bulk-buyer-list-heading">
                        <div>
                            <span className="bulk-buyer-label">02 / Active queue</span>
                            <h2>Requests in motion</h2>
                        </div>
                        <button className="bulk-buyer-refresh" type="button" onClick={load} disabled={loading}><RefreshCw size={15}/> {loading ? 'Refreshing' : 'Refresh'}</button>
                    </div>
                    <div className="bulk-buyer-list">
                        {records.map((record, index) => <article className="bulk-buyer-record" key={record.id}>
                            <div className="bulk-buyer-record-number">0{index + 1}</div>
                            <div className="bulk-buyer-record-main">
                                <div>
                                    <h3>{record.crop}</h3>
                                    <span className="bulk-buyer-open">{record.status || 'OPEN'}</span>
                                </div>
                                <p><ClipboardList size={14}/> {record.quantity} units <i>·</i> <MapPin size={14}/> {record.location}</p>
                            </div>
                            <div className="bulk-buyer-record-actions">
                                <button type="button" title="Remove requirement" aria-label={`Delete ${record.crop} requirement`} onClick={() => remove(record)}><Trash2 size={15}/></button>
                            </div>
                            <div className="bulk-buyer-matches">
                                <div className="bulk-buyer-matches-heading"><span>Available farm partners</span><b>{matches[record.id]?.length || 0} matches</b></div>
                                {matches[record.id]?.length ? <div className="bulk-buyer-match-list">{matches[record.id].slice(0, 4).map((product) => <div className="bulk-buyer-match" key={product.id}><img src={getProductImage(product)} alt=""/><div><strong>{product.name}</strong><span>{product.quantity} {product.unit} · {product.location}</span></div><b>₹{product.price}<small>/{product.unit}</small></b></div>)}</div> : <p className="bulk-buyer-no-match">No available farm listing meets this volume yet.</p>}
                            </div>
                        </article>)}
                        {records.length === 0 && <div className="bulk-buyer-empty"><ShoppingBasket size={32}/><h3>Your buying queue is clear</h3><p>Publish a requirement to start sourcing from verified farm partners.</p></div>}
                    </div>
                </section>
            </div>
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
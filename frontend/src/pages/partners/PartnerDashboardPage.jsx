import { ArrowLeft, ArrowRight, BarChart3, Bell, Boxes, Building2, CheckCircle2, ClipboardList, Factory, LayoutDashboard, MapPin, PackageCheck, Plus, RefreshCw, Search, Settings, ShieldCheck, ShoppingBasket, Sparkles, Store, Tractor, Trash2, Truck, Users, Wheat } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
    const location = useLocation();
    const [aggregations, setAggregations] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    async function load() {
        setLoading(true);
        setError('');
        try {
            const [aggregationResult, memberResult] = await Promise.all([
                getPartnerRecords('fpo/aggregations'),
                getPartnerRecords('fpo/members'),
            ]);
            const nextAggregations = aggregationResult.items || [];
            const nextMembers = memberResult.items || [];
            setAggregations(nextAggregations);
            setMembers(nextMembers);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to load FPO workspace');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    const totalVolume = useMemo(() => aggregations.reduce((total, record) => total + Number(record.quantity || 0), 0), [aggregations]);
    const cropCount = new Set((aggregations || []).map((record) => String(record.crop || '').toLowerCase()).filter(Boolean)).size;
    const memberPreview = members.slice(0, 3);
    const ledgerPreview = aggregations.slice(0, 3);
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
                            <button type="button" className="fpo-icon-button" aria-label="Notifications">
                                <Bell size={15} />
                            </button>
                            <div className="fpo-avatar">G</div>
                        </div>
                    </header>

                    <div className="fpo-dashboard-grid">
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
                                        <strong>{members.length || 2}</strong>
                                    </div>
                                </div>
                            </div>
                            <div className="fpo-mini-stats">
                                <div className="fpo-mini-stat">
                                    <span>Members</span>
                                    <strong>{members.length || 2}</strong>
                                </div>
                                <div className="fpo-mini-stat">
                                    <span>Volume</span>
                                    <strong>{totalVolume.toLocaleString('en-IN') || '1,256'}</strong>
                                </div>
                                <div className="fpo-mini-stat">
                                    <span>Crop lines</span>
                                    <strong>{cropCount || 2}</strong>
                                </div>
                            </div>
                        </article>

                        <article className="fpo-card fpo-card--members">
                            <div className="fpo-card-head">
                                <div>
                                    <span className="fpo-card-label">Members</span>
                                    <h3>Members Management</h3>
                                </div>
                                <button type="button" className="fpo-card-action">View all</button>
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
                                <button type="button" className="fpo-card-action">Details</button>
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
                                <button type="button" className="fpo-card-action">Open</button>
                            </div>
                            <div className="fpo-order-list">
                                <div className="fpo-order-row"><span>Tomato</span><strong>500 kg</strong><small>₹12,500</small></div>
                                <div className="fpo-order-row"><span>Rice</span><strong>180 kg</strong><small>₹9,700</small></div>
                                <div className="fpo-order-row"><span>Onion</span><strong>240 kg</strong><small>₹8,300</small></div>
                            </div>
                        </article>

                        <article className="fpo-card fpo-card--analytics">
                            <div className="fpo-card-head">
                                <div>
                                    <span className="fpo-card-label">Analytics</span>
                                    <h3>FPO Analytics</h3>
                                </div>
                                <button type="button" className="fpo-card-action">This month</button>
                            </div>
                            <div className="fpo-chart-box">
                                <div className="fpo-chart-ring"><span>₹ 6.45L</span></div>
                                <div className="fpo-chart-legend">
                                    <div><i className="dot green" /> Tomato</div>
                                    <div><i className="dot gold" /> Rice</div>
                                    <div><i className="dot orange" /> Onion</div>
                                </div>
                            </div>
                        </article>

                        <article className="fpo-card fpo-card--insights">
                            <div className="fpo-card-head">
                                <div>
                                    <span className="fpo-card-label">AI Insights</span>
                                    <h3>Demand Forecast</h3>
                                </div>
                                <button type="button" className="fpo-card-action">View</button>
                            </div>
                            <div className="fpo-metric-list">
                                <div><span>Tomato</span><strong>₹ 42.9k</strong></div>
                                <div><span>Rice</span><strong>₹ 48.5k</strong></div>
                                <div><span>Onion</span><strong>₹ 41.7k</strong></div>
                            </div>
                        </article>

                        <article className="fpo-card fpo-card--logistics">
                            <div className="fpo-card-head">
                                <div>
                                    <span className="fpo-card-label">Logistics</span>
                                    <h3>Delivery Status</h3>
                                </div>
                                <button type="button" className="fpo-card-action">Track</button>
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
                                <button type="button" className="fpo-card-action">Review</button>
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
                                <button type="button" className="fpo-card-action">Open</button>
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
                                <button type="button" className="fpo-card-action">View all</button>
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
                                <button type="button" className="fpo-card-action">Manage</button>
                            </div>
                            <div className="fpo-settings-stack">
                                <div><span>Profile</span><strong>Active</strong></div>
                                <div><span>Compliance</span><strong>Verified</strong></div>
                                <div><span>Pricing</span><strong>Synced</strong></div>
                            </div>
                        </article>
                    </div>

                    {error && <p className="fpo-error" role="alert">{error}</p>}
                    {message && <p className="fpo-notice" role="status"><CheckCircle2 size={16} />{message}</p>}
                </div>
            </div>
        </main>
    );
}

export default function PartnerDashboardPage({ role = 'fpo' }) {
    if (role === 'bulk_buyer' || role === 'field_assistant') {
        return <BulkBuyerWorkspace />;
    }

    return <FpoWorkspace />;
}

import { ArrowRight, ClipboardList, MapPin, Plus, RefreshCw, ShoppingBasket, Trash2, Wheat } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPartnerRecord, deletePartnerRecord, getPartnerRecords, getPartnerRequirementMatches } from '../../services/api';
import BulkBuyerSidebar from '../../components/layout/BulkBuyerSidebar';
import { getProductImage } from '../../utils/productImages';

export default function BulkBuyerRequirementsPage() {
    const [records, setRecords] = useState([]);
    const [matches, setMatches] = useState({});
    const [form, setForm] = useState({ crop: '', quantity: '', location: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function load() {
        setLoading(true);
        setError('');
        try {
            const result = await getPartnerRecords('bulk/requirements');
            const requirements = result.items || [];
            setRecords(requirements);
            const matchResults = await Promise.all(requirements.map(async (record) => {
                try { return [record.id, (await getPartnerRequirementMatches(record.id)).matches || []]; }
                catch { return [record.id, []]; }
            }));
            setMatches(Object.fromEntries(matchResults));
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to load requirements');
        } finally { setLoading(false); }
    }

    useEffect(() => { load(); }, []);

    async function submit(event) {
        event.preventDefault();
        setError('');
        try {
            await createPartnerRecord('bulk/requirements', { crop: form.crop, quantity: Number(form.quantity), location: form.location });
            setForm({ crop: '', quantity: '', location: '' });
            setMessage('Requirement published to your buying desk.');
            await load();
        } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to save requirement'); }
    }

    async function remove(record) {
        if (!window.confirm(`Delete the ${record.crop} requirement? It will be removed permanently.`)) return;
        try {
            await deletePartnerRecord('bulk/requirements', record.id);
            setRecords((current) => current.filter((item) => item.id !== record.id));
            setMatches((current) => { const next = { ...current }; delete next[record.id]; return next; });
            setMessage(`${record.crop} requirement deleted permanently.`);
        } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to delete requirement'); }
    }

    return <main className="bulk-buyer-page"><div className="bulk-buyer-shell">
        <BulkBuyerSidebar />
        <div className="bulk-buyer-main-panel bulk-buyer-requirements-page">
            <header className="bulk-buyer-toolbar"><div className="bulk-buyer-toolbar-copy"><span className="bulk-buyer-kicker">Bulk procurement</span><h1>Create Bulk Requirement</h1><p>Publish demand and review the best available farm partners.</p></div><button className="bulk-buyer-refresh" type="button" onClick={load} disabled={loading}><RefreshCw size={15}/> {loading ? 'Refreshing' : 'Refresh'}</button></header>
            {message && <p className="bulk-buyer-notice" role="status">{message}</p>}{error && <p className="bulk-buyer-error" role="alert">{error}</p>}
            <nav className="bulk-buyer-requirement-stepper" aria-label="Bulk requirement steps"><span className="is-current"><b>1</b> Product Details</span><i><ArrowRight size={13}/></i><span><b>2</b> Quantity &amp; Quality</span><i><ArrowRight size={13}/></i><span><b>3</b> Location &amp; Delivery</span><i><ArrowRight size={13}/></i><span><b>4</b> Review</span></nav>
            <div className="bulk-buyer-requirements-layout">
                <form className="bulk-buyer-form bulk-buyer-requirement-form" onSubmit={submit}><div className="bulk-buyer-heading"><div><span className="bulk-buyer-label">Product Details</span><h2>What do you need?</h2></div><div className="bulk-buyer-form-badge"><Plus size={18}/></div></div><label><span>Select Product</span><div className="bulk-buyer-input"><Wheat size={16}/><input value={form.crop} onChange={(event) => setForm({ ...form, crop: event.target.value })} placeholder="Tomato" required/></div></label><div className="bulk-buyer-form-row"><label><span>Category</span><select defaultValue="Vegetables"><option>Vegetables</option><option>Fruits</option><option>Grains</option><option>Organic</option></select></label><label><span>Preferred Grade</span><select defaultValue="A (Top Quality)"><option>A (Top Quality)</option><option>B (Standard)</option><option>Any grade</option></select></label></div><label><span>Quantity Required <small>(kg)</small></span><div className="bulk-buyer-input"><ClipboardList size={16}/><input type="number" min="0.01" step="0.01" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} placeholder="5000" required/></div></label><div className="bulk-buyer-form-row"><label><span>Price Range <small>(/kg)</small></span><div className="bulk-buyer-price-range"><input type="number" min="0" placeholder="Min"/><i>to</i><input type="number" min="0" placeholder="Max"/></div></label><label><span>Delivery Location</span><div className="bulk-buyer-input"><MapPin size={16}/><input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="Mumbai" required/></div></label></div><label><span>Additional Notes <small>(Optional)</small></span><textarea placeholder="Any special requirements, packaging, or timing..." rows="3" /></label><div className="bulk-buyer-requirement-actions"><button className="bulk-buyer-cancel" type="button" onClick={() => setForm({ crop: '', quantity: '', location: '' })}>Cancel</button><button className="bulk-buyer-submit" type="submit" disabled={loading}>{loading ? 'Publishing...' : 'Next'} <ArrowRight size={15}/></button></div><p className="bulk-buyer-form-note">Your requirement stays private to your buying desk until published.</p></form>
                <aside className="bulk-buyer-requirement-preview"><span className="bulk-buyer-preview-label">Preview</span><img src={getProductImage({ name: form.crop || 'Tomato' })} alt="Selected produce"/><div><span>Fresh from verified farms</span><strong>{form.crop || 'Tomato'}</strong><small>{form.quantity ? `${form.quantity} kg required` : 'Choose a product and quantity'}</small></div></aside>
                <section id="bulk-buyer-matches" className="bulk-buyer-requirements bulk-buyer-queue-panel"><div className="bulk-buyer-list-heading"><div><span className="bulk-buyer-label">02 / Active queue</span><h2>Requests in motion</h2></div></div><div className="bulk-buyer-list">{records.map((record, index) => <article className="bulk-buyer-record" key={record.id}><div className="bulk-buyer-record-number">0{index + 1}</div><div className="bulk-buyer-record-main"><div><h3>{record.crop}</h3><span className="bulk-buyer-open">{record.status || 'OPEN'}</span></div><p><ClipboardList size={14}/> {record.quantity} units <i>·</i> <MapPin size={14}/> {record.location}</p></div><div className="bulk-buyer-record-actions"><button type="button" title="Remove requirement" aria-label={`Delete ${record.crop} requirement`} onClick={() => remove(record)}><Trash2 size={15}/></button></div><div className="bulk-buyer-matches"><div className="bulk-buyer-matches-heading"><span>Available farm partners</span><b>{matches[record.id]?.length || 0} matches</b></div>{matches[record.id]?.length ? <div className="bulk-buyer-match-list">{matches[record.id].slice(0, 4).map((product) => <div className="bulk-buyer-match" key={product.id}><img src={getProductImage(product)} alt=""/><div><strong>{product.name}</strong><span>{product.quantity} {product.unit} · {product.location}</span></div><b>₹{product.price}<small>/{product.unit}</small></b></div>)}</div> : <p className="bulk-buyer-no-match">No available farm listing meets this volume yet.</p>}</div></article>)}{records.length === 0 && <div className="bulk-buyer-empty"><ShoppingBasket size={32}/><h3>Your buying queue is clear</h3><p>Publish a requirement to start sourcing from verified farm partners.</p></div>}</div></section>
            </div>
        </div>
    </div></main>;
}

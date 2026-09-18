import { CheckCircle2, ClipboardList, MapPin, PackageCheck, RefreshCw, Search, ShieldCheck, Sparkles, Star, Users, Wheat } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import BulkBuyerSidebar from '../../components/layout/BulkBuyerSidebar';
import { getPartnerRecords, getPartnerRequirementMatches } from '../../services/api';
import { getProductImage } from '../../utils/productImages';

const scoreFor = (product, index) => ({
    price: Math.max(82, 96 - index * 4),
    quality: Math.max(84, 94 - index * 2),
    location: Math.max(78, 91 - index * 5),
    availability: Math.max(80, 90 - index * 3),
    match: Math.max(74, 95 - index * 6),
});

export default function BulkBuyerMatchingPage() {
    const [records, setRecords] = useState([]);
    const [matches, setMatches] = useState({});
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    async function load() {
        setLoading(true);
        setError('');
        try {
            const result = await getPartnerRecords('bulk/requirements');
            const requirements = result.items || [];
            setRecords(requirements);
            if (!selectedId && requirements[0]) setSelectedId(requirements[0].id);
            const matchResults = await Promise.all(requirements.map(async (record) => {
                try { return [record.id, (await getPartnerRequirementMatches(record.id)).matches || []]; }
                catch { return [record.id, []]; }
            }));
            setMatches(Object.fromEntries(matchResults));
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to load matching results');
        } finally { setLoading(false); }
    }

    useEffect(() => { load(); }, []);

    const selectedRequirement = records.find((record) => record.id === selectedId) || records[0];
    const products = selectedRequirement ? matches[selectedRequirement.id] || [] : [];
    const requirementScores = useMemo(() => ({ price: 92, quality: 96, location: 88, availability: 90 }), []);

    return <main className="bulk-buyer-page"><div className="bulk-buyer-shell">
        <BulkBuyerSidebar />
        <div className="bulk-buyer-main-panel bulk-buyer-matching-page">
            <header className="bulk-buyer-toolbar"><div className="bulk-buyer-toolbar-copy"><span className="bulk-buyer-kicker"><Sparkles size={14}/> AI-powered procurement</span><h1>AI Supplier Matching</h1><p>Find the best farm partners for every requirement.</p></div><button className="bulk-buyer-refresh" type="button" onClick={load} disabled={loading}><RefreshCw size={15}/> {loading ? 'Refreshing' : 'Refresh matches'}</button></header>
            {error && <p className="bulk-buyer-error" role="alert">{error}</p>}
            <div className="bulk-buyer-matching-layout">
                <aside className="bulk-buyer-matching-requirement"><div className="bulk-buyer-matching-card-head"><span className="bulk-buyer-label">Your Requirement</span><button type="button" aria-label="Search requirements"><Search size={15}/></button></div>{records.length ? <div className="bulk-buyer-requirement-picker">{records.map((record) => <button type="button" className={record.id === selectedRequirement?.id ? 'is-selected' : ''} onClick={() => setSelectedId(record.id)} key={record.id}><span>{record.crop}</span><small>{record.quantity} units · {record.location}</small></button>)}</div> : <div className="bulk-buyer-matching-empty"><ClipboardList size={28}/><p>No requirements yet.</p><small>Create a requirement to start matching suppliers.</small></div>}{selectedRequirement && <div className="bulk-buyer-selected-requirement"><div className="bulk-buyer-selected-product"><div className="bulk-buyer-product-orb"><Wheat size={18}/></div><div><strong>{selectedRequirement.crop}</strong><small>{selectedRequirement.quantity} kg</small></div><span className="bulk-buyer-open">{selectedRequirement.status || 'OPEN'}</span></div><div className="bulk-buyer-selected-meta"><span><MapPin size={13}/> {selectedRequirement.location}</span><span><PackageCheck size={13}/> Grade A preferred</span></div><button type="button" className="bulk-buyer-edit-requirement">Edit requirement</button></div>}</aside>
                <section className="bulk-buyer-matching-results"><div className="bulk-buyer-matching-results-head"><div><span className="bulk-buyer-label">Matching Results</span><h2>Best suppliers for your requirement</h2><p>{products.length || 0} verified farm partners ranked by AI.</p></div><span className="bulk-buyer-match-count"><Users size={15}/> {products.length} matches</span></div>{loading ? <div className="bulk-buyer-matching-loading">Loading supplier matches...</div> : products.length ? <div className="bulk-buyer-supplier-list">{products.map((product, index) => { const scores = scoreFor(product, index); return <article className="bulk-buyer-supplier-card" key={product.id}><div className="bulk-buyer-supplier-rank">{index + 1}</div><img src={getProductImage(product)} alt={product.name}/><div className="bulk-buyer-supplier-main"><div className="bulk-buyer-supplier-title"><div><strong>{product.name}</strong><small>{product.location || 'Regional farm partner'} · Verified supplier</small></div><span className="bulk-buyer-match-pill">{scores.match}% Match</span></div><div className="bulk-buyer-supplier-tags"><span><Star size={12}/> Grade A</span><span><PackageCheck size={12}/> {product.quantity} {product.unit}</span><span><MapPin size={12}/> {product.location}</span></div><div className="bulk-buyer-supplier-footer"><strong>₹{product.price}<small>/{product.unit}</small></strong><button type="button" onClick={() => setSelectedId(selectedRequirement.id)}>Select supplier</button></div></div></article>; })}</div> : <div className="bulk-buyer-matching-empty bulk-buyer-matching-empty--large"><ShieldCheck size={32}/><h3>No matching suppliers yet</h3><p>Try a lower quantity or publish a new requirement to improve the match signal.</p></div>}</section>
                <aside className="bulk-buyer-match-analysis"><div className="bulk-buyer-matching-card-head"><div><span className="bulk-buyer-label">Match Analysis</span><h2>Why these suppliers?</h2></div><Sparkles size={17}/></div>{Object.entries(requirementScores).map(([label, value]) => <div className="bulk-buyer-score-row" key={label}><div><span>{label}</span><strong>{value}%</strong></div><i><b style={{ width: `${value}%` }}/></i></div>)}<div className="bulk-buyer-ai-suggestion"><Sparkles size={15}/><div><strong>AI Suggestion</strong><p>{products[0] ? `${products[0].name} is the best match for your requirement based on quality, price, and availability.` : 'Publish a requirement to receive supplier recommendations.'}</p></div></div><button type="button" className="bulk-buyer-details-button"><CheckCircle2 size={15}/> View supplier details</button></aside>
            </div>
        </div>
    </div></main>;
}

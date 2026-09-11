import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, MapPin, PackageCheck, Search, ShoppingCart, SlidersHorizontal, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { addToCart, getProducts } from '../../services/api';
import { getProductImage } from '../../utils/productImages';

export default function MarketplacePage() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [sort, setSort] = useState('featured');
    const [status, setStatus] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(true);
    useEffect(() => { getProducts().then((result) => setProducts(result.items || [])).catch(() => setStatus({ type: 'error', text: 'Unable to load marketplace. Try again shortly.' })).finally(() => setLoading(false)); }, []);
    const categories = useMemo(() => ['All', ...new Set(products.map((product) => product.category).filter(Boolean))], [products]);
    const visible = useMemo(() => {
        const query = search.trim().toLowerCase();
        return products.filter((product) => category === 'All' || product.category === category).filter((product) => !query || `${product.name} ${product.crop} ${product.location} ${product.quality}`.toLowerCase().includes(query)).sort((first, second) => sort === 'price-low' ? first.price - second.price : sort === 'price-high' ? second.price - first.price : first.name.localeCompare(second.name));
    }, [category, products, search, sort]);
    async function handleAdd(product) {
        try { await addToCart(product.id); setStatus({ type: 'success', text: `${product.name} added to your cart.` }); }
        catch (error) { setStatus({ type: 'error', text: error instanceof Error ? error.message : 'Unable to add item.' }); }
    }
    return <main className="marketplace-page min-h-screen p-6 text-white sm:p-8"><div className="container">
      <div className="flex flex-wrap items-center justify-between gap-4"><Link className="inline-flex items-center gap-2 text-sm text-emerald-200" to="/dashboard/consumer"><ArrowRight className="rotate-180" size={15}/> Dashboard</Link><Link className="btn-secondary" to="/cart"><ShoppingCart size={16}/> View cart</Link></div>
      <section className="marketplace-heading mt-10"><div><p className="eyebrow inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]"><Sparkles size={14}/> Fresh network</p><h1 className="mt-4 max-w-3xl text-4xl font-black md:text-6xl">Source produce with a clearer chain of custody.</h1><p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50/70">Browse current listings from FarmDirect partners, compare supply, and move from discovery to cart in one step.</p></div><div className="marketplace-count"><PackageCheck size={22}/><strong>{products.length}</strong><span>live listings</span></div></section>
      <section className="marketplace-toolbar mt-8" aria-label="Marketplace filters"><label className="marketplace-search"><Search size={18}/><span className="sr-only">Search produce</span><input placeholder="Search produce, crop, location..." value={search} onChange={(event) => setSearch(event.target.value)}/></label><div className="marketplace-select"><SlidersHorizontal size={16}/><label className="sr-only" htmlFor="category">Category</label><select id="category" value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></div><div className="marketplace-select"><label className="sr-only" htmlFor="sort">Sort listings</label><select id="sort" value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Sort: featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></div></section>
      {status.text && <p className={`mt-4 text-sm ${status.type === 'error' ? 'text-rose-300' : 'text-emerald-200'}`} role={status.type === 'error' ? 'alert' : 'status'}>{status.text}</p>}
      {loading ? <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div className="marketplace-skeleton card h-[390px]" key={item}/>)}</div> : <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{visible.map((product) => <article className="product-card card overflow-hidden p-0" key={product.id}><div className="product-card-image"><img src={getProductImage(product)} alt={`${product.name} produce from ${product.location || 'a FarmDirect partner'}`}/><span><Star size={13}/> {product.quality || 'Listed quality'}</span></div><div className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200/70">{product.category || 'Produce'}</p><h2 className="mt-2 text-2xl font-bold">{product.name}</h2></div><p className="text-right text-xl font-black text-emerald-200">₹{product.price}<small className="block text-xs font-normal text-emerald-50/60">per {product.unit}</small></p></div><div className="mt-5 flex flex-wrap gap-2 text-xs text-emerald-50/65"><span><MapPin size={13}/> {product.location || 'Location pending'}</span><span><PackageCheck size={13}/> {product.quantity} {product.unit} available</span></div><button className="btn-primary mt-6 w-full" type="button" onClick={() => handleAdd(product)}><ShoppingCart size={16}/> Add to cart</button></div></article>)}{visible.length === 0 && <div className="empty-state card md:col-span-2 lg:col-span-3"><PackageCheck size={34}/><h2>No matching produce</h2><p>Try another crop, location, or category.</p><button className="btn-secondary" type="button" onClick={() => { setSearch(''); setCategory('All'); }}>Clear filters</button></div>}</div>}
    </div></main>;
}

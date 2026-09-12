import { ArrowLeft, Boxes, LoaderCircle, Package, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminProducts } from '../../services/api';
import { getProductImage } from '../../utils/productImages';

export default function AdminProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getAdminProducts()
            .then((result) => setProducts(result.items || []))
            .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load products'))
            .finally(() => setLoading(false));
    }, []);

    const totalInventory = products.reduce((sum, product) => sum + Number(product.quantity || 0), 0);
    const averagePrice = products.length ? products.reduce((sum, product) => sum + Number(product.price || 0), 0) / products.length : 0;

    return <main className="admin-command admin-management-page"><div className="admin-command-container">
        <div className="admin-management-breadcrumb"><Link to="/dashboard/admin"><ArrowLeft size={14}/> Admin dashboard</Link><span>CATALOGUE</span></div>
        <header className="admin-management-header"><div className="admin-management-copy"><p className="admin-kicker"><Boxes size={14}/> Product catalogue</p><h1>Review the produce inventory across the platform.</h1><p>Track what is on offer, where it is coming from, and how much value is currently available in the marketplace.</p></div><div className="admin-command-mark"><Package size={32}/><span>INVENTORY<br/>VIEW</span></div></header>
        <section className="admin-stats admin-stats-compact">
            <div><Boxes size={18}/><span>Products</span><strong>{products.length.toLocaleString()}</strong><small>listed items</small></div>
            <div><Package size={18}/><span>Inventory</span><strong>{totalInventory.toLocaleString()}</strong><small>units available</small></div>
            <div><ShieldCheck size={18}/><span>Avg. price</span><strong>₹{averagePrice.toLocaleString()}</strong><small>per listing</small></div>
            <div><Boxes size={18}/><span>Locations</span><strong>{new Set(products.map((product) => product.location).filter(Boolean)).size.toLocaleString()}</strong><small>market areas</small></div>
        </section>
        {error && <p className="admin-error" role="alert">{error}</p>}
        {loading ? <div className="admin-loading"><LoaderCircle size={22}/><span>Loading product catalogue...</span></div> : <section className="admin-management-panel"><div className="admin-panel-heading"><div><p className="admin-label"><Boxes size={14}/> Live listings</p><h2>Produce catalog</h2></div><span>{products.length} items</span></div><div className="admin-product-grid">{products.map((product) => <article className="admin-product-card" key={product.id}><div className="admin-product-media"><img src={getProductImage(product)} alt={product.name}/><span>{product.category || 'Produce'}</span></div><div className="admin-product-body"><div className="admin-product-title-row"><h3>{product.name}</h3><span className="admin-price-badge">₹{Number(product.price || 0).toLocaleString()}</span></div><p className="admin-product-meta">Farmer #{product.farmer_id || 'n/a'} · {product.location || 'Unknown location'}</p><div className="admin-product-detail-row"><span>{product.quantity || 0} {product.unit || 'units'}</span><span>{product.grade || 'Fresh'}</span></div><p className="admin-product-description">{product.description || 'Fresh produce listed through the marketplace.'}</p></div></article>)}{products.length === 0 && <p className="admin-empty-state admin-empty-span">No products are available yet.</p>}</div></section>}
    </div></main>;
}


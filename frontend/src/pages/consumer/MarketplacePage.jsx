import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, MapPin, PackageCheck, Search, ShoppingCart, SlidersHorizontal, Sparkles, Star } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { addToCart, getProducts } from '../../services/api';
import { getProductImage } from '../../utils/productImages';

export default function MarketplacePage() {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [category, setCategory] = useState(searchParams.get('category') || 'All');
    const [sort, setSort] = useState('featured');
    const [status, setStatus] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getProducts()
            .then((result) => setProducts(result.items || []))
            .catch(() => setStatus({ type: 'error', text: 'Unable to load marketplace. Try again shortly.' }))
            .finally(() => setLoading(false));
    }, []);

    const categories = useMemo(() => ['All', ...new Set(products.map((product) => product.category).filter(Boolean))], [products]);

    const visible = useMemo(() => {
        const query = search.trim().toLowerCase();
        return products
            .filter((product) => category === 'All' || product.category === category)
            .filter((product) => !query || `${product.name} ${product.crop} ${product.location} ${product.quality}`.toLowerCase().includes(query))
            .sort((first, second) => {
                if (sort === 'price-low') return first.price - second.price;
                if (sort === 'price-high') return second.price - first.price;
                return first.name.localeCompare(second.name);
            });
    }, [category, products, search, sort]);

    async function handleAdd(product) {
        try {
            await addToCart(product.id);
            setStatus({ type: 'success', text: `${product.name} added to your cart.` });
        } catch (error) {
            setStatus({ type: 'error', text: error instanceof Error ? error.message : 'Unable to add item.' });
        }
    }

    const featuredCategories = ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Organic'];

    return (
        <main className="marketplace-page">
            <div className="container">
                <div className="marketplace-shell">
                    <header className="marketplace-topbar">
                        <div className="marketplace-brand-wrap">
                            <div className="marketplace-brand-mark">FD</div>
                            <div>
                                <span className="marketplace-brand-label">FarmDirect AI</span>
                                <h1>Marketplace</h1>
                            </div>
                        </div>

                        <div className="marketplace-top-actions">
                            <div className="marketplace-stat-compact">
                                <strong>{products.length}</strong>
                                <span>Live listings</span>
                            </div>
                            <Link className="marketplace-cart-button" to="/cart">
                                <ShoppingCart size={15} />
                                <span>Cart</span>
                            </Link>
                        </div>
                    </header>

                    <div className="marketplace-banner">
                        <div className="marketplace-banner-copy">
                            <span className="marketplace-badge"><Sparkles size={12} /> Fresh network</span>
                            <h2>Source produce with a clearer chain of custody.</h2>
                            <p>Browse verified listings from partner farms, compare supply, and move from discovery to cart in one step.</p>
                        </div>

                        <div className="marketplace-banner-media" aria-label="Fresh farm produce">
                            <img
                                src="https://images.unsplash.com/photo-1464226184884-fa52ac9fcf8a?auto=format&fit=crop&w=800&q=80"
                                alt="Fresh produce from partner farms"
                            />
                            <div className="marketplace-banner-chip">
                                <span>Verified farms</span>
                                <strong>312 active partners</strong>
                            </div>
                        </div>
                    </div>

                    <div className="marketplace-toolbar" aria-label="Marketplace filters">
                        <label className="marketplace-search">
                            <Search size={16} />
                            <input
                                type="text"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search produce, crop, location..."
                            />
                        </label>

                        <div className="marketplace-filter-pair">
                            <div className="marketplace-select">
                                <SlidersHorizontal size={15} />
                                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                                    {categories.map((item) => (
                                        <option key={item} value={item}>{item}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="marketplace-select">
                                <select value={sort} onChange={(event) => setSort(event.target.value)}>
                                    <option value="featured">Featured</option>
                                    <option value="price-low">Price: low to high</option>
                                    <option value="price-high">Price: high to low</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {status.text && (
                        <p className={`marketplace-status ${status.type === 'error' ? 'is-error' : 'is-success'}`} role={status.type === 'error' ? 'alert' : 'status'}>
                            {status.text}
                        </p>
                    )}

                    <div className="marketplace-main">
                        <aside className="marketplace-sidebar card">
                            <div className="marketplace-sidebar-head">
                                <span>Quick picks</span>
                                <Link to="/dashboard/consumer">Dashboard <ArrowRight size={13} /></Link>
                            </div>

                            <div className="marketplace-category-list">
                                {featuredCategories.map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        className={`marketplace-category-pill ${category === item ? 'is-active' : ''}`}
                                        onClick={() => setCategory(item)}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>

                            <div className="marketplace-sidebar-metrics">
                                <div className="marketplace-mini-card">
                                    <strong>{products.length}</strong>
                                    <span>Available</span>
                                </div>
                                <div className="marketplace-mini-card">
                                    <strong>{Math.max(1, Math.min(12, products.length))}</strong>
                                    <span>Fresh this week</span>
                                </div>
                            </div>
                        </aside>

                        <section className="marketplace-product-panel">
                            {loading ? (
                                <div className="marketplace-product-grid">
                                    {[1, 2, 3, 4].map((item) => (
                                        <div className="marketplace-skeleton" key={item} />
                                    ))}
                                </div>
                            ) : (
                                <div className="marketplace-product-grid">
                                    {visible.map((product) => (
                                        <article className="marketplace-product-card" key={product.id}>
                                            <Link to={`/products/${product.id}`}>
                                                <div className="marketplace-product-image">
                                                    <img src={getProductImage(product)} alt={`${product.name} produce from ${product.location || 'a FarmDirect partner'}`} />
                                                    <span className="marketplace-product-tag">
                                                        <Star size={11} />
                                                        {product.quality || 'Farm fresh'}
                                                    </span>
                                                </div>
                                            </Link>

                                            <div className="marketplace-product-body">
                                                <div className="marketplace-product-header">
                                                    <div className="marketplace-product-info">
                                                        <span className="marketplace-product-category">{product.category || 'Produce'}</span>
                                                        <h3>{product.name}</h3>
                                                    </div>
                                                    <strong>
                                                        ₹{product.price}
                                                        <small>/{product.unit}</small>
                                                    </strong>
                                                </div>

                                                <div className="marketplace-product-meta">
                                                    <span><MapPin size={12} /> {product.location || 'Location pending'}</span>
                                                    <span><PackageCheck size={12} /> {product.quantity} {product.unit}</span>
                                                </div>

                                                <button type="button" onClick={() => handleAdd(product)}>
                                                    <ShoppingCart size={14} />
                                                    Add to cart
                                                </button>
                                            </div>
                                        </article>
                                    ))}

                                    {visible.length === 0 && (
                                        <div className="marketplace-empty-state">
                                            <PackageCheck size={30} />
                                            <h3>No matching produce</h3>
                                            <p>Try another crop, location, or category.</p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSearch('');
                                                    setCategory('All');
                                                }}
                                            >
                                                Clear filters
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}

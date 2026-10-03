import { ArrowRight, Check, ChevronRight, Heart, Leaf, MapPin, PackageCheck, ShoppingCart, Sparkles, Star, Store, Truck, Wheat } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { addToCart, addToWishlist, getCart, getOrders, getProducts, getWishlist, removeFromWishlist } from '../../services/api';
import { getProductImage } from '../../utils/productImages';

const categoryImages = {
    vegetable: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80',
    fruit: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=900&q=80',
    grain: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80',
    dairy: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80',
    organic: 'https://images.unsplash.com/photo-1464226184884-fa52ac9fcf8a?auto=format&fit=crop&w=900&q=80',
};

function getCategoryImage(category) {
    const key = category.toLowerCase();
    return Object.entries(categoryImages).find(([name]) => key.includes(name))?.[1] || categoryImages.vegetable;
}

export default function ConsumerDashboardPage() {
    const [products, setProducts] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [orderCount, setOrderCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [wishlistProductIds, setWishlistProductIds] = useState(() => new Set());
    const [busyProductId, setBusyProductId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const user = JSON.parse(localStorage.getItem('farmdirect_user') || '{}');
    const categories = useMemo(() => [...new Set(products.map((product) => product.category).filter(Boolean))], [products]);

    async function loadDashboard() {
        setLoading(true);
        try {
            const [productResult, cartResult, orderResult, wishlistResult] = await Promise.all([
                getProducts(),
                getCart(),
                getOrders(),
                getWishlist(),
            ]);
            setProducts(productResult.items || []);
            setCartCount((cartResult.cart?.items || []).reduce((total, item) => total + Number(item.quantity || 0), 0));
            setOrderCount(orderResult.count || orderResult.items?.length || 0);
            const wishlistItems = wishlistResult.items || [];
            setWishlistCount(wishlistItems.length);
            setWishlistProductIds(new Set(wishlistItems.map((item) => item.product_id || item.product?.id).filter(Boolean)));
            setError('');
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to load your market home');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDashboard();
        const onFocus = () => loadDashboard();
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, []);

    async function add(product) {
        setBusyProductId(product.id);
        try {
            await addToCart(product.id);
            setCartCount((current) => current + 1);
            setError('');
            setMessage(`${product.name} added to your cart.`);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to add product to cart');
        } finally {
            setBusyProductId(null);
        }
    }

    async function toggleWishlist(product) {
        const isSaved = wishlistProductIds.has(product.id);
        setBusyProductId(product.id);
        try {
            if (isSaved) {
                await removeFromWishlist(product.id);
            } else {
                await addToWishlist(product.id);
            }
            setWishlistProductIds((current) => {
                const next = new Set(current);
                if (isSaved) next.delete(product.id);
                else next.add(product.id);
                return next;
            });
            setWishlistCount((current) => current + (isSaved ? -1 : 1));
            setError('');
            setMessage(isSaved ? `${product.name} removed from your wishlist.` : `${product.name} saved to your wishlist.`);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to update your wishlist');
        } finally {
            setBusyProductId(null);
        }
    }

    const featured = products.slice(0, 6);
    const quickStats = [
        { label: 'Orders', value: loading ? '—' : orderCount, detail: 'Order history', path: '/orders', icon: PackageCheck },
        { label: 'Cart', value: loading ? '—' : cartCount, detail: 'Items waiting', path: '/cart', icon: ShoppingCart },
        { label: 'Listings', value: loading ? '—' : products.length, detail: 'Fresh picks', path: '/marketplace', icon: Store },
        { label: 'Saved', value: loading ? '—' : wishlistCount, detail: 'Your wishlist', path: '/wishlist', icon: Heart },
    ];

    const categoryCards = categories.slice(0, 5);
    const hasMoreCategories = categories.length > categoryCards.length;

    return <main className="consumer-home-redesign">
        <div className="consumer-home-v2-container">
            <section className="consumer-hero-v2" aria-label="Fresh farm produce">
                <img className="consumer-hero-v2-image" src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1800&q=90" alt="A colorful selection of fresh vegetables" />
                <div className="consumer-hero-v2-copy">
                    <span className="consumer-v2-eyebrow"><Leaf size={13} /> Fresh from local farms</span>
                    <h1>Fresh Farm Produce<br /><em>Direct to You</em></h1>
                    <p>Better quality <i /> Fair prices <i /> Healthier you</p>
                    <div className="consumer-hero-v2-actions">
                        <Link to="/marketplace">Shop Now <ArrowRight size={15} /></Link>
                        <Link to="/cart"><ShoppingCart size={14} /> My Cart</Link>
                    </div>
                </div>
                <div className="consumer-hero-v2-note"><span><Leaf size={17} /></span><div><strong>Freshness, close to home</strong><small>Every purchase supports farm communities</small></div></div>
            </section>

            <section className="consumer-welcome-v2">
                <span className="consumer-welcome-v2-mark"><Wheat size={19} /></span>
                <div className="consumer-welcome-v2-copy"><strong>Welcome back, {user.full_name || 'shopper'}!</strong><span>Fresh produce, closer to home.</span></div>
                <div className="consumer-welcome-v2-support"><span><Leaf size={17} /></span><div><strong>Your support helps</strong><small>local farmers grow</small></div><ChevronRight size={15} /></div>
                <span className="consumer-welcome-v2-motto">Good food, better tomorrow</span>
            </section>

            {(error || message) && <p className={`consumer-v2-feedback ${error ? 'is-error' : ''}`} role={error ? 'alert' : 'status'}>{error || <><Check size={14} />{message}</>}</p>}

            <section className="consumer-stats-v2" aria-label="Your shopping summary">
                {quickStats.map(({ label, value, detail, path, icon: Icon }) => (
                    <Link className="consumer-stat-v2" to={path} key={label}>
                        <span className="consumer-stat-v2-icon"><Icon size={20} /></span>
                        <span className="consumer-stat-v2-copy"><small>{label}</small><strong>{value}</strong><em>{detail}</em></span>
                        <ChevronRight className="consumer-stat-v2-arrow" size={16} />
                    </Link>
                ))}
            </section>

            <section className="consumer-section-v2">
                <div className="consumer-section-v2-heading"><div><span>Shop by category</span><h2>What are you looking for?</h2></div><Link to="/marketplace">View all <ArrowRight size={14} /></Link></div>
                <div className="consumer-categories-v2">
                    {categoryCards.map((category) => (
                        <Link className="consumer-category-v2" to={`/marketplace?category=${encodeURIComponent(category)}`} key={category}>
                            <span className="consumer-category-v2-image"><img src={getProductImage(products.find((product) => product.category === category) || { category })} alt="" /><i><Leaf size={15} /></i></span>
                            <span className="consumer-category-v2-copy"><strong>{category}</strong><small>Explore fresh picks</small><ChevronRight size={14} /></span>
                        </Link>
                    ))}
                    {hasMoreCategories && <Link className="consumer-category-v2 consumer-category-v2-more" to="/marketplace">
                        <span className="consumer-category-v2-image"><img src={categoryImages.organic} alt="" /><i><ArrowRight size={15} /></i></span>
                        <span className="consumer-category-v2-copy"><strong>More</strong><small>Explore all produce</small><ChevronRight size={14} /></span>
                    </Link>}
                    {!categoryCards.length && <p className="consumer-category-v2-empty">Categories will appear as farmers add listings.</p>}
                </div>
            </section>

            <section className="consumer-section-v2 consumer-products-section-v2">
                <div className="consumer-section-v2-heading"><div><span>Fresh from the farm</span><h2>Available right now</h2></div><Link to="/marketplace">View all <ArrowRight size={14} /></Link></div>
                {loading ? <div className="consumer-products-loading" role="status">Loading fresh listings…</div> : <div className="consumer-products-v2">
                    {featured.map((product) => {
                        const isSaved = wishlistProductIds.has(product.id);
                        return <article className="consumer-product-v2" key={product.id}>
                            <Link className="consumer-product-v2-image" to={`/products/${product.id}`}>
                                <img src={getProductImage(product)} alt={product.name} />
                                <span className="consumer-product-v2-quality"><Star size={11} /> {product.quality || 'Farm fresh'}</span>
                            </Link>
                            <button className={`consumer-product-v2-heart ${isSaved ? 'is-saved' : ''}`} type="button" aria-label={`${isSaved ? 'Remove' : 'Add'} ${product.name} ${isSaved ? 'from' : 'to'} wishlist`} aria-pressed={isSaved} disabled={busyProductId === product.id} onClick={() => toggleWishlist(product)}><Heart size={17} fill={isSaved ? 'currentColor' : 'none'} /></button>
                            <div className="consumer-product-v2-body">
                                <div className="consumer-product-v2-title"><div><span>{product.category || 'Fresh produce'}</span><h3><Link to={`/products/${product.id}`}>{product.name}</Link></h3></div><strong>₹{Number(product.price || 0).toLocaleString('en-IN')}<small>/{product.unit || 'kg'}</small></strong></div>
                                <p><MapPin size={12} /> {product.location || 'Partner farm'}</p>
                                <button className="consumer-product-v2-add" type="button" disabled={busyProductId === product.id} onClick={() => add(product)}><ShoppingCart size={14} />{busyProductId === product.id ? 'Please wait…' : 'Add to Cart'}</button>
                            </div>
                        </article>;
                    })}
                    {!featured.length && <div className="consumer-products-empty"><PackageCheck size={24} /><strong>No fresh listings yet</strong><span>New produce will appear here when farmers list it.</span></div>}
                </div>}
            </section>

            <Link className="consumer-tracking-prompt-v2" to="/orders"><span><Truck size={17} /></span><div><strong>Your orders, all in one place</strong><small>View order history and continue to delivery tracking.</small></div><ArrowRight size={15} /></Link>
        </div>
    </main>;
}

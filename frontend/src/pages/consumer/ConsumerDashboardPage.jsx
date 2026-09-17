import { ArrowRight, Leaf, MapPin, PackageCheck, ShoppingCart, Sparkles, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { addToCart, getCart, getOrders, getProducts, getWishlist } from '../../services/api';
import { getProductImage } from '../../utils/productImages';

const categoryTiles = [
    { name: 'Vegetables', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80' },
    { name: 'Fruits', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=900&q=80' },
    { name: 'Grains', image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80' },
    { name: 'Dairy', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80' },
    { name: 'Organic', image: 'https://images.unsplash.com/photo-1464226184884-fa52ac9fcf8a?auto=format&fit=crop&w=900&q=80' },
    { name: 'More', image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=900&q=80' },
];

export default function ConsumerDashboardPage() {
    const [products, setProducts] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [orderCount, setOrderCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [error, setError] = useState('');
    const user = JSON.parse(localStorage.getItem('farmdirect_user') || '{}');
    const categories = useMemo(() => [...new Set(products.map((product) => product.category).filter(Boolean))], [products]);

    async function loadDashboard() {
        try {
            const [productResult, cartResult, orderResult, wishlistResult] = await Promise.all([
                getProducts(),
                getCart(),
                getOrders(),
                getWishlist(),
            ]);
            setProducts(productResult.items || []);
            setCartCount((cartResult.cart?.items || []).reduce((total, item) => total + item.quantity, 0));
            setOrderCount(orderResult.count || 0);
            setWishlistCount((wishlistResult.items || []).length);
            setError('');
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to load your market home');
        }
    }

    useEffect(() => {
        loadDashboard();
        const onFocus = () => loadDashboard();
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, []);

    async function add(product) {
        try {
            await addToCart(product.id);
            setCartCount((current) => current + 1);
            setError('');
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to add product to cart');
        }
    }

    const featured = products.slice(0, 4);
    const quickStats = [
        { label: 'Orders', value: `${orderCount}`, detail: 'This month' },
        { label: 'Cart', value: `${cartCount}`, detail: 'Items waiting' },
        { label: 'Listings', value: `${products.length}`, detail: 'Fresh picks' },
        { label: 'Saved', value: `${wishlistCount}`, detail: 'Favorites' }
    ];

    return <main className="consumer-home-page"><div className="consumer-home-container">
        <section className="consumer-home-hero">
            <div className="consumer-home-hero-copy">
                <span className="consumer-home-kicker"><Sparkles size={14} /> FARM DIRECT MARKET</span>
                <h1>Fresh Farm Produce<br /><em>Direct to You</em></h1>
                <p>Support Farmers · Get Fresh · Eat Healthy</p>
                <div className="consumer-home-hero-actions">
                    <Link className="consumer-home-primary" to="/marketplace">Shop Now <ArrowRight size={15} /></Link>
                    <Link className="consumer-home-secondary" to="/cart">My cart</Link>
                </div>
            </div>
            <div className="consumer-home-hero-image">
                <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=85" alt="Fresh vegetables from partner farms" />
                <div className="consumer-home-hero-badge">
                    <strong>150+ fresh items</strong>
                    <span>verified from local farms</span>
                </div>
            </div>
        </section>

        <section className="consumer-home-welcome"><div><span>Welcome back, {user.full_name || 'shopper'}</span><strong>Fresh produce, closer to home.</strong></div><div><span>{products.length} listings</span><strong>{orderCount} orders · {cartCount} in cart</strong></div></section>

        {error && <p className="consumer-home-error" role="alert">{error}</p>}

        <section className="consumer-dashboard-stats">
            {quickStats.map((stat) => (
                <div className="consumer-stat-card" key={stat.label}>
                    <span>{stat.label}</span>
                    <strong>{stat.value}</strong>
                    <small>{stat.detail}</small>
                </div>
            ))}
        </section>

        <section className="consumer-home-section">
            <div className="consumer-home-section-heading"><div><span>SHOP BY CATEGORY</span><h2>What are you looking for?</h2></div><Link to="/marketplace">View all <ArrowRight size={14} /></Link></div>
            <div className="consumer-home-categories">
                {categoryTiles.map((category, index) => {
                    const matchedCategory = categories[index] || category.name;
                    return <Link
                        className="consumer-category-card"
                        to={`/marketplace${matchedCategory ? `?category=${encodeURIComponent(matchedCategory)}` : ''}`}
                        key={category.name}
                        style={{ backgroundImage: `linear-gradient(180deg, rgba(14, 34, 24, 0.18), rgba(14, 34, 24, 0.72)), url(${category.image})` }}
                    >
                        <span className={`consumer-category-icon category-${index}`}><Leaf size={17} /></span>
                        <strong>{category.name}</strong>
                    </Link>;
                })}
            </div>
        </section>

        <section className="consumer-home-section">
            <div className="consumer-home-section-heading"><div><span>FRESH FROM THE FARM</span><h2>Best selling products</h2></div><Link to="/marketplace">View all <ArrowRight size={14} /></Link></div>
            <div className="consumer-home-products">
                {featured.map((product) => (
                    <article className="consumer-home-product" key={product.id}>
                        <Link to={`/products/${product.id}`}>
                            <div className="consumer-home-product-image">
                                <img src={getProductImage(product)} alt={product.name} />
                                <span><Star size={11} /> {product.quality || 'Farm fresh'}</span>
                            </div>
                        </Link>
                        <div className="consumer-home-product-body">
                            <div className="consumer-home-product-copy">
                                <h3>{product.name}</h3>
                                <p><MapPin size={12} /> {product.location || 'Partner farm'}</p>
                            </div>
                            <strong>₹{product.price}<small>/{product.unit}</small></strong>
                        </div>
                        <button type="button" onClick={() => add(product)}><ShoppingCart size={13} /> Add to Cart</button>
                    </article>
                ))}
            </div>
            {!featured.length && <div className="consumer-home-empty"><PackageCheck size={26} /><p>Farmers have not listed produce yet.</p></div>}
        </section>
    </div></main>;
}

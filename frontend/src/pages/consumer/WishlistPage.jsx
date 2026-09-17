import { ArrowLeft, Heart, MapPin, ShoppingCart, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { addToCart, getWishlist, removeFromWishlist } from '../../services/api';
import { getProductImage } from '../../utils/productImages';

export default function WishlistPage() {
    const [items, setItems] = useState([]);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        getWishlist()
            .then((result) => setItems(result.items || []))
            .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load wishlist'));
    }, []);

    async function remove(productId) {
        try {
            await removeFromWishlist(productId);
            setItems((current) => current.filter((item) => item.product_id !== productId));
            setMessage('Removed from wishlist.');
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to update wishlist');
        }
    }

    async function add(product) {
        try {
            await addToCart(product.id);
            setMessage(`${product.name} added to cart.`);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to add product to cart');
        }
    }

    const totalValue = items.reduce((sum, item) => sum + Number(item.product?.price || 0), 0);

    return (
        <main className="wishlist-page">
            <div className="wishlist-container">
                <div className="wishlist-shell">
                    <div className="orders-topbar tracking-topbar">
                        <Link className="orders-back-link" to="/marketplace">
                            <ArrowLeft size={15} />
                            Marketplace
                        </Link>
                        <span className="orders-shell-chip">Saved items</span>
                    </div>

                    <header className="orders-hero wishlist-hero">
                        <div>
                            <p className="orders-kicker">Your shopping list</p>
                            <h1>Wishlist</h1>
                            <p>Save the produce you want to revisit before checkout.</p>
                        </div>

                        <div className="orders-hero-mark wishlist-hero-mark">
                            <Heart size={20} />
                            <span>{items.length} saved</span>
                        </div>
                    </header>

                    {message && <p className="wishlist-alert" role="status">{message}</p>}
                    {error && <p className="wishlist-alert wishlist-alert-error" role="alert">{error}</p>}

                    <div className="wishlist-summary">
                        <div>
                            <span>Saved</span>
                            <strong>{items.length}</strong>
                            <small>items</small>
                        </div>
                        <div>
                            <span>Value</span>
                            <strong>₹{totalValue}</strong>
                            <small>estimated</small>
                        </div>
                        <div>
                            <span>Freshness</span>
                            <strong>{items.length ? 'High' : '—'}</strong>
                            <small>quality</small>
                        </div>
                    </div>

                    <section className="wishlist-grid">
                        {items.map(({ product }) => (
                            <article className="wishlist-item" key={product.id}>
                                <Link className="wishlist-item-media" to={`/products/${product.id}`}>
                                    <img src={getProductImage(product)} alt={product.name} />
                                    <span className="wishlist-item-tag">Fresh pick</span>
                                </Link>

                                <div className="wishlist-item-body">
                                    <div className="wishlist-item-head">
                                        <div>
                                            <span className="wishlist-item-category">{product.category || 'Produce'}</span>
                                            <h2>{product.name}</h2>
                                        </div>
                                        <button
                                            type="button"
                                            className="wishlist-remove"
                                            aria-label={`Remove ${product.name}`}
                                            onClick={() => remove(product.id)}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    <p className="wishlist-item-location">
                                        <MapPin size={12} />
                                        {product.location || 'Farm delivery'}
                                    </p>

                                    <div className="wishlist-item-footer">
                                        <strong className="wishlist-price">
                                            ₹{product.price}
                                            <small>/{product.unit}</small>
                                        </strong>

                                        <button type="button" className="wishlist-add" onClick={() => add(product)}>
                                            <ShoppingCart size={13} />
                                            Add to cart
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}

                        {!items.length && (
                            <div className="wishlist-empty">
                                <div className="orders-empty-icon">
                                    <Heart size={26} />
                                </div>
                                <div>
                                    <h2>Your wishlist is empty</h2>
                                    <p>Save products from the marketplace to keep your best picks in one place.</p>
                                    <Link className="orders-empty-action" to="/marketplace">
                                        Browse marketplace
                                    </Link>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}


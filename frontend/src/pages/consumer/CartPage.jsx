import { ArrowLeft, Check, CheckCircle2, CreditCard, LoaderCircle, MapPin, Package, ShoppingCart, Trash2, Wheat } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { checkout, getCart, payForOrder, removeCartItem } from '../../services/api';
import { getProductImage } from '../../utils/productImages';

export default function CartPage() {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const user = JSON.parse(localStorage.getItem('farmdirect_user') || '{}');
    const dashboardPath = user.role === 'bulk_buyer' ? '/dashboard/bulk-buyer' : '/dashboard/consumer';

    useEffect(() => {
        getCart()
            .then((result) => setCart(result?.cart || { items: [] }))
            .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load cart'))
            .finally(() => setLoading(false));
    }, []);

    const total = cart?.items.reduce((sum, item) => sum + item.subtotal, 0) || 0;
    const deliveryCost = cart?.items.length ? 120 : 0;
    const taxes = Number(total) * 0.05;
    const grandTotal = Number(total) + deliveryCost + taxes;

    async function remove(id) {
        try {
            await removeCartItem(id);
            const result = await getCart();
            setCart(result.cart || { items: [] });
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to remove item');
        }
    }

    async function pay() {
        setPaying(true);
        setConfirming(true);
        try {
            const result = await checkout();
            await payForOrder(result.order.id);
            navigate('/orders');
        } catch (requestError) {
            setConfirming(false);
            setError(requestError instanceof Error ? requestError.message : 'Unable to complete payment');
        } finally {
            setPaying(false);
        }
    }

    return (
        <main className="cart-page cart-confirmation-page">
            <div className="cart-container">
                <div className="cart-shell">
                    <header className="cart-topbar">
                        <Link className="cart-back-link" to={dashboardPath}>
                            <ArrowLeft size={15} />
                            Back to workspace
                        </Link>
                        <span className="cart-shell-chip">Cart</span>
                    </header>

                    <section className="cart-hero">
                        <div>
                            <span className="cart-kicker"><Wheat size={14} /> Final review</span>
                            <h1>Confirm your order.</h1>
                            <p>Check the harvest, destination, and total before you place this purchase.</p>
                        </div>
                        <div className="cart-hero-mark">
                            <ShoppingCart size={22} />
                            <strong>{cart?.items.length || 0}</strong>
                            <span>items</span>
                        </div>
                    </section>

                    {error && <p className="cart-error" role="alert">{error}</p>}

                    {loading ? (
                        <div className="cart-loading" aria-label="Loading cart" />
                    ) : !cart?.items?.length ? (
                        <div className="cart-empty-state">
                            <Package size={34} />
                            <div>
                                <span className="cart-kicker">Nothing waiting</span>
                                <h2>Your cart is empty.</h2>
                                <p>Start with produce from the live marketplace.</p>
                                <Link className="cart-empty-action" to="/marketplace">
                                    Browse produce
                                    <ArrowLeft size={14} />
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            <section className="cart-confirmation-steps" aria-label="Cart status steps">
                                <div className="is-done">
                                    <span><Check size={13} /></span>
                                    <strong>Choose produce</strong>
                                </div>
                                <div className={!confirming ? 'is-current' : 'is-done'}>
                                    <span>{confirming ? <Check size={13} /> : '2'}</span>
                                    <strong>Review order</strong>
                                </div>
                                <div className={confirming ? 'is-current' : ''}>
                                    <span>3</span>
                                    <strong>Pay securely</strong>
                                </div>
                            </section>

                            <div className="cart-confirmation-grid">
                                <section className="cart-items-panel">
                                    <div className="cart-panel-heading">
                                        <div>
                                            <span className="cart-kicker">Your selection</span>
                                            <h2>
                                                {cart.items.length} produce {cart.items.length === 1 ? 'line' : 'lines'}
                                            </h2>
                                        </div>
                                        <Link to="/marketplace">Add more produce</Link>
                                    </div>

                                    <div className="cart-item-list">
                                        {cart.items.map((item) => (
                                            <article className="cart-item-row" key={item.id}>
                                                <img src={getProductImage(item.product)} alt={`${item.product.name} produce`} />
                                                <div className="cart-item-info">
                                                    <span>
                                                        {item.product.category || 'Farm produce'} · {item.product.location || 'Partner farm'}
                                                    </span>
                                                    <h3>{item.product.name}</h3>
                                                    <p>
                                                        <MapPin size={13} />
                                                        {item.product.location || 'Location pending'}
                                                        <i>·</i>
                                                        {item.quantity} {item.product.unit}
                                                    </p>
                                                </div>
                                                <strong>₹{Number(item.subtotal).toFixed(2)}</strong>
                                                <button
                                                    className="cart-remove-button"
                                                    type="button"
                                                    aria-label={`Remove ${item.product.name}`}
                                                    title="Remove item"
                                                    onClick={() => remove(item.id)}
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </article>
                                        ))}
                                    </div>

                                    <div className="cart-trust-note">
                                        <CheckCircle2 size={17} />
                                        <p>Prices and inventory are checked again by the server when you confirm.</p>
                                    </div>
                                </section>

                                <aside className="cart-summary-panel">
                                    <div className="cart-summary-card">
                                        <span className="cart-kicker">Order summary</span>
                                        <h3>Payment</h3>

                                        <div className="cart-summary-values">
                                            <div>
                                                <span>Subtotal</span>
                                                <strong>₹{Number(total).toFixed(2)}</strong>
                                            </div>
                                            <div>
                                                <span>Delivery</span>
                                                <strong>₹{deliveryCost.toFixed(2)}</strong>
                                            </div>
                                            <div>
                                                <span>Taxes</span>
                                                <strong>₹{taxes.toFixed(2)}</strong>
                                            </div>
                                            <div className="cart-summary-total">
                                                <span>Total amount</span>
                                                <strong>₹{grandTotal.toFixed(2)}</strong>
                                            </div>
                                        </div>

                                        <button className="cart-pay-button" type="button" onClick={pay} disabled={paying || !cart?.items.length}>
                                            {paying ? (
                                                <>
                                                    <LoaderCircle size={15} className="spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard size={15} />
                                                    Pay securely
                                                </>
                                            )}
                                        </button>

                                        <button className="cart-secondary-button" type="button" onClick={() => navigate('/marketplace')}>
                                            Continue shopping
                                        </button>
                                    </div>
                                </aside>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}

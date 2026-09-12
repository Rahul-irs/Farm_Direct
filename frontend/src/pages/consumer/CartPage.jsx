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
            .then((result) => setCart(result.cart))
            .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load cart'))
            .finally(() => setLoading(false));
    }, []);

    const total = cart?.items.reduce((sum, item) => sum + item.subtotal, 0) || 0;

    async function remove(id) {
        try {
            await removeCartItem(id);
            const result = await getCart();
            setCart(result.cart);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to remove item');
        }
    }

    async function pay() {
        setPaying(true);
        try {
            const result = await checkout();
            await payForOrder(result.order.id);
            navigate('/orders');
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to complete payment');
        } finally {
            setPaying(false);
        }
    }

        return <main className="cart-page cart-confirmation-page"><div className="cart-container">
            <Link className="cart-back-link" to={dashboardPath}><ArrowLeft size={15}/> Back to workspace</Link>
            <header className="cart-hero"><div><p className="cart-kicker"><Wheat size={14}/> Final review</p><h1>Confirm your order.</h1><p>Check the harvest, destination, and total before you place this purchase.</p></div><div className="cart-hero-mark"><ShoppingCart size={24}/><span>{cart?.items.length || 0} items</span></div></header>
            {error && <p className="cart-error" role="alert">{error}</p>}
            {loading ? <div className="cart-loading" aria-label="Loading cart"/> : cart?.items.length === 0 ? <div className="cart-empty"><Package size={34}/><div><span className="cart-kicker">Nothing waiting</span><h2>Your cart is empty.</h2><p>Start with produce from the live marketplace.</p><Link className="cart-empty-action" to="/marketplace">Browse produce <ArrowLeft size={15}/></Link></div></div> : <><section className="cart-confirmation-steps"><div className="is-done"><span><Check size={13}/></span><strong>Choose produce</strong></div><div className={!confirming ? 'is-current' : 'is-done'}><span>{confirming ? <Check size={13}/> : '2'}</span><strong>Review order</strong></div><div className={confirming ? 'is-current' : ''}><span>3</span><strong>Pay securely</strong></div></section><div className="cart-confirmation-grid"><section className="cart-items-panel"><div className="cart-panel-heading"><div><span className="cart-kicker">YOUR SELECTION</span><h2>{cart.items.length} produce {cart.items.length === 1 ? 'line' : 'lines'}</h2></div><Link to="/marketplace">Add more produce</Link></div><div className="cart-item-list">{cart.items.map((item) => <article className="cart-item-row" key={item.id}><img src={getProductImage(item.product)} alt={`${item.product.name} produce`}/><div className="cart-item-info"><span>{item.product.category || 'Farm produce'} · {item.product.location || 'Partner farm'}</span><h3>{item.product.name}</h3><p><MapPin size={13}/> {item.product.location || 'Location pending'} <i>·</i> {item.quantity} {item.product.unit}</p></div><strong>₹{Number(item.subtotal).toFixed(2)}</strong><button className="cart-remove-button" type="button" aria-label={`Remove ${item.product.name}`} title="Remove item" onClick={() => remove(item.id)}><Trash2 size={15}/></button></article>)}</div><div className="cart-trust-note"><CheckCircle2 size={17}/><p>Prices and inventory are checked again by the server when you confirm.</p></div></section><aside className={`cart-confirmation-card ${confirming ? 'is-confirming' : ''}`}><div className="cart-confirmation-card-top"><div className="cart-payment-icon"><CreditCard size={19}/></div><span>SECURE CHECKOUT</span></div><h2>{confirming ? 'Ready to place it?' : 'Your order total'}</h2><div className="cart-total-line"><span>Produce subtotal</span><strong>₹{total.toFixed(2)}</strong></div><div className="cart-total-line"><span>Delivery estimate</span><strong>Calculated next</strong></div><div className="cart-grand-total"><span>Total to pay</span><strong>₹{total.toFixed(2)}</strong></div>{confirming && <p className="cart-confirm-copy">Confirming creates your order from current inventory, then records the development payment.</p>}<button className="cart-confirm-button" type="button" onClick={() => confirming ? pay() : setConfirming(true)} disabled={paying}>{paying ? <><LoaderCircle className="animate-spin" size={16}/> Processing payment...</> : confirming ? <><CheckCircle2 size={16}/> Confirm order & pay</> : <>Review and continue <ArrowLeft size={16}/></>}</button>{confirming && <button className="cart-edit-button" type="button" onClick={() => setConfirming(false)}>Go back and edit</button>}<p className="cart-secure-note"><CheckCircle2 size={13}/> Server-calculated total · Role-protected checkout</p></aside></div></>}
    </div></main>;
}

import { ArrowRight, LoaderCircle, Package, ShoppingCart, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { checkout, getCart, payForOrder, removeCartItem } from '../../services/api';

export default function CartPage() {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);

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

    return <main className="cart-page min-h-screen p-6 text-white sm:p-8"><div className="container max-w-4xl">
      <Link className="inline-flex items-center gap-2 text-sm text-emerald-200" to="/marketplace"><ArrowRight className="rotate-180" size={15}/> Marketplace</Link>
      <div className="mt-8 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200/70">Ready when you are</p><h1 className="mt-3 text-4xl font-black">Your cart</h1></div><ShoppingCart className="text-emerald-300" size={30}/></div>
      {error && <p className="mt-4 text-rose-300" role="alert">{error}</p>}
      {loading ? <div className="card mt-6 h-40 animate-pulse"/> : cart?.items.length === 0 ? <div className="empty-state card mt-6"><Package size={34}/><h2>Your cart is empty</h2><p>Start with produce from the live marketplace.</p><Link className="btn-primary" to="/marketplace">Browse produce</Link></div> : <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.7fr]"><div className="space-y-3">{cart.items.map((item) => <article className="card flex items-center justify-between gap-4 p-5" key={item.id}><div><h2 className="font-semibold">{item.product.name}</h2><p className="mt-1 text-sm text-emerald-50/65">{item.quantity} {item.product.unit} · ₹{Number(item.subtotal).toFixed(2)}</p></div><button className="icon-action" type="button" aria-label={`Remove ${item.product.name}`} title="Remove item" onClick={() => remove(item.id)}><Trash2 size={16}/></button></article>)}</div><aside className="card cart-summary p-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200/70">Order total</p><p className="mt-3 text-3xl font-black">₹{total.toFixed(2)}</p><p className="mt-2 text-sm text-emerald-50/65">Calculated from server prices and current inventory.</p><button className="btn-primary mt-6 w-full" type="button" onClick={pay} disabled={paying}>{paying ? <><LoaderCircle className="animate-spin" size={16}/> Processing...</> : <>Checkout and pay <ArrowRight size={16}/></>}</button></aside></div>}
    </div></main>;
}

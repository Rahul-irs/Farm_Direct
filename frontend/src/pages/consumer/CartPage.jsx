import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { checkout, getCart, payForOrder, removeCartItem } from '../../services/api';
export default function CartPage() {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [error, setError] = useState('');
    useEffect(() => { getCart().then((result) => setCart(result.cart)).catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load cart')); }, []);
    const total = cart?.items.reduce((sum, item) => sum + item.subtotal, 0) || 0;
    async function remove(id) { await removeCartItem(id); const result = await getCart(); setCart(result.cart); }
    async function pay() { try {
        const result = await checkout();
        await payForOrder(result.order.id);
        navigate('/orders');
    }
    catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Unable to complete payment');
    } }
    return <main className="min-h-screen p-6 text-white"><div className="container max-w-3xl"><Link className="text-sm text-emerald-200" to="/marketplace">Marketplace</Link><h1 className="mt-6 text-4xl font-black">Your cart</h1>{error && <p className="mt-4 text-rose-300" role="alert">{error}</p>}<div className="mt-6 space-y-3">{cart?.items.map((item) => <article className="card flex flex-wrap items-center justify-between gap-4 p-5" key={item.id}><div><h2 className="font-semibold">{item.product.name}</h2><p className="text-sm text-emerald-50/65">{item.quantity} {item.product.unit} · ₹{item.subtotal.toFixed(2)}</p></div><button className="btn-secondary" type="button" onClick={() => remove(item.id)}>Remove</button></article>)}{cart?.items.length === 0 && <p className="card p-6 text-emerald-50/65">Your cart is empty.</p>}</div>{total > 0 && <div className="card mt-6 flex items-center justify-between p-6"><p className="text-xl font-bold">Total ₹{total.toFixed(2)}</p><button className="btn-primary" type="button" onClick={pay}>Checkout and pay</button></div>}</div></main>;
}

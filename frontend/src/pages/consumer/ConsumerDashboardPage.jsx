import { useEffect, useState } from 'react';
import { addToCart, checkout, getCart, getOrders, getProducts, payForOrder } from '../../services/api';
import { Link } from 'react-router-dom';
export default function ConsumerDashboardPage() {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');
    const [cartCount, setCartCount] = useState(0);
    const [orderCount, setOrderCount] = useState(0);
    const [checkoutMessage, setCheckoutMessage] = useState('');
    useEffect(() => {
        getProducts().then((result) => setProducts(result.items)).catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load products'));
        getCart().then((result) => setCartCount(result.cart.items.reduce((total, item) => total + item.quantity, 0))).catch(() => undefined);
        getOrders().then((result) => setOrderCount(result.count)).catch(() => undefined);
    }, []);
    async function completeCheckout() {
        try {
            const orderResult = await checkout();
            await payForOrder(orderResult.order.id);
            setCheckoutMessage(`Order #${orderResult.order.id} paid successfully.`);
            setCartCount(0);
            setOrderCount((count) => count + 1);
        }
        catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to complete checkout');
        }
    }
    return (<div className="min-h-screen p-8 text-white">
      <div className="container">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-200/70">Marketplace</p>
        <h1 className="mt-2 text-4xl font-black">Fresh produce, closer to home.</h1>
        <div className="mt-5 flex flex-wrap gap-3"><Link className="btn-secondary" to="/marketplace">Full marketplace</Link><Link className="btn-secondary" to="/orders">Orders</Link><Link className="btn-secondary" to="/payments">Payments</Link><Link className="btn-secondary" to="/notifications">Notifications</Link></div>
        <div className="mt-8 grid gap-5 md:grid-cols-4">
          {['Cart', 'Orders', 'Savings', 'Rewards'].map((item) => (<div key={item} className="card p-5">
              <p className="text-sm text-emerald-200/70">{item}</p>
              <p className="mt-3 text-3xl font-bold">{item === 'Cart' ? cartCount : item === 'Orders' ? orderCount : '—'}</p>
            </div>))}
        </div>
        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div><h2 className="text-2xl font-bold">Available produce</h2><p className="mt-1 text-emerald-50/65">Direct from verified farm partners.</p></div>
            <span className="text-sm text-emerald-200/70">{products.length} listings</span>
          </div>
          {error && <p className="mt-4 text-sm text-rose-300" role="alert">{error}</p>}
          {checkoutMessage && <p className="mt-4 text-sm text-emerald-200" role="status">{checkoutMessage}</p>}
          {cartCount > 0 && <button className="btn-primary mt-5" type="button" onClick={completeCheckout}>Checkout and pay</button>}
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {products.map((product) => (<article key={product.id} className="card p-5">
                <div className="flex items-start justify-between gap-4"><div><h3 className="text-xl font-semibold">{product.name}</h3><p className="mt-1 text-sm text-emerald-50/65">{product.quality} · {product.location}</p></div><p className="text-lg font-bold text-emerald-200">₹{product.price}/{product.unit}</p></div>
                <p className="mt-5 text-sm text-emerald-50/70">{product.quantity} {product.unit} available</p>
                <button className="btn-secondary mt-5 w-full" type="button" onClick={() => addToCart(product.id).then(() => setCartCount((count) => count + 1)).catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to add item'))}>Add to cart</button>
              </article>))}
            {!error && products.length === 0 && <p className="text-emerald-50/65">No produce is listed yet.</p>}
          </div>
        </section>
      </div>
    </div>);
}

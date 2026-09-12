import { useEffect, useState } from 'react';
import { addToCart, getCart, getOrders, getProducts } from '../../services/api';
import { getProductImage } from '../../utils/productImages';
export default function ConsumerDashboardPage() {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');
    const [cartCount, setCartCount] = useState(0);
    const [orderCount, setOrderCount] = useState(0);
    useEffect(() => {
        getProducts().then((result) => setProducts(result.items)).catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load products'));
        getCart().then((result) => setCartCount(result.cart.items.reduce((total, item) => total + item.quantity, 0))).catch(() => undefined);
        getOrders().then((result) => setOrderCount(result.count)).catch(() => undefined);
    }, []);
    return (<div className="consumer-page role-workspace-page min-h-screen p-8 text-white">
      <div className="container">
        <div className="role-dashboard-intro">
          <div><p className="eyebrow inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]">Your market desk</p><h1 className="mt-5">Fresh produce, closer to home.</h1><p className="mt-5">Browse verified harvests, keep an eye on your basket, and move from discovery to delivery without losing the thread.</p></div>
          <div className="role-mark" aria-hidden="true">01</div>
        </div>
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
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {products.map((product) => (<article key={product.id} className="consumer-product-card card overflow-hidden p-0">
                <div className="consumer-product-image"><img src={getProductImage(product)} alt={`${product.name} produce from ${product.location || 'a FarmDirect partner'}`}/><span>{product.quality || 'Farm partner listing'}</span></div><div className="p-5">
                <div className="flex items-start justify-between gap-4"><div><h3 className="text-xl font-semibold">{product.name}</h3><p className="mt-1 text-sm text-emerald-50/65">{product.quality} · {product.location}</p></div><p className="text-lg font-bold text-emerald-200">₹{product.price}/{product.unit}</p></div>
                <p className="mt-5 text-sm text-emerald-50/70">{product.quantity} {product.unit} available</p>
                <button className="btn-secondary mt-5 w-full" type="button" onClick={() => addToCart(product.id).then(() => setCartCount((count) => count + 1)).catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to add item'))}>Add to cart</button>
              </div></article>))}
            {!error && products.length === 0 && <p className="text-emerald-50/65">No produce is listed yet.</p>}
          </div>
        </section>
      </div>
    </div>);
}

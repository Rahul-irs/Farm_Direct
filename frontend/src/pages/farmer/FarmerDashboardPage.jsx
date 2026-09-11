import { BarChart3, Package, Sparkles, TrendingUp, Wheat } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getOrders, getPrediction, getProducts } from '../../services/api';
import { Link } from 'react-router-dom';
export default function FarmerDashboardPage() {
    const [products, setProducts] = useState([]);
    const [prediction, setPrediction] = useState(null);
    const [orderCount, setOrderCount] = useState(0);
    useEffect(() => {
        getProducts().then((result) => setProducts(result.items));
        getPrediction().then((result) => setPrediction(result.prediction));
        getOrders().then((result) => setOrderCount(result.count)).catch(() => undefined);
    }, []);
    return (<div className="farmer-page min-h-screen p-8 text-white">
      <div className="container">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-200/70">Farm operations</p>
        <h1 className="mt-2 text-4xl font-black">Your farm, in one clear view.</h1>
        <div className="mt-8 grid gap-5 md:grid-cols-4">
          {[['Listings', products.length, Wheat], ['Orders', orderCount, Package], ['AI price', prediction ? `₹${prediction.predicted_price}` : '—', Sparkles], ['Signal', prediction ? `${Math.round(prediction.confidence * 100)}%` : '—', TrendingUp]].map(([label, value, Icon]) => (<div key={label} className="dashboard-stat card"><Icon size={19}/><p>{label}</p><strong>{value}</strong></div>))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3"><Link className="btn-primary" to="/farmer/products">Manage products</Link><Link className="btn-secondary" to="/farmer/orders">Manage orders</Link></div><section className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="card p-6"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Listed produce</h2><BarChart3 className="text-emerald-300" size={20}/></div><div className="mt-4 space-y-3">{products.map((product) => <div key={product.id} className="flex items-center justify-between border-b border-emerald-300/10 pb-3 text-sm"><span>{product.name} · {product.location}</span><span className="text-emerald-200">{product.quantity} {product.unit}</span></div>)}{products.length === 0 && <p className="text-sm text-emerald-50/65">No listings found.</p>}</div></div>
          <div className="card p-6"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">AI price guidance</h2><Sparkles className="text-emerald-300" size={20}/></div>{prediction ? <><p className="mt-4 text-3xl font-black text-emerald-200">₹{prediction.predicted_price}<span className="text-base font-normal text-emerald-50/60"> / kg</span></p><p className="mt-2 text-sm text-emerald-50/70">{prediction.crop} forecast · {Math.round(prediction.confidence * 100)}% confidence</p></> : <p className="mt-4 text-sm text-emerald-50/65">Loading forecast...</p>}</div>
        </section>
      </div>
    </div>);
}

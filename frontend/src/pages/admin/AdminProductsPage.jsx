import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminProducts } from '../../services/api';
import { getProductImage } from '../../utils/productImages';
export default function AdminProductsPage() {
    const [products, setProducts] = useState([]);
    useEffect(() => { getAdminProducts().then((result) => setProducts(result.items)).catch(() => undefined); }, []);
    return <main className="min-h-screen p-6 text-white"><div className="container"><Link className="text-sm text-emerald-200" to="/dashboard/admin">Admin dashboard</Link><h1 className="mt-6 text-4xl font-black">Product catalogue</h1><div className="mt-6 grid gap-4 md:grid-cols-2">{products.map((product) => <article className="card overflow-hidden p-0" key={product.id}><img className="product-image" src={getProductImage(product)} alt={product.name}/><div className="p-5"><h2 className="text-xl font-semibold">{product.name}</h2><p className="mt-2 text-sm text-emerald-50/65">Farmer #{product.farmer_id} · {product.location}</p><p className="mt-4 text-emerald-200">{product.quantity} {product.unit} · ₹{product.price}</p></div></article>)}{products.length === 0 && <p className="text-emerald-50/65">No products available yet.</p>}</div></div></main>;
}

import { ArrowLeft, CheckCircle2, MapPin, PackageCheck, ShoppingCart, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { addToCart, getProducts } from '../../services/api';
import { getProductImage } from '../../utils/productImages';

export default function ProductDetailsPage() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    useEffect(() => { getProducts().then((result) => setProduct((result.items || []).find((item) => item.id === Number(productId)) || null)).catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load product')); }, [productId]);
    async function add() { try { await addToCart(product.id, quantity); setMessage(`${product.name} added to your cart.`); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to add product'); } }
    if (!product && !error) return <main className="consumer-detail-page"><p className="consumer-detail-loading">Loading product...</p></main>;
    if (!product) return <main className="consumer-detail-page"><div className="consumer-detail-empty"><h1>Product unavailable</h1><Link to="/marketplace">Back to marketplace</Link></div></main>;
    return <main className="consumer-detail-page"><div className="consumer-detail-container"><Link className="consumer-detail-back" to="/marketplace"><ArrowLeft size={15} /> Marketplace</Link>{error && <p className="consumer-detail-error" role="alert">{error}</p>}{message && <p className="consumer-detail-notice" role="status"><CheckCircle2 size={15} /> {message}</p>}<div className="consumer-detail-card"><div className="consumer-detail-image"><img src={getProductImage(product)} alt={product.name} /></div><section className="consumer-detail-copy"><span className="consumer-detail-kicker">{product.category || 'Fresh produce'} · {product.quality || 'Farm fresh'}</span><h1>{product.name}</h1><p className="consumer-detail-price">₹{product.price}<small> / {product.unit}</small></p><p className="consumer-detail-description">{product.description || 'Fresh produce supplied directly by a verified FarmDirect farmer.'}</p><div className="consumer-detail-meta"><span><MapPin size={15} /> {product.location || 'Partner farm'}</span><span><PackageCheck size={15} /> {product.quantity} {product.unit} available</span></div><div className="consumer-detail-actions"><label>Quantity<input type="number" min="1" max={product.quantity} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} /></label><button type="button" onClick={add}><ShoppingCart size={16} /> Add to Cart</button><button type="button" className="consumer-detail-buy" onClick={async () => { await add(); navigate('/cart'); }}>Buy Now</button></div><div className="consumer-detail-trust"><Star size={15} /> Verified farm listing · Server-checked inventory</div></section></div></div></main>;
}

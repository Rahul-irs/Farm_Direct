import { ArrowRight, CheckCircle2, Edit3, ImagePlus, PackageOpen, Plus, Save, Sparkles, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { createProduct, deleteProduct, getFarmerInventoryOverview, getMyProducts, getPrediction, updateProduct, uploadProductImage } from '../../services/api';
import { getProductImage } from '../../utils/productImages';

const emptyForm = { name: '', crop: '', category: 'Vegetable', description: '', quantity: '', unit: 'kg', price: '', quality: 'Grade A', location: '', harvest_date: '', shelf_life: '', available_quantity: '' };
const demoForm = { name: 'Tomato', crop: 'Tomato', category: 'Vegetable', description: 'Fresh field-grown tomatoes.', quantity: '500', unit: 'kg', price: '40', quality: 'Grade A', location: 'Guntur', harvest_date: '30 Sep 2023', shelf_life: '7 days', available_quantity: '480' };
const statusFilters = ['All Products', 'Available', 'Out of Stock', 'Paused'];

function formatNumber(value) {
    return Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

export default function FarmerProductsPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isInventory = location.pathname === '/farmer/inventory';
    const editId = searchParams.get('edit');
    const stored = JSON.parse(localStorage.getItem('farmdirect_user') || '{}');
    const isDemoAccount = Boolean(stored.email?.endsWith('@farmdirect.ai'));
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState(isDemoAccount ? demoForm : emptyForm);
    const [editingId, setEditingId] = useState(editId ? Number(editId) : null);
    const [filter, setFilter] = useState('All Products');
    const [prediction, setPrediction] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState({ active_listings: 0, available_stock: 0, reserved_stock: 0, sold_stock: 0, catalogue_value: 0 });

    async function loadProducts() {
        setLoading(true);
        try {
            const result = await getMyProducts(searchParams.get('search') || '');
            setProducts(result.items || []);
            if (isInventory) {
                const overview = await getFarmerInventoryOverview();
                setMetrics(overview.metrics || metrics);
            }
            if (editId) {
                const product = (result.items || []).find((item) => item.id === Number(editId));
                if (product) setForm({ ...emptyForm, ...product, available_quantity: product.quantity });
            }
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to load products');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadProducts(); }, [editId, searchParams]);

    useEffect(() => {
        if (isInventory || !form.crop.trim()) {
            setPrediction(null);
            return undefined;
        }
        const timer = window.setTimeout(() => {
            getPrediction(form.crop, form.location).then((result) => setPrediction(result.prediction || null)).catch(() => setPrediction(null));
        }, 250);
        return () => window.clearTimeout(timer);
    }, [form.crop, form.location, isInventory]);

    function updateField(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    async function submit(event) {
        event.preventDefault();
        setMessage('');
        setError('');
        const payload = { ...form, quantity: Number(form.quantity), price: Number(form.price) };
        try {
            if (editingId) await updateProduct(editingId, payload);
            else await createProduct(payload);
            setForm(emptyForm);
            setEditingId(null);
            setMessage(editingId ? 'Product updated successfully.' : 'Product listed successfully.');
            await loadProducts();
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to save product');
        }
    }

    function editProduct(product) {
        navigate(`/farmer/products?edit=${product.id}`);
    }

    async function toggleProduct(product) {
        try {
            await updateProduct(product.id, { is_active: !product.is_active });
            setMessage(product.is_active ? 'Product paused.' : 'Product relisted.');
            await loadProducts();
        } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to update product'); }
    }

    async function removeProduct(product) {
        try {
            await deleteProduct(product.id);
            setMessage('Product removed from your listings.');
            await loadProducts();
        } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to remove product'); }
    }

    async function uploadImage(productId, file) {
        if (!file) return;
        try {
            await uploadProductImage(productId, file);
            setMessage('Product image updated.');
            await loadProducts();
        } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to upload image'); }
    }

    const filteredProducts = products.filter((product) => filter === 'All Products' || (filter === 'Available' && product.is_active !== false && Number(product.available_quantity ?? product.quantity) > 0) || (filter === 'Out of Stock' && Number(product.available_quantity ?? product.quantity) <= 0) || (filter === 'Paused' && product.is_active === false));
    const previewProduct = { ...form, image_url: form.image_url };

    if (isInventory) return <main className="farmer-products-page farmer-products-inventory-page">
        <div className="farmer-products-container">
            <header className="farmer-products-page-header"><div><p className="farmer-products-kicker">MY PRODUCTS</p><h1>Inventory</h1><p>Manage your live listings and keep your available stock accurate.</p></div><Link className="farmer-products-primary" to="/farmer/add-product"><Plus size={16} /> Add Product</Link></header>
            {message && <p className="farmer-products-notice" role="status"><CheckCircle2 size={15} /> {message}</p>}{error && <p className="farmer-products-error" role="alert">{error}</p>}
            <section className="farmer-inventory-summary"><div><span>Available Stock</span><strong>{formatNumber(metrics.available_stock)} kg</strong><small>active listings</small></div><div><span>Reserved Stock</span><strong>{formatNumber(metrics.reserved_stock)} kg</strong><small>in buyer carts</small></div><div><span>Sold Stock</span><strong>{formatNumber(metrics.sold_stock)} kg</strong><small>recorded orders</small></div><div><span>Expected Revenue</span><strong>₹{formatNumber(metrics.catalogue_value)}</strong><small>current catalogue value</small></div></section>
            <section className="farmer-inventory-panel"><div className="farmer-inventory-panel-head"><div><h2>Inventory</h2><span>{products.length} products listed</span></div><div className="farmer-inventory-filters">{statusFilters.map((item) => <button type="button" className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div></div><div className="farmer-inventory-table-wrap"><table className="farmer-inventory-table"><thead><tr><th>Product</th><th>Available</th><th>Reserved</th><th>Sold</th><th>Stock</th><th>Action</th></tr></thead><tbody>{filteredProducts.map((product) => <tr key={product.id}><td><div className="farmer-inventory-product"><label className="farmer-inventory-image-upload" title="Upload product image"><img src={getProductImage(product)} alt="" /><ImagePlus size={12} /><input type="file" accept="image/*" onChange={(event) => uploadImage(product.id, event.target.files?.[0])} /></label><span><strong>{product.name}</strong><small>{product.crop || 'Produce'} · ₹{formatNumber(product.price)}/{product.unit}</small></span></div></td><td>{formatNumber(product.available_quantity ?? product.quantity)} {product.unit}</td><td>{formatNumber(product.reserved_quantity)} {product.unit}</td><td>{formatNumber(product.sold_quantity)} {product.unit}</td><td><span className={`farmer-stock-pill ${product.is_active === false ? 'paused' : Number(product.available_quantity ?? product.quantity) > 0 ? 'available' : 'empty'}`}>{product.is_active === false ? 'Paused' : Number(product.available_quantity ?? product.quantity) > 0 ? 'Available' : 'Out of stock'}</span></td><td><div className="farmer-table-actions"><button className="farmer-table-action" type="button" onClick={() => editProduct(product)}><Edit3 size={13} /> Update</button><button className="farmer-table-icon-action" type="button" onClick={() => toggleProduct(product)} aria-label={product.is_active === false ? 'Relist product' : 'Pause product'}>{product.is_active === false ? <CheckCircle2 size={13} /> : <Trash2 size={13} />}</button></div></td></tr>)}</tbody></table>{loading && <p className="farmer-products-empty">Loading inventory...</p>}{!loading && filteredProducts.length === 0 && <p className="farmer-products-empty"><PackageOpen size={25} /> No products in this view.</p>}</div></section>
        </div>
    </main>;

    return <main className="farmer-products-page">
        <div className="farmer-products-container">
            <header className="farmer-products-page-header"><div><p className="farmer-products-kicker">MY PRODUCTS</p><h1>Add Product</h1><p>List your produce with the details buyers need to make a confident order.</p></div><Link className="farmer-products-secondary" to="/farmer/inventory"><PackageOpen size={16} /> View Inventory</Link></header>
            {message && <p className="farmer-products-notice" role="status"><CheckCircle2 size={15} /> {message}</p>}{error && <p className="farmer-products-error" role="alert">{error}</p>}
            <div className="farmer-products-create-layout"><form className="farmer-product-form" onSubmit={submit}><div className="farmer-product-form-heading"><div><span>LIST PRODUCE</span><h2>{editingId ? 'Edit Product' : 'Add Product'}</h2></div>{editingId && <button type="button" className="farmer-product-close" onClick={() => { setEditingId(null); setForm(emptyForm); navigate('/farmer/products'); }} aria-label="Cancel editing"><X size={16} /></button>}</div><div className="farmer-product-form-grid"><label><span>Product Name</span><input value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="e.g. Tomato" required /></label><label><span>Category</span><select value={form.category} onChange={(event) => updateField('category', event.target.value)}><option>Vegetable</option><option>Fruit</option><option>Grain</option><option>Other</option></select></label><label><span>Variety</span><input value={form.crop} onChange={(event) => updateField('crop', event.target.value)} placeholder="e.g. Hybrid" required /></label><label><span>Quantity</span><div className="farmer-input-with-suffix"><input type="number" min="0.01" step="0.01" value={form.quantity} onChange={(event) => updateField('quantity', event.target.value)} required /><b>{form.unit}</b></div></label><label><span>Price per {form.unit}</span><div className="farmer-input-with-prefix"><b>₹</b><input type="number" min="0" step="0.01" value={form.price} onChange={(event) => updateField('price', event.target.value)} required /></div></label><label><span>Location</span><input value={form.location} onChange={(event) => updateField('location', event.target.value)} placeholder="e.g. Guntur" required /></label><label><span>Harvest Date</span><input value={form.harvest_date} onChange={(event) => updateField('harvest_date', event.target.value)} placeholder="e.g. 30 Sep 2023" /></label><label><span>Expected Shelf-Life</span><input value={form.shelf_life} onChange={(event) => updateField('shelf_life', event.target.value)} placeholder="e.g. 7 days" /></label><label><span>Available Quantity</span><div className="farmer-input-with-suffix"><input type="number" min="0" step="0.01" value={form.available_quantity} onChange={(event) => updateField('available_quantity', event.target.value)} placeholder={form.quantity || '0'} /><b>{form.unit}</b></div></label></div><label className="farmer-product-description"><span>Description</span><textarea rows="3" value={form.description} onChange={(event) => updateField('description', event.target.value)} placeholder="Describe quality, growing practice, and freshness." /></label><button className="farmer-list-product-button" type="submit"><Save size={16} /> {editingId ? 'Save Product' : 'List Product'}</button></form><aside className="farmer-price-panel"><div className="farmer-price-panel-heading"><div><span>AI PRICE PREDICTION</span><h2>Suggested Price</h2></div><Sparkles size={18} /></div><div className="farmer-price-value"><strong>{prediction ? `₹ ${prediction.predicted_price} / kg` : 'Waiting for crop'}</strong><small>{prediction ? `${Math.round(prediction.confidence * 100)}% confidence` : 'Choose a crop and location'}</small></div><p>{prediction?.explanation || 'The suggested price uses live listings and recorded marketplace sales for your selected crop.'}</p><div className="farmer-preview-heading"><span>PRODUCT PREVIEW</span><button type="button" onClick={() => navigate('/farmer/inventory')}>View all <ArrowRight size={13} /></button></div><article className="farmer-product-preview"><img src={getProductImage(previewProduct)} alt={form.name || 'Product preview'} /><div><strong>{form.name || 'Your product'}</strong><span>{form.crop || 'Crop'} · {form.location || 'Location'}</span><b>₹{form.price || '0'} <small>/{form.unit}</small></b></div></article></aside></div>
        </div>
    </main>;
}

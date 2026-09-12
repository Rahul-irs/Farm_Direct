import { ArrowLeft, ArrowUpRight, CheckCircle2, ImagePlus, PackageOpen, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createProduct, deleteProduct, getProducts, updateProduct, uploadProductImage } from '../../services/api';
import { getProductImage } from '../../utils/productImages';

const emptyForm = { name: '', crop: '', category: 'Produce', description: '', quantity: 0, unit: 'kg', price: 0, quality: 'Grade A', location: '' };

export default function FarmerProductsPage() {
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    async function loadProducts() {
        const result = await getProducts();
        const user = JSON.parse(localStorage.getItem('farmdirect_user') || '{}');
        setProducts(result.items.filter((product) => product.farmer_id === user.id));
    }
    useEffect(() => { loadProducts().catch(() => setError('Unable to load products')); }, []);
    async function submit(event) {
        event.preventDefault();
        setMessage('');
        setError('');
        try {
            if (editingId) await updateProduct(editingId, form);
            else await createProduct(form);
            setForm(emptyForm);
            setEditingId(null);
            setMessage(editingId ? 'Listing updated.' : 'New listing added to your inventory.');
            await loadProducts();
        }
        catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to save product'); }
    }
    async function removeProduct(id) {
        try {
            await deleteProduct(id);
            setProducts((current) => current.filter((product) => product.id !== id));
            setMessage('Listing removed.');
        }
        catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to delete product'); }
    }
    async function uploadImage(id, file) {
        if (!file) return;
        try {
            await uploadProductImage(id, file);
            setMessage('Product image updated.');
            await loadProducts();
        }
        catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to upload image'); }
    }
    function editProduct(product) {
        setEditingId(product.id);
        setForm({ ...emptyForm, ...product });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    function cancelEdit() {
        setEditingId(null);
        setForm(emptyForm);
    }
    return <main className="farmer-inventory-page">
        <div className="farmer-inventory-container">
            <div className="farmer-inventory-breadcrumb"><Link to="/dashboard/farmer"><ArrowLeft size={15}/> Back to overview</Link><span>INVENTORY / {products.length.toString().padStart(2, '0')} LISTINGS</span></div>
            <header className="farmer-inventory-header"><div><p className="farmer-kicker">Your market shelf</p><h1>Harvest, presented well.</h1><p>Keep every listing clear, current, and easy for buyers to trust.</p></div><div className="farmer-inventory-total"><strong>{products.length}</strong><span>active<br/>listings</span></div></header>
            {message && <p className="farmer-inventory-notice" role="status"><CheckCircle2 size={16}/>{message}</p>}
            {error && <p className="farmer-inventory-error" role="alert">{error}</p>}
            <div className="farmer-inventory-layout">
                <form className="farmer-listing-form" onSubmit={submit}>
                    <div className="farmer-form-heading"><div><span className="farmer-section-label">{editingId ? 'EDIT LISTING' : 'NEW LISTING'}</span><h2>{editingId ? 'Tune the details' : 'Add to your shelf'}</h2></div>{editingId && <button className="farmer-icon-button" type="button" onClick={cancelEdit} aria-label="Cancel editing"><X size={17}/></button>}</div>
                    <label><span>Product name</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Valley tomatoes" required/></label>
                    <div className="farmer-form-two-col"><label><span>Crop</span><input value={form.crop} onChange={(event) => setForm({ ...form, crop: event.target.value })} placeholder="Tomato" required/></label><label><span>Quality</span><select value={form.quality} onChange={(event) => setForm({ ...form, quality: event.target.value })}><option>Grade A</option><option>Grade B</option><option>Organic</option></select></label></div>
                    <label><span>Growing location</span><input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="District or village" required/></label>
                    <div className="farmer-form-three-col"><label><span>Quantity</span><input type="number" min="0.01" step="0.01" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: Number(event.target.value) })} required/></label><label><span>Unit</span><select value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })}><option>kg</option><option>quintal</option><option>tonne</option><option>crate</option></select></label><label><span>Price / unit</span><input type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} required/></label></div>
                    <label><span>Short description <small>optional</small></span><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What should a buyer know?" rows="3"/></label>
                    <button className="farmer-form-submit" type="submit">{editingId ? <Save size={17}/> : <Plus size={17}/>} {editingId ? 'Save changes' : 'Publish listing'}</button>
                </form>
                <section className="farmer-inventory-board"><div className="farmer-board-heading"><div><span className="farmer-section-label">LIVE INVENTORY</span><h2>What buyers can see</h2></div><span>{products.length} items</span></div><div className="farmer-inventory-cards">{products.map((product) => <article className="farmer-inventory-card" key={product.id}><div className="farmer-card-image"><img src={getProductImage(product)} alt={product.name}/><span>{product.quality}</span><label className="farmer-upload-button" title="Upload product image"><ImagePlus size={15}/><input type="file" accept="image/*" onChange={(event) => uploadImage(product.id, event.target.files?.[0])}/></label></div><div className="farmer-card-body"><div className="farmer-card-title"><div><h3>{product.name}</h3><p>{product.crop || 'Produce'} · {product.location}</p></div><strong>₹{product.price}<small>/{product.unit}</small></strong></div><div className="farmer-card-meta"><span><PackageOpen size={14}/>{product.quantity} {product.unit} ready</span><span className="farmer-card-live">LIVE</span></div><div className="farmer-card-actions"><button type="button" onClick={() => editProduct(product)}><Pencil size={14}/> Edit</button><button type="button" onClick={() => removeProduct(product.id)}><Trash2 size={14}/> Remove</button><ArrowUpRight size={16}/></div></div></article>)}{products.length === 0 && <div className="farmer-inventory-empty"><PackageOpen size={32}/><h3>Your shelf is empty</h3><p>Create a listing and let buyers know what is growing.</p></div>}</div></section>
            </div>
        </div>
    </main>;
}
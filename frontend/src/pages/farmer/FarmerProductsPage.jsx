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
            if (editingId)
                await updateProduct(editingId, form);
            else
                await createProduct(form);
            setForm(emptyForm);
            setEditingId(null);
            setMessage(editingId ? 'Product updated.' : 'Product created.');
            await loadProducts();
        }
        catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to save product');
        }
    }
    async function removeProduct(id) {
        try {
            await deleteProduct(id);
            setProducts((current) => current.filter((product) => product.id !== id));
        }
        catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to delete product');
        }
    }
    async function uploadImage(id, file) {
        if (!file)
            return;
        try {
            await uploadProductImage(id, file);
            setMessage('Product image uploaded.');
            await loadProducts();
        }
        catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to upload image');
        }
    }
    return <main className="min-h-screen p-6 text-white"><div className="container"><Link className="text-sm text-emerald-200" to="/dashboard/farmer">Back to dashboard</Link><div className="mt-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm uppercase tracking-[0.2em] text-emerald-200/70">Inventory</p><h1 className="mt-2 text-4xl font-black">Manage produce</h1></div><span className="text-sm text-emerald-100/65">{products.length} listings</span></div>{message && <p className="mt-4 text-emerald-200" role="status">{message}</p>}{error && <p className="mt-4 text-rose-300" role="alert">{error}</p>}<div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"><form className="card space-y-4 p-6" onSubmit={submit}><h2 className="text-xl font-bold">{editingId ? 'Edit product' : 'Add product'}</h2>{['name', 'crop', 'location'].map((field) => <label className="block" key={field}><span className="mb-2 block text-sm capitalize text-emerald-100/80">{field}</span><input className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3" value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} required/></label>)}<div className="grid grid-cols-2 gap-3"><label className="block"><span className="mb-2 block text-sm text-emerald-100/80">Quantity</span><input className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3" type="number" min="0.01" step="0.01" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: Number(event.target.value) })} required/></label><label className="block"><span className="mb-2 block text-sm text-emerald-100/80">Price</span><input className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3" type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} required/></label></div><div className="flex gap-3"><button className="btn-primary" type="submit">{editingId ? 'Save changes' : 'Create product'}</button>{editingId && <button className="btn-secondary" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>}</div></form><section className="space-y-4">{products.map((product) => <article className="card flex flex-wrap items-center justify-between gap-4 overflow-hidden p-0" key={product.id}><img className="product-image w-full sm:w-40" src={getProductImage(product)} alt={product.name}/><div className="min-w-[12rem] flex-1 p-5"><h2 className="text-xl font-semibold">{product.name}</h2><p className="mt-1 text-sm text-emerald-50/65">{product.quantity} {product.unit} · ₹{product.price} · {product.location}</p><label className="mt-3 block text-xs text-emerald-100/70">Upload image<input className="mt-1 block text-sm" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => uploadImage(product.id, event.target.files?.[0])}/></label></div><div className="flex gap-2 p-5"><button className="btn-secondary" type="button" onClick={() => { setEditingId(product.id); setForm({ ...emptyForm, ...product, category: 'Produce', description: '' }); }}>Edit</button><button className="btn-secondary" type="button" onClick={() => removeProduct(product.id)}>Delete</button></div></article>)}{products.length === 0 && <p className="card p-6 text-emerald-50/65">No products available yet.</p>}</section></div></div></main>;
}

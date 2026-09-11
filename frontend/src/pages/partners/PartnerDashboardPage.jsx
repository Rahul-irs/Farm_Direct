import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPartnerRecord, getPartnerRecords } from '../../services/api';
export default function PartnerDashboardPage({ role }) {
    const [records, setRecords] = useState([]);
    const [form, setForm] = useState({ crop: '', quantity: '', location: '', farmer_id: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const path = role === 'fpo' ? 'fpo/aggregations' : role === 'field_assistant' ? 'field-assistant/farmers' : 'bulk/requirements';
    async function load() { const result = await getPartnerRecords(path); setRecords(result.items); }
    useEffect(() => { load().catch(() => setError('Unable to load workspace records')); }, [path]);
    async function submit(event) {
        event.preventDefault();
        setError('');
        try {
            const data = role === 'field_assistant' ? { farmer_id: Number(form.farmer_id) } : role === 'fpo' ? { crop: form.crop, quantity: Number(form.quantity) } : { crop: form.crop, quantity: Number(form.quantity), location: form.location };
            await createPartnerRecord(role === 'fpo' ? 'fpo/aggregations' : role === 'field_assistant' ? 'field-assistant/farmers' : 'bulk/requirements', data);
            setForm({ crop: '', quantity: '', location: '', farmer_id: '' });
            setMessage('Saved to the database.');
            await load();
        }
        catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to save record');
        }
    }
    const title = role === 'fpo' ? 'FPO aggregation' : role === 'field_assistant' ? 'Assigned farmers' : 'Bulk requirements';
    return <main className="min-h-screen p-6 text-white"><div className="container max-w-4xl"><Link className="text-sm text-emerald-200" to="/profile">Profile</Link><p className="mt-6 text-sm uppercase tracking-[0.2em] text-emerald-200/70">Partner operations</p><h1 className="mt-2 text-4xl font-black">{title}</h1>{message && <p className="mt-4 text-emerald-200" role="status">{message}</p>}{error && <p className="mt-4 text-rose-300" role="alert">{error}</p>}<form className="card mt-8 grid gap-4 p-6 md:grid-cols-3" onSubmit={submit}>{role === 'field_assistant' ? <label className="block md:col-span-2"><span className="mb-2 block text-sm text-emerald-100/80">Farmer user ID</span><input className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3" type="number" min="1" value={form.farmer_id} onChange={(event) => setForm({ ...form, farmer_id: event.target.value })} required/></label> : <><label className="block"><span className="mb-2 block text-sm text-emerald-100/80">Crop</span><input className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3" value={form.crop} onChange={(event) => setForm({ ...form, crop: event.target.value })} required/></label><label className="block"><span className="mb-2 block text-sm text-emerald-100/80">Quantity</span><input className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3" type="number" min="0.01" step="0.01" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} required/></label>{role === 'bulk_buyer' && <label className="block"><span className="mb-2 block text-sm text-emerald-100/80">Location</span><input className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} required/></label>}</>}<button className="btn-primary md:col-span-3" type="submit">Save</button></form><section className="mt-8 space-y-3">{records.map((record, index) => <article className="card flex flex-wrap justify-between gap-4 p-5" key={String(record.id || index)}><span>{role === 'field_assistant' ? `Farmer #${record.farmer_id}` : `${record.crop} · ${record.quantity}`}</span><span className="text-emerald-200">{String(record.status || 'ACTIVE')}</span></article>)}{records.length === 0 && <p className="card p-6 text-emerald-50/65">No records yet.</p>}</section></div></main>;
}

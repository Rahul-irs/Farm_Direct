import { useState } from 'react';
import { Link } from 'react-router-dom';
import { estimateRoute } from '../../services/api';
export default function RouteEstimatePage() {
    const [pickup, setPickup] = useState('');
    const [destination, setDestination] = useState('');
    const [route, setRoute] = useState(null);
    const [error, setError] = useState('');
    async function submit(event) { event.preventDefault(); setError(''); try {
        const result = await estimateRoute(pickup, destination);
        setRoute(result.route);
    }
    catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Unable to estimate route');
    } }
    return <main className="min-h-screen p-6 text-white"><div className="container max-w-2xl"><Link className="text-sm text-emerald-200" to="/dashboard/logistics">Logistics dashboard</Link><h1 className="mt-6 text-4xl font-black">Route estimate</h1><form className="card mt-6 space-y-4 p-6" onSubmit={submit}><label className="block"><span className="mb-2 block text-sm text-emerald-100/80">Pickup location</span><input className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3" value={pickup} onChange={(event) => setPickup(event.target.value)} required/></label><label className="block"><span className="mb-2 block text-sm text-emerald-100/80">Destination</span><input className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3" value={destination} onChange={(event) => setDestination(event.target.value)} required/></label>{error && <p className="text-sm text-rose-300" role="alert">{error}</p>}<button className="btn-primary" type="submit">Estimate route</button></form>{route && <section className="card mt-6 grid gap-4 p-6 sm:grid-cols-3"><div><p className="text-sm text-emerald-200/70">Distance</p><p className="mt-2 text-2xl font-bold">{route.distance_km} km</p></div><div><p className="text-sm text-emerald-200/70">ETA</p><p className="mt-2 text-2xl font-bold">{route.eta_hours} h</p></div><div><p className="text-sm text-emerald-200/70">Estimated cost</p><p className="mt-2 text-2xl font-bold">₹{route.estimated_cost}</p></div></section>}</div></main>;
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getTracking } from '../../services/api';
export default function TrackingPage() {
    const { orderId } = useParams();
    const [delivery, setDelivery] = useState(null);
    const [error, setError] = useState('');
    useEffect(() => { if (orderId)
        getTracking(Number(orderId)).then((result) => setDelivery(result.delivery)).catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Tracking unavailable')); }, [orderId]);
    return <main className="min-h-screen p-6 text-white"><div className="container max-w-2xl"><Link className="text-sm text-emerald-200" to="/orders">Orders</Link><h1 className="mt-6 text-4xl font-black">Track order #{orderId}</h1>{error && <p className="mt-5 text-rose-300" role="alert">{error}</p>}{delivery && <div className="card mt-6 p-6"><p className="text-xl font-bold text-emerald-200">{delivery.status}</p><p className="mt-2 text-sm text-emerald-50/65">{delivery.pickup_location} → {delivery.destination}</p><div className="mt-6 space-y-4">{delivery.events.map((event) => <div className="border-l-2 border-emerald-400/40 pl-4" key={event.id}><p className="font-semibold">{event.status}</p><p className="text-sm text-emerald-50/65">{event.note}</p></div>)}</div></div>}</div></main>;
}

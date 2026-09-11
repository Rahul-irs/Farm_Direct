import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { acceptDelivery, createDriver, createVehicle, deleteDriver, deleteVehicle, getDeliveries, getDrivers, getVehicles, updateDelivery } from '../../services/api';
export default function LogisticsDashboardPage() {
    const [deliveries, setDeliveries] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [vehicle, setVehicle] = useState({ registration_number: '', vehicle_type: 'Truck', capacity_kg: 1000 });
    const [driver, setDriver] = useState({ full_name: '', phone: '', license_number: '' });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    async function refresh() {
        const [deliveryResult, vehicleResult, driverResult] = await Promise.all([getDeliveries(), getVehicles(), getDrivers()]);
        setDeliveries(deliveryResult.items);
        setVehicles(vehicleResult.items);
        setDrivers(driverResult.items);
    }
    useEffect(() => {
        refresh().catch(() => setError('Unable to load logistics data'));
    }, []);
    async function submitVehicle(event) {
        event.preventDefault();
        try {
            await createVehicle(vehicle);
            setVehicle({ registration_number: '', vehicle_type: 'Truck', capacity_kg: 1000 });
            setMessage('Vehicle registered.');
            await refresh();
        }
        catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to register vehicle');
        }
    }
    async function submitDriver(event) {
        event.preventDefault();
        try {
            await createDriver(driver);
            setDriver({ full_name: '', phone: '', license_number: '' });
            setMessage('Driver registered.');
            await refresh();
        }
        catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to register driver');
        }
    }
    async function removeVehicle(id) {
        try {
            await deleteVehicle(id);
            setMessage('Vehicle removed.');
            await refresh();
        }
        catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to remove vehicle');
        }
    }
    async function removeDriver(id) {
        try {
            await deleteDriver(id);
            setMessage('Driver removed.');
            await refresh();
        }
        catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to remove driver');
        }
    }
    async function advance(delivery) {
        try {
            if (delivery.status === 'AVAILABLE') {
                await acceptDelivery(delivery.id);
            }
            else if (delivery.status === 'ACCEPTED') {
                const availableVehicle = vehicles.find((item) => item.is_available);
                const availableDriver = drivers.find((item) => item.is_available);
                if (!availableVehicle || !availableDriver)
                    throw new Error('Register an available vehicle and driver first');
                await updateDelivery(delivery.id, 'VEHICLE_ASSIGNED', availableVehicle.id, availableDriver.id);
            }
            else {
                const nextStatus = { VEHICLE_ASSIGNED: 'PICKED_UP', PICKED_UP: 'IN_TRANSIT', IN_TRANSIT: 'OUT_FOR_DELIVERY', OUT_FOR_DELIVERY: 'DELIVERED' };
                if (nextStatus[delivery.status])
                    await updateDelivery(delivery.id, nextStatus[delivery.status]);
            }
            setMessage('Delivery updated.');
            await refresh();
        }
        catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to update delivery');
        }
    }
    return <main className="min-h-screen p-6 text-white"><div className="container"><div className="flex gap-4"><Link className="text-sm text-emerald-200" to="/profile">Profile</Link><Link className="text-sm text-emerald-200" to="/logistics/route-estimate">Route estimate</Link></div><p className="mt-6 text-sm uppercase tracking-[0.2em] text-emerald-200/70">Logistics operations</p><h1 className="mt-2 text-4xl font-black">Move every order with confidence.</h1>{message && <p className="mt-4 text-emerald-200" role="status">{message}</p>}{error && <p className="mt-4 text-rose-300" role="alert">{error}</p>}<div className="mt-8 grid gap-5 lg:grid-cols-2"><form className="card space-y-3 p-5" onSubmit={submitVehicle}><h2 className="text-xl font-bold">Register vehicle</h2><input className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3" placeholder="Registration number" value={vehicle.registration_number} onChange={(event) => setVehicle({ ...vehicle, registration_number: event.target.value })} required/><input className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3" placeholder="Vehicle type" value={vehicle.vehicle_type} onChange={(event) => setVehicle({ ...vehicle, vehicle_type: event.target.value })} required/><input className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3" type="number" min="1" value={vehicle.capacity_kg} onChange={(event) => setVehicle({ ...vehicle, capacity_kg: Number(event.target.value) })} required/><button className="btn-primary" type="submit">Add vehicle</button></form><form className="card space-y-3 p-5" onSubmit={submitDriver}><h2 className="text-xl font-bold">Register driver</h2><input className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3" placeholder="Full name" value={driver.full_name} onChange={(event) => setDriver({ ...driver, full_name: event.target.value })} required/><input className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3" placeholder="Phone" value={driver.phone} onChange={(event) => setDriver({ ...driver, phone: event.target.value })} required/><input className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3" placeholder="License number" value={driver.license_number} onChange={(event) => setDriver({ ...driver, license_number: event.target.value })} required/><button className="btn-primary" type="submit">Add driver</button></form></div><div className="mt-8 grid gap-5 lg:grid-cols-2"><section className="card p-5"><h2 className="text-xl font-bold">Fleet</h2>{vehicles.map((item) => <div className="mt-3 flex justify-between border-b border-emerald-300/10 pb-2 text-sm" key={item.id}><span>{item.registration_number} · {item.capacity_kg} kg</span><button className="text-rose-300" type="button" onClick={() => removeVehicle(item.id)}>Remove</button></div>)}</section><section className="card p-5"><h2 className="text-xl font-bold">Drivers</h2>{drivers.map((item) => <div className="mt-3 flex justify-between border-b border-emerald-300/10 pb-2 text-sm" key={item.id}><span>{item.full_name} · {item.phone}</span><button className="text-rose-300" type="button" onClick={() => removeDriver(item.id)}>Remove</button></div>)}</section></div><section className="mt-8"><h2 className="text-2xl font-bold">Delivery queue</h2>{deliveries.map((delivery) => <article className="card mt-3 flex flex-wrap items-center justify-between gap-4 p-5" key={delivery.id}><div><p className="font-semibold">Order #{delivery.order_id}</p><p className="text-sm text-emerald-50/65">{delivery.pickup_location} to {delivery.destination}</p><p className="text-sm text-emerald-200">{delivery.status}</p></div>{delivery.status !== 'DELIVERED' && <button className="btn-secondary" type="button" onClick={() => advance(delivery)}>{delivery.status === 'AVAILABLE' ? 'Accept delivery' : 'Advance status'}</button>}</article>)}{deliveries.length === 0 && <p className="card mt-3 p-6 text-emerald-50/65">No deliveries available yet.</p>}</section></div></main>;
}

import { Activity, ArrowLeft, CheckCircle2, CircleDot, Map, Package, Plus, RefreshCw, Route, Trash2, Truck, UserRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { acceptDelivery, createDriver, createVehicle, deleteDriver, deleteVehicle, getDeliveries, getDrivers, getVehicles, updateDelivery } from '../../services/api';

const nextStatus = { VEHICLE_ASSIGNED: 'PICKED_UP', PICKED_UP: 'IN_TRANSIT', IN_TRANSIT: 'OUT_FOR_DELIVERY', OUT_FOR_DELIVERY: 'DELIVERED' };
const statusLabels = { AVAILABLE: 'Available', ACCEPTED: 'Accepted', VEHICLE_ASSIGNED: 'Vehicle assigned', PICKED_UP: 'Picked up', IN_TRANSIT: 'In transit', OUT_FOR_DELIVERY: 'Out for delivery', DELIVERED: 'Delivered' };

export default function LogisticsDashboardPage() {
    const [deliveries, setDeliveries] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [vehicle, setVehicle] = useState({ registration_number: '', vehicle_type: 'Truck', capacity_kg: 1000 });
    const [driver, setDriver] = useState({ full_name: '', phone: '', license_number: '' });
    const [state, setState] = useState({ error: '', message: '', loading: true });

    async function refresh() {
        const [deliveryResult, vehicleResult, driverResult] = await Promise.all([getDeliveries(), getVehicles(), getDrivers()]);
        setDeliveries(deliveryResult.items || []);
        setVehicles(vehicleResult.items || []);
        setDrivers(driverResult.items || []);
    }

    useEffect(() => {
        refresh().catch((requestError) => setState({ loading: false, error: requestError instanceof Error ? requestError.message : 'Unable to load logistics data', message: '' })).finally(() => setState((current) => ({ ...current, loading: false })));
    }, []);

    async function submitVehicle(event) {
        event.preventDefault();
        try { await createVehicle(vehicle); setVehicle({ registration_number: '', vehicle_type: 'Truck', capacity_kg: 1000 }); setState({ loading: false, error: '', message: 'Vehicle registered.' }); await refresh(); }
        catch (requestError) { setState((current) => ({ ...current, error: requestError instanceof Error ? requestError.message : 'Unable to register vehicle' })); }
    }

    async function submitDriver(event) {
        event.preventDefault();
        try { await createDriver(driver); setDriver({ full_name: '', phone: '', license_number: '' }); setState({ loading: false, error: '', message: 'Driver registered.' }); await refresh(); }
        catch (requestError) { setState((current) => ({ ...current, error: requestError instanceof Error ? requestError.message : 'Unable to register driver' })); }
    }

    async function removeVehicle(id) {
        try { await deleteVehicle(id); setState((current) => ({ ...current, error: '', message: 'Vehicle removed.' })); await refresh(); }
        catch (requestError) { setState((current) => ({ ...current, error: requestError instanceof Error ? requestError.message : 'Unable to remove vehicle' })); }
    }

    async function removeDriver(id) {
        try { await deleteDriver(id); setState((current) => ({ ...current, error: '', message: 'Driver removed.' })); await refresh(); }
        catch (requestError) { setState((current) => ({ ...current, error: requestError instanceof Error ? requestError.message : 'Unable to remove driver' })); }
    }

    async function advance(delivery) {
        try {
            if (delivery.status === 'AVAILABLE') await acceptDelivery(delivery.id);
            else if (delivery.status === 'ACCEPTED') {
                const availableVehicle = vehicles.find((item) => item.is_available);
                const availableDriver = drivers.find((item) => item.is_available);
                if (!availableVehicle || !availableDriver) throw new Error('Register an available vehicle and driver first');
                await updateDelivery(delivery.id, 'VEHICLE_ASSIGNED', availableVehicle.id, availableDriver.id);
            } else if (nextStatus[delivery.status]) await updateDelivery(delivery.id, nextStatus[delivery.status]);
            setState((current) => ({ ...current, error: '', message: 'Delivery updated.' }));
            await refresh();
        } catch (requestError) { setState((current) => ({ ...current, error: requestError instanceof Error ? requestError.message : 'Unable to update delivery' })); }
    }

    const activeDeliveries = useMemo(() => deliveries.filter((item) => item.status !== 'DELIVERED'), [deliveries]);
    const availableVehicles = vehicles.filter((item) => item.is_available).length;
    const availableDrivers = drivers.filter((item) => item.is_available).length;
    const deliveredCount = deliveries.length - activeDeliveries.length;

    return <main className="logistics-page logistics-command"><div className="logistics-container">
        <div className="logistics-breadcrumb"><Link to="/profile"><ArrowLeft size={15}/> Profile</Link><span>DISPATCH / OPERATIONS CONTROL</span></div>
        <header className="logistics-hero"><div><p className="logistics-kicker"><Truck size={14}/> Logistics command</p><h1>Keep every route moving.</h1><p>Coordinate the fleet, assign the right crew, and move deliveries through each handoff with confidence.</p><div className="logistics-hero-actions"><Link to="/logistics/route-estimate"><Map size={15}/> Estimate a route</Link><button type="button" onClick={() => refresh()} disabled={state.loading}><RefreshCw size={15}/> Refresh board</button></div></div><div className="logistics-hero-mark"><Route size={30}/><span>LIVE<br/>DISPATCH</span></div></header>
        {state.message && <p className="logistics-notice" role="status"><CheckCircle2 size={16}/>{state.message}</p>}{state.error && <p className="logistics-error" role="alert">{state.error}</p>}
        <section className="logistics-command-stats"><div><span>Active deliveries</span><strong>{activeDeliveries.length}</strong><small>moving through the network</small></div><div><span>Available vehicles</span><strong>{availableVehicles}</strong><small>ready for assignment</small></div><div><span>Available drivers</span><strong>{availableDrivers}</strong><small>ready for assignment</small></div><div><span>Delivered</span><strong>{deliveredCount}</strong><small>completed handoffs</small></div></section>
        <div className="logistics-board"><section className="logistics-queue"><div className="logistics-section-heading"><div><p className="logistics-label"><Activity size={14}/> Live queue</p><h2>Delivery operations</h2></div><span className="logistics-queue-count">{activeDeliveries.length} active</span></div>{state.loading ? <div className="logistics-loading"/> : <div className="logistics-delivery-list">{deliveries.map((delivery) => <article className={`logistics-delivery-card status-${delivery.status.toLowerCase()}`} key={delivery.id}><div className="logistics-delivery-top"><div className="logistics-order-mark"><Package size={16}/><span>ORDER #{delivery.order_id}</span></div><span className="logistics-status"><CircleDot size={12}/>{statusLabels[delivery.status] || delivery.status}</span></div><div className="logistics-route-line"><div><small>PICKUP</small><strong>{delivery.pickup_location}</strong></div><Route size={18}/><div><small>DESTINATION</small><strong>{delivery.destination}</strong></div></div><div className="logistics-delivery-footer"><span>{delivery.vehicle ? `${delivery.vehicle.registration_number} · ${delivery.driver?.full_name || 'Driver assigned'}` : 'Crew and vehicle pending'}</span>{delivery.status !== 'DELIVERED' && <button type="button" onClick={() => advance(delivery)}>{delivery.status === 'AVAILABLE' ? 'Accept delivery' : delivery.status === 'ACCEPTED' ? 'Assign crew' : `Mark ${statusLabels[nextStatus[delivery.status]] || 'next step'}`} <ArrowRightIcon /></button>}{delivery.status === 'DELIVERED' && <CheckCircle2 size={17}/>}</div></article>)}{deliveries.length === 0 && <div className="logistics-empty"><Package size={30}/><h3>No deliveries in the queue.</h3><p>Accepted orders will appear here when a route is requested.</p></div>}</div>}</section>
            <aside className="logistics-resource-column"><form className="logistics-resource-form" onSubmit={submitVehicle}><div className="logistics-form-heading"><span className="logistics-form-icon"><Truck size={17}/></span><div><p className="logistics-label">FLEET</p><h2>Register a vehicle</h2></div></div><input placeholder="Registration number" value={vehicle.registration_number} onChange={(event) => setVehicle({ ...vehicle, registration_number: event.target.value })} required/><input placeholder="Vehicle type" value={vehicle.vehicle_type} onChange={(event) => setVehicle({ ...vehicle, vehicle_type: event.target.value })} required/><input type="number" min="1" placeholder="Capacity in kg" value={vehicle.capacity_kg} onChange={(event) => setVehicle({ ...vehicle, capacity_kg: Number(event.target.value) })} required/><button className="logistics-form-submit" type="submit"><Plus size={15}/> Add vehicle</button></form><form className="logistics-resource-form" onSubmit={submitDriver}><div className="logistics-form-heading"><span className="logistics-form-icon"><UserRound size={17}/></span><div><p className="logistics-label">ROSTER</p><h2>Register a driver</h2></div></div><input placeholder="Full name" value={driver.full_name} onChange={(event) => setDriver({ ...driver, full_name: event.target.value })} required/><input placeholder="Phone" value={driver.phone} onChange={(event) => setDriver({ ...driver, phone: event.target.value })} required/><input placeholder="License number" value={driver.license_number} onChange={(event) => setDriver({ ...driver, license_number: event.target.value })} required/><button className="logistics-form-submit" type="submit"><Plus size={15}/> Add driver</button></form></aside>
    </div>
        <section className="logistics-resources"><div className="logistics-section-heading"><div><p className="logistics-label">DISPATCH RESOURCES</p><h2>Fleet readiness</h2></div><span className="logistics-resource-note">{vehicles.length + drivers.length} registered resources</span></div><div className="logistics-resource-grid"><div><h3><Truck size={15}/> Vehicles</h3>{vehicles.map((item) => <div className="logistics-resource-row" key={item.id}><span><strong>{item.registration_number}</strong><small>{item.vehicle_type} · {item.capacity_kg} kg</small></span><em className={item.is_available ? 'is-ready' : 'is-busy'}>{item.is_available ? 'READY' : 'ASSIGNED'}</em><button type="button" aria-label={`Remove ${item.registration_number}`} onClick={() => removeVehicle(item.id)}><Trash2 size={14}/></button></div>)}{vehicles.length === 0 && <p className="logistics-muted">No vehicles registered.</p>}</div><div><h3><UserRound size={15}/> Drivers</h3>{drivers.map((item) => <div className="logistics-resource-row" key={item.id}><span><strong>{item.full_name}</strong><small>{item.phone} · {item.license_number}</small></span><em className={item.is_available ? 'is-ready' : 'is-busy'}>{item.is_available ? 'READY' : 'ASSIGNED'}</em><button type="button" aria-label={`Remove ${item.full_name}`} onClick={() => removeDriver(item.id)}><Trash2 size={14}/></button></div>)}{drivers.length === 0 && <p className="logistics-muted">No drivers registered.</p>}</div></div></section>
    </div></main>;
}

function ArrowRightIcon() { return <span aria-hidden="true">→</span>; }

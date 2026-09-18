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
    const assignedCount = deliveries.filter((item) => ['VEHICLE_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(item.status)).length;
    const totalValue = deliveries.reduce((sum, item) => sum + Number(item.order?.total_amount || 0), 0);

    return <main className="logistics-dashboard-page"><div className="logistics-dashboard-container">
        <header className="logistics-dashboard-welcome"><div><p className="logistics-dashboard-kicker"><Truck size={13}/> DISPATCH OVERVIEW</p><h1>Good morning, Rahul</h1><p>Keep the supply chain moving with clear, confident delivery operations.</p></div><div className="logistics-dashboard-date">TODAY<br/><strong>18 SEP 2026</strong></div></header>
        {state.message && <p className="logistics-notice" role="status"><CheckCircle2 size={16}/>{state.message}</p>}{state.error && <p className="logistics-error" role="alert">{state.error}</p>}
        <section className="logistics-dashboard-kpis"><DashboardKpi icon={Package} label="Active deliveries" value={activeDeliveries.length} note="in the network" tone="blue"/><DashboardKpi icon={CheckCircle2} label="Completed today" value={deliveredCount} note="successful handoffs" tone="green"/><DashboardKpi icon={WalletIcon} label="Total earnings" value={`₹${totalValue.toLocaleString('en-IN')}`} note="delivery value" tone="violet"/><DashboardKpi icon={Truck} label="On-time delivery" value="96%" note="last 30 days" tone="orange"/></section>
        <section className="logistics-dashboard-main-grid"><div className="logistics-dashboard-panel logistics-dashboard-ongoing"><div className="logistics-dashboard-panel-head"><div><span>LIVE OPERATIONS</span><h2>Ongoing deliveries</h2></div><Link to="/logistics/my-deliveries">View all <ArrowRightIcon /></Link></div><div className="logistics-dashboard-map"><div className="dashboard-map-road dashboard-map-road-one"/><div className="dashboard-map-road dashboard-map-road-two"/><div className="dashboard-map-road dashboard-map-road-three"/><span className="dashboard-map-pin dashboard-map-pin-one">A</span><span className="dashboard-map-pin dashboard-map-pin-two">B</span><span className="dashboard-map-pin dashboard-map-pin-three">C</span><span className="dashboard-map-truck"><Truck size={18}/></span><div className="dashboard-map-legend"><span><i className="is-green"/> On route</span><span><i className="is-orange"/> Pickup</span><span><i className="is-blue"/> Dropoff</span></div></div><div className="logistics-dashboard-delivery-strip">{activeDeliveries.slice(0, 2).map((delivery) => <div key={delivery.id}><span><Package size={13}/> ORDER FD{delivery.order_id}</span><strong>{delivery.pickup_location} <ArrowRightIcon /> {delivery.destination}</strong><small>{statusLabels[delivery.status] || delivery.status} · {delivery.vehicle?.registration_number || 'Crew pending'}</small></div>)}{!activeDeliveries.length && <p>No active deliveries right now.</p>}</div></div><aside className="logistics-dashboard-panel logistics-dashboard-quick"><div className="logistics-dashboard-panel-head"><div><span>SHORTCUTS</span><h2>Quick actions</h2></div></div><Link to="/logistics/deliveries"><Package size={18}/><span><strong>View available deliveries</strong><small>Browse and accept requests</small></span><ChevronRightIcon /></Link><Link to="/logistics/routes"><Map size={18}/><span><strong>Optimize routes</strong><small>Plan a faster handoff</small></span><ChevronRightIcon /></Link><Link to="/logistics/vehicles"><Truck size={18}/><span><strong>Manage vehicles</strong><small>{availableVehicles} ready for assignment</small></span><ChevronRightIcon /></Link><Link to="/logistics/drivers"><UserRound size={18}/><span><strong>Assign driver</strong><small>{availableDrivers} available today</small></span><ChevronRightIcon /></Link></aside></section>
        <section className="logistics-dashboard-lower-grid"><div className="logistics-dashboard-panel logistics-dashboard-chart"><div className="logistics-dashboard-panel-head"><div><span>PERFORMANCE</span><h2>Deliveries overview</h2></div><select aria-label="Chart period"><option>This week</option><option>This month</option></select></div><div className="dashboard-bars">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => <div key={day}><span style={{ height: `${35 + ((index * 17 + deliveries.length * 7) % 52)}%` }}/><small>{day}</small></div>)}</div></div><div className="logistics-dashboard-panel logistics-dashboard-summary"><div className="logistics-dashboard-panel-head"><div><span>FLEET STATUS</span><h2>Resource readiness</h2></div><Link to="/logistics/vehicles">Manage <ArrowRightIcon /></Link></div><div className="dashboard-resource-progress"><span><b>Vehicles</b><strong>{availableVehicles} / {vehicles.length || 0}</strong></span><i><em style={{ width: `${vehicles.length ? (availableVehicles / vehicles.length) * 100 : 0}%` }}/></i></div><div className="dashboard-resource-progress"><span><b>Drivers</b><strong>{availableDrivers} / {drivers.length || 0}</strong></span><i><em className="driver-progress" style={{ width: `${drivers.length ? (availableDrivers / drivers.length) * 100 : 0}%` }}/></i></div><div className="dashboard-resource-total"><span>Assigned in progress</span><strong>{assignedCount}</strong></div></div></section>
    </div></main>;
}

function ArrowRightIcon() { return <span aria-hidden="true">→</span>; }
function ChevronRightIcon() { return <span aria-hidden="true" className="dashboard-chevron">›</span>; }
function WalletIcon(props) { return <span className="dashboard-wallet-icon" {...props}>₹</span>; }
function DashboardKpi({ icon: Icon, label, value, note, tone }) { return <article className={`logistics-dashboard-kpi tone-${tone}`}><span className="dashboard-kpi-icon"><Icon size={17}/></span><div><small>{label}</small><strong>{value}</strong><em>{note}</em></div></article>; }

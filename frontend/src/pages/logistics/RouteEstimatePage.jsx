import { ArrowLeft, ArrowRight, Clock3, Compass, IndianRupee, LoaderCircle, Map, Navigation, Route, Ruler } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { estimateRoute } from '../../services/api';
export default function RouteEstimatePage() {
    const [pickup, setPickup] = useState('');
    const [destination, setDestination] = useState('');
    const [route, setRoute] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const mapUrl = route ? `https://www.google.com/maps?q=${encodeURIComponent(`${route.pickup} to ${route.destination}`)}&output=embed` : '';
    const fullMapUrl = route ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(route.pickup)}&destination=${encodeURIComponent(route.destination)}` : '';
    async function submit(event) { event.preventDefault(); setError(''); try {
        setLoading(true); const result = await estimateRoute(pickup, destination);
        setRoute(result.route);
    }
    catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Unable to estimate route');
    } finally { setLoading(false); } }
    return <main className="route-estimate-page"><div className="route-estimate-container"><div className="route-estimate-breadcrumb"><Link to="/dashboard/logistics"><ArrowLeft size={15}/> Logistics command</Link><span>ROUTES / PLANNING DESK</span></div><header className="route-estimate-hero"><div><p className="route-estimate-kicker"><Compass size={14}/> Route intelligence</p><h1>Plan the handoff before it moves.</h1><p>Build a quick distance, timing, and cost brief for any pickup-to-destination route.</p></div><div className="route-estimate-hero-mark"><Route size={30}/><span>LOCAL<br/>ESTIMATE</span></div></header><div className="route-estimate-grid"><form className="route-estimate-form" onSubmit={submit}><div className="route-estimate-form-heading"><div><span>01 / ROUTE INPUT</span><h2>Where is the load going?</h2><p>Use clear place names for a consistent estimate.</p></div><Navigation size={20}/></div><label><span>Pickup location</span><div className="route-estimate-input"><Map size={16}/><input value={pickup} onChange={(event) => setPickup(event.target.value)} placeholder="Farm, hub, or city" required/></div></label><label><span>Destination</span><div className="route-estimate-input"><Map size={16}/><input value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="Customer city or depot" required/></div></label>{error && <p className="route-estimate-error" role="alert">{error}</p>}<button className="route-estimate-submit" type="submit" disabled={loading}>{loading ? <><LoaderCircle className="route-spin" size={16}/> Calculating route...</> : <>Generate estimate <ArrowRight size={16}/></>}</button><p className="route-estimate-note">A deterministic local estimate is used when live map services are unavailable.</p></form>{route ? <section className="route-result-card"><div className="route-result-heading"><div><span>02 / ROUTE BRIEF</span><h2>Ready for dispatch</h2></div><CheckIcon /></div><div className="route-path"><div><small>PICKUP</small><strong>{route.pickup}</strong></div><ArrowRight size={18}/><div><small>DESTINATION</small><strong>{route.destination}</strong></div></div><div className="route-result-metrics"><div><Ruler size={17}/><span>Distance</span><strong>{route.distance_km} km</strong></div><div><Clock3 size={17}/><span>Estimated time</span><strong>{route.eta_hours} h</strong></div><div><IndianRupee size={17}/><span>Estimated cost</span><strong>₹{route.estimated_cost}</strong></div></div><div className="route-map-preview"><iframe title={`Map from ${route.pickup} to ${route.destination}`} src={mapUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade"/><a href={fullMapUrl} target="_blank" rel="noreferrer"><Map size={14}/> Open full route in Maps <ArrowRight size={14}/></a></div><p className="route-provider"><span>ESTIMATE SOURCE</span>{route.provider || 'Local route service'}</p></section> : <section className="route-result-empty"><Route size={32}/><span>ROUTE BRIEF</span><h2>Your estimate will appear here.</h2><p>Enter both locations to give dispatch a distance, time, and cost signal.</p></section>}</div></div></main>;
}

function CheckIcon() { return <span className="route-result-check">✓</span>; }

import { ArrowRight, CheckCircle2, ChevronDown, Lightbulb, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getDemandForecast, getFarmerInsights, getMyProducts, getPrediction, getPredictions } from '../../services/api';
import { getProductImage } from '../../utils/productImages';

const emptyPrediction = { crop: '', predicted_price: 0, confidence: 0, explanation: '' };
const emptyForecast = { crop: '', observed_demand: 0, order_lines: 0, demand_level: '', expected_demand: 0 };

function money(value) { return `₹ ${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`; }

export default function FarmerInsightsPage() {
    const location = useLocation();
    const isDemand = location.pathname.endsWith('ai-demand');
    const [products, setProducts] = useState([]);
    const [crop, setCrop] = useState('');
    const [locationValue, setLocationValue] = useState('');
    const [prediction, setPrediction] = useState(emptyPrediction);
    const [forecast, setForecast] = useState(emptyForecast);
    const [insights, setInsights] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        Promise.all([getMyProducts(), getFarmerInsights(), getPredictions()]).then(([productResult, insightResult, predictionResult]) => {
            const items = productResult.items || [];
            setProducts(items);
            setInsights(insightResult.items || []);
            setPredictions(predictionResult.predictions || []);
            if (items[0]) { setCrop(items[0].crop || items[0].name); setLocationValue(items[0].location || ''); }
        }).catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load AI insights'));
    }, []);

    async function runPrediction(event) {
        event.preventDefault();
        setLoading(true); setError(''); setMessage('');
        try { const result = await getPrediction(crop, locationValue); setPrediction(result.prediction || emptyPrediction); setMessage(result.prediction ? 'Price prediction updated from live listings.' : result.message || 'No prediction available for this selection.'); }
        catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to calculate price prediction'); }
        finally { setLoading(false); }
    }

    async function runForecast(event) {
        event.preventDefault();
        setLoading(true); setError(''); setMessage('');
        try { const result = await getDemandForecast(crop); setForecast(result.forecast || emptyForecast); setMessage(result.forecast ? 'Demand forecast updated from recorded orders.' : result.message || 'No forecast available for this selection.'); }
        catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to calculate demand forecast'); }
        finally { setLoading(false); }
    }

    const selectedInsight = insights.find((item) => item.crop?.toLowerCase() === crop.toLowerCase());
    const selectedProduct = products.find((item) => (item.crop || item.name)?.toLowerCase() === crop.toLowerCase()) || products[0] || { name: crop, crop };
    const selectedPrediction = predictions.find((item) => item.crop?.toLowerCase() === crop.toLowerCase()) || prediction;
    const demandPercent = forecast.demand_level === 'HIGH' ? 86 : forecast.demand_level === 'MODERATE' ? 58 : forecast.demand_level === 'LOW' ? 31 : 0;

    return <main className="farmer-ai-page"><div className="farmer-ai-container">
        <header className="farmer-ai-header"><div><span>FARMER WORKSPACE</span><h1>{isDemand ? 'AI Demand Forecast' : 'AI Price Prediction'}</h1><p>{isDemand ? 'Plan your harvest with demand signals from real marketplace orders.' : 'Price your produce with live listings and recorded marketplace activity.'}</p></div><Link to="/dashboard/farmer" className="farmer-ai-refresh-link"><ArrowRight size={14} /> Overview</Link></header>
        {message && <p className="farmer-ai-notice" role="status"><CheckCircle2 size={15} /> {message}</p>}{error && <p className="farmer-ai-error" role="alert">{error}</p>}
        {isDemand ? <div className="farmer-ai-demand-layout"><form className="farmer-ai-form" onSubmit={runForecast}><div className="farmer-ai-form-heading"><div><span>DEMAND FORECAST</span><h2>Forecast demand</h2></div><Sparkles size={19} /></div><label><span>Crop</span><select value={crop} onChange={(event) => setCrop(event.target.value)} required><option value="">Select crop</option>{products.map((item) => <option key={item.id} value={item.crop || item.name}>{item.crop || item.name}</option>)}</select></label><button type="submit" className="farmer-ai-primary" disabled={loading}>{loading ? 'Calculating...' : 'Get Forecast'} <ArrowRight size={15} /></button></form><section className="farmer-ai-result-panel"><div className="farmer-ai-result-heading"><div><span>AI DEMAND RESULT</span><h2>{forecast.crop || crop || 'Your crop'}</h2></div><span className="farmer-ai-powered">Powered by AI</span></div><div className="farmer-ai-demand-cards"><div><span>Current Demand</span><strong>{forecast.demand_level || 'Waiting'}</strong><small>{forecast.order_lines || 0} order lines</small></div><div><span>Expected Demand</span><strong>{forecast.observed_demand ? `${forecast.observed_demand.toLocaleString('en-IN')} kg` : 'Waiting'}</strong><small>from recorded orders</small></div></div><div className="farmer-ai-demand-meter"><div><span>Demand trend</span><strong>{forecast.demand_level || 'Waiting'}</strong></div><div className="farmer-ai-meter-track"><i style={{ width: `${demandPercent}%` }} /></div><div className="farmer-ai-meter-labels"><span>Low</span><span>Moderate</span><span>High</span></div></div><div className="farmer-ai-illustration demand"><img src={getProductImage(selectedProduct)} alt={selectedProduct.name || crop || 'Selected crop'} /><div><strong>Demand for {forecast.crop || crop || 'your crop'}</strong><span>More completed orders improve this forecast.</span></div></div></section></div> : <div className="farmer-ai-price-layout"><form className="farmer-ai-form" onSubmit={runPrediction}><div className="farmer-ai-form-heading"><div><span>PRICE PREDICTION</span><h2>Get a suggested price</h2></div><Sparkles size={19} /></div><label><span>Crop</span><select value={crop} onChange={(event) => setCrop(event.target.value)} required><option value="">Select crop</option>{products.map((item) => <option key={item.id} value={item.crop || item.name}>{item.crop || item.name}</option>)}</select></label><label><span>Location</span><input value={locationValue} onChange={(event) => setLocationValue(event.target.value)} placeholder="e.g. Guntur" required /></label><button type="submit" className="farmer-ai-primary" disabled={loading}>{loading ? 'Calculating...' : 'Get Prediction'} <ArrowRight size={15} /></button></form><section className="farmer-ai-result-panel"><div className="farmer-ai-result-heading"><div><span>AI ANALYSIS RESULT</span><h2>{selectedPrediction.crop || crop || 'Your crop'}</h2></div><span className="farmer-ai-powered">Powered by AI</span></div><div className="farmer-ai-price-result"><span>Suggested Price Range</span><strong>{selectedPrediction.predicted_price ? `${money(selectedPrediction.predicted_price)} / kg` : 'Waiting for input'}</strong><small>{selectedPrediction.confidence ? `${Math.round(selectedPrediction.confidence * 100)}% confidence` : 'Select a crop to calculate'}</small></div><div className="farmer-ai-price-factors"><h3>Factors considered</h3><p><Lightbulb size={14} /> Live listings and recorded sales</p><p><CheckCircle2 size={14} /> Current crop and location</p><p><TrendingUp size={14} /> Recent marketplace demand</p></div><div className="farmer-ai-line-chart"><i /><i /><i /><i /><i /><span>Price Trend (Last 6 Months)</span></div><div className="farmer-ai-produce-image"><img src={getProductImage(selectedProduct)} alt={selectedProduct.name || crop || 'Selected crop'} /><span>{selectedProduct.name || crop || 'Selected crop'} · Live listing image</span></div></section></div>}
        <section className="farmer-ai-insight-strip"><div><span>Live listings</span><strong>{products.length}</strong></div><div><span>Price signals</span><strong>{predictions.length}</strong></div><div><span>Recommendations</span><strong>{selectedInsight ? 'Ready' : 'Waiting'}</strong></div><button type="button" onClick={isDemand ? runForecast : runPrediction}><RefreshCw size={14} /> Refresh analysis</button></section>
    </div></main>;
}

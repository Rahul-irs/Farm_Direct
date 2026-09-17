import { CalendarDays, Check, CircleCheck, Droplets, Maximize2, MapPin, Pencil, Save, Sprout, Wheat, X } from 'lucide-react';
import { useState } from 'react';
import { updateProfile } from '../../services/api';

const demoFarmDefaults = {
    farm_name: 'My Farm',
    farm_type: 'Organic',
    location: 'Venkateswarapuram, Guntur',
    size: '3.5 Acres',
    description: 'Organic farm with seasonal vegetable production.',
    soil_type: 'Black Soil',
    irrigation_type: 'Drip Irrigation',
    farming_method: 'Organic',
    expected_harvest: 'Oct 2025',
    crops_grown: 'Tomato, Chilli, Rice',
};

const farmFields = [
    { key: 'location', label: 'Location', icon: MapPin },
    { key: 'size', label: 'Farm Size', icon: Maximize2 },
    { key: 'soil_type', label: 'Soil Type', icon: Sprout },
    { key: 'irrigation_type', label: 'Irrigation Type', icon: Droplets },
    { key: 'farming_method', label: 'Farming Method', icon: CircleCheck },
    { key: 'expected_harvest', label: 'Expected Harvest', icon: CalendarDays },
    { key: 'crops_grown', label: 'Expected Harvage', icon: Wheat },
    { key: 'crops_grown', label: 'Crops Grown', icon: Sprout },
];

const editorFields = [
    ['farm_name', 'Farm name', 'text'],
    ['location', 'Location', 'text'],
    ['size', 'Farm size', 'text'],
    ['soil_type', 'Soil type', 'text'],
    ['irrigation_type', 'Irrigation type', 'text'],
    ['farming_method', 'Farming method', 'text'],
    ['expected_harvest', 'Expected harvest', 'text'],
    ['crops_grown', 'Crops grown', 'text'],
];

export default function FarmerFarmPage() {
    const stored = JSON.parse(localStorage.getItem('farmdirect_user') || '{}');
    const isDemoAccount = Boolean(stored.email?.endsWith('@farmdirect.ai'));
    const [farm, setFarm] = useState({ ...(isDemoAccount ? demoFarmDefaults : {}), ...(stored.farm_profile || {}) });
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    function updateField(field, value) {
        setFarm((current) => ({ ...current, [field]: value }));
    }

    async function save(event) {
        event.preventDefault();
        setMessage('');
        setError('');
        setSaving(true);
        try {
            const result = await updateProfile({ full_name: stored.full_name, farm_profile: farm });
            const nextUser = { ...stored, ...result.user };
            localStorage.setItem('farmdirect_user', JSON.stringify(nextUser));
            setFarm(result.user.farm_profile || farm);
            setIsEditing(false);
            setMessage('Farm details saved successfully.');
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to save farm details');
        } finally {
            setSaving(false);
        }
    }

    return <main className="farmer-farm-page">
        <div className="farmer-farm-container">
            <header className="farmer-farm-header">
                <h1>My Farm</h1>
                <button className="farmer-farm-edit-top" type="button" onClick={() => setIsEditing(true)}><Pencil size={15} /> Edit Details</button>
            </header>

            {message && <p className="farmer-farm-notice" role="status"><Check size={15} /> {message}</p>}
            {error && <p className="farmer-farm-error" role="alert">{error}</p>}

            <section className="farmer-farm-banner">
                <img src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1400&q=85" alt="Green crop rows on a farm" />
                <button className="farmer-farm-banner-edit" type="button" onClick={() => setIsEditing(true)}><Pencil size={15} /> Edit</button>
            </section>

            {isEditing ? <form className="farmer-farm-editor" onSubmit={save}>
                <div className="farmer-farm-editor-heading"><div><span>FARM DETAILS</span><h2>Update your farm</h2></div><button type="button" className="farmer-farm-cancel" onClick={() => setIsEditing(false)} aria-label="Cancel editing"><X size={17} /></button></div>
                <div className="farmer-farm-editor-grid">
                    {editorFields.map(([key, label, type]) => <label key={key}><span>{label}</span><input type={type} value={farm[key] || ''} onChange={(event) => updateField(key, event.target.value)} required /></label>)}
                </div>
                <label className="farmer-farm-description"><span>About the farm</span><textarea rows="3" value={farm.description || ''} onChange={(event) => updateField('description', event.target.value)} placeholder="Describe your growing practices" /></label>
                <div className="farmer-farm-editor-actions"><button className="farmer-farm-save" type="submit" disabled={saving}><Save size={16} /> {saving ? 'Saving...' : 'Save Details'}</button></div>
            </form> : <section className="farmer-farm-cards">
                {farmFields.map(({ key, label, icon: Icon }, index) => <article className="farmer-farm-card" key={`${key}-${index}`}><span className="farmer-farm-card-icon"><Icon size={22} /></span><div><h2>{label}</h2><p>{farm[key] || 'Not provided'}</p></div></article>)}
            </section>}
        </div>
    </main>;
}

import { Bell, Check, ChevronRight, Globe2, KeyRound, LockKeyhole, MapPin, Save, Settings2, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { changePassword, updateProfile } from '../../services/api';

export default function FarmerSettingsPage() {
    const navigate = useNavigate();
    const stored = JSON.parse(localStorage.getItem('farmdirect_user') || '{}');
    const profileData = stored.profile_data || {};
    const [name, setName] = useState(stored.full_name || '');
    const [language, setLanguage] = useState(profileData.language || 'English');
    const [notifications, setNotifications] = useState(profileData.notifications_enabled !== false);
    const [locationTracking, setLocationTracking] = useState(profileData.location_tracking !== false);
    const [passwords, setPasswords] = useState({ current: '', next: '' });
    const [editingName, setEditingName] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    async function savePreferences(nextValues) {
        setMessage('');
        setError('');
        try {
            const result = await updateProfile({ full_name: name, language: nextValues.language ?? language, notifications_enabled: nextValues.notifications_enabled ?? notifications, location_tracking: nextValues.location_tracking ?? locationTracking });
            localStorage.setItem('farmdirect_user', JSON.stringify({ ...stored, ...result.user }));
            setMessage('Settings updated successfully.');
        } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to update settings'); }
    }

    async function saveName(event) {
        event.preventDefault();
        await savePreferences({});
        setEditingName(false);
    }

    async function savePassword(event) {
        event.preventDefault();
        setMessage('');
        setError('');
        try { await changePassword(passwords.current, passwords.next); setPasswords({ current: '', next: '' }); setChangingPassword(false); setMessage('Password changed successfully.'); }
        catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to change password'); }
    }

    async function toggle(field, value) {
        if (field === 'notifications') setNotifications(value);
        if (field === 'location_tracking') setLocationTracking(value);
        await savePreferences({ [field]: value });
    }

    return <main className="farmer-settings-page"><div className="farmer-settings-container">
        <header className="farmer-settings-header"><div><span>FARMER WORKSPACE</span><h1>Settings</h1><p>Manage your account and app preferences.</p></div><Settings2 size={25} /></header>
        {message && <p className="farmer-settings-notice" role="status"><Check size={15} /> {message}</p>}{error && <p className="farmer-settings-error" role="alert">{error}</p>}
        <div className="farmer-settings-layout"><section className="farmer-settings-panel"><div className="farmer-settings-section-heading"><span>ACCOUNT SETTINGS</span><h2>Account settings</h2></div><div className="farmer-settings-list">
            <div className="farmer-settings-row"><span className="farmer-settings-icon"><UserRound size={17} /></span><div><strong>Change Name</strong><small>{name || 'Your account name'}</small></div>{editingName ? <form className="farmer-settings-inline-form" onSubmit={saveName}><input value={name} onChange={(event) => setName(event.target.value)} required autoFocus /><button type="submit" aria-label="Save name"><Save size={14} /></button></form> : <button type="button" className="farmer-settings-row-action" onClick={() => setEditingName(true)}><ChevronRight size={17} /></button>}</div>
                        <button type="button" className="farmer-settings-row farmer-settings-row-button" onClick={() => navigate('/farmer/profile')}><span className="farmer-settings-icon"><UserRound size={17} /></span><div><strong>Update Profile</strong><small>Phone, email, address, and bank details</small></div><ChevronRight size={17} /></button>
            <div className="farmer-settings-row"><span className="farmer-settings-icon"><KeyRound size={17} /></span><div><strong>Change Password</strong><small>Use a secure password for your account</small></div><button type="button" className="farmer-settings-row-action" onClick={() => setChangingPassword((current) => !current)}><ChevronRight size={17} /></button></div>
            {changingPassword && <form className="farmer-settings-password-form" onSubmit={savePassword}><label>Current password<input type="password" value={passwords.current} onChange={(event) => setPasswords({ ...passwords, current: event.target.value })} required /></label><label>New password<input type="password" minLength="8" value={passwords.next} onChange={(event) => setPasswords({ ...passwords, next: event.target.value })} required /></label><button type="submit"><Save size={14} /> Save password</button></form>}
            <div className="farmer-settings-row"><span className="farmer-settings-icon"><Globe2 size={17} /></span><div><strong>Language</strong><small>Choose your preferred language</small></div><select className="farmer-settings-language" value={language} onChange={(event) => { setLanguage(event.target.value); savePreferences({ language: event.target.value }); }}><option>English</option><option>Telugu</option><option>Hindi</option><option>Kannada</option></select></div>
        </div><div className="farmer-settings-section-heading app"><span>APP SETTINGS</span><h2>App settings</h2></div><div className="farmer-settings-list"><div className="farmer-settings-row"><span className="farmer-settings-icon"><Bell size={17} /></span><div><strong>Push Notifications</strong><small>Receive order and delivery updates</small></div><button type="button" className={`farmer-settings-toggle ${notifications ? 'is-on' : ''}`} onClick={() => toggle('notifications_enabled', !notifications)} aria-label="Toggle push notifications"><i /></button></div><div className="farmer-settings-row"><span className="farmer-settings-icon"><MapPin size={17} /></span><div><strong>Location Tracking</strong><small>Help calculate delivery routes accurately</small></div><button type="button" className={`farmer-settings-toggle ${locationTracking ? 'is-on' : ''}`} onClick={() => toggle('location_tracking', !locationTracking)} aria-label="Toggle location tracking"><i /></button></div></div></section><aside className="farmer-settings-visual"><img src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=85" alt="Farm field" /><div><span>FarmDirect</span><strong>Technology that empowers farmers.</strong><small>From our farms to you.</small></div></aside></div><Link className="farmer-settings-back" to="/dashboard/farmer">Back to Overview</Link>
    </div></main>;
}

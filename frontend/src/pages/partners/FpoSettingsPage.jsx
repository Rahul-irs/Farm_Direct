import { CheckCircle2, RefreshCw, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { changePassword, updateProfile } from '../../services/api';

export default function FpoSettingsPage() {
    const storedUser = JSON.parse(localStorage.getItem('farmdirect_user') || '{}');
    const profileData = storedUser.profile_data || {};
    const [editing, setEditing] = useState(false);
    const [profile, setProfile] = useState({
        full_name: storedUser.full_name || '',
        email: storedUser.email || '',
        phone: storedUser.phone || '',
        address: profileData.address || '',
        language: profileData.language || '',
    });
    const [password, setPassword] = useState({ current: '', next: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    function updateField(field, value) {
        setProfile((current) => ({ ...current, [field]: value }));
    }

    async function saveProfile(event) {
        event.preventDefault();
        setError('');
        try {
            const result = await updateProfile(profile);
            localStorage.setItem('farmdirect_user', JSON.stringify({ ...storedUser, ...result.user }));
            setEditing(false);
            setMessage('Organisation details saved successfully.');
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to save organisation details');
        }
    }

    async function savePassword(event) {
        event.preventDefault();
        setError('');
        try {
            await changePassword(password.current, password.next);
            setPassword({ current: '', next: '' });
            setMessage('Password updated successfully.');
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to update password');
        }
    }

    return <section className="fpo-members-page fpo-settings-page">
        <div className="fpo-section-heading">
            <div><span className="fpo-card-label">FPO administration</span><h1>Settings</h1><p>Manage your organisation details, account security, and preferences.</p></div>
            <div className="fpo-settings-heading-actions"><span className="fpo-settings-verified">✓ Verified FPO</span><button type="button" className="fpo-primary-action" onClick={() => setEditing((current) => !current)}>{editing ? 'Cancel' : 'Edit Profile'}</button></div>
        </div>
        {message && <p className="fpo-notice" role="status"><CheckCircle2 size={15} />{message}</p>}
        {error && <p className="fpo-error" role="alert">{error}</p>}
        <div className="fpo-settings-layout">
            <form className={`fpo-settings-form ${editing ? 'is-editing' : ''}`} onSubmit={saveProfile}>
                <div className="fpo-settings-form-head"><span className="fpo-settings-icon">🏢</span><div><h2>Organisation Details</h2><p>Keep your FPO information current.</p></div></div>
                <label>Organisation name<input required disabled={!editing} value={profile.full_name} onChange={(event) => updateField('full_name', event.target.value)} /></label>
                <label>Email address<input required disabled={!editing} type="email" value={profile.email} onChange={(event) => updateField('email', event.target.value)} /></label>
                <label>Phone number<input disabled={!editing} value={profile.phone} onChange={(event) => updateField('phone', event.target.value)} /></label>
                <label>Registered address<input disabled={!editing} value={profile.address} onChange={(event) => updateField('address', event.target.value)} /></label>
                <label>Preferred language<select disabled={!editing} value={profile.language} onChange={(event) => updateField('language', event.target.value)}><option value="">Select language</option><option>English</option><option>Telugu</option><option>Hindi</option></select></label>
                {editing && <button type="submit" className="fpo-primary-action"><CheckCircle2 size={14} /> Save Organisation</button>}
            </form>
            <form className="fpo-settings-form" onSubmit={savePassword}>
                <div className="fpo-settings-form-head"><span className="fpo-settings-icon">🔐</span><div><h2>Security</h2><p>Protect your FPO account.</p></div></div>
                <label>Current password<input required type="password" value={password.current} onChange={(event) => setPassword((current) => ({ ...current, current: event.target.value }))} /></label>
                <label>New password<input required minLength="8" type="password" value={password.next} onChange={(event) => setPassword((current) => ({ ...current, next: event.target.value }))} /></label>
                <button type="submit" className="fpo-primary-action"><ShieldCheck size={14} /> Update Password</button>
            </form>
        </div>
    </section>;
}

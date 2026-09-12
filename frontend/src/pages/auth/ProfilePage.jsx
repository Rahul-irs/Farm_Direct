import { ArrowLeft, AtSign, Check, CheckCircle2, KeyRound, LockKeyhole, Phone, Save, ShieldCheck, Sprout, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { changePassword, updateProfile } from '../../services/api';

export default function ProfilePage() {
    const navigate = useNavigate();
    const stored = JSON.parse(localStorage.getItem('farmdirect_user') || '{}');
    const [profile, setProfile] = useState({ full_name: stored.full_name || '', phone: stored.phone || '' });
    const [passwords, setPasswords] = useState({ current: '', next: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const roleName = stored.role === 'farmer' ? 'Farmer account' : `${(stored.role || 'consumer').replace('_', ' ')} account`;
    const dashboardPath = stored.role === 'farmer' ? '/dashboard/farmer' : stored.role === 'bulk_buyer' ? '/dashboard/bulk-buyer' : stored.role === 'admin' ? '/dashboard/admin' : stored.role === 'logistics_provider' ? '/dashboard/logistics' : stored.role === 'fpo' ? '/dashboard/fpo' : stored.role === 'field_assistant' ? '/dashboard/field-assistant' : '/dashboard/consumer';
    const initials = (profile.full_name || 'Farmer').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
    async function saveProfile(event) {
        event.preventDefault();
        setMessage('');
        setError('');
        try {
            const result = await updateProfile(profile);
            localStorage.setItem('farmdirect_user', JSON.stringify({ ...stored, ...result.user }));
            setMessage('Your account details are up to date.');
        }
        catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to save profile'); }
    }
    async function savePassword(event) {
        event.preventDefault();
        setMessage('');
        setError('');
        try {
            await changePassword(passwords.current, passwords.next);
            setPasswords({ current: '', next: '' });
            setMessage('Your password has been changed.');
        }
        catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Unable to change password'); }
    }
    if (!localStorage.getItem('farmdirect_token')) {
        navigate('/login');
        return null;
    }
    return <main className="farmer-profile-page"><div className="farmer-profile-container">
        <div className="farmer-profile-breadcrumb"><Link to={dashboardPath}><ArrowLeft size={15}/> Back to workspace</Link><span>ACCOUNT / {stored.role === 'farmer' ? 'FARM DESK' : 'PROFILE'}</span></div>
        <section className="farmer-profile-identity"><div className="farmer-profile-avatar">{initials}</div><div className="farmer-profile-intro"><span className="farmer-kicker">Your account desk</span><h1>{profile.full_name || 'Your profile'}</h1><p>{roleName} · Keep your contact details current for buyers, deliveries, and account security.</p><div className="farmer-profile-tags"><span><CheckCircle2 size={13}/> Verified identity</span><span><ShieldCheck size={13}/> Role-based access</span></div></div><div className="farmer-profile-status"><CheckCircle2 size={16}/><span>Account active</span></div></section>
        {message && <p className="farmer-profile-notice" role="status"><Check size={16}/>{message}</p>}{error && <p className="farmer-profile-error" role="alert">{error}</p>}
        <div className="farmer-profile-grid"><form className="farmer-profile-card farmer-profile-details" onSubmit={saveProfile}><div className="farmer-profile-card-heading"><div className="farmer-profile-card-icon"><UserRound size={18}/></div><div><span className="farmer-section-label">IDENTITY</span><h2>Personal details</h2></div></div><label><span>Full name</span><div className="farmer-profile-input"><UserRound size={16}/><input value={profile.full_name} onChange={(event) => setProfile({ ...profile, full_name: event.target.value })} required/></div></label><label><span>Email address</span><div className="farmer-profile-input is-muted"><AtSign size={16}/><input value={stored.email || ''} readOnly aria-readonly="true"/></div><small className="farmer-profile-help">Email is tied to your login and cannot be changed here.</small></label><label><span>Phone number</span><div className="farmer-profile-input"><Phone size={16}/><input value={profile.phone} placeholder="Add a phone number" onChange={(event) => setProfile({ ...profile, phone: event.target.value })}/></div></label><button className="farmer-profile-save" type="submit"><Save size={16}/> Save details</button></form>
          <aside className="farmer-profile-card farmer-profile-account"><div className="farmer-profile-card-heading"><div className="farmer-profile-card-icon"><Sprout size={18}/></div><div><span className="farmer-section-label">FARM DIRECT</span><h2>Workspace access</h2></div></div><div className="farmer-profile-account-row"><span>Role</span><strong>{roleName}</strong></div><div className="farmer-profile-account-row"><span>Verification</span><strong><CheckCircle2 size={15}/> Verified</strong></div><div className="farmer-profile-account-row"><span>Account status</span><strong>Active</strong></div><div className="farmer-profile-account-note"><ShieldCheck size={17}/><p>Your role keeps the right tools close: listings, procurement, orders, routes, or platform oversight.</p></div><Link className="farmer-profile-workspace-link" to={dashboardPath}>Return to workspace <ArrowLeft size={15}/></Link></aside>
        </div>
        <form className="farmer-profile-security" onSubmit={savePassword}><div className="farmer-profile-security-heading"><div className="farmer-profile-card-icon"><LockKeyhole size={18}/></div><div><span className="farmer-section-label">ACCOUNT SECURITY</span><h2>Change your password</h2><p>Use a strong password you do not use anywhere else.</p></div></div><div className="farmer-profile-password-fields"><label><span>Current password</span><div className="farmer-profile-input"><KeyRound size={16}/><input type="password" placeholder="Enter current password" value={passwords.current} onChange={(event) => setPasswords({ ...passwords, current: event.target.value })} required/></div></label><label><span>New password</span><div className="farmer-profile-input"><KeyRound size={16}/><input type="password" placeholder="At least 8 characters" minLength={8} value={passwords.next} onChange={(event) => setPasswords({ ...passwords, next: event.target.value })} required/></div></label><button className="farmer-profile-security-button" type="submit"><LockKeyhole size={16}/> Update password</button></div></form>
    </div></main>;
}
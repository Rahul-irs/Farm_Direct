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
    async function saveProfile(event) {
        event.preventDefault();
        setMessage('');
        setError('');
        try {
            const result = await updateProfile(profile);
            localStorage.setItem('farmdirect_user', JSON.stringify({ ...stored, ...result.user }));
            setMessage('Profile saved.');
        }
        catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to save profile');
        }
    }
    async function savePassword(event) {
        event.preventDefault();
        setMessage('');
        setError('');
        try {
            await changePassword(passwords.current, passwords.next);
            setPasswords({ current: '', next: '' });
            setMessage('Password changed.');
        }
        catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to change password');
        }
    }
    if (!localStorage.getItem('farmdirect_token')) {
        navigate('/login');
        return null;
    }
    return <main className="min-h-screen p-6 text-white"><div className="container max-w-2xl"><Link className="text-sm text-emerald-200" to={`/dashboard/${stored.role === 'admin' ? 'admin' : stored.role === 'farmer' ? 'farmer' : 'consumer'}`}>Back to dashboard</Link><h1 className="mt-6 text-4xl font-black">Your profile</h1><p className="mt-2 text-emerald-50/70">{stored.email} · {stored.role}</p>{message && <p className="mt-5 text-emerald-200" role="status">{message}</p>}{error && <p className="mt-5 text-rose-300" role="alert">{error}</p>}<form className="card mt-6 space-y-4 p-6" onSubmit={saveProfile}><h2 className="text-xl font-bold">Personal details</h2><label className="block"><span className="mb-2 block text-sm text-emerald-100/80">Full name</span><input className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3" value={profile.full_name} onChange={(event) => setProfile({ ...profile, full_name: event.target.value })} required/></label><label className="block"><span className="mb-2 block text-sm text-emerald-100/80">Phone</span><input className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })}/></label><button className="btn-primary" type="submit">Save profile</button></form><form className="card mt-6 space-y-4 p-6" onSubmit={savePassword}><h2 className="text-xl font-bold">Change password</h2><input className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3" type="password" placeholder="Current password" value={passwords.current} onChange={(event) => setPasswords({ ...passwords, current: event.target.value })} required/><input className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3" type="password" placeholder="New password" minLength={8} value={passwords.next} onChange={(event) => setPasswords({ ...passwords, next: event.target.value })} required/><button className="btn-secondary" type="submit">Change password</button></form></div></main>;
}

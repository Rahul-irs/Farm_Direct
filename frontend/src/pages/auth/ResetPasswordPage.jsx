import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resetPassword } from '../../services/api';
export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const identifier = sessionStorage.getItem('reset_identifier') || '';
    const code = sessionStorage.getItem('reset_code') || '';
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    async function submit(event) { event.preventDefault(); if (password !== confirm) {
        setError('Passwords do not match');
        return;
    } try {
        await resetPassword(identifier, code, password);
        sessionStorage.removeItem('reset_identifier');
        sessionStorage.removeItem('reset_code');
        navigate('/login');
    }
    catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Unable to reset password');
    } }
    return (<div className="min-h-screen flex items-center justify-center p-6 text-white">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-3xl font-bold">Set new password</h1>
        <p className="mt-2 text-emerald-50/70">Choose a secure password for your account.</p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <label className="block">
            <span className="mb-2 block text-sm text-emerald-100/80">New password</span>
            <input className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3" type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required/>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-emerald-100/80">Confirm password</span>
            <input className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3" type="password" minLength={8} value={confirm} onChange={(event) => setConfirm(event.target.value)} required/>
          </label>
          {error && <p className="text-sm text-rose-300">{error}</p>}<button className="btn-primary w-full" type="submit">Update password</button>
        </form>
      </div>
    </div>);
}

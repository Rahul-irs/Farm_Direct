import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resendVerification, verifyEmail } from '../../services/api';

export default function VerifyEmailPage() {
    const navigate = useNavigate();
    const email = sessionStorage.getItem('verification_email') || '';
    const demoCode = sessionStorage.getItem('verification_debug_code') || '';
    const [code, setCode] = useState(demoCode);
    const [message, setMessage] = useState(demoCode ? `Demo mode: your verification code is ${demoCode}` : '');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function submit(event) {
        event.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        try {
            await verifyEmail(email, code);
            sessionStorage.removeItem('verification_email');
            setMessage('Email verified. You can sign in now.');
            setTimeout(() => navigate('/login'), 700);
        }
        catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to verify email');
        }
        finally {
            setLoading(false);
        }
    }

    async function resend() {
        setError('');
        setMessage('');
        try {
            const result = await resendVerification(email);
            setMessage(result.message);
        }
        catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to resend code');
        }
    }

    return (<div className="min-h-screen flex items-center justify-center p-6 text-white">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-3xl font-bold">Verify your email</h1>
        <p className="mt-3 text-emerald-50/70">Enter the six-digit code sent to {email || 'your inbox'}.</p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <input className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3 text-center text-2xl tracking-[0.5em]" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} placeholder="000000" required />
          {error && <p className="text-sm text-rose-300" role="alert">{error}</p>}
          {message && <p className="text-sm text-emerald-300" role="status">{message}</p>}
          <button className="btn-primary w-full" type="submit" disabled={loading}>{loading ? 'Verifying...' : 'Verify email'}</button>
        </form>
        <button className="mt-4 w-full text-sm text-emerald-200 underline" type="button" onClick={resend}>Resend code</button>
        <p className="mt-5 text-center text-sm text-emerald-100/75"><Link to="/login">Back to sign in</Link></p>
      </div>
    </div>);
}

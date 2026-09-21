import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestPasswordReset } from '../../services/api';
export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [identifier, setIdentifier] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    async function submit(event) {
        event.preventDefault();
      const normalizedIdentifier = identifier.trim();
      if (!normalizedIdentifier) return;
      setError('');
      setLoading(true);
        try {
        await requestPasswordReset(normalizedIdentifier);
        sessionStorage.setItem('reset_identifier', normalizedIdentifier);
            navigate('/verify-reset-code');
        }
        catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to request reset');
        }
      finally {
        setLoading(false);
      }
    }
    return (<div className="min-h-screen flex items-center justify-center p-6 text-white">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-3xl font-bold">Reset password</h1>
        <p className="mt-2 text-emerald-50/70">Enter your email to receive a secure reset code.</p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <label className="block">
            <span className="mb-2 block text-sm text-emerald-100/80">Email or phone</span>
            <input className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3" type="text" value={identifier} onChange={(event) => setIdentifier(event.target.value)} required/>
          </label>
          {error && <p className="text-sm text-rose-300" role="alert">{error}</p>}<button className="btn-primary w-full" type="submit" disabled={loading}>{loading ? 'Sending reset code...' : 'Send reset code'}</button>
        </form>
      </div>
    </div>);
}

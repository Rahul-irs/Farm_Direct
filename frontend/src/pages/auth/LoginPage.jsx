import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../services/api';
function dashboardForRole(role) {
    if (role === 'admin')
        return '/dashboard/admin';
    if (role === 'farmer')
        return '/dashboard/farmer';
    if (role === 'logistics_provider')
        return '/dashboard/logistics';
    if (role === 'fpo')
        return '/dashboard/fpo';
    if (role === 'field_assistant')
        return '/dashboard/field-assistant';
    if (role === 'bulk_buyer')
        return '/dashboard/bulk-buyer';
    return '/dashboard/consumer';
}
export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('farmer@farmdirect.ai');
    const [password, setPassword] = useState('demo12345');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await login(email, password);
            localStorage.setItem('farmdirect_token', result.token);
            localStorage.setItem('farmdirect_user', JSON.stringify(result.user));
            navigate(dashboardForRole(result.user.role));
        }
        catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to log in');
        }
        finally {
            setLoading(false);
        }
    }
    return (<div className="min-h-screen flex items-center justify-center p-6 text-white">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="mt-2 text-emerald-50/70">Sign in to continue to FarmDirect AI.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm text-emerald-100/80">Email</span>
            <input className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3 outline-none focus:border-emerald-400" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required/>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-emerald-100/80">Password</span>
            <input className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3 outline-none focus:border-emerald-400" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required/>
          </label>
          {error && <p className="text-sm text-rose-300" role="alert">{error}</p>}
          <button className="btn-primary w-full" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
        </form>
        <div className="mt-5 flex items-center justify-between text-sm text-emerald-100/75">
          <Link to="/forgot-password">Forgot password?</Link>
          <Link to="/register">Create account</Link>
        </div>
      </div>
    </div>);
}

import { ArrowRight, Check, Eye, EyeOff, Leaf, LockKeyhole, Sprout } from 'lucide-react';
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
    const [showPassword, setShowPassword] = useState(false);
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
    return (<div className="login-page min-h-screen px-5 py-6 text-white sm:px-8">
      <header className="login-header mx-auto flex w-full max-w-6xl items-center justify-between"><Link className="login-brand" to="/"><span className="login-brand-mark"><Sprout size={18}/></span><span>FarmDirect <em>AI</em></span></Link><Link className="login-back-link" to="/">Back to home <ArrowRight size={15}/></Link></header>
      <main className="login-main mx-auto grid w-full max-w-6xl items-center gap-10 py-10 lg:grid-cols-[1fr_0.8fr] lg:py-16">
        <section className="login-intro"><p className="login-kicker"><Leaf size={15}/> The operating system for fresh supply</p><h1>Welcome back to a clearer food chain.</h1><p className="login-intro-copy">Pick up where your network left off. Your listings, orders, routes, and decisions are waiting in one focused workspace.</p><div className="login-proof"><span><Check size={14}/> Role-based access</span><span><Check size={14}/> Live operational records</span></div><div className="login-orbit"><span className="login-orbit-core"><Sprout size={22}/></span><span className="login-orbit-node login-orbit-node-one">Farms</span><span className="login-orbit-node login-orbit-node-two">AI</span><span className="login-orbit-node login-orbit-node-three">Market</span></div></section>
        <section className="login-card"><div className="login-card-heading"><div className="login-card-icon"><LockKeyhole size={18}/></div><div><p>Secure workspace access</p><h2>Sign in</h2></div></div><p className="login-card-copy">Use your FarmDirect account to continue.</p><form className="login-form" onSubmit={handleSubmit}><label><span>Email address</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required/></label><label><span>Password</span><div className="login-password"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required/><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></label>{error && <p className="login-error" role="alert">{error}</p>}<button className="btn-primary login-submit" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Continue'} {!loading && <ArrowRight size={17}/>}</button></form><div className="login-links"><Link to="/forgot-password">Forgot password?</Link><Link to="/register">Create account</Link></div></section>
      </main>
    </div>);
}

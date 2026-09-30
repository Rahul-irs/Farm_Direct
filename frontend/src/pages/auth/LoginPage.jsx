import { ArrowLeft, ArrowRight, Carrot, Eye, EyeOff, Leaf, LockKeyhole, ShieldCheck, Truck, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../services/api';
import '../../styles/login-reference.css';

function dashboardForRole(role) {
    if (role === 'admin') return '/dashboard/admin';
    if (role === 'farmer') return '/dashboard/farmer';
    if (role === 'logistics_provider') return '/dashboard/logistics';
    if (role === 'fpo') return '/dashboard/fpo';
    if (role === 'field_assistant') return '/dashboard/field-assistant';
    if (role === 'bulk_buyer') return '/dashboard/bulk-buyer';
    return '/dashboard/consumer';
}

const benefits = [
    { icon: Leaf, title: 'Fresh Produce', detail: 'Straight from farms' },
    { icon: ShieldCheck, title: 'Fair Prices', detail: 'No middlemen' },
    { icon: Truck, title: 'Fast Delivery', detail: 'To your doorstep' },
    { icon: Users, title: 'Stronger Communities', detail: 'Supporting local farmers' },
];

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        document.title = 'Login | FarmDirect';
        return () => { document.title = 'FarmDirect AI'; };
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await login(email, password);
            localStorage.setItem('farmdirect_token', result.token);
            localStorage.setItem('farmdirect_user', JSON.stringify(result.user));
            navigate(dashboardForRole(result.user.role));
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to log in');
        } finally {
            setLoading(false);
        }
    }

    return <main className="login-reference-page">
        <div className="login-reference-background" aria-hidden="true" />
        <div className="login-reference-sun" aria-hidden="true" />
        <div className="login-reference-leaves" aria-hidden="true"><Leaf /><Leaf /><Leaf /><Leaf /></div>

        <header className="login-reference-header">
            <Link className="login-reference-brand" to="/" aria-label="FarmDirect home"><span><Leaf size={39} /></span><div><strong>Farm<span>Direct</span></strong><small>From Farm to You. Directly.</small></div></Link>
            <Link className="login-reference-back" to="/"><ArrowLeft size={16} /> Back to Home</Link>
        </header>

        <section className="login-reference-stage">
            <div className="login-reference-copy">
                <p className="login-reference-eyebrow">Good Food. Better Tomorrow.</p>
                <h1>Join the FarmDirect<br /><span>Community</span></h1>
                <p className="login-reference-description">Fresh produce, fair prices and<br className="login-reference-desktop-break" /> stronger communities — all in one place.</p>
                <div className="login-reference-benefits">{benefits.map(({ icon: Icon, title, detail }) => <div className="login-reference-benefit" key={title}><span><Icon size={22} /></span><div><strong>{title}</strong><small>{detail}</small></div></div>)}</div>
            </div>

            <div className="login-reference-farmer" role="img" aria-label="Farmer holding fresh vegetables in a wooden crate" />
            <div className="login-reference-crate" aria-hidden="true"><span>FRESH HARVEST</span><i /><i /><i /><i /><i /></div>
            <svg className="login-reference-connection" viewBox="0 0 700 240" aria-hidden="true"><path className="login-reference-path-glow" d="M20 185 C170 55 260 228 392 130 S570 58 687 96" /><path className="login-reference-path-line" d="M20 185 C170 55 260 228 392 130 S570 58 687 96" /></svg>
            <div className="login-reference-produce" aria-hidden="true"><span className="login-reference-tomato" /><span className="login-reference-carrot"><Carrot size={25} /></span><span className="login-reference-leaf"><Leaf size={24} /></span></div>

            <section className="login-reference-card" aria-labelledby="login-heading">
                <div className="login-reference-card-mark"><Leaf size={32} /></div>
                <h2 id="login-heading">Welcome Back</h2>
                <p className="login-reference-card-subtitle">Login to continue to your account</p>
                <form className="login-reference-form" onSubmit={handleSubmit}>
                    <label><span><LockKeyhole size={16} /> Email or Mobile Number</span><input type="text" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" placeholder="Email or Mobile Number" required /></label>
                    <label><span><LockKeyhole size={16} /> Password</span><div className="login-reference-password"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="Password" required /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
                    <div className="login-reference-options"><label className="login-reference-remember"><input type="checkbox" /> <span>Remember me</span></label><Link to="/forgot-password">Forgot Password?</Link></div>
                    {error && <p className="login-reference-error" role="alert">{error}</p>}
                    <button className="login-reference-submit" type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'} {!loading && <ArrowRight size={18} />}</button>
                </form>
                <div className="login-reference-divider"><span />OR<span /></div>
                <p className="login-reference-create-copy">New to FarmDirect?</p>
                <Link className="login-reference-create" to="/register">Create an Account <ArrowRight size={17} /></Link>
                <div className="login-reference-security"><LockKeyhole size={13} /> Secure account access</div>
            </section>
        </section>
    </main>;
}
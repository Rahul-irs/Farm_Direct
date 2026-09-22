import { Eye, EyeOff, HardHat, Leaf, ShoppingBasket, Truck, UserRound, UsersRound } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../services/api';
import { useSearchParams } from 'react-router-dom';
const roles = [
  ['farmer', 'Farmer', Leaf],
  ['field_assistant', 'Field Assistant', HardHat],
  ['fpo', 'FPO', UsersRound],
  ['consumer', 'Consumer', UserRound],
  ['bulk_buyer', 'Bulk Buyer', ShoppingBasket],
  ['logistics_provider', 'Logistics Provider', Truck],
];
export default function RegisterPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', role: searchParams.get('role') || 'consumer' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await register(form);
          sessionStorage.setItem('verification_email', result.email || form.email);
          navigate('/verify-email');
        }
        catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to create account');
        }
        finally {
            setLoading(false);
        }
    }
    return (<div className="min-h-screen flex items-center justify-center p-6 text-white">
      <div className="card w-full max-w-xl p-8">
        <h1 className="text-3xl font-bold">Create account</h1>
        <p className="mt-2 text-emerald-50/70">Join the FarmDirect AI ecosystem.</p>
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="block md:col-span-1">
            <span className="mb-2 block text-sm text-emerald-100/80">Full name</span>
            <input className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3" type="text" value={form.full_name} onChange={(event) => update('full_name', event.target.value)} required/>
          </label>
          <label className="block md:col-span-1">
            <span className="mb-2 block text-sm text-emerald-100/80">Email</span>
            <input className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} required/>
          </label>
          <label className="block md:col-span-1">
            <span className="mb-2 block text-sm text-emerald-100/80">Phone</span>
            <input className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3" type="tel" value={form.phone} onChange={(event) => update('phone', event.target.value)}/>
          </label>
          <fieldset className="md:col-span-2">
            <legend className="mb-2 block text-sm text-emerald-100/80">Choose your role</legend>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {roles.map(([value, label, Icon]) => <label className={`role-option group relative cursor-pointer ${form.role === value ? 'role-option-selected' : ''}`} key={value}>
                <input className="peer sr-only" type="radio" name="role" value={value} checked={form.role === value} onChange={(event) => update('role', event.target.value)}/>
                <span className="role-option-surface flex min-h-12 items-center gap-3 rounded-lg px-3 py-2.5 transition">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-200/10 text-emerald-200"><Icon size={16}/></span>
                  <span className="min-w-0 flex-1 font-semibold leading-tight text-emerald-50">{label}</span>
                  <span className="role-option-indicator flex h-4 w-4 shrink-0 items-center justify-center rounded-full">
                    <span className="h-2 w-2 rounded-full bg-white" />
                  </span>
                </span>
              </label>)}
            </div>
          </fieldset>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm text-emerald-100/80">Password</span>
            <div className="login-password">
              <input className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => update('password', event.target.value)} minLength={6} required/>
              <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button>
            </div>
          </label>
          <div className="md:col-span-2">
            {error && <p className="text-sm text-rose-300" role="alert">{error}</p>}
            <button className="btn-primary w-full" type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</button>
          </div>
        </form>
        <p className="mt-5 text-center text-sm text-emerald-100/75">Already registered? <Link to="/login">Log in</Link></p>
      </div>
    </div>);
}

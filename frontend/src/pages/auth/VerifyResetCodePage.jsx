import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyResetCode } from '../../services/api';
export default function VerifyResetCodePage() {
    const navigate = useNavigate();
    const identifier = sessionStorage.getItem('reset_identifier') || '';
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    async function submit(event) { event.preventDefault(); try {
        await verifyResetCode(identifier, code);
        sessionStorage.setItem('reset_code', code);
        navigate('/reset-password');
    }
    catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Invalid code');
    } }
    return (<div className="min-h-screen flex items-center justify-center p-6 text-white">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-3xl font-bold">Verify code</h1>
        <p className="mt-2 text-emerald-50/70">Enter the one-time code sent to your email.</p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <label className="block">
            <span className="mb-2 block text-sm text-emerald-100/80">Reset code</span>
            <input className="w-full rounded-xl border border-emerald-400/20 bg-slate-950/60 px-4 py-3" type="text" placeholder="123456" value={code} onChange={(event) => setCode(event.target.value)} required/>
          </label>
          {error && <p className="text-sm text-rose-300">{error}</p>}<button className="btn-primary w-full" type="submit">Verify</button>
        </form>
      </div>
    </div>);
}

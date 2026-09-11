import { useNavigate } from 'react-router-dom';
const roles = ['Farmer', 'Field Assistant', 'FPO', 'Consumer', 'Bulk Buyer', 'Logistics Provider'];
const roleValues = ['farmer', 'field_assistant', 'fpo', 'consumer', 'bulk_buyer', 'logistics_provider'];
export default function SelectRolePage() {
    const navigate = useNavigate();
    return (<div className="min-h-screen flex items-center justify-center p-6 text-white">
      <div className="card w-full max-w-4xl p-8">
        <h1 className="text-3xl font-bold">Choose your role</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roles.map((role, index) => (<button key={role} className="rounded-2xl border border-emerald-400/20 bg-slate-950/50 p-5 text-left hover:border-emerald-400/50" type="button" onClick={() => navigate(`/register?role=${roleValues[index]}`)}>
              <p className="text-xl font-semibold">{role}</p>
              <p className="mt-2 text-sm text-emerald-50/70">Access the dedicated workspace and tools.</p>
            </button>))}
        </div>
      </div>
    </div>);
}

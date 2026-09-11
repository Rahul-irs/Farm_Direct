import { Building2, HardHat, ShoppingBasket, Tractor, Truck, UsersRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const roles = [['Farmer', 'farmer', Tractor, 'List, price, and move your produce.'], ['Field Assistant', 'field_assistant', HardHat, 'Coordinate the farmers assigned to you.'], ['FPO', 'fpo', Building2, 'Aggregate supply across a trusted network.'], ['Consumer', 'consumer', ShoppingBasket, 'Discover fresh produce at the source.'], ['Bulk Buyer', 'bulk_buyer', UsersRound, 'Turn procurement needs into matches.'], ['Logistics Provider', 'logistics_provider', Truck, 'Operate the final mile with clarity.']];
export default function SelectRolePage() {
    const navigate = useNavigate();
    return (<div className="auth-page min-h-screen flex items-center justify-center p-6 text-white md:p-10">
      <div className="card role-picker w-full max-w-5xl p-6 sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200/70">Start with your work</p><h1 className="mt-3 text-4xl font-black md:text-6xl">Choose the workspace that fits your role.</h1><p className="mt-4 max-w-2xl text-emerald-50/70">Every role gets the tools and permissions built for its part of the food chain.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roles.map(([role, value, Icon, description]) => (<button key={value} className="role-card" type="button" onClick={() => navigate(`/register?role=${value}`)}><span className="role-card-icon"><Icon size={24}/></span><span className="role-card-title">{role}</span><span className="role-card-description">{description}</span><span className="role-card-arrow">→</span></button>))}
        </div>
      </div>
    </div>);
}

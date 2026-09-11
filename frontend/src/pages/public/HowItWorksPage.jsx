import { Link } from 'react-router-dom';
const steps = ['Create a role-based account', 'Publish or discover verified produce', 'Place an order with server-calculated totals', 'Track payment, delivery, and fulfilment'];
export default function HowItWorksPage() {
    return <main className="min-h-screen p-6 text-white"><div className="container max-w-4xl"><Link className="text-sm text-emerald-200" to="/">FarmDirect AI</Link><h1 className="mt-8 text-5xl font-black">The working loop.</h1><div className="mt-10 grid gap-4">{steps.map((step, index) => <section className="card flex items-start gap-5 p-6" key={step}><span className="text-3xl font-black text-emerald-300">0{index + 1}</span><div><h2 className="text-xl font-bold">{step}</h2><p className="mt-2 text-emerald-50/70">Each stage is backed by authenticated API requests and persistent database records.</p></div></section>)}</div></div></main>;
}

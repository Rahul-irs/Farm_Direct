import { ArrowRight, BarChart3, Check, Leaf, MapPinned, ShieldCheck, ShoppingCart, Tractor, Users } from 'lucide-react';
const stats = [
    { label: 'Farmers connected', value: '18.4K' },
    { label: 'Orders processed', value: '72K' },
    { label: 'Avg. supply efficiency', value: '94%' },
    { label: 'AI forecast accuracy', value: '91%' },
];
const features = [
    { icon: Leaf, title: 'Smart farm operations', description: 'Track produce, land, yields, and crop health through a unified command center.' },
    { icon: ShoppingCart, title: 'Marketplace & purchasing', description: 'Connect farmers, FPOs, and buyers in one transparent digital commerce layer.' },
    { icon: BarChart3, title: 'AI-powered insights', description: 'Forecast demand, recommend pricing, and match suppliers with real historical data.' },
    { icon: MapPinned, title: 'Logistics intelligence', description: 'Route, monitor, and optimize deliveries with real-time dispatch visibility.' },
];
export default function LandingPage() {
    return (<div className="landing-page min-h-screen text-white">
      <header className="container px-4 py-4 sm:px-0 sm:py-5">
        <nav className="landing-nav flex flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="brand-mark flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-950 shadow-lg shadow-lime-500/15 sm:h-10 sm:w-10">
              <Tractor size={20}/>
            </div>
            <div>
              <p className="whitespace-nowrap text-base font-black tracking-tight sm:text-lg">FarmDirect <span className="text-lime-200">AI</span></p>
            </div>
          </div>
          <div className="hidden items-center gap-8 text-sm text-emerald-50/80 md:flex">
            <a href="#about">About</a>
            <a href="#how-it-works">How it works</a>
            <a href="#ai">AI</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
            <a className="btn-secondary min-w-0 flex-1 px-3 py-2.5 text-sm sm:flex-none sm:px-5" href="/login">Sign in</a>
            <a className="btn-primary min-w-0 flex-1 px-3 py-2.5 text-sm sm:flex-none sm:px-5" href="/register">Get started</a>
          </div>
        </nav>
      </header>

      <main>
        <section className="container grid gap-12 pb-16 pt-14 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:pb-24 lg:pt-20">
          <div className="landing-hero-copy">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-200">
              <ShieldCheck size={16}/> Trusted by modern agri networks
            </div>
            <h1 className="max-w-2xl text-5xl font-black leading-[0.98] tracking-tight md:text-7xl">
              From first seed to <span className="gradient-text">final mile.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-emerald-50/75">
              One clear view of your agricultural network. Sell with confidence, buy direct, and move fresh produce with less waste.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a className="btn-primary" href="/register">Start now <ArrowRight size={18}/></a>
              <a className="btn-secondary" href="#platform">See how it works</a>
            </div>
            <div className="mt-8 flex items-center gap-3 text-sm text-emerald-50/60"><Users size={17} className="text-emerald-300"/> Join 18,400+ farmers and buyers building a fairer food chain.</div>
          </div>

          <div className="landing-hero-visual relative overflow-hidden">
            <img className="hero-photo absolute inset-0 h-full w-full object-cover" src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=85" alt="A farmer walking through a green field"/>
            <div className="absolute inset-0 bg-gradient-to-t from-[#193326]/90 via-[#193326]/15 to-transparent"/>
            <div className="relative flex min-h-[420px] flex-col justify-between p-4 sm:min-h-[480px] sm:p-8">
              <div className="flex items-start justify-between">
                <span className="rounded-full border border-white/30 bg-black/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">Network view</span>
                <span className="flex items-center gap-2 rounded-full bg-[#d8f36c] px-3 py-1.5 text-xs font-bold text-slate-950"><span className="h-2 w-2 rounded-full bg-slate-950"/> Live</span>
              </div>
              <div className="relative space-y-4">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="rounded-xl border border-white/25 bg-[#193326]/75 p-3 backdrop-blur-md sm:p-4"><p className="text-xs text-lime-100/75">This week’s yield</p><p className="mt-2 text-xl font-black text-white sm:text-2xl">+18.2%</p></div>
                  <div className="rounded-xl border border-white/25 bg-[#193326]/75 p-3 backdrop-blur-md sm:p-4"><p className="text-xs text-lime-100/75">Fresh orders</p><p className="mt-2 text-xl font-black text-white sm:text-2xl">1,284</p></div>
                </div>
                <div className="rounded-xl border border-white/25 bg-[#193326]/85 p-4 backdrop-blur-md sm:p-5">
                  <div className="flex items-end justify-between gap-3"><div><p className="text-sm text-lime-100/75">Supply chain pulse</p><p className="mt-1 text-xl font-bold text-white sm:text-2xl">Healthy and moving</p></div><BarChart3 className="shrink-0 text-[#cfe89a]" size={26}/></div>
                  <div className="mt-5 flex h-10 items-end gap-1.5 sm:h-12">{[38, 56, 44, 68, 58, 84, 72, 96, 78, 91, 86, 100].map((height, index) => <span key={index} className="flex-1 rounded-t-sm bg-gradient-to-t from-[#9fcf91] to-[#e3f2b8]" style={{ height: `${height}%` }}/>)}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="platform" className="container py-10">
          <div className="mb-8 text-center">
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-200/75">Platform</p>
            <h2 className="mt-3 text-3xl font-bold md:text-5xl">Built for every link in the agricultural value chain.</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {features.map(({ icon: Icon, title, description }) => (<div key={title} className="card p-6">
                <div className="mb-5 inline-flex rounded-2xl bg-emerald-500/10 p-3 text-emerald-300">
                  <Icon size={22}/>
                </div>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm text-emerald-50/70">{description}</p>
              </div>))}
          </div>
        </section>

        <section id="about" className="container scroll-mt-8 py-16">
          <div className="card grid gap-8 p-8 lg:grid-cols-[0.8fr_1.2fr] lg:p-10">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-200/75">About FarmDirect</p>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">A clearer route from farm to table.</h2>
            </div>
            <div className="space-y-4 text-emerald-50/70">
              <p>FarmDirect AI gives agricultural networks one place to list produce, buy with confidence, coordinate delivery, and make decisions from real operational data.</p>
              <div className="grid gap-4 sm:grid-cols-3">
                {['Transparent commerce', 'Reliable operations', 'Useful intelligence'].map((title) => <div className="rounded-xl border border-emerald-400/15 bg-emerald-500/5 p-4" key={title}><p className="font-semibold text-emerald-100">{title}</p><p className="mt-2 text-sm">Built around accountable records and useful handoffs.</p></div>)}
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="container scroll-mt-8 py-16">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-200/75">How it works</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">One working loop, from listing to delivery.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {['Create a role-based account', 'Publish or discover produce', 'Place an order with clear totals', 'Track payment and fulfilment'].map((step, index) => <div className="card p-5" key={step}><span className="text-3xl font-black text-emerald-300">0{index + 1}</span><h3 className="mt-5 text-lg font-bold">{step}</h3><p className="mt-2 text-sm text-emerald-50/65">Every stage stays visible to the people responsible for it.</p></div>)}
          </div>
        </section>

        <section id="benefits" className="container py-16">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="card p-8">
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-200/75">For farmers</p>
              <h3 className="mt-4 text-3xl font-bold">Sell more, waste less, and plan with confidence.</h3>
                <ul className="mt-6 space-y-4 text-emerald-50/75">
                <li className="flex gap-3"><Check className="mt-1 shrink-0 text-emerald-300" size={16}/> Real-time crop and stock visibility.</li>
                <li className="flex gap-3"><Check className="mt-1 shrink-0 text-emerald-300" size={16}/> Price guidance from data-backed AI.</li>
                <li className="flex gap-3"><Check className="mt-1 shrink-0 text-emerald-300" size={16}/> Direct buyer and FPO matching.</li>
              </ul>
            </div>
            <div className="card p-8">
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-200/75">For buyers</p>
              <h3 className="mt-4 text-3xl font-bold">Source reliably with cleaner procurement and lower risk.</h3>
              <ul className="mt-6 space-y-4 text-emerald-50/75">
                <li className="flex gap-3"><Check className="mt-1 shrink-0 text-emerald-300" size={16}/> Trusted supplier discovery.</li>
                <li className="flex gap-3"><Check className="mt-1 shrink-0 text-emerald-300" size={16}/> Transparent product quality checks.</li>
                <li className="flex gap-3"><Check className="mt-1 shrink-0 text-emerald-300" size={16}/> End-to-end logistics coordination.</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="ai" className="container pb-20">
          <div className="card p-8">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-emerald-200/75">AI intelligence</p>
                <h3 className="mt-4 text-3xl font-bold">Better supply decisions powered by real data.</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {stats.map((stat) => (<div key={stat.label} className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-5">
                    <p className="text-3xl font-black text-emerald-200">{stat.value}</p>
                    <p className="mt-2 text-sm text-emerald-50/70">{stat.label}</p>
                  </div>))}
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="container scroll-mt-8 pb-24">
          <div className="card flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:justify-between lg:p-10">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-200/75">Contact</p>
              <h2 className="mt-3 text-3xl font-bold">Let’s improve the chain.</h2>
              <p className="mt-3 max-w-xl text-emerald-50/70">For partnerships, implementation questions, or account support, reach the FarmDirect team.</p>
            </div>
            <a className="btn-primary shrink-0" href="mailto:support@farmdirect.ai">Email support <ArrowRight size={18}/></a>
          </div>
        </section>
      </main>
    </div>);
}

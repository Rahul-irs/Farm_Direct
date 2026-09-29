import { ArrowRight, Carrot, ChevronDown, Leaf, Menu, ShieldCheck, Truck, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const features = [
    { icon: Leaf, title: '100% Fresh', description: 'Direct from farms' },
    { icon: ShieldCheck, title: 'Fair Prices', description: 'No middlemen' },
    { icon: Truck, title: 'Fast Delivery', description: 'Straight to your door' },
    { icon: Users, title: 'Stronger Communities', description: 'Supporting local farmers' },
];

export default function LandingPage() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [pointer, setPointer] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handlePointer = (event) => {
            setPointer({
                x: (event.clientX / window.innerWidth - 0.5) * 2,
                y: (event.clientY / window.innerHeight - 0.5) * 2,
            });
        };
        window.addEventListener('pointermove', handlePointer, { passive: true });
        return () => window.removeEventListener('pointermove', handlePointer);
    }, []);

    return <div className="landing-page landing-reference-page" style={{ '--landing-pointer-x': `${pointer.x}px`, '--landing-pointer-y': `${pointer.y}px` }}>
        <div className="landing-reference-background" aria-hidden="true" />
        <div className="landing-reference-sun" aria-hidden="true" />
        <div className="landing-reference-leaves" aria-hidden="true"><Leaf /><Leaf /><Leaf /><Leaf /></div>

        <header className="landing-reference-header">
            <a className="landing-reference-brand" href="/" aria-label="FarmDirect home"><span className="landing-reference-brand-mark"><Leaf size={28} /></span><strong>Farm<span>Direct</span></strong></a>
            <button className="landing-reference-menu-button" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
            <nav className={`landing-reference-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
                <a className="is-active" href="/">Home</a><a href="#about">About</a><a href="#platform">Products</a><a href="#benefits">For Farmers</a><a href="#benefits">For Buyers</a><a href="#contact">Contact</a>
            </nav>
            <div className="landing-reference-actions"><a className="landing-reference-login" href="/login">Login</a><a className="landing-reference-signup" href="/register">Sign Up</a></div>
        </header>

        <main className="landing-reference-main">
            <section className="landing-reference-hero" aria-labelledby="landing-heading">
                <div className="landing-reference-copy">
                    <p className="landing-reference-eyebrow">Fresh Produce <b>•</b> Better Prices <b>•</b> Stronger Communities</p>
                    <h1 id="landing-heading">From Farm to You.<br /><span>Directly.</span></h1>
                    <p className="landing-reference-description">Connecting farmers directly with consumers,<br className="landing-desktop-break" /> for fresher produce, fairer prices and a healthier future.</p>
                    <div className="landing-reference-cta"><a className="landing-reference-primary" href="/marketplace">Shop Fresh Produce <ArrowRight size={18} /></a><a className="landing-reference-secondary" href="#how-it-works">Learn More</a></div>
                </div>

                <div className="landing-reference-visual" aria-label="A farmer sharing fresh produce directly with a consumer">
                    <div className="landing-reference-farmer" role="img" aria-label="Farmer holding fresh vegetables in a field" />
                    <div className="landing-reference-crate" aria-hidden="true"><span>FRESH HARVEST</span><i /><i /><i /><i /><i /></div>
                    <svg className="landing-reference-connection" viewBox="0 0 720 230" aria-hidden="true"><path className="landing-reference-connection-glow" d="M30 166 C190 30 278 224 404 118 S580 50 690 91" /><path className="landing-reference-connection-line" d="M30 166 C190 30 278 224 404 118 S580 50 690 91" /></svg>
                    <div className="landing-reference-produce" aria-hidden="true"><span className="landing-tomato" /><span className="landing-carrot"><Carrot size={27} /></span><span className="landing-leaf"><Leaf size={25} /></span><span className="landing-tomato landing-tomato-two" /></div>
                    <div className="landing-reference-consumer"><div className="landing-reference-consumer-image" role="img" aria-label="Consumer receiving fresh produce" /><span className="landing-reference-consumer-ring" /><span className="landing-reference-consumer-label">You</span></div>
                </div>
            </section>

            <section className="landing-reference-feature-bar" aria-label="FarmDirect benefits">
                {features.map(({ icon: Icon, title, description }, index) => <div className="landing-reference-feature" key={title}><Icon size={28} /><div><strong>{title}</strong><span>{description}</span></div>{index < features.length - 1 && <i aria-hidden="true" />}</div>)}
            </section>

            <section id="about" className="landing-reference-followup"><p className="landing-reference-followup-kicker">About FarmDirect</p><h2>A clearer route from farm to table.</h2><p>FarmDirect connects farmers, FPOs, buyers, and consumers through accountable produce, ordering, and fulfilment workflows.</p></section>
            <section id="how-it-works" className="landing-reference-followup"><p className="landing-reference-followup-kicker">How it works</p><h2>Fresh produce, with fewer unnecessary steps.</h2><p>Farmers list produce, customers order directly, and logistics partners move each accepted order to its destination.</p></section>
            <section id="platform" className="landing-reference-followup"><p className="landing-reference-followup-kicker">Products</p><h2>One workspace for the food chain.</h2><p>Explore the marketplace, manage supply, and coordinate the journey from farm to customer.</p></section>
            <section id="benefits" className="landing-reference-followup"><p className="landing-reference-followup-kicker">For every partner</p><h2>Better visibility for farmers and buyers.</h2><p>Role-based tools keep inventory, orders, delivery, and coordination visible to the people responsible for each handoff.</p></section>
            <section id="contact" className="landing-reference-followup"><p className="landing-reference-followup-kicker">Contact</p><h2>Let’s improve the chain.</h2><a className="landing-reference-primary" href="mailto:support@farmdirect.ai">Email support <ArrowRight size={17} /></a></section>
        </main>
        <ChevronDown className="landing-reference-scroll-cue" size={21} aria-hidden="true" />
    </div>;
}
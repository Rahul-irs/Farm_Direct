import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Carrot, Leaf, Link2, Sprout } from 'lucide-react';
import './FarmDirectIntro.css';

export const INTRO_DURATION_MS = 5000;

const sceneForProgress = (progress) => {
  if (progress < 20) return 'FARM';
  if (progress < 40) return 'FARMER';
  if (progress < 60) return 'CONNECTION';
  if (progress < 80) return 'CONSUMER';
  return 'BRAND';
};

function ProduceTrail() {
  return (
    <div className="fd-produce-trail" aria-hidden="true">
      <span className="fd-trail-item fd-trail-tomato" />
      <span className="fd-trail-item fd-trail-carrot"><Carrot size={25} /></span>
      <span className="fd-trail-item fd-trail-leaf"><Leaf size={27} /></span>
      <span className="fd-trail-item fd-trail-tomato fd-trail-tomato-two" />
    </div>
  );
}

export default function FarmDirectIntro({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const finished = useRef(false);

  useEffect(() => {
    const startedAt = performance.now();
    let frame;
    const tick = (now) => {
      const next = Math.min(((now - startedAt) / INTRO_DURATION_MS) * 100, 100);
      setProgress(next);
      if (next < 100 && !finished.current) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const completion = window.setTimeout(() => {
      if (!finished.current) {
        finished.current = true;
        onComplete();
      }
    }, INTRO_DURATION_MS);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(completion);
    };
  }, [onComplete]);

  function skipIntro() {
    if (finished.current) return;
    finished.current = true;
    onComplete();
  }

  return (
    <motion.section className="fd-intro" aria-label="FarmDirect introduction" exit={{ opacity: 0, scale: 1.025 }} transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}>
      <div className="fd-intro-backdrop" />
      <div className="fd-intro-atmosphere" />
      <div className="fd-intro-grain" />
      <div className="fd-intro-particles" aria-hidden="true" />

      <header className="fd-intro-topline">
        <div className="fd-intro-signature"><span className="fd-signature-mark"><Leaf size={17} /></span><span>FARMDIRECT <i>AI</i></span></div>
        <span className="fd-intro-timer">{sceneForProgress(progress)} <span> / </span> 05</span>
      </header>

      <main className="fd-cinematic-stage">
        <div className="fd-farm-depth fd-farm-depth-back" />
        <div className="fd-farm-depth fd-farm-depth-front" />
        <motion.div className="fd-farmer-figure" aria-label="Farmer holding fresh produce" role="img" />
        <div className="fd-farmer-crate" aria-hidden="true"><span>FRESH HARVEST</span><i /><i /><i /><i /><i /></div>

        <svg className="fd-connection-path" viewBox="0 0 1000 300" role="img" aria-label="Fresh produce traveling directly from farmer to consumer">
          <defs><linearGradient id="fd-path-gradient" x1="0" x2="1"><stop stopColor="#b7e36c" /><stop offset=".5" stopColor="#f4cc63" /><stop offset="1" stopColor="#b7e36c" /></linearGradient></defs>
          <path className="fd-path-glow" d="M105 155 C280 25 390 280 535 150 S780 28 910 150" />
          <path className="fd-path-line" d="M105 155 C280 25 390 280 535 150 S780 28 910 150" />
        </svg>
        <ProduceTrail />

        <motion.div className="fd-consumer-figure" aria-label="Consumer receiving fresh produce" role="img" />
        <div className="fd-consumer-box" aria-hidden="true"><Sprout size={23} /><strong>Farm<span>Direct</span></strong><small>FRESH HARVEST</small></div>

        <div className="fd-copy fd-copy-farm"><Leaf size={24} /><h1>Fresh From<br />Our Farms</h1></div>
        <div className="fd-copy fd-copy-farmer"><Leaf size={20} /><h2>Real Farmers.<br />Real Produce.</h2></div>
        <div className="fd-copy fd-copy-connection"><Link2 size={23} /><h2>Direct Connection</h2><p>No Middlemen <span>•</span> No Extra Cost</p></div>
        <div className="fd-copy fd-copy-consumer"><Sprout size={20} /><h2>Freshness<br />Reaches You</h2></div>
        <div className="fd-copy fd-copy-brand"><span className="fd-brand-leaf"><Leaf size={31} /></span><h1>Farm<span>Direct</span></h1><p>From Farm to You. Directly.</p></div>
      </main>

      <footer className="fd-intro-bottomline">
        <div className="fd-scene-progress" aria-hidden="true"><span /><span /><span /><span /><span /></div>
        <button type="button" className="fd-skip-intro" onClick={skipIntro} aria-label="Skip introduction">Skip intro <ArrowRight size={14} /></button>
      </footer>
    </motion.section>
  );
}
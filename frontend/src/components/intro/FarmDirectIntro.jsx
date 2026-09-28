import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Carrot, Cherry, Leaf, Link2, Sprout } from 'lucide-react';
import './FarmDirectIntro.css';

const INTRO_DURATION_MS = 5000;
const SCENE_DURATION_MS = 1000;

const scenes = [
  { eyebrow: '01 / ORIGIN', headline: 'Fresh from our farms', detail: 'Grown with care. Harvested at its best.' },
  { eyebrow: '02 / FARMER', headline: 'Real farmers. Real produce.', detail: 'Good food starts with the people who grow it.' },
  { eyebrow: '03 / CONNECTION', headline: 'One direct connection.', detail: 'No unnecessary middlemen. No extra steps.' },
  { eyebrow: '04 / DELIVERY', headline: 'Freshness reaches you.', detail: 'From their harvest to your home.' },
  { eyebrow: '05 / FARMDIRECT', headline: 'FarmDirect', detail: 'From farm to you. Directly.' },
];

const sceneImages = {
  farm: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2200&q=85',
  farmer: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=85',
  consumer: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=85',
};

function SceneVisual({ scene }) {
  if (scene === 0 || scene === 4) {
    return <motion.div className={`fd-intro-landscape ${scene === 4 ? 'is-brand-landscape' : ''}`} initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.2, ease: 'easeOut' }} />;
  }

  if (scene === 1) {
    return (
      <motion.div className="fd-intro-person-scene fd-farmer-scene" initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -22 }} transition={{ duration: 0.42 }}>
        <div className="fd-intro-person-image fd-farmer-image" role="img" aria-label="Farmers working together in a field" />
        <div className="fd-produce-crate" aria-hidden="true"><span>FRESH HARVEST</span><div className="fd-produce-row"><i /><i /><i /><i /><i /></div></div>
      </motion.div>
    );
  }

  if (scene === 2) {
    return (
      <motion.div className="fd-intro-connection-scene" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
        <div className="fd-connection-person fd-connection-farmer"><span className="fd-connection-avatar fd-avatar-farmer" /><span className="fd-person-label">Farmer</span></div>
        <svg className="fd-connection-path" viewBox="0 0 800 180" role="img" aria-label="A direct route connecting farmer and consumer">
          <path className="fd-path-glow" d="M35 94 C195 8 260 169 410 94 S625 20 765 94" />
          <path className="fd-path-line" d="M35 94 C195 8 260 169 410 94 S625 20 765 94" />
          <path className="fd-path-flow" d="M35 94 C195 8 260 169 410 94 S625 20 765 94" />
        </svg>
        <div className="fd-connection-produce" aria-hidden="true"><span><Cherry size={19} /></span><span><Carrot size={22} /></span><span><Leaf size={20} /></span></div>
        <div className="fd-connection-person fd-connection-consumer"><span className="fd-connection-avatar fd-avatar-consumer" /><span className="fd-person-label">You</span></div>
        <div className="fd-connection-center" aria-hidden="true"><Link2 size={17} /></div>
      </motion.div>
    );
  }

  return (
    <motion.div className="fd-intro-person-scene fd-consumer-scene" initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -22 }} transition={{ duration: 0.42 }}>
      <div className="fd-intro-person-image fd-consumer-image" role="img" aria-label="A smiling consumer receiving fresh produce" />
      <div className="fd-delivery-box" aria-hidden="true"><Sprout size={26} /><span>FARM<br />DIRECT</span></div>
    </motion.div>
  );
}

export default function FarmDirectIntro({ onComplete }) {
  const [scene, setScene] = useState(0);
  const timeouts = useRef([]);
  const finished = useRef(false);

  useEffect(() => {
    for (let index = 1; index < scenes.length; index += 1) {
      timeouts.current.push(window.setTimeout(() => setScene(index), index * SCENE_DURATION_MS));
    }
    timeouts.current.push(window.setTimeout(() => {
      if (!finished.current) {
        finished.current = true;
        onComplete();
      }
    }, INTRO_DURATION_MS));

    return () => timeouts.current.forEach(window.clearTimeout);
  }, [onComplete]);

  function skipIntro() {
    if (finished.current) return;
    finished.current = true;
    timeouts.current.forEach(window.clearTimeout);
    onComplete();
  }

  const currentScene = scenes[scene];

  return (
    <motion.section className="fd-intro" aria-label="FarmDirect introduction" exit={{ opacity: 0, scale: 1.025 }} transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}>
      <div className="fd-intro-backdrop" />
      <div className="fd-intro-shade" />
      <div className="fd-intro-grain" />
      <div className="fd-intro-horizon" aria-hidden="true" />

      <div className="fd-intro-topline">
        <div className="fd-intro-signature"><span className="fd-signature-mark"><Leaf size={17} /></span><span>FARMDIRECT <i>AI</i></span></div>
        <span className="fd-intro-timer">0{scene + 1}<span> / </span>05</span>
      </div>

      <div className={`fd-intro-content fd-content-scene-${scene}`}>
        <div className={`fd-intro-copy fd-copy-scene-${scene}`}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={scene} className="fd-copy-inner" initial={{ opacity: 0, y: 18, filter: 'blur(5px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -12, filter: 'blur(3px)' }} transition={{ duration: 0.32, ease: 'easeOut' }}>
              <p className="fd-intro-eyebrow"><span />{currentScene.eyebrow}</p>
              {scene === 4 ? <h1 className="fd-brand-title">Farm<span>Direct</span></h1> : <h1>{currentScene.headline}</h1>}
              <p className="fd-intro-detail">{currentScene.detail}</p>
              {scene === 2 && <div className="fd-no-middlemen"><Link2 size={15} /> FARMER <ArrowRight size={14} /> YOU</div>}
              {scene === 4 && <div className="fd-brand-leaves"><Leaf size={30} /><Leaf size={18} /></div>}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className={`fd-intro-visual fd-visual-scene-${scene}`}>
          <SceneVisual scene={scene} />
          {scene === 0 && <div className="fd-field-label"><Sprout size={15} /> FRESH FROM OUR FARMS</div>}
          {scene === 2 && <div className="fd-connection-label"><Link2 size={16} /> DIRECT CONNECTION</div>}
          {scene === 3 && <div className="fd-floating-produce" aria-hidden="true"><span><Leaf size={22} /></span><span><Cherry size={19} /></span><span><Carrot size={22} /></span></div>}
        </div>
      </div>

      {scene === 4 && <motion.div className="fd-intro-brand-caption" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.4 }}>From farm to you. Directly.</motion.div>}

      <div className="fd-intro-bottomline">
        <div className="fd-scene-progress" aria-hidden="true">{scenes.map((item, index) => <span key={item.eyebrow} className={index <= scene ? 'is-active' : ''} />)}</div>
        <button type="button" className="fd-skip-intro" onClick={skipIntro} aria-label="Skip introduction">Skip intro <ArrowRight size={14} /></button>
      </div>
      <div className="fd-intro-image-preload" aria-hidden="true">{Object.values(sceneImages).map((src) => <img src={src} alt="" key={src} />)}</div>
    </motion.section>
  );
}
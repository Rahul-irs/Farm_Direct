import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LandingPage from '../../pages/public/LandingPage';
import FarmDirectIntro from './FarmDirectIntro';

const SHOW_INTRO_ONCE_PER_SESSION = true;
const INTRO_SESSION_KEY = 'farmdirect_intro_seen';

function hasSeenIntro() {
  if (!SHOW_INTRO_ONCE_PER_SESSION) return false;
  try {
    return window.sessionStorage.getItem(INTRO_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

export default function IntroGate() {
  const [showIntro, setShowIntro] = useState(() => !hasSeenIntro());

  const completeIntro = useCallback(() => {
    try {
      window.sessionStorage.setItem(INTRO_SESSION_KEY, 'true');
    } catch {
      // The intro still completes when browser storage is unavailable.
    }
    setShowIntro(false);
  }, []);

  return (
    <div className="fd-intro-gate">
      <motion.div className="fd-landing-underlay" initial={false} animate={{ opacity: showIntro ? 0 : 1, scale: showIntro ? 0.99 : 1 }} transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }} aria-hidden={showIntro}>
        <LandingPage />
      </motion.div>
      <AnimatePresence>
        {showIntro && <FarmDirectIntro key="farmdirect-intro" onComplete={completeIntro} />}
      </AnimatePresence>
    </div>
  );
}
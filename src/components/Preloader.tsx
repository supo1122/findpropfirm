import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Preloader({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setGone(true); onDone(); return;
    }
    let v = 0;
    const t = setInterval(() => {
      v = Math.min(100, v + Math.random() * 16 + 6);
      setPct(Math.round(v));
      if (v >= 100) { clearInterval(t); setTimeout(() => { setGone(true); onDone(); }, 350); }
    }, 90);
    return () => clearInterval(t);
  }, [onDone]);

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center gap-5"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="font-heading italic text-4xl md:text-6xl">
            PropFirm<span className="text-[#35E08A]">TW</span>
          </div>
          <div className="w-[min(240px,60vw)] h-[3px] bg-white/15 rounded overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#35E08A] to-[#F5A524]" style={{ width: pct + '%' }} />
          </div>
          <div className="font-body text-sm text-white/60 tabular-nums">{pct}%</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

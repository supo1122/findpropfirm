import { useEffect, useRef, useState } from 'react';
import type { Firm } from '../data';

const THEME: Record<string, string> = {
  lucid: '#35E08A', apex: '#F5A524', tradeify: '#4ADE80',
  topstep: '#5B9BFF', siegpath: '#B08CFF',
};

export default function FirmAnim({ firm }: { firm: Firm }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);
  const color = THEME[firm.id] || '#35E08A';

  useEffect(() => {
    const el = wrap.current;
    if (!el || !firm.anim) return;
    const obs = new IntersectionObserver(
      ([e]) => setLoad(e.isIntersecting),
      { rootMargin: '200px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [firm.anim]);

  return (
    <div ref={wrap} className="relative w-full rounded-3xl overflow-hidden border border-white/10"
      style={{ aspectRatio: '4 / 3', background: '#02040a' }}>
      {/* 主題光暈 */}
      <div className="absolute inset-0 z-0" style={{
        background: `radial-gradient(ellipse 60% 55% at 50% 50%, ${color}22 0%, transparent 70%)`,
      }} />
      {firm.anim ? (
        load && (
          <iframe key={firm.id} src={firm.anim} title={`${firm.name} 動畫`}
            className="absolute inset-0 w-full h-full z-10" style={{ border: 0 }} />
        )
      ) : (
        // 尚無動畫：logo + 呼吸光暈佔位
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <img src={firm.logo} alt={firm.name}
            className="h-28 w-28 rounded-2xl bg-white p-4 object-contain"
            style={{ animation: 'breathe 3s ease-in-out infinite', boxShadow: `0 0 60px ${color}55` }} />
        </div>
      )}
    </div>
  );
}

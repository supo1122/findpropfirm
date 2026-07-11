import { useEffect, useRef, useState } from 'react';

/** 自訂游標 + 捲動進度條 */
export default function Chrome() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [cursorOn, setCursorOn] = useState(false);

  useEffect(() => {
    const canHover = window.matchMedia('(hover:hover)').matches && innerWidth >= 900;
    setCursorOn(canHover);

    const onScroll = () => {
      const s = document.documentElement;
      if (bar.current) bar.current.style.width = (s.scrollTop / (s.scrollHeight - s.clientHeight) * 100) + '%';
    };
    addEventListener('scroll', onScroll, { passive: true });

    let rx = -100, ry = -100, mx = -100, my = -100, raf = 0, shown = false;
    const move = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      if (!shown) { // 第一次移動才顯示，避免卡在左上角 (0,0)
        shown = true;
        if (dot.current) { dot.current.style.display = 'block'; dot.current.style.opacity = '1'; }
        if (ring.current) { ring.current.style.display = 'block'; ring.current.style.opacity = '1'; }
      }
      if (dot.current) { dot.current.style.left = mx + 'px'; dot.current.style.top = my + 'px'; }
    };
    const loop = () => {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      if (ring.current) { ring.current.style.left = rx + 'px'; ring.current.style.top = ry + 'px'; }
      raf = requestAnimationFrame(loop);
    };
    const over = (e: Event) => {
      if ((e.target as HTMLElement).closest('a,button,.glass-hover'))
        ring.current?.classList.add('grow');
    };
    const out = (e: Event) => {
      if ((e.target as HTMLElement).closest('a,button,.glass-hover'))
        ring.current?.classList.remove('grow');
    };
    if (canHover) {
      addEventListener('mousemove', move);
      document.addEventListener('mouseover', over);
      document.addEventListener('mouseout', out);
      loop();
    }
    return () => {
      removeEventListener('scroll', onScroll);
      removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', over);
      document.removeEventListener('mouseout', out);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={bar} className="fixed top-0 left-0 h-[3px] w-0 z-[100]"
        style={{ background: 'linear-gradient(90deg,#35E08A,#F5A524)', boxShadow: '0 0 12px #35E08A' }} />
      {cursorOn && (
        <>
          <div ref={dot} className="cursor-dot" style={{ display: 'none', opacity: 0, left: -100, top: -100 }} />
          <div ref={ring} className="cursor-ring" style={{ display: 'none', opacity: 0, left: -100, top: -100 }} />
        </>
      )}
    </>
  );
}

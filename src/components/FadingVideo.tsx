import { useEffect, useRef, useState, CSSProperties } from 'react';

type Props = {
  src: string | string[];
  className?: string;
  style?: CSSProperties;
};

const FADE_IN = 500;
const FADE_OUT = 550;

export default function FadingVideo({ src, className, style }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number>();
  const sources = Array.isArray(src) ? src : [src];
  const [index, setIndex] = useState(0);

  const fade = (to: number, duration: number) => {
    const el = ref.current;
    if (!el) return;
    const from = Number(el.style.opacity || '0');
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      el.style.opacity = String(from + (to - from) * t);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    cancelAnimationFrame(rafRef.current!);
    rafRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = '0';

    const onLoaded = () => fade(1, FADE_IN);
    const onTime = () => {
      if (el.duration && el.duration - el.currentTime <= 0.55) fade(0, FADE_OUT);
    };
    const onEnded = () => {
      if (sources.length > 1) {
        setIndex((i) => (i + 1) % sources.length);
      } else {
        el.currentTime = 0;
        el.play().catch(() => {});
        fade(1, FADE_IN);
      }
    };

    el.addEventListener('loadeddata', onLoaded);
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('ended', onEnded);
    return () => {
      el.removeEventListener('loadeddata', onLoaded);
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('ended', onEnded);
      cancelAnimationFrame(rafRef.current!);
    };
  }, [sources.length]);

  return (
    <video
      ref={ref}
      key={sources[index]}
      src={sources[index]}
      className={className}
      style={{ opacity: 0, ...style }}
      autoPlay
      muted
      playsInline
      preload="auto"
    />
  );
}

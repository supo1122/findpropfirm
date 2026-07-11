let cc: HTMLCanvasElement | null = null;
let cctx: CanvasRenderingContext2D | null = null;

function ensure() {
  if (cc) return;
  cc = document.createElement('canvas');
  cc.style.cssText = 'position:fixed;inset:0;z-index:8000;pointer-events:none';
  document.body.appendChild(cc);
  cctx = cc.getContext('2d');
  const size = () => { if (cc) { cc.width = innerWidth; cc.height = innerHeight; } };
  addEventListener('resize', size);
  size();
}

export function confettiBurst(x: number, y: number) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  ensure();
  if (!cctx || !cc) return;
  const cols = ['#35E08A', '#F5A524', '#E9ECF1'];
  const parts = Array.from({ length: 38 }, (_, i) => {
    const a = Math.random() * 6.28, sp = 3 + Math.random() * 7;
    return { x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 4, life: 1, c: cols[i % 3], s: 3 + Math.random() * 4, rot: Math.random() * 6 };
  });
  let n = 0;
  const run = () => {
    if (!cctx || !cc) return;
    cctx.clearRect(0, 0, cc.width, cc.height);
    let alive = false;
    for (const p of parts) {
      if (p.life <= 0) continue;
      alive = true; p.vy += 0.28; p.x += p.vx; p.y += p.vy; p.life -= 0.016; p.rot += 0.2;
      cctx.save(); cctx.globalAlpha = Math.max(p.life, 0); cctx.translate(p.x, p.y); cctx.rotate(p.rot);
      cctx.fillStyle = p.c; cctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 1.6); cctx.restore();
    }
    if (alive && n++ < 140) requestAnimationFrame(run);
    else cctx.clearRect(0, 0, cc.width, cc.height);
  };
  run();
}

export function copyCode(code: string, x: number, y: number, onCopied?: (c: string) => void) {
  navigator.clipboard.writeText(code).then(() => { confettiBurst(x, y); onCopied?.(code); });
}

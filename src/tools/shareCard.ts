// 試算結果 → 1080×1350 圖卡（IG 限動／Threads 直式），純 canvas 繪製，不靠外部套件。
import { download } from '../lib/store';

export type CardRow = { label: string; value: string; color: string };

const F = "'Noto Sans TC','Microsoft JhengHei','PingFang TC',sans-serif";

export async function makeCard(opts: {
  title: string; sub: string; rows: CardRow[]; code?: string; foot: string;
}): Promise<Blob | null> {
  const W = 1080, H = 1350;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  if (!g) return null;
  try { await document.fonts?.ready; } catch { /* 字型沒載完就用系統字 */ }

  // 背景
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0F141C'); bg.addColorStop(1, '#05070A');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  const bar = g.createLinearGradient(0, 0, W, 0);
  bar.addColorStop(0, '#5B9DF4'); bar.addColorStop(0.5, '#35E08A'); bar.addColorStop(1, '#F5A524');
  g.fillStyle = bar; g.fillRect(0, 0, W, 12);

  // 品牌
  g.fillStyle = '#35E08A'; g.font = `700 34px ${F}`;
  g.fillText('PropFirmTW · PFTW', 80, 110);
  g.fillStyle = 'rgba(255,255,255,.45)'; g.font = `500 30px ${F}`;
  g.fillText('出金試算', 80, 160);

  // 標題
  g.fillStyle = '#FFFFFF'; g.font = `900 66px ${F}`;
  g.fillText(opts.title, 80, 270);
  g.fillStyle = 'rgba(255,255,255,.6)'; g.font = `500 36px ${F}`;
  g.fillText(opts.sub, 80, 330);

  // 結果列
  let y = 420;
  for (const r of opts.rows) {
    round(g, 80, y, W - 160, 132, 24);
    g.fillStyle = 'rgba(255,255,255,.04)'; g.fill();
    g.fillStyle = 'rgba(255,255,255,.55)'; g.font = `500 32px ${F}`;
    g.fillText(r.label, 120, y + 80);
    g.fillStyle = r.color; g.font = `900 56px ${F}`;
    const w = g.measureText(r.value).width;
    g.fillText(r.value, W - 120 - w, y + 86);
    y += 152;
  }

  // 折扣碼 + 網址
  if (opts.code) {
    round(g, 80, H - 230, W - 160, 96, 48);
    g.fillStyle = 'rgba(53,224,138,.14)'; g.fill();
    g.fillStyle = '#35E08A'; g.font = `700 40px ${F}`;
    const t = `折扣碼 ${opts.code}`;
    g.fillText(t, (W - g.measureText(t).width) / 2, H - 168);
  }
  g.fillStyle = 'rgba(255,255,255,.4)'; g.font = `500 26px ${F}`;
  g.fillText(opts.foot, 80, H - 70);

  return new Promise((res) => c.toBlob((b) => res(b), 'image/png'));
}

export async function downloadCard(name: string, opts: Parameters<typeof makeCard>[0]) {
  const b = await makeCard(opts);
  if (b) download(name, b);
}

function round(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

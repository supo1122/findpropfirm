// 瀏覽器儲存：無痕視窗、封鎖 cookie、預覽截圖時 storage 可能丟例外，全部包起來。
// local＝跨次造訪都記得（試算器數字、一致性日誌）；session＝只在這個分頁（比較清單）。

function get<T>(area: 'local' | 'session', key: string, fallback: T): T {
  try {
    const raw = (area === 'local' ? localStorage : sessionStorage).getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function set(area: 'local' | 'session', key: string, value: unknown) {
  try {
    (area === 'local' ? localStorage : sessionStorage).setItem(key, JSON.stringify(value));
  } catch {
    /* 存不了就算了，頁面照常運作 */
  }
}

export const local = {
  get: <T,>(k: string, f: T) => get('local', k, f),
  set: (k: string, v: unknown) => set('local', k, v),
};
export const session = {
  get: <T,>(k: string, f: T) => get('session', k, f),
  set: (k: string, v: unknown) => set('session', k, v),
};

export const KEYS = {
  /** { daily: number, price: Record<'firm.plan.size', number> } */
  calc: 'pftw.calc.v1',
  /** Record<'firm.plan.size.phase', number[]> */
  cons: 'pftw.cons.v1',
  /** string[]：'firm.plan.size' */
  compare: 'pftw.compare.v1',
};

/** 讀網址參數（SSR 時沒有 window） */
export function qs(): URLSearchParams {
  return typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search);
}

/** 複製文字，舊瀏覽器退回 execCommand */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const t = document.createElement('textarea');
      t.value = text;
      document.body.appendChild(t);
      t.select();
      const ok = document.execCommand('copy');
      t.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/** 下載文字檔（一致性日誌匯出用） */
export function download(filename: string, content: Blob | string, type = 'application/json') {
  const blob = typeof content === 'string' ? new Blob([content], { type }) : content;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

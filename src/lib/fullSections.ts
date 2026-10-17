// 規則頁下半部「完整規則」摺疊段落的小行為（純 DOM，不經過 React）：
// 1. 「全部展開／收起」按鈕
// 2. 網址帶 #sec3 這種錨點（舊目錄、外部連結）→ 自動展開該段並捲過去
export function initFullSections() {
  const all = () => Array.from(document.querySelectorAll<HTMLDetailsElement>('.rules-full details.sec'));
  const btn = document.querySelector<HTMLButtonElement>('[data-open-all]');
  btn?.addEventListener('click', () => {
    const open = all().some((d) => !d.open);
    all().forEach((d) => (d.open = open));
    btn.textContent = open ? '全部收起' : '全部展開';
  });

  const openHash = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    const el = document.getElementById(id);
    const d = el instanceof HTMLDetailsElement ? el : el?.closest('details.sec');
    if (d instanceof HTMLDetailsElement) {
      d.open = true;
      requestAnimationFrame(() => (el ?? d).scrollIntoView({ block: 'start' }));
    }
  };
  window.addEventListener('hashchange', openHash);
  openHash();
}

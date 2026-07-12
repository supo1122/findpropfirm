import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NOTES as STATIC_NOTES } from '../data';

type Note = { tag: string; html: string };

// 固定右下角，用 y 位移淡入（不用百分比 x，避免跑到頁面外）
const boxStyle: React.CSSProperties = {
  position: 'fixed', right: 24, bottom: 96, zIndex: 7000, width: 'min(340px, 86vw)',
};

export default function NotificationBell() {
  const [off, setOff] = useState(() => localStorage.getItem('tw_notify_off') === '1');
  const [panel, setPanel] = useState(false);
  const [toast, setToast] = useState<'welcome' | number | null>(null);
  const [unread, setUnread] = useState(true);
  const [desktop, setDesktop] = useState(
    typeof Notification !== 'undefined' && Notification.permission === 'granted'
  );

  // 由後端爬蟲更新的 /news.json（各家 X 最新消息）；抓不到就用內建清單
  const [notes, setNotes] = useState<Note[]>(STATIC_NOTES);
  useEffect(() => {
    fetch('/news.json', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.items?.length) setNotes(d.items); })
      .catch(() => {});
  }, []);

  // 進站先通知：每個分頁(session)進來一定跳一次邀請/通知
  useEffect(() => {
    if (off) return;
    if (sessionStorage.getItem('tw_welcomed')) return;
    const t = setTimeout(() => {
      setToast(desktop ? 0 : 'welcome');
      sessionStorage.setItem('tw_welcomed', '1');
    }, 1500);
    return () => clearTimeout(t);
  }, [off]);

  // 自動收起（不再寫 24h 冷卻，避免下次完全沒通知）
  useEffect(() => {
    if (toast === null) return;
    const t = setTimeout(() => setToast(null), 8000);
    return () => clearTimeout(t);
  }, [toast]);

  const toggleOff = () => {
    const v = !off; setOff(v);
    localStorage.setItem('tw_notify_off', v ? '1' : '0');
  };

  const enableDesktop = async () => {
    if (typeof Notification === 'undefined') { setToast(0); return; }
    const p = await Notification.requestPermission();
    if (p === 'granted') {
      setDesktop(true);
      new Notification('PropFirmTW 通知已開啟', { body: '有新折扣或規則更新會通知你。' });
      setToast(0);
    } else {
      setToast(0); // 使用者拒絕桌面通知，仍給站內通知
    }
  };

  return (
    <>
      <button
        onClick={() => { setPanel((p) => !p); setUnread(false); }}
        className="glass-hover fixed bottom-6 right-6 z-[7000] h-14 w-14 rounded-full liquid-glass flex items-center justify-center text-2xl"
        aria-label="通知"
      >
        🔔
        {unread && !off && <span className="absolute top-2.5 right-3 h-2.5 w-2.5 rounded-full bg-[#F45B5B] animate-pulse" />}
      </button>

      {/* 進站通知 / 邀請 */}
      <AnimatePresence>
        {toast !== null && !off && (
          <motion.div
            style={boxStyle}
            className="liquid-glass rounded-2xl p-4"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {toast === 'welcome' ? (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-heading text-base">🔔 開啟通知</span>
                  <button onClick={() => setToast(null)} className="text-white/50 text-lg leading-none">×</button>
                </div>
                <p className="text-sm text-white/80 font-body mb-3">開啟後不錯過各家折扣倒數與規則更新。</p>
                <div className="flex gap-2">
                  <button onClick={enableDesktop}
                    className="glass-hover rounded-lg px-4 py-2 text-sm font-heading text-black" style={{ background: '#35E08A' }}>
                    開啟通知
                  </button>
                  <button onClick={() => setToast(null)} className="rounded-lg px-3 py-2 text-sm font-body text-white/60">稍後</button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-body text-[11px] text-[#35E08A] tracking-widest">// {notes[toast].tag}</span>
                  <button onClick={() => setToast(null)} className="text-white/50 text-lg leading-none">×</button>
                </div>
                <div className="text-sm" dangerouslySetInnerHTML={{ __html: notes[toast].html }} />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 通知面板 */}
      <AnimatePresence>
        {panel && (
          <motion.div
            style={{ ...boxStyle, maxHeight: '60vh', overflow: 'auto' }}
            className="liquid-glass rounded-2xl p-2"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
          >
            {notes.map((n, i) => (
              <div key={i} className="p-3.5 border-b border-white/10 last:border-0 text-sm">
                <span className="block font-body text-[11px] text-[#35E08A] mb-1">// {n.tag}</span>
                <span dangerouslySetInnerHTML={{ __html: n.html }} />
              </div>
            ))}
            <div className="px-3 py-3 space-y-2">
              <button onClick={enableDesktop} disabled={desktop}
                className="w-full glass-hover liquid-glass rounded-lg px-3 py-2.5 font-body text-sm text-left flex items-center gap-2 disabled:opacity-60">
                <span>🖥️</span>{desktop ? '桌面通知已開啟' : '開啟桌面通知（Windows / Google）'}
              </button>
              <div className="flex justify-between items-center px-1">
                <span className="font-body text-[10.5px] text-white/40">真實資訊 · 無假通知</span>
                <button onClick={toggleOff} className="font-body text-xs text-white/70">
                  {off ? '開啟站內通知' : '關閉站內通知'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

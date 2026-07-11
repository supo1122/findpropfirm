const DISCORD = 'https://discord.gg/YGWXTN7qcd';

/** 右下角、鈴鐺左側的圓形 Discord 客服鈕 */
export default function Discord() {
  return (
    <a
      href={DISCORD}
      target="_blank"
      rel="noopener"
      title="Discord 客服"
      aria-label="Discord 客服"
      className="glass-hover fixed bottom-6 z-[7000] h-14 w-14 rounded-full liquid-glass flex items-center justify-center"
      style={{ right: 92 }}
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="#8b9cff" aria-hidden="true">
        <path d="M19.27 5.33A16.5 16.5 0 0 0 15.1 4l-.2.4a15.3 15.3 0 0 1 3.7 1.2 15.6 15.6 0 0 0-13.2 0A15.3 15.3 0 0 1 9.1 4.4L8.9 4a16.5 16.5 0 0 0-4.17 1.33C2.07 9.28 1.35 13.13 1.7 16.92a16.7 16.7 0 0 0 5.06 2.56l.4-.55a12 12 0 0 1-1.83-.88l.45-.35a11.9 11.9 0 0 0 10.24 0l.45.35c-.58.35-1.2.65-1.84.88l.4.55a16.6 16.6 0 0 0 5.07-2.56c.42-4.4-.72-8.22-3.48-11.59zM8.5 14.75c-.99 0-1.8-.92-1.8-2.05s.8-2.05 1.8-2.05 1.82.93 1.8 2.05c0 1.13-.81 2.05-1.8 2.05zm7 0c-.99 0-1.8-.92-1.8-2.05s.8-2.05 1.8-2.05 1.82.93 1.8 2.05c0 1.13-.8 2.05-1.8 2.05z"/>
      </svg>
    </a>
  );
}

// ===== 規則頁／比較頁組裝 =====
// 原始長文在 src/pages-src/*.html（SEO 用的完整內容，gen-rules.mjs 也寫這裡）。
// 頁面 = 模板（rules.html / compare.html）
//      + 原始頁的 <head>（title、meta、canonical、JSON-LD）
//      + React 互動區（建置時預先畫好，瀏覽器端再接手）
//      + 原始長文，每個 h2 段落變成可摺疊的 <details>（預設收起，Google 一樣讀得到）
// dev 由 vite 中介層即時組裝；build 由 vite.config.ts 的 closeBundle 預先產生。

export type Page = { id: string; kind: 'rules' | 'compare'; src: string; out: string; template: string };

export const PAGES: Page[] = [
  ...['lucid', 'tradeify', 'tradeday', 'topstep', 'apex'].map((id) => ({
    id, kind: 'rules' as const, src: `src/pages-src/${id}.html`, out: `rules/${id}.html`, template: 'rules.html',
  })),
  { id: 'compare', kind: 'compare', src: 'src/pages-src/compare.html', out: 'compare.html', template: 'compare.html' },
];

type Section = { id: string; title: string; body: string };
type Parsed = { head: string; intro: string; sections: Section[]; tail: string; footer: string };

export function parseSource(html: string): Parsed {
  const head = (/<head>([\s\S]*?)<\/head>/.exec(html)?.[1] ?? '')
    .replace(/<meta charset="[^"]*">/i, '')
    .replace(/<meta name="viewport"[^>]*>/i, '')
    .replace(/<link rel="stylesheet" href="\/rules\/rules\.css">/, '')
    .trim();
  const main = /<main><div class="wrap">([\s\S]*?)<\/div><\/main>/.exec(html)?.[1] ?? '';
  const footer = /<footer>[\s\S]*?<\/footer>/.exec(html)?.[0] ?? '';

  let body = main.replace(/<nav class="toc"[\s\S]*?<\/nav>/, '');
  // 頁尾：購買區（改由 React 購買列取代）＋免責聲明
  const cut = body.search(/<div class="buy-cta"|<div class="disc"/);
  let tail = cut >= 0 ? body.slice(cut) : '';
  if (cut >= 0) body = body.slice(0, cut);
  tail = tail
    .replace(/<div class="buy-cta"[\s\S]*?<a class="buy-btn"[\s\S]*?<\/a>\s*<\/div>/, '')
    .replace(/<a class="back"[^>]*>[\s\S]*?<\/a>/, '')
    .trim();

  const parts = body.split(/(?=<h2[\s>])/);
  const intro = (parts.shift() ?? '').trim();
  const sections = parts.map((p, i) => {
    const m = /^<h2([^>]*)>([\s\S]*?)<\/h2>/.exec(p)!;
    return { id: /id="([^"]+)"/.exec(m[1])?.[1] ?? `s${i + 1}`, title: m[2].trim(), body: p.slice(m[0].length).trim() };
  });
  return { head, intro, sections, tail, footer };
}

function fullHtml(page: Page, p: Parsed): string {
  const sec = (id: string, title: string, body: string) =>
    `<details class="sec" id="${id}"><summary><h2>${title}</h2></summary><div class="sec-body">${body}</div></details>`;
  const intro = p.intro
    ? sec('intro', `<span class="n">!</span> ${page.kind === 'compare' ? '這頁在比什麼' : '重點提醒'}`, p.intro)
    : '';
  return `<section class="rules-full" id="full"><div class="wrap">
<div class="full-hd"><b>📖 完整${page.kind === 'compare' ? '說明' : '規則'}</b><span>點標題展開細節</span><button type="button" data-open-all>全部展開</button></div>
${intro}
${p.sections.map((s) => sec(s.id, s.title, s.body)).join('\n')}
${p.tail}
</div>${p.footer}</section>`;
}

/** 把模板的佔位符換掉。一律用函式取代，避免內容裡的 $98、$1 被當成 replace 的特殊符號 */
export function assemble(template: string, page: Page, parsed: Parsed, appHtml = ''): string {
  return template
    .replace('<!--HEAD-->', () => parsed.head)
    .replace('__PAGE__', () => page.id)
    .replace('<!--APP-->', () => appHtml)
    .replace('<!--FULL-->', () => fullHtml(page, parsed));
}

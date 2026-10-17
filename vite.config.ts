import fs from 'node:fs';
import path from 'node:path';
import { createServer, defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { PAGES, assemble, parseSource } from './build/pages';

/** dev：/rules/lucid.html、/compare.html 即時用模板 + 原始長文組出來（React 區由瀏覽器渲染） */
function pagesDev(): Plugin {
  return {
    name: 'pftw-pages-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url ?? '').split('?')[0];
        const page = PAGES.find((p) => `/${p.out}` === url);
        if (!page) return next();
        try {
          const html = assemble(fs.readFileSync(page.template, 'utf8'), page, parseSource(fs.readFileSync(page.src, 'utf8')));
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(await server.transformIndexHtml(req.url ?? url, html));
        } catch (e) {
          next(e);
        }
      });
    },
  };
}

/** build：打包完後，用 SSR 把每頁的 React 區預先畫成 HTML，寫進 dist（網址維持 /rules/xxx.html） */
function pagesPrerender(): Plugin {
  let outDir = 'dist';
  let failed = false;
  return {
    name: 'pftw-pages-prerender',
    apply: 'build',
    configResolved(c) { outDir = c.build.outDir; },
    buildEnd(err) { failed = !!err; },
    async closeBundle() {
      if (failed) return; // 打包本身失敗時別再丟錯，免得蓋掉真正的錯誤訊息
      const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
      try {
        const { render } = await server.ssrLoadModule('/src/entry-server.tsx');
        const templates: Record<string, string> = {};
        for (const p of PAGES) templates[p.template] ??= fs.readFileSync(path.join(outDir, p.template), 'utf8');
        for (const p of PAGES) {
          const html = assemble(templates[p.template], p, parseSource(fs.readFileSync(p.src, 'utf8')), render(p.kind, p.id));
          const file = path.join(outDir, p.out);
          fs.mkdirSync(path.dirname(file), { recursive: true });
          fs.writeFileSync(file, html);
        }
        fs.rmSync(path.join(outDir, 'rules.html'), { force: true }); // 純模板，不上線
        console.log(`✓ 預先產生 ${PAGES.length} 頁：${PAGES.map((p) => p.out).join('、')}`);
      } finally {
        await server.close();
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), pagesDev(), pagesPrerender()],
  build: {
    rollupOptions: {
      input: { main: 'index.html', rules: 'rules.html', compare: 'compare.html' },
    },
  },
});

// 建置時用：把規則頁／比較頁的 React 區畫成 HTML 字串（vite.config.ts 的 pagesPrerender 呼叫）
import { renderToString } from 'react-dom/server';
import CompareApp from './compare/CompareApp';
import RulesApp from './rules/RulesApp';

export function render(kind: 'rules' | 'compare', id: string): string {
  return renderToString(kind === 'compare' ? <CompareApp /> : <RulesApp firmId={id} />);
}

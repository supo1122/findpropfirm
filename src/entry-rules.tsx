import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import RulesApp from './rules/RulesApp';
import { initFullSections } from './lib/fullSections';
import './index.css';
import './styles/rules-full.css';

const el = document.getElementById('app')!;
const app = (
  <React.StrictMode>
    <RulesApp firmId={el.dataset.page!} />
  </React.StrictMode>
);
// 正式站：HTML 已預先畫好 → 接手（hydrate）；dev：空的 → 直接畫
if (el.hasChildNodes()) hydrateRoot(el, app);
else createRoot(el).render(app);
initFullSections();

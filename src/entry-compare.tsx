import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import CompareApp from './compare/CompareApp';
import { initFullSections } from './lib/fullSections';
import './index.css';
import './styles/rules-full.css';

const el = document.getElementById('app')!;
const app = (
  <React.StrictMode>
    <CompareApp />
  </React.StrictMode>
);
if (el.hasChildNodes()) hydrateRoot(el, app);
else createRoot(el).render(app);
initFullSections();

import React from 'react';
import ReactDOM from 'react-dom/client';
import '@/app/config/i18n';
import { applyThemeTokens } from '@/app/config';
import '@/assets/styles/tokens.css';
import { App } from '@/app/app';
applyThemeTokens('light');
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

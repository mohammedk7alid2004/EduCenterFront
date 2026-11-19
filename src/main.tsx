import React from 'react';
import ReactDOM from 'react-dom/client';
import './infrastructure/i18n';
import { applyThemeTokens } from '@/config';
import '@/shared/styles/tokens.css';
import { App } from '@/app/app';
applyThemeTokens('light');
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

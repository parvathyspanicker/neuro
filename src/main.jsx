import React from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import ErrorBoundary from './components/ErrorBoundary.jsx';

const rootEl = document.getElementById('root');
if (rootEl) {
  try {
    rootEl.setAttribute('data-status', 'booting');
  } catch {}
}

import('./App.jsx')
  .then(({ default: App }) => {
    ReactDOM.createRoot(rootEl).render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
  })
  .catch((error) => {
    const pre = document.createElement('pre');
    pre.style.whiteSpace = 'pre-wrap';
    pre.style.background = '#fee2e2';
    pre.style.color = '#991b1b';
    pre.style.padding = '12px';
    pre.style.border = '1px solid #fecaca';
    pre.style.borderRadius = '8px';
    pre.style.margin = '12px';
    pre.textContent = '[Failed to load App.jsx] ' + (error?.stack || String(error));
    document.body.prepend(pre);
  });



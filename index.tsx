import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

const rootElement = document.getElementById('root');

// Global Error Handler for Popup Debugging
window.onerror = function (message, source, lineno, colno, error) {
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red; font-family: monospace; overflow: auto;">
        <h3>Initialization Error</h3>
        <p><strong>Message:</strong> ${message}</p>
        <p><strong>Source:</strong> ${source}:${lineno}:${colno}</p>
        <pre>${error?.stack || ''}</pre>
        <button onclick="window.location.reload()">Reload</button>
      </div>
    `;
  }
};

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (e: any) {
  console.error("Render Error:", e);
  if (rootElement) {
    rootElement.innerHTML = `<div style="padding: 1rem; color: red;">Failed to render app: ${e.message}</div>`;
  }
}
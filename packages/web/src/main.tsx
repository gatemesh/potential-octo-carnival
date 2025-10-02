import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { TestApp } from './TestApp';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Add global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Ensure root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

// Add loading indicator
rootElement.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: system-ui;"><div>Loading GateMesh...</div></div>';

// Use test app if there's a URL parameter
const useTestApp = new URLSearchParams(window.location.search).has('test');

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        {useTestApp ? <TestApp /> : <App />}
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  rootElement.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: system-ui; flex-direction: column; gap: 16px;">
      <h1 style="color: red; margin: 0;">Application Error</h1>
      <p>Failed to start the application. Please check the console for details.</p>
      <button onclick="window.location.reload()" style="padding: 8px 16px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer;">Refresh Page</button>
    </div>
  `;
}
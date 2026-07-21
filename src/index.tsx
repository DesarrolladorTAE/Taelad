import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';

import App from './App';
import reportWebVitals from './reportWebVitals';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'No se encontró el elemento raíz con id="root".'
  );
}

const root = ReactDOM.createRoot(
  rootElement as HTMLElement
);

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);

reportWebVitals();
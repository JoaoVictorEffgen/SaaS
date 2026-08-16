import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// O carregamento inicial do HTML não deve bloquear a interface caso recursos
// externos (por exemplo, fontes) atrasem o evento `window.load`.
const initialLoader = document.getElementById('loading');
if (initialLoader) {
  initialLoader.style.opacity = '0';
  window.setTimeout(() => {
    initialLoader.style.display = 'none';
  }, 300);
}

// Em desenvolvimento, não manter um Service Worker antigo em cache: ele pode
// servir um bundle desatualizado após uma alteração de estilos. O PWA continua
// ativo nas builds de produção.
if (process.env.NODE_ENV === 'production') {
  serviceWorkerRegistration.register();
} else {
  serviceWorkerRegistration.unregister();
}

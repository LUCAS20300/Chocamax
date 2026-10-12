import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Registra o Service Worker para suporte PWA offline
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch((err) => {
      console.log('SW registration notice:', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(<App />);

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// --- Auto-recuperacion de "chunk load failed" ---
// Mismo mecanismo que ya probamos en la app principal: si alguien
// tiene la pestaña abierta desde antes de un deploy nuevo, fuerza
// UN solo reload automático (con bandera para no hacer loop).
function isChunkLoadError(message = '') {
  return (
    /Failed to fetch dynamically imported module/i.test(message) ||
    /Failed to load module script/i.test(message) ||
    /Importing a module script failed/i.test(message) ||
    /error loading dynamically imported module/i.test(message)
  );
}

function handlePossibleChunkError(message) {
  if (!isChunkLoadError(message)) return;
  const flag = 'camino_chunk_reload_attempted';
  if (sessionStorage.getItem(flag)) return;
  sessionStorage.setItem(flag, '1');
  window.location.reload();
}

window.addEventListener('error', (e) => {
  handlePossibleChunkError(e?.message || '');
});

window.addEventListener('unhandledrejection', (e) => {
  handlePossibleChunkError(e?.reason?.message || String(e?.reason || ''));
});

window.addEventListener('load', () => {
  setTimeout(() => sessionStorage.removeItem('camino_chunk_reload_attempted'), 3000);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

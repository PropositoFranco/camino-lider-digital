import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseCamino as supabase } from '../../services/supabaseCamino';
import teleprompterHtml from './teleprompter.html?raw';

/*
  Envoltorio protegido para el Teleprompter del Templo.

  - El HTML/CSS/JS del teleprompter (teleprompter.html) vive dentro de
    src/features/camino/, NO en /public. Por lo tanto nunca se sirve como
    archivo suelto: se importa como texto (?raw, soportado nativamente por
    Vite) y solo llega al navegador empaquetado dentro del chunk de ESTA
    página, que a su vez solo se descarga cuando el router visita esta ruta.
  - Esta página verifica sesión igual que CaminoParticipanteHomePage: si no
    hay sesión activa, redirige a login antes de mostrar nada. Así la
    protección es la misma que ya usa el resto de "camino/participante",
    no un mecanismo nuevo.
  - El teleprompter se monta en un <iframe srcDoc=...>, así su HTML/CSS/JS
    queda completamente aislado del árbol de React (cero riesgo de choque
    de estilos o de scripts) y se comporta EXACTAMENTE igual que el archivo
    original, sin tocar ni una línea de su lógica interna.
*/

export default function CaminoParticipanteTeleprompterPage() {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [herramientaAbierta, setHerramientaAbierta] = useState(false);

  useEffect(() => {
    let activo = true;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!activo) return;
      if (!sessionData?.session) {
        navigate('/camino/participante/login', { replace: true });
        return;
      }
      setAutorizado(true);
      setCargando(false);
    })();
    return () => { activo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // El teleprompter (dentro del iframe) avisa por postMessage cuando el
  // usuario entra o sale de su pantalla de cámara/lectura. Mientras esté
  // abierta, escondemos el "← Volver" de afuera para que no se encimen dos
  // botones de regreso — el único botón de regreso visible en esa pantalla
  // es el propio del teleprompter, reubicado junto a los demás controles.
  useEffect(() => {
    function alRecibirMensaje(evento) {
      const datos = evento.data;
      if (!datos || datos.source !== 'propotp-teleprompter') return;
      if (datos.type === 'open') setHerramientaAbierta(true);
      else if (datos.type === 'close') setHerramientaAbierta(false);
    }
    window.addEventListener('message', alRecibirMensaje);
    return () => window.removeEventListener('message', alRecibirMensaje);
  }, []);

  if (cargando || !autorizado) {
    return (
      <div style={estilos.cargando}>
        <style>{'@keyframes tp-girar{to{transform:rotate(360deg);}}'}</style>
        <div style={estilos.spinner} />
      </div>
    );
  }

  return (
    <div style={estilos.envoltorio}>
      {!herramientaAbierta && (
        <button
          onClick={() => navigate(-1)}
          style={estilos.volver}
          aria-label="Volver"
          title="Volver"
        >
          ← Volver
        </button>
      )}
      <iframe
        title="Teleprompter del Templo"
        srcDoc={teleprompterHtml}
        style={estilos.iframe}
        allow="camera; microphone"
      />
    </div>
  );
}

const estilos = {
  envoltorio: {
    position: 'fixed',
    inset: 0,
    width: '100vw',
    height: '100dvh',
    background: '#07040c',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
    display: 'block',
  },
  volver: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 20,
    padding: '8px 14px',
    borderRadius: 9,
    border: '1px solid rgba(212,175,55,0.4)',
    background: 'rgba(4,2,14,0.72)',
    color: '#FFE566',
    fontFamily: "'Cinzel', serif",
    fontWeight: 900,
    fontSize: 11.5,
    letterSpacing: '0.5px',
    cursor: 'pointer',
  },
  cargando: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#07040c',
  },
  spinner: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    border: '2.5px solid rgba(212,175,55,0.4)',
    borderTopColor: '#D4AF37',
    animation: 'tp-girar 0.8s linear infinite',
  },
};

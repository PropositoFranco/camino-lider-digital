// ════════════════════════════════════════════════════════════════════════
// CaminoVideoPlayer.jsx
//
// Reproductor para el participante, en la tarjeta de cada día del
// Calendario del Camino. Apunta a la Video Library INDEPENDIENTE del
// Camino (733285) — nunca a la 673293 de Academia.
//
// A partir de esta versión, un día puede ser:
//   - tipo_contenido = 'video'       -> reproduce el video de Bunny (igual que antes)
//   - tipo_contenido = 'redireccion' -> el contenido vive fuera (ej. una publicación
//                                       de Instagram) y se muestra una tarjeta que
//                                       invita a abrirlo en una pestaña nueva.

import { supabaseCamino } from '../../services/supabaseCamino';
import { useState, useEffect } from 'react';

const BUNNY_LIBRARY_ID_CAMINO = '733285';

const MENSAJES = {
  sin_video: 'Este día del Camino aún no libera su video.',
  subiendo: 'El video está subiendo al Bunny…',
  procesando: 'El video se está forjando. Vuelve en unos minutos.',
  error: 'Hubo un fallo al procesar este video. Avísale a tu gestor.',
};

export default function CaminoVideoPlayer({ diaNumero }) {
  const [fila, setFila] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let canal;

    const cargar = async () => {
      const { data } = await supabaseCamino
        .from('camino_calendario_videos')
        .select('video_id, video_estado, titulo, tipo_contenido, enlace_externo')
        .eq('dia_numero', diaNumero)
        .maybeSingle();

      setFila(data || null);
      setCargando(false);
    };

    cargar();

    canal = supabaseCamino
      .channel(`camino_video_player_dia_${diaNumero}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'camino_calendario_videos',
          filter: `dia_numero=eq.${diaNumero}`,
        },
        (payload) => setFila(payload.new),
      )
      .subscribe();

    return () => {
      if (canal) supabaseCamino.removeChannel(canal);
    };
  }, [diaNumero]);

  if (cargando) {
    return (
      <div style={estilos.marco}>
        <style>{`@keyframes caminoPulso { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
        <div style={estilos.pulso} />
      </div>
    );
  }

  const esRedireccion = fila?.tipo_contenido === 'redireccion';

  // ── Tarjeta de redireccionamiento (ej. publicación de Instagram) ──
  if (esRedireccion && fila.enlace_externo) {
    return (
      <a
        href={fila.enlace_externo}
        target="_blank"
        rel="noopener noreferrer"
        style={estilos.marcoRedireccion}
      >
        <style>{`
          @keyframes caminoGlow { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }
          .camino-redir-sello { animation: caminoGlow 2.6s ease-in-out infinite; }
          .camino-redir-card:hover .camino-redir-boton { background: rgba(212,175,55,0.22) !important; border-color: rgba(212,175,55,0.6) !important; }
        `}</style>
        <div className="camino-redir-card" style={estilos.redireccionContenido}>
          <div className="camino-redir-sello" style={estilos.redireccionSello}>◈</div>
          <p style={estilos.redireccionEyebrow}>Contenido especial del día</p>
          <h4 style={estilos.redireccionTitulo}>{fila.titulo || 'Publicación del Camino'}</h4>
          <div className="camino-redir-boton" style={estilos.redireccionBoton}>
            Ver publicación en Instagram
            <span style={{ fontSize: '13px' }}>↗</span>
          </div>
        </div>
      </a>
    );
  }

  // ── Video normal de Bunny ──
  const estado = fila?.video_estado || 'sin_video';
  const listoParaVer = estado === 'listo' || estado === 'reproducible';

  if (listoParaVer && fila.video_id) {
    return (
      <div style={estilos.marco}>
        <iframe
          src={`https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID_CAMINO}/${fila.video_id}?autoplay=false&preload=true`}
          loading="lazy"
          style={estilos.iframe}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          title={fila.titulo || `Video del día ${diaNumero}`}
        />
      </div>
    );
  }

  return (
    <div style={{ ...estilos.marco, ...estilos.placeholder }}>
      <div style={estilos.iconoSello}>◈</div>
      <p style={estilos.mensaje}>{MENSAJES[estado] || MENSAJES.sin_video}</p>
    </div>
  );
}

const estilos = {
  marco: {
    position: 'relative',
    width: '100%',
    aspectRatio: '16 / 9',
    borderRadius: '14px',
    overflow: 'hidden',
    background: '#04020E',
    border: '1px solid rgba(212, 175, 55, 0.2)',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
  placeholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '20px',
    textAlign: 'center',
    border: '1px dashed rgba(212, 175, 55, 0.35)',
  },
  iconoSello: {
    fontSize: '28px',
    color: '#D4AF37',
    opacity: 0.7,
  },
  mensaje: {
    fontFamily: "'Nunito', sans-serif",
    color: '#8a7fb0',
    fontSize: '13px',
    maxWidth: '260px',
    margin: 0,
  },
  pulso: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(90deg, #0a0614 25%, #150d28 50%, #0a0614 75%)',
    backgroundSize: '200% 100%',
    animation: 'caminoPulso 1.4s infinite',
  },

  // ── Estilos de la tarjeta de redireccionamiento ──
  marcoRedireccion: {
    position: 'relative',
    width: '100%',
    aspectRatio: '16 / 9',
    borderRadius: '14px',
    overflow: 'hidden',
    display: 'block',
    textDecoration: 'none',
    background:
      'radial-gradient(circle at 20% 15%, rgba(155,89,255,0.28), transparent 55%), ' +
      'radial-gradient(circle at 85% 90%, rgba(212,175,55,0.20), transparent 55%), ' +
      '#0e0818',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    cursor: 'pointer',
  },
  redireccionContenido: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '20px',
    textAlign: 'center',
  },
  redireccionSello: {
    fontSize: '30px',
    color: '#D4AF37',
    textShadow: '0 0 18px rgba(212,175,55,0.65)',
  },
  redireccionEyebrow: {
    fontFamily: "'Cinzel', serif",
    fontWeight: 700,
    fontSize: '10px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: '#9b59ff',
    margin: 0,
  },
  redireccionTitulo: {
    fontFamily: "'Cinzel', serif",
    fontWeight: 900,
    fontSize: '17px',
    color: '#f0eaff',
    margin: '2px 0 6px',
    maxWidth: '320px',
  },
  redireccionBoton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    borderRadius: '10px',
    background: 'rgba(212,175,55,0.12)',
    border: '1px solid rgba(212,175,55,0.4)',
    color: '#FFE566',
    fontFamily: "'Cinzel', serif",
    fontWeight: 700,
    fontSize: '11px',
    letterSpacing: '1px',
    transition: 'background .15s ease, border-color .15s ease',
  },
};
// ════════════════════════════════════════════════════════════════════════
// CaminoTutorialPlayer.jsx
//
// Reproductor del video "VER TUTORIAL" de cada día del Calendario del
// Camino. Es una copia exacta de CaminoVideoPlayer.jsx — misma Video
// Library de Bunny (733285), mismo mecanismo — pero lee las columnas
// tutorial_video_id / tutorial_video_estado / tutorial_titulo en vez de
// video_id / video_estado / titulo. No toca ni comparte estado con el
// video principal del ritual.

import { supabaseCamino } from '../../services/supabaseCamino';
import { useState, useEffect } from 'react';

const BUNNY_LIBRARY_ID_CAMINO = '733285';

const MENSAJES = {
  sin_video: 'Este día todavía no tiene tutorial cargado.',
  subiendo: 'El tutorial está subiendo al Bunny…',
  procesando: 'El tutorial se está forjando. Vuelve en unos minutos.',
  error: 'Hubo un fallo al procesar este tutorial. Avísale a tu gestor.',
};

export default function CaminoTutorialPlayer({ diaNumero }) {
  const [fila, setFila] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let canal;

    const cargar = async () => {
      const { data } = await supabaseCamino
        .from('camino_calendario_videos')
        .select('tutorial_video_id, tutorial_video_estado, tutorial_titulo')
        .eq('dia_numero', diaNumero)
        .maybeSingle();

      setFila(data || null);
      setCargando(false);
    };

    cargar();

    canal = supabaseCamino
      .channel(`camino_tutorial_player_dia_${diaNumero}`)
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
        <style>{`@keyframes caminoTutorialPulso { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
        <div style={estilos.pulso} />
      </div>
    );
  }

  const estado = fila?.tutorial_video_estado || 'sin_video';
  const listoParaVer = estado === 'listo' || estado === 'reproducible';

  if (listoParaVer && fila.tutorial_video_id) {
    return (
      <div style={estilos.marco}>
        <iframe
          src={`https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID_CAMINO}/${fila.tutorial_video_id}?autoplay=false&preload=true`}
          loading="lazy"
          style={estilos.iframe}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          title={fila.tutorial_titulo || `Tutorial del día ${diaNumero}`}
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
    animation: 'caminoTutorialPulso 1.4s infinite',
  },
};
// ════════════════════════════════════════════════════════════════════════
// CaminoVideoUploader.jsx
//
// Uploader épico para gestores del Camino a Líder Digital. Sube el video
// DIRECTO al navegador → Bunny Stream (protocolo TUS resumable).
//
// Requiere: npm install tus-js-client

import { supabase } from '../../services/supabase';
import * as tus from 'tus-js-client';
import { useState, useEffect, useRef } from 'react';

const ESTADO_LABELS = {
  sin_video: 'Sin video',
  subiendo: 'Subiendo al Bunny…',
  procesando: 'El video se está forjando…',
  listo: 'Listo',
  reproducible: 'Reproducible',
  error: 'Falló la forja',
};

export default function CaminoVideoUploader({ diaNumero, tituloDefault = '', onEstadoCambia }) {
  const [titulo, setTitulo] = useState(tituloDefault);
  const [archivo, setArchivo] = useState(null);
  const [progreso, setProgreso] = useState(0);
  const [subiendo, setSubiendo] = useState(false);
  const [estado, setEstado] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const uploadRef = useRef(null);

  useEffect(() => {
    let canal;

    const cargarEstado = async () => {
      const { data } = await supabase
        .from('camino_calendario_videos')
        .select('video_estado, video_id, titulo')
        .eq('dia_numero', diaNumero)
        .maybeSingle();

      if (data) {
        setEstado(data.video_estado);
        if (!tituloDefault && data.titulo) setTitulo(data.titulo);
      } else {
        setEstado('sin_video');
      }
    };

    cargarEstado();

    canal = supabase
      .channel(`camino_video_dia_${diaNumero}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'camino_calendario_videos',
          filter: `dia_numero=eq.${diaNumero}`,
        },
        (payload) => {
          const nuevoEstado = payload.new.video_estado;
          setEstado(nuevoEstado);
          onEstadoCambia?.(nuevoEstado, payload.new.video_id);
        },
      )
      .subscribe();

    return () => {
      if (canal) supabase.removeChannel(canal);
    };
  }, [diaNumero]);

  const iniciarSubida = async () => {
    if (!archivo || !titulo.trim()) {
      setErrorMsg('Falta el título o el archivo.');
      return;
    }
    setErrorMsg('');
    setSubiendo(true);
    setProgreso(0);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/camino-video-upload-init`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ titulo: titulo.trim(), dia_numero: diaNumero }),
        },
      );

      const init = await resp.json();
      if (!resp.ok) throw new Error(init.error || 'No se pudo iniciar la subida');

      const { videoId, libraryId, signature, expiration, uploadEndpoint } = init;

      const upload = new tus.Upload(archivo, {
        endpoint: uploadEndpoint,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          AuthorizationSignature: signature,
          AuthorizationExpire: String(expiration),
          VideoId: videoId,
          LibraryId: String(libraryId),
        },
        metadata: {
          filetype: archivo.type,
          title: titulo.trim(),
        },
        onError: (err) => {
          setSubiendo(false);
          setErrorMsg(`Error al subir: ${err.message || err}`);
        },
        onProgress: (bytesSubidos, bytesTotal) => {
          setProgreso(Math.round((bytesSubidos / bytesTotal) * 100));
        },
        onSuccess: () => {
          setSubiendo(false);
          setEstado('procesando');
          setArchivo(null);
        },
      });

      uploadRef.current = upload;
      upload.start();
    } catch (err) {
      setSubiendo(false);
      setErrorMsg(err.message || String(err));
    }
  };

  return (
    <div style={estilos.contenedor}>
      <div style={estilos.encabezado}>
        <span style={estilos.sello}>Día {diaNumero}</span>
        <span style={{ ...estilos.badge, ...badgePorEstado(estado) }}>
          {ESTADO_LABELS[estado] || 'Cargando…'}
        </span>
      </div>

      <input
        type="text"
        placeholder="Título del video"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        disabled={subiendo}
        style={estilos.input}
      />

      <label style={estilos.dropzone}>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setArchivo(e.target.files?.[0] || null)}
          disabled={subiendo}
          style={{ display: 'none' }}
        />
        {archivo ? (
          <span style={{ color: '#D4AF37' }}>{archivo.name}</span>
        ) : (
          <span style={{ color: '#8a7fb0' }}>Toca para elegir el video del ritual</span>
        )}
      </label>

      {subiendo && (
        <div style={estilos.barraFondo}>
          <div style={{ ...estilos.barraRelleno, width: `${progreso}%` }} />
          <span style={estilos.barraTexto}>{progreso}%</span>
        </div>
      )}

      {errorMsg && <p style={estilos.error}>{errorMsg}</p>}

      <button
        onClick={iniciarSubida}
        disabled={subiendo || !archivo}
        style={{
          ...estilos.boton,
          opacity: subiendo || !archivo ? 0.5 : 1,
          cursor: subiendo || !archivo ? 'not-allowed' : 'pointer',
        }}
      >
        {subiendo ? 'Forjando…' : 'Sellar y subir al Bunny'}
      </button>
    </div>
  );
}

function badgePorEstado(estado) {
  switch (estado) {
    case 'listo':
    case 'reproducible':
      return { background: 'rgba(52, 211, 153, 0.15)', color: '#34D399', borderColor: '#34D399' };
    case 'error':
      return { background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', borderColor: '#EF4444' };
    case 'subiendo':
    case 'procesando':
      return { background: 'rgba(212, 175, 55, 0.15)', color: '#D4AF37', borderColor: '#D4AF37' };
    default:
      return { background: 'rgba(138, 127, 176, 0.15)', color: '#8a7fb0', borderColor: '#8a7fb0' };
  }
}

const estilos = {
  contenedor: {
    background: '#0a0614',
    border: '1px solid rgba(212, 175, 55, 0.25)',
    borderRadius: '14px',
    padding: '20px',
    fontFamily: "'Nunito', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  encabezado: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sello: {
    fontFamily: "'Cinzel', serif",
    color: '#D4AF37',
    fontSize: '15px',
    letterSpacing: '0.05em',
  },
  badge: {
    fontSize: '11px',
    padding: '4px 10px',
    borderRadius: '999px',
    border: '1px solid',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  input: {
    background: '#150d28',
    border: '1px solid rgba(204, 68, 255, 0.25)',
    borderRadius: '8px',
    padding: '10px 12px',
    color: '#EAE3F5',
    fontSize: '14px',
    outline: 'none',
  },
  dropzone: {
    border: '1px dashed rgba(212, 175, 55, 0.4)',
    borderRadius: '10px',
    padding: '18px',
    textAlign: 'center',
    cursor: 'pointer',
    fontSize: '13px',
  },
  barraFondo: {
    position: 'relative',
    height: '18px',
    background: '#150d28',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  barraRelleno: {
    height: '100%',
    background: 'linear-gradient(90deg, #CC44FF, #D4AF37)',
    transition: 'width 0.2s ease',
  },
  barraTexto: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    color: '#EAE3F5',
  },
  error: {
    color: '#EF4444',
    fontSize: '13px',
    margin: 0,
  },
  boton: {
    fontFamily: "'Cinzel', serif",
    background: 'linear-gradient(135deg, #CC44FF, #7A1FA2)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '12px',
    fontSize: '14px',
    letterSpacing: '0.05em',
  },
};

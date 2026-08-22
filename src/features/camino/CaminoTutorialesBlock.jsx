import { useState, useEffect, useRef } from 'react';
import { supabaseCamino } from '../../services/supabaseCamino';

// Cada tutorial: sus pasos (imagen + dónde poner el cursor animado + texto).
// cursor: {x, y} en % sobre la imagen, donde debe "tocar" el dedo animado.
const TUTORIALES = [
  {
    id: 'link_publico',
    icono: '📤',
    titulo: 'Sacar el link público de tu video',
    pasos: [
      { texto: 'Abre tu video ya publicado y busca el ícono de compartir', cursor: { x: 95, y: 68 } },
      { texto: 'Toca "Copiar enlace" en el menú que aparece', cursor: { x: 12, y: 87 } },
      { texto: '¡Listo! Ya está copiado, pégalo donde lo necesites', cursor: { x: 12, y: 87 } },
    ],
  },
  {
    id: 'subtitulos',
    icono: '💬',
    titulo: 'Subtítulos automáticos',
    pasos: [
      { texto: 'Antes de publicar, busca el botón de "Subtítulos" (ícono CC) en la barra de edición', cursor: { x: 69, y: 83 } },
      { texto: 'Tócalo — la app los genera solos en unos segundos', cursor: { x: 50, y: 45 } },
      { texto: 'Revisa que no haya quedado mal escrita alguna palabra y publica normal', cursor: { x: 84, y: 96 } },
    ],
  },
  {
    id: 'checkin_fallido',
    icono: '🛠️',
    titulo: 'Si falla el check-in',
    tipo: 'checklist',
    pasos: [
      { texto: 'Cierra la app o pestaña y vuelve a abrirla', icono: '🔄' },
      { texto: 'Revisa tu conexión a internet (wifi o datos)', icono: '📶' },
      { texto: 'Si sigue sin cargar, toca "Volver a intentar"', icono: '🔁' },
      { texto: 'Si nada funciona, escribe a tu gestor por WhatsApp con una captura del error', icono: '💬' },
    ],
  },
];

function TutorialDemo({ tutorial }) {
  const [urls, setUrls] = useState([]);
  const [paso, setPaso] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    let activo = true;
    (async () => {
      const { data } = await supabaseCamino
        .from('camino_recursos')
        .select('url_archivo, orden')
        .eq('tipo', 'tutorial')
        .eq('categoria', tutorial.id)
        .eq('activo', true)
        .order('orden', { ascending: true });
      if (activo) {
        setUrls((data || []).map((d) => d.url_archivo));
        setLoading(false);
      }
    })();
    return () => { activo = false; };
  }, [tutorial.id]);

  useEffect(() => {
    if (!urls.length) return;
    timerRef.current = setInterval(() => {
      setPaso((p) => (p + 1) % tutorial.pasos.length);
    }, 2800);
    return () => clearInterval(timerRef.current);
  }, [urls, tutorial.pasos.length]);

  if (loading) return <div className="ctb-status">Cargando demo…</div>;
  if (!urls.length) return <div className="ctb-status">Aún no hay capturas para este tutorial.</div>;

  const pasoActual = tutorial.pasos[paso];

  return (
    <div className="ctb-demo">
      <div className="ctb-phone">
        {urls.map((u, i) => (
          <img
            key={u}
            src={u}
            alt=""
            className={`ctb-phone-img${i === paso ? ' activa' : ''}`}
          />
        ))}
        <div
          className="ctb-cursor"
          style={{ left: `${pasoActual.cursor.x}%`, top: `${pasoActual.cursor.y}%` }}
        >
          <div className="ctb-cursor-ripple" />
          👆
        </div>
      </div>

      <div className="ctb-caption-row">
        {tutorial.pasos.map((_, i) => (
          <span key={i} className={`ctb-dot${i === paso ? ' activo' : ''}`} />
        ))}
      </div>
      <p className="ctb-caption">{pasoActual.texto}</p>
    </div>
  );
}

function ChecklistDemo({ tutorial }) {
  const [marcados, setMarcados] = useState(() => tutorial.pasos.map(() => false));

  function toggle(i) {
    setMarcados((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  }

  return (
    <div className="ctb-checklist">
      {tutorial.pasos.map((paso, i) => {
        const esUltimo = i === tutorial.pasos.length - 1;
        const marcado = marcados[i];
        return (
          <div
            key={i}
            className={`ctb-check-item${esUltimo ? ' ctb-check-item--final' : ''}${marcado ? ' ctb-check-item--marcado' : ''}`}
            style={{ animationDelay: `${i * 0.12}s` }}
            onClick={() => toggle(i)}
            role="button"
            tabIndex={0}
          >
            {!esUltimo && <span className="ctb-check-line" />}
            <span className="ctb-check-num">
              <span className="ctb-check-icono">{paso.icono}</span>
              <span className="ctb-check-mark">✓</span>
            </span>
            <p className="ctb-check-texto">{paso.texto}</p>
          </div>
        );
      })}
      <p className="ctb-checklist-hint">Toca cada paso conforme lo intentes ✦</p>

      
        href="mailto:soyfrancocontupotencial@gmail.com?subject=Ayuda%20con%20mi%20check-in&body=Hola%20Franco%2C%20sigo%20sin%20poder%20hacer%20mi%20check-in.%20Esto%20es%20lo%20que%20pasa%3A%20"
        className="ctb-sos"
      >
        <span className="ctb-sos-icon">✉️</span>
        <span className="ctb-sos-text">
          <span className="ctb-sos-title">¿Sigue sin funcionar?</span>
          <span className="ctb-sos-sub">Escríbeme directo y lo resolvemos juntos</span>
        </span>
        <span className="ctb-sos-arrow">→</span>
      </a>
    </div>
  );
}
export default function CaminoTutorialesBlock() {
  const [activo, setActivo] = useState(TUTORIALES[0]?.id);
  const tutorial = TUTORIALES.find((t) => t.id === activo);

  return (
    <div className="ctb-wrap">
      <div className="ctb-header">
        <span className="ctb-icon">🎥</span>
        <div>
          <h3 className="ctb-title">Mini-Tutoriales</h3>
          <p className="ctb-subtitle">Mira exactamente dónde tocar — el cursor te lo muestra solo.</p>
        </div>
      </div>

      <div className="ctb-tabs">
        {TUTORIALES.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`ctb-tab${t.id === activo ? ' activo' : ''}`}
            onClick={() => setActivo(t.id)}
          >
            <span>{t.icono}</span> {t.titulo}
          </button>
        ))}
      </div>

      {tutorial && (
        tutorial.tipo === 'checklist'
          ? <ChecklistDemo tutorial={tutorial} />
          : <TutorialDemo key={tutorial.id} tutorial={tutorial} />
      )}

      <style>{`
        .ctb-wrap {
          width: 100%;
          padding: clamp(1rem, 3vw, 2rem);
          border-radius: 1.25rem;
          border: 1px solid var(--gold-dim, rgba(212,175,55,0.35));
          background: radial-gradient(120% 120% at 90% 0%, rgba(204,68,255,0.08), transparent 60%),
                      rgba(10, 8, 20, 0.55);
        }
        .ctb-header { display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 1.25rem; }
        .ctb-icon { font-size: clamp(1.5rem, 3vw, 2rem); }
        .ctb-title {
          font-family: 'Cinzel Decorative', serif; color: var(--gold-bright, #FFE566);
          font-size: clamp(1.1rem, 2.5vw, 1.5rem); margin: 0 0 0.25rem 0;
        }
        .ctb-subtitle {
          font-family: 'Crimson Text', serif; color: var(--lilac, rgba(200,185,240,0.68));
          font-size: clamp(0.85rem, 1.5vw, 1rem); margin: 0;
        }
        .ctb-status { font-family: 'Crimson Text', serif; color: var(--lilac, rgba(200,185,240,0.68)); padding: 1rem 0; }

        .ctb-tabs { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.25rem; }
        .ctb-tab {
          all: unset; cursor: pointer;
          font-family: 'Cinzel', serif; font-size: clamp(0.7rem, 1.4vw, 0.8rem);
          color: var(--lilac, rgba(200,185,240,0.68));
          border: 1px solid var(--gold-dim, rgba(212,175,55,0.3));
          border-radius: 2rem; padding: 0.4rem 0.9rem;
          display: flex; align-items: center; gap: 0.4rem;
          transition: all 0.2s ease;
        }
        .ctb-tab.activo {
          color: #0a0814; background: var(--gold-bright, #FFE566);
          border-color: var(--gold-bright, #FFE566);
        }

        .ctb-demo { display: flex; flex-direction: column; align-items: center; gap: 1rem; }

        /* Marco de teléfono — proporción relativa, no tamaño fijo en px */
        .ctb-phone {
          position: relative;
          width: min(100%, 18rem);
          aspect-ratio: 9 / 19.5;
          border-radius: 1.5rem;
          overflow: hidden;
          border: 3px solid var(--gold, #D4AF37);
          box-shadow: 0 0 0 1px rgba(212,175,55,0.2), 0 10px 30px rgba(0,0,0,0.6), 0 0 24px rgba(212,175,55,0.25);
          background: #000;
        }
        .ctb-phone-img {
          position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
          opacity: 0; transition: opacity 0.5s ease;
        }
        .ctb-phone-img.activa { opacity: 1; }

        .ctb-cursor {
          position: absolute;
          font-size: clamp(1.3rem, 4vw, 1.8rem);
          transform: translate(-50%, -50%);
          transition: left 0.9s cubic-bezier(.4,0,.2,1), top 0.9s cubic-bezier(.4,0,.2,1);
          filter: drop-shadow(0 0 6px rgba(0,0,0,0.8));
          z-index: 5;
        }
        .ctb-cursor-ripple {
          position: absolute; inset: 0; margin: auto;
          width: 2.2em; height: 2.2em; border-radius: 50%;
          border: 2px solid var(--gold-bright, #FFE566);
          transform: translate(-50%, -50%);
          left: 50%; top: 50%;
          animation: ctb-ping 1.4s ease-out infinite;
        }
        @keyframes ctb-ping {
          0% { transform: translate(-50%, -50%) scale(0.4); opacity: 0.9; }
          80% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
          100% { opacity: 0; }
        }

        .ctb-caption-row { display: flex; gap: 0.4rem; }
        .ctb-dot {
          width: 0.5rem; height: 0.5rem; border-radius: 50%;
          background: var(--gold-dim, rgba(212,175,55,0.3));
          transition: background 0.3s ease;
        }
        .ctb-dot.activo { background: var(--gold-bright, #FFE566); }

        .ctb-caption {
          font-family: 'Crimson Text', serif; text-align: center;
          color: #f0ead6; font-size: clamp(0.85rem, 1.6vw, 1rem);
          max-width: 22rem; min-height: 2.6em;
        }

        .ctb-checklist {
          display: flex; flex-direction: column;
          width: 100%; max-width: 26rem; margin: 0 auto;
        }
        .ctb-check-item {
          position: relative;
          display: flex; align-items: flex-start; gap: 0.85rem;
          padding: 0.85rem 1rem;
          margin-bottom: 0.6rem;
          border-radius: 0.85rem;
          border: 1px solid var(--gold-dim, rgba(212,175,55,0.3));
          background: rgba(255,255,255,0.03);
          cursor: pointer;
          user-select: none;
          opacity: 0; transform: translateY(0.6rem);
          animation: ctb-check-in 0.5s ease forwards;
          transition: border-color 0.25s ease, background 0.25s ease, transform 0.15s ease;
        }
        .ctb-check-item:hover { transform: translateY(-0.1rem); border-color: var(--gold-bright, #FFE566); }
        .ctb-check-item:active { transform: scale(0.98); }
        @keyframes ctb-check-in {
          to { opacity: 1; transform: translateY(0); }
        }
        .ctb-check-line {
          position: absolute; left: 1.85rem; top: 2.6rem; bottom: -0.6rem;
          width: 2px;
          background: linear-gradient(180deg, var(--gold-dim, rgba(212,175,55,0.3)), transparent);
          z-index: 0;
        }
        .ctb-check-item--marcado {
          border-color: rgba(120,255,180,0.5);
          background: rgba(120,255,180,0.06);
        }
        .ctb-check-item--final {
          border-color: var(--gold-bright, #FFE566);
          background: rgba(255,229,102,0.08);
          animation: ctb-check-in 0.5s ease forwards, ctb-final-pulse 2.4s ease-in-out infinite 1.2s;
        }
        .ctb-check-item--final.ctb-check-item--marcado { animation: ctb-check-in 0.5s ease forwards; }
        @keyframes ctb-final-pulse {
          0%, 100% { box-shadow: 0 0 0 rgba(255,229,102,0); }
          50% { box-shadow: 0 0 1.2rem rgba(255,229,102,0.35); }
        }
        .ctb-check-num {
          position: relative; z-index: 1; flex-shrink: 0;
          width: 2rem; height: 2rem; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem;
          background: var(--gold-bright, #FFE566);
          transition: background 0.25s ease, transform 0.3s ease;
        }
        .ctb-check-item--marcado .ctb-check-num { background: rgba(120,255,180,0.9); transform: scale(1.08); }
        .ctb-check-icono { transition: opacity 0.2s ease, transform 0.2s ease; }
        .ctb-check-mark {
          position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
          color: #0a0814; font-weight: 900; opacity: 0; transform: scale(0.5);
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .ctb-check-item--marcado .ctb-check-icono { opacity: 0; transform: scale(0.5); }
        .ctb-check-item--marcado .ctb-check-mark { opacity: 1; transform: scale(1); }
        .ctb-check-texto {
          font-family: 'Crimson Text', serif; color: #f0ead6;
          font-size: clamp(0.85rem, 1.6vw, 1rem); line-height: 1.4; margin: 0;
          transition: color 0.25s ease;
        }
        .ctb-check-item--marcado .ctb-check-texto {
          color: rgba(240,234,214,0.55);
          text-decoration: line-through;
          text-decoration-color: rgba(120,255,180,0.6);
        }
        .ctb-checklist-hint {
          text-align: center; font-family: 'Cinzel', serif; letter-spacing: 0.06em; text-transform: uppercase;
          font-size: 0.68rem; color: var(--lilac-dim, rgba(200,185,240,0.42)); margin-top: 0.4rem;
        }

        .ctb-sos {
          display: flex; align-items: center; gap: 0.9rem;
          margin-top: 1.25rem;
          padding: 1rem 1.1rem;
          border-radius: 1rem;
          border: 1px solid var(--gold, #D4AF37);
          background: linear-gradient(135deg, rgba(212,175,55,0.12), rgba(204,68,255,0.08));
          text-decoration: none;
          animation: ctb-sos-glow 3s ease-in-out infinite;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .ctb-sos:hover { transform: translateY(-0.15rem); border-color: var(--gold-bright, #FFE566); }
        .ctb-sos:active { transform: scale(0.98); }
        @keyframes ctb-sos-glow {
          0%, 100% { box-shadow: 0 0 0.4rem rgba(212,175,55,0.15); }
          50% { box-shadow: 0 0 1.4rem rgba(212,175,55,0.4); }
        }
        .ctb-sos-icon {
          flex-shrink: 0;
          width: 2.6rem; height: 2.6rem; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.3rem;
          background: var(--gold-bright, #FFE566);
          box-shadow: 0 0 0.8rem var(--gold-glow, rgba(212,175,55,0.5));
        }
        .ctb-sos-text { flex: 1; display: flex; flex-direction: column; gap: 0.15rem; }
        .ctb-sos-title {
          font-family: 'Cinzel', serif; font-weight: 900; font-size: clamp(0.85rem, 1.6vw, 0.95rem);
          color: var(--gold-bright, #FFE566);
        }
        .ctb-sos-sub {
          font-family: 'Crimson Text', serif; font-size: clamp(0.75rem, 1.4vw, 0.85rem);
          color: var(--lilac, rgba(200,185,240,0.68));
        }
        .ctb-sos-arrow {
          font-size: 1.3rem; color: var(--gold-bright, #FFE566);
          transition: transform 0.2s ease;
        }
        .ctb-sos:hover .ctb-sos-arrow { transform: translateX(0.3rem); }
      `}</style>
    </div>
  );
}
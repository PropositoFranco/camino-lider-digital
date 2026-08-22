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

      {tutorial && <TutorialDemo key={tutorial.id} tutorial={tutorial} />}

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
      `}</style>
    </div>
  );
}
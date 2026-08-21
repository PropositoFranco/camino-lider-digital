import { useState, useEffect } from 'react';
import { supabaseCamino } from '../../services/supabaseCamino';
// ⚠️ Ajusta la ruta del import de arriba a donde vive tu cliente de Supabase
// en tu proyecto (vi que usas `supabaseCamino.js` en /services).

const CATEGORIA_LABEL = {
  sello: 'Sellos del Templario',
  logo: 'Logos',
  banner: 'Plantillas de Portada',
};

const CATEGORIA_ORDEN = ['sello', 'logo', 'banner'];

export default function CaminoKitVisualBlock() {
  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const { data, error: err } = await supabaseCamino
          .from('camino_recursos')
          .select('id, titulo, descripcion, url_archivo, categoria, orden')
          .eq('tipo', 'kit_visual')
          .eq('activo', true)
          .order('orden', { ascending: true });

        if (err) throw err;
        if (activo) setRecursos(data || []);
      } catch (e) {
        if (activo) setError(e.message);
      } finally {
        if (activo) setLoading(false);
      }
    })();
    return () => { activo = false; };
  }, []);

  const agrupado = CATEGORIA_ORDEN
    .map((cat) => ({
      categoria: cat,
      items: recursos.filter((r) => r.categoria === cat),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="ckv-wrap">
      {/* Bolas de color flotantes de fondo — todo en % y rem, nada absoluto en px */}
      <div className="ckv-orb ckv-orb--gold" />
      <div className="ckv-orb ckv-orb--purple" />
      <div className="ckv-orb ckv-orb--lilac" />

      <div className="ckv-header">
        <span className="ckv-icon">🎨</span>
        <div>
          <h3 className="ckv-title">Kit Visual de Marca</h3>
          <p className="ckv-subtitle">
            Sellos, logos y plantillas oficiales — listos para usar en tus portadas.
          </p>
        </div>
      </div>

      {loading && <div className="ckv-status">Abriendo el cofre…</div>}
      {error && <div className="ckv-status ckv-status--error">No se pudo abrir el cofre: {error}</div>}

      {!loading && !error && agrupado.map((grupo) => (
        <section key={grupo.categoria} className="ckv-seccion">
          <h4 className="ckv-seccion-titulo">{CATEGORIA_LABEL[grupo.categoria]}</h4>
          <div className="ckv-grid">
            {grupo.items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="ckv-card"
                onClick={() => setPreviewUrl(item.url_archivo)}
                title={item.descripcion || item.titulo}
              >
                <div className="ckv-card-img-wrap">
                  <img
                    src={item.url_archivo}
                    alt={item.titulo}
                    loading="lazy"
                    className="ckv-card-img"
                  />
                </div>
                <span className="ckv-card-label">{item.titulo}</span>
              </button>
            ))}
          </div>
        </section>
      ))}

      {previewUrl && (
        <div className="ckv-lightbox" onClick={() => setPreviewUrl(null)}>
          <div className="ckv-lightbox-inner">
            <img src={previewUrl} alt="" className="ckv-lightbox-img" />
            <a
              href={previewUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="ckv-lightbox-download"
              onClick={(e) => e.stopPropagation()}
            >
              ⬇ Descargar
            </a>
          </div>
        </div>
      )}

      <style>{`
        .ckv-wrap {
          position: relative;
          width: 100%;
          padding: clamp(1rem, 3vw, 2rem);
          border-radius: 1.25rem;
          border: 1px solid var(--gold-dim, rgba(212,175,55,0.35));
          background: radial-gradient(120% 120% at 10% 0%, rgba(204,68,255,0.08), transparent 60%),
                      rgba(10, 8, 20, 0.55);
          overflow: hidden;
          isolation: isolate;
        }

        /* Bolas de color de fondo — posicionadas en %, tamaño en vmin/rem, blur relativo */
        .ckv-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(clamp(1.5rem, 4vw, 3rem));
          opacity: 0.35;
          pointer-events: none;
          z-index: 0;
          animation: ckv-float 12s ease-in-out infinite;
        }
        .ckv-orb--gold {
          width: 30%;
          aspect-ratio: 1 / 1;
          top: -8%;
          right: -6%;
          background: var(--gold-bright, #FFE566);
          animation-delay: 0s;
        }
        .ckv-orb--purple {
          width: 24%;
          aspect-ratio: 1 / 1;
          bottom: -10%;
          left: -4%;
          background: var(--purple, #CC44FF);
          animation-delay: 3s;
        }
        .ckv-orb--lilac {
          width: 18%;
          aspect-ratio: 1 / 1;
          top: 40%;
          left: 45%;
          background: var(--lilac, rgba(200,185,240,0.68));
          animation-delay: 6s;
        }
        @keyframes ckv-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(2%, -3%) scale(1.08); }
        }

        .ckv-header {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .ckv-icon { font-size: clamp(1.5rem, 3vw, 2rem); line-height: 1; }
        .ckv-title {
          font-family: 'Cinzel Decorative', serif;
          color: var(--gold-bright, #FFE566);
          font-size: clamp(1.1rem, 2.5vw, 1.5rem);
          margin: 0 0 0.25rem 0;
        }
        .ckv-subtitle {
          font-family: 'Crimson Text', serif;
          color: var(--lilac, rgba(200,185,240,0.68));
          font-size: clamp(0.85rem, 1.5vw, 1rem);
          margin: 0;
        }

        .ckv-status {
          position: relative;
          z-index: 1;
          font-family: 'Crimson Text', serif;
          color: var(--lilac, rgba(200,185,240,0.68));
          padding: 1rem 0;
        }
        .ckv-status--error { color: #ff8a8a; }

        .ckv-seccion {
          position: relative;
          z-index: 1;
          margin-bottom: 1.75rem;
        }
        .ckv-seccion-titulo {
          font-family: 'Cinzel', serif;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-size: clamp(0.75rem, 1.5vw, 0.9rem);
          color: var(--gold, #D4AF37);
          margin: 0 0 0.75rem 0;
          border-bottom: 1px solid var(--gold-dim, rgba(212,175,55,0.25));
          padding-bottom: 0.4rem;
        }

        /* Grid 100% responsive con unidades relativas — se autoajusta sin breakpoints fijos */
        .ckv-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(clamp(6rem, 18vw, 9rem), 1fr));
          gap: clamp(0.6rem, 1.5vw, 1rem);
        }

        .ckv-card {
          all: unset;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem;
          border-radius: 0.85rem;
          border: 1px solid var(--gold-dim, rgba(212,175,55,0.25));
          background: rgba(255,255,255,0.03);
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .ckv-card:hover,
        .ckv-card:focus-visible {
          transform: translateY(-0.2rem);
          border-color: var(--gold-bright, #FFE566);
          box-shadow: 0 0 clamp(0.5rem, 2vw, 1rem) var(--gold-glow, rgba(212,175,55,0.35));
        }

        .ckv-card-img-wrap {
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 0.6rem;
          overflow: hidden;
          background: rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ckv-card-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .ckv-card-label {
          font-family: 'Crimson Text', serif;
          font-size: clamp(0.75rem, 1.4vw, 0.85rem);
          color: #f0ead6;
          text-align: center;
          line-height: 1.2;
        }

        .ckv-lightbox {
          position: fixed;
          inset: 0;
          background: rgba(5, 3, 12, 0.85);
          backdrop-filter: blur(0.3rem);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 5vw;
          z-index: 999;
        }
        .ckv-lightbox-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          max-width: 90vw;
          max-height: 90vh;
        }
        .ckv-lightbox-img {
          max-width: 100%;
          max-height: 70vh;
          object-fit: contain;
          border-radius: 1rem;
          border: 1px solid var(--gold-bright, #FFE566);
        }
        .ckv-lightbox-download {
          font-family: 'Cinzel', serif;
          color: #0a0814;
          background: var(--gold-bright, #FFE566);
          padding: 0.6rem 1.2rem;
          border-radius: 2rem;
          text-decoration: none;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
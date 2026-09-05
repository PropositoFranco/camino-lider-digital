import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseCamino as supabase } from '../../services/supabaseCamino';
import CaminoKitVisualBlock from './CaminoKitVisualBlock';
import CaminoTutorialesBlock from './CaminoTutorialesBlock';

const styles = `
:root{
  --gold:#D4AF37; --gold-bright:#FFE566; --gold-dim:rgba(212,175,55,0.4); --gold-glow:rgba(212,175,55,0.65);
  --dark-bg:#04020e; --dark-surface:rgba(10,5,32,0.92);
  --purple:#CC44FF;
  --lilac:rgba(200,185,240,0.68); --lilac-dim:rgba(200,185,240,0.42);
}
.car-root *,.car-root *::before,.car-root *::after{margin:0;padding:0;box-sizing:border-box;}
.car-root{
  min-height:100dvh; width:100%; display:flex; flex-direction:column;
  background:
    radial-gradient(ellipse 120% 50% at 50% 0%, rgba(40,10,90,0.9) 0%, transparent 60%),
    radial-gradient(ellipse 70% 40% at 12% 15%, rgba(10,40,100,0.35) 0%, transparent 55%),
    radial-gradient(ellipse 70% 40% at 88% 10%, rgba(80,10,110,0.35) 0%, transparent 55%),
    linear-gradient(180deg,#050215 0%,#0a0530 18%,#08031c 55%,#04020e 100%);
  font-family:'Crimson Text',serif; color:#fff; position:relative;
}
.car-orbs{position:fixed; inset:0; overflow:hidden; pointer-events:none; z-index:0;}
.car-orb{
  position:absolute; border-radius:50%;
  filter:blur(70px); opacity:0.4; mix-blend-mode:screen;
  animation:car-flotar var(--dur) ease-in-out infinite; animation-delay:var(--del);
  will-change:transform; transform:translate3d(0,0,0);
}
@keyframes car-flotar{
  0%,100%{ transform:translate3d(0,0,0) scale(1); }
  50%{ transform:translate3d(var(--tx), var(--ty), 0) scale(1.12); }
}
@media (max-width:760px){ .car-orb{filter:blur(46px);} }

.car-stars{position:fixed; inset:0; pointer-events:none; z-index:0;}
.car-star{position:absolute; border-radius:50%; background:#fff; animation:car-twinkle var(--d) ease-in-out infinite; animation-delay:var(--del);}
@keyframes car-twinkle{0%,100%{opacity:var(--min);} 50%{opacity:1;}}

.car-topnav{
  flex:0 0 auto; display:flex; align-items:center; justify-content:space-between; gap:14px;
  padding:10px 26px;
  background:linear-gradient(180deg, rgba(6,3,18,0.97), rgba(6,3,18,0.88));
  border-bottom:1px solid var(--gold-dim);
  position:relative; z-index:10; flex-wrap:wrap;
}
.car-brand{display:flex; align-items:center; gap:10px;}
.car-brand-name{font-family:'Cinzel',serif; font-weight:900; letter-spacing:1px; font-size:16px; color:#fff;}
.car-brand-name span{color:var(--gold);}
.car-nav-links{display:flex; align-items:center; gap:18px; flex-wrap:wrap;}
.car-nav-item{
  font-family:'Cinzel',serif; font-size:12.5px; font-weight:700; letter-spacing:0.3px;
  color:var(--lilac); text-decoration:none; background:none; border:none; cursor:pointer;
  display:flex; align-items:center; gap:5px; white-space:nowrap; opacity:0.85; transition:opacity .2s, color .2s;
}
.car-nav-item:hover{opacity:1; color:var(--gold-bright);}
.car-nav-item.active{color:var(--gold-bright); opacity:1;}
.car-nav-item.proximamente{opacity:0.4; cursor:default;}
.car-nav-item.proximamente:hover{opacity:0.4; color:var(--lilac);}
.car-badge-prox{
  font-size:7.5px; font-weight:900; letter-spacing:0.5px; color:var(--purple);
  background:rgba(204,68,255,0.14); border:1px solid rgba(204,68,255,0.3);
  border-radius:20px; padding:1px 5px; text-transform:uppercase;
}
.car-salir{
  font-family:'Cinzel',serif; font-size:11px; font-weight:700; letter-spacing:0.5px;
  color:var(--lilac); text-decoration:none; opacity:0.75; cursor:pointer; background:none; border:none;
}
.car-salir:hover{opacity:1; color:var(--gold-bright);}
@media (max-width:760px){
  .car-topnav{padding:8px 14px;}
  .car-nav-links{gap:10px;}
  .car-nav-item{font-size:10.5px;}
}

.car-wrap{
  flex:1 1 auto; max-width:920px; width:100%; margin:0 auto;
  padding:clamp(16px,3vh,28px) clamp(20px,4vw,40px) clamp(30px,4vh,44px);
  position:relative; z-index:1; display:flex; flex-direction:column; gap:clamp(14px,2vh,22px);
}

.car-hero-frame{
  position:relative; width:100%; border-radius:18px; overflow:hidden;
  border:2px solid var(--gold);
  box-shadow:0 0 0 1px rgba(212,175,55,0.25), 0 0 30px rgba(212,175,55,0.28), 0 10px 36px rgba(0,0,0,0.5);
  background:#050216;
  aspect-ratio:16/6;
}
.car-hero-img{
  position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center 35%;
  filter:brightness(0.62) saturate(1.15);
}
.car-hero-frame::after{
  content:""; position:absolute; inset:0;
  background:linear-gradient(180deg, rgba(4,2,14,0.15) 0%, rgba(4,2,14,0.45) 55%, rgba(4,2,14,0.94) 100%);
}
.car-hero-content{
  position:relative; z-index:2; height:100%; display:flex; align-items:flex-end;
  padding:clamp(14px,3vw,26px);
}
.car-eyebrow-row{display:flex; align-items:center; gap:14px;}
.car-eyebrow-icon{
  width:clamp(38px,6vw,52px); height:clamp(38px,6vw,52px); flex-shrink:0;
  border-radius:50%; border:2px solid var(--gold);
  background:radial-gradient(circle at 35% 30%, rgba(255,229,102,0.35), rgba(212,175,55,0.12) 65%, transparent 100%);
  box-shadow:0 0 18px var(--gold-glow);
  display:flex; align-items:center; justify-content:center; font-size:clamp(17px,2.6vw,24px);
}
.car-eyebrow-tag{font-family:'Cinzel',serif; font-size:clamp(9.5px,1.4vw,12px); font-weight:900; letter-spacing:2px; color:var(--gold); text-shadow:0 2px 10px rgba(0,0,0,0.8);}
h1.car-title{font-family:'Cinzel Decorative',serif; font-weight:900; font-size:clamp(20px,3.6vh,30px); line-height:1.12; color:#fff; text-shadow:0 2px 14px rgba(0,0,0,0.9);}

.car-explica{
  background:var(--dark-surface); border:1px solid var(--gold-dim); border-radius:12px;
  padding:12px 16px; position:relative; overflow:hidden;
}
.car-explica::before{content:""; position:absolute; inset:0; background:radial-gradient(ellipse 70% 60% at 50% 0%, rgba(212,175,55,0.08), transparent 70%); pointer-events:none;}
.car-explica p{position:relative; z-index:1; font-family:'Nunito',sans-serif; font-size:12.5px; line-height:1.5; color:var(--lilac);}
.car-explica b{color:var(--gold-bright); font-weight:700;}

.car-section-label{
  font-family:'Cinzel',serif; font-weight:900; font-size:11px; letter-spacing:1.8px; text-transform:uppercase;
  color:var(--gold); display:flex; align-items:center; gap:7px; margin-top:4px;
}
.car-section-label::before{content:"✦"; color:var(--gold-bright); font-size:9px;}

.car-grid{
  display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:clamp(12px,1.6vw,18px);
}
@media (max-width:700px){ .car-grid{grid-template-columns:1fr;} }

.car-card{
  position:relative; overflow:hidden; text-align:left; cursor:pointer;
  border-radius:16px; border:1px solid var(--gold-dim);
  background:var(--dark-surface);
  display:flex; flex-direction:column;
  transition:transform .18s ease, border-color .18s ease, box-shadow .18s ease;
}
.car-card:hover{ transform:translateY(-3px); border-color:var(--gold); box-shadow:0 10px 28px rgba(212,175,55,0.18); }
.car-card.bloqueada{ cursor:default; opacity:0.82; }
.car-card.bloqueada:hover{ transform:none; box-shadow:none; border-color:var(--gold-dim); }

.car-card-media{
  position:relative; width:100%; aspect-ratio:16/8; flex-shrink:0;
}
.car-card-media-inner{
  position:absolute; inset:0; overflow:hidden; border-radius:16px 16px 0 0;
  background:linear-gradient(150deg, rgba(212,175,55,0.1), rgba(204,68,255,0.08));
}
.car-card-media-inner img{
  position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
  filter:brightness(0.72) saturate(1.1);
  transition:transform .3s ease;
}
.car-card:hover .car-card-media-inner img{ transform:scale(1.05); }
.car-card-media-inner.contain img{
  object-fit:contain; padding:4%;
  filter:drop-shadow(0 0 14px rgba(212,175,55,0.4));
  transition:transform .35s cubic-bezier(.2,.8,.2,1), filter .35s ease;
}
.car-card:hover .car-card-media-inner.contain img{
  transform:scale(1.22) rotate(-1.5deg);
  filter:drop-shadow(0 0 26px var(--gold-glow)) drop-shadow(0 0 48px rgba(204,68,255,0.45));
}
.car-card-media-inner::after{
  content:""; position:absolute; inset:0;
  background:linear-gradient(180deg, rgba(4,2,14,0) 40%, rgba(4,2,14,0.88) 100%);
}
.car-card-badge{
  position:absolute; top:10px; right:10px; z-index:2;
  font-family:'Cinzel',serif; font-weight:900; font-size:8.5px; letter-spacing:0.8px; text-transform:uppercase;
  color:var(--purple); background:rgba(204,68,255,0.16); border:1px solid rgba(204,68,255,0.4);
  border-radius:20px; padding:3px 9px;
}
.car-card-icon-float{
  position:absolute; left:14px; bottom:-18px; z-index:2;
  width:clamp(38px,6vw,44px); height:clamp(38px,6vw,44px); border-radius:50%;
  border:2px solid var(--gold); background:#0c0620;
  box-shadow:0 0 16px var(--gold-glow), 0 6px 14px rgba(0,0,0,0.5);
  display:flex; align-items:center; justify-content:center; font-size:clamp(16px,2.4vw,19px);
}
.car-card-body{ padding:26px 16px 16px; flex:1; display:flex; flex-direction:column; gap:6px; }
.car-card-title{ font-family:'Cinzel',serif; font-weight:700; font-size:14px; color:#fff; }
.car-card-desc{ font-family:'Nunito',sans-serif; font-size:11.5px; color:var(--lilac); line-height:1.45; flex:1; }
.car-card-cta{
  font-family:'Cinzel',serif; font-weight:900; font-size:10.5px; letter-spacing:0.8px;
  color:var(--gold-bright); display:flex; align-items:center; gap:5px; margin-top:4px;
}
.car-card.bloqueada .car-card-cta{ color:var(--lilac-dim); }

.car-footer-note{
  text-align:center; font-family:'Nunito',sans-serif; font-size:11px; color:var(--lilac-dim);
  margin-top:4px; line-height:1.5;
}

.car-loading{
  min-height:100dvh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; text-align:center; padding:24px;
}
.car-spinner{width:26px; height:26px; border:2.5px solid var(--gold-dim); border-top-color:var(--gold); border-radius:50%; animation:car-girar 0.8s linear infinite;}
@keyframes car-girar{ to{ transform:rotate(360deg); } }
.car-btn{
  padding:12px 24px; margin-top:4px;
  background:rgba(212,175,55,0.14); border:1px solid var(--gold); border-radius:10px;
  color:var(--gold-bright); font-family:'Cinzel',serif; font-weight:900; font-size:11.5px; letter-spacing:1.2px; cursor:pointer;
}
`;

const NAV_ITEMS = [
  { label: 'Inicio', activo: false, disponible: true, ruta: '/camino/participante/home' },
  { label: 'Check-in', activo: false, disponible: true, ruta: '/camino/participante/panel' },
  { label: 'Calendario', activo: false, disponible: true, ruta: '/camino/participante/calendario' },
  { label: 'Armería', activo: true, disponible: true },
  { label: 'Pasaporte del Templario', activo: false, disponible: true, ruta: '/camino/participante/pasaporte' },
  { label: 'Ranking', activo: false, disponible: true, ruta: '/camino/participante/ranking' },
];

const BUCKET = 'https://hdwzhwuhlrtrmhnecypm.supabase.co/storage/v1/object/public';

const BLOQUES = [
  {
    id: 'guiones',
    icono: '🪄',
    titulo: 'Generador de Guiones',
    desc: 'Toca tus temas del día, descarga tu Brief de Marca y arma tu guion con IA en menos de 1 minuto.',
    imagen: `${BUCKET}/banners/camino/camino-calendario-banner.webp`,
    imagenModo: 'cover',
    badge: null,
    cta: 'IR AL CALENDARIO →',
    ruta: '/camino/participante/calendario',
  },
  {
    id: 'checklist',
    icono: '🛡️',
    titulo: 'Checklist Pre-Publicación',
    desc: 'Las 4 preguntas que te haces antes de publicar: gancho, estructura, legibilidad y CTA.',
    imagen: `${BUCKET}/banners/camino/camino-checkin-banner.webp`,
    imagenModo: 'cover',
    badge: null,
    cta: 'IR AL CHECK-IN →',
    ruta: '/camino/participante/panel',
  },
  {
    id: 'kit_visual',
    icono: '🎨',
    titulo: 'Kit Visual de Marca',
    desc: 'Logos, sellos del Templario y plantillas de portada listas para tus miniaturas y videos.',
    imagen: `${BUCKET}/sorteos-assets/logo-minimalista.png`,
    imagenModo: 'contain',
    badge: null,
    cta: 'VER KIT →',
    ruta: null,
    modal: true,
  },
  {
    id: 'tutoriales',
    icono: '🎥',
    titulo: 'Mini-Tutoriales',
    desc: 'Micro-videos de 30 segundos: cómo sacar tu link público, subtítulos automáticos y más.',
    imagen: `${BUCKET}/banners/sellos/sello-6.png`,
    imagenModo: 'contain',
    badge: null,
    cta: 'VER TUTORIALES →',
    ruta: null,
    modal: true,
  },
  {
    id: 'modulo1',
    icono: '📜',
    titulo: 'Módulo 1 — Los 3 Pilares',
    desc: 'Tu documento base de marca personal. Descárgalo las veces que necesites, aunque ya lo hayas confirmado.',
    imagen: `${BUCKET}/banners/sellos/sello-3.png`,
    imagenModo: 'contain',
    badge: null,
    cta: 'DESCARGAR →',
    ruta: null,
    externo: true,
    url: `${BUCKET}/camino-recursos/modulo1/Modulo1_Los3Pilares.docx`,
  },
];

export default function CaminoParticipanteArmeriaPage() {
  const navigate = useNavigate();
  const [estrellas, setEstrellas] = useState([]);
  const [orbes, setOrbes] = useState([]);
  const [mostrarKitVisual, setMostrarKitVisual] = useState(false);
  const [mostrarTutoriales, setMostrarTutoriales] = useState(false);

  useEffect(() => {
    const n = window.innerWidth < 760 ? 26 : 50;
    const arr = [];
    for (let i = 0; i < n; i++) {
      arr.push({
        id: i,
        size: (Math.random() * 1.6 + 0.6).toFixed(1),
        top: (Math.random() * 100).toFixed(1),
        left: (Math.random() * 100).toFixed(1),
        dur: (Math.random() * 4 + 3).toFixed(1),
        delay: (Math.random() * 4).toFixed(1),
        min: (Math.random() * 0.4 + 0.15).toFixed(2),
      });
    }
    setEstrellas(arr);

    const colores = [
      'rgba(212,175,55,0.9)',
      'rgba(204,68,255,0.85)',
      'rgba(80,140,255,0.85)',
      'rgba(255,68,170,0.8)',
      'rgba(80,220,200,0.75)',
    ];
    const cantidadOrbes = window.innerWidth < 760 ? 4 : 6;
    const orbs = [];
    for (let i = 0; i < cantidadOrbes; i++) {
      const size = Math.round(Math.random() * 220 + 220);
      orbs.push({
        id: i,
        size,
        top: (Math.random() * 90).toFixed(1),
        left: (Math.random() * 90).toFixed(1),
        color: colores[i % colores.length],
        tx: `${Math.round((Math.random() - 0.5) * 160)}px`,
        ty: `${Math.round((Math.random() - 0.5) * 160)}px`,
        dur: (Math.random() * 10 + 16).toFixed(1),
        del: (Math.random() * -20).toFixed(1),
      });
    }
    setOrbes(orbs);
  }, []);

  async function salir() {
    await supabase.auth.signOut();
    navigate('/camino/participante/login', { replace: true });
  }

  function abrirBloque(bloque) {
    if (bloque.id === 'tutoriales') { setMostrarTutoriales(true); return; }
    if (bloque.modal) { setMostrarKitVisual(true); return; }
    if (bloque.externo && bloque.url) { window.open(bloque.url, '_blank', 'noopener'); return; }
    if (!bloque.ruta) return;
    navigate(bloque.ruta);
  }

  return (
    <div className="car-root">
      <style>{styles}</style>

      <div className="car-orbs">
        {orbes.map((o) => (
          <div
            key={o.id}
            className="car-orb"
            style={{
              width: o.size, height: o.size, top: `${o.top}%`, left: `${o.left}%`,
              background: `radial-gradient(circle, ${o.color} 0%, transparent 72%)`,
              '--tx': o.tx, '--ty': o.ty, '--dur': `${o.dur}s`, '--del': `${o.del}s`,
            }}
          />
        ))}
      </div>

      <div className="car-stars">
        {estrellas.map((s) => (
          <div
            key={s.id}
            className="car-star"
            style={{
              width: `${s.size}px`, height: `${s.size}px`, top: `${s.top}%`, left: `${s.left}%`,
              '--d': `${s.dur}s`, '--del': `${s.delay}s`, '--min': s.min,
            }}
          />
        ))}
      </div>

      <nav className="car-topnav">
        <div className="car-brand">
          <div className="car-brand-name">TEMPLO <span>DEL PROPÓSITO</span></div>
        </div>
        <div className="car-nav-links">
          {NAV_ITEMS.map((item) => {
            if (!item.disponible) {
              return (
                <span key={item.label} className="car-nav-item proximamente">
                  {item.label} <span className="car-badge-prox">Próximamente</span>
                </span>
              );
            }
            if (item.ruta) {
              return (
                <button key={item.label} className={`car-nav-item ${item.activo ? 'active' : ''}`} onClick={() => navigate(item.ruta)}>
                  {item.label}
                </button>
              );
            }
            return <span key={item.label} className={`car-nav-item ${item.activo ? 'active' : ''}`}>{item.label}</span>;
          })}
        </div>
        <button className="car-salir" onClick={salir}>Salir</button>
      </nav>

      <div className="car-wrap">
        <div className="car-hero-frame">
          <img
            className="car-hero-img"
            src={`${BUCKET}/banners/camino/camino-lobby-banner.webp`}
            alt="Armería del Camino"
          />
          <div className="car-hero-content">
            <div className="car-eyebrow-row">
              <div className="car-eyebrow-icon">🎒</div>
              <div>
                <div className="car-eyebrow-tag">TU CENTRO DE MANDO</div>
                <h1 className="car-title">Armería del Templario</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="car-explica">
          <p>
            Aquí guardas todo lo que necesitas para grabar bien tu video de hoy: tu <b>generador de guiones</b>,
            tu <b>checklist</b> antes de publicar, tu <b>kit visual</b> de marca y tus <b>tutoriales</b> rápidos.
            Todo en un solo lugar, sin salir del Camino.
          </p>
        </div>

        <div className="car-section-label">Tu arsenal</div>

        <div className="car-grid">
          {BLOQUES.map((b) => (
            <div
              key={b.id}
              className={`car-card${(b.ruta || b.externo) ? '' : ' bloqueada'}`}
              onClick={() => abrirBloque(b)}
            >
              <div className="car-card-media">
                <div className={`car-card-media-inner${b.imagenModo === 'contain' ? ' contain' : ''}`}>
                  <img src={b.imagen} alt={b.titulo} />
                </div>
                {b.badge && <span className="car-card-badge">{b.badge}</span>}
                <div className="car-card-icon-float">{b.icono}</div>
              </div>
              <div className="car-card-body">
                <div className="car-card-title">{b.titulo}</div>
                <div className="car-card-desc">{b.desc}</div>
                <div className="car-card-cta">{b.cta}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="car-footer-note">
          Tu arsenal está completo — toca cualquier tarjeta y úsala hoy mismo.
        </div>
      </div>

      {mostrarKitVisual && (
        <div
          onClick={() => setMostrarKitVisual(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 998,
            background: 'rgba(5,3,12,0.85)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4vw',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}
          >
            <CaminoKitVisualBlock />
          </div>
        </div>
      )}

      {mostrarTutoriales && (
        <div
          onClick={() => setMostrarTutoriales(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 998,
            background: 'rgba(5,3,12,0.85)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4vw',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}
          >
            <CaminoTutorialesBlock />
          </div>
        </div>
      )}
    </div>
  );
}
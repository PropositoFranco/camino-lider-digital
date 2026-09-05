import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseCamino as supabase } from '../../services/supabaseCamino';
import CaminoModoToggle from './CaminoModoToggle';
import CaminoGuionModal from './CaminoGuionModal';

/* ============================================================================
   CONFIG — cosas que TÚ necesitas rellenar/confirmar
   ========================================================================== */

// TODO: pon aquí el Library ID real de tu cuenta de Bunny Stream.
// Lo encuentras en tu panel de Bunny.net > Stream > (tu librería) > Library ID.
// Sin esto, el video de "Hoy te toca" no se puede reproducir (solo se oculta).
const BUNNY_LIBRARY_ID = '733285';

// Sube estas 2 imágenes (te las mando comprimidas junto con este archivo) a tu
// bucket de Supabase Storage "camino-recursos" con EXACTAMENTE estos nombres
// (Storage > camino-recursos > subir archivo). Si prefieres usar otras rutas,
// solo cambia estas 2 constantes.
const URL_PERSONAJE_DIA_ACTUAL =
  'https://hdwzhwuhlrtrmhnecypm.supabase.co/storage/v1/object/public/camino-recursos/personaje-dia-actual.png';
const URL_PERSONAJE_CHECKPOINT =
  'https://hdwzhwuhlrtrmhnecypm.supabase.co/storage/v1/object/public/camino-recursos/personaje-checkpoint.png';

const TOTAL_DIAS = 28;
const DIAS_CHECKPOINT = [14, 28];

/* ============================================================================
   ESTILOS
   ========================================================================== */

const styles = `
:root{
  --gold:#D4AF37; --gold-bright:#FFE566; --gold-dim:rgba(212,175,55,0.4); --gold-glow:rgba(212,175,55,0.65);
  --dark-bg:#04020e; --dark-surface:rgba(10,5,32,0.92);
  --purple:#CC44FF;
  --lilac:rgba(200,185,240,0.68); --lilac-dim:rgba(200,185,240,0.42);
  --green:#44ff88; --red:#ff4466; --blue:#3aa0ff;
}
.chh-root *,.chh-root *::before,.chh-root *::after{margin:0;padding:0;box-sizing:border-box;}
.chh-root{
  min-height:100dvh; width:100%; display:flex; flex-direction:column;
  background:
    radial-gradient(ellipse 120% 50% at 50% 0%, rgba(40,10,90,0.9) 0%, transparent 60%),
    radial-gradient(ellipse 70% 40% at 12% 15%, rgba(10,40,100,0.35) 0%, transparent 55%),
    radial-gradient(ellipse 70% 40% at 88% 10%, rgba(80,10,110,0.35) 0%, transparent 55%),
    linear-gradient(180deg,#050215 0%,#0a0530 18%,#08031c 55%,#04020e 100%);
  font-family:'Crimson Text',serif; color:#fff; position:relative;
}
.chh-stars{position:fixed; inset:0; pointer-events:none; z-index:0;}
.chh-star{position:absolute; border-radius:50%; background:#fff; animation:chh-twinkle var(--d) ease-in-out infinite; animation-delay:var(--del);}
@keyframes chh-twinkle{0%,100%{opacity:var(--min);} 50%{opacity:1;}}

.chh-topnav{
  flex:0 0 auto; display:flex; align-items:center; justify-content:space-between; gap:14px;
  padding:10px 26px;
  background:linear-gradient(180deg, rgba(6,3,18,0.97), rgba(6,3,18,0.88));
  border-bottom:1px solid var(--gold-dim);
  position:relative; z-index:10; flex-wrap:wrap;
}
.chh-brand{display:flex; align-items:center; gap:10px;}
.chh-brand-name{font-family:'Cinzel',serif; font-weight:900; letter-spacing:1px; font-size:16px; color:#fff;}
.chh-brand-name span{color:var(--gold);}
.chh-nav-links{display:flex; align-items:center; gap:18px; flex-wrap:wrap;}
.chh-nav-item{
  font-family:'Cinzel',serif; font-size:12.5px; font-weight:700; letter-spacing:0.3px;
  color:var(--lilac); text-decoration:none; background:none; border:none; cursor:pointer;
  display:flex; align-items:center; gap:5px; white-space:nowrap; opacity:0.85; transition:opacity .2s, color .2s;
}
.chh-nav-item:hover{opacity:1; color:var(--gold-bright);}
.chh-nav-item.active{color:var(--gold-bright); opacity:1;}
.chh-nav-item.proximamente{opacity:0.4; cursor:default;}
.chh-nav-item.proximamente:hover{opacity:0.4; color:var(--lilac);}
.chh-badge-prox{
  font-size:7.5px; font-weight:900; letter-spacing:0.5px; color:var(--purple);
  background:rgba(204,68,255,0.14); border:1px solid rgba(204,68,255,0.3);
  border-radius:20px; padding:1px 5px; text-transform:uppercase;
}
.chh-salir{
  font-family:'Cinzel',serif; font-size:11px; font-weight:700; letter-spacing:0.5px;
  color:var(--lilac); text-decoration:none; opacity:0.75; cursor:pointer; background:none; border:none;
}
.chh-salir:hover{opacity:1; color:var(--gold-bright);}

.chh-wrap{
  flex:1 1 auto; max-width:1080px; width:100%; margin:0 auto;
  padding:clamp(20px,4vh,40px) clamp(20px,4vw,40px);
  position:relative; z-index:1; display:flex; flex-direction:column; gap:clamp(16px,2.4vh,26px);
}

.chh-hero{
  position:relative; width:100%; height:clamp(320px,50vh,480px); flex-shrink:0;
  background-image:url('https://hdwzhwuhlrtrmhnecypm.supabase.co/storage/v1/object/public/banners/camino/camino-lobby-banner.webp');
  background-size:cover; background-position:center 58%;
  display:flex; align-items:flex-end; z-index:1;
}
.chh-hero::after{
  content:""; position:absolute; inset:0;
  background:linear-gradient(180deg, rgba(4,2,14,0.1) 0%, rgba(4,2,14,0.5) 55%, rgba(4,2,14,0.98) 100%);
  pointer-events:none;
}
.chh-hero-inner{
  position:relative; z-index:2; max-width:1080px; width:100%; margin:0 auto;
  padding:0 clamp(20px,4vw,40px) clamp(18px,3vh,28px);
}
.chh-eyebrow-row{display:flex; align-items:center; gap:16px;}
.chh-eyebrow-icon{
  width:56px; height:56px; flex-shrink:0;
  border-radius:50%; border:2px solid var(--gold);
  background:radial-gradient(circle at 35% 30%, rgba(255,229,102,0.35), rgba(212,175,55,0.12) 65%, transparent 100%);
  box-shadow:0 0 18px var(--gold-glow);
  display:flex; align-items:center; justify-content:center; font-size:26px;
}
.chh-eyebrow-tag{font-family:'Cinzel',serif; font-size:13px; font-weight:900; letter-spacing:2.4px; color:var(--gold);}
h1.chh-title{font-family:'Cinzel Decorative',serif; font-weight:900; font-size:clamp(24px,4vh,34px); line-height:1.15; color:#fff;}

.chh-grid{display:grid; grid-template-columns:1.1fr 1fr; gap:clamp(12px,2vh,20px);}
@media (max-width:720px){ .chh-grid{grid-template-columns:1fr;} }

.chh-grid3{display:grid; grid-template-columns:1fr 1fr 1fr; gap:clamp(12px,2vh,20px);}
@media (max-width:820px){ .chh-grid3{grid-template-columns:1fr;} }

.chh-card{
  background:var(--dark-surface); border:1px solid var(--gold-dim); border-radius:16px;
  padding:clamp(18px,2.6vh,28px) clamp(18px,2.4vw,28px); position:relative; overflow:hidden;
}
.chh-card::before{content:""; position:absolute; inset:0; background:radial-gradient(ellipse 70% 60% at 50% 0%, rgba(212,175,55,0.08), transparent 70%); pointer-events:none;}

.chh-progress{text-align:center; display:flex; flex-direction:column; align-items:center; gap:12px; position:relative;}
.chh-day-label{font-family:'Cinzel',serif; font-weight:900; font-size:clamp(22px,3.4vh,30px); color:#fff;}
.chh-day-label .num{color:var(--gold-bright);}
.chh-day-sub{font-family:'Nunito',sans-serif; font-size:14px; color:var(--lilac); max-width:340px;}
.chh-btn{
  padding:12px 24px; margin-top:4px;
  background:rgba(212,175,55,0.14); border:1px solid var(--gold); border-radius:10px;
  color:var(--gold-bright); font-family:'Cinzel',serif; font-weight:900; font-size:11.5px; letter-spacing:1.2px; cursor:pointer;
  text-decoration:none; display:inline-block;
}
.chh-btn:disabled{opacity:0.5; cursor:default;}
.chh-btn-sm{padding:8px 16px; font-size:10.5px;}
.chh-btn-outline{background:transparent;}

.chh-section-label{
  font-family:'Cinzel',serif; font-weight:900; font-size:15px; letter-spacing:0.3px;
  color:#fff; margin-bottom:12px; display:flex; align-items:center; gap:9px;
}
.chh-section-label::before{content:""; width:4px; height:15px; background:var(--gold); border-radius:2px; display:inline-block;}
.chh-intro-card p{font-family:'Crimson Text',serif; font-size:clamp(14.5px,1.9vh,17px); line-height:1.55; color:rgba(255,255,255,0.9);}
.chh-intro-card b{color:var(--gold-bright); font-weight:600;}

.chh-material-item{
  display:flex; align-items:center; justify-content:space-between; gap:12px;
  padding:14px 16px; border-radius:11px;
  background:rgba(212,175,55,0.07); border:1px solid var(--gold-dim);
  text-decoration:none; color:#fff; transition:background .2s, border-color .2s; margin-bottom:10px;
}
.chh-material-item:hover{background:rgba(212,175,55,0.13); border-color:var(--gold);}
.chh-material-item:last-child{margin-bottom:0;}
.chh-material-left{display:flex; align-items:center; gap:12px;}
.chh-material-icon{
  width:38px; height:38px; border-radius:10px; flex-shrink:0;
  background:linear-gradient(160deg, rgba(212,175,55,0.3), rgba(124,58,237,0.2));
  display:flex; align-items:center; justify-content:center; font-size:18px; border:1px solid var(--gold-dim);
}
.chh-material-title{font-family:'Cinzel',serif; font-weight:700; font-size:15px;}
.chh-material-cta{font-family:'Cinzel',serif; font-weight:900; font-size:12px; letter-spacing:0.5px; color:var(--gold-bright); white-space:nowrap;}

.chh-loading{
  min-height:100dvh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; text-align:center; padding:24px;
}
.chh-spinner{width:26px; height:26px; border:2.5px solid var(--gold-dim); border-top-color:var(--gold); border-radius:50%; animation:chh-girar 0.8s linear infinite;}
@keyframes chh-girar{ to{ transform:rotate(360deg); } }

/* ---------- Hoy te toca ---------- */
.chh-hoy-card{padding:0; overflow:visible;}
.chh-hoy-top{padding:clamp(18px,2.6vh,26px) clamp(18px,2.4vw,26px) 0;}
.chh-hoy-meta{display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:6px;}
.chh-hoy-dia{font-family:'Cinzel',serif; font-weight:900; font-size:11.5px; letter-spacing:1.5px; color:var(--gold);}
.chh-hoy-badge{
  font-family:'Cinzel',serif; font-weight:900; font-size:10.5px; letter-spacing:0.8px; color:var(--gold-bright);
  background:rgba(212,175,55,0.12); border:1px solid var(--gold-dim); border-radius:100px; padding:4px 12px; text-transform:uppercase;
}
.chh-hoy-titulo{font-family:'Cinzel Decorative',serif; font-weight:900; font-size:clamp(19px,2.6vh,24px); color:#fff; margin-bottom:8px; display:flex; align-items:center; gap:8px;}
.chh-hoy-desc{font-family:'Crimson Text',serif; font-size:14.5px; line-height:1.55; color:rgba(255,255,255,0.85); margin-bottom:14px;}
.chh-hoy-botones{display:flex; flex-wrap:wrap; gap:8px; margin-bottom:16px;}
.chh-hoy-video{width:100%; aspect-ratio:16/9; margin:0 auto; background:#000; border-top:1px solid var(--gold-dim); border-bottom:1px solid var(--gold-dim);}
.chh-hoy-video iframe{width:100%; height:100%; border:none;}
.chh-hoy-sinvideo{
  padding:30px 20px; text-align:center; font-family:'Nunito',sans-serif; font-size:13px; color:var(--lilac);
  border-top:1px solid var(--gold-dim); border-bottom:1px solid var(--gold-dim);
}
.chh-hoy-bottom{padding:16px clamp(18px,2.4vw,26px) clamp(18px,2.6vh,26px); display:flex; flex-direction:column; gap:10px;}
.chh-hoy-full{width:100%; text-align:center; margin-top:0;}
.chh-hoy-acordeon{display:flex; align-items:center; justify-content:center; gap:8px;}
.chh-chevron{display:inline-block; transition:transform .2s;}
.chh-chevron-up{transform:rotate(180deg);}
.chh-idea-panel{
  background:rgba(255,255,255,0.03); border:1px solid var(--gold-dim); border-radius:12px;
  padding:16px 18px; margin-top:-2px;
}

/* ---------- Racha / progreso ---------- */
.chh-racha-num{font-family:'Cinzel Decorative',serif; font-weight:900; font-size:36px; color:#fff; display:flex; align-items:center; gap:8px; justify-content:center;}
.chh-racha-label{font-family:'Cinzel',serif; font-weight:900; font-size:10.5px; letter-spacing:1.5px; color:var(--gold); text-transform:uppercase; margin-bottom:8px; text-align:center;}
.chh-racha-sub{font-family:'Nunito',sans-serif; font-size:12px; color:var(--lilac); text-align:center; margin-top:4px;}
.chh-progreso-barra{width:100%; height:8px; border-radius:8px; background:rgba(255,255,255,0.08); overflow:hidden; margin-top:10px;}
.chh-progreso-fill{height:100%; background:linear-gradient(90deg, var(--gold), var(--gold-bright)); border-radius:8px; transition:width .4s;}

/* ---------- Barra de 28 días ---------- */
.chh-calendario-card{position:relative;}
.chh-calendario-head{display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;}
.chh-calendario-count{font-family:'Nunito',sans-serif; font-size:12px; color:var(--lilac);}
.chh-barra-dias{display:flex; flex-wrap:wrap; gap:8px; margin-bottom:10px;}
.chh-dia-box{
  position:relative; width:34px; height:34px; border-radius:9px;
  display:flex; align-items:center; justify-content:center;
  font-family:'Cinzel',serif; font-weight:900; font-size:12px; color:#fff;
  border:1.5px solid transparent;
}
.chh-dia-rojo{background:#c23652;}
.chh-dia-azul{background:var(--blue); box-shadow:0 0 0 2px rgba(58,160,255,0.35);}
.chh-dia-verde{background:#2f9e5c;}
.chh-dia-futuro{background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.55); border-color:rgba(255,255,255,0.08);}
.chh-dia-checkpoint{border-color:var(--gold-bright); box-shadow:0 0 8px rgba(255,229,102,0.5);}
.chh-dia-bandera{position:absolute; top:-9px; right:-6px; font-size:12px; transform:rotate(12deg);}
.chh-dia-personaje{
  position:absolute; top:100%; left:50%; transform:translate(-50%,-38%);
  width:46px; height:auto; pointer-events:none; z-index:3; filter:drop-shadow(0 4px 6px rgba(0,0,0,0.5));
}
.chh-calendario-legend{font-family:'Nunito',sans-serif; font-size:11.5px; color:var(--lilac); margin-top:18px; display:flex; align-items:center; gap:6px;}

/* ---------- Checkpoint ---------- */
.chh-checkpoint-card{display:flex; align-items:center; gap:16px; flex-wrap:wrap;}
.chh-checkpoint-personaje{width:64px; height:auto; flex-shrink:0;}
.chh-checkpoint-bubble{
  flex:1 1 240px; background:rgba(212,175,55,0.08); border:1px solid var(--gold-dim); border-radius:14px;
  padding:14px 18px; position:relative;
}
.chh-checkpoint-tag{font-family:'Cinzel',serif; font-weight:900; font-size:11px; letter-spacing:1px; color:var(--red); text-transform:uppercase; margin-bottom:4px;}
.chh-checkpoint-msg{font-family:'Crimson Text',serif; font-size:15px; color:#fff;}
.chh-checkpoint-actions{flex-basis:100%; display:flex; justify-content:flex-end;}

/* ---------- Días pendientes ---------- */
.chh-pendiente-item{
  display:flex; align-items:center; justify-content:space-between; gap:12px;
  padding:12px 16px; border-radius:11px; margin-bottom:8px;
  background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08);
}
.chh-pendiente-item:last-child{margin-bottom:0;}
.chh-pendiente-dia{font-family:'Cinzel',serif; font-weight:700; font-size:13.5px; color:#fff;}
.chh-pendientes-scroll{max-height:280px; overflow-y:auto; padding-right:4px;}
.chh-pendientes-vacio{font-family:'Nunito',sans-serif; font-size:13px; color:var(--lilac); text-align:center; padding:10px;}

/* ---------- Modal ---------- */
.chh-modal-overlay{
  position:fixed; inset:0; background:rgba(2,1,8,0.8); backdrop-filter:blur(3px);
  display:flex; align-items:center; justify-content:center; z-index:100; padding:20px;
}
.chh-modal{
  background:#0b0620; border:1px solid var(--gold-dim); border-radius:18px;
  max-width:640px; width:100%; max-height:85vh; overflow-y:auto;
  padding:clamp(20px,3vh,30px);
}
.chh-modal-head{display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:16px;}
.chh-modal-title{font-family:'Cinzel',serif; font-weight:900; font-size:18px; color:#fff; display:flex; align-items:center; gap:8px;}
.chh-modal-close{
  background:none; border:1px solid var(--gold-dim); color:var(--lilac); border-radius:8px;
  width:30px; height:30px; cursor:pointer; font-size:16px; flex-shrink:0;
}
.chh-modal-close:hover{color:var(--gold-bright); border-color:var(--gold);}
.chh-modal-section{margin-bottom:16px;}
.chh-modal-label{font-family:'Cinzel',serif; font-weight:900; font-size:11px; letter-spacing:1px; color:var(--gold); text-transform:uppercase; margin-bottom:6px;}
.chh-modal-text{font-family:'Crimson Text',serif; font-size:15px; line-height:1.6; color:rgba(255,255,255,0.9); white-space:pre-line;}
.chh-modal-prompt{
  font-family:'Nunito',sans-serif; font-size:13px; line-height:1.55; color:rgba(255,255,255,0.9);
  background:rgba(255,255,255,0.04); border:1px solid var(--gold-dim); border-radius:10px; padding:14px;
  white-space:pre-wrap; margin-bottom:12px;
}
.chh-modal-nota{font-family:'Nunito',sans-serif; font-size:11.5px; color:var(--lilac); font-style:italic;}

.chh-form-row{display:flex; flex-direction:column; gap:6px; margin-bottom:14px;}
.chh-form-row label{font-family:'Nunito',sans-serif; font-weight:700; font-size:11.5px; color:var(--gold-bright);}
.chh-textarea, .chh-input-text{
  background:rgba(255,255,255,0.04); border:1px solid var(--gold-dim); border-radius:10px;
  padding:10px 13px; color:#fff; font-family:'Nunito',sans-serif; font-size:13.5px; width:100%; resize:vertical;
}
.chh-textarea:focus, .chh-input-text:focus{outline:none; border-color:var(--gold);}
.chh-msg-ok{color:var(--green); font-size:12.5px; margin-top:8px;}
.chh-msg-error{color:var(--red); font-size:12.5px; margin-top:8px;}

@media (max-width:760px){
  .chh-topnav{padding:8px 14px;}
  .chh-nav-links{gap:10px;}
  .chh-nav-item{font-size:10.5px;}
  .chh-hero{background-position:80% 58%;}
}
`;

const NAV_ITEMS = [
  { label: 'Inicio', activo: true, disponible: true },
  { label: 'Check-in', activo: false, disponible: true, ruta: '/camino/participante/panel' },
  { label: 'Calendario', activo: false, disponible: true, ruta: '/camino/participante/calendario' },
  { label: 'Pasaporte del Templario', activo: false, disponible: true, ruta: '/camino/participante/pasaporte' },
{ label: 'Armería', activo: false, disponible: true, ruta: '/camino/participante/armeria' },
  { label: 'Ranking', activo: false, disponible: true, ruta: '/camino/participante/ranking' },
];

function rellenarPrompt(texto, nicho) {
  if (!texto) return '';
  return texto.replace(/\[Insertar Nicho\/Audiencia\]/gi, nicho && nicho.trim() ? nicho : '[tu nicho]');
}

export default function CaminoParticipanteHomePage() {
  const navigate = useNavigate();
  const [estado, setEstado] = useState('cargando'); // cargando | listo | sin_acceso
  const [participante, setParticipante] = useState(null);
  const [racha, setRacha] = useState({ racha_actual: 0, mejor_racha: 0, dias_completados: 0, dias_registrados: [], checkpoints_registrados: [] });
  const [fichaHoy, setFichaHoy] = useState(null);
  const [videoHoy, setVideoHoy] = useState(null);
  const [promptHoy, setPromptHoy] = useState(null);
  const [estrellas, setEstrellas] = useState([]);
  const [modal, setModal] = useState(null); // null | 'ficha' | 'guion' | 'checkpoint'
  const [ideaAbierta, setIdeaAbierta] = useState(false); // acordeón "Ver la idea completa", dentro del mismo cuadro

  // ---- estado del formulario de checkpoint ----
  const [cpAvances, setCpAvances] = useState('');
  const [cpArchivo, setCpArchivo] = useState(null);
  const [cpEnviando, setCpEnviando] = useState(false);
  const [cpMsgOk, setCpMsgOk] = useState('');
  const [cpMsgError, setCpMsgError] = useState('');

  useEffect(() => {
    const n = window.innerWidth < 760 ? 30 : 60;
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
  }, []);

  async function cargar() {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      navigate('/camino/participante/login', { replace: true });
      return;
    }

    const { data, error } = await supabase.rpc('camino_mi_progreso');
    if (error || !data || data.length === 0) {
      setEstado('sin_acceso');
      return;
    }

    const { data: onbEstado, error: errOnb } = await supabase.rpc('camino_mi_estado_onboarding');
    if (!errOnb && (!onbEstado || onbEstado.length === 0 || !onbEstado[0].modulo1_confirmado)) {
      navigate('/camino/participante/onboarding', { replace: true });
      return;
    }

    const miParticipante = data[0];
    setParticipante(miParticipante);
    const diaActual = miParticipante?.dia_actual ?? 1;

    // Racha / progreso real (RPC nueva, self-service)
    const { data: rachaData } = await supabase.rpc('camino_mi_racha');
    if (rachaData && rachaData.length > 0) setRacha(rachaData[0]);

    // Ficha del día actual (misma info real que usa Calendario)
    const { data: ficha } = await supabase
      .from('camino_calendario_fichas')
      .select('*, camino_formatos_ficha(nombre, emoji, descripcion_corta, que_es_cuando_usarlo, por_que_funciona)')
      .eq('dia_numero', diaActual)
      .maybeSingle();
    setFichaHoy(ficha || null);

    const { data: video } = await supabase
      .from('camino_calendario_videos')
      .select('*')
      .eq('dia_numero', diaActual)
      .maybeSingle();
    setVideoHoy(video || null);

    if (ficha?.titulo_dia) {
      const { data: prompt } = await supabase
        .from('camino_prompts_formato')
        .select('*')
        .eq('formato', ficha.titulo_dia)
        .maybeSingle();
      setPromptHoy(prompt || null);
    }

    setEstado('listo');
  }

  useEffect(() => { cargar(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  async function salir() {
    await supabase.auth.signOut();
    navigate('/camino/participante/login', { replace: true });
  }

  if (estado === 'cargando') {
    return (
      <div className="chh-root">
        <style>{styles}</style>
        <div className="chh-loading">
          <div className="chh-spinner"></div>
          <p style={{ color: 'var(--lilac)', fontFamily: "'Nunito',sans-serif", fontSize: 14 }}>Verificando tu acceso...</p>
        </div>
      </div>
    );
  }

  if (estado === 'sin_acceso') {
    return (
      <div className="chh-root">
        <style>{styles}</style>
        <div className="chh-loading">
          <div style={{ fontSize: 32 }}>🔒</div>
          <h1 className="chh-title" style={{ fontSize: 22 }}>No encontramos tu acceso</h1>
          <p style={{ color: 'var(--lilac)', fontFamily: "'Nunito',sans-serif", fontSize: 14, maxWidth: 320 }}>
            Tu cuenta todavía no tiene un acceso activo al Camino. Pide un link de invitación a tu gestor.
          </p>
          <button className="chh-btn" onClick={() => navigate('/camino/participante/login')}>IR AL LOGIN</button>
        </div>
      </div>
    );
  }

  const diaActual = participante?.dia_actual ?? 1;
  const diasRegistrados = racha.dias_registrados || [];
  const checkpointsRegistrados = racha.checkpoints_registrados || [];
  const porcentaje = Math.round((racha.dias_completados / TOTAL_DIAS) * 100);

  const diasPendientes = [];
  for (let d = 1; d <= diaActual; d++) {
    if (!diasRegistrados.includes(d)) diasPendientes.push(d);
  }

  function checkpointPendiente() {
    for (let i = DIAS_CHECKPOINT.length - 1; i >= 0; i--) {
      const numero = i + 1;
      const diaCp = DIAS_CHECKPOINT[i];
      if (diaActual >= diaCp && !checkpointsRegistrados.includes(numero)) {
        return { numero, dia: diaCp };
      }
    }
    return null;
  }
  const cpPendiente = checkpointPendiente();

  const formatoNombre = fichaHoy?.camino_formatos_ficha?.nombre || fichaHoy?.titulo_dia || '';
  const formatoEmoji = fichaHoy?.camino_formatos_ficha?.emoji || '✨';

  async function enviarCheckpoint() {
    setCpMsgError(''); setCpMsgOk('');
    if (!cpPendiente) return;
    setCpEnviando(true);
    try {
      let capturasUrl = null;
      if (cpArchivo) {
        const { data: sessionData } = await supabase.auth.getSession();
        const uid = sessionData?.session?.user?.id;
        const ext = cpArchivo.name.split('.').pop();
        const path = `${uid}/checkpoint-${cpPendiente.numero}-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('evidencia-camino').upload(path, cpArchivo);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from('evidencia-camino').getPublicUrl(path);
        capturasUrl = pub?.publicUrl || null;
      }

      const { error } = await supabase.rpc('camino_registrar_checkpoint', {
        p_numero_checkpoint: cpPendiente.numero,
        p_dia_numero: cpPendiente.dia,
        p_avances_texto: cpAvances.trim() || null,
        p_capturas_url: capturasUrl,
      });
      if (error) throw error;

      setCpMsgOk('¡Checkpoint registrado! Sigue así, Templario.');
      setCpAvances('');
      setCpArchivo(null);
      const { data: rachaData } = await supabase.rpc('camino_mi_racha');
      if (rachaData && rachaData.length > 0) setRacha(rachaData[0]);
      setTimeout(() => setModal(null), 1200);
    } catch (e) {
      setCpMsgError('No se pudo registrar tu checkpoint. Intenta de nuevo.');
    }
    setCpEnviando(false);
  }

  return (
    <div className="chh-root">
      <style>{styles}</style>
      <div className="chh-stars">
        {estrellas.map(s => (
          <div key={s.id} className="chh-star" style={{
            width: `${s.size}px`, height: `${s.size}px`, top: `${s.top}%`, left: `${s.left}%`,
            '--d': `${s.dur}s`, '--del': `${s.delay}s`, '--min': s.min,
          }} />
        ))}
      </div>

      <nav className="chh-topnav">
        <div className="chh-brand">
          <div className="chh-brand-name">TEMPLO <span>DEL PROPÓSITO</span></div>
        </div>
        <div className="chh-nav-links">
          {NAV_ITEMS.map(item => {
            if (!item.disponible) {
              return (
                <span key={item.label} className="chh-nav-item proximamente">
                  {item.label} <span className="chh-badge-prox">Próximamente</span>
                </span>
              );
            }
            if (item.ruta) {
              return <button key={item.label} className="chh-nav-item" onClick={() => navigate(item.ruta)}>{item.label}</button>;
            }
            return <span key={item.label} className={`chh-nav-item ${item.activo ? 'active' : ''}`}>{item.label}</span>;
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <CaminoModoToggle />
          <button className="chh-salir" onClick={salir}>Salir</button>
        </div>
      </nav>

      <div className="chh-hero">
        <div className="chh-hero-inner">
          <div className="chh-eyebrow-row">
            <div className="chh-eyebrow-icon">🗺️</div>
            <div>
              <div className="chh-eyebrow-tag">TU CAMINO ESTÁ EN MARCHA</div>
              <h1 className="chh-title">Hola, {participante?.nombre?.split(' ')[0] || 'Templario'}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="chh-wrap">

        {/* ============ HOY TE TOCA ============ */}
        {fichaHoy && (
          <div className="chh-card chh-hoy-card">
            <div className="chh-hoy-top">
              <div className="chh-hoy-meta">
                <div className="chh-hoy-dia">DÍA {diaActual} DE {TOTAL_DIAS}</div>
                {fichaHoy.tipo_publicacion && <div className="chh-hoy-badge">{fichaHoy.tipo_publicacion}</div>}
              </div>
              <div className="chh-hoy-titulo">{formatoEmoji} {formatoNombre}</div>
              {fichaHoy.camino_formatos_ficha?.descripcion_corta && (
                <div className="chh-hoy-desc">{fichaHoy.camino_formatos_ficha.descripcion_corta}</div>
              )}
              <div className="chh-hoy-botones">
                {fichaHoy.referencia_url && (
                  <a className="chh-btn chh-btn-sm chh-btn-outline" href={fichaHoy.referencia_url} target="_blank" rel="noreferrer">▶ VER REFERENCIA</a>
                )}
                <button className="chh-btn chh-btn-sm chh-btn-outline" onClick={() => setModal('ficha')}>📄 VER LA FICHA DEL FORMATO</button>
              </div>
            </div>

            {videoHoy?.video_estado === 'listo' && videoHoy?.video_id ? (
              <div className="chh-hoy-video">
                <iframe
                  src={`https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoHoy.video_id}`}
                  loading="lazy"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                  allowFullScreen
                  title="Video de referencia"
                />
              </div>
            ) : (
              <div className="chh-hoy-sinvideo">Todavía no hay video de referencia para este día.</div>
            )}

            <div className="chh-hoy-bottom">
              <button className="chh-btn chh-hoy-full" onClick={() => setModal('guion')}>✨ GENERAR GUION CON IA</button>

              <button className="chh-btn chh-btn-outline chh-hoy-full chh-hoy-acordeon" onClick={() => setIdeaAbierta(v => !v)}>
                📄 VER LA IDEA COMPLETA <span className={`chh-chevron ${ideaAbierta ? 'chh-chevron-up' : ''}`}>⌄</span>
              </button>
              {ideaAbierta && (
                <div className="chh-idea-panel">
                  {fichaHoy.tema && (<div className="chh-modal-section"><div className="chh-modal-label">Tema</div><div className="chh-modal-text">{fichaHoy.tema}</div></div>)}
                  {fichaHoy.hook_verbal && (<div className="chh-modal-section"><div className="chh-modal-label">Hook verbal</div><div className="chh-modal-text">{fichaHoy.hook_verbal}</div></div>)}
                  {fichaHoy.hook_textual && (<div className="chh-modal-section"><div className="chh-modal-label">Hook textual</div><div className="chh-modal-text">{fichaHoy.hook_textual}</div></div>)}
                  {fichaHoy.hook_visual && (<div className="chh-modal-section"><div className="chh-modal-label">Hook visual</div><div className="chh-modal-text">{fichaHoy.hook_visual}</div></div>)}
                  {fichaHoy.estructura && (<div className="chh-modal-section"><div className="chh-modal-label">Estructura</div><div className="chh-modal-text">{fichaHoy.estructura}</div></div>)}
                  {fichaHoy.contenido && (<div className="chh-modal-section"><div className="chh-modal-label">Contenido</div><div className="chh-modal-text">{fichaHoy.contenido}</div></div>)}
                </div>
              )}

              <button className="chh-btn chh-hoy-full" style={{ marginTop: 12 }} onClick={() => navigate(`/camino/participante/panel?dia=${diaActual}`)}>📸 REGISTRAR EVIDENCIA DE HOY</button>
            </div>
          </div>
        )}

        {/* ============ Día actual / evidencia + qué es esto ============ */}
        <div className="chh-grid">
          <div className="chh-card">
            <div className="chh-progress">
              <div className="chh-day-label">Día <span className="num">{diaActual}</span> de tu Camino</div>
              <div className="chh-day-sub">Publica tu evidencia de hoy para mantener tu constancia.</div>
              <button className="chh-btn" onClick={() => navigate(`/camino/participante/panel?dia=${diaActual}`)}>📸 REGISTRAR EVIDENCIA</button>
            </div>
          </div>

          <div className="chh-card chh-intro-card">
            <div className="chh-section-label">¿En qué consiste este camino?</div>
            <p>Publica contenido durante tu camino, registra <b>cada venta</b> que te traiga y cumple tu <b>paso semanal de avance</b>. Al final, tú y tu líder deciden si esto se vuelve tu siguiente nivel.</p>
          </div>
        </div>

        {/* ============ Racha / progreso ============ */}
        <div className="chh-grid3">
          <div className="chh-card">
            <div className="chh-racha-label">Racha actual</div>
            <div className="chh-racha-num">{racha.racha_actual} 🔥</div>
            <div className="chh-racha-sub">días seguidos · mejor racha {racha.mejor_racha}</div>
          </div>
          <div className="chh-card">
            <div className="chh-racha-label">Progreso</div>
            <div className="chh-racha-num">{diaActual}/{TOTAL_DIAS}</div>
            <div className="chh-progreso-barra"><div className="chh-progreso-fill" style={{ width: `${porcentaje}%` }} /></div>
            <div className="chh-racha-sub">{porcentaje}% del reto</div>
          </div>
          <div className="chh-card">
            <div className="chh-racha-label">Completados</div>
            <div className="chh-racha-num">{racha.dias_completados}</div>
            <div className="chh-racha-sub">de {TOTAL_DIAS} días registrados</div>
          </div>
        </div>

        {/* ============ Barra de 28 días ============ */}
        <div className="chh-card chh-calendario-card">
          <div className="chh-calendario-head">
            <div className="chh-section-label" style={{ marginBottom: 0 }}>Tu calendario</div>
            <div className="chh-calendario-count">{racha.dias_completados}/{TOTAL_DIAS} días</div>
          </div>
          <div className="chh-barra-dias">
            {Array.from({ length: TOTAL_DIAS }, (_, i) => i + 1).map(d => {
              const esCheckpoint = DIAS_CHECKPOINT.includes(d);
              let clase = 'chh-dia-futuro';
              if (diasRegistrados.includes(d)) clase = 'chh-dia-verde';
              else if (d === diaActual) clase = 'chh-dia-azul';
              else if (d < diaActual) clase = 'chh-dia-rojo';
              return (
                <div key={d} className={`chh-dia-box ${clase} ${esCheckpoint ? 'chh-dia-checkpoint' : ''}`}>
                  {d}
                  {esCheckpoint && <span className="chh-dia-bandera">🚩</span>}
                  {d === diaActual && (
                    <img src={URL_PERSONAJE_DIA_ACTUAL} alt="" className="chh-dia-personaje" />
                  )}
                </div>
              );
            })}
          </div>
          <div className="chh-calendario-legend">🚩 Los días marcados son <b>&nbsp;checkpoints&nbsp;</b> del reto.</div>
        </div>

        {/* ============ Checkpoint pendiente ============ */}
        {cpPendiente && (
          <div className="chh-card chh-checkpoint-card">
            <img src={URL_PERSONAJE_CHECKPOINT} alt="" className="chh-checkpoint-personaje" />
            <div className="chh-checkpoint-bubble">
              <div className="chh-checkpoint-tag">Checkpoint {cpPendiente.numero}</div>
              <div className="chh-checkpoint-msg">¡Hoy es el Checkpoint {cpPendiente.numero}! Sube tus avances y capturas.</div>
            </div>
            <div className="chh-checkpoint-actions">
              <button className="chh-btn" onClick={() => setModal('checkpoint')}>🚩 REGISTRAR CHECKPOINT</button>
            </div>
          </div>
        )}

        {/* ============ Material del camino ============ */}
        <div>
          <div className="chh-section-label">Material del camino</div>
          <a className="chh-material-item" href="#" onClick={(e) => { e.preventDefault(); navigate('/camino/participante/bases'); }}>
            <div className="chh-material-left">
              <div className="chh-material-icon">📜</div>
              <div className="chh-material-title">Bases del reto</div>
            </div>
            <div className="chh-material-cta">ABRIR →</div>
          </a>
          <a className="chh-material-item" href="#" onClick={(e) => { e.preventDefault(); navigate('/camino/participante/calendario-historias'); }}>
            <div className="chh-material-left">
              <div className="chh-material-icon">🗓️</div>
              <div className="chh-material-title">Calendario de Historias</div>
            </div>
            <div className="chh-material-cta">ABRIR →</div>
          </a>
          <a className="chh-material-item" href="#" onClick={(e) => { e.preventDefault(); navigate('/camino/participante/banco-razones'); }}>
            <div className="chh-material-left">
              <div className="chh-material-icon">⏳</div>
              <div className="chh-material-title">Banco de Razones de Urgencia</div>
            </div>
            <div className="chh-material-cta">ABRIR →</div>
          </a>
        </div>

        {/* ============ Días pendientes ============ */}
        <div className="chh-card">
          <div className="chh-section-label">Días pendientes</div>
          {diasPendientes.length === 0 ? (
            <div className="chh-pendientes-vacio">🎉 Estás al corriente con todos tus días.</div>
          ) : (
            <div className="chh-pendientes-scroll">
              {diasPendientes.map(d => (
                <div key={d} className="chh-pendiente-item">
                  <div className="chh-pendiente-dia">📔 Día {d}</div>
                  <button className="chh-btn chh-btn-sm" onClick={() => navigate(`/camino/participante/panel?dia=${d}`)}>Registrar</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================= MODALES ================= */}

      {modal === 'ficha' && fichaHoy && (
        <div className="chh-modal-overlay" onClick={() => setModal(null)}>
          <div className="chh-modal" onClick={(e) => e.stopPropagation()}>
            <div className="chh-modal-head">
              <div className="chh-modal-title">{formatoEmoji} {formatoNombre}</div>
              <button className="chh-modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            {fichaHoy.camino_formatos_ficha?.que_es_cuando_usarlo && (
              <div className="chh-modal-section">
                <div className="chh-modal-label">Qué es y cuándo usarlo</div>
                <div className="chh-modal-text">{fichaHoy.camino_formatos_ficha.que_es_cuando_usarlo}</div>
              </div>
            )}
            {fichaHoy.camino_formatos_ficha?.por_que_funciona && (
              <div className="chh-modal-section">
                <div className="chh-modal-label">Por qué funciona</div>
                <div className="chh-modal-text">{fichaHoy.camino_formatos_ficha.por_que_funciona}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {modal === 'guion' && (
        <CaminoGuionModal formato={formatoNombre} onClose={() => setModal(null)} />
      )}

      {modal === 'checkpoint' && cpPendiente && (
        <div className="chh-modal-overlay" onClick={() => setModal(null)}>
          <div className="chh-modal" onClick={(e) => e.stopPropagation()}>
            <div className="chh-modal-head">
              <div className="chh-modal-title">🚩 Registrar Checkpoint {cpPendiente.numero}</div>
              <button className="chh-modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="chh-form-row">
              <label>Cuéntanos tus avances</label>
              <textarea className="chh-textarea" rows={4} value={cpAvances} onChange={(e) => setCpAvances(e.target.value)} placeholder="¿Qué has logrado hasta ahora en tu Camino?" />
            </div>
            <div className="chh-form-row">
              <label>Sube una captura (opcional)</label>
              <input className="chh-input-text" type="file" accept="image/*" onChange={(e) => setCpArchivo(e.target.files?.[0] || null)} />
            </div>
            <button className="chh-btn" disabled={cpEnviando} onClick={enviarCheckpoint}>
              {cpEnviando ? 'REGISTRANDO...' : 'REGISTRAR CHECKPOINT'}
            </button>
            {cpMsgOk && <p className="chh-msg-ok">{cpMsgOk}</p>}
            {cpMsgError && <p className="chh-msg-error">{cpMsgError}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

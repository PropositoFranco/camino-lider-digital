import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

/* ============================================================================
   IMÁGENES — pendientes de tu parte
   ============================================================================
   Sube tus 12 boards + tus 60 slides sueltos (5 por secuencia) + tu índice
   general a tu bucket de Supabase Storage "camino-recursos", dentro de una
   carpeta "historias/", con esta convención de nombres (o cambia BASE_URL /
   los nombres de archivo de cada secuencia más abajo si prefieres otra):

   camino-recursos/historias/board-01.png ... board-12.png
   camino-recursos/historias/01/slide-1.png ... slide-5.png
   camino-recursos/historias/02/slide-1.png ... slide-5.png
   ... (03 a 12 igual)
   camino-recursos/historias/indice-general.png

   Mientras no existan, los boards se muestran como placeholder y los botones
   de descarga muestran un aviso en vez de descargar un archivo roto.
   ========================================================================== */

const BASE_URL = 'https://hdwzhwuhlrtrmhnecypm.supabase.co/storage/v1/object/public/camino-recursos/historias';
const URL_INDICE_GENERAL = `${BASE_URL}/indice-general.png`;

async function descargarImagen(url, nombreArchivo) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('no encontrada');
    const blob = await res.blob();
    const objUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objUrl;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objUrl);
  } catch {
    alert('Esta imagen todavía no ha sido subida por tu equipo. Vuelve a intentarlo más tarde.');
  }
}

const SEQS = [
  {
    semana: "Semana 1 · Validar y calentar",
    numero: "01", titulo: "Toma el pulso y valida el dolor",
    tag: "Encuestas", ejemplo: "Entrenadora fitness", palabra: "YO", carpeta: "01",
    plantilla: [
      { icono: "🎥", h: "H1 · Gancho", texto: "Si [acción del avatar] y [resultado frustrante], esta historia es para ti." },
      { icono: "🎥", h: "H2 · Encuesta", texto: "¿Qué es lo que más te cuesta con [tema]? A) ... B) ... C) ..." },
      { icono: "📸", h: "H3 · Dato/dolor", texto: "La mayoría responde [más votada]... porque [razón del dolor]." },
      { icono: "📸", h: "H4 · Promesa", texto: "La buena noticia: [promesa] en [tiempo/pasos]." },
      { icono: "🎥", h: "H5 · CTA", texto: "Responde YO si quieres que te muestre por dónde empezar." },
    ],
  },
  {
    semana: "Semana 1 · Validar y calentar",
    numero: "02", titulo: "Mito del nicho que te frena",
    tag: "One-Shot", ejemplo: "Asesor financiero", palabra: "VERDAD", carpeta: "02",
    plantilla: [
      { icono: "🎥", h: "H1 · Gancho", texto: "Lo que NADIE te cuenta sobre [tema del nicho]..." },
      { icono: "🎥", h: "H2 · El mito", texto: "Todos repiten que [creencia popular falsa]." },
      { icono: "📸", h: "H3 · Consecuencia", texto: "Consecuencia: [problema que sufre el avatar]." },
      { icono: "📸", h: "H4 · Solución", texto: "Lo que sí funciona: [tu verdad en 1 frase]." },
      { icono: "🎥", h: "H5 · CTA", texto: "Responde VERDAD y te digo qué te puede estar frenando." },
    ],
  },
  {
    semana: "Semana 1 · Validar y calentar",
    numero: "03", titulo: "Humaniza: el detrás de cámara",
    tag: "Libre / Lifestyle", ejemplo: "Diseñadora freelance", palabra: "DIARIO", carpeta: "03",
    plantilla: [
      { icono: "🎥", h: "H1 · Gancho", texto: "Hoy [momento real de tu día] y pensé en algo..." },
      { icono: "📸", h: "H2 · Emoción", texto: "[Emoción honesta del momento]." },
      { icono: "📸", h: "H3 · Reflexión", texto: "Reflexión: [lección humana que conecta]." },
      { icono: "🎥", h: "H4 · Aprendizaje", texto: "Aprendizaje: [cómo se aplica a la vida del avatar]." },
      { icono: "🎥", h: "H5 · CTA", texto: "Responde DIARIO si quieres más detrás de cámara." },
    ],
  },
  {
    semana: "Semana 2 · Educar y aportar",
    numero: "04", titulo: "Micro entrenamiento aplicable hoy",
    tag: "One-Shot / Educación", ejemplo: "Coach de oratoria", palabra: "TIPS", carpeta: "04",
    plantilla: [
      { icono: "🎥", h: "H1 · Gancho", texto: "Micro entrenamiento: cómo [resultado pequeño] en [tiempo corto]." },
      { icono: "🎥", h: "H2 · Paso 1", texto: "Paso 1: [acción]." },
      { icono: "📸", h: "H3 · Paso 2", texto: "Paso 2: [acción]." },
      { icono: "🎥", h: "H4 · Paso 3", texto: "Paso 3: [acción]." },
      { icono: "🎥", h: "H5 · CTA", texto: "Responde TIPS y te paso la versión completa." },
    ],
  },
  {
    semana: "Semana 2 · Educar y aportar",
    numero: "05", titulo: "Regalo gratis que captura leads",
    tag: "Lead Magnet", ejemplo: "Nutricionista", palabra: "REGALO", carpeta: "05",
    plantilla: [
      { icono: "🎥", h: "H1 · Gancho", texto: "Hice [recurso: plantilla/guía/checklist] de [tema]." },
      { icono: "🎥", h: "H2 · El porqué", texto: "Lo creé porque [problema del avatar]." },
      { icono: "📸", h: "H3 · Qué hay dentro", texto: "Adentro: [beneficio 1], [beneficio 2], [beneficio 3]." },
      { icono: "🎥", h: "H4 · Gratis", texto: "Es 100% gratis, solo para quien lo pida hoy." },
      { icono: "🎥", h: "H5 · CTA", texto: "Responde REGALO y te lo envío al toque." },
    ],
  },
  {
    semana: "Semana 2 · Educar y aportar",
    numero: "06", titulo: "Prueba social: transformación real",
    tag: "Caso de éxito", ejemplo: "Agente inmobiliario", palabra: "CASO", carpeta: "06",
    plantilla: [
      { icono: "🎥", h: "H1 · Gancho", texto: "Te presento a [nombre]. [Situación inicial dolorosa]." },
      { icono: "📸", h: "H2 · El problema", texto: "Su problema: [obstáculo principal]." },
      { icono: "📸", h: "H3 · El proceso", texto: "El proceso: 1) [paso] 2) [paso] 3) [paso]." },
      { icono: "📸", h: "H4 · Resultado", texto: "Resultado → [transformación medible]." },
      { icono: "🎥", h: "H5 · CTA", texto: "Responde CASO si quieres un proceso parecido." },
    ],
  },
  {
    semana: "Semana 3 · Segmentar y demostrar",
    numero: "07", titulo: "Segmenta antes de ofrecer",
    tag: "Encuestas", ejemplo: "Profesor de inglés", palabra: "LISTO", carpeta: "07",
    plantilla: [
      { icono: "🎥", h: "H1 · Gancho", texto: "Pregunta rápida para los que [perfil listo]..." },
      { icono: "🎥", h: "H2 · Encuesta", texto: "¿En qué punto estás con [tema]? A) Empezando B) Estancado C) Listo para [nivel]." },
      { icono: "📸", h: "H3 · Segmenta", texto: "Si marcaste [mayor intención], esto es para ti." },
      { icono: "🎥", h: "H4 · Puente", texto: "Porque [lo que preparas] es justo para ese punto." },
      { icono: "🎥", h: "H5 · CTA", texto: "Responde LISTO y te cuento qué sigue." },
    ],
  },
  {
    semana: "Semana 3 · Segmentar y demostrar",
    numero: "08", titulo: "Demostración + regalo de cierre",
    tag: "Lead Magnet", ejemplo: "Experto en productividad", palabra: "DEMO", carpeta: "08",
    plantilla: [
      { icono: "🎥", h: "H1 · Gancho", texto: "Mira cómo funciona [tu método] en tiempo real: [muestra]." },
      { icono: "🎥", h: "H2 · El porqué", texto: "Esto funciona porque [razón clave]." },
      { icono: "📸", h: "H3 · Beneficio", texto: "El beneficio: [lo que deja de sufrir el avatar]." },
      { icono: "📸", h: "H4 · Entregable", texto: "Lo armé en una [plantilla/mini-guía] que puedes usar." },
      { icono: "🎥", h: "H5 · CTA", texto: "Responde DEMO y te la mando para aplicarla hoy." },
    ],
  },
  {
    semana: "Semana 3 · Segmentar y demostrar",
    numero: "09", titulo: "Vulnerabilidad: mi error y lección",
    tag: "Libre / Storytelling", ejemplo: "E-commerce", palabra: "LECCIÓN", carpeta: "09",
    plantilla: [
      { icono: "🎥", h: "H1 · Gancho", texto: "Hoy me acordé del error más caro que cometí en [tu área]..." },
      { icono: "📸", h: "H2 · Contexto", texto: "Contexto: [qué estabas haciendo]." },
      { icono: "📸", h: "H3 · El error", texto: "El error: [qué hiciste mal]." },
      { icono: "🎥", h: "H4 · Aprendizaje", texto: "El aprendizaje: [la lección que cambió tu enfoque]." },
      { icono: "🎥", h: "H5 · CTA", texto: "Responde LECCIÓN si quieres evitar ese error." },
    ],
  },
  {
    semana: "Semana 4 · Historia y cierre suave",
    numero: "10", titulo: "Mi historia + regalo que la resuelve",
    tag: "Storytelling → Lead Magnet", ejemplo: "Coach de hábitos", palabra: "GUÍA", carpeta: "10",
    plantilla: [
      { icono: "🎥", h: "H1 · Gancho", texto: "Hoy [escena real] me recordó por qué hago lo que hago..." },
      { icono: "📸", h: "H2 · Tu antes", texto: "Hace [tiempo] yo estaba [situación inicial dolorosa]." },
      { icono: "🎥", h: "H3 · El cambio", texto: "Lo que cambió todo: [el insight / método que descubriste]." },
      { icono: "📸", h: "H4 · Regalo", texto: "De ahí salió [recurso gratuito] que armé para que no pases por lo mismo." },
      { icono: "🎥", h: "H5 · CTA", texto: "Responde GUÍA y te la envío gratis, sin compromiso." },
    ],
  },
  {
    semana: "Semana 4 · Historia y cierre suave",
    numero: "11", titulo: "Valida el tema y entrega el recurso",
    tag: "Encuesta → Lead Magnet", ejemplo: "Fotógrafo / creador", palabra: "MAPA", carpeta: "11",
    plantilla: [
      { icono: "🎥", h: "H1 · Gancho", texto: "Pregunta honesta para los que [perfil del avatar]..." },
      { icono: "🎥", h: "H2 · Encuesta", texto: "¿Qué te cuesta más con [tema]? A) ... B) ... C) ..." },
      { icono: "📸", h: "H3 · El recurso", texto: "Me lo preguntan tanto que preparé algo: [recurso gratuito]." },
      { icono: "🎥", h: "H4 · Qué hay dentro", texto: "Adentro: [beneficio 1] y [beneficio 2], listo para hoy." },
      { icono: "🎥", h: "H5 · CTA", texto: "Responde MAPA con tu letra (A/B/C) y te lo mando gratis." },
    ],
  },
  {
    semana: "Semana 4 · Historia y cierre suave",
    numero: "12", titulo: "Detrás de cámara + recurso gratis",
    tag: "Lifestyle → Lead Magnet", ejemplo: "Organizadora de eventos", palabra: "CHECKLIST", carpeta: "12",
    plantilla: [
      { icono: "🎥", h: "H1 · Gancho", texto: "Así se ve un día normal mío [escena lifestyle]..." },
      { icono: "📸", h: "H2 · El detrás", texto: "Lo que casi nadie ve es [proceso / herramienta detrás]." },
      { icono: "📸", h: "H3 · El sistema", texto: "Uso [recurso / sistema] que me ahorra [tiempo/esfuerzo] cada día." },
      { icono: "🎥", h: "H4 · Gratis", texto: "Lo dejé en versión gratuita por si te sirve igual que a mí." },
      { icono: "🎥", h: "H5 · CTA", texto: "Responde CHECKLIST y te lo paso gratis, sin vueltas." },
    ],
  },
];

export default function CaminoParticipanteCalendarioHistoriasPage() {
  const navigate = useNavigate();

  const stars = useMemo(() => {
    const n = typeof window !== "undefined" && window.innerWidth < 760 ? 30 : 60;
    return Array.from({ length: n }, () => ({
      size: (Math.random() * 1.5 + 0.6).toFixed(1),
      top: (Math.random() * 100).toFixed(1),
      left: (Math.random() * 100).toFixed(1),
      dur: (Math.random() * 4 + 3).toFixed(1),
      delay: (Math.random() * 4).toFixed(1),
      min: (Math.random() * 0.4 + 0.15).toFixed(2),
    }));
  }, []);

  useEffect(() => {
    const links = [
      "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cinzel+Decorative:wght@700;900&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap&font-display=swap",
      "https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap&font-display=swap",
    ];
    const created = links.map((href) => {
      const el = document.createElement("link");
      el.rel = "stylesheet";
      el.href = href;
      document.head.appendChild(el);
      return el;
    });
    return () => created.forEach((el) => document.head.removeChild(el));
  }, []);

  let semanaAnterior = null;

  return (
    <div className="calh-page">
      <style>{CSS}</style>

      <div className="stars">
        {stars.map((s, i) => (
          <div key={i} className="star" style={{
            width: `${s.size}px`, height: `${s.size}px`, top: `${s.top}%`, left: `${s.left}%`,
            "--d": `${s.dur}s`, "--del": `${s.delay}s`, "--min": s.min,
          }} />
        ))}
      </div>

      <nav className="topnav">
        <div className="brand-name">TEMPLO <span>DEL PROPÓSITO</span></div>
        <button className="back-link" onClick={() => navigate('/camino/participante/home')}>← Volver a Inicio</button>
      </nav>

      <div className="wrap">
        <div className="eyebrow">PAQUETE DE APOYO · ROAD TO 1K — CREA PARA VENDER</div>
        <h1 className="page-title">Calendario de Historias</h1>
        <p className="lede">
          12 secuencias de Stories <b>ya diseñadas</b> — cómo se ven publicadas, de principio a fin. Cada una trae
          su <b>plantilla</b> (adáptala a tu nicho, rellena los <b>[corchetes]</b>) y su ejemplo real montado en el
          estilo Templo del Propósito. Copia la estructura, cambia el contenido y súbelas.
        </p>
        <p className="body-text">
          <b>Cómo usarlas:</b> mira el board para ver el ritmo visual (nunca dos tomas iguales seguidas: 🎥 video /
          📸 foto / captura / mockup). Toma la plantilla de la derecha, adáptala a tu oferta y graba. La última
          historia siempre pide una <b>palabra clave</b> por DM para abrir conversación.
        </p>
        <div className="leyenda-row">
          <span>🎥 Video / selfie</span>
          <span>📸 Foto / captura / objetos</span>
          <span>[corchete] = rellénalo tú</span>
          <span>«PALABRA» = respuesta por DM</span>
        </div>

        <button className="btn-descargar-todo" onClick={() => descargarImagen(URL_INDICE_GENERAL, 'indice-general-historias.png')}>
          ⬇ Descargar índice general · las 12 secuencias en una sola imagen
        </button>

        {SEQS.map((s) => {
          const nuevaSemana = s.semana !== semanaAnterior;
          semanaAnterior = s.semana;
          return (
            <div key={s.numero}>
              {nuevaSemana && <h2 className="semana-title">{s.semana}</h2>}
              <div className="seq-card">
                <div className="seq-head">
                  <div className="seq-num">{s.numero}</div>
                  <div>
                    <div className="seq-titulo">{s.titulo}</div>
                    <div className="seq-meta">
                      <span className="seq-chip">{s.tag}</span>
                      <span className="seq-meta-txt">Ejemplo: {s.ejemplo}</span>
                      <span className="seq-chip seq-chip-green">Responde «{s.palabra}»</span>
                    </div>
                  </div>
                </div>

                <div className="seq-body">
                  <div className="seq-board">
                    <img
                      src={`${BASE_URL}/board-${s.carpeta}.png`}
                      alt={`Board ${s.numero} — ${s.titulo}`}
                      onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                    />
                    <div className="seq-board-placeholder">📷 Board pendiente de subir</div>
                  </div>
                  <div className="seq-plantilla">
                    <div className="seq-plantilla-label">Plantilla — adáptala a tu nicho</div>
                    {s.plantilla.map((p) => (
                      <div key={p.h} className="seq-linea">
                        <span className="seq-icono">{p.icono}</span>
                        <div><b>{p.h}</b><br />{p.texto}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="seq-slides">
                  <span>⬇ Slides sueltos (1080×1920):</span>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      className="slide-btn"
                      onClick={() => descargarImagen(`${BASE_URL}/${s.carpeta}/slide-${n}.png`, `historia-${s.numero}-slide-${n}.png`)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        <div className="footer-nota">
          12 secuencias · 60 historias diseñadas · listas para copiar y pegar.<br />
          Paquete de apoyo del reto <b>Road to 1k — Crea para Vender</b> · Templo del Propósito.
        </div>
      </div>
    </div>
  );
}

const CSS = `
:root{
  --gold:#D4AF37; --gold-bright:#FFE566; --gold-dim:rgba(212,175,55,0.4); --gold-glow:rgba(212,175,55,0.65);
  --dark-surface:rgba(10,5,32,0.92); --dark-surface-2:rgba(16,8,40,0.75);
  --purple:#CC44FF; --lilac:rgba(200,185,240,0.72); --lilac-dim:rgba(200,185,240,0.45);
  --green:#44ff88; --red:#ff4466;
}
.calh-page *,.calh-page *::before,.calh-page *::after{margin:0;padding:0;box-sizing:border-box;}
.calh-page{
  min-height:100dvh; width:100%; position:relative;
  background:
    radial-gradient(ellipse 120% 50% at 50% 0%, rgba(40,10,90,0.9) 0%, transparent 60%),
    radial-gradient(ellipse 70% 40% at 12% 15%, rgba(10,40,100,0.35) 0%, transparent 55%),
    linear-gradient(180deg,#050215 0%,#0a0530 18%,#08031c 55%,#04020e 100%);
  font-family:'Crimson Text',serif; color:#fff;
}
.calh-page .stars{position:fixed; inset:0; pointer-events:none; z-index:0;}
.calh-page .star{position:absolute; border-radius:50%; background:#fff; animation:calh-twinkle var(--d) ease-in-out infinite; animation-delay:var(--del);}
@keyframes calh-twinkle{0%,100%{opacity:var(--min);} 50%{opacity:1;}}

.calh-page .topnav{
  position:relative; z-index:10; display:flex; align-items:center; justify-content:space-between; gap:14px;
  padding:14px 26px; background:linear-gradient(180deg, rgba(6,3,18,0.97), rgba(6,3,18,0.88)); border-bottom:1px solid var(--gold-dim);
}
.calh-page .brand-name{font-family:'Cinzel',serif; font-weight:900; letter-spacing:1px; font-size:16px; color:#fff;}
.calh-page .brand-name span{color:var(--gold);}
.calh-page .back-link{
  font-family:'Cinzel',serif; font-weight:700; font-size:12px; color:var(--lilac); background:none; border:1px solid var(--gold-dim);
  border-radius:100px; padding:8px 16px; cursor:pointer;
}
.calh-page .back-link:hover{color:var(--gold-bright); border-color:var(--gold);}

.calh-page .wrap{position:relative; z-index:1; max-width:980px; margin:0 auto; padding:36px 24px 60px;}
.calh-page .eyebrow{font-family:'Cinzel',serif; font-weight:900; font-size:11.5px; letter-spacing:2px; color:var(--gold); margin-bottom:10px;}
.calh-page .page-title{font-family:'Cinzel Decorative',serif; font-weight:900; font-size:clamp(26px,4vw,38px); color:#fff; margin-bottom:14px;}
.calh-page .lede{font-family:'Crimson Text',serif; font-size:16.5px; line-height:1.6; color:rgba(255,255,255,0.85); margin-bottom:14px;}
.calh-page .lede b{color:var(--gold-bright); font-weight:600;}
.calh-page p.body-text{font-family:'Crimson Text',serif; font-size:15px; line-height:1.6; color:rgba(255,255,255,0.85); margin-bottom:14px;}
.calh-page p.body-text b{color:var(--gold-bright); font-weight:600;}

.calh-page .leyenda-row{display:flex; flex-wrap:wrap; gap:14px; font-family:'Nunito',sans-serif; font-size:12px; color:var(--lilac); margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid var(--gold-dim);}

.calh-page .btn-descargar-todo{
  display:block; width:100%; text-align:left; font-family:'Cinzel',serif; font-weight:900; font-size:12.5px; letter-spacing:0.3px;
  color:var(--gold-bright); background:rgba(212,175,55,0.1); border:1px solid var(--gold-dim); border-radius:12px;
  padding:14px 18px; margin-bottom:28px; cursor:pointer;
}
.calh-page .btn-descargar-todo:hover{background:rgba(212,175,55,0.16); border-color:var(--gold);}

.calh-page .semana-title{font-family:'Cinzel',serif; font-weight:900; font-size:19px; color:#fff; margin:30px 0 14px; padding-left:14px; border-left:3px solid var(--gold);}

.calh-page .seq-card{background:var(--dark-surface); border:1px solid var(--gold-dim); border-radius:16px; padding:20px 22px; margin-bottom:18px;}
.calh-page .seq-head{display:flex; gap:14px; align-items:flex-start; margin-bottom:16px;}
.calh-page .seq-num{
  width:34px; height:34px; flex-shrink:0; border-radius:9px; background:rgba(212,175,55,0.15); border:1px solid var(--gold);
  color:var(--gold-bright); font-family:'Cinzel',serif; font-weight:900; font-size:14px; display:flex; align-items:center; justify-content:center;
}
.calh-page .seq-titulo{font-family:'Cinzel',serif; font-weight:900; font-size:17px; color:#fff; margin-bottom:6px;}
.calh-page .seq-meta{display:flex; flex-wrap:wrap; align-items:center; gap:8px;}
.calh-page .seq-chip{font-family:'Nunito',sans-serif; font-weight:800; font-size:10.5px; padding:3px 10px; border-radius:100px; background:rgba(58,160,255,0.15); color:#8fc4ff; border:1px solid rgba(58,160,255,0.35);}
.calh-page .seq-chip-green{background:rgba(68,255,136,0.12); color:var(--green); border-color:rgba(68,255,136,0.35);}
.calh-page .seq-meta-txt{font-family:'Nunito',sans-serif; font-size:11.5px; color:var(--lilac);}

.calh-page .seq-body{display:grid; grid-template-columns:1.2fr 1fr; gap:18px; margin-bottom:14px;}
@media (max-width:760px){ .calh-page .seq-body{grid-template-columns:1fr;} }
.calh-page .seq-board{position:relative; border-radius:12px; overflow:hidden; background:#fff; min-height:160px; display:flex; align-items:center; justify-content:center;}
.calh-page .seq-board img{width:100%; display:block;}
.calh-page .seq-board-placeholder{
  display:none; position:absolute; inset:0; align-items:center; justify-content:center; text-align:center;
  font-family:'Nunito',sans-serif; font-size:12.5px; color:#666; background:#f2f2f2; padding:12px;
}
.calh-page .seq-plantilla{background:rgba(255,255,255,0.03); border:1px solid var(--gold-dim); border-radius:12px; padding:14px 16px;}
.calh-page .seq-plantilla-label{font-family:'Cinzel',serif; font-weight:900; font-size:10.5px; letter-spacing:0.8px; color:var(--gold); text-transform:uppercase; margin-bottom:10px;}
.calh-page .seq-linea{display:flex; gap:8px; font-family:'Nunito',sans-serif; font-size:12px; line-height:1.5; color:rgba(255,255,255,0.88); margin-bottom:9px;}
.calh-page .seq-linea:last-child{margin-bottom:0;}
.calh-page .seq-linea b{color:var(--gold-bright);}
.calh-page .seq-icono{flex-shrink:0;}

.calh-page .seq-slides{display:flex; align-items:center; gap:8px; flex-wrap:wrap; font-family:'Nunito',sans-serif; font-size:12px; color:var(--lilac); padding-top:12px; border-top:1px solid rgba(212,175,55,0.15);}
.calh-page .slide-btn{
  width:26px; height:26px; border-radius:7px; background:rgba(212,175,55,0.12); border:1px solid var(--gold-dim);
  color:var(--gold-bright); font-family:'Cinzel',serif; font-weight:900; font-size:11px; cursor:pointer;
}
.calh-page .slide-btn:hover{background:rgba(212,175,55,0.2); border-color:var(--gold);}

.calh-page .footer-nota{font-family:'Nunito',sans-serif; font-size:11.5px; line-height:1.6; color:var(--lilac-dim); text-align:center; margin-top:34px;}
.calh-page .footer-nota b{color:var(--gold);}
`;

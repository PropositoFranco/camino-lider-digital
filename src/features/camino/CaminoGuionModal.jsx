import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { supabaseCamino as supabase } from "../../services/supabaseCamino";

const styles = `
.cgm-overlay{
  position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center;
  padding:20px; background:rgba(4,2,14,0.86); backdrop-filter:blur(3px);
  animation:cgm-fade .18s ease-out; overflow-y:auto;
}
@keyframes cgm-fade{ from{opacity:0;} to{opacity:1;} }
.cgm-modal{
  width:100%; max-width:600px; max-height:88vh; overflow-y:auto;
  background:linear-gradient(180deg, rgba(14,7,38,0.98), rgba(6,3,18,0.98));
  border:1px solid var(--gold-dim,rgba(212,175,55,0.4)); border-radius:18px;
  padding:26px 24px 22px; position:relative; margin:auto;
  box-shadow:0 0 40px rgba(212,175,55,0.18), 0 20px 60px rgba(0,0,0,0.6);
  animation:cgm-rise .22s ease-out;
}
@keyframes cgm-rise{ from{transform:translateY(14px); opacity:0;} to{transform:translateY(0); opacity:1;} }
.cgm-close{
  position:absolute; top:14px; right:14px; width:30px; height:30px; border-radius:50%;
  background:rgba(212,175,55,0.1); border:1px solid var(--gold-dim,rgba(212,175,55,0.4));
  color:var(--lilac,#c8b9f0); font-size:16px; cursor:pointer; line-height:1;
}
.cgm-close:hover{ color:#FFE566; border-color:#D4AF37; }
.cgm-eyebrow{
  font-family:'Cinzel',serif; font-weight:900; font-size:11px; letter-spacing:2px;
  color:#D4AF37; margin-bottom:6px; display:flex; align-items:center; gap:6px;
}
.cgm-title{
  font-family:'Cinzel Decorative',serif; font-weight:900; font-size:20px; color:#fff; margin-bottom:4px;
}
.cgm-subtitle{
  font-family:'Nunito',sans-serif; font-size:13px; color:rgba(200,185,240,0.7); margin-bottom:18px; line-height:1.5;
}

.cgm-steps{ display:flex; flex-direction:column; gap:16px; margin-bottom:20px; }
.cgm-step{ display:flex; gap:12px; align-items:flex-start; }
.cgm-step-num{
  flex-shrink:0; width:26px; height:26px; border-radius:50%;
  background:rgba(212,175,55,0.14); border:1px solid #D4AF37; color:#FFE566;
  font-family:'Cinzel',serif; font-weight:900; font-size:12px;
  display:flex; align-items:center; justify-content:center;
}
.cgm-step-body{ flex:1; padding-top:2px; min-width:0; }
.cgm-step-title-row{ display:flex; align-items:center; justify-content:space-between; gap:8px; }
.cgm-step-title{ font-family:'Cinzel',serif; font-weight:700; font-size:13.5px; color:#fff; margin-bottom:2px; }
.cgm-step-desc{ font-family:'Nunito',sans-serif; font-size:12.5px; color:rgba(200,185,240,0.75); line-height:1.5; }
.cgm-step-counter{
  font-family:'Cinzel',serif; font-weight:900; font-size:10.5px; color:#D4AF37;
  background:rgba(212,175,55,0.1); border:1px solid var(--gold-dim,rgba(212,175,55,0.35));
  border-radius:20px; padding:3px 10px; white-space:nowrap; flex-shrink:0;
}

/* ── Temas: grid de tarjetas clickeables ────────────────────────── */
.cgm-temas-categoria{
  font-family:'Cinzel',serif; font-weight:900; font-size:10px; letter-spacing:1.4px; text-transform:uppercase;
  color:#CC44FF; opacity:0.85; margin:14px 0 8px;
}
.cgm-temas-categoria:first-child{ margin-top:10px; }
.cgm-temas-grid{
  display:grid; grid-template-columns:repeat(auto-fill,minmax(122px,1fr)); gap:10px;
}
.cgm-tema-card{
  position:relative; overflow:hidden; text-align:left; cursor:pointer;
  display:flex; flex-direction:column; gap:6px; align-items:flex-start;
  padding:13px 12px 12px; border-radius:14px;
  background:linear-gradient(150deg, rgba(212,175,55,0.05), rgba(204,68,255,0.05));
  border:1px solid rgba(212,175,55,0.16);
  transition:transform .16s ease, border-color .16s ease, box-shadow .16s ease, background .16s ease;
}
.cgm-tema-card:hover{
  transform:translateY(-3px);
  border-color:rgba(212,175,55,0.55);
  box-shadow:0 8px 20px rgba(212,175,55,0.14);
}
.cgm-tema-card.seleccionado{
  border-color:#D4AF37;
  background:linear-gradient(150deg, rgba(212,175,55,0.18), rgba(204,68,255,0.12));
  box-shadow:0 0 0 1px rgba(212,175,55,0.45), 0 10px 24px rgba(212,175,55,0.22);
}
.cgm-tema-card.seleccionado::before{
  content:''; position:absolute; inset:0; pointer-events:none;
  background:radial-gradient(circle at 88% -12%, rgba(255,229,102,0.4), transparent 62%);
  animation:cgm-tema-glow 1.5s ease-in-out infinite alternate;
}
@keyframes cgm-tema-glow{ from{opacity:.45;} to{opacity:1;} }
.cgm-tema-card.deshabilitada{ opacity:0.35; cursor:not-allowed; }
.cgm-tema-card.deshabilitada:hover{ transform:none; box-shadow:none; border-color:rgba(212,175,55,0.16); }
.cgm-tema-bg-icon{
  position:absolute; right:-8px; bottom:-16px; font-size:58px; opacity:0.07;
  transform:rotate(-14deg); pointer-events:none; line-height:1; user-select:none;
}
.cgm-tema-icon{ font-size:21px; filter:drop-shadow(0 0 6px rgba(212,175,55,0.25)); }
.cgm-tema-titulo{
  font-family:'Cinzel',serif; font-weight:700; font-size:12px; color:#fff; line-height:1.3;
}
.cgm-tema-check{
  position:absolute; top:8px; right:8px; width:19px; height:19px; border-radius:50%;
  background:#D4AF37; color:#1a1206; display:flex; align-items:center; justify-content:center;
  font-size:11px; font-weight:900; opacity:0; transform:scale(.4); transition:opacity .15s, transform .15s;
}
.cgm-tema-card.seleccionado .cgm-tema-check{ opacity:1; transform:scale(1); }
.cgm-temas-hint{
  font-family:'Nunito',sans-serif; font-size:11.5px; color:rgba(200,185,240,0.55); margin-top:12px; line-height:1.5;
}

.cgm-field-label{
  font-family:'Cinzel',serif; font-weight:700; font-size:11.5px; letter-spacing:0.4px;
  color:var(--lilac,#c8b9f0); margin-bottom:6px; display:block; margin-top:16px;
}
.cgm-input{
  width:100%; padding:11px 13px; border-radius:10px;
  background:rgba(255,255,255,0.05); border:1px solid rgba(212,175,55,0.3);
  color:#fff; font-family:'Nunito',sans-serif; font-size:14px; outline:none;
}
.cgm-input:focus{ border-color:#D4AF37; }
.cgm-prompt-box{
  background:rgba(212,175,55,0.06); border:1px solid rgba(212,175,55,0.3); border-radius:12px;
  padding:16px; font-family:'Nunito',sans-serif; font-size:13.5px; line-height:1.6;
  color:rgba(255,255,255,0.92); white-space:pre-wrap; max-height:220px; overflow-y:auto;
}
.cgm-actions{ display:flex; gap:10px; flex-wrap:wrap; margin-top:14px; }
.cgm-btn{
  padding:12px 18px; border-radius:10px; cursor:pointer;
  font-family:'Cinzel',serif; font-weight:900; font-size:11px; letter-spacing:0.8px;
  border:1px solid #D4AF37; background:rgba(212,175,55,0.14); color:#FFE566; flex:1; min-width:150px;
  text-align:center; transition:background .15s, transform .1s;
}
.cgm-btn:hover{ background:rgba(212,175,55,0.22); }
.cgm-btn:active{ transform:scale(0.98); }
.cgm-btn.secondary{ background:transparent; border-color:rgba(200,185,240,0.4); color:var(--lilac,#c8b9f0); }
.cgm-hint{
  font-family:'Nunito',sans-serif; font-size:12px; color:rgba(200,185,240,0.6); margin-top:10px; line-height:1.5;
}
`;

/* ══════════════════════════════════════════════════════════════════
   CATÁLOGO DE TEMAS — extraído de la Base de Conocimiento Maestra.
   Editable a mano por ahora (misma lógica que BRAND_CONTEXT abajo).
   Cuando se construya el panel de Gestor, esto se mueve a Supabase
   sin tocar el resto del modal.
═══════════════════════════════════════════════════════════════════ */
const TEMAS_PROPOTIENDA = [
  {
    categoria: "⚔️ Tu transformación",
    items: [
      { id: "territorios", icono: "🗺️", titulo: "Los 8 Territorios de vida", hook: "el mapa completo del sistema interno — Cuerpo, Mente, Emociones, Relaciones, Riqueza, Vocación, Espiritualidad y Ocio, y cómo cada uno alimenta a los demás" },
      { id: "evaluacion", icono: "🧭", titulo: "Evaluación semanal", hook: "las 25 preguntas en 5 pilares (Visión, Control, Influencia, Autonomía, Realización) que detectan tu punto más débil de la semana" },
      { id: "protocolo", icono: "🛡️", titulo: "Protocolo semanal", hook: "el ejercicio personalizado que recibes cada semana según el pilar que salió más débil en tu evaluación" },
      { id: "herramientas", icono: "🛍️", titulo: "Catálogo de herramientas", hook: "las series VR y CLAVE — cada producto ataca un territorio específico de tu vida, nunca al azar" },
    ],
  },
  {
    categoria: "🏆 Tu progreso",
    items: [
      { id: "niveles", icono: "⚔️", titulo: "20 niveles por XP", hook: "el camino de Despertar hasta Propo-Leyenda, con recompensas reales en cada nivel" },
      { id: "racha", icono: "🔥", titulo: "Racha diaria", hook: "cómo entrar día tras día se convierte en recompensas crecientes hasta el día 30" },
      { id: "ranking", icono: "📈", titulo: "Ranking semanal", hook: "cómo tu esfuerzo interno se vuelve visible frente a toda la comunidad, con PropoCoins y XP en juego" },
      { id: "templarios100", icono: "🎲", titulo: "100 Templarios Dijeron", hook: "el juego de trivia con 440 preguntas y sabidurías que trabaja hasta los territorios sin tienda directa" },
    ],
  },
  {
    categoria: "👥 Tu comunidad",
    items: [
      { id: "comunidad", icono: "💬", titulo: "Comunidad interna", hook: "el feed, los niveles de comunidad y cómo se desbloquean el chat interno y los mensajes directos" },
      { id: "ruleta", icono: "🎰", titulo: "Ruleta VIP y sorteos", hook: "giros gratis, herramientas premium y becas de 6 meses al 100% de descuento" },
      { id: "alianza", icono: "🤝", titulo: "Sistema Alianza", hook: "cómo invitar con tu código y llegar a pagar solo $1 USD al mes" },
    ],
  },
  {
    categoria: "💎 Tu inversión",
    items: [
      { id: "membresias", icono: "💳", titulo: "Membresías y ofertas", hook: "el plan Crecimiento, PropoPass VIP y los paquetes especiales — y por qué es un compromiso de 6 meses, no una suscripción que se olvida" },
      { id: "arsenal", icono: "🖥️", titulo: "Arsenal RPG", hook: "componentes de código con la estética del Templo, para devs y creadores — se desbloquea en nivel 3" },
      { id: "becas", icono: "🎓", titulo: "Becas y donaciones", hook: "cómo la transformación no depende solo del dinero — es una apuesta real por el potencial de la persona" },
    ],
  },
];

const MAX_TEMAS = 3;

const BRAND_CONTEXT = `CONTEXTO DE MARCA — TEMPLO DEL PROPÓSITO / PROPOTIENDA.COM

Quién habla: un Líder Digital del Templo del Propósito, embajador de la metodología dentro de propotienda.com. Su tono es de autoridad cercana y transformadora — nunca genérico, nunca de venta agresiva.

Identidad de marca: épica, aspiracional, de crecimiento personal real. Lenguaje que inspira acción sin prometer resultados exagerados ni garantizados (estamos en fase de prueba, no se promete dinero ni resultados específicos).

Estructura obligatoria del guion, en TODOS los formatos:
1) Gancho (0-3 segundos): texto en pantalla + estímulo visual que detiene el scroll de inmediato.
2) Desarrollo en 3 puntos claros, directos y transformadores — ligados al tema elegido.
3) Llamado a la acción (CTA) contundente, alineado con propotienda.com.

Checklist de calidad que el guion debe poder pasar antes de publicarse:
- ¿El gancho detiene el scroll en los primeros 3 segundos?
- ¿Respeta la estructura del formato asignado sin desviarse del mensaje principal?
- ¿Es legible/verbal, listo para grabar sin ambigüedad?
- ¿El CTA le dice a la audiencia exactamente qué hacer al terminar?
`;

function armarTemaTexto(temasSeleccionados, audiencia) {
  const temasTexto = temasSeleccionados.length
    ? temasSeleccionados.map((t) => t.titulo).join(" + ")
    : "";
  const audienciaTrim = (audiencia || "").trim();
  if (temasTexto && audienciaTrim) return `${temasTexto} (mi audiencia: ${audienciaTrim})`;
  if (temasTexto) return temasTexto;
  if (audienciaTrim) return audienciaTrim;
  return "[Insertar Nicho/Audiencia]";
}

function armarPrompt(promptTexto, temaTexto) {
  return promptTexto.replace("[Insertar Nicho/Audiencia]", temaTexto);
}

function construirBrief({ formato, diaNumero, detalle, temasSeleccionados, audiencia }) {
  let brief = BRAND_CONTEXT;
  brief += `\n---\n\nFORMATO DE HOY${diaNumero ? ` (Día ${diaNumero})` : ""}: ${formato}\n`;

  if (temasSeleccionados.length) {
    brief += `\nTemas de propotienda elegidos para hoy:\n`;
    temasSeleccionados.forEach((t) => {
      brief += `· ${t.titulo} — ${t.hook}\n`;
    });
  }
  if (audiencia) brief += `\nAudiencia del creador: ${audiencia}\n`;

  if (detalle) {
    brief += "\nDesglose de referencia para este formato (úsalo como guía de tono y estructura, adáptalo a los temas de arriba):\n";
    if (detalle.hookTextual) brief += `\n· Hook textual de referencia:\n${detalle.hookTextual}\n`;
    if (detalle.hookVisual) brief += `\n· Hook visual de referencia:\n${detalle.hookVisual}\n`;
    if (detalle.contenido) brief += `\n· Contenido/desarrollo de referencia:\n${detalle.contenido}\n`;
    if (detalle.estructura) brief += `\n· Estructura de referencia:\n${detalle.estructura}\n`;
  }
  brief += "\n---\nInstrucción final: usa este brief como contexto de marca y arma el guion con los temas elegidos, en el formato del día — no repitas literalmente el ejemplo de referencia, solo imita su tono y estructura.\n";
  return brief;
}

function descargarBrief(texto, nombreArchivo) {
  const blob = new Blob([texto], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Modal "Generar Guion con IA" — Selector visual de temas + Prompt Maestro
 * + Brief de Marca descargable. Montado vía Portal directo en document.body
 * para evitar bugs de overlay causados por overflow/filter/transform en
 * ancestros (day-card, etc).
 *
 * Uso: <CaminoGuionModal formato="Ranking" diaNumero={4} detalle={detalle} onClose={...} />
 */
export default function CaminoGuionModal({ formato, diaNumero, detalle, onClose }) {
  const [cargando, setCargando] = useState(true);
  const [promptTexto, setPromptTexto] = useState("");
  const [audiencia, setAudiencia] = useState("");
  const [temasSeleccionados, setTemasSeleccionados] = useState([]);
  const [copiado, setCopiado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let activo = true;
    async function cargar() {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData?.session?.user?.id;

      const [{ data: promptRow }, { data: participanteRow }] = await Promise.all([
        supabase
          .from("camino_prompts_formato")
          .select("prompt_texto")
          .eq("formato", formato)
          .maybeSingle(),
        uid
          ? supabase.from("camino_participantes").select("nicho").eq("id", uid).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      if (!activo) return;
      setPromptTexto(promptRow?.prompt_texto || "");
      setAudiencia(participanteRow?.nicho || "");
      setCargando(false);
    }
    cargar();
    return () => { activo = false; };
  }, [formato]);

  // Bloquea el scroll del fondo mientras el modal está abierto
  useEffect(() => {
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previo; };
  }, []);

  async function guardarAudiencia(valor) {
    setGuardando(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData?.session?.user?.id;
    if (uid) {
      await supabase.from("camino_participantes").update({ nicho: valor }).eq("id", uid);
    }
    setGuardando(false);
  }

  function toggleTema(tema) {
    setTemasSeleccionados((prev) => {
      const yaEsta = prev.some((t) => t.id === tema.id);
      if (yaEsta) return prev.filter((t) => t.id !== tema.id);
      if (prev.length >= MAX_TEMAS) return prev;
      return [...prev, tema];
    });
  }

  const temaTexto = armarTemaTexto(temasSeleccionados, audiencia);
  const promptFinal = armarPrompt(promptTexto, temaTexto);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(promptFinal);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // fallback silencioso si el navegador bloquea el clipboard
    }
  }

  function bajarBrief() {
    const brief = construirBrief({ formato, diaNumero, detalle, temasSeleccionados, audiencia });
    const nombre = `brief-templo-dia${diaNumero || ""}-${formato}.txt`.replace(/\s+/g, "-").toLowerCase();
    descargarBrief(brief, nombre);
  }

  const modal = (
    <div className="cgm-overlay" onClick={onClose}>
      <style>{styles}</style>
      <div className="cgm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="cgm-close" onClick={onClose} aria-label="Cerrar">✕</button>
        <div className="cgm-eyebrow">🪄 GENERADOR DE GUIONES</div>
        <div className="cgm-title">Guion para "{formato}"</div>
        <div className="cgm-subtitle">
          Sigue estos pasos para tener tu guion listo en menos de 1 minuto.
        </div>

        {cargando ? (
          <p style={{ color: "var(--lilac)", fontFamily: "'Nunito',sans-serif", fontSize: 14 }}>
            Preparando tu prompt...
          </p>
        ) : (
          <>
            <div className="cgm-steps">
              <div className="cgm-step">
                <div className="cgm-step-num">1</div>
                <div className="cgm-step-body">
                  <div className="cgm-step-title-row">
                    <div className="cgm-step-title">¿De qué van a hablar hoy?</div>
                    <div className="cgm-step-counter">{temasSeleccionados.length}/{MAX_TEMAS}</div>
                  </div>
                  <div className="cgm-step-desc">
                    Toca hasta {MAX_TEMAS} temas reales de propotienda. El sistema arma tu guion con ellos.
                  </div>

                  {TEMAS_PROPOTIENDA.map((grupo) => (
                    <div key={grupo.categoria}>
                      <div className="cgm-temas-categoria">{grupo.categoria}</div>
                      <div className="cgm-temas-grid">
                        {grupo.items.map((tema) => {
                          const seleccionado = temasSeleccionados.some((t) => t.id === tema.id);
                          const deshabilitada = !seleccionado && temasSeleccionados.length >= MAX_TEMAS;
                          return (
                            <button
                              key={tema.id}
                              type="button"
                              className={`cgm-tema-card${seleccionado ? " seleccionado" : ""}${deshabilitada ? " deshabilitada" : ""}`}
                              onClick={() => !deshabilitada && toggleTema(tema)}
                            >
                              <span className="cgm-tema-bg-icon">{tema.icono}</span>
                              <span className="cgm-tema-check">✓</span>
                              <span className="cgm-tema-icon">{tema.icono}</span>
                              <span className="cgm-tema-titulo">{tema.titulo}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <label className="cgm-field-label" htmlFor="cgm-audiencia">
                    Tu audiencia (opcional)
                  </label>
                  <input
                    id="cgm-audiencia"
                    className="cgm-input"
                    placeholder="Ej. Mamás emprendedoras, gente que quiere ingreso extra..."
                    value={audiencia}
                    onChange={(e) => setAudiencia(e.target.value)}
                    onBlur={(e) => guardarAudiencia(e.target.value)}
                  />
                </div>
              </div>

              <div className="cgm-step">
                <div className="cgm-step-num">2</div>
                <div className="cgm-step-body">
                  <div className="cgm-step-title">Descarga el Brief de Marca</div>
                  <div className="cgm-step-desc">Un documento con el contexto del Templo, tus temas elegidos y la referencia del formato de hoy. Se lo vas a dar a tu IA para que entienda de qué hablar y cómo hablamos.</div>
                  <div className="cgm-actions" style={{ marginTop: 8 }}>
                    <button className="cgm-btn secondary" onClick={bajarBrief}>📎 DESCARGAR BRIEF</button>
                  </div>
                </div>
              </div>

              <div className="cgm-step">
                <div className="cgm-step-num">3</div>
                <div className="cgm-step-body">
                  <div className="cgm-step-title">Abre tu IA y sube el Brief</div>
                  <div className="cgm-step-desc">Entra a ChatGPT, Gemini o Claude (la que ya uses) y arrastra ahí el archivo que descargaste en el paso 2.</div>
                </div>
              </div>

              <div className="cgm-step">
                <div className="cgm-step-num">4</div>
                <div className="cgm-step-body">
                  <div className="cgm-step-title">Copia y pega este prompt</div>
                  <div className="cgm-step-desc">Después de subir el Brief, pega este texto en el mismo chat. Tu IA te va a devolver el guion completo, listo para grabar.</div>
                  <div className="cgm-prompt-box" style={{ marginTop: 8 }}>{promptFinal}</div>
                  <div className="cgm-actions">
                    <button className="cgm-btn" onClick={copiar}>
                      {copiado ? "✅ COPIADO" : "📋 COPIAR PROMPT"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="cgm-actions">
              <button className="cgm-btn secondary" onClick={onClose}>CERRAR</button>
            </div>

            <p className="cgm-hint">
              El Brief y el prompt trabajan juntos: el Brief le da a tu IA el contexto de marca, tus temas y un ejemplo
              de referencia; el prompt le pide el guion nuevo. {guardando ? " Guardando tu audiencia…" : ""}
            </p>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
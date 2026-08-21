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
  width:100%; max-width:580px; max-height:88vh; overflow-y:auto;
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

.cgm-steps{ display:flex; flex-direction:column; gap:14px; margin-bottom:20px; }
.cgm-step{ display:flex; gap:12px; align-items:flex-start; }
.cgm-step-num{
  flex-shrink:0; width:26px; height:26px; border-radius:50%;
  background:rgba(212,175,55,0.14); border:1px solid #D4AF37; color:#FFE566;
  font-family:'Cinzel',serif; font-weight:900; font-size:12px;
  display:flex; align-items:center; justify-content:center;
}
.cgm-step-body{ flex:1; padding-top:2px; }
.cgm-step-title{ font-family:'Cinzel',serif; font-weight:700; font-size:13.5px; color:#fff; margin-bottom:2px; }
.cgm-step-desc{ font-family:'Nunito',sans-serif; font-size:12.5px; color:rgba(200,185,240,0.75); line-height:1.5; }

.cgm-field-label{
  font-family:'Cinzel',serif; font-weight:700; font-size:12px; letter-spacing:0.4px;
  color:var(--lilac,#c8b9f0); margin-bottom:6px; display:block;
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
  text-align:center;
}
.cgm-btn:hover{ background:rgba(212,175,55,0.22); }
.cgm-btn.secondary{ background:transparent; border-color:rgba(200,185,240,0.4); color:var(--lilac,#c8b9f0); }
.cgm-hint{
  font-family:'Nunito',sans-serif; font-size:12px; color:rgba(200,185,240,0.6); margin-top:10px; line-height:1.5;
}
`;

const BRAND_CONTEXT = `CONTEXTO DE MARCA — TEMPLO DEL PROPÓSITO / PROPOTIENDA.COM

Quién habla: un Líder Digital del Templo del Propósito, embajador de la metodología dentro de propotienda.com. Su tono es de autoridad cercana y transformadora — nunca genérico, nunca de venta agresiva.

Identidad de marca: épica, aspiracional, de crecimiento personal real. Lenguaje que inspira acción sin prometer resultados exagerados ni garantizados (estamos en fase de prueba, no se promete dinero ni resultados específicos).

Estructura obligatoria del guion, en TODOS los formatos:
1) Gancho (0-3 segundos): texto en pantalla + estímulo visual que detiene el scroll de inmediato.
2) Desarrollo en 3 puntos claros, directos y transformadores — ligados al nicho del creador.
3) Llamado a la acción (CTA) contundente, enfocado en el nicho y alineado con propotienda.com.

Checklist de calidad que el guion debe poder pasar antes de publicarse:
- ¿El gancho detiene el scroll en los primeros 3 segundos?
- ¿Respeta la estructura del formato asignado sin desviarse del mensaje principal?
- ¿Es legible/verbal, listo para grabar sin ambigüedad?
- ¿El CTA le dice a la audiencia exactamente qué hacer al terminar?
`;

function armarPrompt(promptTexto, nicho) {
  const nichoFinal = (nicho || "").trim() || "[Insertar Nicho/Audiencia]";
  return promptTexto.replace("[Insertar Nicho/Audiencia]", nichoFinal);
}

function construirBrief({ formato, diaNumero, detalle, nicho }) {
  let brief = BRAND_CONTEXT;
  brief += `\n---\n\nFORMATO DE HOY${diaNumero ? ` (Día ${diaNumero})` : ""}: ${formato}\n`;
  if (nicho) brief += `Nicho del creador: ${nicho}\n`;
  if (detalle) {
    brief += "\nDesglose de referencia para este formato (úsalo como guía de tono y estructura, adáptalo al nicho de arriba):\n";
    if (detalle.hookTextual) brief += `\n· Hook textual de referencia:\n${detalle.hookTextual}\n`;
    if (detalle.hookVisual) brief += `\n· Hook visual de referencia:\n${detalle.hookVisual}\n`;
    if (detalle.contenido) brief += `\n· Contenido/desarrollo de referencia:\n${detalle.contenido}\n`;
    if (detalle.estructura) brief += `\n· Estructura de referencia:\n${detalle.estructura}\n`;
  }
  brief += "\n---\nInstrucción final: usa este brief como contexto de marca y adapta el guion del prompt a un tema NUEVO dentro del nicho del creador — no repitas literalmente el ejemplo de referencia, solo imita su tono y estructura.\n";
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
 * Modal "Generar Guion con IA" — Prompt Maestro + Brief de Marca descargable.
 * Se monta vía Portal directo en document.body para evitar bugs de overlay
 * causados por overflow/filter/transform en ancestros (day-card, etc).
 *
 * Uso: <CaminoGuionModal formato="Ranking" diaNumero={4} detalle={detalle} onClose={...} />
 */
export default function CaminoGuionModal({ formato, diaNumero, detalle, onClose }) {
  const [cargando, setCargando] = useState(true);
  const [promptTexto, setPromptTexto] = useState("");
  const [nicho, setNicho] = useState("");
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
      setNicho(participanteRow?.nicho || "");
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

  async function guardarNicho(valor) {
    setGuardando(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData?.session?.user?.id;
    if (uid) {
      await supabase.from("camino_participantes").update({ nicho: valor }).eq("id", uid);
    }
    setGuardando(false);
  }

  const promptFinal = armarPrompt(promptTexto, nicho);

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
    const brief = construirBrief({ formato, diaNumero, detalle, nicho });
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
          Sigue estos 4 pasos para tener tu guion listo en menos de 1 minuto.
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
                  <div className="cgm-step-title">Escribe tu nicho</div>
                  <div className="cgm-step-desc">De qué hablas o a quién le hablas (ej. "Nutrición para mamás ocupadas"). Se guarda solo, no lo vuelves a escribir.</div>
                  <input
                    id="cgm-nicho"
                    className="cgm-input"
                    style={{ marginTop: 8 }}
                    placeholder="Ej. Nutrición para mamás ocupadas"
                    value={nicho}
                    onChange={(e) => setNicho(e.target.value)}
                    onBlur={(e) => guardarNicho(e.target.value)}
                  />
                </div>
              </div>

              <div className="cgm-step">
                <div className="cgm-step-num">2</div>
                <div className="cgm-step-body">
                  <div className="cgm-step-title">Descarga el Brief de Marca</div>
                  <div className="cgm-step-desc">Un documento con el contexto del Templo y la referencia del formato de hoy. Se lo vas a dar a tu IA para que entienda quién eres y cómo hablamos.</div>
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
              El Brief y el prompt trabajan juntos: el Brief le da a tu IA el contexto de marca y un ejemplo de
              referencia; el prompt le pide el guion nuevo para tu nicho. {guardando ? " Guardando tu nicho…" : ""}
            </p>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
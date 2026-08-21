import { useEffect, useState, useCallback } from "react";
import { supabaseCamino as supabase } from "../../services/supabaseCamino";

const BANNER_URL =
  "https://hdwzhwuhlrtrmhnecypm.supabase.co/storage/v1/object/public/banners/camino/camino-checkin-banner.webp";
const SELLO_URL =
  "https://hdwzhwuhlrtrmhnecypm.supabase.co/storage/v1/object/public/banners/sellos/sello-1.png";

const styles = `
.ccp-wrap{
  position:relative; border-radius:18px; overflow:hidden;
  border:1px solid rgba(212,175,55,0.35);
  background:linear-gradient(180deg, rgba(14,7,38,0.98), rgba(6,3,18,0.98));
  box-shadow:0 0 30px rgba(212,175,55,0.1);
  margin-bottom:20px;
}
.ccp-banner{
  position:relative; width:100%; height:120px; overflow:hidden;
}
.ccp-banner img{
  width:100%; height:100%; object-fit:cover; display:block;
  filter:brightness(0.55) saturate(1.1);
}
.ccp-banner::after{
  content:''; position:absolute; inset:0;
  background:linear-gradient(180deg, rgba(4,2,14,0.1) 0%, rgba(4,2,14,0.95) 100%);
}
.ccp-banner-text{
  position:absolute; left:20px; bottom:12px; z-index:2;
}
.ccp-eyebrow{
  font-family:'Cinzel',serif; font-weight:900; font-size:10.5px; letter-spacing:2px;
  color:#D4AF37; margin-bottom:4px;
}
.ccp-title{
  font-family:'Cinzel Decorative',serif; font-weight:900; font-size:19px; color:#fff;
  text-shadow:0 2px 10px rgba(0,0,0,0.6);
}
.ccp-body{ padding:18px 18px 20px; }
.ccp-subtitle{
  font-family:'Nunito',sans-serif; font-size:12.5px; color:rgba(200,185,240,0.72);
  line-height:1.5; margin-bottom:16px;
}

.ccp-progress-row{ display:flex; align-items:center; gap:10px; margin-bottom:16px; }
.ccp-progress-track{
  flex:1; height:8px; border-radius:20px; background:rgba(255,255,255,0.08);
  overflow:hidden; position:relative;
}
.ccp-progress-fill{
  height:100%; border-radius:20px;
  background:linear-gradient(90deg, #D4AF37, #FFE566, #CC44FF);
  background-size:200% 100%;
  transition:width .35s cubic-bezier(.4,0,.2,1);
  animation:ccp-shimmer 2.4s linear infinite;
}
@keyframes ccp-shimmer{ 0%{background-position:0% 0;} 100%{background-position:200% 0;} }
.ccp-progress-count{
  font-family:'Cinzel',serif; font-weight:900; font-size:11px; color:#D4AF37; white-space:nowrap;
}

.ccp-grid{ display:flex; flex-direction:column; gap:10px; }
.ccp-item{
  position:relative; overflow:hidden; text-align:left; cursor:pointer; width:100%;
  display:flex; align-items:center; gap:13px;
  padding:13px 14px; border-radius:14px;
  background:linear-gradient(150deg, rgba(212,175,55,0.04), rgba(204,68,255,0.04));
  border:1px solid rgba(212,175,55,0.16);
  transition:transform .15s ease, border-color .15s ease, background .15s ease, box-shadow .15s ease;
}
.ccp-item:hover{ transform:translateX(2px); border-color:rgba(212,175,55,0.4); }
.ccp-item.activo{
  border-color:#D4AF37;
  background:linear-gradient(150deg, rgba(212,175,55,0.16), rgba(204,68,255,0.1));
  box-shadow:0 0 0 1px rgba(212,175,55,0.4), 0 6px 16px rgba(212,175,55,0.16);
}
.ccp-check-circle{
  flex-shrink:0; width:30px; height:30px; border-radius:50%;
  border:2px solid rgba(212,175,55,0.4); display:flex; align-items:center; justify-content:center;
  font-size:15px; color:transparent; transition:all .18s ease; background:rgba(255,255,255,0.03);
}
.ccp-item.activo .ccp-check-circle{
  border-color:#D4AF37; background:#D4AF37; color:#1a1206; font-weight:900;
  box-shadow:0 0 12px rgba(212,175,55,0.5);
}
.ccp-item-icon{ font-size:19px; flex-shrink:0; filter:drop-shadow(0 0 5px rgba(212,175,55,0.2)); }
.ccp-item-body{ flex:1; min-width:0; }
.ccp-item-title{ font-family:'Cinzel',serif; font-weight:700; font-size:12.5px; color:#fff; margin-bottom:2px; }
.ccp-item-desc{ font-family:'Nunito',sans-serif; font-size:11.5px; color:rgba(200,185,240,0.65); line-height:1.4; }

.ccp-seal-zone{
  margin-top:18px; display:flex; align-items:center; gap:14px;
  padding:14px 16px; border-radius:14px;
  background:rgba(255,255,255,0.02); border:1px dashed rgba(212,175,55,0.25);
  transition:all .3s ease;
}
.ccp-seal-zone.desbloqueado{
  background:linear-gradient(120deg, rgba(212,175,55,0.14), rgba(204,68,255,0.1));
  border:1px solid #D4AF37;
  box-shadow:0 0 24px rgba(212,175,55,0.22);
}
.ccp-seal-img{
  width:46px; height:46px; object-fit:contain; flex-shrink:0;
  filter:grayscale(1) opacity(0.3); transition:filter .4s ease, transform .4s ease;
}
.ccp-seal-zone.desbloqueado .ccp-seal-img{
  filter:grayscale(0) opacity(1) drop-shadow(0 0 10px rgba(212,175,55,0.6));
  transform:scale(1.08) rotate(-4deg);
  animation:ccp-seal-pulse 1.8s ease-in-out infinite;
}
@keyframes ccp-seal-pulse{ 0%,100%{ transform:scale(1.08) rotate(-4deg);} 50%{ transform:scale(1.14) rotate(-4deg);} }
.ccp-seal-text-title{
  font-family:'Cinzel',serif; font-weight:900; font-size:12.5px; color:rgba(200,185,240,0.55); letter-spacing:0.5px;
  transition:color .3s ease;
}
.ccp-seal-zone.desbloqueado .ccp-seal-text-title{ color:#FFE566; }
.ccp-seal-text-desc{
  font-family:'Nunito',sans-serif; font-size:11px; color:rgba(200,185,240,0.5); margin-top:2px; line-height:1.4;
}

.ccp-guardando{
  font-family:'Nunito',sans-serif; font-size:11px; color:rgba(200,185,240,0.45); margin-top:10px; text-align:right;
}
`;

const ITEMS = [
  {
    key: "gancho",
    icono: "🎯",
    titulo: "Gancho (0-3 seg)",
    desc: "El texto en pantalla y el primer estímulo visual detienen el scroll de inmediato.",
  },
  {
    key: "estructura",
    icono: "🏗️",
    titulo: "Estructura",
    desc: "Respeta la arquitectura del formato del día sin desviarse del mensaje principal.",
  },
  {
    key: "legibilidad",
    icono: "📖",
    titulo: "Legibilidad y edición",
    desc: "Los subtítulos son claros, dinámicos y no quedan tapados por los botones de la red social.",
  },
  {
    key: "cta",
    icono: "⚔️",
    titulo: "Llamado a la acción",
    desc: "Indica exactamente qué acción debe tomar la audiencia al terminar de ver el video.",
  },
];

/**
 * Checklist Pre-Publicación — filtro de 30 segundos antes del check-in.
 * Vive dentro de CaminoParticipantePanelPage.jsx, arriba del formulario de check-in.
 *
 * Uso:
 *   <CaminoChecklistPrepublicacion
 *     diaNumero={diaActual}
 *     onCompletoChange={(completo) => setChecklistCompleto(completo)}
 *   />
 *
 * onCompletoChange(true) se dispara cuando las 4 casillas están activas —
 * úsalo para habilitar/deshabilitar el botón de enviar check-in.
 */
export default function CaminoChecklistPrepublicacion({ diaNumero, onCompletoChange }) {
  const [respuestas, setRespuestas] = useState({
    gancho: false,
    estructura: false,
    legibilidad: false,
    cta: false,
  });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [uid, setUid] = useState(null);

  const activos = ITEMS.filter((i) => respuestas[i.key]).length;
  const completo = activos === ITEMS.length;

  useEffect(() => {
    onCompletoChange?.(completo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completo]);

  useEffect(() => {
    let activo = true;
    async function cargar() {
      setCargando(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUid = sessionData?.session?.user?.id;
      if (!currentUid || !diaNumero) {
        if (activo) setCargando(false);
        return;
      }
      setUid(currentUid);

      const { data } = await supabase
        .from("camino_checklist_respuestas")
        .select("gancho, estructura, legibilidad, cta")
        .eq("participante_id", currentUid)
        .eq("dia_numero", diaNumero)
        .maybeSingle();

      if (!activo) return;
      if (data) {
        setRespuestas({
          gancho: !!data.gancho,
          estructura: !!data.estructura,
          legibilidad: !!data.legibilidad,
          cta: !!data.cta,
        });
      } else {
        setRespuestas({ gancho: false, estructura: false, legibilidad: false, cta: false });
      }
      setCargando(false);
    }
    cargar();
    return () => { activo = false; };
  }, [diaNumero]);

  const guardar = useCallback(
    async (nuevasRespuestas) => {
      if (!uid || !diaNumero) return;
      setGuardando(true);
      await supabase
        .from("camino_checklist_respuestas")
        .upsert(
          {
            participante_id: uid,
            dia_numero: diaNumero,
            ...nuevasRespuestas,
            completado_en: new Date().toISOString(),
          },
          { onConflict: "participante_id,dia_numero" }
        );
      setGuardando(false);
    },
    [uid, diaNumero]
  );

  function toggle(key) {
    setRespuestas((prev) => {
      const nuevas = { ...prev, [key]: !prev[key] };
      guardar(nuevas);
      return nuevas;
    });
  }

  return (
    <div className="ccp-wrap">
      <style>{styles}</style>

      <div className="ccp-banner">
        <img src={BANNER_URL} alt="" />
        <div className="ccp-banner-text">
          <div className="ccp-eyebrow">🛡️ FILTRO DEL GUERRERO</div>
          <div className="ccp-title">Checklist Pre-Publicación</div>
        </div>
      </div>

      <div className="ccp-body">
        <p className="ccp-subtitle">
          Antes de registrar tu check-in de hoy, confírmate a ti mismo que tu video está listo para salir a la batalla.
        </p>

        <div className="ccp-progress-row">
          <div className="ccp-progress-track">
            <div
              className="ccp-progress-fill"
              style={{ width: `${(activos / ITEMS.length) * 100}%` }}
            />
          </div>
          <div className="ccp-progress-count">{activos}/{ITEMS.length}</div>
        </div>

        <div className="ccp-grid">
          {ITEMS.map((item) => {
            const activo = respuestas[item.key];
            return (
              <button
                key={item.key}
                type="button"
                className={`ccp-item${activo ? " activo" : ""}`}
                onClick={() => toggle(item.key)}
                disabled={cargando}
              >
                <span className="ccp-check-circle">✓</span>
                <span className="ccp-item-icon">{item.icono}</span>
                <span className="ccp-item-body">
                  <span className="ccp-item-title">{item.titulo}</span>
                  <span className="ccp-item-desc">{item.desc}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className={`ccp-seal-zone${completo ? " desbloqueado" : ""}`}>
          <img className="ccp-seal-img" src={SELLO_URL} alt="Sello de aprobación" />
          <div>
            <div className="ccp-seal-text-title">
              {completo ? "✅ FILTRO SUPERADO — LISTO PARA PUBLICAR" : "Sello bloqueado"}
            </div>
            <div className="ccp-seal-text-desc">
              {completo
                ? "Ya puedes registrar tu check-in de hoy con toda confianza."
                : "Completa las 4 casillas para desbloquear tu check-in."}
            </div>
          </div>
        </div>

        {guardando && <div className="ccp-guardando">Guardando…</div>}
      </div>
    </div>
  );
}
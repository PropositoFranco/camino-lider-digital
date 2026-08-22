import { createPortal } from "react-dom";

const styles = `
.cfm-overlay{
  position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center;
  padding:20px; background:rgba(4,2,14,0.86); backdrop-filter:blur(3px);
  animation:cfm-fade .18s ease-out; overflow-y:auto;
}
@keyframes cfm-fade{ from{opacity:0;} to{opacity:1;} }
.cfm-modal{
  width:100%; max-width:620px; max-height:88vh; overflow-y:auto;
  background:linear-gradient(180deg, rgba(14,7,38,0.98), rgba(6,3,18,0.98));
  border:1px solid var(--gold-dim,rgba(212,175,55,0.4)); border-radius:18px;
  padding:26px 24px 22px; position:relative; margin:auto;
  box-shadow:0 0 40px rgba(212,175,55,0.18), 0 20px 60px rgba(0,0,0,0.6);
  animation:cfm-rise .22s ease-out;
}
@keyframes cfm-rise{ from{transform:translateY(14px); opacity:0;} to{transform:translateY(0); opacity:1;} }
.cfm-close{
  position:absolute; top:14px; right:14px; width:30px; height:30px; border-radius:50%;
  background:rgba(212,175,55,0.1); border:1px solid var(--gold-dim,rgba(212,175,55,0.4));
  color:var(--lilac,#c8b9f0); font-size:16px; cursor:pointer; line-height:1;
}
.cfm-close:hover{ color:#FFE566; border-color:#D4AF37; }
.cfm-eyebrow{
  font-family:'Cinzel',serif; font-weight:900; font-size:11px; letter-spacing:2px;
  color:#D4AF37; margin-bottom:6px; display:flex; align-items:center; gap:6px;
}
.cfm-title{
  font-family:'Cinzel Decorative',serif; font-weight:900; font-size:20px; color:#fff; margin-bottom:4px;
}
.cfm-subtitle{
  font-family:'Nunito',sans-serif; font-size:13px; color:rgba(200,185,240,0.7); margin-bottom:18px; line-height:1.5;
}

.cfm-block{
  background:rgba(255,255,255,0.03); border:1px solid rgba(212,175,55,0.18); border-radius:12px;
  padding:14px 16px; margin-bottom:12px;
}
.cfm-block-label{
  font-family:'Cinzel',serif; font-weight:900; font-size:10.5px; letter-spacing:1px; text-transform:uppercase;
  color:#D4AF37; margin-bottom:6px; display:flex; align-items:center; gap:6px;
}
.cfm-block-text{
  font-family:'Crimson Text',serif; font-size:14px; line-height:1.65; color:rgba(255,255,255,0.9); margin:0;
}
.cfm-ref-link{
  display:inline-flex; align-items:center; gap:6px; margin-top:8px;
  font-family:'Cinzel',serif; font-weight:900; font-size:11.5px; letter-spacing:0.4px;
  color:#FFE566; text-decoration:none;
}
.cfm-ref-link:hover{ text-decoration:underline; }

.cfm-divider{
  display:flex; align-items:center; gap:10px; margin:22px 0 14px;
  font-family:'Cinzel',serif; font-weight:900; font-size:10.5px; letter-spacing:1.6px; text-transform:uppercase;
  color:rgba(200,185,240,0.55);
}
.cfm-divider::before, .cfm-divider::after{
  content:''; flex:1; height:1px; background:rgba(212,175,55,0.2);
}

.cfm-formato-head{ display:flex; align-items:center; gap:10px; margin-bottom:4px; }
.cfm-formato-emoji{ font-size:26px; }
.cfm-formato-nombre{ font-family:'Cinzel Decorative',serif; font-weight:900; font-size:17px; color:#fff; }
.cfm-formato-desc{
  font-family:'Nunito',sans-serif; font-size:13px; color:rgba(200,185,240,0.75); margin-bottom:14px; line-height:1.5;
}
.cfm-formato-block{
  background:rgba(204,68,255,0.06); border:1px solid rgba(204,68,255,0.25); border-radius:12px;
  padding:14px 16px; margin-bottom:12px;
}
.cfm-formato-label{
  font-family:'Cinzel',serif; font-weight:900; font-size:10.5px; letter-spacing:1px; text-transform:uppercase;
  color:#CC44FF; margin-bottom:6px; display:flex; align-items:center; gap:6px;
}

.cfm-actions{ display:flex; gap:10px; flex-wrap:wrap; margin-top:8px; }
.cfm-btn{
  padding:12px 18px; border-radius:10px; cursor:pointer;
  font-family:'Cinzel',serif; font-weight:900; font-size:11px; letter-spacing:0.8px;
  border:1px solid rgba(200,185,240,0.4); background:transparent; color:var(--lilac,#c8b9f0); flex:1;
  text-align:center; transition:background .15s, transform .1s;
}
.cfm-btn:hover{ background:rgba(255,255,255,0.06); }
.cfm-btn:active{ transform:scale(0.98); }

.cfm-empty{
  font-family:'Nunito',sans-serif; font-size:13.5px; color:rgba(200,185,240,0.7); line-height:1.6;
  text-align:center; padding:20px 10px;
}
`;

// ══════════════════════════════════════════════════════════════════
// CaminoFichaModal
// Muestra la ficha completa de un día del Calendario: la referencia
// real, los hooks/contenido específicos de ese día, y la info general
// del formato del que sale (qué es, cuándo usarlo, por qué funciona).
//
// Recibe `ficha` ya resuelta (fila de camino_calendario_fichas + su
// camino_formatos_ficha adjunto en `ficha.formato`) — no vuelve a
// pedir nada a Supabase, para no duplicar la carga que ya hace
// CalendarioCaminoPage.
// ══════════════════════════════════════════════════════════════════
export default function CaminoFichaModal({ ficha, diaNumero, onClose }) {
  const formato = ficha?.formato;

  const modal = (
    <div className="cfm-overlay" onClick={onClose}>
      <style>{styles}</style>
      <div className="cfm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="cfm-close" onClick={onClose} aria-label="Cerrar">✕</button>

        {!ficha ? (
          <>
            <div className="cfm-eyebrow">📄 FICHA DEL FORMATO</div>
            <div className="cfm-title">Día {diaNumero}</div>
            <p className="cfm-empty">Todavía no está cargada la ficha de este día. Se agrega pronto.</p>
          </>
        ) : (
          <>
            <div className="cfm-eyebrow">📄 FICHA DEL FORMATO · DÍA {ficha.dia_numero}</div>
            <div className="cfm-title">{ficha.titulo_dia}</div>
            <div className="cfm-subtitle">
              Esto es exactamente lo que te toca publicar, y la referencia real en la que se basa.
            </div>

            {ficha.referencia_url && (
              <div className="cfm-block">
                <div className="cfm-block-label">👀 La referencia: así se ve hecho</div>
                <a
                  className="cfm-ref-link"
                  href={ficha.referencia_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ▶ Abrir la referencia en Instagram ↗
                </a>
              </div>
            )}

            {ficha.hook_verbal && (
              <div className="cfm-block">
                <div className="cfm-block-label">🎙️ Hook verbal</div>
                <p className="cfm-block-text">{ficha.hook_verbal}</p>
              </div>
            )}

            {ficha.hook_textual && (
              <div className="cfm-block">
                <div className="cfm-block-label">📝 Hook textual</div>
                <p className="cfm-block-text">{ficha.hook_textual}</p>
              </div>
            )}

            {ficha.hook_visual && (
              <div className="cfm-block">
                <div className="cfm-block-label">📝 Hook visual</div>
                <p className="cfm-block-text">{ficha.hook_visual}</p>
              </div>
            )}

            {ficha.tema && (
              <div className="cfm-block">
                <div className="cfm-block-label">📝 Tema</div>
                <p className="cfm-block-text">{ficha.tema}</p>
              </div>
            )}

            {ficha.contenido && (
              <div className="cfm-block">
                <div className="cfm-block-label">📝 Contenido</div>
                <p className="cfm-block-text">{ficha.contenido}</p>
              </div>
            )}

            {ficha.estructura && (
              <div className="cfm-block">
                <div className="cfm-block-label">📝 Estructura</div>
                <p className="cfm-block-text">{ficha.estructura}</p>
              </div>
            )}

            {formato && (
              <>
                <div className="cfm-divider">El formato del que sale</div>
                <div className="cfm-formato-head">
                  <span className="cfm-formato-emoji">{formato.emoji}</span>
                  <span className="cfm-formato-nombre">{formato.nombre}</span>
                </div>
                {formato.descripcion_corta && (
                  <div className="cfm-formato-desc">{formato.descripcion_corta}</div>
                )}
                {formato.que_es_cuando_usarlo && (
                  <div className="cfm-formato-block">
                    <div className="cfm-formato-label">🎯 Qué es y cuándo usarlo</div>
                    <p className="cfm-block-text">{formato.que_es_cuando_usarlo}</p>
                  </div>
                )}
                {formato.por_que_funciona && (
                  <div className="cfm-formato-block">
                    <div className="cfm-formato-label">🧠 Por qué funciona</div>
                    <p className="cfm-block-text">{formato.por_que_funciona}</p>
                  </div>
                )}
              </>
            )}
          </>
        )}

        <div className="cfm-actions">
          <button className="cfm-btn" onClick={onClose}>CERRAR</button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
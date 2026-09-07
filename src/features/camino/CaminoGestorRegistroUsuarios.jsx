import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../services/supabase';

// ══════════════════════════════════════════════════════════════════
// CaminoGestorRegistroUsuarios.jsx
//
// Registro de usuarios para el Gestor — enfocado ÚNICAMENTE en las
// métricas de Checkpoint (Día 1, Día 14, Día 28: seguidores, alcance
// e interacciones). No repite nada de lo que ya muestra "Métricas del
// equipo" (eso es sobre los check-ins diarios de contenido — otra
// pestaña, otro propósito).
//
// Vista 1: lista simple de todos los participantes, con buscador y
//          filtros por estado de checkpoint.
// Vista 2 (al dar clic en un participante): sus 3 checkpoints con
//          seguidores/alcance/interacciones, y el análisis de su
//          transformación (crecimiento de Día 1 a Día 14, de Día 14 a
//          Día 28, y el total) — listo para compartírselo al cliente.
//
// Fuente de datos: camino_metricas_gestor() ya trae, por participante,
// checkpoints_registrados (qué números ya llenó) y checkpoints (el
// detalle jsonb de cada uno) — no hace falta una llamada aparte.
// ══════════════════════════════════════════════════════════════════

const styles = `
.cru-root{ display:flex; flex-direction:column; gap:16px; }

.cru-controles{ display:flex; gap:8px; flex-wrap:wrap; align-items:center; justify-content:space-between; }
.cru-filtros{ display:flex; gap:6px; flex-wrap:wrap; }
.cru-chip{
  padding:6px 12px; border-radius:20px; border:1px solid var(--border); background:rgba(255,255,255,0.03);
  font-family:'Cinzel',serif; font-size:9.5px; letter-spacing:0.6px; color:var(--muted); cursor:pointer;
  display:flex; align-items:center; gap:5px; transition:all .15s; white-space:nowrap;
}
.cru-chip:hover{ border-color:var(--borderHi); color:var(--text); }
.cru-chip.activo{ background:rgba(212,175,55,0.14); border-color:var(--gold); color:var(--gold-bright); }
.cru-search{
  background:rgba(255,255,255,0.04); border:1px solid var(--border); border-radius:8px; padding:7px 12px;
  color:var(--text); font-family:'Nunito',sans-serif; font-size:12px; min-width:180px; flex:1; max-width:280px;
}
.cru-search::placeholder{ color:var(--muted); }

.cru-lista{ display:flex; flex-direction:column; gap:8px; }

/* ---------- Scrollbar oscura y delgada (estilo Claude) ---------- */
.cru-scroll{
  overflow-y:auto; padding-right:6px;
  scrollbar-width:thin; scrollbar-color:rgba(255,255,255,0.18) transparent;
}
.cru-scroll::-webkit-scrollbar{ width:8px; }
.cru-scroll::-webkit-scrollbar-track{ background:transparent; }
.cru-scroll::-webkit-scrollbar-thumb{ background:rgba(255,255,255,0.18); border-radius:8px; }
.cru-scroll::-webkit-scrollbar-thumb:hover{ background:rgba(255,255,255,0.32); }
/* Lista de participantes: alto fijo ~5 filas visibles, el resto con scroll */
.cru-lista-scroll{ max-height:400px; }
.cru-fila{
  display:flex; align-items:center; gap:14px; text-align:left; width:100%; cursor:pointer;
  background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:12px; padding:12px 14px;
  transition:border-color .15s, background .15s;
}
.cru-fila:hover{ background:rgba(255,255,255,0.055); border-color:var(--borderHi); }
.cru-fila-info{ flex:1; min-width:0; display:flex; flex-direction:column; gap:2px; }
.cru-fila-nombre{ font-family:'Cinzel',serif; font-size:13px; color:var(--text); font-weight:700; }
.cru-fila-sub{ font-family:'Nunito',sans-serif; font-size:10.5px; color:var(--muted); }
.cru-fila-sub b{ color:var(--purple); font-weight:700; }
.cru-fila-cps{ display:flex; gap:5px; flex-shrink:0; }
.cru-cp-badge{
  font-family:'Cinzel',serif; font-size:8.5px; font-weight:900; letter-spacing:0.3px;
  width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center;
  border:1.5px solid rgba(255,255,255,0.15); color:var(--muted); background:rgba(255,255,255,0.03);
}
.cru-cp-badge.hecho{ border-color:var(--green); color:var(--green); background:rgba(68,255,136,0.1); }
.cru-cp-badge.due{ border-color:#ffc444; color:#ffc444; background:rgba(255,196,68,0.1); }
.cru-fila-chevron{ font-size:14px; color:var(--muted); flex-shrink:0; }

.cru-vacio{ text-align:center; padding:28px 16px; color:var(--muted); font-size:12.5px; line-height:1.6; }
.cru-loading{ text-align:center; padding:24px; color:var(--muted); font-family:'Cinzel',serif; font-size:11px; letter-spacing:1px; }

/* ---------- Modal de detalle ---------- */
.cru-modal-fondo{
  position:fixed; inset:0; background:rgba(4,2,14,0.88); z-index:9999;
  display:flex; align-items:center; justify-content:center; padding:20px; overflow-y:auto;
}
.cru-modal{
  background:var(--card); border:1.5px solid var(--borderHi); border-radius:18px;
  max-width:680px; width:100%; max-height:88vh; overflow-y:auto; padding:26px 24px; margin:auto;
}
.cru-modal-head{ display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:6px; }
.cru-modal-nombre{ font-family:'Cinzel',serif; font-weight:900; font-size:19px; color:var(--text); }
.cru-modal-sub{ font-family:'Nunito',sans-serif; font-size:11.5px; color:var(--muted); margin-top:3px; }
.cru-modal-cerrar{
  background:none; border:1px solid var(--border); color:var(--muted); border-radius:8px;
  width:30px; height:30px; cursor:pointer; font-size:15px; flex-shrink:0;
}
.cru-modal-cerrar:hover{ color:var(--gold-bright); border-color:var(--gold); }

.cru-sec-titulo{
  font-family:'Cinzel',serif; font-weight:900; font-size:11px; letter-spacing:1.2px; color:var(--gold);
  text-transform:uppercase; margin:22px 0 10px; display:flex; align-items:center; gap:8px;
}
.cru-sec-titulo:first-of-type{ margin-top:18px; }

.cru-cps-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
@media (max-width:600px){ .cru-cps-grid{ grid-template-columns:1fr; } }
.cru-cp-card{
  background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:12px; padding:12px 14px;
}
.cru-cp-card.pendiente{ border-style:dashed; opacity:0.55; }
.cru-cp-card-titulo{ font-family:'Cinzel',serif; font-weight:700; font-size:11px; color:var(--text); margin-bottom:8px; }
.cru-cp-card-fila{ display:flex; justify-content:space-between; font-family:'Nunito',sans-serif; font-size:12px; color:var(--text); margin-bottom:4px; }
.cru-cp-card-fila span:first-child{ color:var(--muted); }
.cru-cp-card-vacio{ font-family:'Nunito',sans-serif; font-size:11px; color:var(--muted); font-style:italic; }

.cru-cp-evidencia-titulo{
  font-family:'Cinzel',serif; font-size:8.5px; letter-spacing:0.6px; color:var(--muted); text-transform:uppercase;
  margin-top:8px; margin-bottom:5px;
}
.cru-cp-evidencia-row{ display:flex; gap:6px; }
.cru-cp-evidencia-badge{
  width:26px; height:26px; border-radius:50%; flex-shrink:0;
  font-family:'Cinzel',serif; font-weight:900; font-size:10px;
  border:1.5px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.02); color:rgba(255,255,255,0.25);
  cursor:default;
}
.cru-cp-evidencia-badge.disponible{
  border-color:var(--gold); color:var(--gold-bright); background:rgba(212,175,55,0.12); cursor:pointer;
  transition:transform .12s, background .12s;
}
.cru-cp-evidencia-badge.disponible:hover{ background:rgba(212,175,55,0.22); transform:scale(1.08); }
.cru-cp-evidencia-badge.disponible:active{ transform:scale(0.94); }

.cru-transform-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
@media (max-width:600px){ .cru-transform-grid{ grid-template-columns:1fr; } }
.cru-transform-card{
  background:rgba(212,175,55,0.07); border:1px solid var(--border); border-radius:12px; padding:12px 14px; text-align:center;
}
.cru-transform-label{ font-family:'Cinzel',serif; font-size:9px; letter-spacing:0.6px; color:var(--muted); text-transform:uppercase; margin-bottom:6px; }
.cru-transform-valores{ font-family:'Nunito',sans-serif; font-size:12.5px; color:var(--text); }
.cru-transform-delta{ font-family:'Cinzel',serif; font-weight:900; font-size:15px; margin-top:4px; }
.cru-transform-delta.pos{ color:var(--green); }
.cru-transform-delta.neg{ color:var(--red); }
.cru-transform-delta.zero{ color:var(--muted); }

.cru-etapas{ display:flex; flex-direction:column; gap:8px; }
.cru-etapa-fila{
  display:grid; grid-template-columns:120px repeat(3,1fr); gap:8px; align-items:center;
  background:rgba(255,255,255,0.02); border:1px solid var(--border); border-radius:10px; padding:9px 12px;
  font-family:'Nunito',sans-serif; font-size:11.5px;
}
@media (max-width:600px){ .cru-etapa-fila{ grid-template-columns:1fr; gap:4px; } }
.cru-etapa-nombre{ font-family:'Cinzel',serif; font-weight:700; font-size:10.5px; color:var(--gold-bright); }
.cru-etapa-metric{ display:flex; justify-content:space-between; color:var(--text); }
.cru-etapa-metric span:first-child{ color:var(--muted); font-size:9.5px; }

.cru-sin-datos{
  padding:16px; border-radius:12px; background:rgba(255,255,255,0.02); border:1px dashed var(--border);
  text-align:center; font-family:'Nunito',sans-serif; font-size:12px; color:var(--muted); line-height:1.6;
}
`;

const DIAS_CHECKPOINT = { 1: 1, 2: 14, 3: 28 };
const NOMBRE_CHECKPOINT = { 1: 'Día 1', 2: 'Día 14', 3: 'Día 28' };
// Orden fijo en que el participante sube su evidencia — debe coincidir con el
// arreglo p_capturas_url que arma CaminoParticipanteHomePage.jsx al enviar el checkpoint.
const ETIQUETAS_CAPTURA = ['Seguidores', 'Alcance', 'Interacciones'];

async function descargarImagen(url, nombreArchivo) {
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('No se pudo descargar');
    const blob = await resp.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 4000);
  } catch (e) {
    window.open(url, '_blank');
  }
}

const FILTROS = [
  { key: 'todos', label: 'TODOS' },
  { key: 'cp_pendiente', label: 'CON CHECKPOINT PENDIENTE' },
  { key: 'cp_completos', label: 'LOS 3 COMPLETOS' },
  { key: 'sin_checkpoints', label: 'SIN NINGÚN CHECKPOINT AÚN' },
];

function checkpointPendienteDe(diaActual, registrados) {
  for (let numero = 3; numero >= 1; numero--) {
    if (diaActual >= DIAS_CHECKPOINT[numero] && !registrados.includes(numero)) return numero;
  }
  return null;
}

function fmtFecha(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

function delta(a, b) { return b - a; }
function pct(a, b) {
  if (!a) return null;
  return Math.round(((b - a) / a) * 100);
}

function TarjetaDelta({ label, valorIni, valorFin }) {
  const d = delta(valorIni, valorFin);
  const p = pct(valorIni, valorFin);
  const clase = d > 0 ? 'pos' : d < 0 ? 'neg' : 'zero';
  const signo = d > 0 ? '+' : '';
  return (
    <div className="cru-transform-card">
      <div className="cru-transform-label">{label}</div>
      <div className="cru-transform-valores">{valorIni} → {valorFin}</div>
      <div className={`cru-transform-delta ${clase}`}>
        {signo}{d} {p !== null && <span style={{ fontSize: 11, fontWeight: 700 }}>({signo}{p}%)</span>}
      </div>
    </div>
  );
}

export default function CaminoGestorRegistroUsuarios() {
  const [estado, setEstado] = useState('cargando'); // cargando | listo | error
  const [datos, setDatos] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [seleccionado, setSeleccionado] = useState(null); // fila completa del participante

  async function cargar() {
    setEstado('cargando');
    const { data, error } = await supabase.rpc('camino_metricas_gestor');
    if (error) { setEstado('error'); return; }
    setDatos(data || []);
    setEstado('listo');
  }

  useEffect(() => { cargar(); }, []);

  const filtrados = useMemo(() => {
    let r = datos;
    if (filtro !== 'todos') {
      r = r.filter(d => {
        const registrados = d.checkpoints_registrados || [];
        if (filtro === 'cp_pendiente') return checkpointPendienteDe(d.dia_actual, registrados) !== null;
        if (filtro === 'cp_completos') return registrados.length === 3;
        if (filtro === 'sin_checkpoints') return registrados.length === 0;
        return true;
      });
    }
    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase();
      r = r.filter(d => d.nombre.toLowerCase().includes(q));
    }
    return r;
  }, [datos, filtro, busqueda]);

  if (estado === 'cargando') {
    return <div className="cru-root"><style>{styles}</style><div className="cru-loading">Cargando participantes...</div></div>;
  }
  if (estado === 'error') {
    return <div className="cru-root"><style>{styles}</style><div className="cru-vacio">No se pudo cargar el registro de usuarios. Intenta de nuevo más tarde.</div></div>;
  }

  const cpsPorNumero = {};
  (seleccionado?.checkpoints || []).forEach(cp => { cpsPorNumero[cp.numero_checkpoint] = cp; });
  const cp1 = cpsPorNumero[1];
  const cp2 = cpsPorNumero[2];
  const cp3 = cpsPorNumero[3];
  const numerosLlenos = [1, 2, 3].filter(n => cpsPorNumero[n]);
  const ultimoNumero = numerosLlenos.length ? Math.max(...numerosLlenos) : null;
  const ultimoCp = ultimoNumero ? cpsPorNumero[ultimoNumero] : null;

  return (
    <div className="cru-root">
      <style>{styles}</style>

      <div className="cru-controles">
        <div className="cru-filtros">
          {FILTROS.map(f => (
            <div key={f.key} className={`cru-chip${filtro === f.key ? ' activo' : ''}`} onClick={() => setFiltro(f.key)}>
              {f.label}
            </div>
          ))}
        </div>
        <input
          className="cru-search"
          placeholder="Buscar participante..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="cru-lista cru-scroll cru-lista-scroll">
        {filtrados.length === 0 ? (
          <div className="cru-vacio">
            {datos.length === 0
              ? 'Todavía no tienes participantes activos.'
              : 'Ningún participante coincide con este filtro o búsqueda.'}
          </div>
        ) : filtrados.map(p => {
          const registrados = p.checkpoints_registrados || [];
          const pendiente = checkpointPendienteDe(p.dia_actual, registrados);
          return (
            <button className="cru-fila" key={p.participante_id} onClick={() => setSeleccionado(p)}>
              <div className="cru-fila-info">
                <div className="cru-fila-nombre">{p.nombre}</div>
                <div className="cru-fila-sub">
                  Día {p.dia_actual} de 28
                  {pendiente
                    ? <> · <b>Checkpoint {pendiente} ({NOMBRE_CHECKPOINT[pendiente]}) pendiente</b></>
                    : registrados.length === 3
                      ? <> · Los 3 checkpoints completos ✅</>
                      : <> · Todavía no le toca su siguiente checkpoint</>}
                </div>
              </div>
              <div className="cru-fila-cps">
                {[1, 2, 3].map(n => (
                  <span
                    key={n}
                    className={`cru-cp-badge${registrados.includes(n) ? ' hecho' : pendiente === n ? ' due' : ''}`}
                    title={`Checkpoint ${n} · ${NOMBRE_CHECKPOINT[n]}`}
                  >
                    {n}
                  </span>
                ))}
              </div>
              <span className="cru-fila-chevron">›</span>
            </button>
          );
        })}
      </div>

      {seleccionado && (
        <div className="cru-modal-fondo" onClick={() => setSeleccionado(null)}>
          <div className="cru-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cru-modal-head">
              <div>
                <div className="cru-modal-nombre">{seleccionado.nombre}</div>
                <div className="cru-modal-sub">Día {seleccionado.dia_actual} de 28 · Inició el {fmtFecha(seleccionado.fecha_inicio)}</div>
              </div>
              <button className="cru-modal-cerrar" onClick={() => setSeleccionado(null)}>✕</button>
            </div>

            <div className="cru-sec-titulo">🚩 Sus checkpoints</div>
            <div className="cru-cps-grid">
              {[1, 2, 3].map(numero => {
                const cp = cpsPorNumero[numero];
                return (
                  <div key={numero} className={`cru-cp-card${cp ? '' : ' pendiente'}`}>
                    <div className="cru-cp-card-titulo">Checkpoint {numero} · {NOMBRE_CHECKPOINT[numero]}</div>
                    {cp ? (
                      <>
                        <div className="cru-cp-card-fila"><span>Seguidores</span><span>{cp.seguidores}</span></div>
                        <div className="cru-cp-card-fila"><span>Alcance</span><span>{cp.alcance}</span></div>
                        <div className="cru-cp-card-fila"><span>Interacciones</span><span>{cp.interacciones}</span></div>
                        <div className="cru-cp-card-fila"><span>Registrado</span><span>{fmtFecha(cp.created_at)}</span></div>
                        <div className="cru-cp-evidencia-titulo">Evidencia</div>
                        <div className="cru-cp-evidencia-row">
                          {[0, 1, 2].map(i => {
                            const url = cp.capturas_url?.[i];
                            const nombreArchivo = `${seleccionado.nombre.replace(/\s+/g, '_')}_checkpoint${numero}_${ETIQUETAS_CAPTURA[i].toLowerCase()}.jpg`;
                            return (
                              <button
                                key={i}
                                className={`cru-cp-evidencia-badge${url ? ' disponible' : ''}`}
                                disabled={!url}
                                title={url ? `Descargar captura de ${ETIQUETAS_CAPTURA[i]}` : `Sin captura de ${ETIQUETAS_CAPTURA[i]}`}
                                onClick={() => url && descargarImagen(url, nombreArchivo)}
                              >
                                {i + 1}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="cru-cp-card-vacio">Todavía no lo registra.</div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="cru-sec-titulo">📈 Su transformación</div>
            {!cp1 ? (
              <div className="cru-sin-datos">
                Todavía no tiene ni el Checkpoint 1 (Día 1) registrado — en cuanto lo llene, aquí vas a poder ver su punto de partida y compararlo con su avance.
              </div>
            ) : !ultimoCp || ultimoNumero === 1 ? (
              <div className="cru-sin-datos">
                Ya tiene su Checkpoint 1 (punto de partida) registrado. En cuanto llegue al Día 14 y registre el Checkpoint 2, aquí va a aparecer su primer comparativo de crecimiento.
              </div>
            ) : (
              <>
                <div className="cru-transform-grid">
                  <TarjetaDelta label="Seguidores" valorIni={cp1.seguidores} valorFin={ultimoCp.seguidores} />
                  <TarjetaDelta label="Alcance" valorIni={cp1.alcance} valorFin={ultimoCp.alcance} />
                  <TarjetaDelta label="Interacciones" valorIni={cp1.interacciones} valorFin={ultimoCp.interacciones} />
                </div>
                <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 10.5, color: 'var(--muted)', marginTop: 8, textAlign: 'center' }}>
                  Comparando su {NOMBRE_CHECKPOINT[1]} contra su {NOMBRE_CHECKPOINT[ultimoNumero]} más reciente.
                </div>

                {cp2 && cp3 && (
                  <div className="cru-etapas" style={{ marginTop: 16 }}>
                    <div className="cru-etapa-fila">
                      <div className="cru-etapa-nombre">Día 1 → Día 14</div>
                      <div className="cru-etapa-metric"><span>Seguidores</span><span>{cp1.seguidores} → {cp2.seguidores}</span></div>
                      <div className="cru-etapa-metric"><span>Alcance</span><span>{cp1.alcance} → {cp2.alcance}</span></div>
                      <div className="cru-etapa-metric"><span>Interacciones</span><span>{cp1.interacciones} → {cp2.interacciones}</span></div>
                    </div>
                    <div className="cru-etapa-fila">
                      <div className="cru-etapa-nombre">Día 14 → Día 28</div>
                      <div className="cru-etapa-metric"><span>Seguidores</span><span>{cp2.seguidores} → {cp3.seguidores}</span></div>
                      <div className="cru-etapa-metric"><span>Alcance</span><span>{cp2.alcance} → {cp3.alcance}</span></div>
                      <div className="cru-etapa-metric"><span>Interacciones</span><span>{cp2.interacciones} → {cp3.interacciones}</span></div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../services/supabase';

const styles = `
.cgm-root{ display:flex; flex-direction:column; gap:16px; }

.cgm-resumen{ display:grid; grid-template-columns:repeat(5,1fr); gap:10px; }
@media (max-width:700px){ .cgm-resumen{ grid-template-columns:repeat(2,1fr); } }
.cgm-stat{
  background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:12px;
  padding:14px 12px; display:flex; flex-direction:column; gap:4px; position:relative; overflow:hidden;
}
.cgm-stat.alerta{ border-color:rgba(255,68,102,0.35); background:rgba(255,68,102,0.06); }
.cgm-stat-num{ font-family:'Cinzel Decorative',serif; font-weight:900; font-size:24px; color:var(--text); line-height:1; }
.cgm-stat.alerta .cgm-stat-num{ color:var(--red); }
.cgm-stat-label{ font-family:'Cinzel',serif; font-size:9px; letter-spacing:1px; color:var(--muted); text-transform:uppercase; }

.cgm-tips{ display:flex; flex-direction:column; gap:8px; }
.cgm-tip{
  display:flex; align-items:flex-start; gap:10px; padding:10px 12px; border-radius:10px;
  background:rgba(255,196,68,0.06); border:1px solid rgba(255,196,68,0.25); font-size:12px; color:var(--text); line-height:1.5;
}
.cgm-tip.ok{ background:rgba(68,255,136,0.06); border-color:rgba(68,255,136,0.25); }
.cgm-tip-icon{ font-size:14px; flex-shrink:0; margin-top:1px; }

.cgm-controles{ display:flex; gap:8px; flex-wrap:wrap; align-items:center; justify-content:space-between; }
.cgm-filtros{ display:flex; gap:6px; flex-wrap:wrap; }
.cgm-chip{
  padding:6px 12px; border-radius:20px; border:1px solid var(--border); background:rgba(255,255,255,0.03);
  font-family:'Cinzel',serif; font-size:9.5px; letter-spacing:0.6px; color:var(--muted); cursor:pointer;
  display:flex; align-items:center; gap:5px; transition:all .15s;
}
.cgm-chip:hover{ border-color:var(--borderHi); color:var(--text); }
.cgm-chip.activo{ background:rgba(212,175,55,0.14); border-color:var(--gold); color:var(--gold-bright); }
.cgm-dot{ width:6px; height:6px; border-radius:50%; }
.cgm-search{
  background:rgba(255,255,255,0.04); border:1px solid var(--border); border-radius:8px; padding:7px 12px;
  color:var(--text); font-family:'Nunito',sans-serif; font-size:12px; min-width:160px;
}
.cgm-search::placeholder{ color:var(--muted); }

.cgm-tabla{ display:flex; flex-direction:column; gap:8px; }
.cgm-fila-p{
  display:grid; grid-template-columns:auto 1fr auto auto auto auto; align-items:center; gap:12px;
  background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:12px; padding:12px 14px;
  border-left:3px solid var(--muted);
}
.cgm-fila-p.al_dia{ border-left-color:var(--green); }
.cgm-fila-p.atrasado{ border-left-color:#ffc444; }
.cgm-fila-p.en_riesgo{ border-left-color:var(--red); }
@media (max-width:700px){ .cgm-fila-p{ grid-template-columns:1fr; gap:8px; } }

.cgm-p-estado{ font-size:16px; }
.cgm-p-info{ display:flex; flex-direction:column; gap:2px; min-width:0; }
.cgm-p-nombre{ font-family:'Cinzel',serif; font-size:13px; color:var(--text); font-weight:700; }
.cgm-p-sub{ font-family:'Nunito',sans-serif; font-size:10.5px; color:var(--muted); }
.cgm-p-metric{ display:flex; flex-direction:column; align-items:center; gap:1px; min-width:52px; }
.cgm-p-metric-num{ font-family:'Cinzel',serif; font-weight:900; font-size:14px; color:var(--text); }
.cgm-p-metric-label{ font-family:'Cinzel',serif; font-size:7.5px; letter-spacing:0.6px; color:var(--muted); text-transform:uppercase; }
.cgm-barra-bg{ width:44px; height:4px; border-radius:4px; background:rgba(255,255,255,0.08); overflow:hidden; margin-top:3px; }
.cgm-barra-fill{ height:100%; border-radius:4px; background:var(--purple); }

.cgm-p-modulo1{ display:flex; flex-direction:column; align-items:center; gap:2px; min-width:60px; }
.cgm-badge-modulo1{
  font-family:'Cinzel',serif; font-size:9px; font-weight:700; letter-spacing:0.4px;
  padding:4px 9px; border-radius:20px; white-space:nowrap; text-transform:uppercase;
}
.cgm-badge-modulo1.confirmado{ background:rgba(68,255,136,0.12); border:1px solid rgba(68,255,136,0.35); color:var(--green); }
.cgm-badge-modulo1.descargado{ background:rgba(255,196,68,0.1); border:1px solid rgba(255,196,68,0.3); color:#ffc444; }
.cgm-badge-modulo1.pendiente{ background:rgba(255,68,102,0.1); border:1px solid rgba(255,68,102,0.3); color:var(--red); }

.cgm-vacio{ text-align:center; padding:28px 16px; color:var(--muted); font-size:12.5px; line-height:1.6; }
.cgm-loading{ text-align:center; padding:24px; color:var(--muted); font-family:'Cinzel',serif; font-size:11px; letter-spacing:1px; }

/* ---------- Scrollbar oscura y delgada (estilo Claude), reutilizable ---------- */
.cgm-scroll{
  overflow-y:auto; padding-right:6px;
  scrollbar-width:thin; scrollbar-color:rgba(255,255,255,0.18) transparent;
}
.cgm-scroll::-webkit-scrollbar{ width:8px; }
.cgm-scroll::-webkit-scrollbar-track{ background:transparent; }
.cgm-scroll::-webkit-scrollbar-thumb{ background:rgba(255,255,255,0.18); border-radius:8px; }
.cgm-scroll::-webkit-scrollbar-thumb:hover{ background:rgba(255,255,255,0.32); }

/* Lista de participantes: alto fijo ~5 filas visibles, el resto con scroll */
.cgm-tabla-scroll{ max-height:400px; }

.cgm-fila-p{ cursor:pointer; text-align:left; width:100%; transition:border-color .15s, background .15s; appearance:none; margin:0; font-family:inherit; color:inherit; }
.cgm-fila-p:hover{ background:rgba(255,255,255,0.055); border-color:var(--borderHi); }

/* ---------- Modal de detalle del participante ---------- */
.cgm-modal-fondo{
  position:fixed; inset:0; background:rgba(4,2,14,0.88); z-index:9999;
  display:flex; align-items:center; justify-content:center; padding:20px; overflow-y:auto;
}
.cgm-modal{
  background:var(--card); border:1.5px solid var(--borderHi); border-radius:18px;
  max-width:680px; width:100%; max-height:88vh; overflow-y:auto; padding:26px 24px; margin:auto;
}
.cgm-modal-head{ display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:16px; }
.cgm-modal-nombre{ font-family:'Cinzel',serif; font-weight:900; font-size:19px; color:var(--text); }
.cgm-modal-sub{ font-family:'Nunito',sans-serif; font-size:11.5px; color:var(--muted); margin-top:3px; }
.cgm-modal-cerrar{
  background:none; border:1px solid var(--border); color:var(--muted); border-radius:8px;
  width:30px; height:30px; cursor:pointer; font-size:15px; flex-shrink:0;
}
.cgm-modal-cerrar:hover{ color:var(--gold-bright); border-color:var(--gold); }

.cgm-sec-titulo{
  font-family:'Cinzel',serif; font-weight:900; font-size:11px; letter-spacing:1.2px; color:var(--gold);
  text-transform:uppercase; margin:20px 0 10px;
}
.cgm-sec-titulo:first-of-type{ margin-top:0; }

.cgm-dias-scroll{ max-height:340px; display:flex; flex-direction:column; gap:6px; }
.cgm-dia-fila{
  display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:10px;
  background:rgba(255,255,255,0.03); border:1px solid var(--border); border-left:3px solid var(--muted);
}
.cgm-dia-fila.cumplido{ border-left-color:var(--green); }
.cgm-dia-fila.pendiente{ border-left-color:var(--red); opacity:0.75; }
.cgm-dia-num{ font-family:'Cinzel',serif; font-weight:700; font-size:11px; color:var(--text); flex-shrink:0; width:52px; }
.cgm-dia-check{ font-size:13px; flex-shrink:0; }
.cgm-dia-meta{ font-family:'Nunito',sans-serif; font-size:11px; color:var(--muted); flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.cgm-dia-link{ font-family:'Cinzel',serif; font-size:9.5px; color:var(--gold); text-decoration:none; flex-shrink:0; }
.cgm-dia-link:hover{ color:var(--gold-bright); }

.cgm-modal-loading{ text-align:center; padding:40px 16px; color:var(--muted); font-family:'Cinzel',serif; font-size:11px; letter-spacing:1px; }
`;

const FILTROS = [
  { key: 'todos', label: 'TODOS', color: null },
  { key: 'en_riesgo', label: 'EN RIESGO', color: 'var(--red)' },
  { key: 'atrasado', label: 'ATRASADO', color: '#ffc444' },
  { key: 'al_dia', label: 'AL DÍA', color: 'var(--green)' },
];

const ESTADO_ICONO = { al_dia: '🟢', atrasado: '🟡', en_riesgo: '🔴' };

const MODULO1_LABEL = { confirmado: '📜 Listo', descargado: '📜 A medias', pendiente: '📜 Pendiente' };

export default function CaminoGestorMetricasBlock() {
  const [estado, setEstado] = useState('cargando'); // cargando | listo | error
  const [datos, setDatos] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  const [seleccionado, setSeleccionado] = useState(null); // fila del participante
  const [detalle, setDetalle] = useState(null);
  const [detalleEstado, setDetalleEstado] = useState('cargando'); // cargando | listo | error

  async function cargar() {
    setEstado('cargando');
    const { data, error } = await supabase.rpc('camino_metricas_gestor');
    if (error) { setEstado('error'); return; }
    setDatos(data || []);
    setEstado('listo');
  }

  useEffect(() => { cargar(); }, []);

  async function abrirDetalle(fila) {
    setSeleccionado(fila);
    setDetalle(null);
    setDetalleEstado('cargando');
    const { data, error } = await supabase.rpc('camino_gestor_detalle_participante', { p_participante_id: fila.participante_id });
    if (error) { setDetalleEstado('error'); return; }
    setDetalle(data);
    setDetalleEstado('listo');
  }

  const resumen = useMemo(() => {
    const total = datos.length;
    const alDiaHoy = datos.filter(d => d.dias_sin_checkin <= 1).length;
    const rachaProm = total ? Math.round(datos.reduce((s, d) => s + d.racha_actual, 0) / total) : 0;
    const enRiesgo = datos.filter(d => d.estado === 'en_riesgo').length;
    const modulo1Listo = datos.filter(d => d.modulo1_estado === 'confirmado').length;
    return { total, alDiaHoy, rachaProm, enRiesgo, modulo1Listo };
  }, [datos]);

  const tips = useMemo(() => {
    const lista = [];
    const riesgo = datos.filter(d => d.estado === 'en_riesgo');
    const atrasados = datos.filter(d => d.estado === 'atrasado');
    if (riesgo.length > 0) {
      lista.push({ ok: false, icon: '🚨', texto: `${riesgo.length} de tus ${datos.length} participantes llevan 4+ días sin check-in: ${riesgo.map(r => r.nombre.split(' ')[0]).join(', ')}. Dales seguimiento hoy.` });
    }
    if (atrasados.length > 0) {
      lista.push({ ok: false, icon: '⏰', texto: `${atrasados.length} van 2-3 días atrasados: ${atrasados.map(r => r.nombre.split(' ')[0]).join(', ')}. Un empujón a tiempo evita que se conviertan en riesgo.` });
    }
    const checklistBajo = datos.filter(d => d.checkins_totales > 0 && d.checklist_pct < 50);
    if (checklistBajo.length > 0) {
      lista.push({ ok: false, icon: '🛡️', texto: `${checklistBajo.length} participantes publican sin completar bien el checklist (gancho/estructura/legibilidad/cta). Vale la pena repasarlo con ellos.` });
    }
    const modulo1Pendiente = datos.filter(d => d.modulo1_estado === 'pendiente');
    if (modulo1Pendiente.length > 0) {
      lista.push({ ok: false, icon: '📜', texto: `${modulo1Pendiente.length} todavía no llenan su Módulo 1: ${modulo1Pendiente.map(r => r.nombre.split(' ')[0]).join(', ')}. Sin eso, sus guiones no salen personalizados.` });
    }
    if (riesgo.length === 0 && atrasados.length === 0 && datos.length > 0) {
      lista.push({ ok: true, icon: '✅', texto: 'Todo tu equipo está al día. Ningún participante necesita seguimiento urgente ahora mismo.' });
    }
    return lista;
  }, [datos]);

  const filtrados = useMemo(() => {
    let r = datos;
    if (filtro !== 'todos') r = r.filter(d => d.estado === filtro);
    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase();
      r = r.filter(d => d.nombre.toLowerCase().includes(q));
    }
    return r;
  }, [datos, filtro, busqueda]);

  if (estado === 'cargando') {
    return <div className="cgm-root"><style>{styles}</style><div className="cgm-loading">Cargando métricas...</div></div>;
  }
  if (estado === 'error') {
    return <div className="cgm-root"><style>{styles}</style><div className="cgm-vacio">No se pudieron cargar las métricas. Intenta de nuevo más tarde.</div></div>;
  }

  return (
    <div className="cgm-root">
      <style>{styles}</style>

      <div className="cgm-resumen">
        <div className="cgm-stat">
          <div className="cgm-stat-num">{resumen.total}</div>
          <div className="cgm-stat-label">Participantes</div>
        </div>
        <div className="cgm-stat">
          <div className="cgm-stat-num">{resumen.total ? Math.round((resumen.alDiaHoy / resumen.total) * 100) : 0}%</div>
          <div className="cgm-stat-label">Al día hoy</div>
        </div>
        <div className="cgm-stat">
          <div className="cgm-stat-num">{resumen.rachaProm}</div>
          <div className="cgm-stat-label">Racha promedio</div>
        </div>
        <div className={`cgm-stat${resumen.enRiesgo > 0 ? ' alerta' : ''}`}>
          <div className="cgm-stat-num">{resumen.enRiesgo}</div>
          <div className="cgm-stat-label">En riesgo</div>
        </div>
        <div className="cgm-stat">
          <div className="cgm-stat-num">{resumen.total ? Math.round((resumen.modulo1Listo / resumen.total) * 100) : 0}%</div>
          <div className="cgm-stat-label">Módulo 1 listo</div>
        </div>
      </div>

      {tips.length > 0 && (
        <div className="cgm-tips">
          {tips.map((t, i) => (
            <div key={i} className={`cgm-tip${t.ok ? ' ok' : ''}`}>
              <span className="cgm-tip-icon">{t.icon}</span>
              <span>{t.texto}</span>
            </div>
          ))}
        </div>
      )}

      <div className="cgm-controles">
        <div className="cgm-filtros">
          {FILTROS.map(f => (
            <div key={f.key} className={`cgm-chip${filtro === f.key ? ' activo' : ''}`} onClick={() => setFiltro(f.key)}>
              {f.color && <span className="cgm-dot" style={{ background: f.color }} />}
              {f.label}
            </div>
          ))}
        </div>
        <input
          className="cgm-search"
          placeholder="Buscar participante..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="cgm-tabla cgm-scroll cgm-tabla-scroll">
        {filtrados.length === 0 ? (
          <div className="cgm-vacio">
            {datos.length === 0
              ? 'Todavía no tienes participantes activos con datos que mostrar.'
              : 'Ningún participante coincide con este filtro.'}
          </div>
        ) : filtrados.map(p => (
          <button className={`cgm-fila-p ${p.estado}`} key={p.participante_id} onClick={() => abrirDetalle(p)}>
            <div className="cgm-p-estado">{ESTADO_ICONO[p.estado]}</div>
            <div className="cgm-p-info">
              <div className="cgm-p-nombre">{p.nombre}</div>
              <div className="cgm-p-sub">
                Día {p.dia_actual} · {p.ultimo_dia_checkin > 0 ? `último check-in: día ${p.ultimo_dia_checkin}` : 'sin check-in todavía'}
              </div>
            </div>
            <div className="cgm-p-metric">
              <div className="cgm-p-metric-num">{p.racha_actual}</div>
              <div className="cgm-p-metric-label">Racha</div>
            </div>
            <div className="cgm-p-metric">
              <div className="cgm-p-metric-num">{p.checklist_pct}%</div>
              <div className="cgm-p-metric-label">Checklist</div>
              <div className="cgm-barra-bg"><div className="cgm-barra-fill" style={{ width: `${p.checklist_pct}%` }} /></div>
            </div>
            <div className="cgm-p-metric">
              <div className="cgm-p-metric-num">+{p.seguidores_ganados}</div>
              <div className="cgm-p-metric-label">Seguidores</div>
            </div>
            <div className="cgm-p-modulo1">
              <span className={`cgm-badge-modulo1 ${p.modulo1_estado}`}>{MODULO1_LABEL[p.modulo1_estado]}</span>
            </div>
          </button>
        ))}
      </div>

      {seleccionado && (
        <div className="cgm-modal-fondo" onClick={() => setSeleccionado(null)}>
          <div className="cgm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cgm-modal-head">
              <div>
                <div className="cgm-modal-nombre">{seleccionado.nombre}</div>
                <div className="cgm-modal-sub">
                  Día {seleccionado.dia_actual} de 28 · Racha {seleccionado.racha_actual} 🔥 · Checklist {seleccionado.checklist_pct}% · +{seleccionado.seguidores_ganados} seguidores
                </div>
              </div>
              <button className="cgm-modal-cerrar" onClick={() => setSeleccionado(null)}>✕</button>
            </div>

            {detalleEstado === 'cargando' && <div className="cgm-modal-loading">Cargando su historial completo...</div>}
            {detalleEstado === 'error' && <div className="cgm-vacio">No se pudo cargar el historial de este participante.</div>}

            {detalleEstado === 'listo' && detalle && (() => {
              const checkinsPorDia = {};
              (detalle.checkins || []).forEach(c => { checkinsPorDia[c.dia_numero] = c; });
              const checklistPorDia = {};
              (detalle.checklist || []).forEach(c => { checklistPorDia[c.dia_numero] = c; });
              const dias = Array.from({ length: seleccionado.dia_actual }, (_, i) => i + 1);
              const diasCumplidos = dias.filter(d => checkinsPorDia[d]).length;

              return (
                <>
                  <div className="cgm-sec-titulo">
                    📔 Día por día ({diasCumplidos} de {dias.length} cumplidos)
                  </div>
                  <div className="cgm-dias-scroll cgm-scroll">
                    {dias.map(dia => {
                      const checkin = checkinsPorDia[dia];
                      const cl = checklistPorDia[dia];
                      const checklistCompleto = cl && cl.gancho && cl.estructura && cl.legibilidad && cl.cta;
                      return (
                        <div key={dia} className={`cgm-dia-fila${checkin ? ' cumplido' : ' pendiente'}`}>
                          <div className="cgm-dia-num">Día {dia}</div>
                          <div className="cgm-dia-check">{checkin ? '✅' : '❌'}</div>
                          <div className="cgm-dia-meta">
                            {checkin
                              ? `${checkin.formato || 'Sin formato'} · ${checkin.plataforma || 'Sin plataforma'}${cl ? (checklistCompleto ? ' · Checklist ✅' : ' · Checklist incompleto') : ''}`
                              : 'No registrado'}
                          </div>
                          {checkin?.link_post && <a className="cgm-dia-link" href={checkin.link_post} target="_blank" rel="noreferrer">VER →</a>}
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

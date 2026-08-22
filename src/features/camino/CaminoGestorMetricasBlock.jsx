import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../services/supabase';

const styles = `
.cgm-root{ display:flex; flex-direction:column; gap:16px; }

.cgm-resumen{ display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
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
  display:grid; grid-template-columns:auto 1fr auto auto auto; align-items:center; gap:12px;
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

.cgm-vacio{ text-align:center; padding:28px 16px; color:var(--muted); font-size:12.5px; line-height:1.6; }
.cgm-loading{ text-align:center; padding:24px; color:var(--muted); font-family:'Cinzel',serif; font-size:11px; letter-spacing:1px; }
`;

const FILTROS = [
  { key: 'todos', label: 'TODOS', color: null },
  { key: 'en_riesgo', label: 'EN RIESGO', color: 'var(--red)' },
  { key: 'atrasado', label: 'ATRASADO', color: '#ffc444' },
  { key: 'al_dia', label: 'AL DÍA', color: 'var(--green)' },
];

const ESTADO_ICONO = { al_dia: '🟢', atrasado: '🟡', en_riesgo: '🔴' };

export default function CaminoGestorMetricasBlock() {
  const [estado, setEstado] = useState('cargando'); // cargando | listo | error
  const [datos, setDatos] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  async function cargar() {
    setEstado('cargando');
    const { data, error } = await supabase.rpc('camino_metricas_gestor');
    if (error) { setEstado('error'); return; }
    setDatos(data || []);
    setEstado('listo');
  }

  useEffect(() => { cargar(); }, []);

  const resumen = useMemo(() => {
    const total = datos.length;
    const alDiaHoy = datos.filter(d => d.dias_sin_checkin <= 1).length;
    const rachaProm = total ? Math.round(datos.reduce((s, d) => s + d.racha_actual, 0) / total) : 0;
    const enRiesgo = datos.filter(d => d.estado === 'en_riesgo').length;
    return { total, alDiaHoy, rachaProm, enRiesgo };
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

      <div className="cgm-tabla">
        {filtrados.length === 0 ? (
          <div className="cgm-vacio">
            {datos.length === 0
              ? 'Todavía no tienes participantes activos con datos que mostrar.'
              : 'Ningún participante coincide con este filtro.'}
          </div>
        ) : filtrados.map(p => (
          <div className={`cgm-fila-p ${p.estado}`} key={p.participante_id}>
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
          </div>
        ))}
      </div>
    </div>
  );
}
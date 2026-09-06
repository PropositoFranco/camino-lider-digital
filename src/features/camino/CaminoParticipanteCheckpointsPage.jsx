import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseCamino as supabase } from '../../services/supabaseCamino';

// =====================================================================
// CaminoParticipanteCheckpointsPage.jsx
//
// Pantalla informativa "Checkpoints del reto". Aquí llega el participante
// cuando entra desde "Material del camino" en Inicio (link permanente,
// disponible cualquier día). Muestra el estado real de los 3 checkpoints
// (Día 1, Día 14, Día 28): registrado / abierto ahora / ventana cerrada /
// aún no abre — con sus números reales una vez registrados.
//
// El registro en sí NO se hace aquí — se hace en Inicio (mismo formulario
// y misma función `camino_registrar_checkpoint` ya usados ahí). Esta
// pantalla, si el checkpoint está abierto, manda con el botón
// "Registrar ahora" a Inicio con ?abrir=checkpoint para que se abra solo.
//
// No pedimos fotos en ningún checkpoint — solo los 3 números
// (seguidores, alcance, interacciones).
// =====================================================================

const DIAS_CHECKPOINT = [1, 14, 28];
const GRACIA = { 1: 1, 14: 5, 28: 1 };

const INFO_CHECKPOINT = {
  1: {
    titulo: 'Corte inicial de métricas',
    icono: '📊',
    descripcion: 'Registra tus métricas de los ÚLTIMOS 28 DÍAS: seguidores, alcance e interacciones. Es tu punto de partida, y con eso se compara tu corte final.',
  },
  14: {
    titulo: 'Corte intermedio (Día 14)',
    icono: '📊',
    descripcion: 'Corte de medio camino: registra tus métricas de los ÚLTIMOS 14 DÍAS —seguidores, alcance e interacciones— para ver cuánto llevas avanzado. Es la mitad exacta del reto.',
  },
  28: {
    titulo: 'Corte final de métricas',
    icono: '📊',
    descripcion: 'Corte final: tus métricas de los ÚLTIMOS 28 DÍAS, que son exactamente los días del reto. Aquí sale tu antes y después completo.',
  },
};

const styles = `
:root{
  --gold:#D4AF37; --gold-bright:#FFE566; --gold-dim:rgba(212,175,55,0.4); --gold-glow:rgba(212,175,55,0.65);
  --dark-bg:#04020e; --dark-surface:rgba(10,5,32,0.92);
  --purple:#CC44FF;
  --lilac:rgba(200,185,240,0.72); --lilac-dim:rgba(200,185,240,0.45);
  --green:#44ff88; --amber:#ffc444; --red:#ff4466;
}
.cck-root *,.cck-root *::before,.cck-root *::after{margin:0;padding:0;box-sizing:border-box;}
.cck-root{
  min-height:100dvh; width:100%;
  background:
    radial-gradient(ellipse 120% 50% at 50% 0%, rgba(40,10,90,0.9) 0%, transparent 60%),
    radial-gradient(ellipse 70% 40% at 12% 15%, rgba(10,40,100,0.35) 0%, transparent 55%),
    radial-gradient(ellipse 70% 40% at 88% 10%, rgba(80,10,110,0.35) 0%, transparent 55%),
    linear-gradient(180deg,#050215 0%,#0a0530 18%,#08031c 55%,#04020e 100%);
  font-family:'Crimson Text',serif; color:#fff; position:relative;
}
.cck-stars{position:fixed; inset:0; pointer-events:none; z-index:0;}
.cck-star{position:absolute; border-radius:50%; background:#fff; animation:cck-twinkle var(--d) ease-in-out infinite; animation-delay:var(--del);}
@keyframes cck-twinkle{0%,100%{opacity:var(--min);} 50%{opacity:1;}}

.cck-wrap{
  position:relative; z-index:1; max-width:720px; margin:0 auto;
  padding:clamp(18px,4vh,36px) clamp(18px,4vw,28px) 60px;
  display:flex; flex-direction:column; gap:20px;
}

.cck-back{
  display:inline-flex; align-items:center; gap:6px; width:fit-content;
  font-family:'Nunito',sans-serif; font-weight:700; font-size:13px;
  color:var(--lilac); text-decoration:none; background:none; border:none; cursor:pointer; padding:0;
}
.cck-back:hover{ color:var(--gold-bright); }

.cck-banner{
  border:1px solid var(--gold-dim); border-radius:16px; padding:16px 18px;
  background:linear-gradient(135deg, rgba(212,175,55,0.1), rgba(204,68,255,0.06));
  display:flex; gap:12px; align-items:flex-start;
}
.cck-banner.urgente{ border-color:var(--gold); box-shadow:0 0 24px rgba(212,175,55,0.18); }
.cck-banner-icon{ font-size:20px; flex-shrink:0; }
.cck-banner-title{ font-family:'Cinzel',serif; font-weight:900; font-size:13.5px; color:var(--gold-bright); margin-bottom:4px; }
.cck-banner-text{ font-family:'Nunito',sans-serif; font-size:13px; color:rgba(255,255,255,0.85); line-height:1.55; margin-bottom:10px; }
.cck-banner-btn{
  font-family:'Cinzel',serif; font-weight:900; font-size:11px; letter-spacing:0.6px;
  background:linear-gradient(135deg, var(--gold-bright), var(--gold)); color:#1a0d2e; border:none;
  border-radius:9px; padding:9px 16px; cursor:pointer;
}

h1.cck-title{ font-family:'Cinzel Decorative',serif; font-weight:900; font-size:clamp(24px,4vh,30px); color:#fff; }
.cck-sub{ font-family:'Nunito',sans-serif; font-size:13.5px; color:var(--lilac); line-height:1.5; margin-top:-8px; }

.cck-card{
  background:var(--dark-surface); border:1px solid var(--gold-dim); border-radius:16px;
  padding:18px 20px; display:flex; flex-direction:column; gap:10px; position:relative; overflow:hidden;
}
.cck-card::before{content:""; position:absolute; inset:0; background:radial-gradient(ellipse 70% 60% at 0% 0%, rgba(212,175,55,0.06), transparent 70%); pointer-events:none;}
.cck-card.registrado{ border-color:var(--green); }
.cck-card.abierto{ border-color:var(--gold); box-shadow:0 0 20px rgba(212,175,55,0.15); }

.cck-card-head{ display:flex; align-items:center; gap:10px; z-index:1; }
.cck-num{
  width:26px; height:26px; border-radius:50%; flex-shrink:0;
  background:rgba(212,175,55,0.16); border:1px solid var(--gold);
  color:var(--gold-bright); font-family:'Cinzel',serif; font-weight:900; font-size:12.5px;
  display:flex; align-items:center; justify-content:center;
}
.cck-card.registrado .cck-num{ background:var(--green); border-color:var(--green); color:#052; }
.cck-card-titulo{ font-family:'Cinzel',serif; font-weight:900; font-size:15.5px; color:#fff; display:flex; align-items:center; gap:6px; }
.cck-card-dia{ font-family:'Nunito',sans-serif; font-weight:700; font-size:11.5px; color:var(--gold); letter-spacing:0.3px; z-index:1; }
.cck-card-desc{ font-family:'Nunito',sans-serif; font-size:12.5px; color:rgba(255,255,255,0.78); line-height:1.55; z-index:1; }

.cck-pill{
  align-self:flex-start; font-family:'Cinzel',serif; font-weight:900; font-size:10px; letter-spacing:0.5px;
  padding:5px 12px; border-radius:20px; z-index:1;
}
.cck-pill.registrado{ background:rgba(68,255,136,0.14); border:1px solid var(--green); color:var(--green); }
.cck-pill.abierto{ background:rgba(212,175,55,0.16); border:1px solid var(--gold); color:var(--gold-bright); }
.cck-pill.cerrado{ background:rgba(255,68,102,0.1); border:1px solid rgba(255,68,102,0.4); color:var(--red); }
.cck-pill.pronto{ background:rgba(200,185,240,0.08); border:1px solid var(--lilac-dim); color:var(--lilac); }

.cck-helper{
  font-family:'Nunito',sans-serif; font-size:12px; color:rgba(200,185,240,0.75); line-height:1.55;
  background:rgba(255,255,255,0.03); border-radius:10px; padding:10px 12px; z-index:1;
}
.cck-helper b{ color:#fff; }

.cck-card-btn{
  font-family:'Cinzel',serif; font-weight:900; font-size:11px; letter-spacing:0.5px;
  background:linear-gradient(135deg, var(--gold-bright), var(--gold)); color:#1a0d2e; border:none;
  border-radius:9px; padding:10px 16px; cursor:pointer; align-self:flex-start; z-index:1;
}

.cck-loading{ min-height:100dvh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; }
.cck-spinner{ width:26px; height:26px; border:2.5px solid var(--gold-dim); border-top-color:var(--gold); border-radius:50%; animation:cck-girar 0.8s linear infinite; }
@keyframes cck-girar{ to{ transform:rotate(360deg); } }
`;

function generarEstrellas() {
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
  return arr;
}

export default function CaminoParticipanteCheckpointsPage() {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [diaActual, setDiaActual] = useState(1);
  const [registrados, setRegistrados] = useState({}); // { [numero]: {seguidores, alcance, interacciones, created_at} }
  const [estrellas, setEstrellas] = useState([]);

  useEffect(() => { setEstrellas(generarEstrellas()); }, []);

  useEffect(() => {
    async function cargar() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        navigate('/camino/participante/login', { replace: true });
        return;
      }

      const { data: participante } = await supabase
        .from('camino_participantes')
        .select('dia_actual')
        .eq('id', sessionData.session.user.id)
        .maybeSingle();
      setDiaActual(participante?.dia_actual ?? 1);

      const { data: cps } = await supabase.rpc('camino_mis_checkpoints');
      const mapa = {};
      (cps || []).forEach((c) => { mapa[c.numero_checkpoint] = c; });
      setRegistrados(mapa);

      setCargando(false);
    }
    cargar();
  }, [navigate]);

  if (cargando) {
    return (
      <div className="cck-root">
        <style>{styles}</style>
        <div className="cck-loading">
          <div className="cck-spinner"></div>
          <p style={{ color: 'var(--lilac)', fontFamily: "'Nunito',sans-serif", fontSize: 14 }}>Cargando tus checkpoints...</p>
        </div>
      </div>
    );
  }

  const filas = DIAS_CHECKPOINT.map((dia, i) => {
    const numero = i + 1;
    const gracia = GRACIA[dia];
    const cierre = dia + gracia;
    const reg = registrados[numero];
    let estadoCard = 'pronto';
    if (reg) estadoCard = 'registrado';
    else if (diaActual >= dia && diaActual <= cierre) estadoCard = 'abierto';
    else if (diaActual > cierre) estadoCard = 'cerrado';
    return { numero, dia, gracia, cierre, reg, estadoCard, info: INFO_CHECKPOINT[dia] };
  });

  const pendienteAbierto = filas.find((f) => f.estadoCard === 'abierto');

  return (
    <div className="cck-root">
      <style>{styles}</style>
      <div className="cck-stars">
        {estrellas.map((s) => (
          <div key={s.id} className="cck-star" style={{
            width: `${s.size}px`, height: `${s.size}px`, top: `${s.top}%`, left: `${s.left}%`,
            '--d': `${s.dur}s`, '--del': `${s.delay}s`, '--min': s.min,
          }} />
        ))}
      </div>

      <div className="cck-wrap">
        <button className="cck-back" onClick={() => navigate('/camino/participante/home')}>← Volver al dashboard</button>

        {pendienteAbierto && (
          <div className={`cck-banner${pendienteAbierto.numero === 1 ? ' urgente' : ''}`}>
            <span className="cck-banner-icon">⚠️</span>
            <div>
              <div className="cck-banner-title">
                {pendienteAbierto.numero === 1 ? 'Tu Checkpoint 1 es OBLIGATORIO — todavía puedes registrarlo' : `Tienes abierto el ${pendienteAbierto.info.titulo}`}
              </div>
              <div className="cck-banner-text">
                Registra tus seguidores, alcance e interacciones ahora — la ventana sigue abierta hasta el Día {pendienteAbierto.cierre}. Cuando veas el sello <b style={{ color: 'var(--green)' }}>Registrado</b> con tus números, está listo.
              </div>
              <button className="cck-banner-btn" onClick={() => navigate('/camino/participante/home?abrir=checkpoint')}>Registrar ahora</button>
            </div>
          </div>
        )}

        <h1 className="cck-title">Checkpoints del reto</h1>
        <p className="cck-sub">Registra tus métricas reales en cada hito del reto — solo números, sin fotos. Tu gestor validará tus entregas.</p>

        {filas.map((f) => (
          <div key={f.numero} className={`cck-card ${f.estadoCard}`}>
            <div className="cck-card-head">
              <div className="cck-num">{f.numero}</div>
              <div className="cck-card-titulo">{f.info.titulo} {f.info.icono}</div>
            </div>
            <div className="cck-card-dia">Día {f.dia} (+{f.gracia} de gracia)</div>
            <div className="cck-card-desc">{f.info.descripcion}</div>

            {f.estadoCard === 'registrado' && (
              <>
                <div className="cck-pill registrado">✓ Registrado</div>
                <div className="cck-helper">
                  <b>Seguidores:</b> {f.reg.seguidores?.toLocaleString('es-MX')} · <b>Alcance:</b> {f.reg.alcance?.toLocaleString('es-MX')} · <b>Interacciones:</b> {f.reg.interacciones?.toLocaleString('es-MX')}
                </div>
              </>
            )}

            {f.estadoCard === 'abierto' && (
              <>
                <div className="cck-pill abierto">Abierto ahora</div>
                <div className="cck-helper">Puedes registrarlo hasta el Día {f.cierre}. No pedimos foto — solo tus 3 números reales.</div>
                <button className="cck-card-btn" onClick={() => navigate('/camino/participante/home?abrir=checkpoint')}>Registrar ahora</button>
              </>
            )}

            {f.estadoCard === 'cerrado' && (
              <>
                <div className="cck-pill cerrado">Ventana cerrada</div>
                <div className="cck-helper">La ventana de este corte ya cerró (solo el día exacto + {f.gracia} de gracia). Habla con tu gestor si fue un imprevisto.</div>
              </>
            )}

            {f.estadoCard === 'pronto' && (
              <>
                <div className="cck-pill pronto">Aún no abre</div>
                <div className="cck-helper">Este corte se abre el Día {f.dia}. Vuelve ese día para registrar tus métricas.</div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseCamino as supabase } from '../../services/supabaseCamino';

const styles = `
:root{
  --gold:#D4AF37; --gold-bright:#FFE566; --gold-dim:rgba(212,175,55,0.4); --gold-glow:rgba(212,175,55,0.65);
  --dark-bg:#04020e; --dark-surface:rgba(10,5,32,0.92);
  --purple:#CC44FF;
  --lilac:rgba(200,185,240,0.68); --lilac-dim:rgba(200,185,240,0.42);
}
.cob-root *,.cob-root *::before,.cob-root *::after{margin:0;padding:0;box-sizing:border-box;}
.cob-root{
  min-height:100dvh; width:100%; display:flex; flex-direction:column;
  background:
    radial-gradient(ellipse 120% 50% at 50% 0%, rgba(40,10,90,0.9) 0%, transparent 60%),
    radial-gradient(ellipse 70% 40% at 12% 15%, rgba(10,40,100,0.35) 0%, transparent 55%),
    radial-gradient(ellipse 70% 40% at 88% 10%, rgba(80,10,110,0.35) 0%, transparent 55%),
    linear-gradient(180deg,#050215 0%,#0a0530 18%,#08031c 55%,#04020e 100%);
  font-family:'Crimson Text',serif; color:#fff; position:relative;
}
.cob-stars{position:fixed; inset:0; pointer-events:none; z-index:0;}
.cob-star{position:absolute; border-radius:50%; background:#fff; animation:cob-twinkle var(--d) ease-in-out infinite; animation-delay:var(--del);}
@keyframes cob-twinkle{0%,100%{opacity:var(--min);} 50%{opacity:1;}}

.cob-topnav{
  flex:0 0 auto; display:flex; align-items:center; justify-content:center; gap:14px;
  padding:14px 26px;
  background:linear-gradient(180deg, rgba(6,3,18,0.97), rgba(6,3,18,0.88));
  border-bottom:1px solid var(--gold-dim);
  position:relative; z-index:10;
}
.cob-brand-name{font-family:'Cinzel',serif; font-weight:900; letter-spacing:1px; font-size:16px; color:#fff;}
.cob-brand-name span{color:var(--gold);}

.cob-wrap{
  flex:1 1 auto; max-width:760px; width:100%; margin:0 auto;
  padding:clamp(20px,4vh,44px) clamp(20px,4vw,32px);
  position:relative; z-index:1; display:flex; flex-direction:column; gap:clamp(18px,2.6vh,28px);
}

.cob-hero{ text-align:center; display:flex; flex-direction:column; align-items:center; gap:10px; }
.cob-hero-img{
  width:150px; height:150px; object-fit:contain;
  filter:drop-shadow(0 0 28px var(--gold-glow));
}
.cob-eyebrow{font-family:'Cinzel',serif; font-size:12.5px; font-weight:900; letter-spacing:2.4px; color:var(--gold);}
h1.cob-title{font-family:'Cinzel Decorative',serif; font-weight:900; font-size:clamp(24px,4vh,32px); line-height:1.2; color:#fff; margin-top:4px;}
.cob-sub{font-family:'Nunito',sans-serif; font-size:14.5px; color:var(--lilac); max-width:480px; line-height:1.6;}

.cob-steps{ display:flex; flex-direction:column; gap:14px; }
.cob-step{
  background:var(--dark-surface); border:1px solid var(--gold-dim); border-radius:16px;
  padding:20px 22px; position:relative; overflow:hidden; display:flex; gap:16px; align-items:flex-start;
  transition:border-color .2s, background .2s;
}
.cob-step::before{content:""; position:absolute; inset:0; background:radial-gradient(ellipse 70% 60% at 0% 0%, rgba(212,175,55,0.08), transparent 70%); pointer-events:none;}
.cob-step.done{ border-color:var(--gold); background:rgba(212,175,55,0.06); }
.cob-step-num{
  flex:0 0 auto; width:34px; height:34px; border-radius:50%;
  background:rgba(212,175,55,0.14); border:1px solid var(--gold);
  color:var(--gold-bright); font-family:'Cinzel',serif; font-weight:900; font-size:14px;
  display:flex; align-items:center; justify-content:center; z-index:1;
}
.cob-step.done .cob-step-num{ background:var(--gold); color:#1a0d2e; }
.cob-step-body{ flex:1; min-width:0; z-index:1; }
.cob-step-title{font-family:'Cinzel',serif; font-weight:900; font-size:15.5px; color:#fff; margin-bottom:4px;}
.cob-step-desc{font-family:'Nunito',sans-serif; font-size:13.5px; color:var(--lilac); line-height:1.55; margin-bottom:12px;}



.cob-material-item{
  display:flex; align-items:center; justify-content:space-between; gap:12px;
  padding:14px 16px; border-radius:11px;
  background:rgba(212,175,55,0.07); border:1px solid var(--gold-dim);
  text-decoration:none; color:#fff; transition:background .2s, border-color .2s;
}
.cob-material-item:hover{background:rgba(212,175,55,0.13); border-color:var(--gold);}
.cob-material-left{display:flex; align-items:center; gap:12px;}
.cob-material-icon{
  width:38px; height:38px; border-radius:10px; flex-shrink:0;
  background:linear-gradient(160deg, rgba(212,175,55,0.3), rgba(124,58,237,0.2));
  display:flex; align-items:center; justify-content:center; font-size:18px; border:1px solid var(--gold-dim);
}
.cob-material-title{font-family:'Cinzel',serif; font-weight:700; font-size:14.5px;}
.cob-material-cta{font-family:'Cinzel',serif; font-weight:900; font-size:11.5px; letter-spacing:0.5px; color:var(--gold-bright); white-space:nowrap;}

.cob-check-row{
  display:flex; align-items:center; gap:10px; margin-top:14px; cursor:pointer;
  padding:12px 14px; border-radius:10px; border:1px solid var(--lilac-dim); background:rgba(255,255,255,0.02);
}
.cob-check-row.checked{ border-color:var(--gold); background:rgba(212,175,55,0.08); }
.cob-check-box{
  width:20px; height:20px; border-radius:6px; border:2px solid var(--lilac-dim); flex-shrink:0;
  display:flex; align-items:center; justify-content:center; font-size:13px; color:var(--gold-bright);
}
.cob-check-row.checked .cob-check-box{ border-color:var(--gold); background:var(--gold); color:#1a0d2e; }
.cob-check-label{font-family:'Nunito',sans-serif; font-weight:700; font-size:13.5px; color:#fff;}

.cob-cta-wrap{ display:flex; flex-direction:column; align-items:center; gap:10px; padding:10px 0 6px; }
.cob-btn{
  padding:15px 34px;
  background:linear-gradient(135deg, var(--gold-bright), var(--gold));
  border:none; border-radius:12px;
  color:#1a0d2e; font-family:'Cinzel',serif; font-weight:900; font-size:13px; letter-spacing:1.2px; cursor:pointer;
  box-shadow:0 8px 24px rgba(212,175,55,0.35);
  transition:transform .15s ease, box-shadow .15s ease, opacity .15s ease;
}
.cob-btn:disabled{ opacity:0.35; cursor:not-allowed; box-shadow:none; }
.cob-btn:not(:disabled):hover{ transform:translateY(-2px); box-shadow:0 12px 32px rgba(212,175,55,0.5); }
.cob-hint{font-family:'Nunito',sans-serif; font-size:12px; color:var(--lilac-dim);}

.cob-loading{
  min-height:100dvh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; text-align:center; padding:24px;
}
.cob-spinner{width:26px; height:26px; border:2.5px solid var(--gold-dim); border-top-color:var(--gold); border-radius:50%; animation:cob-girar 0.8s linear infinite;}
@keyframes cob-girar{ to{ transform:rotate(360deg); } }
`;

export default function CaminoParticipanteOnboardingPage() {
  const navigate = useNavigate();
  const [estado, setEstado] = useState('cargando'); // cargando | listo
  const [modulo1Url, setModulo1Url] = useState(null);
  const [confirmado, setConfirmado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [estrellas, setEstrellas] = useState([]);

  useEffect(() => {
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
    setEstrellas(arr);
  }, []);

  async function cargar() {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      navigate('/camino/participante/login', { replace: true });
      return;
    }

    const { data: onb } = await supabase.rpc('camino_mi_estado_onboarding');
    if (onb && onb.length > 0 && onb[0].modulo1_confirmado) {
      navigate('/camino/participante/home', { replace: true });
      return;
    }

    const { data: recurso } = await supabase
      .from('camino_recursos')
      .select('url_archivo')
      .eq('categoria', 'modulo1')
      .eq('activo', true)
      .order('orden')
      .limit(1)
      .maybeSingle();

    setModulo1Url(recurso?.url_archivo || null);
    setEstado('listo');
  }

  useEffect(() => { cargar(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  async function confirmarYContinuar() {
    if (!confirmado || enviando) return;
    setEnviando(true);
    const { data, error } = await supabase.rpc('camino_confirmar_modulo1');
    setEnviando(false);
    if (error || !data?.ok) return;
    navigate('/camino/participante/home', { replace: true });
  }

  if (estado === 'cargando') {
    return (
      <div className="cob-root">
        <style>{styles}</style>
        <div className="cob-loading">
          <div className="cob-spinner"></div>
          <p style={{ color: 'var(--lilac)', fontFamily: "'Nunito',sans-serif", fontSize: 14 }}>Preparando tu Camino...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cob-root">
      <style>{styles}</style>
      <div className="cob-stars">
        {estrellas.map(s => (
          <div key={s.id} className="cob-star" style={{
            width: `${s.size}px`, height: `${s.size}px`, top: `${s.top}%`, left: `${s.left}%`,
            '--d': `${s.dur}s`, '--del': `${s.delay}s`, '--min': s.min,
          }} />
        ))}
      </div>

      <nav className="cob-topnav">
        <div className="cob-brand-name">TEMPLO <span>DEL PROPÓSITO</span></div>
      </nav>

      <div className="cob-wrap">
        <div className="cob-hero">
          <img
            className="cob-hero-img"
            src="https://hdwzhwuhlrtrmhnecypm.supabase.co/storage/v1/object/public/camino-recursos/maestro-brazos-abiertos.png"
            alt="El Maestro Templario te da la bienvenida"
          />
          <div className="cob-eyebrow">ANTES DE TU PRIMER DÍA</div>
          <h1 className="cob-title">Bienvenido a tu Camino</h1>
          <p className="cob-sub">
            Un solo paso separa tu registro de tu primer día real: dejar listo el material
            que hace que cada guion suene a ti, no a un genérico más.
          </p>
        </div>

        <div className="cob-steps">
          <div className="cob-step done">
            <div className="cob-step-num">1</div>
            <div className="cob-step-body">
              <div className="cob-step-title">Descarga tu Módulo 1</div>
              <div className="cob-step-desc">Tu Porqué, tu forma de hablar, tu negocio y tu avatar — en un solo Word. Llénalo a tu ritmo.</div>
              {modulo1Url ? (
                <a className="cob-material-item" href={modulo1Url} target="_blank" rel="noopener noreferrer">
                  <div className="cob-material-left">
                    <div className="cob-material-icon">📜</div>
                    <div className="cob-material-title">Módulo 1 — Los 3 Pilares de tu Marca</div>
                  </div>
                  <div className="cob-material-cta">DESCARGAR →</div>
                </a>
              ) : (
                <div className="cob-hint">El archivo aún no está disponible — contacta a tu gestor.</div>
              )}
            </div>
          </div>

          <div className="cob-step">
            <div className="cob-step-num">2</div>
            <div className="cob-step-body">
              <div className="cob-step-title">Confirma que ya lo llenaste</div>
              <div className="cob-step-desc">No lo revisamos ni lo calificamos — es tuyo. Solo nos dices cuándo estás listo.</div>
              <div
                className={`cob-check-row ${confirmado ? 'checked' : ''}`}
                onClick={() => setConfirmado(v => !v)}
              >
                <div className="cob-check-box">{confirmado ? '✓' : ''}</div>
                <div className="cob-check-label">Ya llené mi Módulo 1</div>
              </div>
            </div>
          </div>
        </div>

        <div className="cob-cta-wrap">
          <button className="cob-btn" disabled={!confirmado || enviando} onClick={confirmarYContinuar}>
            {enviando ? 'ENTRANDO...' : 'ENTRAR A MI CAMINO →'}
          </button>
          {!confirmado && <div className="cob-hint">Marca la casilla de arriba para continuar</div>}
        </div>
      </div>
    </div>
  );
}

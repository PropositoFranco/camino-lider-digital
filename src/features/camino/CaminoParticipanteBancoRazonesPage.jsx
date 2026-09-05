import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function CaminoParticipanteBancoRazonesPage() {
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

  const gatillos = [
    { nombre: "Tiempo", sub: "Urgencia táctica", activa: 'Deadline, cuenta regresiva, "cierra el viernes"', cuando: "Lanzamientos, cierre de cohorte, eventos con fecha real" },
    { nombre: "Cantidad", sub: "Escasez cruda", activa: '"Quedan 8 cupos", plazas finitas', cuando: "Solo si el cupo es verificable: sesiones 1:1, mentorías, evento físico" },
    { nombre: "Social", sub: "Prueba social", activa: '"27 entraron esta semana"', cuando: "Cuando tienes el número real + captura real" },
    { nombre: "Contexto", sub: "Exclusividad", activa: "Acceso restringido, aplicación, invitación", cuando: "High-ticket, comunidad cerrada, mastermind" },
    { nombre: "Psicología", sub: "Aversión a la pérdida", activa: "Lo que PIERDE si no actúa hoy", cuando: "Siempre que sea verdad. Mide el costo real de no decidir" },
  ];

  const semanas = [
    {
      titulo: "Semana 1 · Días 1–7 · Fundamentos de venta",
      nota: "Aún no publicas urgencia. El Día 4 diseñas tu razón del mes. Estas son las que dejas listas para disparar en la Semana 3.",
      filas: [
        { razon: "Reset de medio año", gatillo: "Psicología", copy: '"Estamos a mitad de [año]. Puedes llegar a diciembre igual que hoy… o mover algo esta semana. Abro [oferta] con [cupos] lugares."' },
        { razon: "Cohorte/temporada que arranca", gatillo: "Tiempo", copy: '"Arranco una nueva tanda de [oferta] el [fecha]. Si entras antes, empiezas con el grupo — no sola un mes después."' },
        { razon: "Bono por decidir temprano", gatillo: "Contexto", copy: '"Las primeras [N] que entren este mes se llevan [bono que vence]. Cuando se acaben, se acaba."' },
      ],
    },
    {
      titulo: "Semana 2 · Días 8–14 · Activación",
      nota: "Tu lead magnet ya capta. La urgencia empuja a quien pidió tu recurso.",
      filas: [
        { razon: "Bonus atado al lead magnet", gatillo: "Tiempo", copy: '"Descargaste [lead magnet]. Esta semana, quien lo aplique y me escriba [palabra] entra a [oferta] con [bono] incluido. Solo hasta el [fecha]."' },
        { razon: "Cupo de sesión en vivo", gatillo: "Cantidad", copy: '"La sesión de [tema] del [día] tiene [N] lugares. Después queda grabada, pero en vivo respondo solo a las que estén dentro."' },
        { razon: "Prueba social del arranque", gatillo: "Social", copy: '"[N] personas entraron a [oferta] esta semana. La sala donde pasan las cosas ya está en movimiento."' },
      ],
    },
    {
      titulo: "Semana 3 · Días 15–21 · Tracción (Día 16: PUBLICAS)",
      nota: "El Día 16 sacas a jugar tu razón del mes. Aquí es donde más pesa (+25 la primera, +15 la segunda).",
      filas: [
        { razon: "Cupos que quedan (número real)", gatillo: "Cantidad", copy: '"Quedan [X] lugares en [oferta] este mes. Cuando lleguen a 0, cierro hasta la próxima Generación."' },
        { razon: "Fecha tope de esta tanda", gatillo: "Tiempo", copy: '"Cierro [oferta] el [fecha] a las [hora]. A las 00:01 está cerrado — no extiendo."' },
        { razon: "Bono que vence el viernes", gatillo: "Tiempo", copy: '"Hasta el [día], entras y te llevas [bono]. El lunes ya no está. No es descuento — es acceso que se cierra."' },
      ],
    },
    {
      titulo: "Semana 4 · Días 22–28 · Conversión y cierre",
      nota: "Cierre real. Aquí la aversión a la pérdida + la prueba social cierran a las indecisas.",
      filas: [
        { razon: "El precio sube (y se queda)", gatillo: "Psicología", copy: '"El [fecha] sube el precio de [oferta] a [$nuevo] y no vuelve a bajar. Hoy todavía entras a [$actual]."' },
        { razon: "Últimos cupos + prueba social", gatillo: "Cantidad + Social", copy: '"Quedan [X] lugares. [N] entraron en las últimas [horas]. Si lo estabas pensando, este es el momento."' },
        { razon: "Muestra el cierre (día después)", gatillo: "Social", copy: '"Cerré ayer a las [hora]. Las que entraron ya están en [primer beneficio]. La próxima Generación abre en [fecha]."' },
      ],
    },
  ];

  const variaciones = [
    { negocio: "Coaching / mentoría", activo: "Horas finitas tuyas (cap de plazas 1:1)", ejemplo: '"Solo puedo llevar [N] personas 1:1 este mes. Quedan [X]. Cuando se llenan, entras a lista de espera."' },
    { negocio: "Servicio (agencia, freelance)", activo: "Capacidad operativa del equipo por mes", ejemplo: '"Cierro [N] proyectos nuevos al mes para no bajar la calidad. Este mes queda [X]. Después, agosto."' },
    { negocio: "App / software", activo: "Precio de early access / plan que sube", ejemplo: '"El precio de fundador de [app] es [$X] para las primeras [N] cuentas. Después sube a [$Y] para siempre."' },
    { negocio: "Comunidad Skool", activo: "Cohorte sincronizada + drop de módulo del mes", ejemplo: '"Este mes en [comunidad] sale [módulo/reto]. Las miembras activas lo reciben gratis. Si entras después, ya no está incluido."' },
    { negocio: "Negocio físico", activo: "Aforo, agenda, temporada, stock del local", ejemplo: '"Tengo [N] lugares para [servicio] esta semana. La agenda de [mes] se está llenando — reserva tu [día]."' },
    { negocio: "Ecommerce", activo: "Stock real, drop limitado, envío por fecha", ejemplo: '"Quedan [X] unidades de [producto] de esta tanda. La próxima llega en [fecha]. Pide hoy y te llega antes de [evento]."' },
  ];

  return (
    <div className="banco-razones-page">
      <style>{CSS}</style>

      <div className="stars">
        {stars.map((s, i) => (
          <div
            key={i}
            className="star"
            style={{
              width: `${s.size}px`, height: `${s.size}px`, top: `${s.top}%`, left: `${s.left}%`,
              "--d": `${s.dur}s`, "--del": `${s.delay}s`, "--min": s.min,
            }}
          />
        ))}
      </div>

      <nav className="topnav">
        <div className="brand">
          <div className="brand-name">TEMPLO <span>DEL PROPÓSITO</span></div>
        </div>
        <button className="back-link" onClick={() => navigate('/camino/participante/home')}>← Volver a Inicio</button>
      </nav>

      <div className="wrap">
        <div className="eyebrow">PAQUETE DE APOYO · ROAD TO 1K — CREA PARA VENDER</div>
        <h1 className="page-title">Banco de Razones de Urgencia</h1>
        <p className="lede">
          Un banco de razones de urgencia <b>honestas</b>, listas para personalizar (cupos, fecha tope, bono que
          vence, precio que sube). Genérico por semana, reutilizable por cada Generación. Tú solo rellenas los{" "}
          <b>[corchetes]</b> con tus datos reales.
        </p>

        <div className="chip-row">
          <span className="chip chip-gold">1ª razón de la semana → +25 pts</span>
          <span className="chip chip-green">2ª razón de la semana → +15 pts</span>
          <span className="chip chip-muted">Misión Día 4: la diseñas</span>
          <span className="chip chip-muted">Misión Día 16: la publicas</span>
        </div>

        <hr className="divider" />

        <h2 className="sec-title">Primero: ¿qué es una razón de urgencia?</h2>
        <div className="quote-card">
          <p>Es el motivo <b>honesto</b> por el que alguien debería entrar HOY y no "algún día".</p>
        </div>
        <p className="body-text">
          No es presión ni manipulación. Es hacer visible un límite real que ya existe en tu oferta: un cupo que se
          agota, una fecha que cierra, un bono que vence, un precio que sube. Sin urgencia, la mayoría que dice "lo
          voy a pensar" nunca vuelve — no porque no le interese, sino porque nada la empuja a decidir{" "}
          <b>ahora</b>. La urgencia honesta le da ese empujón sin quemar tu marca.
        </p>

        <hr className="divider" />

        <h2 className="sec-title">Cómo se plantea: la fórmula de 4 piezas</h2>
        <p className="body-text">
          Toda razón de urgencia fuerte tiene estas 4 partes. Si te falta una, se siente floja. Rellena cada pieza
          con tu dato real y ya tienes tu razón lista para publicar.
        </p>
        <div className="phase-grid">
          <div className="phase-card">
            <div className="phase-num">01 · ACTIVO</div>
            <div className="phase-name">Qué es lo escaso</div>
            <div className="phase-focus">El límite verificable de tu oferta: cupos, fecha, bono o precio.</div>
            <div className="phase-example">"Abro [oferta]…"</div>
          </div>
          <div className="phase-card">
            <div className="phase-num">02 · LÍMITE</div>
            <div className="phase-name">Cuándo se acaba</div>
            <div className="phase-focus">El número o la fecha/hora EXACTA. Nada de "por tiempo limitado".</div>
            <div className="phase-example">"…quedan [8] lugares / cierro el [viernes]."</div>
          </div>
          <div className="phase-card">
            <div className="phase-num">03 · CONSECUENCIA</div>
            <div className="phase-name">Qué pierde si no actúa</div>
            <div className="phase-focus">El costo real de esperar: el bono, el precio, el grupo, la fecha.</div>
            <div className="phase-example">"Después sube a [$X] y no vuelve a bajar."</div>
          </div>
          <div className="phase-card">
            <div className="phase-num">04 · ACCIÓN</div>
            <div className="phase-name">Qué hacer AHORA</div>
            <div className="phase-focus">El paso concreto: comenta la palabra, escríbeme, toca el link.</div>
            <div className="phase-example">"Comenta [PALABRA] y te paso el link."</div>
          </div>
        </div>
        <div className="formula-completa">
          La fórmula completa: Activo + Límite + Consecuencia + Acción. → <i>"Abro [oferta], quedan [8] lugares. Cuando lleguen a 0 cierro hasta la próxima Generación. Comenta [PALABRA] y te paso el link."</i>
        </div>

        <hr className="divider" />

        <h2 className="sec-title">De flojo a fuerte (misma oferta)</h2>
        <div className="dos-columnas">
          <div className="ejemplo-card ejemplo-malo">
            <div className="ejemplo-tag">✕ Flojo (no mueve)</div>
            <p>"¡Últimos días para entrar a mi programa! No te lo pierdas 🙌"</p>
            <div className="ejemplo-nota">Sin número, sin fecha, sin consecuencia, sin acción. El cerebro no siente ningún límite real.</div>
          </div>
          <div className="ejemplo-card ejemplo-bueno">
            <div className="ejemplo-tag">✓ Fuerte (mueve)</div>
            <p>"Quedan [6] lugares en [programa] y cierro el [viernes 23:59]. El lunes el precio sube a [$X] y se queda. Comenta [QUIERO] y te paso el link."</p>
            <div className="ejemplo-nota">Las 4 piezas presentes. Cada una es verdad y verificable.</div>
          </div>
        </div>

        <hr className="divider" />

        <h2 className="sec-title">Qué vende HOY en redes (investigación real)</h2>
        <p className="body-text">
          No es opinión. Esto es lo que muestran los datos de conversión 2025–2026 — y lo cruzamos con la anatomía
          de urgencia honesta de <b>Templo del Propósito</b>.
        </p>
        <div className="phase-grid">
          <div className="phase-card">
            <div className="phase-name">La escasez de CANTIDAD gana</div>
            <div className="phase-focus">En pruebas A/B, los avisos de cantidad ("quedan 8 cupos", drops, waitlist) convierten más que los de solo tiempo (cuenta regresiva). Si tienes un cupo real, dilo con número.</div>
          </div>
          <div className="phase-card">
            <div className="phase-name">El reloj sí mueve</div>
            <div className="phase-focus">Un cronómetro visible en la oferta dio ~9% de lift en conversión. El 68% de las personas cede ante una cuenta regresiva real. Úsalo junto al cupo, no en vez de.</div>
          </div>
          <div className="phase-card">
            <div className="phase-name">La urgencia FALSA quema</div>
            <div className="phase-focus">La FTC ya sanciona los "cronómetros que se reinician" y el "stock falso" como patrones oscuros. Inventar cupos mata tu marca. Regla Templo del Propósito: sin activo real, no hay urgencia.</div>
          </div>
          <div className="phase-card">
            <div className="phase-name">Bonus que vence &gt; descuento</div>
            <div className="phase-focus">Un bono con fecha (acceso, sesión, plantilla) crea urgencia sin bajar tu precio ni entrenar a tu gente a esperar rebajas.</div>
          </div>
        </div>
        <div className="quote-card">
          <p style={{ fontSize: 15 }}>
            La regla de oro: toda razón de urgencia debe apoyarse en un activo VERIFICABLE de tu oferta (una sesión
            con cupo, una cohorte que cierra, un bono que de verdad vence, un precio que sube y se queda arriba). Si
            no puedes probarlo, no lo digas.
          </p>
        </div>
        <p className="fuente-nota">
          Fuentes: OptiMonk — Scarcity Marketing 2026 · Drip — 10 Proven Scarcity Tactics · Scandiweb — Scarcity
          Examples 2026 · ProveSource — Urgency Without Being Pushy. Metodología: Anatomía de la Urgencia (Grimorio
          Templo del Propósito / Daniel Franco).
        </p>

        <hr className="divider" />

        <h2 className="sec-title">Los 5 gatillos (elige el que sea VERDAD para ti)</h2>
        <table>
          <thead>
            <tr><th>Gatillo</th><th>Qué activa</th><th>Cuándo es honesto usarlo</th></tr>
          </thead>
          <tbody>
            {gatillos.map((g) => (
              <tr key={g.nombre}>
                <td className="hl">{g.nombre}<div style={{ fontWeight: 400, color: 'var(--lilac)', fontSize: 12.5 }}>{g.sub}</div></td>
                <td>{g.activa}</td>
                <td>{g.cuando}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr className="divider" />

        <h2 className="sec-title">Pool semanal — 4 semanas del reto</h2>
        <p className="body-text">
          Cada semana trae razones ya redactadas. Rota una por semana (publica la 1ª = +25, la 2ª = +15). Rellena
          los [corchetes] con tu dato real.
        </p>
        {semanas.map((s) => (
          <div key={s.titulo} className="semana-block">
            <div className="semana-titulo">{s.titulo}</div>
            <div className="semana-nota">{s.nota}</div>
            <table>
              <thead><tr><th>Razón</th><th>Gatillo</th><th>Copy modelo (rellenable)</th></tr></thead>
              <tbody>
                {s.filas.map((f) => (
                  <tr key={f.razon}>
                    <td className="hl">{f.razon}</td>
                    <td>{f.gatillo}</td>
                    <td style={{ fontStyle: 'italic' }}>{f.copy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        <hr className="divider" />

        <h2 className="sec-title">Variaciones por tipo de negocio</h2>
        <p className="body-text">La urgencia honesta cambia según lo que vendes. Encuentra tu fila, toma su activo de escasez y adapta las razones del pool.</p>
        <table>
          <thead><tr><th>Tu negocio</th><th>Tu activo de escasez REAL</th><th>Razón ejemplo (rellenable)</th></tr></thead>
          <tbody>
            {variaciones.map((v) => (
              <tr key={v.negocio}>
                <td className="hl">{v.negocio}</td>
                <td>{v.activo}</td>
                <td style={{ fontStyle: 'italic' }}>{v.ejemplo}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr className="divider" />

        <h2 className="sec-title">Reglas de honestidad (no las rompas)</h2>
        <ul className="rules">
          <li><span className="dot" /><span className="txt"><b>Una urgencia, un cierre.</b> No cruces dos campañas de urgencia en la misma semana: compiten entre sí y confunden.</span></li>
          <li><span className="dot" /><span className="txt"><b>Nunca extiendas un cierre.</b> Si dijiste 23:59, a las 00:01 está cerrado. Extender = perder credibilidad por meses.</span></li>
          <li><span className="dot" /><span className="txt"><b>Verifica el "después" antes de prometerlo.</b> Si dices "el precio sube", tiene que subir y quedarse arriba 30+ días. Si dices "quedan 8", que de verdad queden 8.</span></li>
          <li><span className="dot" /><span className="txt"><b>El día después del cierre, muestra el cierre.</b> "Cerré a las 23:59, las que entraron ya están dentro." Eso construye credibilidad para tu próxima urgencia.</span></li>
        </ul>

        <div className="footer-nota">
          Paquete de apoyo del reto Road to 1k — Crea para Vender · <b>Templo del Propósito</b> · Genérico Día 1–28, reutilizable por cohorte.<br />
          Cómo puntúa en la Recaudación: la 1ª razón de urgencia que publicas en la semana suma +25; la 2ª, +15.
        </div>
      </div>
    </div>
  );
}

const CSS = `
:root{
  --gold:#D4AF37; --gold-bright:#FFE566; --gold-dim:rgba(212,175,55,0.4); --gold-glow:rgba(212,175,55,0.65);
  --dark-bg:#04020e; --dark-surface:rgba(10,5,32,0.92); --dark-surface-2:rgba(16,8,40,0.75);
  --purple:#CC44FF; --lilac:rgba(200,185,240,0.72); --lilac-dim:rgba(200,185,240,0.45);
  --green:#44ff88; --red:#ff4466;
}
.banco-razones-page *,.banco-razones-page *::before,.banco-razones-page *::after{margin:0;padding:0;box-sizing:border-box;}
.banco-razones-page{
  min-height:100dvh; width:100%; position:relative;
  background:
    radial-gradient(ellipse 120% 50% at 50% 0%, rgba(40,10,90,0.9) 0%, transparent 60%),
    radial-gradient(ellipse 70% 40% at 12% 15%, rgba(10,40,100,0.35) 0%, transparent 55%),
    linear-gradient(180deg,#050215 0%,#0a0530 18%,#08031c 55%,#04020e 100%);
  font-family:'Crimson Text',serif; color:#fff;
}
.banco-razones-page .stars{position:fixed; inset:0; pointer-events:none; z-index:0;}
.banco-razones-page .star{position:absolute; border-radius:50%; background:#fff; animation:br-twinkle var(--d) ease-in-out infinite; animation-delay:var(--del);}
@keyframes br-twinkle{0%,100%{opacity:var(--min);} 50%{opacity:1;}}

.banco-razones-page .topnav{
  position:relative; z-index:10; display:flex; align-items:center; justify-content:space-between; gap:14px;
  padding:14px 26px; background:linear-gradient(180deg, rgba(6,3,18,0.97), rgba(6,3,18,0.88)); border-bottom:1px solid var(--gold-dim);
}
.banco-razones-page .brand-name{font-family:'Cinzel',serif; font-weight:900; letter-spacing:1px; font-size:16px; color:#fff;}
.banco-razones-page .brand-name span{color:var(--gold);}
.banco-razones-page .back-link{
  font-family:'Cinzel',serif; font-weight:700; font-size:12px; color:var(--lilac); background:none; border:1px solid var(--gold-dim);
  border-radius:100px; padding:8px 16px; cursor:pointer;
}
.banco-razones-page .back-link:hover{color:var(--gold-bright); border-color:var(--gold);}

.banco-razones-page .wrap{position:relative; z-index:1; max-width:900px; margin:0 auto; padding:36px 24px 60px;}
.banco-razones-page .eyebrow{font-family:'Cinzel',serif; font-weight:900; font-size:11.5px; letter-spacing:2px; color:var(--gold); margin-bottom:10px;}
.banco-razones-page .page-title{font-family:'Cinzel Decorative',serif; font-weight:900; font-size:clamp(26px,4vw,38px); color:#fff; margin-bottom:14px;}
.banco-razones-page .lede{font-family:'Crimson Text',serif; font-size:16.5px; line-height:1.6; color:rgba(255,255,255,0.85); margin-bottom:18px;}
.banco-razones-page .lede b{color:var(--gold-bright); font-weight:600;}

.banco-razones-page .chip-row{display:flex; flex-wrap:wrap; gap:8px; margin-bottom:10px;}
.banco-razones-page .chip{font-family:'Nunito',sans-serif; font-weight:800; font-size:11.5px; padding:6px 14px; border-radius:100px; border:1px solid var(--gold-dim);}
.banco-razones-page .chip-gold{background:rgba(212,175,55,0.18); color:var(--gold-bright); border-color:var(--gold);}
.banco-razones-page .chip-green{background:rgba(68,255,136,0.12); color:var(--green); border-color:rgba(68,255,136,0.4);}
.banco-razones-page .chip-muted{background:rgba(255,255,255,0.05); color:var(--lilac);}

.banco-razones-page hr.divider{border:none; height:1px; background:linear-gradient(90deg, var(--gold-dim), transparent); margin:36px 0 28px;}
.banco-razones-page h2.sec-title{font-family:'Cinzel',serif; font-weight:900; font-size:clamp(20px,2.6vw,26px); color:#fff; margin-bottom:16px;}

.banco-razones-page .quote-card{
  background:var(--dark-surface); border:1px solid var(--gold-dim); border-left:3px solid var(--gold);
  border-radius:12px; padding:20px 22px; margin-bottom:20px;
}
.banco-razones-page .quote-card p{font-family:'Cinzel',serif; font-weight:700; font-size:clamp(15px,1.8vw,18px); line-height:1.5; color:#fff;}

.banco-razones-page p.body-text{font-family:'Crimson Text',serif; font-size:16.5px; line-height:1.62; color:rgba(255,255,255,0.85); margin-bottom:18px;}
.banco-razones-page p.body-text b{color:var(--gold-bright); font-weight:600;}
.banco-razones-page .fuente-nota{font-family:'Nunito',sans-serif; font-size:11.5px; color:var(--lilac-dim); line-height:1.5; margin-top:8px;}

.banco-razones-page .phase-grid{display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:20px;}
@media (max-width:760px){ .banco-razones-page .phase-grid{grid-template-columns:1fr 1fr;} }
@media (max-width:480px){ .banco-razones-page .phase-grid{grid-template-columns:1fr;} }
.banco-razones-page .phase-card{background:var(--dark-surface); border:1px solid var(--gold-dim); border-radius:12px; padding:16px 14px;}
.banco-razones-page .phase-num{font-family:'Cinzel',serif; font-weight:900; font-size:10.5px; letter-spacing:1.2px; color:var(--gold); margin-bottom:6px;}
.banco-razones-page .phase-name{font-family:'Cinzel',serif; font-weight:700; font-size:14px; color:#fff; margin-bottom:6px;}
.banco-razones-page .phase-focus{font-family:'Nunito',sans-serif; font-size:12px; line-height:1.5; color:var(--lilac); margin-bottom:8px;}
.banco-razones-page .phase-example{font-family:'Nunito',sans-serif; font-size:11.5px; font-style:italic; color:var(--gold-bright); background:rgba(212,175,55,0.08); border-radius:8px; padding:6px 9px;}

.banco-razones-page .formula-completa{
  font-family:'Nunito',sans-serif; font-size:14px; line-height:1.6; color:#fff;
  background:linear-gradient(160deg, rgba(212,175,55,0.12), rgba(124,58,237,0.08)); border-left:3px solid var(--gold);
  border-radius:10px; padding:16px 18px; margin-bottom:8px;
}

.banco-razones-page .dos-columnas{display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:8px;}
@media (max-width:700px){ .banco-razones-page .dos-columnas{grid-template-columns:1fr;} }
.banco-razones-page .ejemplo-card{border-radius:12px; padding:18px 20px; border:1px solid;}
.banco-razones-page .ejemplo-malo{background:rgba(255,68,102,0.06); border-color:rgba(255,68,102,0.35);}
.banco-razones-page .ejemplo-bueno{background:rgba(68,255,136,0.06); border-color:rgba(68,255,136,0.35);}
.banco-razones-page .ejemplo-tag{font-family:'Cinzel',serif; font-weight:900; font-size:11px; letter-spacing:0.5px; margin-bottom:8px;}
.banco-razones-page .ejemplo-malo .ejemplo-tag{color:var(--red);}
.banco-razones-page .ejemplo-bueno .ejemplo-tag{color:var(--green);}
.banco-razones-page .ejemplo-card p{font-family:'Crimson Text',serif; font-size:15px; line-height:1.5; color:#fff; margin-bottom:8px;}
.banco-razones-page .ejemplo-nota{font-family:'Nunito',sans-serif; font-size:11.5px; color:var(--lilac-dim);}

.banco-razones-page table{width:100%; border-collapse:collapse; margin-bottom:24px; border-radius:12px; overflow:hidden; border:1px solid var(--gold-dim);}
.banco-razones-page thead th{
  font-family:'Cinzel',serif; font-weight:900; font-size:11px; letter-spacing:1px; text-transform:uppercase;
  color:var(--gold-bright); background:rgba(212,175,55,0.1); text-align:left; padding:12px 16px;
}
.banco-razones-page tbody td{
  font-family:'Nunito',sans-serif; font-size:13.5px; line-height:1.5; color:rgba(255,255,255,0.9);
  padding:14px 16px; border-top:1px solid rgba(212,175,55,0.15); background:var(--dark-surface-2);
}
.banco-razones-page tbody tr:nth-child(even) td{background:rgba(16,8,40,0.5);}
.banco-razones-page td.hl{color:var(--gold-bright); font-weight:700; font-family:'Nunito',sans-serif;}

.banco-razones-page .semana-block{margin-bottom:26px;}
.banco-razones-page .semana-titulo{font-family:'Cinzel',serif; font-weight:900; font-size:15px; color:var(--gold-bright); margin-bottom:6px;}
.banco-razones-page .semana-nota{font-family:'Nunito',sans-serif; font-size:12.5px; color:var(--lilac); margin-bottom:12px;}

.banco-razones-page ul.rules{list-style:none; margin-bottom:20px;}
.banco-razones-page ul.rules li{display:flex; gap:14px; padding:16px 0; border-top:1px solid rgba(212,175,55,0.12);}
.banco-razones-page ul.rules li:first-child{border-top:none;}
.banco-razones-page ul.rules li .dot{width:8px; height:8px; border-radius:50%; background:var(--gold); flex-shrink:0; margin-top:9px; box-shadow:0 0 8px var(--gold-glow);}
.banco-razones-page ul.rules li .txt{font-family:'Crimson Text',serif; font-size:16px; line-height:1.6; color:rgba(255,255,255,0.85);}
.banco-razones-page ul.rules li .txt b{color:var(--gold-bright); font-weight:600;}

.banco-razones-page .footer-nota{font-family:'Nunito',sans-serif; font-size:11.5px; line-height:1.6; color:var(--lilac-dim); text-align:center; margin-top:30px;}
.banco-razones-page .footer-nota b{color:var(--gold);}
`;

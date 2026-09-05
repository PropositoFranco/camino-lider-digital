import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseCamino } from '../../services/supabaseCamino';
import { supabase as supabaseGestor } from '../../services/supabase';

// =====================================================================
// CaminoModoToggle.jsx
//
// Botones de "modo actual" / "cambiar de modo" para la barra de
// navegación de Camino. Funciona en ambos sentidos:
//
//   <CaminoModoToggle modo="participante" />   (default si no se pasa prop)
//   <CaminoModoToggle modo="gestor" />
//
// - Siempre muestra el modo actual (marcado como activo, no clickeable).
// - El botón del OTRO modo solo aparece si esa persona también tiene
//   acceso ahí (existe su fila en camino_gestores / camino_participantes).
// - Al cambiar de modo copiamos la sesión actual al cliente del otro
//   lado (mismo proyecto de Supabase, mismo usuario) — no hace falta
//   volver a loguearse.
//
// Estilos auto-contenidos (no depende del CSS de la página donde se usa).
//
// ⚠️ Requiere que ambas tablas (camino_gestores y camino_participantes)
// permitan que un usuario lea su propia fila (RLS: "id = auth.uid()").
// Si el botón del otro modo no sale aunque sepas que sí tiene acceso,
// revisa esa policy primero.
// =====================================================================

const CONFIG = {
  participante: {
    clienteActual: supabaseCamino,
    clienteDestino: supabaseGestor,
    tablaDestino: 'camino_gestores',
    rutaDestino: '/camino/gestor/panel',
    labelActual: 'Participante',
    labelDestino: 'Gestor',
  },
  gestor: {
    clienteActual: supabaseGestor,
    clienteDestino: supabaseCamino,
    tablaDestino: 'camino_participantes',
    rutaDestino: '/camino/participante/home',
    labelActual: 'Gestor',
    labelDestino: 'Participante',
  },
};

const styles = `
.cmt-wrap{
  display:flex; align-items:center; gap:4px;
  background:rgba(255,255,255,0.04); border:1px solid rgba(212,175,55,0.3);
  border-radius:10px; padding:3px; flex-shrink:0;
}
.cmt-btn{
  font-family:'Cinzel',serif; font-weight:700; font-size:10.5px; letter-spacing:0.5px;
  padding:7px 13px; border-radius:8px; border:1px solid transparent; cursor:pointer;
  background:transparent; color:rgba(240,234,255,0.5); white-space:nowrap;
  transition:background .2s, color .2s, border-color .2s;
}
.cmt-btn:hover:not(:disabled):not(.cmt-activo){ color:rgba(240,234,255,0.8); }
.cmt-btn.cmt-activo{
  background:rgba(212,175,55,0.16); color:#FFE566; border-color:rgba(212,175,55,0.4); cursor:default;
}
.cmt-btn:disabled{ opacity:0.6; }
`;

export default function CaminoModoToggle({ modo = 'participante' }) {
  const navigate = useNavigate();
  const cfg = CONFIG[modo];
  const [tieneOtroModo, setTieneOtroModo] = useState(false);
  const [cambiando, setCambiando] = useState(false);

  useEffect(() => {
    async function verificar() {
      const { data: sessionData } = await cfg.clienteActual.auth.getSession();
      const uid = sessionData?.session?.user?.id;
      if (!uid) return;

      const { data } = await cfg.clienteActual
        .from(cfg.tablaDestino)
        .select('id')
        .eq('id', uid)
        .maybeSingle();

      if (data) setTieneOtroModo(true);
    }
    verificar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo]);

  async function cambiarModo() {
    if (cambiando) return;
    setCambiando(true);

    const { data: sessionData } = await cfg.clienteActual.auth.getSession();
    const session = sessionData?.session;
    if (!session) {
      setCambiando(false);
      return;
    }

    await cfg.clienteDestino.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });

    navigate(cfg.rutaDestino);
  }

  return (
    <div className="cmt-wrap">
      <style>{styles}</style>
      <button className="cmt-btn cmt-activo" disabled>{cfg.labelActual}</button>
      {tieneOtroModo && (
        <button className="cmt-btn" disabled={cambiando} onClick={cambiarModo}>
          {cambiando ? '...' : cfg.labelDestino}
        </button>
      )}
    </div>
  );
}
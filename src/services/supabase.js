import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Cliente para las paginas de GESTOR (lider/manager) de Camino.
// Mismo proyecto de Supabase que supabaseCamino.js, mismo storageKey
// que usaba en el monolito para no romper sesiones de gestores ya
// autenticados.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'sb-propotienda-auth',
  },
});

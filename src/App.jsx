import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const CaminoLandingPage = lazy(() => import('./features/camino/CaminoLandingPage'));
const CaminoGestorLoginPage = lazy(() => import('./features/camino/CaminoGestorLoginPage'));
const CaminoGestorPanelPage = lazy(() => import('./features/camino/CaminoGestorPanelPage'));
const CaminoParticipanteLoginPage = lazy(() => import('./features/camino/CaminoParticipanteLoginPage'));
const CaminoParticipanteHomePage = lazy(() => import('./features/camino/CaminoParticipanteHomePage'));
const CaminoParticipantePanelPage = lazy(() => import('./features/camino/CaminoParticipantePanelPage'));
const CaminoParticipantePasaportePage = lazy(() => import('./features/camino/CaminoParticipantePasaportePage'));
const CaminoParticipanteCalendarioPage = lazy(() => import('./features/camino/CaminoParticipanteCalendarioPage'));
const CaminoParticipanteBasesPage = lazy(() => import('./features/camino/CaminoParticipanteBasesPage'));
const CaminoParticipanteRankingPage = lazy(() => import('./features/camino/CaminoParticipanteRankingPage'));
const CaminoParticipanteArmeriaPage = lazy(() => import('./features/camino/CaminoParticipanteArmeriaPage'));
const CaminoParticipanteOnboardingPage = lazy(() => import('./features/camino/CaminoParticipanteOnboardingPage'));
const CaminoInstalarPage = lazy(() => import('./features/camino/CaminoInstalarPage'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          {/* Raiz del dominio -> landing de Camino */}
          <Route path="/" element={<Navigate to="/camino" replace />} />

          <Route path="/camino" element={<CaminoLandingPage />} />
          <Route path="/camino/gestor/login" element={<CaminoGestorLoginPage />} />
          <Route path="/camino/gestor/panel" element={<CaminoGestorPanelPage />} />
          <Route path="/camino/participante/login" element={<CaminoParticipanteLoginPage />} />
          <Route path="/camino/participante/home" element={<CaminoParticipanteHomePage />} />
          <Route path="/camino/participante/pasaporte" element={<CaminoParticipantePasaportePage />} />
          <Route path="/camino/participante/panel" element={<CaminoParticipantePanelPage />} />
          <Route path="/camino/participante/calendario" element={<CaminoParticipanteCalendarioPage />} />
          <Route path="/camino/participante/bases" element={<CaminoParticipanteBasesPage />} />
          <Route path="/camino/participante/ranking" element={<CaminoParticipanteRankingPage />} />
          <Route path="/camino/participante/armeria" element={<CaminoParticipanteArmeriaPage />} />
          <Route path="/camino/participante/onboarding" element={<CaminoParticipanteOnboardingPage />} />
          <Route path="/camino/instalar" element={<CaminoInstalarPage />} />

          {/* Cualquier otra cosa -> landing, nunca a un login ajeno */}
          <Route path="*" element={<Navigate to="/camino" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
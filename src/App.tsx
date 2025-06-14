import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { Applications } from './pages/Applications';
import { ApplicationDetail } from './pages/ApplicationDetail';
import { Certificates } from './pages/Certificates';
import { Users } from './pages/Users';
import { Connectors } from './pages/Connectors';
import { AuditLogs } from './pages/AuditLogs';
import { StatusPage } from './pages/StatusPage';
import { CallbackPage } from './pages/Callback';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública */}
        <Route path="/status" element={<StatusPage />} />
        
        {/* Rota de Callback da Autenticação (também pública) */}
        <Route path="/callback" element={<CallbackPage />} />
        
        {/* Rotas Protegidas que exigem login */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/applications/:id" element={<ApplicationDetail />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/users" element={<Users />} />
            <Route path="/connectors" element={<Connectors />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
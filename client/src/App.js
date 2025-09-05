import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LocalAuthProvider } from './contexts/LocalAuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Componentes principais
import AccessSelector from './components/AccessSelector';
import EmpresaCadastro from './components/EmpresaCadastro';
import EmpresaLogin from './components/EmpresaLogin';
import EmpresaDashboard from './components/EmpresaDashboard';
import ClienteLogin from './components/ClienteLogin';
import SelecaoEmpresa from './components/SelecaoEmpresa';
import AgendamentoEmpresa from './components/AgendamentoEmpresa';

// Páginas de gestão
import ServicosManagement from './pages/ServicosManagement';
import FuncionariosManagement from './pages/FuncionariosManagement';
import CompanySettings from './pages/CompanySettings';

// Componentes de dashboard
import DashboardKPIs from './components/DashboardKPIs';
import ExportData from './components/ExportData';
import ClearData from './components/ClearData';

function App() {
  return (
    <LocalAuthProvider>
      <Router>
        <Routes>
        {/* Página Principal */}
        <Route path="/" element={<AccessSelector />} />
        
        {/* Rota para limpar dados (temporária) */}
        <Route path="/clear" element={<ClearData />} />
        
        {/* Rotas B2B (Empresas) */}
        <Route path="/empresa/cadastro" element={<EmpresaCadastro />} />
        <Route path="/empresa/login" element={<EmpresaLogin />} />
        <Route path="/empresa/dashboard" element={<EmpresaDashboard />} />
        
        {/* Rotas de Gestão */}
        <Route path="/servicos" element={<ProtectedRoute><ServicosManagement /></ProtectedRoute>} />
        <Route path="/funcionarios" element={<ProtectedRoute><FuncionariosManagement /></ProtectedRoute>} />
        <Route path="/configuracoes" element={<ProtectedRoute><CompanySettings /></ProtectedRoute>} />
        <Route path="/kpis" element={<ProtectedRoute><DashboardKPIs /></ProtectedRoute>} />
        <Route path="/exportar" element={<ProtectedRoute><ExportData /></ProtectedRoute>} />
        
        {/* Rotas B2C (Clientes) */}
        <Route path="/cliente/login" element={<ClienteLogin />} />
        <Route path="/cliente" element={<SelecaoEmpresa />} />
        <Route path="/cliente/empresa/:empresaId" element={<AgendamentoEmpresa />} />
        </Routes>
      </Router>
    </LocalAuthProvider>
  );
}

export default App; 

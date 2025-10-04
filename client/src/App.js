import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LocalAuthProvider } from './contexts/LocalAuthContext';
import ProtectedRoute from './components/shared/ProtectedRoute';

// Componentes principais
import AccessSelector from './components/AccessSelector';

// Componentes de empresa
import EmpresaCadastro from './components/empresa/EmpresaCadastro';
import EmpresaLogin from './components/empresa/EmpresaLogin';
import EmpresaDashboard from './components/empresa/EmpresaDashboard';

// Componentes de cliente
import SelecaoEmpresa from './components/funcionario/SelecaoEmpresa';
import AgendamentoEmpresa from './components/funcionario/AgendamentoEmpresa';

// Páginas de funcionário e gestão
import FuncionarioAgenda from './pages/FuncionarioAgenda';
import ServicosManagement from './pages/ServicosManagement';
import FuncionariosManagement from './pages/FuncionariosManagement';

function App() {
  return (
    <LocalAuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Página Principal */}
          <Route path="/" element={<AccessSelector />} />
          
          {/* Rotas B2B (Empresas) */}
          <Route path="/empresa/cadastro" element={<EmpresaCadastro />} />
          <Route path="/empresa/login" element={<EmpresaLogin />} />
          <Route path="/empresa/dashboard" element={<ProtectedRoute><EmpresaDashboard /></ProtectedRoute>} />
          
          {/* Rotas de Gestão */}
          <Route path="/servicos" element={<ProtectedRoute><ServicosManagement /></ProtectedRoute>} />
          <Route path="/funcionarios" element={<ProtectedRoute><FuncionariosManagement /></ProtectedRoute>} />
          
          {/* Rotas B2C (Clientes) */}
          <Route path="/cliente" element={<SelecaoEmpresa />} />
          <Route path="/cliente/empresa/:empresaId" element={<AgendamentoEmpresa />} />
          
          {/* Rotas de Funcionários */}
          <Route path="/funcionario/agenda" element={<FuncionarioAgenda />} />
          
          {/* Rota de fallback para rotas não encontradas */}
          <Route path="*" element={<AccessSelector />} />
        </Routes>
      </Router>
    </LocalAuthProvider>
  );
}

export default App; 

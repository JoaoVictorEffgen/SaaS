import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MySqlAuthProvider } from './contexts/MySqlAuthContext';
import InstallPWA from './components/InstallPWA';

// Importações dos módulos organizados
import {
  AccessSelector,
  TypedProtectedRoute,
  RedirectHandler,
  DashboardKPIs,
  ExportData,
  EmpresaCadastro,
  EmpresaLogin,
  EmpresaDashboard,
  ConfiguracoesEmpresa,
  ServicosManagement,
  FuncionariosManagement,
  SelecaoEmpresa,
  AgendamentoEmpresa,
  FuncionarioAgenda
} from './modules';

// Importações dos componentes de pacotes
import DashboardPacotes from './components/pacotes/DashboardPacotes';

// Importações dos componentes de rede
import DashboardRede from './components/rede/DashboardRede';


// Debug components removidos para limpeza

function App() {
  return (
    <MySqlAuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <RedirectHandler />
        <InstallPWA />
      <Routes>
          {/* Página Principal */}
        <Route path="/" element={<AccessSelector />} />
        
          {/* Rotas B2B (Empresas) - Apenas para usuários tipo 'empresa' */}
        <Route path="/empresa/cadastro" element={<EmpresaCadastro />} />
        <Route path="/empresa/login" element={<EmpresaLogin />} />
        <Route path="/empresa/dashboard" element={<EmpresaDashboard />} />
        <Route path="/empresa/configuracoes" element={<TypedProtectedRoute allowedTypes={['empresa']}><ConfiguracoesEmpresa /></TypedProtectedRoute>} />
        
          {/* Rotas de Gestão - Apenas para usuários tipo 'empresa' */}
          <Route path="/servicos" element={<TypedProtectedRoute allowedTypes={['empresa']}><ServicosManagement /></TypedProtectedRoute>} />
          <Route path="/funcionarios" element={<TypedProtectedRoute allowedTypes={['empresa']}><FuncionariosManagement /></TypedProtectedRoute>} />
          
          {/* Rotas de Dashboard e Exportação - Apenas para usuários tipo 'empresa' */}
          <Route path="/kpis" element={<TypedProtectedRoute allowedTypes={['empresa']}><DashboardKPIs /></TypedProtectedRoute>} />
          <Route path="/exportar" element={<TypedProtectedRoute allowedTypes={['empresa']}><ExportData /></TypedProtectedRoute>} />
          
          {/* Rotas de Pacotes - Apenas para usuários tipo 'empresa' */}
          <Route path="/pacotes" element={<TypedProtectedRoute allowedTypes={['empresa']}><DashboardPacotes /></TypedProtectedRoute>} />
          
          {/* Rotas de Rede/Franquia - Apenas para usuários tipo 'empresa' */}
          <Route path="/rede" element={<TypedProtectedRoute allowedTypes={['empresa']}><DashboardRede /></TypedProtectedRoute>} />
          
          {/* Rotas B2C (Clientes) - Apenas para usuários tipo 'cliente' */}
          <Route path="/cliente" element={<TypedProtectedRoute allowedTypes={['cliente']}><SelecaoEmpresa /></TypedProtectedRoute>} />
          <Route path="/cliente/empresa/:empresaId" element={<TypedProtectedRoute allowedTypes={['cliente']}><AgendamentoEmpresa /></TypedProtectedRoute>} />
          
          {/* Rotas de Funcionários - Apenas para usuários tipo 'funcionario' */}
          <Route path="/funcionario/agenda" element={<TypedProtectedRoute allowedTypes={['funcionario']}><FuncionarioAgenda /></TypedProtectedRoute>} />
          
          {/* Rota de fallback para rotas não encontradas */}
          <Route path="*" element={<AccessSelector />} />
      </Routes>
    </Router>
    </MySqlAuthProvider>
  );
}

export default App; 

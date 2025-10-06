import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MySqlAuthProvider } from './contexts/MySqlAuthContext';

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
  ServicosManagement,
  FuncionariosManagement,
  SelecaoEmpresa,
  AgendamentoEmpresa,
  FuncionarioAgenda
} from './modules';

// Debug components removidos para limpeza

function App() {
  return (
    <MySqlAuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <RedirectHandler />
        <Routes>
          {/* Página Principal */}
          <Route path="/" element={<AccessSelector />} />
          
          {/* Rotas B2B (Empresas) - Apenas para usuários tipo 'empresa' */}
          <Route path="/empresa/cadastro" element={<EmpresaCadastro />} />
          <Route path="/empresa/login" element={<EmpresaLogin />} />
          <Route path="/empresa/dashboard" element={<EmpresaDashboard />} />
          
          {/* Rotas de Gestão - Apenas para usuários tipo 'empresa' */}
          <Route path="/servicos" element={<TypedProtectedRoute allowedTypes={['empresa']}><ServicosManagement /></TypedProtectedRoute>} />
          <Route path="/funcionarios" element={<TypedProtectedRoute allowedTypes={['empresa']}><FuncionariosManagement /></TypedProtectedRoute>} />
          
          {/* Rotas de Dashboard e Exportação - Apenas para usuários tipo 'empresa' */}
          <Route path="/kpis" element={<TypedProtectedRoute allowedTypes={['empresa']}><DashboardKPIs /></TypedProtectedRoute>} />
          <Route path="/exportar" element={<TypedProtectedRoute allowedTypes={['empresa']}><ExportData /></TypedProtectedRoute>} />
          
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

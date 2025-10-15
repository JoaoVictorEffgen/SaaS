import React from 'react';
import { Link } from 'react-router-dom';
import { useMySqlAuth } from '../contexts/MySqlAuthContext';

const TestNavigation = () => {
  const { user } = useMySqlAuth();

  const navigationItems = [
    // Páginas públicas
    { path: '/', label: '🏠 Página Inicial', description: 'AccessSelector' },
    
    // Empresa
    { path: '/empresa/cadastro', label: '🏢 Cadastro Empresa', description: 'EmpresaCadastro' },
    { path: '/empresa/login', label: '🔐 Login Empresa', description: 'EmpresaLogin' },
    { path: '/empresa/dashboard', label: '📊 Dashboard Empresa', description: 'EmpresaDashboard' },
    { path: '/empresa/configuracoes', label: '⚙️ Configurações', description: 'ConfiguracoesEmpresa' },
    { path: '/servicos', label: '🔧 Serviços', description: 'ServicosManagement' },
    { path: '/funcionarios', label: '👥 Funcionários', description: 'FuncionariosManagement' },
    { path: '/kpis', label: '📈 KPIs', description: 'DashboardKPIs' },
    { path: '/exportar', label: '📤 Exportar', description: 'ExportData' },
    { path: '/pacotes', label: '📦 Pacotes', description: 'DashboardPacotes' },
    
    // Cliente
    { path: '/cliente', label: '👤 Seleção Empresa', description: 'SelecaoEmpresa' },
    { path: '/cliente/empresa/1', label: '📅 Agendamento (Empresa 1)', description: 'AgendamentoEmpresa' },
    { path: '/cliente/empresa/2', label: '📅 Agendamento (Empresa 2)', description: 'AgendamentoEmpresa' },
    
    // Funcionário
    { path: '/funcionario/agenda', label: '👨‍💼 Agenda Funcionário', description: 'FuncionarioAgenda' },
  ];

  return (
    <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800">🧪 Navegação de Teste</h3>
        <div className="text-xs text-gray-500">
          {user ? `Logado: ${user.tipo}` : 'Não logado'}
        </div>
      </div>
      
      <div className="space-y-2">
        {navigationItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="block p-2 text-xs bg-gray-50 hover:bg-blue-50 rounded border hover:border-blue-300 transition-colors"
          >
            <div className="font-medium text-gray-800">{item.label}</div>
            <div className="text-gray-500 text-xs">{item.description}</div>
            <div className="text-gray-400 text-xs font-mono">{item.path}</div>
          </Link>
        ))}
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          💡 <strong>Dica:</strong> Agora você pode acessar todas as telas para teste!
        </div>
      </div>
    </div>
  );
};

export default TestNavigation;

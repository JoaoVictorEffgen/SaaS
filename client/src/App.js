import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useParams } from 'react-router-dom';
import PublicAgenda from './pages/PublicAgenda';

// ===== COMPONENTES B2B (EMPRESAS) =====

// Página de Seleção de Acesso
const AccessSelector = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">AgendaPro</h1>
          <p className="text-gray-600">Sistema de Agendamento Online</p>
        </div>
        
        <div className="space-y-4">
          <Link
            to="/empresa/login"
            className="block w-full bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            🏢 Área da Empresa
          </Link>
          
          <Link
            to="/cliente"
            className="block w-full bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            👥 Agendar Serviço
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p><strong>Empresa:</strong> Gerencie suas agendas e clientes</p>
          <p><strong>Cliente:</strong> Agende serviços online</p>
        </div>
      </div>
    </div>
  );
};

// Cadastro de Empresa
const EmpresaCadastro = () => {
  const [formData, setFormData] = useState({
    razaoSocial: '',
    cnpj: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: '',
    plano: 'free'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.senha !== formData.confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }
    
    // Salvar empresa no localStorage
    const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
    const novaEmpresa = {
      id: Date.now().toString(),
      ...formData,
      tipo: 'empresa',
      data_criacao: new Date().toISOString(),
      status: 'ativo'
    };
    
    empresas.push(novaEmpresa);
    localStorage.setItem('empresas', JSON.stringify(empresas));
    
    alert('Empresa cadastrada com sucesso! Faça login para acessar o dashboard.');
    window.location.href = '/empresa/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏢 Cadastro de Empresa</h1>
          <p className="text-gray-600">Crie sua conta e comece a gerenciar agendamentos</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Razão Social *</label>
              <input
                type="text"
                value={formData.razaoSocial}
                onChange={(e) => setFormData({...formData, razaoSocial: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CNPJ/CPF *</label>
              <input
                type="text"
                value={formData.cnpj}
                onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Senha *</label>
                <input
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({...formData, senha: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Senha *</label>
                <input
                  type="password"
                  value={formData.confirmarSenha}
                  onChange={(e) => setFormData({...formData, confirmarSenha: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plano *</label>
              <select
                value={formData.plano}
                onChange={(e) => setFormData({...formData, plano: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="free">Free - Até 10 agendamentos/mês</option>
                <option value="pro">Pro - R$ 39,90/mês (ilimitado)</option>
                <option value="business">Business - R$ 99,90/mês (multiusuário)</option>
              </select>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                🏢 Criar Conta Empresarial
              </button>
              <Link
                to="/empresa/login"
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 transition-colors font-semibold text-center"
              >
                Já tenho conta
              </Link>
            </div>
          </form>
        </div>

        <div className="text-center mt-8">
          <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Voltar ao menu principal
          </Link>
        </div>
      </div>
    </div>
  );
};

// Login de Empresa
const EmpresaLogin = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    
    const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
    const empresa = empresas.find(emp => emp.email === email && emp.senha === senha);
    
    if (empresa) {
      localStorage.setItem('userType', 'empresa');
      localStorage.setItem('user', JSON.stringify(empresa));
      window.location.href = '/empresa/dashboard';
    } else {
      alert('Credenciais incorretas! Verifique email e senha.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-96">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">🏢 Login Empresarial</h1>
          <p className="text-gray-600 mt-2">Acesse seu dashboard</p>
        </div>
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="empresa@exemplo.com"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Senha:</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Sua senha"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Entrar na Empresa
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Não tem conta?
          </p>
          <Link to="/empresa/cadastro" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Cadastre sua empresa
          </Link>
        </div>
        
        <div className="mt-6 text-center">
          <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm">
            ← Voltar ao menu principal
          </Link>
        </div>
      </div>
    </div>
  );
};

// Dashboard da Empresa
const EmpresaDashboard = () => {
  const [user] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [agendas, setAgendas] = useState(() => {
    const saved = localStorage.getItem(`agendas_${user?.id}`) || '[]';
    return saved ? JSON.parse(saved) : [];
  });

  const [agendamentos, setAgendamentos] = useState(() => {
    const saved = localStorage.getItem(`agendamentos_${user?.id}`) || '[]';
    return saved ? JSON.parse(saved) : [];
  });

  const [showCreateAgenda, setShowCreateAgenda] = useState(false);
  const [showCreateAgendamento, setShowCreateAgendamento] = useState(false);

  // Verificar se é empresa
  if (!user || user.tipo !== 'empresa') {
    return <Navigate to="/empresa/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    window.location.href = '/';
  };

  const createAgenda = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const novaAgenda = {
      id: Date.now().toString(),
      empresa_id: user.id,
      titulo: formData.get('titulo'),
      data: formData.get('data'),
      hora_inicio: formData.get('hora_inicio'),
      hora_fim: formData.get('hora_fim'),
      duracao: parseInt(formData.get('duracao')),
      intervalo: parseInt(formData.get('intervalo')),
      status: 'disponivel'
    };
    
    const novasAgendas = [...agendas, novaAgenda];
    setAgendas(novasAgendas);
    localStorage.setItem(`agendas_${user.id}`, JSON.stringify(novasAgendas));
    setShowCreateAgenda(false);
    e.target.reset();
  };

  const deleteAgenda = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta agenda?')) {
      const novasAgendas = agendas.filter(agenda => agenda.id !== id);
      setAgendas(novasAgendas);
      localStorage.setItem(`agendas_${user.id}`, JSON.stringify(novasAgendas));
    }
  };

  const getAgendaPublicaUrl = () => {
    return `${window.location.origin}/agenda/${user.id}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🏢 Dashboard Empresarial</h1>
              <p className="text-gray-600">{user?.razaoSocial} - Plano: {user?.plano}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to={getAgendaPublicaUrl()}
                target="_blank"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                🌐 Ver Agenda Pública
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900">Total de Agendas</h3>
            <p className="text-3xl font-bold text-blue-600">{agendas.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900">Total de Agendamentos</h3>
            <p className="text-3xl font-bold text-green-600">{agendamentos.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900">Agendamentos Hoje</h3>
            <p className="text-3xl font-bold text-purple-600">
              {agendamentos.filter(a => a.data === new Date().toISOString().split('T')[0]).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900">Plano Atual</h3>
            <p className="text-2xl font-bold text-orange-600 capitalize">{user?.plano}</p>
          </div>
        </div>

        {/* Link da Agenda Pública */}
        <div className="bg-white rounded-lg shadow-sm border mb-8 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🔗 Sua Agenda Pública</h2>
          <p className="text-gray-600 mb-4">
            Compartilhe este link com seus clientes para que eles possam agendar diretamente:
          </p>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={getAgendaPublicaUrl()}
              readOnly
              className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(getAgendaPublicaUrl());
                alert('Link copiado para a área de transferência!');
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Copiar
            </button>
          </div>
          <p className="text-sm text-blue-600 mt-2">
            ✨ Os clientes podem agendar sem cadastro ou criar conta para benefícios!
          </p>
        </div>

        {/* Agendas Section */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">📅 Gerenciar Agendas</h2>
              <button
                onClick={() => setShowCreateAgenda(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Nova Agenda
              </button>
            </div>
          </div>
          <div className="p-6">
            {agendas.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhuma agenda criada ainda</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agendas.map(agenda => (
                  <div key={agenda.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900">{agenda.titulo}</h3>
                    <p className="text-sm text-gray-600">Data: {agenda.data}</p>
                    <p className="text-sm text-gray-600">Horário: {agenda.hora_inicio} - {agenda.hora_fim}</p>
                    <p className="text-sm text-gray-600">Duração: {agenda.duracao} min</p>
                    <p className="text-sm text-gray-600">Intervalo: {agenda.intervalo} min</p>
                    <div className="mt-3">
                      <button
                        onClick={() => deleteAgenda(agenda.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Agendamentos Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">📝 Agendamentos Recebidos</h2>
          </div>
          <div className="p-6">
            {agendamentos.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum agendamento recebido ainda</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agendamentos.map(agendamento => (
                  <div key={agendamento.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900">{agendamento.cliente_nome}</h3>
                    <p className="text-sm text-gray-600">Telefone: {agendamento.cliente_telefone}</p>
                    <p className="text-sm text-gray-600">Data: {agendamento.data}</p>
                    <p className="text-sm text-gray-600">Hora: {agendamento.hora}</p>
                    <p className="text-sm text-gray-600">Tipo: {agendamento.tipo}</p>
                    <p className="text-sm text-gray-600">Status: {agendamento.status}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Criar Agenda */}
      {showCreateAgenda && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Nova Agenda</h3>
            <form onSubmit={createAgenda}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Título:</label>
                <input
                  name="titulo"
                  type="text"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Data:</label>
                <input
                  name="data"
                  type="date"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Hora Início:</label>
                <input
                  name="hora_inicio"
                  type="time"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Hora Fim:</label>
                <input
                  name="hora_fim"
                  type="time"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Duração (min):</label>
                <input
                  name="duracao"
                  type="number"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Intervalo (min):</label>
                <input
                  name="intervalo"
                  type="number"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                >
                  Criar
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateAgenda(false)}
                  className="flex-1 bg-gray-300 text-gray-700 p-2 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== COMPONENTES B2C (CLIENTES FINAIS) =====

// Página de Seleção de Empresa
const SelecaoEmpresa = () => {
  const [empresas] = useState(() => {
    const saved = localStorage.getItem('empresas') || '[]';
    return JSON.parse(saved);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">👥 Agendar Serviço</h1>
          <p className="text-xl text-gray-600">Escolha a empresa e agende seu serviço</p>
        </div>

        {empresas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Nenhuma empresa cadastrada ainda.</p>
            <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
              ← Voltar ao menu principal
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {empresas.map(empresa => (
              <div key={empresa.id} className="bg-white rounded-2xl shadow-xl p-6 border">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-4">🏢</div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{empresa.razaoSocial}</h2>
                  <p className="text-gray-600 text-sm">Plano: {empresa.plano}</p>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    Agendamento online
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    Horários flexíveis
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    Confirmação automática
                  </div>
                </div>

                <Link
                  to={`/cliente/empresa/${empresa.id}`}
                  className="block w-full bg-green-600 text-white text-center py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Agendar com {empresa.razaoSocial}
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Voltar ao menu principal
          </Link>
        </div>
      </div>
    </div>
  );
};

// Página de Agendamento com Empresa
const AgendamentoEmpresa = () => {
  const { empresaId } = useParams();
  const [empresa, setEmpresa] = useState(null);
  const [agendas, setAgendas] = useState([]);
  const [selectedAgenda, setSelectedAgenda] = useState(null);
  const [showQuickBooking, setShowQuickBooking] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  
  const [quickBooking, setQuickBooking] = useState({
    nome: '',
    telefone: '',
    data: '',
    hora: ''
  });
  
  const [signupData, setSignupData] = useState({
    nome: '',
    telefone: '',
    senha: '',
    confirmarSenha: ''
  });

  useEffect(() => {
    // Buscar dados da empresa
    const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
    const empresaEncontrada = empresas.find(emp => emp.id === empresaId);
    setEmpresa(empresaEncontrada);

    // Buscar agendas da empresa
    const agendasEmpresa = JSON.parse(localStorage.getItem(`agendas_${empresaId}`) || '[]');
    setAgendas(agendasEmpresa);
  }, [empresaId]);

  const handleQuickBooking = (e) => {
    e.preventDefault();
    
    // Salvar agendamento rápido
    const agendamentos = JSON.parse(localStorage.getItem(`agendamentos_${empresaId}`) || '[]');
    const novoAgendamento = {
      id: Date.now().toString(),
      empresa_id: empresaId,
      ...quickBooking,
      tipo: 'rapido',
      status: 'pendente',
      data_criacao: new Date().toISOString()
    };
    
    agendamentos.push(novoAgendamento);
    localStorage.setItem(`agendamentos_${empresaId}`, JSON.stringify(agendamentos));
    
    alert('Agendamento realizado com sucesso! A empresa entrará em contato para confirmar.');
    setQuickBooking({ nome: '', telefone: '', data: '', hora: '' });
    setShowQuickBooking(false);
  };

  const handleSignup = (e) => {
    e.preventDefault();
    
    if (signupData.senha !== signupData.confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }
    
    // Salvar usuário cliente
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const novoUsuario = {
      id: Date.now().toString(),
      ...signupData,
      tipo: 'cliente',
      empresa_id: empresaId,
      data_criacao: new Date().toISOString()
    };
    
    usuarios.push(novoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    alert('Conta criada com sucesso! Agora você pode fazer seu agendamento premium.');
    setShowSignup(false);
    // Redirecionar para agendamento premium
  };

  if (!empresa) return <div>Empresa não encontrada</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏢 {empresa.razaoSocial}</h1>
          <p className="text-gray-600">Escolha como deseja agendar seu serviço</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Agendamento Rápido */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🚀</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Agendamento Rápido</h2>
              <p className="text-gray-600">Sem cadastro, em 30 segundos</p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-green-500 mr-2">✓</span>
                Sem necessidade de conta
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-green-500 mr-2">✓</span>
                Agendamento instantâneo
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-green-500 mr-2">✓</span>
                Ideal para primeira consulta
              </div>
            </div>

            <button
              onClick={() => setShowQuickBooking(true)}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              🚀 Agendar Agora
            </button>
          </div>

          {/* Agendamento Premium */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">👑</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Agendamento Premium</h2>
              <p className="text-gray-600">Com conta e benefícios exclusivos</p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-blue-500 mr-2">✓</span>
                Histórico de consultas
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-blue-500 mr-2">✓</span>
                Lembretes automáticos
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-blue-500 mr-2">✓</span>
                Cancelamentos online
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-blue-500 mr-2">✓</span>
                Benefícios futuros
              </div>
            </div>

            <button
              onClick={() => setShowSignup(true)}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              👑 Criar Conta e Agendar
            </button>
          </div>
        </div>

        {/* Modal Agendamento Rápido */}
        {showQuickBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">🚀 Agendamento Rápido</h3>
              <form onSubmit={handleQuickBooking}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Nome Completo *</label>
                  <input
                    type="text"
                    value={quickBooking.nome}
                    onChange={(e) => setQuickBooking({...quickBooking, nome: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Telefone *</label>
                  <input
                    type="tel"
                    value={quickBooking.telefone}
                    onChange={(e) => setQuickBooking({...quickBooking, telefone: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Data *</label>
                  <input
                    type="date"
                    value={quickBooking.data}
                    onChange={(e) => setQuickBooking({...quickBooking, data: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Hora *</label>
                  <input
                    type="time"
                    value={quickBooking.hora}
                    onChange={(e) => setQuickBooking({...quickBooking, hora: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white p-2 rounded hover:bg-green-700"
                  >
                    🚀 Agendar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuickBooking(false)}
                    className="flex-1 bg-gray-300 text-gray-700 p-2 rounded hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Cadastro Cliente */}
        {showSignup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">👑 Cadastro Premium</h3>
              <form onSubmit={handleSignup}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Nome Completo *</label>
                  <input
                    type="text"
                    value={signupData.nome}
                    onChange={(e) => setSignupData({...signupData, nome: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Telefone *</label>
                  <input
                    type="tel"
                    value={signupData.telefone}
                    onChange={(e) => setSignupData({...signupData, telefone: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Senha *</label>
                  <input
                    type="password"
                    value={signupData.senha}
                    onChange={(e) => setSignupData({...signupData, senha: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Confirmar Senha *</label>
                  <input
                    type="password"
                    value={signupData.confirmarSenha}
                    onChange={(e) => setSignupData({...signupData, confirmarSenha: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                  >
                    👑 Criar Conta
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSignup(false)}
                    className="flex-1 bg-gray-300 text-gray-700 p-2 rounded hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <Link to="/cliente" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Voltar à seleção de empresas
          </Link>
        </div>
      </div>
    </div>
  );
};

// ===== APP PRINCIPAL =====

function App() {
  return (
    <Router>
      <Routes>
        {/* Página Principal - Seleção de Acesso */}
        <Route path="/" element={<AccessSelector />} />
        
        {/* Rotas B2B (Empresas) */}
        <Route path="/empresa/cadastro" element={<EmpresaCadastro />} />
        <Route path="/empresa/login" element={<EmpresaLogin />} />
        <Route path="/empresa/dashboard" element={<EmpresaDashboard />} />
        
        {/* Rotas B2C (Clientes Finais) */}
        <Route path="/cliente" element={<SelecaoEmpresa />} />
        <Route path="/cliente/empresa/:empresaId" element={<AgendamentoEmpresa />} />
      </Routes>
    </Router>
  );
}

export default App; 
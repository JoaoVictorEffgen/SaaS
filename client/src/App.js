import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PublicAgenda from './pages/PublicAgenda';

// Componente de Login Simples
const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'admin@teste.com' && senha === '123456') {
      localStorage.setItem('user', JSON.stringify({ nome: 'Admin', email }));
      window.location.href = '/dashboard';
    } else {
      alert('Credenciais incorretas! Use: admin@teste.com / 123456');
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold text-center mb-6">Login AgendaPro</h1>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="admin@teste.com"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Senha:</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="123456"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Entrar
          </button>
        </form>
        <p className="text-center mt-4 text-sm text-gray-600">
          Use: admin@teste.com / 123456
        </p>
      </div>
    </div>
  );
};

// Componente de Dashboard Completo
const Dashboard = () => {
  const [user] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [agendas, setAgendas] = useState(() => {
    const saved = localStorage.getItem('agendas');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        titulo: 'Consulta de Psicologia',
        data: '2024-01-15',
        hora_inicio: '09:00',
        hora_fim: '17:00',
        duracao: 45,
        status: 'disponivel'
      }
    ];
  });

  const [agendamentos, setAgendamentos] = useState(() => {
    const saved = localStorage.getItem('agendamentos');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        agenda_id: '1',
        cliente_nome: 'Maria Santos',
        cliente_email: 'maria@email.com',
        data: '2024-01-15',
        hora_inicio: '09:00',
        status: 'confirmado'
      }
    ];
  });

  const [showCreateAgenda, setShowCreateAgenda] = useState(false);
  const [showCreateAgendamento, setShowCreateAgendamento] = useState(false);
  const [newAgenda, setNewAgenda] = useState({
    titulo: '',
    data: '',
    hora_inicio: '',
    hora_fim: '',
    duracao: 60
  });
  const [newAgendamento, setNewAgendamento] = useState({
    agenda_id: '',
    cliente_nome: '',
    cliente_email: '',
    data: '',
    hora_inicio: ''
  });

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const saveAgendas = (newAgendas) => {
    setAgendas(newAgendas);
    localStorage.setItem('agendas', JSON.stringify(newAgendas));
  };

  const saveAgendamentos = (newAgendamentos) => {
    setAgendamentos(newAgendamentos);
    localStorage.setItem('agendamentos', JSON.stringify(newAgendamentos));
  };

  const createAgenda = () => {
    if (!newAgenda.titulo || !newAgenda.data || !newAgenda.hora_inicio || !newAgenda.hora_fim) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    const agenda = {
      ...newAgenda,
      id: Date.now().toString(),
      status: 'disponivel'
    };

    const updatedAgendas = [...agendas, agenda];
    saveAgendas(updatedAgendas);
    setNewAgenda({ titulo: '', data: '', hora_inicio: '', hora_fim: '', duracao: 60 });
    setShowCreateAgenda(false);
  };

  const createAgendamento = () => {
    if (!newAgendamento.agenda_id || !newAgendamento.cliente_nome || !newAgendamento.cliente_email || !newAgendamento.data || !newAgendamento.hora_inicio) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    const agendamento = {
      ...newAgendamento,
      id: Date.now().toString(),
      status: 'pendente'
    };

    const updatedAgendamentos = [...agendamentos, agendamento];
    saveAgendamentos(updatedAgendamentos);
    setNewAgendamento({ agenda_id: '', cliente_nome: '', cliente_email: '', data: '', hora_inicio: '' });
    setShowCreateAgendamento(false);
  };

  const deleteAgenda = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta agenda?')) {
      const updatedAgendas = agendas.filter(agenda => agenda.id !== id);
      saveAgendas(updatedAgendas);
    }
  };

  const deleteAgendamento = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      const updatedAgendamentos = agendamentos.filter(agendamento => agendamento.id !== id);
      saveAgendamentos(updatedAgendamentos);
    }
  };

  if (!user) {
    return <div>Não autorizado</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">AgendaPro Dashboard</h1>
          <div className="flex items-center gap-4">
            <span>Olá, {user.nome}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Sair
            </button>
          </div>
        </div>
      </header>
      
      <main className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Agendas</p>
                <p className="text-2xl font-semibold text-gray-900">{agendas.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Agendamentos</p>
                <p className="text-2xl font-semibold text-gray-900">{agendamentos.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Plano</p>
                <p className="text-2xl font-semibold text-gray-900">Free</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className="text-2xl font-semibold text-green-600">Ativo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Agendas */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Minhas Agendas</h2>
                <button 
                  onClick={() => setShowCreateAgenda(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  + Nova Agenda
                </button>
              </div>
            </div>
            <div className="p-6">
              {agendas.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhuma agenda criada ainda</p>
              ) : (
                <div className="space-y-4">
                  {agendas.map((agenda) => (
                    <div key={agenda.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{agenda.titulo}</h3>
                          <p className="text-sm text-gray-600">
                            {agenda.data} • {agenda.hora_inicio} - {agenda.hora_fim}
                          </p>
                          <p className="text-sm text-gray-600">
                            Duração: {agenda.duracao} min
                          </p>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            agenda.status === 'disponivel' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {agenda.status}
                          </span>
                        </div>
                        <button 
                          onClick={() => deleteAgenda(agenda.id)}
                          className="text-red-600 hover:text-red-800"
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

          {/* Agendamentos */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Agendamentos</h2>
                <button 
                  onClick={() => setShowCreateAgendamento(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  + Novo Agendamento
                </button>
              </div>
            </div>
            <div className="p-6">
              {agendamentos.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum agendamento ainda</p>
              ) : (
                <div className="space-y-4">
                  {agendamentos.map((agendamento) => (
                    <div key={agendamento.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{agendamento.cliente_nome}</h3>
                          <p className="text-sm text-gray-600">{agendamento.cliente_email}</p>
                          <p className="text-sm text-gray-600">
                            {agendamento.data} • {agendamento.hora_inicio}
                          </p>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            agendamento.status === 'confirmado' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {agendamento.status}
                          </span>
                        </div>
                        <button 
                          onClick={() => deleteAgendamento(agendamento.id)}
                          className="text-red-600 hover:text-red-800"
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
        </div>

        {/* Subscription Info */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Informações do Plano</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900">WhatsApp</h3>
                <p className="text-sm text-gray-600">Não incluído</p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900">Relatórios</h3>
                <p className="text-sm text-gray-600">Não incluído</p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                  <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900">Multi-usuário</h3>
                <p className="text-sm text-gray-600">Não incluído</p>
              </div>
            </div>
            
            {/* Link para Agenda Pública */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-medium text-blue-900 mb-2">🔗 Sua Agenda Pública</h3>
              <p className="text-blue-700 mb-3">
                Compartilhe este link com seus clientes para que eles possam agendar diretamente:
              </p>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={`${window.location.origin}/agenda/${user?.id || 'admin'}`}
                  readOnly
                  className="flex-1 p-2 border border-blue-300 rounded bg-white text-blue-800"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/agenda/${user?.id || 'admin'}`);
                    alert('Link copiado para a área de transferência!');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Copiar
                </button>
              </div>
              <p className="text-sm text-blue-600 mt-2">
                ✨ Os clientes podem agendar sem cadastro ou criar conta para benefícios premium!
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Criar Agenda */}
      {showCreateAgenda && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Nova Agenda</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                <input
                  type="text"
                  value={newAgenda.titulo}
                  onChange={(e) => setNewAgenda({...newAgenda, titulo: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="Ex: Consulta de Psicologia"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                <input
                  type="date"
                  value={newAgenda.data}
                  onChange={(e) => setNewAgenda({...newAgenda, data: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hora Início</label>
                  <input
                    type="time"
                    value={newAgenda.hora_inicio}
                    onChange={(e) => setNewAgenda({...newAgenda, hora_inicio: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hora Fim</label>
                  <input
                    type="time"
                    value={newAgenda.hora_fim}
                    onChange={(e) => setNewAgenda({...newAgenda, hora_fim: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duração (minutos)</label>
                <input
                  type="number"
                  value={newAgenda.duracao}
                  onChange={(e) => setNewAgenda({...newAgenda, duracao: parseInt(e.target.value)})}
                  className="w-full p-2 border rounded"
                  min="15"
                  step="15"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateAgenda(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={createAgenda}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Criar Agendamento */}
      {showCreateAgendamento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Novo Agendamento</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Agenda</label>
                <select
                  value={newAgendamento.agenda_id}
                  onChange={(e) => setNewAgendamento({...newAgendamento, agenda_id: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Selecione uma agenda</option>
                  {agendas.map(agenda => (
                    <option key={agenda.id} value={agenda.id}>
                      {agenda.titulo} - {agenda.data}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Cliente</label>
                <input
                  type="text"
                  value={newAgendamento.cliente_nome}
                  onChange={(e) => setNewAgendamento({...newAgendamento, cliente_nome: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email do Cliente</label>
                <input
                  type="email"
                  value={newAgendamento.cliente_email}
                  onChange={(e) => setNewAgendamento({...newAgendamento, cliente_email: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                  <input
                    type="date"
                    value={newAgendamento.data}
                    onChange={(e) => setNewAgendamento({...newAgendamento, data: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hora</label>
                  <input
                    type="time"
                    value={newAgendamento.hora_inicio}
                    onChange={(e) => setNewAgendamento({...newAgendamento, hora_inicio: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateAgendamento(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={createAgendamento}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente Home
const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">AgendaPro</h1>
            <div className="space-x-4">
              <Link to="/login" className="text-blue-600 hover:text-blue-800">
                Entrar
              </Link>
              <Link 
                to="/login" 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Começar
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Sistema de Agendamento Online
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Sistema funcionando 100% local! Teste o login com: admin@teste.com / 123456
        </p>
        <Link 
          to="/login"
          className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 inline-block"
        >
          Testar Sistema
        </Link>
      </main>
    </div>
  );
};

// App Principal
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/agenda/:userId" element={<PublicAgenda />} />
      </Routes>
    </Router>
  );
}

export default App; 
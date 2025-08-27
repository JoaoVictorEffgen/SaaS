import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const PublicAgenda = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [agendas, setAgendas] = useState([]);
  const [selectedAgenda, setSelectedAgenda] = useState(null);
  const [showQuickBooking, setShowQuickBooking] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [quickBooking, setQuickBooking] = useState({
    nome: '',
    email: '',
    telefone: '',
    data: '',
    hora: ''
  });
  
  const [signupData, setSignupData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });

  // Função para validar data não retroativa
  const validateFutureDate = (date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setErrors(prev => ({
        ...prev,
        data: 'Data não pode ser no passado'
      }));
      return false;
    }
    
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.data;
      return newErrors;
    });
    return true;
  };

  useEffect(() => {
    // Simular busca de dados do usuário e agendas
    const mockUser = {
      id: userId,
      nome: 'Dr. João Silva',
      empresa: 'Consultoria Silva',
      especialidade: 'Psicologia'
    };
    setUser(mockUser);
    
    const mockAgendas = [
      {
        id: '1',
        titulo: 'Consulta de Psicologia',
        data: '2024-01-15',
        hora_inicio: '09:00',
        hora_fim: '17:00',
        duracao: 45,
        horarios_disponiveis: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
      }
    ];
    setAgendas(mockAgendas);
  }, [userId]);

  const handleQuickBooking = (e) => {
    e.preventDefault();
    
    // Validar data
    if (quickBooking.data && !validateFutureDate(quickBooking.data)) {
      return;
    }
    
    if (!quickBooking.nome || !quickBooking.email || !quickBooking.data || !quickBooking.hora) {
      alert('Preencha todos os campos!');
      return;
    }
    
    // Salvar agendamento rápido
    const agendamento = {
      id: Date.now().toString(),
      agenda_id: selectedAgenda.id,
      cliente_nome: quickBooking.nome,
      cliente_email: quickBooking.email,
      data: quickBooking.data,
      hora_inicio: quickBooking.hora,
      status: 'pendente',
      tipo: 'rapido'
    };
    
    const existing = JSON.parse(localStorage.getItem('agendamentos') || '[]');
    existing.push(agendamento);
    localStorage.setItem('agendamentos', JSON.stringify(existing));
    
    alert('Agendamento realizado com sucesso! Você receberá uma confirmação por email.');
    setShowQuickBooking(false);
    setQuickBooking({ nome: '', email: '', data: '', hora: '' });
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (signupData.senha !== signupData.confirmarSenha) {
      alert('Senhas não coincidem!');
      return;
    }
    
    // Criar usuário e agendamento
    const newUser = {
      id: Date.now().toString(),
      nome: signupData.nome,
      email: signupData.email,
      senha: signupData.senha,
      plano: 'free'
    };
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    const agendamento = {
      id: Date.now().toString(),
      agenda_id: selectedAgenda.id,
      usuario_id: newUser.id,
      cliente_nome: signupData.nome,
      cliente_email: signupData.email,
      data: quickBooking.data,
      hora_inicio: quickBooking.hora,
      status: 'pendente',
      tipo: 'com_cadastro'
    };
    
    const existing = JSON.parse(localStorage.getItem('agendamentos') || '[]');
    existing.push(agendamento);
    localStorage.setItem('agendamentos', JSON.stringify(existing));
    
    alert('Conta criada e agendamento realizado! Você tem acesso a funcionalidades premium!');
    setShowSignup(false);
    setShowQuickBooking(false);
  };

  if (!user) return <div>Carregando...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">{user.nome}</h1>
            <p className="text-lg text-gray-600 mt-2">{user.empresa}</p>
            <p className="text-blue-600 font-medium">{user.especialidade}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Seleção de Agenda */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Escolha sua agenda</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {agendas.map((agenda) => (
              <div 
                key={agenda.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedAgenda?.id === agenda.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setSelectedAgenda(agenda)}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{agenda.titulo}</h3>
                <p className="text-gray-600 mb-2">{agenda.data}</p>
                <p className="text-gray-600 mb-3">{agenda.hora_inicio} - {agenda.hora_fim}</p>
                <p className="text-sm text-gray-500">Duração: {agenda.duracao} min</p>
                
                {selectedAgenda?.id === agenda.id && (
                  <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                    <p className="text-blue-800 font-medium">✓ Agenda selecionada</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Opções de Agendamento */}
        {selectedAgenda && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Como deseja agendar?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Agendamento Rápido */}
              <div className="border-2 border-green-200 rounded-lg p-6 text-center hover:border-green-300 transition-all">
                <div className="text-green-600 mb-4">
                  <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Agendamento Rápido</h3>
                <p className="text-gray-600 mb-4">Agende em 30 segundos sem criar conta</p>
                <ul className="text-sm text-gray-600 mb-6 text-left space-y-2">
                  <li>✓ Sem cadastro obrigatório</li>
                  <li>✓ Confirmação por email</li>
                  <li>✓ Ideal para primeira consulta</li>
                </ul>
                <button
                  onClick={() => setShowQuickBooking(true)}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Agendar Rápido
                </button>
              </div>

              {/* Agendamento com Conta */}
              <div className="border-2 border-blue-200 rounded-lg p-6 text-center hover:border-blue-300 transition-all">
                <div className="text-blue-600 mb-4">
                  <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Criar Conta</h3>
                <p className="text-gray-600 mb-4">Acesso a funcionalidades premium</p>
                <ul className="text-sm text-gray-600 mb-6 text-left space-y-2">
                  <li>🎁 Histórico de consultas</li>
                  <li>🎁 Lembretes automáticos</li>
                  <li>🎁 Cancelamentos online</li>
                  <li>🎁 Preferências salvas</li>
                </ul>
                <button
                  onClick={() => setShowSignup(true)}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Criar Conta + Agendar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Agendamento Rápido */}
        {showQuickBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Agendamento Rápido</h3>
              <form onSubmit={handleQuickBooking}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome completo</label>
                    <input
                      type="text"
                      value={quickBooking.nome}
                      onChange={(e) => setQuickBooking({...quickBooking, nome: e.target.value})}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={quickBooking.email}
                      onChange={(e) => setQuickBooking({...quickBooking, email: e.target.value})}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefone (opcional)</label>
                    <input
                      type="tel"
                      value={quickBooking.telefone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, '');
                        setQuickBooking({...quickBooking, telefone: value});
                      }}
                      className="w-full p-2 border rounded"
                      placeholder="Apenas números (11987654321)"
                      maxLength="11"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                      <input
                        type="date"
                        value={quickBooking.data}
                        onChange={(e) => {
                          setQuickBooking({...quickBooking, data: e.target.value});
                          if (e.target.value) {
                            validateFutureDate(e.target.value);
                          }
                        }}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full p-2 border rounded ${errors.data ? 'border-red-500' : ''}`}
                        required
                      />
                                             {errors.data && <p className="text-red-500 text-xs mt-1">{errors.data}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hora</label>
                      <select
                        value={quickBooking.hora}
                        onChange={(e) => setQuickBooking({...quickBooking, hora: e.target.value})}
                        className="w-full p-2 border rounded"
                        required
                      >
                        <option value="">Selecione</option>
                        {selectedAgenda?.horarios_disponiveis.map(hora => (
                          <option key={hora} value={hora}>{hora}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowQuickBooking(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                  >
                    Confirmar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Criar Conta */}
        {showSignup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Criar Conta + Agendar</h3>
              <form onSubmit={handleSignup}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome completo</label>
                    <input
                      type="text"
                      value={signupData.nome}
                      onChange={(e) => setSignupData({...signupData, nome: e.target.value})}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                    <input
                      type="password"
                      value={signupData.senha}
                      onChange={(e) => setSignupData({...signupData, senha: e.target.value})}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar senha</label>
                    <input
                      type="password"
                      value={signupData.confirmarSenha}
                      onChange={(e) => setSignupData({...signupData, confirmarSenha: e.target.value})}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowSignup(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Criar Conta
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicAgenda; 
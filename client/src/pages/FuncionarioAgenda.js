import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, Phone, Mail, 
  ArrowLeft, LogOut, Search, ChevronLeft, 
  ChevronRight, CheckCircle, XCircle, AlertCircle,
  Building2, ClipboardList
} from 'lucide-react';
import localStorageService from '../services/localStorageService';
import { formatDate, formatTime } from '../utils/formatters';

const FuncionarioAgenda = () => {
  const navigate = useNavigate();
  const [funcionario, setFuncionario] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [agendamentos, setAgendamentos] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'agendado', 'confirmado', 'cancelado', 'realizado'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Carregar dados do funcionário logado
    const funcionarioData = localStorage.getItem('funcionarioLogado');
    const empresaData = localStorage.getItem('empresaFuncionario');
    
    if (!funcionarioData || !empresaData) {
      // Se não há dados, redirecionar para tela inicial
      navigate('/');
      return;
    }

    const funcionarioObj = JSON.parse(funcionarioData);
    const empresaObj = JSON.parse(empresaData);
    
    setFuncionario(funcionarioObj);
    setEmpresa(empresaObj);
    
    // Carregar agendamentos do funcionário
    const allAgendamentos = localStorageService.getAgendamentos();
    const funcionarioAgendamentos = allAgendamentos.filter(agendamento => 
      agendamento.empresaId === funcionarioObj.empresaId && 
      agendamento.funcionarioId === funcionarioObj.id
    );
    
    setAgendamentos(funcionarioAgendamentos);
  }, [navigate]);


  const handleLogout = () => {
    localStorage.removeItem('funcionarioLogado');
    localStorage.removeItem('empresaFuncionario');
    navigate('/');
  };

  const getAgendamentosDoDia = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return agendamentos.filter(agendamento => 
      agendamento.dataAgendamento === dateStr
    );
  };

  const getAgendamentosFiltrados = () => {
    let filtered = agendamentos;
    
    // Filtrar por status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(agendamento => agendamento.status === filterStatus);
    }
    
    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(agendamento =>
        agendamento.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agendamento.servico.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Ordenar por data e hora
    return filtered.sort((a, b) => {
      const dateA = new Date(`${a.dataAgendamento}T${a.horaAgendamento}`);
      const dateB = new Date(`${b.dataAgendamento}T${b.horaAgendamento}`);
      return dateA - dateB;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'agendado': return 'bg-blue-100 text-blue-800';
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      case 'realizado': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'agendado': return <Clock className="w-4 h-4" />;
      case 'confirmado': return <CheckCircle className="w-4 h-4" />;
      case 'cancelado': return <XCircle className="w-4 h-4" />;
      case 'realizado': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Redirecionar se não estiver logado
  if (!funcionario || !empresa) {
    return <Navigate to="/" replace />;
  }

  const agendamentosFiltrados = getAgendamentosFiltrados();
  const agendamentosDoDia = getAgendamentosDoDia(selectedDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-600/5 via-transparent to-blue-600/5"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-tr from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Minha Agenda</h1>
                  <p className="text-sm text-gray-600">{funcionario.nome} - {empresa.nome}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={navigateToToday}
                  className="flex items-center px-4 py-2 bg-cyan-50 text-cyan-600 rounded-xl hover:bg-cyan-100 transition-all duration-200 font-semibold"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Hoje
                </button>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-xl hover:bg-gray-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendário */}
            <div className="lg:col-span-2">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                {/* Header do Calendário */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => navigateMonth(-1)}
                      className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-900">
                      {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button
                      onClick={() => navigateMonth(1)}
                      className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  <button
                    onClick={() => navigate('/')}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Voltar ao Início
                  </button>
                </div>

                {/* Grid do Calendário */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-semibold text-gray-600">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }, (_, i) => {
                    const date = new Date(currentDate);
                    date.setDate(1);
                    date.setDate(date.getDate() - date.getDay() + i);
                    
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isSelected = date.toDateString() === selectedDate.toDateString();
                    const dayAgendamentos = getAgendamentosDoDia(date);
                    
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(date)}
                        className={`
                          p-2 h-16 rounded-xl transition-all duration-200 text-sm font-medium
                          ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                          ${isToday ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' : ''}
                          ${isSelected && !isToday ? 'bg-cyan-100 text-cyan-800' : ''}
                          ${!isSelected && !isToday && isCurrentMonth ? 'hover:bg-gray-100' : ''}
                        `}
                      >
                        <div className="flex flex-col items-center">
                          <span>{date.getDate()}</span>
                          {dayAgendamentos.length > 0 && (
                            <div className="flex space-x-1 mt-1">
                              {dayAgendamentos.slice(0, 3).map((_, idx) => (
                                <div
                                  key={idx}
                                  className={`w-1 h-1 rounded-full ${
                                    isToday ? 'bg-white' : 'bg-cyan-500'
                                  }`}
                                />
                              ))}
                              {dayAgendamentos.length > 3 && (
                                <span className={`text-xs ${isToday ? 'text-white' : 'text-cyan-600'}`}>
                                  +{dayAgendamentos.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Painel Lateral */}
            <div className="space-y-6">
              {/* Filtros e Busca */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Filtros</h3>
                
                {/* Busca */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por cliente ou serviço..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
                  />
                </div>

                {/* Filtros de Status */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Status:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'all', label: 'Todos', color: 'bg-gray-100 text-gray-800' },
                      { key: 'agendado', label: 'Agendado', color: 'bg-blue-100 text-blue-800' },
                      { key: 'confirmado', label: 'Confirmado', color: 'bg-green-100 text-green-800' },
                      { key: 'cancelado', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
                      { key: 'realizado', label: 'Realizado', color: 'bg-purple-100 text-purple-800' }
                    ].map(status => (
                      <button
                        key={status.key}
                        onClick={() => setFilterStatus(status.key)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                          filterStatus === status.key
                            ? status.color + ' ring-2 ring-cyan-500'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Agendamentos do Dia */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {selectedDate.toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </h3>
                
                {agendamentosDoDia.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum agendamento para este dia</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {agendamentosDoDia.map((agendamento, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(agendamento.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(agendamento.status)}`}>
                              {agendamento.status}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {formatTime(agendamento.horaAgendamento)}
                          </span>
                        </div>
                        
                        <h4 className="font-semibold text-gray-900 mb-1">{agendamento.clienteNome}</h4>
                        <p className="text-sm text-gray-600 mb-2">{agendamento.servico}</p>
                        
                        {agendamento.observacoes && (
                          <p className="text-xs text-gray-500 italic">
                            "{agendamento.observacoes}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lista de Todos os Agendamentos */}
          <div className="mt-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Todos os Agendamentos</h3>
            
            {agendamentosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Nenhum agendamento encontrado</h4>
                <p className="text-gray-600">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Tente ajustar os filtros ou termo de busca.'
                    : 'Você ainda não possui agendamentos.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {agendamentosFiltrados.map((agendamento, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(agendamento.status)}
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(agendamento.status)}`}>
                          {agendamento.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatDate(agendamento.dataAgendamento)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatTime(agendamento.horaAgendamento)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">{agendamento.clienteNome}</h4>
                        <p className="text-gray-600 mb-2">{agendamento.servico}</p>
                        {agendamento.observacoes && (
                          <p className="text-sm text-gray-500 italic">
                            "{agendamento.observacoes}"
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {agendamento.clienteTelefone || 'Não informado'}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          {agendamento.clienteEmail || 'Não informado'}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Building2 className="w-4 h-4 mr-2" />
                          {empresa.nome}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuncionarioAgenda;

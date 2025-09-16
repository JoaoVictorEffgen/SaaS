import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import EmpresaCard from '../shared/EmpresaCard';
import { 
  LogOut, Star, Crown, Award, Search, Clock, 
  Calendar, CheckCircle, XCircle, Filter,
  Building2, Home
} from 'lucide-react';
import { useLocalAuth } from '../../contexts/LocalAuthContext';
import localStorageService from '../../services/localStorageService';
import { formatDate, formatTime } from '../../utils/formatters';

const SelecaoEmpresa = () => {
  const { user, logout } = useLocalAuth();
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState([]);
  const [empresasDestaque, setEmpresasDestaque] = useState([]);
  const [empresasNormais, setEmpresasNormais] = useState([]);
  
  // Estados para pesquisa e filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmpresas, setFilteredEmpresas] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('all'); // 'all', 'agendados', 'cancelados'
  const [clienteHistory, setClienteHistory] = useState([]);

  // Carregar histórico do cliente
  const loadClienteHistory = () => {
    if (user && user.id) {
      const agendamentos = localStorageService.getAgendamentosByUser(user.id);
      
      // Criar histórico com ações (agendamento/cancelamento)
      const history = agendamentos
        .map(agendamento => ({
          ...agendamento,
          tipo: agendamento.status === 'cancelado' ? 'cancelado' : 'agendado',
          dataAcao: agendamento.status === 'cancelado' ? agendamento.dataCancelamento : agendamento.dataAgendamento,
          empresaNome: empresas.find(e => e.id === agendamento.empresaId)?.nome || 'Empresa não encontrada'
        }))
        .sort((a, b) => new Date(b.dataAcao) - new Date(a.dataAcao))
        .slice(0, 15); // Últimas 15 ações
      
      setClienteHistory(history);
    }
  };

  // Função de pesquisa
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      setFilteredEmpresas([]);
    } else {
      const filtered = empresas.filter(empresa =>
        empresa.nome.toLowerCase().includes(term.toLowerCase()) ||
        empresa.especializacao.toLowerCase().includes(term.toLowerCase()) ||
        (empresa.descricao_servico && empresa.descricao_servico.toLowerCase().includes(term.toLowerCase()))
      );
      setFilteredEmpresas(filtered);
    }
  };

  useEffect(() => {
    // Carregar empresas usando o serviço
    const empresasData = localStorageService.getEmpresas();
    
    // Ordenar por nota média (maior para menor) e depois por total de avaliações
    const empresasOrdenadas = empresasData.sort((a, b) => {
      const notaA = a.notaMedia || 0;
      const notaB = b.notaMedia || 0;
      const avaliacoesA = a.totalAvaliacoes || 0;
      const avaliacoesB = b.totalAvaliacoes || 0;
      
      // Primeiro critério: nota média
      if (notaA !== notaB) {
        return notaB - notaA;
      }
      // Segundo critério: total de avaliações (mais avaliações = mais confiável)
      return avaliacoesB - avaliacoesA;
    });
    
    setEmpresas(empresasOrdenadas);
    
    // Separar empresas em destaque (nota >= 4.5 e pelo menos 10 avaliações)
    const destaque = empresasOrdenadas.filter(empresa => 
      (empresa.notaMedia || 0) >= 4.5 && (empresa.totalAvaliacoes || 0) >= 10
    );
    
    // Separar empresas normais
    const normais = empresasOrdenadas.filter(empresa => 
      (empresa.notaMedia || 0) < 4.5 || (empresa.totalAvaliacoes || 0) < 10
    );
    
    setEmpresasDestaque(destaque);
    setEmpresasNormais(normais);
    
    // Carregar histórico do cliente
    loadClienteHistory();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = () => {
    // Limpar todos os dados do cliente
    localStorage.removeItem('clienteLogado');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    
    // Executar logout do contexto
    logout();
    
    // Navegar para tela inicial
    navigate('/', { replace: true });
  };

  // Redirecionar se não estiver logado
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Filtrar histórico baseado no filtro selecionado
  const filteredHistory = clienteHistory.filter(item => {
    if (historyFilter === 'all') return true;
    return item.tipo === historyFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-tr from-green-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10">
        {/* Header Moderno */}
        <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Olá, {user.nome}!</h1>
                  <p className="text-sm text-gray-600">Escolha uma empresa para agendar seus serviços</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all duration-200 font-semibold"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  HISTÓRICO
                </button>
                
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center px-4 py-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all duration-200 font-semibold"
                  title="Voltar à Página Inicial"
                >
                  <Home className="h-4 w-4 mr-2" />
                  INÍCIO
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
          {/* Título Principal */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Empresas Disponíveis</h2>
            <p className="text-lg text-gray-600">Selecione uma empresa para agendar seus serviços</p>
          </div>

          {/* Barra de Pesquisa */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Pesquisar por nome, especialização ou serviços..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/90 backdrop-blur-sm shadow-lg text-lg"
              />
              {searchTerm && (
                <button
                  onClick={() => handleSearch('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Modal de Histórico */}
          {showHistory && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                {/* Header do Modal */}
                <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-3xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Histórico de Agendamentos</h2>
                        <p className="text-blue-100 text-sm">Suas últimas 15 ações</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowHistory(false)}
                      className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Filtros */}
                <div className="p-6 border-b">
                  <div className="flex items-center space-x-4">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-700">Filtrar por:</span>
                    <div className="flex space-x-2">
                      {[
                        { key: 'all', label: 'Todos', icon: Calendar },
                        { key: 'agendados', label: 'Agendados', icon: CheckCircle },
                        { key: 'cancelados', label: 'Cancelados', icon: XCircle }
                      ].map(filter => (
                        <button
                          key={filter.key}
                          onClick={() => setHistoryFilter(filter.key)}
                          className={`flex items-center px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                            historyFilter === filter.key
                              ? 'bg-blue-500 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <filter.icon className="w-4 h-4 mr-2" />
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Lista de Histórico */}
                <div className="p-6">
                  {filteredHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum histórico encontrado</h3>
                      <p className="text-gray-600">
                        {historyFilter === 'all' 
                          ? 'Você ainda não possui agendamentos.'
                          : `Nenhum agendamento ${historyFilter === 'agendados' ? 'realizado' : 'cancelado'} encontrado.`
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredHistory.map((item, index) => (
                        <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                item.tipo === 'agendado' 
                                  ? 'bg-green-100 text-green-600' 
                                  : 'bg-red-100 text-red-600'
                              }`}>
                                {item.tipo === 'agendado' ? (
                                  <CheckCircle className="w-6 h-6" />
                                ) : (
                                  <XCircle className="w-6 h-6" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{item.empresaNome}</h4>
                                <p className="text-sm text-gray-600">{item.servico}</p>
                                <div className="flex items-center space-x-4 mt-1">
                                  <span className="text-xs text-gray-500">
                                    📅 {formatDate(item.dataAgendamento)}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    🕐 {formatTime(item.horaAgendamento)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                item.tipo === 'agendado'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {item.tipo === 'agendado' ? 'Agendado' : 'Cancelado'}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDate(item.dataAcao)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Conteúdo Principal */}
          {empresas.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                <Building2 className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma empresa cadastrada</h3>
              <p className="text-gray-600 mb-6">
                Ainda não há empresas disponíveis para agendamento.
              </p>
              <Link
                to="/empresa/cadastro"
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
              >
                Cadastrar Empresa
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Resultados da Pesquisa */}
              {searchTerm && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Search className="h-6 w-6 text-blue-500" />
                    <h3 className="text-2xl font-bold text-gray-900">Resultados da Pesquisa</h3>
                    <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      <span>{filteredEmpresas.length} encontrada(s)</span>
                    </div>
                  </div>
                  {filteredEmpresas.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredEmpresas.map((empresa) => (
                        <EmpresaCard 
                          key={empresa.id} 
                          empresa={empresa} 
                          onSelect={(empresa) => {
                            window.location.href = `/cliente/empresa/${empresa.id}`;
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Nenhum resultado encontrado</h4>
                      <p className="text-gray-600">Tente pesquisar por outros termos.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Seção de Empresas em Destaque */}
              {!searchTerm && empresasDestaque.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center gap-2">
                      <Crown className="h-6 w-6 text-yellow-500" />
                      <h3 className="text-2xl font-bold text-gray-900">Empresas em Destaque</h3>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      <Star className="h-4 w-4 fill-current" />
                      <span>Melhor Avaliadas</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {empresasDestaque.map((empresa) => (
                      <div key={empresa.id} className="relative">
                        {/* Badge de Destaque */}
                        <div className="absolute -top-2 -right-2 z-10">
                          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            <span>DESTAQUE</span>
                          </div>
                        </div>
                        <EmpresaCard 
                          empresa={empresa} 
                          onSelect={(empresa) => {
                            window.location.href = `/cliente/empresa/${empresa.id}`;
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Seção de Outras Empresas */}
              {!searchTerm && empresasNormais.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Outras Empresas</h3>
                    <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      <Star className="h-4 w-4" />
                      <span>Disponíveis</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {empresasNormais.map((empresa) => (
                      <EmpresaCard 
                        key={empresa.id} 
                        empresa={empresa} 
                        onSelect={(empresa) => {
                          window.location.href = `/cliente/empresa/${empresa.id}`;
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelecaoEmpresa;

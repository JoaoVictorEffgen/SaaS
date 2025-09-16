import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import EmpresaCard from '../shared/EmpresaCard';
import { 
  LogOut, Star, Crown, Award, Search, Clock, 
  Calendar, CheckCircle, XCircle, Filter,
  Building2, Home, Heart, Navigation
} from 'lucide-react';
import { useLocalAuth } from '../../contexts/LocalAuthContext';
import localStorageService from '../../services/localStorageService';
import { formatDate, formatTime } from '../../utils/formatters';
import { getFavoriteEmpresas } from '../../services/favoritesService';
import EmpresaCardWithFavorites from '../shared/EmpresaCardWithFavorites';

const SelecaoEmpresa = () => {
  const { user, logout } = useLocalAuth();
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState([]);
  const [empresasDestaque, setEmpresasDestaque] = useState([]);
  const [empresasNormais, setEmpresasNormais] = useState([]);
  const [empresasFavoritas, setEmpresasFavoritas] = useState([]);
  
  // Estados para pesquisa e filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmpresas, setFilteredEmpresas] = useState([]);
  const [historyFilter, setHistoryFilter] = useState('all'); // 'all', 'agendados', 'cancelados'
  const [clienteHistory, setClienteHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('todas'); // 'todas', 'favoritas', 'historico'

  // Carregar empresas favoritas
  const loadEmpresasFavoritas = () => {
    const favorites = getFavoriteEmpresas();
    setEmpresasFavoritas(favorites);
  };

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
    
    // Carregar empresas favoritas
    loadEmpresasFavoritas();
    
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

          {/* Abas de Navegação */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-white/50">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('todas')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === 'todas'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span className="font-medium">Todas</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('favoritas')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === 'favoritas'
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Heart className="w-4 h-4" />
                  <span className="font-medium">Favoritas ({empresasFavoritas.length})</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('historico')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === 'historico'
                      ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Histórico</span>
                </button>
              </div>
            </div>
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

              {/* Conteúdo baseado na aba ativa */}
              {activeTab === 'todas' && (
                <>
                  {/* Seção de Empresas em Destaque */}
                  {!searchTerm && empresasDestaque.length > 0 && (
                    <div className="mb-12">
                      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50">
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
                              <EmpresaCardWithFavorites 
                                empresa={empresa} 
                                userLocation={null}
                                showDistance={false}
                              />
                            </div>
                          ))}
                        </div>
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
                          <EmpresaCardWithFavorites 
                            key={empresa.id} 
                            empresa={empresa} 
                            userLocation={null}
                            showDistance={false}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Aba de Empresas Favoritas */}
              {activeTab === 'favoritas' && (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50">
                  <div className="flex items-center gap-3 mb-6">
                    <Heart className="h-6 w-6 text-red-500" />
                    <h3 className="text-2xl font-bold text-gray-900">Suas Empresas Favoritas</h3>
                    <div className="flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                      <Heart className="h-4 w-4 fill-current" />
                      <span>{empresasFavoritas.length} favoritas</span>
                    </div>
                  </div>
                  
                  {empresasFavoritas.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {empresasFavoritas.map((empresa) => (
                        <EmpresaCardWithFavorites 
                          key={empresa.id} 
                          empresa={empresa} 
                          userLocation={null}
                          showDistance={false}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        Nenhuma empresa favoritada
                      </h4>
                      <p className="text-gray-600 mb-4">
                        Explore as empresas disponíveis e clique no coração para adicionar aos seus favoritos.
                      </p>
                      <button
                        onClick={() => setActiveTab('todas')}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Building2 className="w-4 h-4 mr-2" />
                        Ver Todas as Empresas
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Aba de Histórico */}
              {activeTab === 'historico' && (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50">
                  <div className="flex items-center gap-3 mb-6">
                    <Clock className="h-6 w-6 text-green-500" />
                    <h3 className="text-2xl font-bold text-gray-900">Seu Histórico</h3>
                    <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      <Clock className="h-4 w-4" />
                      <span>{clienteHistory.length} ações</span>
                    </div>
                  </div>
                  
                  {clienteHistory.length > 0 ? (
                    <div className="space-y-4">
                      {clienteHistory.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {item.tipo === 'agendado' ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{item.empresaNome}</p>
                              <p className="text-sm text-gray-600">
                                {item.tipo === 'agendado' ? 'Agendado em' : 'Cancelado em'} {formatDate(item.dataAcao)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{item.servico_nome}</p>
                            <p className="text-xs text-gray-500">{formatTime(item.hora_inicio)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        Nenhum histórico encontrado
                      </h4>
                      <p className="text-gray-600">
                        Seus agendamentos e cancelamentos aparecerão aqui.
                      </p>
                    </div>
                  )}
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

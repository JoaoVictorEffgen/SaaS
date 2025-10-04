import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import EmpresaCard from '../shared/EmpresaCard';
import { 
  LogOut, Star, Crown, Award, Search, Clock, 
  CheckCircle, XCircle,
  Building2, Home, Heart
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
  const [clienteHistory, setClienteHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('todas'); // 'todas', 'favoritas', 'historico'

  // Carregar empresas favoritas
  const loadEmpresasFavoritas = () => {
    const favorites = getFavoriteEmpresas();
    setEmpresasFavoritas(favorites);
  };

  // Carregar histórico do cliente
  const loadClienteHistory = () => {
    if (user && user.email) {
      // Buscar agendamentos pelo email do cliente (que é mais confiável)
      const todosAgendamentos = localStorageService.getAgendamentos();
      console.log('🔍 Todos os agendamentos:', todosAgendamentos);
      console.log('🔍 Email do usuário:', user.email);
      
      const agendamentosDoCliente = todosAgendamentos.filter(agendamento => 
        agendamento.cliente_email === user.email || agendamento.clienteEmail === user.email
      );
      
      console.log('🔍 Agendamentos do cliente:', agendamentosDoCliente);
      
      // Criar histórico com ações (agendamento/cancelamento)
      const history = agendamentosDoCliente
        .map(agendamento => ({
          ...agendamento,
          tipo: agendamento.status === 'cancelado' ? 'cancelado' : 'agendado',
          dataAcao: agendamento.status === 'cancelado' ? agendamento.dataCancelamento : agendamento.data,
          empresaNome: empresas.find(e => e.id === (agendamento.empresa_id || agendamento.empresaId))?.nome || 'Empresa não encontrada',
          servico_nome: agendamento.servicos ? agendamento.servicos.map(s => s.nome).join(', ') : 'Serviço não especificado',
          hora_inicio: agendamento.hora || agendamento.hora_inicio || 'Horário não especificado'
        }))
        .sort((a, b) => new Date(b.dataAcao) - new Date(a.dataAcao))
        .slice(0, 15); // Últimas 15 ações
      
      console.log('🔍 Histórico criado:', history);
      
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

  // Adicionar listener para atualizar favoritos e histórico quando houver mudanças
  useEffect(() => {
    const handleStorageChange = () => {
      loadEmpresasFavoritas();
      loadClienteHistory();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Também escutar mudanças no localStorage local
    const interval = setInterval(() => {
      loadEmpresasFavoritas();
      loadClienteHistory();
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    try {
      console.log('🚪 SelecaoEmpresa - Iniciando logout...');
      
      // Executar logout (limpeza completa sem reload)
      await logout();
      
      // Navegar para a tela de login
      navigate('/', { replace: true });
      
      console.log('✅ SelecaoEmpresa - Logout concluído e navegação realizada');
      
    } catch (error) {
      console.error('❌ Erro no logout do SelecaoEmpresa:', error);
      // Fallback: navegar para login
      navigate('/', { replace: true });
    }
  };


  // Função para confirmar agendamento específico
  const confirmarAgendamento = (agendamentoId) => {
    const resultado = localStorageService.confirmarAgendamento(agendamentoId);
    if (resultado) {
      alert('✅ Agendamento confirmado com sucesso!');
      loadClienteHistory();
      window.location.reload();
    } else {
      alert('❌ Erro ao confirmar agendamento.');
    }
  };

  // Função para cancelar agendamento específico
  const cancelarAgendamento = (agendamentoId) => {
    const resultado = localStorageService.cancelarAgendamento(agendamentoId);
    if (resultado.sucesso) {
      alert('❌ Agendamento cancelado com sucesso!');
      loadClienteHistory();
      window.location.reload();
    } else {
      alert(`❌ Não foi possível cancelar: ${resultado.erro}`);
    }
  };

  // Permitir acesso mesmo sem login - usuário pode ver empresas


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-tr from-green-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header Simplificado */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {user ? `Olá, ${user.nome.split(' ')[0]}!` : 'Olá!'}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Escolha uma empresa para agendar seus serviços
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate('/')}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                  title="Voltar ao Início"
                >
                  <Home className="h-5 w-5" />
                </button>
                
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                  title="Sair"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Título Principal Centralizado */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-6 shadow-lg">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Empresas Disponíveis</h2>
            <p className="text-lg text-gray-600">Selecione uma empresa para agendar seus serviços</p>
          </div>

          {/* Abas de Navegação */}
          <div className="flex justify-center mb-10">
            <div className="bg-white rounded-xl p-1.5 shadow-lg border border-gray-100">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('todas')}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 font-medium ${
                    activeTab === 'todas'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Todas</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('favoritas')}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 font-medium ${
                    activeTab === 'favoritas'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Heart className="w-4 h-4" />
                  <span>Favoritas ({empresasFavoritas.length})</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('historico')}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 font-medium ${
                    activeTab === 'historico'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Histórico</span>
                </button>
              </div>
            </div>
          </div>

          {/* Barra de Pesquisa */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Pesquisar por nome, especialização ou serviços..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white shadow-lg text-lg"
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
                            // A verificação de login já foi feita antes de chegar nesta tela
                            // Se o usuário chegou aqui, ele já está logado como cliente
                            navigate(`/cliente/empresa/${empresa.id}`);
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
                      {clienteHistory.map((item, index) => {
                        const agora = new Date();
                        const dataAgendamento = new Date(`${item.data}T${item.hora_inicio}`);
                        const diferencaMinutos = (dataAgendamento - agora) / (1000 * 60);
                        const podeCancelar = localStorageService.podeCancelarAgendamento(item);
                        
                        return (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center space-x-3 flex-1">
                              {item.status === 'confirmado' ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : item.status === 'cancelado' ? (
                                <XCircle className="w-5 h-5 text-red-500" />
                              ) : item.status === 'agendado' || item.status === 'pendente' ? (
                                <Clock className="w-5 h-5 text-yellow-500" />
                              ) : (
                                <CheckCircle className="w-5 h-5 text-blue-500" />
                              )}
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{item.empresaNome}</p>
                                <p className="text-sm text-gray-600">
                                  {item.status === 'cancelado' ? 'Cancelado em' : 'Agendado em'} {formatDate(item.dataAcao)}
                                </p>
                                {item.status === 'confirmado' && diferencaMinutos > 0 && (
                                  <p className="text-xs text-green-600 font-medium">
                                    {diferencaMinutos > 60 ? 
                                      `Faltam ${Math.round(diferencaMinutos / 60)}h ${Math.round(diferencaMinutos % 60)}min` :
                                      `Faltam ${Math.round(diferencaMinutos)}min`
                                    }
                                  </p>
                                )}
                                {!podeCancelar.pode && item.status !== 'cancelado' && (
                                  <p className="text-xs text-red-600 font-medium">
                                    {podeCancelar.motivo}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-center mr-4">
                              <p className="text-sm font-medium text-gray-900">{item.servico_nome}</p>
                              <p className="text-xs text-gray-500">{formatTime(item.hora_inicio)}</p>
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                                item.status === 'confirmado' ? 'bg-green-100 text-green-800' :
                                item.status === 'cancelado' ? 'bg-red-100 text-red-800' :
                                item.status === 'agendado' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {item.status === 'confirmado' ? 'CONFIRMADO' :
                                 item.status === 'cancelado' ? 'CANCELADO' :
                                 item.status === 'agendado' ? 'AGENDADO' :
                                 item.status.toUpperCase()}
                              </span>
                            </div>

                            {/* Botões de Ação */}
                            <div className="flex flex-col space-y-2">
                              {(item.status === 'agendado' || item.status === 'pendente') && (
                                <button
                                  onClick={() => confirmarAgendamento(item.id)}
                                  className="flex items-center justify-center px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors font-semibold"
                                  title="Confirmar Agendamento"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  CONFIRMAR
                                </button>
                              )}
                              
                              {item.status !== 'cancelado' && podeCancelar.pode && (
                                <button
                                  onClick={() => cancelarAgendamento(item.id)}
                                  className="flex items-center justify-center px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors font-semibold"
                                  title="Cancelar Agendamento"
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  CANCELAR
                                </button>
                              )}
                              
                              {item.status !== 'cancelado' && !podeCancelar.pode && (
                                <div className="px-3 py-1 bg-gray-300 text-gray-600 text-xs rounded-lg font-semibold text-center">
                                  NÃO PODE CANCELAR
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
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

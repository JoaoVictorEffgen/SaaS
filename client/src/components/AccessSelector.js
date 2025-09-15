import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, Users, ArrowRight, Sparkles, Calendar, Clock, Zap, Star, Crown,
  TrendingUp, Users2, Heart, Award, Shield, Globe, MapPin, 
  ChevronRight, ChevronLeft, Facebook, Instagram, Twitter, Linkedin,
  X, ClipboardList
} from 'lucide-react';
import localStorageService from '../services/localStorageService';
import { useLocalAuth } from '../contexts/LocalAuthContext';
// Removido import não utilizado

const AccessSelector = () => {
  const [empresasDestaque, setEmpresasDestaque] = useState([]);
  const [currentBenefit, setCurrentBenefit] = useState(0);
  const [stats, setStats] = useState({
    totalEmpresas: 0,
    totalAgendamentos: 0,
    totalClientes: 0,
    satisfacao: 0
  });
  
  // Estados dos modais
  const [showEmpresaModal, setShowEmpresaModal] = useState(false);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [showFuncionarioModal, setShowFuncionarioModal] = useState(false);
  const [empresaForm, setEmpresaForm] = useState({ email: '', senha: '', nome: '', telefone: '', endereco: '' });
  const [clienteForm, setClienteForm] = useState({ 
    nome: '', 
    email: '', 
    telefone: '', 
    senha: '' 
  });
  const [funcionarioForm, setFuncionarioForm] = useState({ 
    empresaId: '', 
    cpf: '' 
  });
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isClienteLoginMode, setIsClienteLoginMode] = useState(true);
  const [empresaError, setEmpresaError] = useState('');
  const [clienteError, setClienteError] = useState('');
  const [funcionarioError, setFuncionarioError] = useState('');
  const [empresaLoading, setEmpresaLoading] = useState(false);
  const [clienteLoading, setClienteLoading] = useState(false);
  const [funcionarioLoading, setFuncionarioLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, register, user } = useLocalAuth();

  const beneficios = [
    {
      icon: Clock,
      title: "Agendamento 24h",
      description: "Disponível a qualquer hora",
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100"
    },
    {
      icon: Zap,
      title: "Rápido & Fácil",
      description: "Processo simplificado",
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100"
    },
    {
      icon: Calendar,
      title: "Totalmente Organizado",
      description: "Gestão profissional",
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100"
    }
  ];

  // Função para calcular estatísticas
  const calculateStats = useCallback((empresas) => {
    const totalEmpresas = empresas.length;
    const totalAgendamentos = empresas.reduce((acc, empresa) => {
      return acc + (empresa.totalAgendamentos || 0);
    }, 0);
    const totalClientes = empresas.reduce((acc, empresa) => {
      return acc + (empresa.totalClientes || 0);
    }, 0);
    const satisfacao = empresas.length > 0 
      ? empresas.reduce((acc, empresa) => acc + (empresa.notaMedia || 0), 0) / empresas.length 
      : 0;

    return {
      totalEmpresas,
      totalAgendamentos,
      totalClientes,
      satisfacao: Number(satisfacao.toFixed(1))
    };
  }, []);

  // Função para carregar empresas em destaque
  const loadFeaturedCompanies = useCallback(() => {
    const empresas = localStorageService.getEmpresas();
    const topEmpresas = empresas
      .sort((a, b) => {
        const notaA = a.notaMedia || 0;
        const notaB = b.notaMedia || 0;
        const avaliacoesA = a.totalAvaliacoes || 0;
        const avaliacoesB = b.totalAvaliacoes || 0;
        
        if (notaA !== notaB) {
          return notaB - notaA;
        }
        return avaliacoesB - avaliacoesA;
      })
      .slice(0, 3);
    
    setEmpresasDestaque(topEmpresas);
    setStats(calculateStats(empresas));
  }, [calculateStats]);

  useEffect(() => {
    loadFeaturedCompanies();

    // Auto-rotate benefits
    const interval = setInterval(() => {
      setCurrentBenefit((prev) => (prev + 1) % beneficios.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [loadFeaturedCompanies]); // eslint-disable-line react-hooks/exhaustive-deps

  const nextBenefit = useCallback(() => {
    setCurrentBenefit((prev) => (prev + 1) % beneficios.length);
  }, [beneficios.length]);

  const prevBenefit = useCallback(() => {
    setCurrentBenefit((prev) => (prev - 1 + beneficios.length) % beneficios.length);
  }, [beneficios.length]);

  // Funções dos modais
  const openEmpresaModal = () => {
    setShowEmpresaModal(true);
    setIsLoginMode(true);
    setEmpresaForm({ email: '', senha: '', nome: '', telefone: '', endereco: '' });
    setEmpresaError('');
  };

  const openClienteModal = () => {
    // Verificar se o cliente já está logado
    const clienteLogado = localStorage.getItem('clienteLogado');
    if (clienteLogado && user && user.tipo === 'cliente') {
      // Se já estiver logado como cliente, ir direto para a seleção de empresas
      navigate('/cliente');
      return;
    }
    
    setShowClienteModal(true);
    setIsClienteLoginMode(true);
    setClienteForm({ nome: '', email: '', telefone: '', senha: '' });
    setClienteError('');
  };


  // Função para navegar para todas as empresas (se logado como cliente)
  const handleVerTodasEmpresas = () => {
    const clienteLogado = localStorage.getItem('clienteLogado');
    if (clienteLogado && user && user.tipo === 'cliente') {
      // Se já estiver logado como cliente, ir direto para a seleção de empresas
      navigate('/cliente');
    } else {
      // Se não estiver logado, abrir modal de cliente
      openClienteModal();
    }
  };

  // Função para agendar em empresa específica
  const handleAgendarEmpresa = (empresaId) => {
    const clienteLogado = localStorage.getItem('clienteLogado');
    if (clienteLogado && user && user.tipo === 'cliente') {
      // Se já estiver logado como cliente, ir direto para a empresa
      navigate(`/cliente/empresa/${empresaId}`);
    } else {
      // Se não estiver logado, abrir modal de cliente
      openClienteModal();
    }
  };

  const openFuncionarioModal = () => {
    setShowFuncionarioModal(true);
    setFuncionarioError('');
  };

  const closeModal = () => {
    setShowEmpresaModal(false);
    setShowClienteModal(false);
    setShowFuncionarioModal(false);
    setIsLoginMode(true);
    setIsClienteLoginMode(true);
    setEmpresaError('');
    setClienteError('');
    setFuncionarioError('');
  };

  const handleEmpresaSubmit = async (e) => {
    e.preventDefault();
    setEmpresaError('');
    setEmpresaLoading(true);
    
    try {
      if (isLoginMode) {
        const result = await login(empresaForm.email, empresaForm.senha, 'empresa');
        if (result.success) {
          closeModal();
          navigate('/empresa/dashboard');
        } else {
          setEmpresaError('Email ou senha incorretos. Verifique seus dados e tente novamente.');
        }
      } else {
        const result = await register({
          ...empresaForm,
          tipo: 'empresa'
        });
        if (result.success) {
          closeModal();
          navigate('/empresa/dashboard');
        } else {
          setEmpresaError(result.error || 'Erro ao criar conta. Verifique os dados e tente novamente.');
        }
      }
    } catch (error) {
      console.error('Erro no login/cadastro:', error);
      setEmpresaError('Ocorreu um erro inesperado. Tente novamente mais tarde.');
    } finally {
      setEmpresaLoading(false);
    }
  };

  const handleClienteSubmit = async (e) => {
    e.preventDefault();
    setClienteError('');
    setClienteLoading(true);
    
    try {
      if (isClienteLoginMode) {
        // Login do cliente
        const result = await login(clienteForm.email, clienteForm.senha, 'cliente');
        if (result.success) {
          closeModal();
          navigate('/cliente');
        } else {
          setClienteError('Email ou senha incorretos. Verifique seus dados e tente novamente.');
        }
      } else {
        // Cadastro do cliente
        const result = await register({
          ...clienteForm,
          tipo: 'cliente'
        });
        if (result.success) {
          closeModal();
          navigate('/cliente');
        } else {
          setClienteError(result.error || 'Erro ao criar conta. Verifique os dados e tente novamente.');
        }
      }
    } catch (error) {
      console.error('Erro no login/cadastro do cliente:', error);
      setClienteError('Ocorreu um erro inesperado. Tente novamente mais tarde.');
    } finally {
      setClienteLoading(false);
    }
  };

  const handleFuncionarioSubmit = async (e) => {
    e.preventDefault();
    setFuncionarioError('');
    setFuncionarioLoading(true);

    try {
      // Validar se a empresa existe
      const empresas = localStorageService.getEmpresas();
      const empresa = empresas.find(emp => emp.id === funcionarioForm.empresaId);
      
      if (!empresa) {
        throw new Error('Empresa não encontrada. Verifique o ID da empresa.');
      }

      // Validar se o funcionário existe na empresa
      const funcionarios = JSON.parse(localStorage.getItem('funcionarios') || '[]');
      const funcionario = funcionarios.find(func => 
        func.empresaId === funcionarioForm.empresaId && 
        func.cpf === funcionarioForm.cpf.replace(/[^\d]/g, '')
      );

      if (!funcionario) {
        throw new Error('Funcionário não encontrado nesta empresa. Verifique o CPF.');
      }

      // Salvar dados do funcionário logado
      localStorage.setItem('funcionarioLogado', JSON.stringify(funcionario));
      localStorage.setItem('empresaFuncionario', JSON.stringify(empresa));

      // Fechar modal e navegar
      closeModal();
      navigate('/funcionario/agenda');

    } catch (error) {
      setFuncionarioError(error.message);
    } finally {
      setFuncionarioLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Modern Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-tr from-green-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/5 to-pink-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Modern Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl mb-8 shadow-2xl border border-white/30">
                <Calendar className="w-12 h-12 text-white animate-bounce" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                AgendaPro
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-2 font-medium">Sistema de Agendamento Online</p>
              <p className="text-base md:text-lg text-blue-200 max-w-3xl mx-auto px-4">
                Revolucione sua agenda com tecnologia de ponta. 
                <span className="font-semibold text-white"> Rápido, seguro e intuitivo.</span>
              </p>
              <div className="flex items-center justify-center gap-2 mt-6 text-blue-200">
                <Sparkles className="w-5 h-5 animate-spin" />
                <span className="text-base md:text-lg font-medium">A solução completa para sua empresa</span>
                <Sparkles className="w-5 h-5 animate-spin" />
              </div>
              
              {/* Botão para criar dados de teste */}
              <div className="mt-8">
                <button
                  onClick={() => {
                    // Executar criação de dados de teste
                    import('../utils/createTestData').then(module => {
                      module.createTestData();
                    });
                    alert('✅ Dados de teste criados!\n\n📋 Dados para teste:\nEmpresa ID: emp_teste_001\nFuncionário 1: Carlos Silva - CPF: 12345678901\nFuncionário 2: Pedro Santos - CPF: 98765432109\n\n🔑 Use estes dados para acessar a agenda do funcionário!');
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl border border-white/30"
                >
                  <ClipboardList className="w-5 h-5" />
                  Criar Dados de Teste
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-12 md:py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Números que Impressionam</h2>
              <p className="text-base md:text-lg text-gray-600">Confiança de milhares de usuários em todo o país</p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-8 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl md:rounded-2xl mb-3 md:mb-4 shadow-lg group-hover:shadow-xl group-hover:rotate-12 transition-all duration-500">
                  <Building2 className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2">{stats.totalEmpresas}</div>
                <div className="text-gray-600 font-medium text-sm md:text-base">Empresas Ativas</div>
              </div>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-8 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl md:rounded-2xl mb-3 md:mb-4 shadow-lg group-hover:shadow-xl group-hover:rotate-12 transition-all duration-500">
                  <Calendar className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2">{stats.totalAgendamentos}</div>
                <div className="text-gray-600 font-medium text-sm md:text-base">Agendamentos</div>
              </div>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-8 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl md:rounded-2xl mb-3 md:mb-4 shadow-lg group-hover:shadow-xl group-hover:rotate-12 transition-all duration-500">
                  <Users2 className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2">{stats.totalClientes}</div>
                <div className="text-gray-600 font-medium text-sm md:text-base">Clientes Satisfeitos</div>
              </div>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-8 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl md:rounded-2xl mb-3 md:mb-4 shadow-lg group-hover:shadow-xl group-hover:rotate-12 transition-all duration-500">
                  <Star className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2">{stats.satisfacao}</div>
                <div className="text-gray-600 font-medium text-sm md:text-base">Satisfação</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Action Cards */}
        <div className="py-12 md:py-16 px-4 bg-white/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Como você quer usar o AgendaPro?</h2>
              <p className="text-base md:text-lg text-gray-600">Escolha sua experiência personalizada</p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
              {/* Empresa Card */}
              <button onClick={openEmpresaModal} className="group block w-full">
                <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-2xl hover:shadow-3xl transition-all duration-700 hover:-translate-y-4 hover:scale-105 border border-blue-100 relative overflow-hidden h-full">
                  <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-12 md:-translate-y-16 translate-x-12 md:translate-x-16"></div>
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl md:rounded-2xl mb-4 md:mb-6 shadow-xl group-hover:shadow-2xl group-hover:rotate-12 transition-all duration-500">
                      <Building2 className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3 group-hover:text-blue-600 transition-colors duration-300">
                      Área da Empresa
                    </h3>
                    <p className="text-gray-600 text-base md:text-lg mb-4 md:mb-6 leading-relaxed flex-grow">
                      Gerencie suas agendas, funcionários e clientes com ferramentas profissionais
                    </p>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-4 md:mb-6">
                      <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-blue-600">
                        <Shield className="w-3 h-3 md:w-4 md:h-4" />
                        <span>Seguro</span>
                      </div>
                      <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-blue-600">
                        <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                        <span>Analytics</span>
                      </div>
                      <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-blue-600">
                        <Users className="w-3 h-3 md:w-4 md:h-4" />
                        <span>Multi-usuário</span>
                      </div>
                    </div>
                    <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700 transition-colors duration-300">
                      <span className="text-sm md:text-base">Acessar Dashboard</span>
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </button>

              {/* Cliente Card */}
              <button onClick={openClienteModal} className="group block w-full">
                <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-2xl hover:shadow-3xl transition-all duration-700 hover:-translate-y-4 hover:scale-105 border border-green-100 relative overflow-hidden h-full">
                  <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-full -translate-y-12 md:-translate-y-16 translate-x-12 md:translate-x-16"></div>
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-xl md:rounded-2xl mb-4 md:mb-6 shadow-xl group-hover:shadow-2xl group-hover:rotate-12 transition-all duration-500">
                      <Users className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3 group-hover:text-green-600 transition-colors duration-300">
                      Agendar Serviço
                    </h3>
                    <p className="text-gray-600 text-base md:text-lg mb-4 md:mb-6 leading-relaxed flex-grow">
                      Encontre e agende serviços com as melhores empresas da sua região
                    </p>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-4 md:mb-6">
                      <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-green-600">
                        <Clock className="w-3 h-3 md:w-4 md:h-4" />
                        <span>24/7</span>
                      </div>
                      <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-green-600">
                        <Globe className="w-3 h-3 md:w-4 md:h-4" />
                        <span>Online</span>
                      </div>
                      <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-green-600">
                        <Star className="w-3 h-3 md:w-4 md:h-4" />
                        <span>Avaliadas</span>
                      </div>
                    </div>
                    <div className="flex items-center text-green-600 font-semibold group-hover:text-green-700 transition-colors duration-300">
                      <span className="text-sm md:text-base">Buscar Empresas</span>
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </button>

              {/* Funcionário Card */}
              <button onClick={openFuncionarioModal} className="group block w-full">
                <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-2xl hover:shadow-3xl transition-all duration-700 hover:-translate-y-4 hover:scale-105 border border-cyan-100 relative overflow-hidden h-full">
                  <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full -translate-y-12 md:-translate-y-16 translate-x-12 md:translate-x-16"></div>
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl md:rounded-2xl mb-4 md:mb-6 shadow-xl group-hover:shadow-2xl group-hover:rotate-12 transition-all duration-500">
                      <ClipboardList className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3 group-hover:text-cyan-600 transition-colors duration-300">
                      Área do Funcionário
                    </h3>
                    <p className="text-gray-600 text-base md:text-lg mb-4 md:mb-6 leading-relaxed flex-grow">
                      Visualize sua agenda e horários de trabalho em tempo real
                    </p>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-4 md:mb-6">
                      <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-cyan-600">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                        <span>Agenda</span>
                      </div>
                      <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-cyan-600">
                        <Clock className="w-3 h-3 md:w-4 md:h-4" />
                        <span>Horários</span>
                      </div>
                      <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-cyan-600">
                        <Users className="w-3 h-3 md:w-4 md:h-4" />
                        <span>Clientes</span>
                      </div>
                    </div>
                    <div className="flex items-center text-cyan-600 font-semibold group-hover:text-cyan-700 transition-colors duration-300">
                      <span className="text-sm md:text-base">Ver Agenda</span>
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Benefits Carousel */}
        <div className="py-12 md:py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Por que usar o AgendaPro?</h2>
              <p className="text-base md:text-lg text-gray-600">Recursos que fazem a diferença no seu dia a dia</p>
            </div>
            
            <div className="relative max-w-4xl mx-auto">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl border border-white/50">
                <div className="flex items-center justify-center gap-4 md:gap-8">
                  <button 
                    onClick={prevBenefit}
                    className="p-2 md:p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-300"
                    aria-label="Benefício anterior"
                  >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                  </button>
                  
                  <div className="flex-1 text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br ${beneficios[currentBenefit].color} rounded-xl md:rounded-2xl mb-4 md:mb-6 shadow-xl mx-auto`}>
                      {React.createElement(beneficios[currentBenefit].icon, { className: "w-8 h-8 md:w-10 md:h-10 text-white" })}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">
                      {beneficios[currentBenefit].title}
                    </h3>
                    <p className="text-base md:text-lg text-gray-600 max-w-md mx-auto">
                      {beneficios[currentBenefit].description}
                    </p>
                  </div>
                  
                  <button 
                    onClick={nextBenefit}
                    className="p-2 md:p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-300"
                    aria-label="Próximo benefício"
                  >
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                  </button>
                </div>
                
                <div className="flex justify-center gap-2 mt-6 md:mt-8">
                  {beneficios.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentBenefit(index)}
                      className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                        index === currentBenefit 
                          ? 'bg-blue-600 w-6 md:w-8' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Ir para benefício ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Empresas em Destaque */}
        {empresasDestaque.length > 0 && (
          <div className="py-12 md:py-16 px-4 bg-white/50">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8 md:mb-12">
                <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
                  <Crown className="h-6 w-6 md:h-8 md:w-8 text-yellow-500" />
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Empresas em Destaque</h2>
                  <Crown className="h-6 w-6 md:h-8 md:w-8 text-yellow-500" />
                </div>
                <p className="text-base md:text-lg text-gray-600">As melhores avaliadas pelos nossos clientes</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {empresasDestaque.map((empresa, index) => (
                  <div key={empresa.id} className="bg-white rounded-xl md:rounded-2xl p-5 md:p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/50 group">
                    <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                      <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:rotate-12 transition-all duration-500">
                        <span className="text-white font-bold text-lg md:text-xl">
                          {(empresa.nome || 'E').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-base md:text-lg mb-1 truncate">{empresa.nome}</h4>
                        <p className="text-gray-600 text-sm md:text-base truncate">{empresa.especializacao}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3 md:mb-4">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3 w-3 md:h-4 md:w-4 ${i < Math.floor(empresa.notaMedia || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-sm md:text-base font-semibold text-gray-700">
                        {empresa.notaMedia ? empresa.notaMedia.toFixed(1) : 'N/A'}
                      </span>
                      <span className="text-xs md:text-sm text-gray-500">
                        ({empresa.totalAvaliacoes || 0} avaliações)
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3 md:mb-4 text-sm text-gray-600">
                      <MapPin className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                      <span className="truncate">{empresa.endereco || 'Localização não informada'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="h-3 w-3 md:h-4 md:w-4 text-yellow-500 flex-shrink-0" />
                        <span className="text-xs md:text-sm font-medium text-yellow-600">Empresa Destaque</span>
                      </div>
                      <button
                        onClick={() => handleAgendarEmpresa(empresa.id)}
                        className="inline-flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 text-xs md:text-sm font-medium"
                      >
                        Agendar
                        <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-6 md:mt-8">
                <button
                  onClick={handleVerTodasEmpresas}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                >
                  Ver todas as empresas
                  <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modern Footer */}
        <footer className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white py-12 md:py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold">AgendaPro</h3>
                </div>
                <p className="text-gray-300 text-sm md:text-lg mb-4 md:mb-6 max-w-md">
                  A plataforma mais completa para gestão de agendamentos online. 
                  Simplifique sua vida profissional.
                </p>
                <div className="flex flex-wrap items-center gap-3 md:gap-4">
                  <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                    <Shield className="h-3 w-3 md:h-4 md:w-4 text-green-400" />
                    <span>100% Seguro</span>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                    <Globe className="h-3 w-3 md:h-4 md:w-4 text-blue-400" />
                    <span>Disponível 24/7</span>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                    <Award className="h-3 w-3 md:h-4 md:w-4 text-yellow-400" />
                    <span>Melhor Avaliado</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Links Rápidos</h4>
                <div className="space-y-2">
                  <Link to="/empresa/login" className="block text-gray-300 hover:text-white transition-colors duration-300 text-sm md:text-base">
                    Área da Empresa
                  </Link>
                  <Link to="/" className="block text-gray-300 hover:text-white transition-colors duration-300 text-sm md:text-base">
                    Agendar Serviço
                  </Link>
                  <button className="block text-gray-300 hover:text-white transition-colors duration-300 text-sm md:text-base">
                    Sobre Nós
                  </button>
                  <button className="block text-gray-300 hover:text-white transition-colors duration-300 text-sm md:text-base">
                    Contato
                  </button>
                </div>
              </div>
              
              <div>
                <h4 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Redes Sociais</h4>
                <div className="flex gap-3 md:gap-4">
                  <button className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors duration-300">
                    <Facebook className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                  <button className="w-8 h-8 md:w-10 md:h-10 bg-pink-600 rounded-lg flex items-center justify-center hover:bg-pink-700 transition-colors duration-300">
                    <Instagram className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                  <button className="w-8 h-8 md:w-10 md:h-10 bg-blue-500 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors duration-300">
                    <Twitter className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                  <button className="w-8 h-8 md:w-10 md:h-10 bg-blue-700 rounded-lg flex items-center justify-center hover:bg-blue-800 transition-colors duration-300">
                    <Linkedin className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-700 pt-6 md:pt-8 text-center">
              <p className="text-gray-400 text-sm md:text-base">
                © 2024 AgendaPro. Desenvolvido com 
                <Heart className="inline h-3 w-3 md:h-4 md:w-4 text-red-500 mx-1 animate-pulse" /> 
                para simplificar sua vida.
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Modal da Empresa - Versão Renovada */}
      {showEmpresaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            {/* Header do Modal */}
            <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-3xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {isLoginMode ? 'Login Empresa' : 'Cadastro Empresa'}
                    </h2>
                    <p className="text-blue-100 text-sm">
                      {isLoginMode ? 'Acesse sua conta' : 'Crie sua conta empresarial'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={closeModal}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6">
              {/* Alerta de Erro */}
              {empresaError && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-xl animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800 font-medium">{empresaError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Formulário */}
              <form onSubmit={handleEmpresaSubmit} className="space-y-5">
                {/* Nome da Empresa (apenas no cadastro) */}
                {!isLoginMode && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Nome da Empresa
                    </label>
                    <input
                      type="text"
                      required={!isLoginMode}
                      value={empresaForm.nome}
                      onChange={(e) => setEmpresaForm({...empresaForm, nome: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Digite o nome da sua empresa"
                    />
                  </div>
                )}

                {/* Telefone (apenas no cadastro) */}
                {!isLoginMode && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      required={!isLoginMode}
                      value={empresaForm.telefone}
                      onChange={(e) => setEmpresaForm({...empresaForm, telefone: e.target.value.replace(/[^\d]/g, '')})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="(11) 99999-9999"
                      maxLength="11"
                    />
                  </div>
                )}

                {/* Endereço (apenas no cadastro) */}
                {!isLoginMode && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Endereço
                    </label>
                    <input
                      type="text"
                      required={!isLoginMode}
                      value={empresaForm.endereco}
                      onChange={(e) => setEmpresaForm({...empresaForm, endereco: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Endereço da empresa"
                    />
                  </div>
                )}
                
                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={empresaForm.email}
                    onChange={(e) => setEmpresaForm({...empresaForm, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="seu@email.com"
                  />
                </div>
                
                {/* Senha */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Senha
                  </label>
                  <input
                    type="password"
                    required
                    value={empresaForm.senha}
                    onChange={(e) => setEmpresaForm({...empresaForm, senha: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Digite sua senha"
                  />
                </div>

                {/* Botão de Submit */}
                <button
                  type="submit"
                  disabled={empresaLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {empresaLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {isLoginMode ? 'Entrando...' : 'Cadastrando...'}
                    </div>
                  ) : (
                    isLoginMode ? 'Entrar' : 'Cadastrar e Continuar'
                  )}
                </button>
              </form>

              {/* Alternar entre Login e Cadastro */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setIsLoginMode(!isLoginMode);
                    setEmpresaError('');
                    setEmpresaForm({ email: '', senha: '', nome: '', telefone: '', endereco: '' });
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors"
                >
                  {isLoginMode ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
                </button>
              </div>

              {/* Informação adicional para login */}
              {isLoginMode && (
                <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-800 text-center">
                    🏢 Acesse sua área empresarial e gerencie seus agendamentos
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal do Cliente - Versão Renovada */}
      {showClienteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            {/* Header do Modal */}
            <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-3xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {isClienteLoginMode ? 'Login Cliente' : 'Cadastro Cliente'}
                    </h2>
                    <p className="text-green-100 text-sm">
                      {isClienteLoginMode ? 'Acesse sua conta' : 'Crie sua conta'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={closeModal}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6">
              {/* Alerta de Erro */}
              {clienteError && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-xl animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800 font-medium">{clienteError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Formulário */}
              <form onSubmit={handleClienteSubmit} className="space-y-5">
                {/* Nome (apenas no cadastro) */}
                {!isClienteLoginMode && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      required={!isClienteLoginMode}
                      value={clienteForm.nome}
                      onChange={(e) => setClienteForm({...clienteForm, nome: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Digite seu nome completo"
                    />
                  </div>
                )}
                
                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={clienteForm.email}
                    onChange={(e) => setClienteForm({...clienteForm, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="seu@email.com"
                  />
                </div>

                {/* Telefone (apenas no cadastro) */}
                {!isClienteLoginMode && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      required={!isClienteLoginMode}
                      value={clienteForm.telefone}
                      onChange={(e) => setClienteForm({...clienteForm, telefone: e.target.value.replace(/[^\d]/g, '')})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="(11) 99999-9999"
                      maxLength="11"
                    />
                  </div>
                )}
                
                {/* Senha */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Senha
                  </label>
                  <input
                    type="password"
                    required
                    value={clienteForm.senha}
                    onChange={(e) => setClienteForm({...clienteForm, senha: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Digite sua senha"
                  />
                </div>

                {/* Botão de Submit */}
                <button
                  type="submit"
                  disabled={clienteLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {clienteLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {isClienteLoginMode ? 'Entrando...' : 'Cadastrando...'}
                    </div>
                  ) : (
                    isClienteLoginMode ? 'Entrar' : 'Cadastrar e Continuar'
                  )}
                </button>
              </form>

              {/* Alternar entre Login e Cadastro */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setIsClienteLoginMode(!isClienteLoginMode);
                    setClienteError('');
                    setClienteForm({ nome: '', email: '', telefone: '', senha: '' });
                  }}
                  className="text-green-600 hover:text-green-700 text-sm font-semibold transition-colors"
                >
                  {isClienteLoginMode ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
                </button>
              </div>

              {/* Informação adicional para login */}
              {isClienteLoginMode && (
                <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-800 text-center">
                    💡 Faça login para acessar seu histórico de agendamentos
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal do Funcionário */}
      {showFuncionarioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            {/* Header do Modal */}
            <div className="relative bg-gradient-to-r from-cyan-500 to-blue-600 rounded-t-3xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <ClipboardList className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Acesso Funcionário</h2>
                    <p className="text-cyan-100 text-sm">Visualize sua agenda pessoal</p>
                  </div>
                </div>
                <button 
                  onClick={closeModal}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Conteúdo do Modal */}
            <div className="p-6">
              {/* Alerta de Erro */}
              {funcionarioError && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-xl animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800 font-medium">{funcionarioError}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Formulário */}
              <form onSubmit={handleFuncionarioSubmit} className="space-y-5">
                {/* ID da Empresa */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    ID da Empresa
                  </label>
                  <input
                    type="text"
                    required
                    value={funcionarioForm.empresaId}
                    onChange={(e) => setFuncionarioForm({...funcionarioForm, empresaId: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Digite o ID da empresa"
                  />
                  <p className="text-xs text-gray-500">Pergunte ao seu gestor pelo ID da empresa</p>
                </div>
                
                {/* CPF */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    CPF
                  </label>
                  <input
                    type="text"
                    required
                    value={funcionarioForm.cpf}
                    onChange={(e) => setFuncionarioForm({...funcionarioForm, cpf: e.target.value.replace(/[^\d]/g, '')})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="000.000.000-00"
                    maxLength="11"
                  />
                </div>
                
                {/* Botão de Submit */}
                <button
                  type="submit"
                  disabled={funcionarioLoading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {funcionarioLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Acessando...
                    </div>
                  ) : (
                    'Acessar Agenda'
                  )}
                </button>
              </form>
              
              {/* Informação adicional */}
              <div className="mt-6 p-3 bg-cyan-50 rounded-xl border border-cyan-200">
                <p className="text-sm text-cyan-800 text-center">
                  📋 Acesse sua agenda pessoal e visualize todos os seus agendamentos
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessSelector;
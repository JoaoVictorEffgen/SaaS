import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, Users, ArrowRight, Calendar, Clock, Zap, Star, Crown,
  Users2, X, ClipboardList, ChevronLeft, ChevronRight, Facebook, Instagram, Twitter, Linkedin, Plus,
  Heart, Navigation
} from 'lucide-react';
import { useLocalAuth } from '../contexts/LocalAuthContext';
import EmpresasProximas from './shared/EmpresasProximas';
import EmpresasFavoritas from './shared/EmpresasFavoritas';

const AccessSelector = () => {
  const [empresasDestaque, setEmpresasDestaque] = useState([]);
  
  // Estados dos modais
  const [showEmpresaModal, setShowEmpresaModal] = useState(false);
  const [showFuncionarioModal, setShowFuncionarioModal] = useState(false);
  
  // Estados para novas funcionalidades
  const [activeSection, setActiveSection] = useState('destaque'); // 'destaque', 'proximas', 'favoritas'
  const [allEmpresas, setAllEmpresas] = useState([]);
  const [isClientLoggedIn, setIsClientLoggedIn] = useState(false);
  const [empresaForm, setEmpresaForm] = useState({ email: '', senha: '', nome: '', telefone: '', endereco: '', cnpj: '' });
  const [funcionarioForm, setFuncionarioForm] = useState({ 
    empresaId: '', 
    cpf: '' 
  });
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [empresaError, setEmpresaError] = useState('');
  const [funcionarioError, setFuncionarioError] = useState('');
  const [empresaLoading, setEmpresaLoading] = useState(false);
  const [funcionarioLoading, setFuncionarioLoading] = useState(false);
  const [currentBenefit, setCurrentBenefit] = useState(0);
  const [currentEmpresa, setCurrentEmpresa] = useState(0);
  const [animatedStats, setAnimatedStats] = useState({
    totalEmpresas: 0,
    totalAgendamentos: 0,
    totalClientes: 0,
    satisfacao: 0
  });

  
  const navigate = useNavigate();
  const { login, register } = useLocalAuth();

  const beneficios = [
    {
      icon: Clock,
      title: "Agendamento 24h",
      description: "Seus clientes podem agendar a qualquer hora do dia, todos os dias da semana.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Zap,
      title: "Rápido & Fácil",
      description: "Interface intuitiva que permite agendamentos em poucos cliques.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Calendar,
      title: "Organizado",
      description: "Mantenha sua agenda sempre organizada com sincronização automática.",
      color: "from-purple-500 to-purple-600"
    }
  ];

  const nextBenefit = () => {
    setCurrentBenefit((prev) => (prev + 1) % beneficios.length);
  };

  const prevBenefit = () => {
    setCurrentBenefit((prev) => (prev - 1 + beneficios.length) % beneficios.length);
  };

  const nextEmpresa = () => {
    setCurrentEmpresa((prev) => (prev + 1) % Math.min(empresasDestaque.length, 6));
  };

  const prevEmpresa = () => {
    setCurrentEmpresa((prev) => (prev - 1 + Math.min(empresasDestaque.length, 6)) % Math.min(empresasDestaque.length, 6));
  };

  const handleAgendarEmpresa = (empresa) => {
    // Verificar se o usuário está logado
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    if (currentUser && currentUser.tipo === 'cliente') {
      // Usuário já está logado como cliente - ir direto para agendamento
      localStorage.setItem('empresaSelecionada', JSON.stringify(empresa));
      navigate('/cliente');
    } else {
      // Usuário não está logado - redirecionar para página de cliente
      localStorage.setItem('empresaSelecionada', JSON.stringify(empresa));
      navigate('/cliente');
    }
  };

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBenefit((prev) => (prev + 1) % beneficios.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [beneficios.length]);

  // Auto-rotate empresas carousel
  useEffect(() => {
    if (empresasDestaque.length > 0) {
      const interval = setInterval(() => {
        setCurrentEmpresa((prev) => (prev + 1) % Math.min(empresasDestaque.length, 6));
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [empresasDestaque.length]);

  // Animate stats numbers
  const animateNumber = (start, end, duration, setter) => {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + (end - start) * easeOutQuart);
      setter(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  };

  const loadEmpresasDestaque = useCallback(() => {
    const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
    
    // Salvar todas as empresas para uso em outras seções
    setAllEmpresas(empresas);
    
    const empresasComAvaliacao = empresas.map(empresa => ({
      ...empresa,
      avaliacao: empresa.notaMedia || (4.5 + Math.random() * 0.5), // Usar nota real ou simular
      totalAvaliacoes: empresa.totalAvaliacoes || Math.floor(Math.random() * 200) + 50
    }));
    
    const empresasOrdenadas = empresasComAvaliacao
      .sort((a, b) => b.avaliacao - a.avaliacao)
      .slice(0, 6); // Pegar as 6 primeiras
    
    setEmpresasDestaque(empresasOrdenadas);
  }, []);

  const loadStats = useCallback(() => {
    const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
    const agendamentos = JSON.parse(localStorage.getItem('agendamentos') || '[]');
    
    let totalAgendamentos = 0;
    let totalClientes = 0;
    
    empresas.forEach(empresa => {
      const agendamentosEmpresa = agendamentos.filter(a => a.empresa_id === empresa.id);
      totalAgendamentos += agendamentosEmpresa.length;
      
      const clientesUnicos = new Set(agendamentosEmpresa.map(a => a.cliente_email));
      totalClientes += clientesUnicos.size;
    });

    // Animate the numbers
    setTimeout(() => {
      animateNumber(0, empresas.length, 2000, (value) => 
        setAnimatedStats(prev => ({ ...prev, totalEmpresas: value }))
      );
      animateNumber(0, totalAgendamentos, 2000, (value) => 
        setAnimatedStats(prev => ({ ...prev, totalAgendamentos: value }))
      );
      animateNumber(0, totalClientes, 2000, (value) => 
        setAnimatedStats(prev => ({ ...prev, totalClientes: value }))
      );
      animateNumber(0, 4.8 * 10, 2000, (value) => 
        setAnimatedStats(prev => ({ ...prev, satisfacao: value / 10 }))
      );
    }, 500);
  }, []);


  useEffect(() => {
    loadEmpresasDestaque();
    loadStats();
    
    // Verificar se há um cliente logado
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const clientLoggedIn = currentUser && currentUser.tipo === 'cliente';
    setIsClientLoggedIn(clientLoggedIn);
    
    // Se cliente logado, mostrar favoritas por padrão
    if (clientLoggedIn) {
      setActiveSection('favoritas');
    } else {
      setActiveSection('destaque');
    }
  }, [loadEmpresasDestaque, loadStats]);

  const openEmpresaModal = () => {
    setShowEmpresaModal(true);
    setEmpresaError('');
    setEmpresaForm({ email: '', senha: '', nome: '', telefone: '', endereco: '', cnpj: '' });
  };


  const openFuncionarioModal = () => {
    setShowFuncionarioModal(true);
    setFuncionarioError('');
    setFuncionarioForm({ empresaId: '', cpf: '' });
  };

  const handleEmpresaSubmit = async (e) => {
    e.preventDefault();
    setEmpresaLoading(true);
    setEmpresaError('');

    try {
      let result;
      if (isLoginMode) {
        // Para login, usar email ou CNPJ
        const loginIdentifier = empresaForm.email || empresaForm.cnpj;
        result = await login(loginIdentifier, empresaForm.senha, 'empresa');
      } else {
        result = await register({
          ...empresaForm,
          tipo: 'empresa'
        });
      }

      if (result.success) {
        setShowEmpresaModal(false);
        navigate('/empresa/dashboard');
      } else {
        setEmpresaError(result.error || 'Erro no login/cadastro');
      }
    } catch (error) {
      setEmpresaError(error.message);
    } finally {
      setEmpresaLoading(false);
    }
  };


  const handleFuncionarioSubmit = async (e) => {
    e.preventDefault();
    setFuncionarioLoading(true);
    setFuncionarioError('');

    try {
      console.log('Empresa ID inserido:', funcionarioForm.empresaId);
      console.log('CPF inserido:', funcionarioForm.cpf);

      const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
      const funcionarios = JSON.parse(localStorage.getItem('funcionarios') || '[]');
      
      console.log('Empresas encontradas:', empresas.length);
      console.log('Funcionários encontrados:', funcionarios.length);
      
      const empresa = empresas.find(emp => emp.id === funcionarioForm.empresaId);
      const funcionario = funcionarios.find(func => 
        func.empresaId === funcionarioForm.empresaId && 
        func.cpf === funcionarioForm.cpf
      );

      console.log('Empresa encontrada:', empresa ? empresa.nome : 'NÃO ENCONTRADA');
      console.log('Funcionário encontrado:', funcionario ? funcionario.nome : 'NÃO ENCONTRADO');

      if (!empresa) {
        throw new Error('Empresa não encontrada');
      }

      if (!funcionario) {
        throw new Error('Funcionário não encontrado nesta empresa');
      }

      // Criar dados do usuário funcionário
      const userData = {
        ...funcionario,
        tipo: 'funcionario',
        empresa_nome: empresa.nome,
        email: funcionario.email || `funcionario_${funcionario.cpf}@empresa.com`, // Email fictício se não existir
        plano: 'business' // Funcionários têm acesso business
      };
      
      console.log('💾 Salvando usuário no localStorage:', userData);
      
      // Limpar qualquer usuário anterior
      localStorage.removeItem('currentUser');
      localStorage.removeItem('clienteLogado');
      localStorage.removeItem('empresaLogada');
      
      // Salvar novo usuário
      localStorage.setItem('currentUser', JSON.stringify(userData));

      // Forçar atualização do contexto
      window.dispatchEvent(new Event('storage'));

      setShowFuncionarioModal(false);
      
      // Aguardar um pouco para garantir que o contexto seja atualizado
      setTimeout(() => {
        console.log('🚀 Redirecionando para /funcionario/agenda');
        navigate('/funcionario/agenda');
      }, 100);

    } catch (error) {
      console.error('❌ Erro no login:', error);
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
              
            </div>
          </div>
        </div>

      {/* Banner de Status de Login */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-4">
            {isClientLoggedIn ? (
              <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/30">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                <span className="text-white font-bold text-lg">🎉 VOCÊ ESTÁ LOGADO!</span>
                <span className="text-blue-100 text-sm">Acesse suas funcionalidades completas</span>
              </div>
            ) : (
              <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/30">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg"></div>
                <span className="text-white font-bold text-lg">🔓 FAÇA LOGIN</span>
                <span className="text-blue-100 text-sm">Para acessar todas as funcionalidades</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Números que Impressionam</h2>
            <p className="text-gray-600">Confiança de milhares de usuários em todo o país</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-white/50 text-center group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-3 group-hover:rotate-12 transition-transform duration-500">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1 animate-pulse">
                {animatedStats.totalEmpresas.toLocaleString()}
              </div>
              <div className="text-gray-600 text-sm">Empresas Ativas</div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-white/50 text-center group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mb-3 group-hover:rotate-12 transition-transform duration-500">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1 animate-pulse">
                {animatedStats.totalAgendamentos.toLocaleString()}
              </div>
              <div className="text-gray-600 text-sm">Agendamentos</div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-white/50 text-center group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mb-3 group-hover:rotate-12 transition-transform duration-500">
                <Users2 className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1 animate-pulse">
                {animatedStats.totalClientes.toLocaleString()}
              </div>
              <div className="text-gray-600 text-sm">Clientes Satisfeitos</div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-white/50 text-center group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl mb-3 group-hover:rotate-12 transition-transform duration-500">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1 animate-pulse">
                {animatedStats.satisfacao.toFixed(1)}★
              </div>
              <div className="text-gray-600 text-sm">Satisfação</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Cards */}
      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Como você quer usar o AgendaPro?</h2>
            <p className="text-gray-600">Escolha sua experiência personalizada</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Empresa Card */}
            <button onClick={openEmpresaModal} className="group block w-full">
              <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-2xl hover:shadow-3xl transition-all duration-700 hover:-translate-y-4 hover:scale-105 border-2 border-blue-800 relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-gradient-to-br from-blue-800/10 to-blue-900/10 rounded-full -translate-y-12 md:-translate-y-16 translate-x-12 md:translate-x-16"></div>
                <div className="relative z-10 h-full flex flex-col">
                  <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-blue-800 rounded-xl md:rounded-2xl mb-4 md:mb-6 shadow-xl group-hover:shadow-2xl group-hover:rotate-12 transition-all duration-500">
                    <Building2 className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3 group-hover:text-blue-800 transition-colors duration-300">
                    Área da Empresa
                  </h3>
                  <p className="text-gray-600 text-base md:text-lg mb-4 md:mb-6 leading-relaxed flex-grow">
                    Gerencie suas agendas, funcionários e clientes com ferramentas profissionais
                  </p>
                  <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-4 md:mb-6">
                    <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-blue-800">
                      <Building2 className="w-3 h-3 md:w-4 md:h-4" />
                      <span>Seguro</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-blue-800">
                      <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                      <span>Analytics</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-blue-800">
                      <Users className="w-3 h-3 md:w-4 md:h-4" />
                      <span>Multi-usuário</span>
                    </div>
                  </div>
                  <div className="flex items-center text-blue-800 font-semibold group-hover:text-blue-900 transition-colors duration-300">
                    <span className="text-sm md:text-base">Acessar Dashboard</span>
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </button>

            {/* Cliente Card */}
            <Link to="/cliente" className="group block w-full">
              <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-2xl hover:shadow-3xl transition-all duration-700 hover:-translate-y-4 hover:scale-105 border-2 border-green-300 relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-gradient-to-br from-green-300/10 to-green-400/10 rounded-full -translate-y-12 md:-translate-y-16 translate-x-12 md:translate-x-16"></div>
                <div className="relative z-10 h-full flex flex-col">
                  <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-green-300 rounded-xl md:rounded-2xl mb-4 md:mb-6 shadow-xl group-hover:shadow-2xl group-hover:rotate-12 transition-all duration-500">
                    <Users className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3 group-hover:text-green-300 transition-colors duration-300">
                    Agendar Serviço
                  </h3>
                  <p className="text-gray-600 text-base md:text-lg mb-4 md:mb-6 leading-relaxed flex-grow">
                    Encontre e agende serviços com as melhores empresas da sua região
                  </p>
                  <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-4 md:mb-6">
Z                    <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-green-300">
                      <Clock className="w-3 h-3 md:w-4 md:h-4" />
                      <span>24/7</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-green-300">
                      <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                      <span>Online</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-green-300">
                      <Star className="w-3 h-3 md:w-4 md:h-4" />
                      <span>Avaliadas</span>
                    </div>
                  </div>
                  <div className="flex items-center text-green-300 font-semibold group-hover:text-green-400 transition-colors duration-300">
                    <span className="text-sm md:text-base">Buscar Empresas</span>
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Funcionário Card */}
            <button onClick={openFuncionarioModal} className="group block w-full">
              <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-2xl hover:shadow-3xl transition-all duration-700 hover:-translate-y-4 hover:scale-105 border-2 border-blue-300 relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-gradient-to-br from-blue-300/10 to-blue-400/10 rounded-full -translate-y-12 md:-translate-y-16 translate-x-12 md:translate-x-16"></div>
                <div className="relative z-10 h-full flex flex-col">
                  <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-blue-300 rounded-xl md:rounded-2xl mb-4 md:mb-6 shadow-xl group-hover:shadow-2xl group-hover:rotate-12 transition-all duration-500">
                    <ClipboardList className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3 group-hover:text-blue-300 transition-colors duration-300">
                    Área do Funcionário
                  </h3>
                  <p className="text-gray-600 text-base md:text-lg mb-4 md:mb-6 leading-relaxed flex-grow">
                    Visualize sua agenda e horários de trabalho em tempo real
                  </p>
                  <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-4 md:mb-6">
                    <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-blue-300">
                      <Clock className="w-3 h-3 md:w-4 md:h-4" />
                      <span>Tempo Real</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-blue-300">
                      <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                      <span>Agenda</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-blue-300">
                      <Users className="w-3 h-3 md:w-4 md:h-4" />
                      <span>Equipe</span>
                    </div>
                  </div>
                  <div className="flex items-center text-blue-300 font-semibold group-hover:text-blue-400 transition-colors duration-300">
                    <span className="text-sm md:text-base">Acessar Agenda</span>
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
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentBenefit 
                        ? 'bg-blue-600 scale-125' 
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


      {/* Navegação de Seções */}
      {allEmpresas.length > 0 && (
        <div className="py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-center mb-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-white/50">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveSection('destaque')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      activeSection === 'destaque'
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Crown className="w-4 h-4" />
                    <span className="font-medium">Destaque</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveSection('proximas')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      activeSection === 'proximas'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Navigation className="w-4 h-4" />
                    <span className="font-medium">Próximas</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveSection('favoritas')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      activeSection === 'favoritas'
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Heart className="w-4 h-4" />
                    <span className="font-medium">Favoritas</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo das Seções */}
      {activeSection === 'destaque' && empresasDestaque.length > 0 && (
        <div className="py-12 md:py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
                <Crown className="h-6 w-6 md:h-8 md:w-8 text-yellow-500 animate-pulse" />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Empresas em Destaque</h2>
                <Crown className="h-6 w-6 md:h-8 md:w-8 text-yellow-500 animate-pulse" />
              </div>
              <p className="text-base md:text-lg text-gray-600">As melhores avaliadas pelos nossos clientes</p>
            </div>
            
            <div className="relative max-w-5xl mx-auto">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl border border-white/50 overflow-hidden">
                <div className="flex items-center justify-center gap-4 md:gap-8">
                  <button 
                    onClick={prevEmpresa}
                    className="p-2 md:p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300 hover:scale-110"
                    aria-label="Empresa anterior"
                  >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                  </button>
                  
                  <div className="flex-1 text-center">
                    <div className="flex items-center justify-center gap-4 md:gap-6 mb-4 md:mb-6">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl">
                        <span className="text-white font-bold text-xl md:text-2xl">
                          {empresasDestaque[currentEmpresa]?.razaoSocial ? empresasDestaque[currentEmpresa].razaoSocial.charAt(0) : 'E'}
                        </span>
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                          {empresasDestaque[currentEmpresa]?.razaoSocial || 'Empresa'}
                        </h3>
                        <p className="text-base md:text-lg text-gray-600">
                          {empresasDestaque[currentEmpresa]?.especializacao || 'Serviços'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Star className="h-5 w-5 md:h-6 md:w-6 text-yellow-500 fill-current" />
                      <span className="text-lg md:text-xl font-bold text-gray-900">
                        {empresasDestaque[currentEmpresa]?.avaliacao.toFixed(1) || '4.8'}
                      </span>
                      <span className="text-sm md:text-base text-gray-600">
                        ({empresasDestaque[currentEmpresa]?.totalAvaliacoes || '150'} avaliações)
                      </span>
                    </div>
                    
                    <div className="flex justify-center gap-2 mb-4">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 md:h-5 md:w-5 ${
                            i < Math.floor(empresasDestaque[currentEmpresa]?.avaliacao || 4.8) 
                              ? 'text-yellow-500 fill-current' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                    
                    {/* Botão de Agendamento */}
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-3">
                        Gostou desta empresa? Agende seu serviço agora!
                      </p>
                      <button
                        onClick={() => handleAgendarEmpresa(empresasDestaque[currentEmpresa])}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1"
                      >
                        <Plus className="w-5 h-5" />
                        {isClientLoggedIn ? 'Agendar Agora' : 'Fazer Login e Agendar'}
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    onClick={nextEmpresa}
                    className="p-2 md:p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300 hover:scale-110"
                    aria-label="Próxima empresa"
                  >
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                  </button>
                </div>
                
                <div className="flex justify-center gap-2 mt-6 md:mt-8">
                  {Array.from({ length: Math.min(empresasDestaque.length, 6) }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentEmpresa(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentEmpresa 
                          ? 'bg-yellow-500 scale-125' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Ir para empresa ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seção de Empresas Próximas */}
      {activeSection === 'proximas' && (
        <div className="py-12 md:py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <EmpresasProximas empresas={allEmpresas} radius={15} />
          </div>
        </div>
      )}

      {/* Seção de Empresas Favoritas */}
      {activeSection === 'favoritas' && (
        <div className="py-12 md:py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <EmpresasFavoritas empresas={allEmpresas} />
          </div>
        </div>
      )}

      {/* Modal da Empresa */}
      {showEmpresaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {isLoginMode ? 'Login Empresa' : 'Cadastro Empresa'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {isLoginMode ? 'Acesse sua conta' : 'Crie sua conta empresarial'}
                  </p>
                </div>
                <button
                  onClick={() => setShowEmpresaModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleEmpresaSubmit} className="p-6 space-y-4">
              {empresaError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {empresaError}
                </div>
              )}

              {!isLoginMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Empresa
                  </label>
                  <input
                    type="text"
                    value={empresaForm.nome}
                    onChange={(e) => setEmpresaForm({ ...empresaForm, nome: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={!isLoginMode}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isLoginMode ? 'E-mail ou CNPJ' : 'E-mail'}
                </label>
                <input
                  type={isLoginMode ? 'text' : 'email'}
                  value={isLoginMode ? (empresaForm.email || empresaForm.cnpj) : empresaForm.email}
                  onChange={(e) => {
                    if (isLoginMode) {
                      const value = e.target.value;
                      // Se contém @, é email, senão é CNPJ
                      if (value.includes('@')) {
                        setEmpresaForm({ ...empresaForm, email: value, cnpj: '' });
                      } else {
                        setEmpresaForm({ ...empresaForm, cnpj: value, email: '' });
                      }
                    } else {
                      setEmpresaForm({ ...empresaForm, email: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={isLoginMode ? 'Digite seu e-mail ou CNPJ' : 'empresa@exemplo.com'}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  value={empresaForm.senha}
                  onChange={(e) => setEmpresaForm({ ...empresaForm, senha: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                {isLoginMode ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsLoginMode(false)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Criar conta
                    </button>
                    <button
                      type="submit"
                      disabled={empresaLoading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {empresaLoading ? 'Carregando...' : 'Entrar'}
                    </button>
                  </>
                ) : (
                  <div className="w-full space-y-3">
                    <p className="text-sm text-gray-600 text-center">
                      Para cadastrar sua empresa, preencha o formulário completo
                    </p>
                    <Link
                      to="/empresa/cadastro"
                      className="w-full block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
                      onClick={() => setShowEmpresaModal(false)}
                    >
                      Ir para Cadastro Completo
                    </Link>
                    <button
                      type="button"
                      onClick={() => setIsLoginMode(true)}
                      className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Já tenho conta - Fazer Login
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Modal do Funcionário */}
      {showFuncionarioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Acesso Funcionário</h2>
                  <p className="text-sm text-gray-600">Entre com seus dados de funcionário</p>
                </div>
                <button
                  onClick={() => setShowFuncionarioModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleFuncionarioSubmit} className="p-6 space-y-4">
              {funcionarioError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {funcionarioError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID da Empresa
                </label>
                <input
                  type="text"
                  value={funcionarioForm.empresaId}
                  onChange={(e) => setFuncionarioForm({ ...funcionarioForm, empresaId: e.target.value })}
                  placeholder="Digite o ID da empresa"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Exemplo: emp_teste_001
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPF
                </label>
                <input
                  type="text"
                  value={funcionarioForm.cpf}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é número
                    setFuncionarioForm({ ...funcionarioForm, cpf: value });
                  }}
                  placeholder="00000000000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                  maxLength={11}
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={funcionarioLoading}
                  className="w-full px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 transition-colors"
                >
                  {funcionarioLoading ? 'Carregando...' : 'Acessar Agenda'}
                </button>
              </div>

              <div className="text-center text-sm text-gray-600">
                📋 Acesse sua agenda pessoal e visualize todos os seus agendamentos
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modern Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white py-12 md:py-16 px-4 mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold">AgendaPro</h3>
              </div>
              <p className="text-gray-300 text-sm md:text-base mb-4 leading-relaxed max-w-md">
                Revolucione sua agenda com tecnologia de ponta. 
                <span className="font-semibold text-white"> Rápido, seguro e intuitivo.</span>
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors duration-300">
                  <Facebook className="w-5 h-5 text-white" />
                </a>
                <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors duration-300">
                  <Instagram className="w-5 h-5 text-white" />
                </a>
                <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors duration-300">
                  <Twitter className="w-5 h-5 text-white" />
                </a>
                <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors duration-300">
                  <Linkedin className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Produto</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors duration-300">Recursos</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Integrações</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Suporte</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors duration-300">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Documentação</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Comunidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-300">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-6 md:pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-300">
                © 2024 AgendaPro. Todos os direitos reservados.
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-300">
                <a href="#" className="hover:text-white transition-colors duration-300">Política de Privacidade</a>
                <a href="#" className="hover:text-white transition-colors duration-300">Termos de Uso</a>
                <a href="#" className="hover:text-white transition-colors duration-300">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default AccessSelector;
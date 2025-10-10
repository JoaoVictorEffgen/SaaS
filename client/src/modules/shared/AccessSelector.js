import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, Users, ArrowRight, Calendar, Clock, Zap, Star, Crown,
  Users2, X, ClipboardList, ChevronLeft, ChevronRight, Facebook, Instagram, Twitter, Linkedin, Plus,
  Heart, Navigation
} from 'lucide-react';
import { useMySqlAuth } from '../../contexts/MySqlAuthContext';

const AccessSelector = () => {
  const [empresasDestaque, setEmpresasDestaque] = useState([]);
  
  // Estados dos modais
  const [showEmpresaModal, setShowEmpresaModal] = useState(false);
  const [showFuncionarioModal, setShowFuncionarioModal] = useState(false);
  const [showClienteModal, setShowClienteModal] = useState(false);
  
  // Debug: verificar estado do modal
  useEffect(() => {
    console.log('🔍 Estado do modal cliente:', showClienteModal);
  }, [showClienteModal]);

  
  // Estados do formulário de cliente
  const [clienteForm, setClienteForm] = useState({ 
    nome: '', 
    sobrenome: '', 
    email: '', 
    senha: '', 
    confirmarSenha: '',
    whatsapp: '' 
  });
  const [clienteError, setClienteError] = useState('');
  const [isCadastroMode, setIsCadastroMode] = useState(false);
  const [codigoConfirmacao, setCodigoConfirmacao] = useState('');
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [clienteLoading, setClienteLoading] = useState(false);
  const [metodoVerificacao, setMetodoVerificacao] = useState('whatsapp'); // 'whatsapp' ou 'sms'
  const [codigosGerados, setCodigosGerados] = useState({ whatsapp: '', sms: '' });
  
  // Estados para novas funcionalidades
  const [activeSection, setActiveSection] = useState('destaque'); // 'destaque', 'proximas', 'favoritas'
  const [allEmpresas, setAllEmpresas] = useState([]);
  const [isClientLoggedIn, setIsClientLoggedIn] = useState(false);
  const [empresaForm, setEmpresaForm] = useState({ email: '', senha: '', nome: '', telefone: '', endereco: '', cnpj: '' });
  const [funcionarioForm, setFuncionarioForm] = useState({ 
    companyIdentifier: '', // ID ou email da empresa
    identifier: '', // CPF ou email do funcionário
    senha: 'funcionario123' // Senha padrão para funcionários
  });
  const [empresaError, setEmpresaError] = useState('');
  const [funcionarioError, setFuncionarioError] = useState('');
  const [empresaLoading, setEmpresaLoading] = useState(false);
  const [funcionarioLoading, setFuncionarioLoading] = useState(false);
  const [currentBenefit, setCurrentBenefit] = useState(0);
  const [currentEmpresa, setCurrentEmpresa] = useState(0);
  

  
  const navigate = useNavigate();
  const { login, register, user } = useMySqlAuth();

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
    // Salvar empresa selecionada
    localStorage.setItem('empresaSelecionada', JSON.stringify(empresa));
    
    // Debug: verificar se modal está sendo chamado
    console.log('🔍 handleAgendarEmpresa chamado, mostrando modal de cliente');
    console.log('🔍 Estado atual do modal:', showClienteModal);
    
      // Forçar modal a aparecer
      setShowClienteModal(true);
      setClienteError('');
      setClienteForm({ nome: '', sobrenome: '', email: '', senha: '', confirmarSenha: '', whatsapp: '' });
      setIsCadastroMode(false);
      setCodigoEnviado(false);
      setCodigoConfirmacao('');
      setCodigosGerados({ whatsapp: '', sms: '' });
    
    // Verificar se o estado mudou
    setTimeout(() => {
      console.log('🔍 Estado do modal após setState:', showClienteModal);
    }, 100);
    
    console.log('✅ Modal de cliente deve estar visível agora');
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




  useEffect(() => {
    loadEmpresasDestaque();
    
    // Criar cliente de teste único com email diferente
    const clienteTeste = {
      id: 1,
      nome: 'João',
      sobrenome: 'Silva',
      email: 'cliente@teste.com',
      whatsapp: '11999999999',
      senha: '123456',
      tipo: 'cliente',
      favoritos: []
    };

    // Limpar qualquer currentUser existente primeiro
    localStorage.removeItem('currentUser');
    
    // Salvar cliente de teste no localStorage (sempre atualizar)
    localStorage.setItem('clientes', JSON.stringify([clienteTeste]));
    console.log('✅ Cliente de teste criado:', clienteTeste);
    
    // Verificar se há um cliente logado
    const clientLoggedIn = user && user.tipo === 'cliente';
    setIsClientLoggedIn(clientLoggedIn);
    
    // Se cliente logado, mostrar favoritas por padrão
    if (clientLoggedIn) {
      setActiveSection('favoritas');
    } else {
      setActiveSection('destaque');
    }
  }, [loadEmpresasDestaque, user]);

  const openEmpresaModal = () => {
    setShowEmpresaModal(true);
    setEmpresaError('');
    setEmpresaForm({ email: '', senha: '', nome: '', telefone: '', endereco: '', cnpj: '' });
  };


  const openFuncionarioModal = () => {
    setShowFuncionarioModal(true);
    setFuncionarioError('');
    setFuncionarioForm({ companyIdentifier: '', identifier: '', senha: 'funcionario123' });
  };

  const handleClienteLogin = async (e) => {
    e.preventDefault();
    setClienteError('');

    if (!clienteForm.email && !clienteForm.whatsapp) {
      setClienteError('Por favor, preencha o email ou WhatsApp.');
      return;
    }

    if (!clienteForm.senha) {
      setClienteError('Por favor, preencha a senha.');
      return;
    }

    // Validação de email se fornecido
    if (clienteForm.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(clienteForm.email)) {
        setClienteError('Por favor, insira um email válido.');
        return;
      }
    }

    // Validação de WhatsApp se fornecido
    if (clienteForm.whatsapp) {
      const whatsappNumbers = clienteForm.whatsapp.replace(/\D/g, '');
      if (whatsappNumbers.length < 10) {
        setClienteError('Por favor, insira um WhatsApp válido com pelo menos 10 dígitos.');
        return;
      }
    }

    try {
      setClienteLoading(true);
      
      // Usar o contexto de autenticação MySQL
      const identifier = clienteForm.email || clienteForm.whatsapp;
      const result = await login(identifier, clienteForm.senha, 'cliente');
      
      if (result.success) {
        console.log('✅ Login bem-sucedido:', result.user);
        
        // Fechar modal e navegar para lista de empresas
        setShowClienteModal(false);
        console.log('🚀 Navegando para /cliente');
        navigate('/cliente');
      } else {
        setClienteError(result.error || 'Email/WhatsApp ou senha incorretos.');
        // Fechar modal após 2 segundos em caso de erro
        setTimeout(() => {
          setShowClienteModal(false);
          setClienteError('');
        }, 2000);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setClienteError('Erro ao fazer login. Tente novamente.');
    } finally {
      setClienteLoading(false);
    }
  };

  const handleClienteCadastro = async (e) => {
    e.preventDefault();
    setClienteError('');

    // Validação obrigatória de todos os campos
    if (!clienteForm.nome || !clienteForm.sobrenome || !clienteForm.email || !clienteForm.senha || !clienteForm.confirmarSenha || !clienteForm.whatsapp) {
      setClienteError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clienteForm.email)) {
      setClienteError('Por favor, insira um email válido.');
      return;
    }

    // Validação de senha (mínimo 6 caracteres)
    if (clienteForm.senha.length < 6) {
      setClienteError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    // Validação de confirmação de senha
    if (clienteForm.senha !== clienteForm.confirmarSenha) {
      setClienteError('As senhas não coincidem. Tente novamente.');
      return;
    }

    // Validação de WhatsApp (mínimo 10 dígitos)
    const whatsappNumbers = clienteForm.whatsapp.replace(/\D/g, '');
    if (whatsappNumbers.length < 10) {
      setClienteError('Por favor, insira um WhatsApp válido com pelo menos 10 dígitos.');
      return;
    }

    try {
      setClienteLoading(true);
      
      // Verificar se email já existe
      const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
      const emailExiste = clientes.find(c => c.email === clienteForm.email);
      const whatsappExiste = clientes.find(c => c.whatsapp === clienteForm.whatsapp);
      
      if (emailExiste) {
        setClienteError('Este email já está em uso.');
        return;
      }
      
      if (whatsappExiste) {
        setClienteError('Este WhatsApp já está em uso.');
        return;
      }

      // Gerar códigos de confirmação para ambos os métodos
      const codigoWhatsApp = Math.floor(100000 + Math.random() * 900000).toString();
      const codigoSMS = Math.floor(100000 + Math.random() * 900000).toString();
      
      setCodigoConfirmacao('');
      setCodigoEnviado(true);
      setCodigosGerados({ whatsapp: codigoWhatsApp, sms: codigoSMS });
      
      // Simular envio dos códigos
      console.log(`📱 Código WhatsApp enviado para ${clienteForm.whatsapp}: ${codigoWhatsApp}`);
      console.log(`💬 Código SMS enviado para ${clienteForm.whatsapp}: ${codigoSMS}`);
      console.log(`🔑 Use qualquer um dos códigos acima para confirmar a conta`);
      
      // Salvar dados temporariamente
      localStorage.setItem('clienteTemp', JSON.stringify(clienteForm));
      localStorage.setItem('codigoWhatsApp', codigoWhatsApp);
      localStorage.setItem('codigoSMS', codigoSMS);
      
    } catch (error) {
      console.error('Erro no cadastro:', error);
      setClienteError('Erro ao criar conta. Tente novamente.');
    } finally {
      setClienteLoading(false);
    }
  };

  const handleConfirmarCodigo = async (e) => {
    e.preventDefault();
    setClienteError('');

    if (!codigoConfirmacao || codigoConfirmacao.length !== 6) {
      setClienteError('Por favor, digite o código de 6 dígitos.');
      return;
    }

    try {
      setClienteLoading(true);
      
      // Verificar código (aceita qualquer um dos dois)
      const clienteTemp = JSON.parse(localStorage.getItem('clienteTemp') || '{}');
      const codigoWhatsApp = localStorage.getItem('codigoWhatsApp');
      const codigoSMS = localStorage.getItem('codigoSMS');
      
      if (codigoConfirmacao === codigoWhatsApp || codigoConfirmacao === codigoSMS) {
        // Criar cliente
        const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
        const novoCliente = {
          id: Date.now(),
          nome: clienteTemp.nome,
          sobrenome: clienteTemp.sobrenome,
          email: clienteTemp.email,
          senha: clienteTemp.senha,
          whatsapp: clienteTemp.whatsapp,
          verificado: true,
          data_criacao: new Date().toISOString()
        };
        
        clientes.push(novoCliente);
        localStorage.setItem('clientes', JSON.stringify(clientes));
        
        // Limpar dados temporários
        localStorage.removeItem('clienteTemp');
        localStorage.removeItem('codigoWhatsApp');
        localStorage.removeItem('codigoSMS');
        
        // Login automático
        const userData = {
          id: novoCliente.id,
          nome: `${novoCliente.nome} ${novoCliente.sobrenome}`,
          email: novoCliente.email,
          whatsapp: novoCliente.whatsapp,
          tipo: 'cliente',
          plano: 'free'
        };

        await login(userData);
        setShowClienteModal(false);
        navigate('/cliente');
        
      } else {
        setClienteError('Código incorreto. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro na confirmação:', error);
      setClienteError('Erro ao confirmar código. Tente novamente.');
    } finally {
      setClienteLoading(false);
    }
  };

  const handleReenviarCodigo = () => {
    // Gerar novos códigos
    const codigoWhatsApp = Math.floor(100000 + Math.random() * 900000).toString();
    const codigoSMS = Math.floor(100000 + Math.random() * 900000).toString();
    
    setCodigosGerados({ whatsapp: codigoWhatsApp, sms: codigoSMS });
    
    // Simular reenvio
    console.log(`📱 Novo código WhatsApp: ${codigoWhatsApp}`);
    console.log(`💬 Novo código SMS: ${codigoSMS}`);
    
    // Salvar novos códigos
    localStorage.setItem('codigoWhatsApp', codigoWhatsApp);
    localStorage.setItem('codigoSMS', codigoSMS);
    
    // Limpar campo de código
    setCodigoConfirmacao('');
  };

  const handleEmpresaSubmit = async (e) => {
    e.preventDefault();
    setEmpresaLoading(true);
    setEmpresaError('');

    // Validações para login
    if (!empresaForm.email && !empresaForm.cnpj) {
      setEmpresaError('Por favor, preencha o email ou CNPJ.');
      setEmpresaLoading(false);
      return;
    }
    if (!empresaForm.senha) {
      setEmpresaError('Por favor, preencha a senha.');
      setEmpresaLoading(false);
      return;
    }

    // Validação de senha (mínimo 6 caracteres)
    if (empresaForm.senha.length < 6) {
      setEmpresaError('A senha deve ter pelo menos 6 caracteres.');
      setEmpresaLoading(false);
      return;
    }


    try {
      // Para login, usar email ou CNPJ
      const loginIdentifier = empresaForm.email || empresaForm.cnpj;
      console.log('🔐 Tentando login da empresa:', { loginIdentifier, senha: '***', tipo: 'empresa' });
      const result = await login(loginIdentifier, empresaForm.senha, 'empresa');
      console.log('🔐 Resultado do login da empresa:', result);

      if (result.success) {
        setShowEmpresaModal(false);
        navigate('/empresa/dashboard');
      } else {
        setEmpresaError(result.error || 'Erro no login');
        // Fechar modal após 2 segundos em caso de erro
        setTimeout(() => {
          setShowEmpresaModal(false);
          setEmpresaError('');
        }, 2000);
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

    // Validações
    if (!funcionarioForm.companyIdentifier) {
      setFuncionarioError('Por favor, preencha o ID ou email da empresa.');
      setFuncionarioLoading(false);
      return;
    }

    if (!funcionarioForm.identifier) {
      setFuncionarioError('Por favor, preencha o CPF ou email do funcionário.');
      setFuncionarioLoading(false);
      return;
    }

    if (!funcionarioForm.senha) {
      setFuncionarioError('Por favor, preencha a senha.');
      setFuncionarioLoading(false);
      return;
    }

    try {
      // Usar o contexto de autenticação MySQL com companyIdentifier
      const result = await login(
        funcionarioForm.identifier, 
        funcionarioForm.senha, 
        'funcionario',
        funcionarioForm.companyIdentifier
      );

      if (result.success) {
        console.log('✅ Login do funcionário bem-sucedido:', result.user);
        
        setShowFuncionarioModal(false);
        navigate('/funcionario/agenda');
      } else {
        setFuncionarioError(result.error || 'ID da empresa, CPF ou senha incorretos.');
        // Fechar modal após 2 segundos em caso de erro
        setTimeout(() => {
          setShowFuncionarioModal(false);
          setFuncionarioError('');
        }, 2000);
      }

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
        <div className="bg-gradient-to-r from-blue-300 via-green-300 to-blue-400 text-gray-800 py-16 px-4 relative overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              src="/eslogan.png" 
              alt="TimeFlow Logo" 
              className="w-full h-full object-cover opacity-20"
            />
          </div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/30 backdrop-blur-sm rounded-3xl mb-8 shadow-2xl border border-white/40">
                <img 
                  src="/pensativo.png" 
                  alt="Mascote Pensativo" 
                  className="w-16 h-16 object-contain"
                />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                AgendaPro
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-2 font-medium">Sistema de Agendamento Online</p>
              <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto px-4">
                Revolucione sua agenda com tecnologia de ponta. 
                <span className="font-semibold text-gray-800"> Rápido, seguro e intuitivo.</span>
              </p>
              
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
            <button 
              onClick={() => handleAgendarEmpresa({})}
              className="group block w-full"
            >
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
            </button>

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
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Empresas Próximas</h2>
              <p className="text-gray-600">Funcionalidade será implementada em breve</p>
            </div>
          </div>
        </div>
      )}

      {/* Seção de Empresas Favoritas */}
      {activeSection === 'favoritas' && (
        <div className="py-12 md:py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Empresas Favoritas</h2>
              <p className="text-gray-600">Funcionalidade será implementada em breve</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal da Empresa */}
      {showEmpresaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header Azul */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Login Empresa
                    </h3>
                    <p className="text-blue-200 text-sm">
                      Acesse sua conta empresarial
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEmpresaModal(false)}
                  className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            <form onSubmit={handleEmpresaSubmit} className="p-6 space-y-4">
              {empresaError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {empresaError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail ou CNPJ *
                </label>
                <input
                  type="text"
                  value={empresaForm.email || empresaForm.cnpj}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Se contém @, é email, senão é CNPJ
                    if (value.includes('@')) {
                      setEmpresaForm({ ...empresaForm, email: value, cnpj: '' });
                    } else {
                      setEmpresaForm({ ...empresaForm, cnpj: value, email: '' });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite seu e-mail ou CNPJ"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha *
                </label>
                <input
                  type="password"
                  value={empresaForm.senha}
                  onChange={(e) => setEmpresaForm({ ...empresaForm, senha: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>



              <div className="text-center text-sm text-gray-600 mb-4">
                <p className="mb-2">🏢 Acesse sua conta empresarial e gerencie seus negócios</p>
                <p className="text-xs bg-gray-100 p-2 rounded">
                  <strong>Credenciais de teste:</strong><br/>
                  Email: contato@barbeariamoderna.com<br/>
                  CNPJ: 12.345.678/0001-90<br/>
                  Senha: empresa123
                </p>
              </div>

              <div className="flex items-center justify-between pt-4">
                <Link
                  to="/empresa/cadastro"
                  className="bg-white text-blue-600 border border-blue-600 px-5 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-all duration-300 ease-in-out hover:bg-blue-50 hover:text-blue-800 hover:border-blue-800"
                  onClick={() => setShowEmpresaModal(false)}
                >
                  Criar conta
                </Link>
                <button
                  type="submit"
                  disabled={empresaLoading}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-all duration-300 ease-in-out hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {empresaLoading ? 'Entrando...' : 'Entrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal do Funcionário */}
      {showFuncionarioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            {/* Header Azul */}
            <div className="bg-gradient-to-r from-blue-300 to-blue-400 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <ClipboardList className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Login Funcionário</h3>
                        <p className="text-blue-200 text-sm">Acesse sua conta</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFuncionarioModal(false)}
                  className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
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
                  ID ou Email da Empresa
                </label>
                <input
                  type="text"
                  value={funcionarioForm.companyIdentifier}
                  onChange={(e) => setFuncionarioForm({ ...funcionarioForm, companyIdentifier: e.target.value })}
                  placeholder="Ex: barbeariamoderna1234 ou contato@empresa.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Para teste: jet@empresa.com (email da empresa) ou ID gerado automaticamente
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPF ou Email do Funcionário
                </label>
                <input
                  type="text"
                  value={funcionarioForm.identifier}
                  onChange={(e) => {
                    setFuncionarioForm({ ...funcionarioForm, identifier: e.target.value });
                  }}
                  placeholder="123.456.789-00 ou email@funcionario.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Para teste: 123.456.789-00
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  value={funcionarioForm.senha}
                  onChange={(e) => setFuncionarioForm({ ...funcionarioForm, senha: e.target.value })}
                  placeholder="Digite sua senha"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Para teste: funcionario123
                </p>
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
                <p className="mb-2">📋 Acesse sua agenda pessoal e visualize todos os seus agendamentos</p>
                <p className="text-xs bg-gray-100 p-2 rounded">
                  <strong>Credenciais de teste:</strong><br/>
                  ID Empresa: BarbeariaModerna1<br/>
                  CPF: 123.456.789-00<br/>
                  Senha: funcionario123
                </p>
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

      {/* Modal de Login do Cliente */}
      {showClienteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" style={{zIndex: 9999}}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            {/* Header Verde */}
            <div className="bg-gradient-to-r from-green-300 to-green-400 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Login Cliente</h3>
                    <p className="text-green-100 text-sm">Acesse sua conta</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowClienteModal(false)}
                  className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

               {!isCadastroMode ? (
                 // Formulário de Login
                 <form onSubmit={handleClienteLogin} className="p-6 space-y-4">
                   {clienteError && (
                     <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                       {clienteError}
                     </div>
                   )}

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       E-mail ou WhatsApp *
                     </label>
                     <input
                       type="text"
                       value={clienteForm.email || clienteForm.whatsapp}
                       onChange={(e) => {
                         const value = e.target.value;
                         if (value.includes('@')) {
                           setClienteForm({ ...clienteForm, email: value, whatsapp: '' });
                         } else {
                           setClienteForm({ ...clienteForm, whatsapp: value, email: '' });
                         }
                       }}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       placeholder="seu@email.com ou (11) 99999-9999"
                       required
                     />
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Senha *
                     </label>
                     <input
                       type="password"
                       value={clienteForm.senha}
                       onChange={(e) => setClienteForm({ ...clienteForm, senha: e.target.value })}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       placeholder="••••••••"
                       required
                     />
                   </div>

                   <div className="flex items-center justify-between pt-4">
                     <button
                       type="button"
                       onClick={() => setIsCadastroMode(true)}
                       className="bg-white text-green-600 border border-green-600 px-5 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-all duration-300 ease-in-out hover:bg-green-50 hover:text-green-800 hover:border-green-800"
                     >
                       Criar conta
                     </button>
                     <button
                       type="submit"
                       disabled={clienteLoading}
                       className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                     >
                       {clienteLoading ? 'Entrando...' : 'Entrar'}
                     </button>
                   </div>
                 </form>
               ) : !codigoEnviado ? (
                 // Formulário de Cadastro
                 <form onSubmit={handleClienteCadastro} className="p-6 space-y-4">
                   {clienteError && (
                     <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                       {clienteError}
                     </div>
                   )}

                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         Nome *
                       </label>
                       <input
                         type="text"
                         value={clienteForm.nome}
                         onChange={(e) => setClienteForm({ ...clienteForm, nome: e.target.value })}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                         placeholder="João"
                         required
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         Sobrenome *
                       </label>
                       <input
                         type="text"
                         value={clienteForm.sobrenome}
                         onChange={(e) => setClienteForm({ ...clienteForm, sobrenome: e.target.value })}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                         placeholder="Silva"
                         required
                       />
                     </div>
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       E-mail *
                     </label>
                     <input
                       type="email"
                       value={clienteForm.email}
                       onChange={(e) => setClienteForm({ ...clienteForm, email: e.target.value })}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       placeholder="seu@email.com"
                       required
                     />
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       WhatsApp *
                     </label>
                     <input
                       type="tel"
                       value={clienteForm.whatsapp}
                       onChange={(e) => setClienteForm({ ...clienteForm, whatsapp: e.target.value })}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       placeholder="(11) 99999-9999"
                       required
                     />
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Senha *
                     </label>
                     <input
                       type="password"
                       value={clienteForm.senha}
                       onChange={(e) => setClienteForm({ ...clienteForm, senha: e.target.value })}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       placeholder="••••••••"
                       required
                     />
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Confirmar Senha *
                     </label>
                     <input
                       type="password"
                       value={clienteForm.confirmarSenha}
                       onChange={(e) => setClienteForm({ ...clienteForm, confirmarSenha: e.target.value })}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       placeholder="••••••••"
                       required
                     />
                   </div>

                   <div className="flex items-center justify-between pt-4">
                     <button
                       type="button"
                       onClick={() => setIsCadastroMode(false)}
                       className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                     >
                       Já tenho conta
                     </button>
                     <button
                       type="submit"
                       disabled={clienteLoading}
                       className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                     >
                       {clienteLoading ? 'Enviando...' : 'Criar Conta'}
                     </button>
                   </div>
                 </form>
               ) : (
                 // Formulário de Confirmação
                 <form onSubmit={handleConfirmarCodigo} className="p-6 space-y-4">
                   <div className="text-center mb-4">
                     <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                       <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                       </svg>
                     </div>
                     <h4 className="text-lg font-semibold text-gray-900 mb-2">Confirme seu número</h4>
                     <p className="text-sm text-gray-600 mb-4">
                       Enviamos códigos de 6 dígitos para<br />
                       <span className="font-medium">{clienteForm.whatsapp}</span>
                     </p>
                     
                     {/* Opções de verificação */}
                     <div className="flex gap-4 justify-center mb-4">
                       <button
                         type="button"
                         onClick={() => setMetodoVerificacao('whatsapp')}
                         className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                           metodoVerificacao === 'whatsapp'
                             ? 'bg-green-100 text-green-700 border-2 border-green-300'
                             : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
                         }`}
                       >
                         📱 WhatsApp
                       </button>
                       <button
                         type="button"
                         onClick={() => setMetodoVerificacao('sms')}
                         className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                           metodoVerificacao === 'sms'
                             ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                             : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
                         }`}
                       >
                         💬 SMS
                       </button>
                     </div>
                     
                     <p className="text-xs text-gray-500">
                       Use qualquer um dos códigos enviados
                     </p>
                   </div>

                   {clienteError && (
                     <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                       {clienteError}
                     </div>
                   )}

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Código de confirmação
                     </label>
                     <input
                       type="text"
                       value={codigoConfirmacao}
                       onChange={(e) => setCodigoConfirmacao(e.target.value.replace(/\D/g, '').slice(0, 6))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                       placeholder="000000"
                       maxLength={6}
                       required
                     />
                   </div>

                   <div className="space-y-3">
                     <button
                       type="button"
                       onClick={handleReenviarCodigo}
                       className="w-full text-center text-green-600 hover:text-green-700 text-sm font-medium py-2"
                     >
                       Reenviar códigos
                     </button>
                     
                     <div className="flex items-center justify-between pt-2">
                       <button
                         type="button"
                         onClick={() => {
                           setCodigoEnviado(false);
                           setCodigoConfirmacao('');
                         }}
                         className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                       >
                         Voltar
                       </button>
                     <button
                       type="submit"
                       disabled={clienteLoading || codigoConfirmacao.length !== 6}
                       className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                     >
                       {clienteLoading ? 'Confirmando...' : 'Confirmar'}
                     </button>
                     </div>
                   </div>
                 </form>
               )}
          </div>
        </div>
      )}
      
      </div>
    </div>
  );
};

export default AccessSelector;
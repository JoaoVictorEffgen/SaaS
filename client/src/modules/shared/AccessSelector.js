import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, Users, ArrowRight, Calendar, Clock, Zap, Star, Crown,
  Users2, X, ClipboardList, ChevronLeft, ChevronRight, Facebook, Instagram, Twitter, Linkedin, Plus,
  Navigation
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
    whatsapp: '',
    metodoVerificacao: 'whatsapp' // 'whatsapp' ou 'sms'
  });
  const [clienteError, setClienteError] = useState('');
  const [isCadastroMode, setIsCadastroMode] = useState(false);
  const [codigoConfirmacao, setCodigoConfirmacao] = useState('');
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [clienteLoading, setClienteLoading] = useState(false);
  const [metodoVerificacao, setMetodoVerificacao] = useState('whatsapp'); // 'whatsapp' ou 'sms'
  const [codigosGerados, setCodigosGerados] = useState({ whatsapp: '', sms: '' });
  
  // Estados para novas funcionalidades
  const [activeSection, setActiveSection] = useState('destaque'); // 'destaque', 'proximas'
  const [allEmpresas, setAllEmpresas] = useState([]);
  const [isClientLoggedIn, setIsClientLoggedIn] = useState(false);
  const [empresaForm, setEmpresaForm] = useState({ email: '', senha: '', nome: '', telefone: '', endereco: '', cnpj: '' });
  const [funcionarioForm, setFuncionarioForm] = useState({ 
    companyIdentifier: '', // ID ou email da empresa
    identifier: '', // CPF ou email do funcionário
    senha: '' // Senha do funcionário
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
    
    // Limpar qualquer currentUser existente primeiro
    localStorage.removeItem('currentUser');
    
    // Verificar se há um cliente logado
    const clientLoggedIn = user && user.tipo === 'cliente';
    setIsClientLoggedIn(clientLoggedIn);
    
    // Sempre mostrar destaque por padrão na tela inicial
    setActiveSection('destaque');
  }, [loadEmpresasDestaque, user]);

  const openEmpresaModal = () => {
    setShowEmpresaModal(true);
    setEmpresaError('');
    setEmpresaForm({ email: '', senha: '', nome: '', telefone: '', endereco: '', cnpj: '' });
  };


  const openFuncionarioModal = () => {
    setShowFuncionarioModal(true);
    setFuncionarioError('');
    setFuncionarioForm({ companyIdentifier: '', identifier: '', senha: '' });
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
      if (clienteForm.metodoVerificacao === 'whatsapp') {
        console.log(`📱 Código WhatsApp enviado para ${clienteForm.whatsapp}: ${codigoWhatsApp}`);
        console.log(`🔑 Use o código WhatsApp acima para confirmar a conta`);
      } else {
        console.log(`💬 Código SMS enviado para ${clienteForm.whatsapp}: ${codigoSMS}`);
        console.log(`🔑 Use o código SMS acima para confirmar a conta`);
      }
      console.log(`⚠️ MODO TESTE: Códigos não são enviados realmente`);
      
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
        {/* Header com conteúdo TimeFlow - Com efeitos */}
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col items-center justify-center py-20 px-4 relative overflow-hidden">
          {/* Efeito de brilho de fundo */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5"></div>
          
          <div className="flex items-center mb-8 relative z-10">
            {/* Ícone TimeFlow com efeitos - Relógio Animado */}
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-teal-500 to-green-500 flex items-center justify-center mr-8 shadow-2xl hover:shadow-teal-500/50 transition-all duration-500 hover:scale-110 animate-pulse">
              {/* Relógio animado com ponteiros */}
              <div className="relative w-16 h-16">
                {/* Círculo do relógio */}
                <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
                
                {/* Ponteiro das horas */}
                <div 
                  className="absolute w-1 bg-white rounded-full origin-bottom"
                  style={{
                    height: '20px',
                    left: '50%',
                    top: '50%',
                    transform: 'translateX(-50%) translateY(-100%) rotate(0deg)',
                    animation: 'rotateHour 24s linear infinite'
                  }}
                ></div>
                
                {/* Ponteiro dos minutos */}
                <div 
                  className="absolute w-0.5 bg-white rounded-full origin-bottom"
                  style={{
                    height: '28px',
                    left: '50%',
                    top: '50%',
                    transform: 'translateX(-50%) translateY(-100%) rotate(0deg)',
                    animation: 'rotateMinute 20s linear infinite'
                  }}
                ></div>
                
                {/* Centro do relógio */}
                <div className="absolute w-2 h-2 bg-white rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                
                {/* Marcações das horas */}
                <div className="absolute inset-0">
                  {[12, 3, 6, 9].map((hour, index) => (
                    <div
                      key={hour}
                      className="absolute w-0.5 h-1 bg-white/60 rounded-full"
                      style={{
                        left: '50%',
                        top: '4px',
                        transform: `translateX(-50%) rotate(${index * 90}deg)`,
                        transformOrigin: '50% 28px'
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
            {/* Texto TimeFlow com efeitos */}
            <h1 className="text-8xl font-light bg-gradient-to-r from-teal-600 via-teal-500 to-green-600 bg-clip-text text-transparent drop-shadow-lg hover:scale-105 transition-transform duration-300 animate-pulse">
              TimeFlow
            </h1>
          </div>
          {/* Slogan com efeitos */}
          <p className="text-3xl text-gray-700 text-center max-w-3xl font-medium drop-shadow-sm hover:text-gray-900 transition-colors duration-300 animate-fade-in">
            Organize seu tempo. 
            <span className="font-bold bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent"> Potencialize seus resultados.</span>
          </p>
          
          {/* Efeito de partículas flutuantes */}
          <div className="absolute top-10 left-10 w-4 h-4 bg-teal-400 rounded-full opacity-60 animate-ping"></div>
          <div className="absolute top-20 right-20 w-3 h-3 bg-green-400 rounded-full opacity-50 animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-5 h-5 bg-teal-300 rounded-full opacity-40 animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-2 h-2 bg-green-300 rounded-full opacity-70 animate-ping"></div>
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
            
            <div className="relative max-w-6xl mx-auto">
              <div className="flex items-center justify-center gap-8">
                <button 
                  onClick={prevEmpresa}
                  className="p-4 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-all duration-300 hover:scale-110 border border-gray-200"
                  aria-label="Empresa anterior"
                >
                  <ChevronLeft className="w-7 h-7 text-gray-600" />
                </button>
                
                <div className="flex-1 max-w-2xl">
                    {/* Card com layout elegante e proporcional */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 aspect-[4/3]">
                      {/* Seção superior com gradiente */}
                      <div className="h-48 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute bottom-4 left-4">
                          <h3 className="text-white text-xl font-bold drop-shadow-lg">
                            {empresasDestaque[currentEmpresa]?.especializacao || 'Corte de Cabelo'}
                          </h3>
                        </div>
                      </div>
                      
                      {/* Seção inferior branca */}
                      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-3">
                          {/* Avaliação */}
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${
                                    i < Math.floor(empresasDestaque[currentEmpresa]?.avaliacao || 4.7) 
                                      ? 'text-yellow-400 fill-current' 
                                      : 'text-gray-300'
                                  }`} 
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600 font-medium">
                              {empresasDestaque[currentEmpresa]?.avaliacao.toFixed(1) || '4.7'} ({empresasDestaque[currentEmpresa]?.totalAvaliacoes || '25'} avaliações)
                            </span>
                          </div>
                          
                          {/* Horário */}
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Aberto até as 19:00</span>
                          </div>
                        </div>
                        
                        {/* Botão */}
                        <button
                          onClick={() => handleAgendarEmpresa(empresasDestaque[currentEmpresa])}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          Ver Serviços
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={nextEmpresa}
                    className="p-4 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-all duration-300 hover:scale-110 border border-gray-200"
                    aria-label="Próxima empresa"
                  >
                    <ChevronRight className="w-7 h-7 text-gray-600" />
                  </button>
                </div>
                
                <div className="flex justify-center gap-2 mt-6 md:mt-8 p-6">
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
      )}

      {/* Seção de Empresas Próximas */}
      {activeSection === 'proximas' && (
        <div className="py-12 md:py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
                <Navigation className="h-6 w-6 md:h-8 md:w-8 text-blue-500 animate-pulse" />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Empresas Próximas</h2>
                <Navigation className="h-6 w-6 md:h-8 md:w-8 text-blue-500 animate-pulse" />
              </div>
              <p className="text-base md:text-lg text-gray-600">Empresas próximas à sua localização</p>
            </div>
            
            <div className="relative max-w-6xl mx-auto">
              <div className="flex items-center justify-center gap-8">
                <button 
                  onClick={prevEmpresa}
                  className="p-4 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-all duration-300 hover:scale-110 border border-gray-200"
                  aria-label="Empresa anterior"
                >
                  <ChevronLeft className="w-7 h-7 text-gray-600" />
                </button>
                
                <div className="flex-1 max-w-2xl">
                    {/* Card com layout elegante e proporcional */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 aspect-[4/3]">
                      {/* Seção superior com gradiente */}
                      <div className="h-48 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute bottom-4 left-4">
                          <h3 className="text-white text-xl font-bold drop-shadow-lg">
                            {empresasDestaque[currentEmpresa]?.especializacao || 'Serviços Gerais'}
                          </h3>
                        </div>
                      </div>
                      
                      {/* Seção inferior branca */}
                      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-3">
                          {/* Avaliação */}
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${
                                    i < Math.floor(empresasDestaque[currentEmpresa]?.avaliacao || 4.5) 
                                      ? 'text-yellow-400 fill-current' 
                                      : 'text-gray-300'
                                  }`} 
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600 font-medium">
                              {empresasDestaque[currentEmpresa]?.avaliacao.toFixed(1) || '4.5'} ({empresasDestaque[currentEmpresa]?.totalAvaliacoes || '18'} avaliações)
                            </span>
                          </div>
                          
                          {/* Horário */}
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Aberto até as 18:00</span>
                          </div>
                        </div>
                        
                        {/* Botão */}
                        <button
                          onClick={() => handleAgendarEmpresa(empresasDestaque[currentEmpresa])}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          Ver Serviços
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={nextEmpresa}
                    className="p-4 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-all duration-300 hover:scale-110 border border-gray-200"
                    aria-label="Próxima empresa"
                  >
                    <ChevronRight className="w-7 h-7 text-gray-600" />
                  </button>
                </div>
                
                <div className="flex justify-center gap-2 mt-6 md:mt-8 p-6">
                  {Array.from({ length: Math.min(empresasDestaque.length, 6) }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentEmpresa(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentEmpresa 
                          ? 'bg-blue-500 scale-125' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Ir para empresa ${index + 1}`}
                    />
                  ))}
                </div>
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
                  <strong>Dados necessários:</strong><br/>
                  Email ou CNPJ da empresa<br/>
                  Senha da empresa
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
                  placeholder="ID da empresa ou email do dono"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
           <p className="text-xs text-gray-500 mt-1">
             Digite o ID da empresa ou o email do dono
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
                  placeholder="CPF ou email do funcionário"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Digite o CPF ou email do funcionário
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
                  Digite a senha do funcionário
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
                  <strong>Dados necessários:</strong><br/>
                  ID da empresa ou email do dono<br/>
                  CPF ou email do funcionário<br/>
                  Senha do funcionário
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
                       placeholder="Email ou WhatsApp"
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
                         placeholder="Nome"
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
                         placeholder="Sobrenome"
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
                       placeholder="Email"
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
                       placeholder="WhatsApp"
                       required
                     />
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Método de Verificação *
                     </label>
                     <div className="grid grid-cols-2 gap-3">
                       <button
                         type="button"
                         onClick={() => setClienteForm({ ...clienteForm, metodoVerificacao: 'whatsapp' })}
                         className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                           clienteForm.metodoVerificacao === 'whatsapp'
                             ? 'border-green-500 bg-green-50 text-green-700'
                             : 'border-gray-300 bg-white text-gray-700 hover:border-green-300'
                         }`}
                       >
                         <div className="flex items-center justify-center space-x-2">
                           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                             <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                           </svg>
                           <span>WhatsApp</span>
                         </div>
                       </button>
                       <button
                         type="button"
                         onClick={() => setClienteForm({ ...clienteForm, metodoVerificacao: 'sms' })}
                         className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                           clienteForm.metodoVerificacao === 'sms'
                             ? 'border-blue-500 bg-blue-50 text-blue-700'
                             : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                         }`}
                       >
                         <div className="flex items-center justify-center space-x-2">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                           </svg>
                           <span>SMS</span>
                         </div>
                       </button>
                     </div>
                     <p className="text-xs text-gray-500 mt-1">
                       {clienteForm.metodoVerificacao === 'whatsapp' 
                         ? '📱 Código será enviado via WhatsApp' 
                         : '💬 Código será enviado via SMS'
                       }
                     </p>
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
                       {clienteForm.metodoVerificacao === 'whatsapp' 
                         ? '📱 Código enviado via WhatsApp para'
                         : '💬 Código enviado via SMS para'
                       }<br />
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
                       ⚠️ MODO TESTE: Verifique o console do navegador para ver o código
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
import React, { useState, useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { Calendar, Users, ArrowLeft, MessageCircle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocalAuth } from '../../contexts/LocalAuthContext';
import WhatsAppChat from '../shared/WhatsAppChat';
import notificationService from '../../services/notificationService';

const AgendamentoEmpresa = () => {
  const { empresaId } = useParams();
  const { user } = useLocalAuth();
  
  const [empresa, setEmpresa] = useState(null);
  const [funcionarios, setFuncionarios] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [showWhatsAppChat, setShowWhatsAppChat] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  
  const [quickBooking, setQuickBooking] = useState({
    nome: user?.nome || '',
    telefone: user?.telefone || user?.whatsapp || '',
    data: '',
    hora: '',
    funcionario_id: '',
    servicos: [],
    recorrente: false,
    tipo_recorrencia: 'semanal',
    fim_recorrencia: ''
  });

  // Hooks para o calendário
  const [calendarioMes, setCalendarioMes] = useState(new Date().getMonth());
  const [calendarioAno, setCalendarioAno] = useState(new Date().getFullYear());

  // Todos os useEffect hooks devem vir antes de qualquer verificação condicional
  useEffect(() => {
    // Buscar dados da empresa
    const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
    const empresaEncontrada = empresas.find(emp => emp.id === empresaId);
    
    setEmpresa(empresaEncontrada);
    
    // Buscar funcionários e serviços da empresa
    const funcionariosEmpresa = JSON.parse(localStorage.getItem(`funcionarios_${empresaId}`) || '[]');
    setFuncionarios(funcionariosEmpresa);
    
    const servicosEmpresa = JSON.parse(localStorage.getItem(`servicos_${empresaId}`) || '[]');
    setServicos(servicosEmpresa);
  }, [empresaId]);

  // Atualizar campos do formulário quando o usuário for carregado
  useEffect(() => {
    console.log('🔍 AgendamentoEmpresa - user carregado:', user);
    if (user) {
      console.log('🔍 AgendamentoEmpresa - atualizando campos com:', {
        nome: user.nome,
        telefone: user.telefone,
        whatsapp: user.whatsapp
      });
      setQuickBooking(prev => ({
        ...prev,
        nome: user.nome || '',
        telefone: user.telefone || user.whatsapp || ''
      }));
    }
  }, [user]);

  // Fechar calendário ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCalendar && !event.target.closest('.calendar-container')) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  // Verificar se o usuário está logado DEPOIS de todos os hooks
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const gerarHorariosDisponiveis = () => {
    if (!empresa) return [];
    
    const horarios = [];
    const inicio = empresa.horario_inicio || '08:00';
    const fim = empresa.horario_fim || '18:00';
    
    const [inicioHora, inicioMin] = inicio.split(':').map(Number);
    const [fimHora, fimMin] = fim.split(':').map(Number);
    
    const inicioMinutos = inicioHora * 60 + inicioMin;
    const fimMinutos = fimHora * 60 + fimMin;
    
    for (let minutos = inicioMinutos; minutos < fimMinutos; minutos += 30) {
      const hora = Math.floor(minutos / 60);
      const min = minutos % 60;
      const horario = `${hora.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      
      // Verificar se o funcionário está disponível neste horário
      if (verificarDisponibilidadeFuncionario(horario)) {
        horarios.push(horario);
      }
    }
    
    return horarios;
  };

  const verificarDisponibilidadeFuncionario = (horario) => {
    const agendamentos = JSON.parse(localStorage.getItem('agendamentos') || '[]');
    const agendamentosHoje = agendamentos.filter(a => 
      a.data === quickBooking.data && 
      a.hora === horario && 
      a.empresa_id === empresaId &&
      a.status !== 'cancelado'
    );
    
    return agendamentosHoje.length === 0;
  };

  const verificarHorarioDisponivel = (horario) => {
    if (!empresa || !quickBooking.data || !quickBooking.funcionario_id) return false;
    
    const funcionarioSelecionado = funcionarios.find(f => f.id === quickBooking.funcionario_id);
    if (!funcionarioSelecionado) return false;
    
    const inicio = funcionarioSelecionado.horario_inicio || empresa.horario_inicio || '08:00';
    const fim = funcionarioSelecionado.horario_fim || empresa.horario_fim || '18:00';
    
    // Verificar se o horário está dentro do horário de funcionamento do funcionário
    if (horario < inicio || horario >= fim) return false;
    
    // Verificar intervalos do funcionário (ex: almoço 12:00-13:00)
    const intervalos = funcionarioSelecionado.intervalos || [];
    for (const intervalo of intervalos) {
      if (horario >= intervalo.inicio && horario < intervalo.fim) {
        return false; // Horário está em um intervalo (almoço, etc.)
      }
    }
    
    // Verificar se há agendamentos neste horário para este funcionário
    const agendamentos = JSON.parse(localStorage.getItem('agendamentos') || '[]');
    const agendamentosHorario = agendamentos.filter(a => 
      a.data === quickBooking.data && 
      a.hora === horario && 
      a.empresa_id === empresaId &&
      a.funcionario_id === quickBooking.funcionario_id &&
      a.status !== 'cancelado'
    );
    
    return agendamentosHorario.length === 0;
  };

  const buscarFuncionariosDisponiveis = () => {
    // Retornar todos os funcionários da empresa
    // A disponibilidade será verificada por horário específico
    return funcionarios;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!quickBooking.data || !quickBooking.hora || !quickBooking.funcionario_id || quickBooking.servicos.length === 0) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
      const novoAgendamento = {
      id: Date.now(),
        empresa_id: empresaId,
      cliente_nome: user.nome,
      cliente_email: user.email || `cliente_${Date.now()}@email.com`,
      cliente_telefone: user.telefone || user.whatsapp,
      data: quickBooking.data,
      hora: quickBooking.hora,
      funcionario_id: quickBooking.funcionario_id,
      servicos: quickBooking.servicos,
      status: 'agendado',
      observacoes: '',
      valor_total: quickBooking.servicos.reduce((total, servico) => total + (servico.preco || 0), 0),
        data_criacao: new Date().toISOString()
      };

    const agendamentos = JSON.parse(localStorage.getItem('agendamentos') || '[]');
    agendamentos.push(novoAgendamento);
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));

    // Enviar notificação
    const funcionario = funcionarios.find(f => f.id === quickBooking.funcionario_id);
    await notificationService.sendNewAppointmentNotification(
      novoAgendamento,
      empresa,
      funcionario,
      user
    );
    
    alert('Agendamento criado com sucesso!');
    
    // Reset form
    setQuickBooking({ 
      nome: user.nome,
      telefone: user.telefone || user.whatsapp,
      data: '', 
      hora: '', 
      funcionario_id: '', 
      servicos: [],
      recorrente: false,
      tipo_recorrencia: 'semanal',
      fim_recorrencia: ''
    });
  };

  const toggleServico = (servico) => {
    const servicosAtualizados = quickBooking.servicos.includes(servico)
      ? quickBooking.servicos.filter(s => s.id !== servico.id)
      : [...quickBooking.servicos, servico];
    
    setQuickBooking({ ...quickBooking, servicos: servicosAtualizados });
  };

  const calcularValorTotal = () => {
    return quickBooking.servicos.reduce((total, servico) => total + (servico.preco || 0), 0);
  };

  // Funções para o calendário
  const formatarDataParaExibicao = (data) => {
    if (!data) return '';
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR');
  };

  const obterDiasDoMes = (ano, mes) => {
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const primeiroDiaSemana = primeiroDia.getDay();
    
    const dias = [];
    
    // Adicionar dias vazios para alinhar o calendário
    for (let i = 0; i < primeiroDiaSemana; i++) {
      dias.push(null);
    }
    
    // Adicionar os dias do mês
    for (let dia = 1; dia <= diasNoMes; dia++) {
      dias.push(dia);
    }
    
    return dias;
  };

  const nomesMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const nomesDiasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const avancarMes = () => {
    if (calendarioMes === 11) {
      setCalendarioMes(0);
      setCalendarioAno(calendarioAno + 1);
    } else {
      setCalendarioMes(calendarioMes + 1);
    }
  };

  const voltarMes = () => {
    if (calendarioMes === 0) {
      setCalendarioMes(11);
      setCalendarioAno(calendarioAno - 1);
    } else {
      setCalendarioMes(calendarioMes - 1);
    }
  };

  const selecionarDia = (dia) => {
    if (dia) {
      const dataSelecionada = new Date(calendarioAno, calendarioMes, dia);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      // Só permite selecionar datas futuras
      if (dataSelecionada >= hoje) {
        const dataFormatada = dataSelecionada.toISOString().split('T')[0];
        setQuickBooking({ ...quickBooking, data: dataFormatada });
        setShowCalendar(false);
      }
    }
  };

  if (!empresa) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Empresa não encontrada</h2>
          <p className="text-gray-600 mb-6">A empresa solicitada não foi encontrada.</p>
          <Link 
            to="/cliente" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        </div>
            </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-gray-200">
        {/* Background da Logo */}
        {empresa.logo_url ? (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${empresa.logo_url})`,
              filter: 'brightness(0.3) blur(1px)',
              transform: 'scale(1.1)'
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-80" />
        )}
        
        {/* Overlay escuro para contraste */}
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        
        {/* Conteúdo do Header */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/cliente" 
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </Link>
              
              {/* Informações da Empresa */}
                  <div className="flex items-center space-x-3">
                {/* Logo pequena no canto */}
                {empresa.logo_url ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden shadow-lg border-2 border-white border-opacity-30">
                    <img
                      src={empresa.logo_url}
                      alt={`Logo ${empresa.nome}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg hidden">
                      {empresa.nome.charAt(0).toUpperCase()}
                    </div>
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg border-2 border-white border-opacity-30">
                    <span className="text-white font-bold text-lg">
                      {empresa.nome.charAt(0).toUpperCase()}
                    </span>
          </div>
        )}

                    <div>
                  <h1 className="text-3xl font-bold text-white drop-shadow-lg">{empresa.nome}</h1>
                  <p className="text-white text-opacity-90 drop-shadow-md">Agende seu atendimento</p>
                    </div>
                  </div>
            </div>
            
            <button
              onClick={() => setShowWhatsAppChat(true)}
              className="flex items-center px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-lg backdrop-blur-sm border border-white border-opacity-20"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              WhatsApp
            </button>
                </div>
              </div>
          </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header com ícone e título */}
          <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Escolha a data do seu atendimento</h2>
          <p className="text-gray-600">Clique na data para ver os horários disponíveis</p>
          </div>

        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Seção de Dados Pessoais */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              Seus dados
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                  placeholder="Seu nome completo"
                  value={user.nome}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-lg text-gray-700 cursor-not-allowed"
                      required
                    />
                <p className="text-sm text-gray-500 mt-1">Nome do seu perfil</p>
                  </div>
                  <div>
                    <input
                      type="tel"
                  placeholder="Seu telefone"
                  value={user.telefone || user.whatsapp}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-lg text-gray-700 cursor-not-allowed"
                      required
                    />
                <p className="text-sm text-gray-500 mt-1">Telefone do seu perfil</p>
              </div>
                  </div>
                </div>

          {/* Seção de Data */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              Selecione a data
            </label>
            <div className="relative calendar-container">
                    <input
                type="text"
                value={formatarDataParaExibicao(quickBooking.data)}
                onClick={() => setShowCalendar(!showCalendar)}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg cursor-pointer"
                placeholder="dd/mm/aaaa"
              />
              <button
                type="button"
                onClick={() => setShowCalendar(!showCalendar)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
              >
                <Calendar className="w-5 h-5 text-gray-400" />
              </button>
              
              {/* Mini Calendário */}
              {showCalendar && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4 w-full max-w-sm">
                  {/* Header do Calendário */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={voltarMes}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <h3 className="font-semibold text-gray-900">
                      {nomesMeses[calendarioMes]} {calendarioAno}
                    </h3>
                    <button
                      type="button"
                      onClick={avancarMes}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Dias da Semana */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {nomesDiasSemana.map((dia) => (
                      <div key={dia} className="text-center text-sm font-medium text-gray-500 py-2">
                        {dia}
                      </div>
                    ))}
                  </div>
                  
                  {/* Dias do Mês */}
                  <div className="grid grid-cols-7 gap-1">
                    {obterDiasDoMes(calendarioAno, calendarioMes).map((dia, index) => {
                      if (dia === null) {
                        return <div key={index} className="py-2"></div>;
                      }
                      
                      const dataSelecionada = new Date(calendarioAno, calendarioMes, dia);
                      const hoje = new Date();
                      hoje.setHours(0, 0, 0, 0);
                      const dataAtual = new Date(quickBooking.data);
                      const isSelecionado = dataSelecionada.getTime() === dataAtual.getTime();
                      const isPassado = dataSelecionada < hoje;
                      
                      return (
                        <button
                          key={dia}
                          type="button"
                          onClick={() => selecionarDia(dia)}
                          disabled={isPassado}
                          className={`py-2 text-sm rounded-lg transition-colors ${
                            isSelecionado
                              ? 'bg-blue-500 text-white'
                              : isPassado
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {dia}
                        </button>
                      );
                    })}
                  </div>
                  </div>
              )}
                  </div>
                </div>

          {/* Seção de Funcionário */}
          {quickBooking.data && (
            <div className="mb-8">
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                Selecione o funcionário
                  </label>
              <div className="relative">
                      <select
                  value={quickBooking.funcionario_id}
                  onChange={(e) => {
                    setQuickBooking({ 
                      ...quickBooking, 
                      funcionario_id: e.target.value,
                      hora: '', // Limpar horário selecionado ao trocar funcionário
                      servicos: [] // Limpar serviços selecionados ao trocar funcionário
                    });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg appearance-none"
                >
                  <option value="">Escolha um funcionário</option>
                  {buscarFuncionariosDisponiveis().map((funcionario) => (
                    <option key={funcionario.id} value={funcionario.id}>
                      {funcionario.nome}
                    </option>
                  ))}
                      </select>
                <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                )}

          {/* Seção de Horário */}
          {quickBooking.data && quickBooking.funcionario_id && (
            <div className="mb-8">
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                Selecione o horário
                  </label>
              <div className="grid grid-cols-4 gap-3">
                {gerarHorariosDisponiveis().map((horario) => {
                  const isDisponivel = verificarHorarioDisponivel(horario);
                  const isSelecionado = quickBooking.hora === horario;
                  
                  return (
                  <button
                      key={horario}
                      type="button"
                      onClick={() => {
                        if (isDisponivel) {
                          setQuickBooking({ 
                            ...quickBooking, 
                            hora: horario,
                            servicos: [] // Limpar serviços selecionados ao trocar horário
                          });
                        }
                      }}
                      disabled={!isDisponivel}
                      style={{ 
                        cursor: isDisponivel ? 'pointer' : 'not-allowed',
                        pointerEvents: isDisponivel ? 'auto' : 'none'
                      }}
                      className={`px-4 py-3 rounded-xl border-2 text-center font-medium transition-all ${
                        isSelecionado
                          ? 'bg-blue-500 text-white border-blue-500'
                          : isDisponivel
                          ? 'bg-green-50 text-green-700 border-green-200 hover:border-green-400 hover:bg-green-100 cursor-pointer'
                          : 'bg-red-50 text-red-400 border-red-200 cursor-not-allowed opacity-60'
                      }`}
                      title={
                        isDisponivel 
                          ? 'Horário disponível' 
                          : 'Horário indisponível'
                      }
                    >
                      {horario}
                  </button>
                  );
                })}
                </div>

              {/* Legenda */}
              <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-50 border-2 border-green-200 rounded"></div>
                  <span className="text-green-700">Disponível</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-50 border-2 border-red-200 rounded"></div>
                  <span className="text-red-400">Indisponível</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 border-2 border-blue-500 rounded"></div>
                  <span className="text-blue-500">Selecionado</span>
                </div>
              </div>
            </div>
          )}

          {/* Seção de Serviços */}
          {quickBooking.hora && (
            <div className="mb-8">
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                Selecione o serviço
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {servicos.map((servico) => (
                  <div
                    key={servico.id}
                    onClick={() => toggleServico(servico)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      quickBooking.servicos.some(s => s.id === servico.id)
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-900">{servico.nome}</h3>
                        <p className="text-sm text-gray-600">{servico.descricao}</p>
                        <p className="text-lg font-bold text-green-600">R$ {servico.preco?.toFixed(2) || '0,00'}</p>
                      </div>
                      {quickBooking.servicos.some(s => s.id === servico.id) && (
                        <CheckCircle className="w-6 h-6 text-blue-500" />
                      )}
                    </div>
                  </div>
                ))}
                    </div>
                  </div>
                )}

          {/* Seção de Resumo */}
          {quickBooking.servicos.length > 0 && (
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Resumo para Confirmar
              </label>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Data:</span>
                  <span className="font-semibold">{new Date(quickBooking.data).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Horário:</span>
                  <span className="font-semibold">{quickBooking.hora}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Funcionário:</span>
                  <span className="font-semibold">
                    {funcionarios.find(f => f.id === quickBooking.funcionario_id)?.nome || 'Não selecionado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Serviços:</span>
                  <span className="font-semibold text-right max-w-xs">
                    {quickBooking.servicos.map(s => s.nome).join(', ')}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold text-green-600 border-t pt-3">
                  <span>Total:</span>
                  <span>R$ {calcularValorTotal().toFixed(2)}</span>
                </div>
            </div>
          </div>
        )}

          {/* Botão de Confirmar */}
          {quickBooking.servicos.length > 0 && (
            <form onSubmit={handleSubmit}>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-xl text-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Confirmar Agendamento
              </button>
            </form>
          )}
        </div>
      </div>

      {/* WhatsApp Chat */}
      {showWhatsAppChat && (
        <WhatsAppChat
          isOpen={showWhatsAppChat}
          onClose={() => setShowWhatsAppChat(false)}
          empresa={empresa}
        />
      )}
    </div>
  );
};

export default AgendamentoEmpresa;

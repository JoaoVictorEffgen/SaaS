import React, { useState, useEffect } from 'react';
import { Link, useParams, Navigate, useNavigate } from 'react-router-dom';
import { Calendar, Users, ArrowLeft, MessageCircle, CheckCircle, ChevronLeft, ChevronRight, Navigation, X } from 'lucide-react';
import { useMySqlAuth } from '../../contexts/MySqlAuthContext';
import WhatsAppChat from '../shared/WhatsAppChat';
import CompanyLocation from '../../components/shared/CompanyLocation';

const AgendamentoEmpresa = () => {
  const { empresaId } = useParams();
  const { user } = useMySqlAuth();
  const navigate = useNavigate();
  
  const [empresa, setEmpresa] = useState(null);
  const [funcionarios, setFuncionarios] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [showWhatsAppChat, setShowWhatsAppChat] = useState(false);
  const [agendamentoConfirmado, setAgendamentoConfirmado] = useState(null);
  const [agendamentoStatus, setAgendamentoStatus] = useState('pendente'); // 'pendente' ou 'confirmado'
  const [showCalendar, setShowCalendar] = useState(false);
  const [lembreteReagendamento, setLembreteReagendamento] = useState(null);
  const [showLocation, setShowLocation] = useState(false);
  
  const [quickBooking, setQuickBooking] = useState({
    nome: user?.nome || '',
    telefone: user?.telefone || user?.whatsapp || '',
    data: '',
    hora: '',
    funcionario_id: '',
    servicos: []
  });

  // Estados para agendamento recorrente (após primeiro agendamento)
  const [showRecurringOptions, setShowRecurringOptions] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [recurringConfig, setRecurringConfig] = useState({
    ativo: false,
    total_agendamentos: 3, // 3, 5 ou 7
    tipo_recorrencia: 'semanal',
    dias_semana: [], // Para agendamento semanal
    dia_mes: 1, // Para agendamento mensal
    intervalo_dias: 15, // Para agendamento quinzenal
    agendamentos_concluidos: 0,
    proximo_agendamento: null
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

      // Verificar lembrete de reagendamento
      const lembrete = verificarLembreteReagendamento(user.id);
      if (lembrete.sugerir) {
        setLembreteReagendamento(lembrete);
      }
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Inicializar dia da semana quando o modal de recorrência for aberto
  useEffect(() => {
    if (showRecurringOptions && quickBooking.data && recurringConfig.tipo_recorrencia === 'semanal') {
      const dataSelecionada = new Date(quickBooking.data);
      const diaSemana = dataSelecionada.getDay();
      
      // Sempre atualizar o dia da semana baseado na data selecionada
      setRecurringConfig(prev => ({
        ...prev,
        dias_semana: [diaSemana]
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRecurringOptions, quickBooking.data, recurringConfig.tipo_recorrencia]);

  // Função para marcar agendamento como realizado e verificar série
  const marcarAgendamentoRealizado = (agendamentoId) => {
    const agendamentos = JSON.parse(localStorage.getItem(`agendamentos_${empresaId}`) || '[]');
    const agendamentoIndex = agendamentos.findIndex(a => a.id === agendamentoId);
    
    if (agendamentoIndex !== -1) {
      // Marcar como realizado
      agendamentos[agendamentoIndex].status = 'realizado';
      agendamentos[agendamentoIndex].data_conclusao = new Date().toISOString();
      
      // Salvar alterações
      localStorage.setItem(`agendamentos_${empresaId}`, JSON.stringify(agendamentos));
      
      // Verificar se é o último da série recorrente
      if (verificarUltimoAgendamentoRecorrente(agendamentoId)) {
        enviarNotificacaoSerieConcluida(agendamentos[agendamentoIndex]);
      }
    }
  };

  // Expor função globalmente para uso em outras partes do sistema
  useEffect(() => {
    window.marcarAgendamentoRealizado = marcarAgendamentoRealizado;
    return () => {
      delete window.marcarAgendamentoRealizado;
    };
  }, [empresaId, marcarAgendamentoRealizado]);

  // Verificar se o usuário está logado DEPOIS de todos os hooks
  console.log('🔍 AgendamentoEmpresa - Verificando usuário:', user);
  if (!user) {
    console.log('❌ AgendamentoEmpresa - Usuário não logado, redirecionando...');
    return <Navigate to="/" replace />;
  }
  
  console.log('✅ AgendamentoEmpresa - Usuário logado:', user);

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


  // Função para obter nome do dia da semana
  const getNomeDiaSemana = (numeroDia) => {
    const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return dias[numeroDia];
  };

  // Função para alternar dia da semana na seleção (apenas 1 dia)
  const toggleDiaSemana = (dia) => {
    setRecurringConfig(prev => ({
      ...prev,
      dias_semana: [dia] // Sempre substitui por apenas este dia
    }));
  };


  // Nova função para confirmar agendamento (primeiro agendamento normal)
  const handleConfirmarAgendamento = () => {
    // Validar campos obrigatórios
    if (!quickBooking.nome || !quickBooking.telefone || !quickBooking.data || 
        !quickBooking.hora || !quickBooking.funcionario_id || quickBooking.servicos.length === 0) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Criar o primeiro agendamento
    const novoAgendamento = {
      id: Date.now(),
      cliente_nome: quickBooking.nome,
      cliente_telefone: quickBooking.telefone,
      cliente_email: user.email,
      data: quickBooking.data,
      hora: quickBooking.hora,
      funcionario_id: quickBooking.funcionario_id,
      empresa_id: empresaId,
      servicos: quickBooking.servicos,
      valor_total: calcularValorTotal(),
      status: 'pendente',
      data_criacao: new Date().toISOString()
    };

    // Salvar agendamento
    const agendamentos = JSON.parse(localStorage.getItem(`agendamentos_${empresaId}`) || '[]');
    agendamentos.push(novoAgendamento);
    localStorage.setItem(`agendamentos_${empresaId}`, JSON.stringify(agendamentos));

    // Definir status como pendente
    setAgendamentoStatus('pendente');

    // Mostrar opções de recorrência
    setShowRecurringOptions(true);
  };

  // Função para calcular datas recorrentes para prévia
  const calcularDatasRecorrentes = () => {
    if (!quickBooking.data || !recurringConfig.total_agendamentos) return [];
    
    const datas = [];
    const dataBase = new Date(quickBooking.data + 'T00:00:00');
    
    // Para recorrência semanal, usar os dias selecionados
    if (recurringConfig.tipo_recorrencia === 'semanal' && recurringConfig.dias_semana?.length > 0) {
      // Ordenar os dias da semana selecionados
      const diasOrdenados = [...recurringConfig.dias_semana].sort((a, b) => a - b);
      
      // Começar da data base exata
      let dataAtual = new Date(dataBase);
      let contador = 0;
      
      // Gerar as datas baseadas no número total de agendamentos
      while (contador < recurringConfig.total_agendamentos) {
        const diaSemanaAtual = dataAtual.getDay();
        
        if (diasOrdenados.includes(diaSemanaAtual)) {
          datas.push(new Date(dataAtual));
          contador++;
        }
        
        // Avançar para o próximo dia
        dataAtual.setDate(dataAtual.getDate() + 1);
        
        // Evitar loop infinito (máximo 100 dias)
        if (contador === 0 && dataAtual.getTime() - dataBase.getTime() > 100 * 24 * 60 * 60 * 1000) {
          break;
        }
      }
    } else {
      // Para outros tipos de recorrência ou semanal sem dias selecionados
      for (let i = 0; i < recurringConfig.total_agendamentos; i++) {
        let proximaData = new Date(dataBase);
        
        switch (recurringConfig.tipo_recorrencia) {
          case 'semanal':
            proximaData.setDate(proximaData.getDate() + (7 * i));
            break;
          case 'quinzenal':
            proximaData.setDate(proximaData.getDate() + (15 * i));
            break;
          case 'mensal':
            proximaData.setMonth(proximaData.getMonth() + i);
            break;
          default:
            proximaData.setDate(proximaData.getDate() + (7 * i));
        }
        
        datas.push(proximaData);
      }
    }
    
    return datas;
  };

  // Função para confirmar recorrência e criar os agendamentos adicionais
  const handleConfirmarRecorrencia = () => {
    if (recurringConfig.total_agendamentos === 0) {
      alert('Por favor, selecione o número de agendamentos.');
      return;
    }

    // Criar agendamentos recorrentes
    const agendamentosRecorrentes = [];
    const dataBase = new Date(quickBooking.data);
    
    for (let i = 1; i < recurringConfig.total_agendamentos; i++) {
      let proximaData = new Date(dataBase);
      
      switch (recurringConfig.tipo_recorrencia) {
        case 'semanal':
          proximaData.setDate(proximaData.getDate() + (7 * i));
          break;
        case 'quinzenal':
          proximaData.setDate(proximaData.getDate() + (15 * i));
          break;
        case 'mensal':
          proximaData.setMonth(proximaData.getMonth() + i);
          break;
        default:
          proximaData.setDate(proximaData.getDate() + (7 * i));
      }

      const agendamentoRecorrente = {
        id: Date.now() + i,
        cliente_nome: quickBooking.nome,
        cliente_telefone: quickBooking.telefone,
        cliente_email: user.email,
        data: proximaData.toISOString().split('T')[0],
        hora: quickBooking.hora,
        funcionario_id: quickBooking.funcionario_id,
        empresa_id: empresaId,
        servicos: quickBooking.servicos,
        valor_total: calcularValorTotal(),
        status: 'pendente',
        data_criacao: new Date().toISOString(),
        recorrente: true,
        serie_recorrente_id: Date.now(), // ID para agrupar agendamentos da mesma série
        posicao_serie: i + 1,
        total_agendamentos: recurringConfig.total_agendamentos
      };

      agendamentosRecorrentes.push(agendamentoRecorrente);
    }

    // Salvar agendamentos recorrentes
    const agendamentos = JSON.parse(localStorage.getItem(`agendamentos_${empresaId}`) || '[]');
    agendamentos.push(...agendamentosRecorrentes);
    localStorage.setItem(`agendamentos_${empresaId}`, JSON.stringify(agendamentos));

    // Fechar modal e mostrar confirmação
    setShowRecurringOptions(false);
    setAgendamentoConfirmado({
      empresa_nome: empresa.nome,
      data: new Date(quickBooking.data + 'T00:00:00').toLocaleDateString('pt-BR'),
      hora: quickBooking.hora,
      servicos: quickBooking.servicos.map(s => s.nome).join(', '),
      valor_total: calcularValorTotal(),
      recorrente: true,
      total_agendamentos: recurringConfig.total_agendamentos,
      agendamentos_criados: recurringConfig.total_agendamentos
    });
  };

  // Função para verificar se deve sugerir reagendamento após 5 conclusões
  const verificarLembreteReagendamento = (clienteId) => {
    const agendamentos = JSON.parse(localStorage.getItem('agendamentos') || '[]');
    const agendamentosCliente = agendamentos.filter(ag => 
      ag.cliente_email === user.email && ag.status === 'realizado'
    );
    
    // Se o cliente tem 5 ou mais agendamentos realizados, sugerir reagendamento
    if (agendamentosCliente.length >= 5) {
      const ultimoAgendamento = agendamentosCliente[agendamentosCliente.length - 1];
      const diasDesdeUltimo = Math.floor(
        (new Date() - new Date(ultimoAgendamento.data)) / (1000 * 60 * 60 * 24)
      );
      
      // Se passou mais de 7 dias desde o último agendamento, sugerir reagendamento
      if (diasDesdeUltimo > 7) {
        return {
          sugerir: true,
          diasDesdeUltimo,
          totalRealizados: agendamentosCliente.length
        };
      }
    }
    
    return { sugerir: false };
  };

  const verificarDisponibilidadeFuncionario = (horario) => {
    const agendamentos = JSON.parse(localStorage.getItem('agendamentos') || '[]');
    const agendamentosEmpresa = JSON.parse(localStorage.getItem(`agendamentos_${empresaId}`) || '[]');
    
    // Combinar agendamentos de ambas as chaves para verificação completa
    const todosAgendamentos = [...agendamentos, ...agendamentosEmpresa];
    
    // Remover duplicatas baseado no ID
    const agendamentosUnicos = todosAgendamentos.filter((agendamento, index, self) => 
      index === self.findIndex(a => a.id === agendamento.id)
    );
    
    const agendamentosHoje = agendamentosUnicos.filter(a => 
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
    const agendamentosEmpresa = JSON.parse(localStorage.getItem(`agendamentos_${empresaId}`) || '[]');
    
    // Combinar agendamentos de ambas as chaves para verificação completa
    const todosAgendamentos = [...agendamentos, ...agendamentosEmpresa];
    
    // Remover duplicatas baseado no ID
    const agendamentosUnicos = todosAgendamentos.filter((agendamento, index, self) => 
      index === self.findIndex(a => a.id === agendamento.id)
    );
    
    const agendamentosHorario = agendamentosUnicos.filter(a => 
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

  // Função para enviar notificações
  const enviarNotificacoes = async (agendamento, empresa, funcionario, cliente) => {
    try {
      console.log('📱 Enviando notificações...');
      
      // 1. Notificação para a empresa
      const notificacaoEmpresa = {
        id: Date.now(),
        tipo: 'novo_agendamento',
        titulo: 'Novo Agendamento',
        mensagem: `Novo agendamento para ${cliente.nome} em ${new Date(agendamento.data).toLocaleDateString('pt-BR')} às ${agendamento.hora}`,
        empresa_id: empresa.id,
        agendamento_id: agendamento.id,
        data: new Date().toISOString(),
        lida: false
      };
      
      // Salvar notificação da empresa
      const notificacoesEmpresa = JSON.parse(localStorage.getItem('notificacoes_empresa') || '[]');
      notificacoesEmpresa.push(notificacaoEmpresa);
      localStorage.setItem('notificacoes_empresa', JSON.stringify(notificacoesEmpresa));
      
      // 2. Notificação para o funcionário
      const notificacaoFuncionario = {
        id: Date.now() + 1,
        tipo: 'novo_agendamento',
        titulo: 'Novo Agendamento',
        mensagem: `Você tem um novo agendamento com ${cliente.nome} em ${new Date(agendamento.data).toLocaleDateString('pt-BR')} às ${agendamento.hora}`,
        funcionario_id: funcionario.id,
        empresa_id: empresa.id,
        agendamento_id: agendamento.id,
        data: new Date().toISOString(),
        lida: false
      };
      
      // Salvar notificação do funcionário
      const notificacoesFuncionario = JSON.parse(localStorage.getItem('notificacoes_funcionario') || '[]');
      notificacoesFuncionario.push(notificacaoFuncionario);
      localStorage.setItem('notificacoes_funcionario', JSON.stringify(notificacoesFuncionario));
      
      // 3. Notificação via WhatsApp para o cliente
      const mensagemWhatsApp = `🎉 *Agendamento Confirmado!*\n\n` +
        `📅 *Data:* ${new Date(agendamento.data).toLocaleDateString('pt-BR')}\n` +
        `⏰ *Horário:* ${agendamento.hora}\n` +
        `🏢 *Empresa:* ${empresa.nome}\n` +
        `👤 *Funcionário:* ${funcionario.nome}\n` +
        `🛠️ *Serviços:* ${agendamento.servicos.map(s => s.nome).join(', ')}\n` +
        `💰 *Total:* R$ ${agendamento.valor_total.toFixed(2)}\n\n` +
        `✅ Seu agendamento foi confirmado com sucesso!`;
      
      // Abrir WhatsApp com a mensagem
      if (cliente.whatsapp || cliente.telefone) {
        const telefone = (cliente.whatsapp || cliente.telefone).replace(/\D/g, '');
        const whatsappLink = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagemWhatsApp)}`;
        window.open(whatsappLink, '_blank');
      }
      
      console.log('✅ Notificações enviadas com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro ao enviar notificações:', error);
    }
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

  const calcularTempoTotal = () => {
    return quickBooking.servicos.reduce((total, servico) => total + (servico.duracao || 0), 0);
  };

  // Função para verificar se é o último agendamento da série recorrente
  const verificarUltimoAgendamentoRecorrente = (agendamentoId) => {
    const agendamentos = JSON.parse(localStorage.getItem(`agendamentos_${empresaId}`) || '[]');
    const agendamento = agendamentos.find(a => a.id === agendamentoId);
    
    if (!agendamento || !agendamento.serie_recorrente_id) {
      return false;
    }

    // Buscar todos os agendamentos da mesma série
    const agendamentosSerie = agendamentos.filter(a => 
      a.serie_recorrente_id === agendamento.serie_recorrente_id && 
      a.status === 'realizado'
    );

    // Se todos os agendamentos da série foram concluídos
    return agendamentosSerie.length === agendamento.total_agendamentos;
  };

  // Função para enviar notificação de conclusão da série
  const enviarNotificacaoSerieConcluida = (agendamento) => {
    const notificacao = {
      id: Date.now(),
      tipo: 'serie_concluida',
      titulo: '🎉 Série de Agendamentos Concluída!',
      mensagem: `Parabéns! Você concluiu todos os ${agendamento.total_agendamentos} agendamentos da sua série recorrente. Obrigado pela confiança!`,
      data: new Date().toISOString(),
      lida: false,
      agendamento_id: agendamento.id,
      empresa_id: empresaId
    };

    // Salvar notificação
    const notificacoes = JSON.parse(localStorage.getItem(`notificacoes_${user.id}`) || '[]');
    notificacoes.unshift(notificacao);
    localStorage.setItem(`notificacoes_${user.id}`, JSON.stringify(notificacoes));

    // Disparar evento para atualizar contadores
    window.dispatchEvent(new CustomEvent('notificacaoNova', { detail: notificacao }));

    // Enviar WhatsApp (opcional)
    if (user.telefone || user.whatsapp) {
      const telefone = (user.whatsapp || user.telefone).replace(/\D/g, '');
      const mensagemWhatsApp = `🎉 *Parabéns!*\n\nVocê concluiu todos os ${agendamento.total_agendamentos} agendamentos da sua série recorrente na ${empresa.nome}!\n\nObrigado pela confiança em nossos serviços! 🙏\n\nGostaria de agendar uma nova série?`;
      const whatsappLink = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagemWhatsApp)}`;
      window.open(whatsappLink, '_blank');
    }
  };



  // Funções para o calendário
  const formatarDataParaExibicao = (data) => {
    if (!data) return '';
    // Formato direto sem problemas de timezone
    const partes = data.split('-');
    if (partes.length === 3) {
      const [ano, mes, dia] = partes;
      return `${dia}/${mes}/${ano}`;
    }
    return data;
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
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const dataSelecionada = new Date(calendarioAno, calendarioMes, dia);
      
      // Só permite selecionar datas futuras
      if (dataSelecionada >= hoje) {
        // Formato direto sem problemas de timezone
        const anoStr = calendarioAno.toString();
        const mesStr = String(calendarioMes + 1).padStart(2, '0');
        const diaStr = String(dia).padStart(2, '0');
        const dataFormatada = `${anoStr}-${mesStr}-${diaStr}`;
        
        console.log('📅 Dia clicado:', dia, 'Mês:', calendarioMes, 'Ano:', calendarioAno);
        console.log('📅 Data formatada:', dataFormatada);
        
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
      {/* Header Moderno com Design Aprimorado */}
      <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 overflow-hidden min-h-[140px] border-b border-gray-700">
        {/* Background Pattern Sutil */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }} />
        </div>
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-black/40" />
        
        {/* Conteúdo do Header */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Lado Esquerdo - Navegação e Info da Empresa */}
            <div className="flex items-center space-x-4">
              {/* Botão Voltar */}
              <Link 
                to="/cliente" 
                className="group p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/30 shadow-lg"
                title="Voltar"
              >
                <ArrowLeft className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              </Link>
              
              {/* Logo e Info da Empresa */}
              <div className="flex items-center space-x-4">
                {/* Logo da Empresa */}
                {empresa.logo_url ? (
                  <div className="relative group">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-2xl border-3 border-white/30 bg-white/10 backdrop-blur-sm">
                      <img
                        src={empresa.logo_url}
                        alt={`Logo ${empresa.nome}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl hidden">
                        {empresa.nome.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    {/* Efeito de brilho */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl border-3 border-white/30 backdrop-blur-sm">
                    <span className="text-white font-bold text-xl">
                      {empresa.nome.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Informações da Empresa */}
                <div className="text-white">
                  <h1 className="text-2xl font-bold mb-1 drop-shadow-lg tracking-tight">
                    {empresa.nome}
                  </h1>
                  <p className="text-white/80 text-sm font-medium drop-shadow-md">
                    Agende seu atendimento
                  </p>
                </div>
              </div>
            </div>

            {/* Lado Direito - Ações */}
            <div className="flex items-center space-x-3">
              {/* Botão Localização */}
              <button
                onClick={() => setShowLocation(true)}
                className="group p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/30 shadow-lg"
                title="Ver localização"
              >
                <Navigation className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              </button>

              {/* Botão WhatsApp */}
              <button
                onClick={() => setShowWhatsAppChat(true)}
                className="group flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-xl hover:shadow-2xl border border-green-400/30 hover:border-green-300/50 backdrop-blur-sm"
              >
                <MessageCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                <span className="font-semibold">WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        {/* Linha decorativa inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Lembrete de Reagendamento */}
        {lembreteReagendamento && (
          <div className="mb-6 bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-300 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">🎉</div>
                <div>
                  <h3 className="font-bold text-orange-800">Cliente VIP!</h3>
                  <p className="text-orange-700 text-sm">
                    Você já realizou {lembreteReagendamento.totalRealizados} agendamentos conosco! 
                    Que tal marcar um novo serviço? Faz {lembreteReagendamento.diasDesdeUltimo} dias desde seu último agendamento.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setLembreteReagendamento(null)}
                className="text-orange-600 hover:text-orange-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}

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
                        return <div key={`empty-${index}`} className="py-2"></div>;
                      }
                      
                      const hoje = new Date();
                      hoje.setHours(0, 0, 0, 0);
                      const dataSelecionada = new Date(calendarioAno, calendarioMes, dia);
                      
                      // Formato direto para comparação
                      const anoStr = calendarioAno.toString();
                      const mesStr = String(calendarioMes + 1).padStart(2, '0');
                      const diaStr = String(dia).padStart(2, '0');
                      const dataFormatada = `${anoStr}-${mesStr}-${diaStr}`;
                      
                      const isSelecionado = quickBooking.data === dataFormatada;
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
                  <span className="font-semibold">{new Date(quickBooking.data + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
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
                <div className="flex justify-between">
                  <span className="text-gray-600">Tempo total:</span>
                  <span className="font-semibold">{calcularTempoTotal()} minutos</span>
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
            <button
                onClick={handleConfirmarAgendamento}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-xl text-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
                Confirmar Agendamento
            </button>
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

      {/* Modal de Localização */}
      {showLocation && empresa && (
        <CompanyLocation 
          empresa={empresa} 
          onClose={() => setShowLocation(false)} 
        />
      )}

      {/* Modal de Opções Recorrentes */}
      {showRecurringOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {agendamentoStatus === 'pendente' ? 'Agendamento Aguardando Confirmação!' : 'Agendamento Confirmado!'}
                    </h3>
                    <p className="text-green-200 text-sm">
                      {agendamentoStatus === 'pendente' 
                        ? 'Tornar este agendamento recorrente?' 
                        : 'Tornar este agendamento recorrente?'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowRecurringOptions(false);
                  }}
                  className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {agendamentoStatus === 'pendente' 
                    ? 'Agendamento Criado com Sucesso!' 
                    : 'Agendamento Confirmado!'}
                </h4>
                <p className="text-gray-600">
                  {agendamentoStatus === 'pendente'
                    ? 'Seu agendamento foi criado e está aguardando confirmação. Deseja tornar este agendamento recorrente?'
                    : 'Agendamento confirmado! Deseja tornar este agendamento recorrente?'}
                </p>
              </div>

              {/* Opções de Recorrência */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de agendamentos (3, 5 ou 7)
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[3, 5, 7].map(num => (
                      <button
                        key={num}
                        onClick={() => setRecurringConfig(prev => ({ ...prev, total_agendamentos: num }))}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          recurringConfig.total_agendamentos === num
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-lg font-bold">{num}</div>
                          <div className="text-xs">agendamentos</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de recorrência
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'semanal', label: 'Semanal', icon: '📅' },
                      { value: 'quinzenal', label: 'Quinzenal', icon: '📆' },
                      { value: 'mensal', label: 'Mensal', icon: '🗓️' }
                    ].map(tipo => (
                      <button
                        key={tipo.value}
                        onClick={() => setRecurringConfig(prev => ({ ...prev, tipo_recorrencia: tipo.value }))}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          recurringConfig.tipo_recorrencia === tipo.value
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-lg mb-1">{tipo.icon}</div>
                          <div className="text-sm font-medium">{tipo.label}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dias da Semana (para recorrência semanal) */}
                {recurringConfig.tipo_recorrencia === 'semanal' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dia da semana
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 1, label: 'Seg' },
                        { value: 2, label: 'Ter' },
                        { value: 3, label: 'Qua' },
                        { value: 4, label: 'Qui' },
                        { value: 5, label: 'Sex' },
                        { value: 6, label: 'Sáb' },
                        { value: 0, label: 'Dom' }
                      ].map(dia => (
                        <button
                          key={dia.value}
                          onClick={() => toggleDiaSemana(dia.value)}
                          className={`p-2 rounded-lg text-sm font-medium transition-all ${
                            recurringConfig.dias_semana?.includes(dia.value)
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {dia.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Preview das Datas */}
              {quickBooking.data && quickBooking.hora && recurringConfig.total_agendamentos > 0 && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Prévia dos Agendamentos:</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {calcularDatasRecorrentes().map((data, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Agendamento {index + 1}:
                        </span>
                        <span className="font-medium">
                          {data.toLocaleDateString('pt-BR')} às {quickBooking.hora}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="space-y-3 pt-4">
                <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setShowSummary(true);
                  }}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Ver Resumo (Apenas Este)
                </button>
                <button
                  onClick={handleConfirmarRecorrencia}
                  disabled={recurringConfig.total_agendamentos === 0}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {agendamentoStatus === 'pendente' ? 'Tornar Recorrente (Pendente)' : 'Tornar Recorrente'}
                </button>
                </div>
                
                {/* Botão de Confirmação */}
                <button
                  onClick={() => {
                    setShowRecurringOptions(false);
                    setAgendamentoConfirmado({
                      empresa_nome: empresa.nome,
                      data: new Date(quickBooking.data + 'T00:00:00').toLocaleDateString('pt-BR'),
                      hora: quickBooking.hora,
                      servicos: quickBooking.servicos.map(s => s.nome).join(', '),
                      valor_total: calcularValorTotal(),
                      status: agendamentoStatus
                    });
                  }}
                  className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-lg"
                >
                  ✅ Confirmar Agendamento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Resumo (Apenas Este) */}
      {showSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Resumo do Agendamento</h3>
                    <p className="text-blue-200 text-sm">Confira os detalhes antes de confirmar</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSummary(false)}
                  className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Agendamento Único
                </h4>
                <p className="text-gray-600">
                  Este é um agendamento único, não recorrente.
                </p>
              </div>

              {/* Resumo do Agendamento */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h5 className="font-semibold text-gray-900 mb-3">📋 Detalhes do Agendamento:</h5>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">📅 Data:</span>
                  <span className="font-medium">
                    {new Date(quickBooking.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">🕐 Horário:</span>
                  <span className="font-medium">{quickBooking.hora}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">👨‍💼 Funcionário:</span>
                  <span className="font-medium">
                    {funcionarios.find(f => f.id === quickBooking.funcionario_id)?.nome || 'Não selecionado'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">🛠️ Serviços:</span>
                  <span className="font-medium text-right max-w-48">
                    {quickBooking.servicos.map(s => s.nome).join(', ')}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">⏱️ Tempo total:</span>
                  <span className="font-medium">{calcularTempoTotal()} minutos</span>
                </div>
                
                <div className="flex justify-between items-center border-t pt-3">
                  <span className="text-gray-600 font-semibold">💰 Valor Total:</span>
                  <span className="font-bold text-green-600 text-lg">
                    R$ {calcularValorTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                <button
                  onClick={() => setShowSummary(false)}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={() => {
                    setShowSummary(false);
                    setShowRecurringOptions(false);
                    setAgendamentoConfirmado({
                      empresa_nome: empresa.nome,
                      data: new Date(quickBooking.data + 'T00:00:00').toLocaleDateString('pt-BR'),
                      hora: quickBooking.hora,
                      servicos: quickBooking.servicos.map(s => s.nome).join(', '),
                      valor_total: calcularValorTotal(),
                      status: agendamentoStatus
                    });
                  }}
                  className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  ✅ Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resumo Destacado após Confirmação */}
      {agendamentoConfirmado && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform border-2 border-green-200">
            {/* Header */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-teal-700 mb-2">🎉 SUCESSO!</h3>
              <p className="text-gray-700 font-semibold">Agendamento Confirmado</p>
              <div className="w-20 h-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mx-auto mt-2"></div>
            </div>
            
            {/* Card de Resumo */}
            <div className="bg-gradient-to-b from-green-50 to-green-100 rounded-xl p-4 mb-6 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                📋 {(agendamentoConfirmado.recorrente || false) ? 'Resumo dos Agendamentos' : 
                    (agendamentoConfirmado.status === 'pendente' ? 'Resumo do Agendamento (Aguardando Confirmação)' : 'Resumo do Agendamento')}
              </h4>
              
              {(agendamentoConfirmado.recorrente || false) && (
                <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-center">
                    <span className="text-blue-800 font-semibold">
                      🔄 {agendamentoConfirmado.agendamentos_criados || 0} agendamentos criados automaticamente!
                    </span>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-green-50 rounded-lg p-3">
                  <span className="text-gray-700 flex items-center">📅 <span className="ml-2">Data:</span></span>
                  <span className="font-bold text-gray-900">{new Date(agendamentoConfirmado.data).toLocaleDateString('pt-BR')}</span>
                </div>
                
                <div className="flex justify-between items-center bg-green-50 rounded-lg p-3">
                  <span className="text-gray-700 flex items-center">⏰ <span className="ml-2">Horário:</span></span>
                  <span className="font-bold text-gray-900">{agendamentoConfirmado.hora}</span>
                  </div>
                
                <div className="flex justify-between items-center bg-green-50 rounded-lg p-3">
                  <span className="text-gray-700 flex items-center">🏢 <span className="ml-2">Empresa:</span></span>
                  <span className="font-bold text-gray-900 text-right">{agendamentoConfirmado.empresa_nome}</span>
                  </div>
                
                <div className="flex justify-between items-center bg-green-50 rounded-lg p-3">
                  <span className="text-gray-700 flex items-center">👤 <span className="ml-2">Funcionário:</span></span>
                  <span className="font-bold text-gray-900">{agendamentoConfirmado.funcionario_nome}</span>
                </div>

                <div className="flex justify-between items-center bg-green-50 rounded-lg p-3">
                  <span className="text-gray-700 flex items-center">🛠️ <span className="ml-2">Serviços:</span></span>
                  <span className="font-bold text-gray-900 text-right">
                    {Array.isArray(agendamentoConfirmado.servicos) 
                      ? agendamentoConfirmado.servicos.map(s => s.nome).join(', ')
                      : agendamentoConfirmado.servicos || 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-green-200 rounded-lg p-4 border border-green-300">
                  <span className="font-bold text-green-700 flex items-center">💰 <span className="ml-2">Total:</span></span>
                  <span className="text-xl font-bold text-green-600">R$ {(agendamentoConfirmado.valor_total || 0).toFixed(2)}</span>
                </div>

                {/* Informações sobre agendamentos recorrentes */}
                {(agendamentoConfirmado.total_recorrentes || 0) > 1 && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mt-4">
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-2xl mr-2">🔄</span>
                      <span className="font-bold text-blue-700">Agendamento Recorrente</span>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-blue-600 font-medium">
                        {agendamentoConfirmado.total_recorrentes || 0} agendamentos criados
                      </p>
                      <p className="text-sm text-blue-500">
                        Tipo: {agendamentoConfirmado.tipo_recorrencia === 'semanal' ? 'Semanal' : 
                               agendamentoConfirmado.tipo_recorrencia === 'quinzenal' ? 'Quinzenal' : 'Mensal'}
                      </p>
                      <p className="text-xs text-gray-600">
                        Você receberá lembretes antes de cada agendamento
                      </p>
                    </div>
                  </div>
                )}
                    </div>
                  </div>

            {/* Botões */}
            <div className="space-y-3">
                  <button
                onClick={() => {
                  setAgendamentoConfirmado(null);
                  navigate('/');
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 px-8 rounded-2xl text-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 min-h-[60px] flex items-center justify-center"
              >
                🏠 Voltar ao Início
                  </button>
              
                  <button
                onClick={() => {
                  setAgendamentoConfirmado(null);
                  // Reset form para novo agendamento na mesma empresa
                  setQuickBooking({ 
                    nome: user.nome,
                    telefone: user.telefone || user.whatsapp,
                    data: '', 
                    hora: '', 
                    funcionario_id: '', 
                    servicos: [],
                    observacoes: '',
                    recorrente: false,
                    tipo_recorrencia: 'semanal',
                    fim_recorrencia: ''
                  });
                }}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-6 px-8 rounded-2xl text-xl font-bold hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 min-h-[60px] flex items-center justify-center"
              >
                ➕ Novo Agendamento
                  </button>
                </div>
            </div>
          </div>
      )}
    </div>
  );
};

export default AgendamentoEmpresa;

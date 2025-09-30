import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import WhatsAppChat from '../shared/WhatsAppChat';
import notificationService from '../../services/notificationService';

const AgendamentoEmpresa = () => {
  const { empresaId } = useParams();
  const [empresa, setEmpresa] = useState(null);
  const [funcionarios, setFuncionarios] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [showQuickBooking, setShowQuickBooking] = useState(false);
  const [showWhatsAppChat, setShowWhatsAppChat] = useState(false);
  
  const [quickBooking, setQuickBooking] = useState({
    nome: '',
    telefone: '',
    data: '',
    hora: '',
    funcionario_id: '',
    servicos: [],
    recorrente: false,
    tipo_recorrencia: 'semanal',
    fim_recorrencia: ''
  });

  // Estado para controlar o fluxo de seleção
  const [bookingStep, setBookingStep] = useState('date'); // 'date', 'time', 'employee', 'services'

  useEffect(() => {
    // Buscar dados da empresa
    const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
    const empresaEncontrada = empresas.find(emp => emp.id === empresaId);
    
    console.log('🏢 Dados da empresa carregados:', {
      empresaId,
      empresaEncontrada,
      horario_inicio: empresaEncontrada?.horario_inicio,
      horario_fim: empresaEncontrada?.horario_fim,
      dias_funcionamento: empresaEncontrada?.dias_funcionamento
    });
    
    setEmpresa(empresaEncontrada);
    
    // Buscar funcionários e serviços da empresa
    const funcionariosEmpresa = JSON.parse(localStorage.getItem(`funcionarios_${empresaId}`) || '[]');
    setFuncionarios(funcionariosEmpresa);
    
    const servicosEmpresa = JSON.parse(localStorage.getItem(`servicos_${empresaId}`) || '[]');
    setServicos(servicosEmpresa);
  }, [empresaId]);

  const calcularHoraFim = (horaInicio, duracaoMinutos) => {
    const [hora, minuto] = horaInicio.split(':').map(Number);
    const totalMinutos = hora * 60 + minuto + duracaoMinutos;
    const novaHora = Math.floor(totalMinutos / 60);
    const novoMinuto = totalMinutos % 60;
    return `${novaHora.toString().padStart(2, '0')}:${novoMinuto.toString().padStart(2, '0')}`;
  };

  const verificarHorarioFuncionamento = (horaInicio, duracaoMinutos) => {
    if (!empresa.horario_inicio || !empresa.horario_fim) {
      console.log('⚠️ Horário de funcionamento não definido para a empresa');
      return true;
    }
    
    const horaFim = calcularHoraFim(horaInicio, duracaoMinutos);
    
    // Converter para minutos para comparação
    const horaInicioMinutos = horaInicio.split(':').reduce((acc, time) => (60 * acc) + +time);
    const horaFimMinutos = horaFim.split(':').reduce((acc, time) => (60 * acc) + +time);
    const empresaInicioMinutos = empresa.horario_inicio.split(':').reduce((acc, time) => (60 * acc) + +time);
    const empresaFimMinutos = empresa.horario_fim.split(':').reduce((acc, time) => (60 * acc) + +time);
    
    console.log('🕐 Verificação de horário:', {
      horaInicio,
      horaFim,
      empresaInicio: empresa.horario_inicio,
      empresaFim: empresa.horario_fim,
      duracaoMinutos,
      horaInicioMinutos,
      horaFimMinutos,
      empresaInicioMinutos,
      empresaFimMinutos,
      dentroHorario: horaInicioMinutos >= empresaInicioMinutos && horaFimMinutos <= empresaFimMinutos
    });
    
    return horaInicioMinutos >= empresaInicioMinutos && horaFimMinutos <= empresaFimMinutos;
  };

  // Função para verificar se o funcionário está em pausa no horário selecionado
  const verificarPausaFuncionario = (funcionarioId, data, horaInicio, duracaoMinutos) => {
    try {
      // Buscar pausas do funcionário
      const breaksData = localStorage.getItem(`breaks_${funcionarioId}`);
      if (!breaksData) {
        console.log('✅ Nenhuma pausa configurada para o funcionário');
        return true; // Não há pausas, horário disponível
      }

      const pausas = JSON.parse(breaksData);
      const dataSelecionada = new Date(data);
      const diaSemana = dataSelecionada.getDay(); // 0 = Domingo, 1 = Segunda, etc.
      
      const horaFim = calcularHoraFim(horaInicio, duracaoMinutos);
      
      // Converter para minutos para comparação
      const horaInicioMinutos = horaInicio.split(':').reduce((acc, time) => (60 * acc) + +time);
      const horaFimMinutos = horaFim.split(':').reduce((acc, time) => (60 * acc) + +time);

      // Verificar se há pausa ativa no dia e horário selecionados
      const temPausa = pausas.some(pausa => {
        // Verificar se a pausa está ativa neste dia da semana
        if (!pausa.dias.includes(diaSemana)) {
          return false;
        }

        // Verificar se o horário selecionado conflita com a pausa
        const pausaInicioMinutos = pausa.hora_inicio.split(':').reduce((acc, time) => (60 * acc) + +time);
        const pausaFimMinutos = pausa.hora_fim.split(':').reduce((acc, time) => (60 * acc) + +time);

        // Verificar se há sobreposição de horários
        const temSobreposicao = !(horaFimMinutos <= pausaInicioMinutos || horaInicioMinutos >= pausaFimMinutos);
        
        if (temSobreposicao) {
          console.log('🚫 Conflito de pausa encontrado:', {
            pausa: pausa.nome,
            pausaHorario: `${pausa.hora_inicio} - ${pausa.hora_fim}`,
            agendamentoHorario: `${horaInicio} - ${horaFim}`,
            diaSemana: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][diaSemana]
          });
        }

        return temSobreposicao;
      });

      console.log('☕ Verificação de pausas:', {
        funcionarioId,
        data,
        horaInicio,
        horaFim,
        diaSemana: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][diaSemana],
        pausasAtivas: pausas.filter(p => p.dias.includes(diaSemana)).length,
        temPausa,
        horarioDisponivel: !temPausa
      });

      return !temPausa; // Retorna true se NÃO há pausa (horário disponível)
    } catch (error) {
      console.error('Erro ao verificar pausas do funcionário:', error);
      return true; // Em caso de erro, considera disponível
    }
  };

  // Função para gerar horários disponíveis (excluindo pausas e agendamentos existentes)
  const gerarHorariosDisponiveis = () => {
    if (!empresa.horario_inicio || !empresa.horario_fim) {
      return [];
    }

    const horariosDisponiveis = [];
    const [empresaInicioHora, empresaInicioMinuto] = empresa.horario_inicio.split(':').map(Number);
    const [empresaFimHora, empresaFimMinuto] = empresa.horario_fim.split(':').map(Number);
    
    const empresaInicioMinutos = empresaInicioHora * 60 + empresaInicioMinuto;
    const empresaFimMinutos = empresaFimHora * 60 + empresaFimMinuto;
    
    // Gerar horários de 30 em 30 minutos
    for (let minutos = empresaInicioMinutos; minutos < empresaFimMinutos; minutos += 30) {
      const hora = Math.floor(minutos / 60);
      const minuto = minutos % 60;
      const horarioString = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
      horariosDisponiveis.push(horarioString);
    }
    
    return horariosDisponiveis;
  };

  // Função para buscar funcionários disponíveis em um horário específico
  const buscarFuncionariosDisponiveis = (data, hora, duracaoMinutos) => {
    if (!data || !hora) {
      return [];
    }

    const funcionariosDisponiveis = funcionarios.filter(funcionario => {
      // Verificar se não está em pausa
      const naoEstaEmPausa = verificarPausaFuncionario(funcionario.id, data, hora, duracaoMinutos);
      
      // Verificar se não tem conflito com agendamentos existentes
      const agendamentos = JSON.parse(localStorage.getItem(`agendamentos_${empresaId}`) || '[]');
      const temConflitoAgendamento = agendamentos.some(ag => {
        if (ag.funcionario_id !== funcionario.id || ag.data !== data) {
          return false;
        }
        
        const agHoraInicio = ag.hora.split(':').reduce((acc, time) => (60 * acc) + +time);
        const agHoraFim = agHoraInicio + (ag.duracao_total || 60);
        const novaHoraInicio = hora.split(':').reduce((acc, time) => (60 * acc) + +time);
        const novaHoraFim = novaHoraInicio + duracaoMinutos;
        
        return !(novaHoraFim <= agHoraInicio || novaHoraInicio >= agHoraFim);
      });
      
      return naoEstaEmPausa && !temConflitoAgendamento;
    });

    console.log('👥 Funcionários disponíveis:', {
      data,
      hora,
      duracaoMinutos,
      totalFuncionarios: funcionarios.length,
      disponiveis: funcionariosDisponiveis.length,
      funcionarios: funcionariosDisponiveis.map(f => f.nome)
    });

    return funcionariosDisponiveis;
  };

  const criarAgendamentosRecorrentes = (agendamentoBase, empresaId, duracaoTotal) => {
    const agendamentos = [];
    const dataInicio = new Date(agendamentoBase.data);
    const dataFim = new Date(agendamentoBase.fim_recorrencia);
    const tipoRecorrencia = agendamentoBase.tipo_recorrencia;
    
    let dataAtual = new Date(dataInicio);
    let contador = 0;
    const maxAgendamentos = 52;
    
    while (dataAtual <= dataFim && contador < maxAgendamentos) {
      const diaSemana = dataAtual.getDay();
      if (empresa.dias_funcionamento && empresa.dias_funcionamento.includes(diaSemana)) {
        const agendamento = {
          id: `${Date.now()}_${contador}`,
          empresa_id: empresaId,
          ...agendamentoBase,
          data: dataAtual.toISOString().split('T')[0],
          tipo: 'rapido',
          status: 'pendente',
          duracao_total: duracaoTotal,
          valor_total: agendamentoBase.servicos.reduce((sum, s) => sum + parseFloat(s.preco), 0),
          data_criacao: new Date().toISOString(),
          agendamento_recorrente: true,
          recorrencia_tipo: tipoRecorrencia,
          recorrencia_fim: agendamentoBase.fim_recorrencia
        };
        agendamentos.push(agendamento);
      }
      
      if (tipoRecorrencia === 'semanal') {
        dataAtual.setDate(dataAtual.getDate() + 7);
      } else if (tipoRecorrencia === 'mensal') {
        dataAtual.setMonth(dataAtual.getMonth() + 1);
      }
      contador++;
    }
    
    return agendamentos;
  };

  const handleQuickBooking = (e) => {
    e.preventDefault();
    
    // Validações
    if (!quickBooking.funcionario_id) {
      alert('Por favor, selecione um funcionário.');
      return;
    }
    
    if (quickBooking.servicos.length === 0) {
      alert('Por favor, selecione pelo menos um serviço.');
      return;
    }
    
    // Verificar conflitos de horário
    const agendamentos = JSON.parse(localStorage.getItem(`agendamentos_${empresaId}`) || '[]');
    const duracaoTotal = quickBooking.servicos.reduce((sum, s) => sum + (parseInt(s.duracao) || 0), 0);
    
    const conflito = agendamentos.find(ag => {
      if (ag.funcionario_id !== quickBooking.funcionario_id || ag.data !== quickBooking.data) {
        return false;
      }
      
      const horaInicio = quickBooking.hora;
      const horaFim = calcularHoraFim(horaInicio, duracaoTotal);
      const agHoraInicio = ag.hora;
      const agHoraFim = calcularHoraFim(ag.hora, ag.duracao_total || 60);
      
      return (horaInicio < agHoraFim && horaFim > agHoraInicio);
    });
    
    if (conflito) {
      alert('Este horário já está ocupado para o funcionário selecionado. Escolha outro horário.');
      return;
    }
    
    if (!verificarHorarioFuncionamento(quickBooking.hora, duracaoTotal)) {
      alert('Este horário está fora do horário de funcionamento da empresa.');
      return;
    }

    // Verificar se o funcionário não está em pausa no horário selecionado
    if (!verificarPausaFuncionario(quickBooking.funcionario_id, quickBooking.data, quickBooking.hora, duracaoTotal)) {
      alert('O horário selecionado conflita com uma pausa do funcionário. Escolha outro horário.');
      return;
    }
    
    // Criar agendamentos
    const agendamentosParaSalvar = [];
    
    if (quickBooking.recorrente && quickBooking.fim_recorrencia) {
      const agendamentosRecorrentes = criarAgendamentosRecorrentes(quickBooking, empresaId, duracaoTotal);
      agendamentosParaSalvar.push(...agendamentosRecorrentes);
    } else {
      const novoAgendamento = {
        id: Date.now().toString(),
        empresa_id: empresaId,
        ...quickBooking,
        tipo: 'rapido',
        status: 'pendente',
        duracao_total: duracaoTotal,
        valor_total: quickBooking.servicos.reduce((sum, s) => sum + parseFloat(s.preco), 0),
        data_criacao: new Date().toISOString()
      };
      agendamentosParaSalvar.push(novoAgendamento);
    }
    
    agendamentos.push(...agendamentosParaSalvar);
    localStorage.setItem(`agendamentos_${empresaId}`, JSON.stringify(agendamentos));
    
    // Enviar notificações
    const funcionarioSelecionado = funcionarios.find(f => f.id === quickBooking.funcionario_id);
    const clienteInfo = {
      nome: quickBooking.nome,
      telefone: quickBooking.telefone,
      email: null
    };
    
    notificationService.sendNewAppointmentNotification(
      agendamentosParaSalvar[0],
      empresa,
      funcionarioSelecionado,
      clienteInfo
    );
    
    const mensagemSucesso = quickBooking.recorrente 
      ? `Agendamento recorrente criado com sucesso! ${agendamentosParaSalvar.length} agendamentos foram criados.`
      : 'Agendamento realizado com sucesso! A empresa entrará em contato para confirmar.';
    
    alert(mensagemSucesso);
    setQuickBooking({ 
      nome: '', 
      telefone: '', 
      data: '', 
      hora: '', 
      funcionario_id: '', 
      servicos: [],
      recorrente: false,
      tipo_recorrencia: 'semanal',
      fim_recorrencia: ''
    });
    setShowQuickBooking(false);
  };

  if (!empresa) return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
      <div className="text-center p-8">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-red-600 mb-2">Empresa não encontrada</h1>
        <p className="text-gray-600">ID da empresa: {empresaId}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Moderno */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6 shadow-lg">
            <span className="text-2xl">🏢</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
            {empresa.razaoSocial}
          </h1>
          <p className="text-xl text-gray-600 mb-6">Agende seu serviço de forma rápida e fácil</p>
          
          {/* Botão WhatsApp Moderno */}
          {empresa.whatsapp_contato && (
            <div className="inline-flex">
              <button
                onClick={() => setShowWhatsAppChat(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Conversar via WhatsApp
              </button>
            </div>
          )}
        </div>

        {/* Fluxo de Agendamento - Passo 1: Data */}
        {bookingStep === 'date' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Escolha a Data</h2>
              <p className="text-gray-600">Selecione o dia para seu agendamento</p>
            </div>
            
            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="date"
                  value={quickBooking.data}
                  onChange={(e) => {
                    setQuickBooking({...quickBooking, data: e.target.value});
                    setBookingStep('time');
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-6 border-2 border-gray-200 rounded-xl text-center text-xl font-semibold focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  required
                />
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center">
                Selecione a data para continuar
              </p>
            </div>
          </div>
        )}

        {/* Fluxo de Agendamento - Passo 2: Horário */}
        {bookingStep === 'time' && quickBooking.data && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-4">
                <span className="text-2xl">🕐</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Escolha o Horário</h2>
              <p className="text-gray-600">Horários disponíveis para {quickBooking.data}</p>
            </div>
            
            <div className="max-w-lg mx-auto">
              <div className="relative">
                <select
                  value={quickBooking.hora}
                  onChange={(e) => {
                    setQuickBooking({...quickBooking, hora: e.target.value});
                    setBookingStep('employee');
                  }}
                  className="w-full p-6 border-2 border-gray-200 rounded-xl text-center text-xl font-semibold focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-100 transition-all duration-200 appearance-none bg-white"
                  required
                >
                  <option value="">Selecione um horário</option>
                  {gerarHorariosDisponiveis().map(horario => (
                    <option key={horario} value={horario}>
                      {horario}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center">
                Horários de {empresa.horario_inicio} às {empresa.horario_fim}
              </p>
              
              <div className="mt-6 text-center">
                <button
                  onClick={() => setBookingStep('date')}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Alterar Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fluxo de Agendamento - Passo 3: Funcionário Disponível */}
        {bookingStep === 'employee' && quickBooking.data && quickBooking.hora && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full mb-4">
                <span className="text-2xl">👤</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Escolha o Funcionário</h2>
              <p className="text-gray-600">Profissionais disponíveis em {quickBooking.hora}</p>
            </div>
            
            {(() => {
              const duracaoEstimada = 60; // Duração padrão para verificar disponibilidade
              const funcionariosDisponiveis = buscarFuncionariosDisponiveis(
                quickBooking.data, 
                quickBooking.hora, 
                duracaoEstimada
              );

              if (funcionariosDisponiveis.length === 0) {
                return (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-6xl mb-4">😔</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhum funcionário disponível
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Não há funcionários disponíveis em {quickBooking.hora} no dia {quickBooking.data}
                    </p>
                    <button
                      onClick={() => setBookingStep('time')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Escolher outro horário
                    </button>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {funcionariosDisponiveis.map((funcionario) => (
                    <button
                      key={funcionario.id}
                      onClick={() => {
                        setQuickBooking({...quickBooking, funcionario_id: funcionario.id});
                        setBookingStep('services');
                      }}
                      className="group p-6 border-2 border-gray-200 rounded-2xl text-left transition-all duration-300 hover:border-purple-300 hover:bg-gradient-to-br hover:from-purple-50 hover:to-indigo-50 hover:shadow-lg hover:-translate-y-1"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                          <span className="text-white font-bold text-lg">
                            {funcionario.nome.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">{funcionario.nome}</h3>
                          {funcionario.especializacao && (
                            <p className="text-sm text-gray-600 mb-2">{funcionario.especializacao}</p>
                          )}
                          <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Disponível
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              );
            })()}
            
            <div className="mt-8 text-center">
              <button
                onClick={() => setBookingStep('time')}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Alterar Horário
              </button>
            </div>
          </div>
        )}

        {/* Fluxo de Agendamento - Passo 4: Serviços */}
        {bookingStep === 'services' && quickBooking.funcionario_id && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mb-4">
                <span className="text-2xl">🛠️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Escolha os Serviços</h2>
              <p className="text-gray-600">Selecione os serviços que deseja agendar</p>
            </div>
            
            {servicos.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {servicos.map((servico) => (
                    <label
                      key={servico.id}
                      className={`group p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                        quickBooking.servicos.some(s => s.id === servico.id)
                          ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-red-50 shadow-md'
                          : 'border-gray-200 hover:border-orange-300 hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={quickBooking.servicos.some(s => s.id === servico.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setQuickBooking({
                              ...quickBooking,
                              servicos: [...quickBooking.servicos, servico]
                            });
                          } else {
                            setQuickBooking({
                              ...quickBooking,
                              servicos: quickBooking.servicos.filter(s => s.id !== servico.id)
                            });
                          }
                        }}
                        className="sr-only"
                      />
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg mb-2">{servico.nome}</h3>
                          {servico.descricao && (
                            <p className="text-sm text-gray-600 mb-3">{servico.descricao}</p>
                          )}
                          <div className="flex items-center space-x-2">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              quickBooking.servicos.some(s => s.id === servico.id)
                                ? 'border-orange-500 bg-orange-500'
                                : 'border-gray-300 group-hover:border-orange-400'
                            }`}>
                              {quickBooking.servicos.some(s => s.id === servico.id) && (
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <span className="text-sm text-gray-500">
                              {quickBooking.servicos.some(s => s.id === servico.id) ? 'Selecionado' : 'Clique para selecionar'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-orange-600 text-xl">R$ {servico.preco}</p>
                          <p className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {parseInt(servico.duracao) || 0} min
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                
                {quickBooking.servicos.length > 0 && (
                  <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                    <h3 className="font-bold text-gray-900 mb-4 text-lg">📋 Resumo do Agendamento</h3>
                    <div className="space-y-3">
                      {quickBooking.servicos.map((servico) => (
                        <div key={servico.id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                          <span className="font-medium text-gray-900">{servico.nome}</span>
                          <div className="text-right">
                            <span className="font-bold text-green-600">R$ {servico.preco}</span>
                            <span className="text-sm text-gray-500 ml-2">({parseInt(servico.duracao) || 0} min)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-green-200 flex justify-between items-center">
                      <span className="font-bold text-lg text-gray-900">Total:</span>
                      <div className="text-right">
                        <div className="font-bold text-2xl text-green-600">
                          R$ {quickBooking.servicos.reduce((sum, s) => sum + parseFloat(s.preco), 0).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {quickBooking.servicos.reduce((sum, s) => sum + (parseInt(s.duracao) || 0), 0)} minutos
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botão para Finalizar */}
                {quickBooking.servicos.length > 0 && (
                  <div className="text-center">
                    <button
                      onClick={() => setShowQuickBooking(true)}
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 font-bold text-lg"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Finalizar Agendamento
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">🛠️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum serviço disponível
                </h3>
                <p className="text-gray-600">
                  Esta empresa ainda não configurou serviços disponíveis.
                </p>
              </div>
            )}
            
            <div className="mt-8 text-center">
              <button
                onClick={() => setBookingStep('employee')}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Alterar Funcionário
              </button>
            </div>
          </div>
        )}

        {/* Modal Agendamento */}
        {showQuickBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">🚀 Agendamento</h3>
              <form onSubmit={handleQuickBooking}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome Completo *</label>
                    <input
                      type="text"
                      value={quickBooking.nome}
                      onChange={(e) => setQuickBooking({...quickBooking, nome: e.target.value})}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Telefone *</label>
                    <input
                      type="tel"
                      value={quickBooking.telefone}
                      onChange={(e) => setQuickBooking({...quickBooking, telefone: e.target.value.replace(/[^\d]/g, '')})}
                      className="w-full p-2 border rounded"
                      placeholder="11999999999"
                      maxLength="11"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Data *</label>
                    <input
                      type="date"
                      value={quickBooking.data}
                      onChange={(e) => setQuickBooking({...quickBooking, data: e.target.value})}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Hora *</label>
                    <input
                      type="time"
                      value={quickBooking.hora}
                      disabled
                      className="w-full p-2 border rounded bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Horário selecionado no fluxo anterior
                    </p>
                  </div>
                </div>

                {/* Opções de Recorrência */}
                <div className="mb-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={quickBooking.recorrente}
                      onChange={(e) => setQuickBooking({...quickBooking, recorrente: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="text-sm font-medium text-gray-700">Agendamento recorrente</span>
                  </label>
                </div>

                {quickBooking.recorrente && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium mb-2">Tipo de Recorrência *</label>
                      <select
                        value={quickBooking.tipo_recorrencia}
                        onChange={(e) => setQuickBooking({...quickBooking, tipo_recorrencia: e.target.value})}
                        className="w-full p-2 border rounded"
                        required
                      >
                        <option value="semanal">Semanal</option>
                        <option value="mensal">Mensal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Até quando *</label>
                      <input
                        type="date"
                        value={quickBooking.fim_recorrencia}
                        onChange={(e) => setQuickBooking({...quickBooking, fim_recorrencia: e.target.value})}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white p-2 rounded hover:bg-green-700"
                  >
                    🚀 Agendar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuickBooking(false)}
                    className="flex-1 bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer Moderno */}
        <div className="text-center mt-12 space-y-4">
          <Link 
            to="/cliente" 
            className="inline-flex items-center px-6 py-3 bg-white text-blue-600 hover:text-blue-800 font-semibold rounded-full border-2 border-blue-200 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar à seleção de empresas
          </Link>
        </div>
      </div>

      {/* Chat WhatsApp */}
      {showWhatsAppChat && (
        <WhatsAppChat
          empresa={empresa}
          cliente={null}
          onClose={() => setShowWhatsAppChat(false)}
        />
      )}
    </div>
  );
};

export default AgendamentoEmpresa;

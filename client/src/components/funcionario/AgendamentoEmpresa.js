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
    for (let minutos = empresaInicioMinutos; minutos <= empresaFimMinutos - 30; minutos += 30) {
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
    const duracaoTotal = quickBooking.servicos.reduce((sum, s) => sum + s.duracao, 0);
    
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

  if (!empresa) return <div>Empresa não encontrada</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏢 {empresa.razaoSocial}</h1>
          <p className="text-gray-600">Escolha o funcionário e serviços para seu agendamento</p>
          
          {/* Botão WhatsApp */}
          {empresa.whatsapp_contato && (
            <div className="mt-4">
              <button
                onClick={() => setShowWhatsAppChat(true)}
                className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Conversar via WhatsApp
              </button>
            </div>
          )}
        </div>

        {/* Fluxo de Agendamento - Passo 1: Data */}
        {bookingStep === 'date' && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📅 Escolha a Data</h2>
            <div className="max-w-md mx-auto">
              <input
                type="date"
                value={quickBooking.data}
                onChange={(e) => {
                  setQuickBooking({...quickBooking, data: e.target.value});
                  setBookingStep('time');
                }}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-4 border-2 border-gray-200 rounded-lg text-center text-lg font-semibold focus:border-blue-500 focus:outline-none"
                required
              />
              <p className="text-sm text-gray-500 mt-2 text-center">
                Selecione a data para continuar
              </p>
            </div>
          </div>
        )}

        {/* Fluxo de Agendamento - Passo 2: Horário */}
        {bookingStep === 'time' && quickBooking.data && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">🕐 Escolha o Horário</h2>
              <button
                onClick={() => setBookingStep('date')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ← Alterar Data
              </button>
            </div>
            <div className="max-w-md mx-auto">
              <select
                value={quickBooking.hora}
                onChange={(e) => {
                  setQuickBooking({...quickBooking, hora: e.target.value});
                  setBookingStep('employee');
                }}
                className="w-full p-4 border-2 border-gray-200 rounded-lg text-center text-lg font-semibold focus:border-blue-500 focus:outline-none"
                required
              >
                <option value="">Selecione um horário</option>
                {gerarHorariosDisponiveis().map(horario => (
                  <option key={horario} value={horario}>
                    {horario}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Horários de {empresa.horario_inicio} às {empresa.horario_fim}
              </p>
            </div>
          </div>
        )}

        {/* Fluxo de Agendamento - Passo 3: Funcionário Disponível */}
        {bookingStep === 'employee' && quickBooking.data && quickBooking.hora && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">👤 Funcionários Disponíveis</h2>
              <button
                onClick={() => setBookingStep('time')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ← Alterar Horário
              </button>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {funcionariosDisponiveis.map((funcionario) => (
                    <button
                      key={funcionario.id}
                      onClick={() => {
                        setQuickBooking({...quickBooking, funcionario_id: funcionario.id});
                        setBookingStep('services');
                      }}
                      className="p-4 border-2 rounded-lg text-left transition-colors hover:border-blue-300 hover:bg-blue-50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {funcionario.nome.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{funcionario.nome}</h3>
                          {funcionario.especializacao && (
                            <p className="text-sm text-gray-600">{funcionario.especializacao}</p>
                          )}
                          <p className="text-xs text-green-600 font-medium">✓ Disponível</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Fluxo de Agendamento - Passo 4: Serviços */}
        {bookingStep === 'services' && quickBooking.funcionario_id && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">🛠️ Escolha os Serviços</h2>
              <button
                onClick={() => setBookingStep('employee')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ← Alterar Funcionário
              </button>
            </div>
            
            {servicos.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {servicos.map((servico) => (
                    <label
                      key={servico.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        quickBooking.servicos.some(s => s.id === servico.id)
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
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
                        <div>
                          <h3 className="font-medium text-gray-900">{servico.nome}</h3>
                          {servico.descricao && (
                            <p className="text-sm text-gray-600 mt-1">{servico.descricao}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">R$ {servico.preco}</p>
                          <p className="text-sm text-gray-500">{servico.duracao} min</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                
                {quickBooking.servicos.length > 0 && (
                  <div className="mb-6 p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">📋 Serviços Selecionados:</h3>
                    <div className="space-y-2">
                      {quickBooking.servicos.map((servico) => (
                        <div key={servico.id} className="flex justify-between text-sm">
                          <span>{servico.nome}</span>
                          <span>R$ {servico.preco} ({servico.duracao} min)</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between font-bold">
                      <span>Total:</span>
                      <span>
                        R$ {quickBooking.servicos.reduce((sum, s) => sum + parseFloat(s.preco), 0).toFixed(2)} 
                        ({quickBooking.servicos.reduce((sum, s) => sum + s.duracao, 0)} min)
                      </span>
                    </div>
                  </div>
                )}

                {/* Botão para Finalizar */}
                {quickBooking.servicos.length > 0 && (
                  <div className="text-center">
                    <button
                      onClick={() => setShowQuickBooking(true)}
                      className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg"
                    >
                      🚀 Finalizar Agendamento
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

        <div className="text-center mt-8 space-x-4">
          <Link to="/cliente" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Voltar à seleção de empresas
          </Link>
          <Link to={`/debug-empresa/${empresaId}`} className="text-gray-500 hover:text-gray-700 text-sm">
            🔍 Debug Empresa
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

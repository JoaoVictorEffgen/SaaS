// Serviço para cálculo de KPIs do Dashboard
class KPIService {
  constructor() {
    this.notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
  }

  // Calcular KPIs para uma empresa
  calculateKPIs(empresaId, periodo = '30d') {
    const agendamentos = this.getAgendamentosByEmpresa(empresaId, periodo);
    const funcionarios = this.getFuncionariosByEmpresa(empresaId);
    const servicos = this.getServicosByEmpresa(empresaId);
    
    return {
      // Métricas básicas
      totalAgendamentos: agendamentos.length,
      agendamentosConfirmados: agendamentos.filter(a => a.status === 'confirmado').length,
      agendamentosCancelados: agendamentos.filter(a => a.status === 'cancelado').length,
      agendamentosPendentes: agendamentos.filter(a => a.status === 'pendente').length,
      
      // Taxa de comparecimento
      taxaComparecimento: this.calculateAttendanceRate(agendamentos),
      
      // Receita
      receitaTotal: this.calculateTotalRevenue(agendamentos),
      receitaPorServico: this.calculateRevenueByService(agendamentos, servicos),
      receitaMediaPorAgendamento: this.calculateAverageRevenuePerAppointment(agendamentos),
      
      // Tempo
      tempoMedioPorCliente: this.calculateAverageTimePerClient(agendamentos),
      tempoMedioPorServico: this.calculateAverageTimePerService(agendamentos, servicos),
      
      // Funcionários
      agendamentosPorFuncionario: this.calculateAppointmentsByEmployee(agendamentos, funcionarios),
      funcionarioMaisProdutivo: this.getMostProductiveEmployee(agendamentos, funcionarios),
      
      // Tendências
      tendenciaAgendamentos: this.calculateAppointmentTrend(agendamentos),
      tendenciaReceita: this.calculateRevenueTrend(agendamentos),
      
      // Horários mais populares
      horariosMaisPopulares: this.getMostPopularTimes(agendamentos),
      
      // Serviços mais solicitados
      servicosMaisSolicitados: this.getMostRequestedServices(agendamentos, servicos),
      
      // Satisfação (simulado)
      satisfacaoMedia: this.calculateAverageSatisfaction(agendamentos),
      
      // Conversão
      taxaConversao: this.calculateConversionRate(agendamentos),
      
      // Período
      periodo: periodo,
      dataCalculo: new Date().toISOString()
    };
  }

  // Obter agendamentos por empresa e período
  getAgendamentosByEmpresa(empresaId, periodo) {
    const agendamentos = JSON.parse(localStorage.getItem(`agendamentos_${empresaId}`) || '[]');
    const dataLimite = this.getDateLimit(periodo);
    
    return agendamentos.filter(a => {
      const dataAgendamento = new Date(a.data);
      return dataAgendamento >= dataLimite;
    });
  }

  // Obter funcionários por empresa
  getFuncionariosByEmpresa(empresaId) {
    return JSON.parse(localStorage.getItem(`funcionarios_${empresaId}`) || '[]');
  }

  // Obter serviços por empresa
  getServicosByEmpresa(empresaId) {
    return JSON.parse(localStorage.getItem(`servicos_${empresaId}`) || '[]');
  }

  // Calcular taxa de comparecimento
  calculateAttendanceRate(agendamentos) {
    const confirmados = agendamentos.filter(a => a.status === 'confirmado').length;
    const total = agendamentos.length;
    
    return total > 0 ? (confirmados / total) * 100 : 0;
  }

  // Calcular receita total
  calculateTotalRevenue(agendamentos) {
    return agendamentos
      .filter(a => a.status === 'confirmado')
      .reduce((sum, a) => sum + (parseFloat(a.valor_total) || 0), 0);
  }

  // Calcular receita por serviço
  calculateRevenueByService(agendamentos, servicos) {
    const receitaPorServico = {};
    
    agendamentos
      .filter(a => a.status === 'confirmado')
      .forEach(agendamento => {
        if (agendamento.servicos) {
          agendamento.servicos.forEach(servico => {
            const servicoInfo = servicos.find(s => s.id === servico.id);
            if (servicoInfo) {
              if (!receitaPorServico[servicoInfo.nome]) {
                receitaPorServico[servicoInfo.nome] = 0;
              }
              receitaPorServico[servicoInfo.nome] += parseFloat(servico.preco) || 0;
            }
          });
        }
      });
    
    return receitaPorServico;
  }

  // Calcular receita média por agendamento
  calculateAverageRevenuePerAppointment(agendamentos) {
    const receitaTotal = this.calculateTotalRevenue(agendamentos);
    const agendamentosConfirmados = agendamentos.filter(a => a.status === 'confirmado').length;
    
    return agendamentosConfirmados > 0 ? receitaTotal / agendamentosConfirmados : 0;
  }

  // Calcular tempo médio por cliente
  calculateAverageTimePerClient(agendamentos) {
    const temposTotais = agendamentos
      .filter(a => a.status === 'confirmado')
      .reduce((sum, a) => sum + (a.duracao_total || 0), 0);
    
    const clientesUnicos = new Set(
      agendamentos
        .filter(a => a.status === 'confirmado')
        .map(a => a.cliente_id || a.nome)
    ).size;
    
    return clientesUnicos > 0 ? temposTotais / clientesUnicos : 0;
  }

  // Calcular tempo médio por serviço
  calculateAverageTimePerService(agendamentos, servicos) {
    const tempoPorServico = {};
    const contadorPorServico = {};
    
    agendamentos
      .filter(a => a.status === 'confirmado')
      .forEach(agendamento => {
        if (agendamento.servicos) {
          agendamento.servicos.forEach(servico => {
            const servicoInfo = servicos.find(s => s.id === servico.id);
            if (servicoInfo) {
              if (!tempoPorServico[servicoInfo.nome]) {
                tempoPorServico[servicoInfo.nome] = 0;
                contadorPorServico[servicoInfo.nome] = 0;
              }
              tempoPorServico[servicoInfo.nome] += servico.duracao || servicoInfo.duracao || 0;
              contadorPorServico[servicoInfo.nome]++;
            }
          });
        }
      });
    
    // Calcular médias
    const medias = {};
    Object.keys(tempoPorServico).forEach(servico => {
      medias[servico] = tempoPorServico[servico] / contadorPorServico[servico];
    });
    
    return medias;
  }

  // Calcular agendamentos por funcionário
  calculateAppointmentsByEmployee(agendamentos, funcionarios) {
    const agendamentosPorFuncionario = {};
    
    agendamentos.forEach(agendamento => {
      const funcionario = funcionarios.find(f => f.id === agendamento.funcionario_id);
      if (funcionario) {
        if (!agendamentosPorFuncionario[funcionario.nome]) {
          agendamentosPorFuncionario[funcionario.nome] = {
            total: 0,
            confirmados: 0,
            cancelados: 0,
            pendentes: 0
          };
        }
        
        agendamentosPorFuncionario[funcionario.nome].total++;
        agendamentosPorFuncionario[funcionario.nome][agendamento.status]++;
      }
    });
    
    return agendamentosPorFuncionario;
  }

  // Obter funcionário mais produtivo
  getMostProductiveEmployee(agendamentos, funcionarios) {
    const agendamentosPorFuncionario = this.calculateAppointmentsByEmployee(agendamentos, funcionarios);
    
    let funcionarioMaisProdutivo = null;
    let maxAgendamentos = 0;
    
    Object.keys(agendamentosPorFuncionario).forEach(funcionario => {
      const total = agendamentosPorFuncionario[funcionario].total;
      if (total > maxAgendamentos) {
        maxAgendamentos = total;
        funcionarioMaisProdutivo = funcionario;
      }
    });
    
    return {
      nome: funcionarioMaisProdutivo,
      totalAgendamentos: maxAgendamentos
    };
  }

  // Calcular tendência de agendamentos
  calculateAppointmentTrend(agendamentos) {
    // Simular tendência baseada nos últimos 7 dias vs anteriores
    const hoje = new Date();
    const seteDiasAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
    const quatorzeDiasAtras = new Date(hoje.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const ultimos7Dias = agendamentos.filter(a => new Date(a.data) >= seteDiasAtras).length;
    const anteriores7Dias = agendamentos.filter(a => {
      const data = new Date(a.data);
      return data >= quatorzeDiasAtras && data < seteDiasAtras;
    }).length;
    
    if (anteriores7Dias === 0) return ultimos7Dias > 0 ? 100 : 0;
    
    return ((ultimos7Dias - anteriores7Dias) / anteriores7Dias) * 100;
  }

  // Calcular tendência de receita
  calculateRevenueTrend(agendamentos) {
    const hoje = new Date();
    const seteDiasAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
    const quatorzeDiasAtras = new Date(hoje.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const receitaUltimos7Dias = agendamentos
      .filter(a => new Date(a.data) >= seteDiasAtras && a.status === 'confirmado')
      .reduce((sum, a) => sum + (parseFloat(a.valor_total) || 0), 0);
    
    const receitaAnteriores7Dias = agendamentos
      .filter(a => {
        const data = new Date(a.data);
        return data >= quatorzeDiasAtras && data < seteDiasAtras && a.status === 'confirmado';
      })
      .reduce((sum, a) => sum + (parseFloat(a.valor_total) || 0), 0);
    
    if (receitaAnteriores7Dias === 0) return receitaUltimos7Dias > 0 ? 100 : 0;
    
    return ((receitaUltimos7Dias - receitaAnteriores7Dias) / receitaAnteriores7Dias) * 100;
  }

  // Obter horários mais populares
  getMostPopularTimes(agendamentos) {
    const horarios = {};
    
    agendamentos.forEach(agendamento => {
      const hora = agendamento.hora ? agendamento.hora.substring(0, 2) : '00';
      horarios[hora] = (horarios[hora] || 0) + 1;
    });
    
    return Object.entries(horarios)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([hora, count]) => ({ hora: `${hora}:00`, count }));
  }

  // Obter serviços mais solicitados
  getMostRequestedServices(agendamentos, servicos) {
    const servicosCount = {};
    
    agendamentos.forEach(agendamento => {
      if (agendamento.servicos) {
        agendamento.servicos.forEach(servico => {
          const servicoInfo = servicos.find(s => s.id === servico.id);
          if (servicoInfo) {
            servicosCount[servicoInfo.nome] = (servicosCount[servicoInfo.nome] || 0) + 1;
          }
        });
      }
    });
    
    return Object.entries(servicosCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([nome, count]) => ({ nome, count }));
  }

  // Calcular satisfação média (simulado)
  calculateAverageSatisfaction(agendamentos) {
    // Simular satisfação baseada em status e tempo
    const agendamentosConfirmados = agendamentos.filter(a => a.status === 'confirmado');
    
    if (agendamentosConfirmados.length === 0) return 0;
    
    // Simular satisfação entre 3.5 e 5.0
    return 3.5 + Math.random() * 1.5;
  }

  // Calcular taxa de conversão
  calculateConversionRate(agendamentos) {
    const total = agendamentos.length;
    const confirmados = agendamentos.filter(a => a.status === 'confirmado').length;
    
    return total > 0 ? (confirmados / total) * 100 : 0;
  }

  // Obter limite de data baseado no período
  getDateLimit(periodo) {
    const hoje = new Date();
    
    switch (periodo) {
      case '7d':
        return new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(hoje.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(hoje.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  // Gerar relatório completo
  generateReport(empresaId, periodo = '30d') {
    const kpis = this.calculateKPIs(empresaId, periodo);
    
    return {
      empresa: this.getEmpresaById(empresaId),
      periodo: periodo,
      dataGeracao: new Date().toISOString(),
      resumo: {
        totalAgendamentos: kpis.totalAgendamentos,
        taxaComparecimento: kpis.taxaComparecimento.toFixed(1),
        receitaTotal: kpis.receitaTotal.toFixed(2),
        satisfacaoMedia: kpis.satisfacaoMedia.toFixed(1)
      },
      detalhes: kpis
    };
  }
}

// Instância singleton
const kpiService = new KPIService();

export default kpiService;

// Serviço para exportação de dados
class ExportService {
  constructor() {
    this.notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
  }

  // Exportar agendamentos para CSV
  exportAgendamentosToCSV(empresaId, periodo = '30d') {
    const agendamentos = this.getAgendamentosByEmpresa(empresaId, periodo);
    const funcionarios = this.getFuncionariosByEmpresa(empresaId);
    const servicos = this.getServicosByEmpresa(empresaId);
    
    const csvData = agendamentos.map(agendamento => {
      const funcionario = funcionarios.find(f => f.id === agendamento.funcionario_id);
      const servicosNomes = agendamento.servicos 
        ? agendamento.servicos.map(s => {
            const servico = servicos.find(serv => serv.id === s.id);
            return servico ? servico.nome : 'Serviço não encontrado';
          }).join('; ')
        : 'Nenhum serviço';
      
      return {
        'ID': agendamento.id,
        'Data': agendamento.data,
        'Hora': agendamento.hora,
        'Cliente': agendamento.nome || 'Cliente não informado',
        'Telefone': agendamento.telefone || '',
        'Funcionário': funcionario ? funcionario.nome : 'Funcionário não encontrado',
        'Serviços': servicosNomes,
        'Duração Total (min)': agendamento.duracao_total || 0,
        'Valor Total': agendamento.valor_total || 0,
        'Status': agendamento.status,
        'Tipo': agendamento.tipo,
        'Recorrente': agendamento.agendamento_recorrente ? 'Sim' : 'Não',
        'Data Criação': agendamento.data_criacao
      };
    });

    return this.convertToCSV(csvData);
  }

  // Exportar KPIs para CSV
  exportKPIsToCSV(empresaId, periodo = '30d') {
    const kpis = this.calculateKPIs(empresaId, periodo);
    
    const csvData = [
      { 'Métrica': 'Total de Agendamentos', 'Valor': kpis.totalAgendamentos },
      { 'Métrica': 'Agendamentos Confirmados', 'Valor': kpis.agendamentosConfirmados },
      { 'Métrica': 'Agendamentos Cancelados', 'Valor': kpis.agendamentosCancelados },
      { 'Métrica': 'Agendamentos Pendentes', 'Valor': kpis.agendamentosPendentes },
      { 'Métrica': 'Taxa de Comparecimento (%)', 'Valor': kpis.taxaComparecimento.toFixed(2) },
      { 'Métrica': 'Receita Total (R$)', 'Valor': kpis.receitaTotal.toFixed(2) },
      { 'Métrica': 'Receita Média por Agendamento (R$)', 'Valor': kpis.receitaMediaPorAgendamento.toFixed(2) },
      { 'Métrica': 'Tempo Médio por Cliente (min)', 'Valor': kpis.tempoMedioPorCliente.toFixed(0) },
      { 'Métrica': 'Satisfação Média', 'Valor': kpis.satisfacaoMedia.toFixed(1) },
      { 'Métrica': 'Taxa de Conversão (%)', 'Valor': kpis.taxaConversao.toFixed(2) },
      { 'Métrica': 'Tendência Agendamentos (%)', 'Valor': kpis.tendenciaAgendamentos.toFixed(2) },
      { 'Métrica': 'Tendência Receita (%)', 'Valor': kpis.tendenciaReceita.toFixed(2) }
    ];

    return this.convertToCSV(csvData);
  }

  // Exportar funcionários para CSV
  exportFuncionariosToCSV(empresaId) {
    const funcionarios = this.getFuncionariosByEmpresa(empresaId);
    
    const csvData = funcionarios.map(funcionario => ({
      'ID': funcionario.id,
      'Nome': funcionario.nome,
      'Email': funcionario.email || '',
      'Telefone': funcionario.telefone || '',
      'Especialidade': funcionario.especialidade || '',
      'Status': funcionario.status,
      'Horário Início': funcionario.configuracoes?.horario_inicio || '',
      'Horário Fim': funcionario.configuracoes?.horario_fim || '',
      'Dias Trabalho': funcionario.configuracoes?.dias_trabalho?.join(', ') || '',
      'Duração Padrão (min)': funcionario.configuracoes?.duracao_padrao || 0,
      'Data Criação': funcionario.created_at || ''
    }));

    return this.convertToCSV(csvData);
  }

  // Exportar serviços para CSV
  exportServicosToCSV(empresaId) {
    const servicos = this.getServicosByEmpresa(empresaId);
    
    const csvData = servicos.map(servico => ({
      'ID': servico.id,
      'Nome': servico.nome,
      'Descrição': servico.descricao || '',
      'Duração (min)': servico.duracao_minutos || servico.duracao || 0,
      'Preço (R$)': servico.preco || 0,
      'Categoria': servico.categoria || '',
      'Status': servico.status,
      'Data Criação': servico.created_at || ''
    }));

    return this.convertToCSV(csvData);
  }

  // Exportar relatório completo para PDF (simulado)
  exportRelatorioCompletoToPDF(empresaId, periodo = '30d') {
    const empresa = this.getEmpresaById(empresaId);
    const kpis = this.calculateKPIs(empresaId, periodo);
    const agendamentos = this.getAgendamentosByEmpresa(empresaId, periodo);
    
    // Simular geração de PDF (em produção, usar biblioteca como jsPDF)
    const relatorio = {
      empresa: empresa.razaoSocial || 'Empresa',
      periodo: periodo,
      dataGeracao: new Date().toLocaleDateString('pt-BR'),
      resumo: {
        totalAgendamentos: kpis.totalAgendamentos,
        taxaComparecimento: `${kpis.taxaComparecimento.toFixed(1)}%`,
        receitaTotal: `R$ ${kpis.receitaTotal.toFixed(2)}`,
        satisfacaoMedia: kpis.satisfacaoMedia.toFixed(1)
      },
      detalhes: kpis,
      agendamentos: agendamentos.slice(0, 10) // Primeiros 10 agendamentos
    };

    // Simular download
    const blob = new Blob([JSON.stringify(relatorio, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${empresa.razaoSocial?.replace(/\s+/g, '-') || 'empresa'}-${periodo}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return relatorio;
  }

  // Converter dados para CSV
  convertToCSV(data) {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escapar vírgulas e aspas
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  }

  // Download CSV
  downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Download Excel (simulado como CSV com extensão .xlsx)
  downloadExcel(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace('.csv', '.xlsx');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Métodos auxiliares (reutilizados do kpiService)
  getAgendamentosByEmpresa(empresaId, periodo) {
    const agendamentos = JSON.parse(localStorage.getItem(`agendamentos_${empresaId}`) || '[]');
    const dataLimite = this.getDateLimit(periodo);
    
    return agendamentos.filter(a => {
      const dataAgendamento = new Date(a.data);
      return dataAgendamento >= dataLimite;
    });
  }

  getFuncionariosByEmpresa(empresaId) {
    return JSON.parse(localStorage.getItem(`funcionarios_${empresaId}`) || '[]');
  }

  getServicosByEmpresa(empresaId) {
    return JSON.parse(localStorage.getItem(`servicos_${empresaId}`) || '[]');
  }

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

  // Calcular KPIs básicos para exportação
  calculateKPIs(empresaId, periodo) {
    const agendamentos = this.getAgendamentosByEmpresa(empresaId, periodo);
    
    return {
      totalAgendamentos: agendamentos.length,
      agendamentosConfirmados: agendamentos.filter(a => a.status === 'confirmado').length,
      agendamentosCancelados: agendamentos.filter(a => a.status === 'cancelado').length,
      agendamentosPendentes: agendamentos.filter(a => a.status === 'pendente').length,
      taxaComparecimento: agendamentos.length > 0 
        ? (agendamentos.filter(a => a.status === 'confirmado').length / agendamentos.length) * 100 
        : 0,
      receitaTotal: agendamentos
        .filter(a => a.status === 'confirmado')
        .reduce((sum, a) => sum + (parseFloat(a.valor_total) || 0), 0),
      receitaMediaPorAgendamento: agendamentos.filter(a => a.status === 'confirmado').length > 0
        ? agendamentos
            .filter(a => a.status === 'confirmado')
            .reduce((sum, a) => sum + (parseFloat(a.valor_total) || 0), 0) / 
          agendamentos.filter(a => a.status === 'confirmado').length
        : 0,
      tempoMedioPorCliente: agendamentos.length > 0
        ? agendamentos.reduce((sum, a) => sum + (a.duracao_total || 0), 0) / agendamentos.length
        : 0,
      satisfacaoMedia: 3.5 + Math.random() * 1.5, // Simulado
      taxaConversao: agendamentos.length > 0
        ? (agendamentos.filter(a => a.status === 'confirmado').length / agendamentos.length) * 100
        : 0,
      tendenciaAgendamentos: Math.random() * 20 - 10, // Simulado
      tendenciaReceita: Math.random() * 20 - 10 // Simulado
    };
  }

  // Exportar tudo de uma vez
  exportAll(empresaId, periodo = '30d') {
    const empresa = this.getEmpresaById(empresaId);
    const empresaNome = empresa.razaoSocial?.replace(/\s+/g, '-') || 'empresa';
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Exportar agendamentos
    const agendamentosCSV = this.exportAgendamentosToCSV(empresaId, periodo);
    this.downloadCSV(agendamentosCSV, `agendamentos-${empresaNome}-${periodo}-${timestamp}.csv`);
    
    // Exportar KPIs
    const kpisCSV = this.exportKPIsToCSV(empresaId, periodo);
    this.downloadCSV(kpisCSV, `kpis-${empresaNome}-${periodo}-${timestamp}.csv`);
    
    // Exportar funcionários
    const funcionariosCSV = this.exportFuncionariosToCSV(empresaId);
    this.downloadCSV(funcionariosCSV, `funcionarios-${empresaNome}-${timestamp}.csv`);
    
    // Exportar serviços
    const servicosCSV = this.exportServicosToCSV(empresaId);
    this.downloadCSV(servicosCSV, `servicos-${empresaNome}-${timestamp}.csv`);
    
    return {
      agendamentos: agendamentosCSV,
      kpis: kpisCSV,
      funcionarios: funcionariosCSV,
      servicos: servicosCSV
    };
  }
}

// Instância singleton
const exportService = new ExportService();

export default exportService;

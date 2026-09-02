const periodDays = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };

const dateAtStartOfDay = (value) => {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const filterAppointmentsByPeriod = (appointments, period = '30d') => {
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (periodDays[period] || 30));
  return appointments.filter((appointment) => {
    const date = dateAtStartOfDay(appointment.data);
    return date && date >= cutoff;
  });
};

const trend = (current, previous) => previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100;

export const calculateDashboardMetrics = (appointments = [], employees = [], services = [], period = '30d') => {
  const filtered = filterAppointmentsByPeriod(appointments, period);
  const completed = filtered.filter((item) => item.status === 'realizado');
  const cancelled = filtered.filter((item) => item.status === 'cancelado');
  const confirmed = filtered.filter((item) => ['agendado', 'confirmado', 'realizado'].includes(item.status));
  const revenue = completed.reduce((sum, item) => sum + (Number(item.valor_total) || 0), 0);

  const midpoint = new Date();
  midpoint.setDate(midpoint.getDate() - Math.ceil((periodDays[period] || 30) / 2));
  const recent = filtered.filter((item) => dateAtStartOfDay(item.data) >= midpoint);
  const previous = filtered.filter((item) => dateAtStartOfDay(item.data) < midpoint);
  const recentRevenue = recent.filter((item) => item.status === 'realizado').reduce((sum, item) => sum + (Number(item.valor_total) || 0), 0);
  const previousRevenue = previous.filter((item) => item.status === 'realizado').reduce((sum, item) => sum + (Number(item.valor_total) || 0), 0);

  const timeCounts = {};
  const serviceCounts = {};
  const employeeCounts = {};
  filtered.forEach((appointment) => {
    const hour = String(appointment.hora || '00:00').slice(0, 5);
    timeCounts[hour] = (timeCounts[hour] || 0) + 1;
    (appointment.servicos || []).forEach((service) => {
      const catalogService = services.find((item) => String(item.id) === String(service.id));
      const name = service.nome || catalogService?.nome || 'Serviço';
      serviceCounts[name] = (serviceCounts[name] || 0) + 1;
    });
    employeeCounts[String(appointment.funcionario_id)] = (employeeCounts[String(appointment.funcionario_id)] || 0) + 1;
  });

  const productiveEntry = Object.entries(employeeCounts).sort((left, right) => right[1] - left[1])[0];
  const productiveEmployee = productiveEntry && employees.find((item) => String(item.id) === productiveEntry[0]);
  const averageDuration = completed.length > 0
    ? completed.reduce((sum, appointment) => sum + (appointment.servicos || []).reduce((total, service) => total + (Number(service.duracao_minutos) || 0), 0), 0) / completed.length
    : 0;

  return {
    totalAgendamentos: filtered.length,
    agendamentosConfirmados: confirmed.length,
    agendamentosCancelados: cancelled.length,
    agendamentosPendentes: filtered.filter((item) => item.status === 'em_aprovacao').length,
    taxaComparecimento: completed.length + cancelled.length > 0 ? (completed.length / (completed.length + cancelled.length)) * 100 : 0,
    receitaTotal: revenue,
    receitaMediaPorAgendamento: completed.length > 0 ? revenue / completed.length : 0,
    tempoMedioPorCliente: averageDuration,
    satisfacaoMedia: 0,
    taxaConversao: filtered.length > 0 ? (confirmed.length / filtered.length) * 100 : 0,
    tendenciaAgendamentos: trend(recent.length, previous.length),
    tendenciaReceita: trend(recentRevenue, previousRevenue),
    horariosMaisPopulares: Object.entries(timeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([hora, count]) => ({ hora, count })),
    servicosMaisSolicitados: Object.entries(serviceCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([nome, count]) => ({ nome, count })),
    funcionarioMaisProdutivo: productiveEntry ? { nome: productiveEmployee?.nome || 'Funcionário', totalAgendamentos: productiveEntry[1] } : null
  };
};

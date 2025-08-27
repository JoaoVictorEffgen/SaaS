import { utils } from './api';
import localStorageService from './localStorageService';

class AvailabilityService {
  // Buscar configurações de horário da empresa
  getCompanyHours(empresaId) {
    const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
    const empresa = empresas.find(e => e.id === empresaId);
    
    if (!empresa) {
      // Configurações padrão se não encontrar a empresa
      return {
        dias_trabalho: [1, 2, 3, 4, 5], // Segunda a Sexta
        horario_inicio: '08:00',
        horario_fim: '18:00',
        duracao_padrao: 60,
        intervalo_agendamento: 30
      };
    }
    
    return empresa.configuracoes || {
      dias_trabalho: [1, 2, 3, 4, 5],
      horario_inicio: '08:00',
      horario_fim: '18:00',
      duracao_padrao: 60,
      intervalo_agendamento: 30
    };
  }

  // Verificar se a empresa trabalha em uma data específica
  isCompanyOpen(empresaId, date) {
    const config = this.getCompanyHours(empresaId);
    return utils.isWorkingDay(date, config.dias_trabalho);
  }

  // Gerar todos os horários disponíveis para uma data
  getAvailableSlots(empresaId, date) {
    const config = this.getCompanyHours(empresaId);
    
    // Verificar se é dia de trabalho
    if (!this.isCompanyOpen(empresaId, date)) {
      return [];
    }

    // Buscar agendamentos existentes para a data
    const agendamentosExistentes = this.getExistingAppointments(empresaId, date);
    
    // Gerar todos os slots possíveis
    const allSlots = utils.generateAvailableSlots(
      date,
      config.horario_inicio,
      config.horario_fim,
      config.duracao_padrao,
      config.intervalo_agendamento
    );
    
    // Filtrar slots que não têm conflitos
    const availableSlots = utils.filterAvailableSlots(allSlots, agendamentosExistentes);
    
    return availableSlots;
  }

  // Buscar agendamentos existentes para uma data
  getExistingAppointments(empresaId, date) {
    const agendamentos = JSON.parse(localStorage.getItem('agendamentos') || '[]');
    return agendamentos.filter(ag => 
      ag.empresa_id === empresaId && 
      ag.data === date &&
      ['pendente', 'confirmado'].includes(ag.status)
    );
  }

  // Verificar se um horário específico está disponível
  isTimeSlotAvailable(empresaId, date, startTime, endTime) {
    const config = this.getCompanyHours(empresaId);
    
    // Verificar se é dia de trabalho
    if (!this.isCompanyOpen(empresaId, date)) {
      return { available: false, reason: 'Empresa não trabalha neste dia da semana' };
    }
    
    // Verificar se está dentro do horário de funcionamento
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);
    const companyStart = new Date(`${date}T${config.horario_inicio}`);
    const companyEnd = new Date(`${date}T${config.horario_fim}`);
    
    if (startDateTime < companyStart || endDateTime > companyEnd) {
      return { 
        available: false, 
        reason: `Horário fora do período de funcionamento (${config.horario_inicio} - ${config.horario_fim})` 
      };
    }
    
    // Verificar conflitos com agendamentos existentes
    const existingAppointments = this.getExistingAppointments(empresaId, date);
    const hasConflicts = utils.hasTimeConflicts(startTime, endTime, existingAppointments);
    
    if (hasConflicts) {
      return { available: false, reason: 'Horário já está reservado' };
    }
    
    return { available: true };
  }

  // Reservar um horário (criar agendamento)
  reserveTimeSlot(empresaId, date, startTime, endTime, clienteData) {
    const availability = this.isTimeSlotAvailable(empresaId, date, startTime, endTime);
    
    if (!availability.available) {
      throw new Error(availability.reason);
    }

    // Criar o agendamento
    const agendamento = {
      id: Date.now().toString(),
      empresa_id: empresaId,
      cliente_nome: clienteData.nome,
      cliente_email: clienteData.email,
      cliente_telefone: clienteData.telefone,
      data: date,
      hora_inicio: startTime,
      hora_fim: endTime,
      duracao: this.calculateDuration(startTime, endTime),
      status: 'pendente',
      data_criacao: new Date().toISOString()
    };

    // Salvar no localStorage
    const agendamentos = JSON.parse(localStorage.getItem('agendamentos') || '[]');
    agendamentos.push(agendamento);
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));

    return agendamento;
  }

  // Calcular duração em minutos
  calculateDuration(startTime, endTime) {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return Math.round((end - start) / (1000 * 60));
  }

  // Buscar próximo dia disponível
  getNextAvailableDate(empresaId, fromDate = new Date()) {
    let currentDate = new Date(fromDate);
    currentDate.setHours(0, 0, 0, 0);
    
    // Procurar pelos próximos 30 dias
    for (let i = 0; i < 30; i++) {
      if (this.isCompanyOpen(empresaId, currentDate.toISOString().split('T')[0])) {
        return currentDate.toISOString().split('T')[0];
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return null;
  }

  // Formatar horários para exibição
  formatAvailableSlots(slots) {
    return slots.map(slot => ({
      ...slot,
      display: utils.formatTimeSlot(slot.inicio, slot.fim)
    }));
  }
}

export default new AvailabilityService();

import axios from 'axios';

// Configuração base do Axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Se o token expirou ou é inválido, fazer logout
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Serviços de autenticação
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
};

// Serviços de usuário
export const userService = {
  updateProfile: (userData) => api.put('/users/profile', userData),
  changePassword: (passwordData) => api.put('/users/password', passwordData),
  deleteAccount: () => api.delete('/users/account'),
};

// Serviços de agenda
export const agendaService = {
  // Buscar todas as agendas do usuário
  getAll: (params = {}) => api.get('/agendas', { params }),
  
  // Buscar agenda específica
  getById: (id) => api.get(`/agendas/${id}`),
  
  // Criar nova agenda
  create: (agendaData) => api.post('/agendas', agendaData),
  
  // Atualizar agenda
  update: (id, agendaData) => api.put(`/agendas/${id}`, agendaData),
  
  // Deletar agenda
  delete: (id) => api.delete(`/agendas/${id}`),
  
  // Buscar horários disponíveis
  getAvailableSlots: (userId, date, startTime, endTime) => 
    api.get(`/agendas/available/${userId}`, { 
      params: { date, startTime, endTime } 
    }),
  
  // Buscar agenda pública (para clientes)
  getPublic: (userId) => api.get(`/agendas/public/${userId}`),
};

// Serviços de agendamento
export const agendamentoService = {
  // Buscar todos os agendamentos do usuário
  getAll: (params = {}) => api.get('/agendamentos', { params }),
  
  // Buscar agendamento específico
  getById: (id) => api.get(`/agendamentos/${id}`),
  
  // Criar novo agendamento (cliente)
  create: (agendamentoData) => api.post('/agendamentos', agendamentoData),
  
  // Atualizar agendamento
  update: (id, agendamentoData) => api.put(`/agendamentos/${id}`, agendamentoData),
  
  // Deletar agendamento
  delete: (id) => api.delete(`/agendamentos/${id}`),
  
  // Confirmar agendamento
  confirm: (id) => api.put(`/agendamentos/${id}/confirm`),
  
  // Cancelar agendamento
  cancel: (id, motivo) => api.put(`/agendamentos/${id}/cancel`, { motivo }),
  
  // Reagendar agendamento
  reschedule: (id, newData) => api.put(`/agendamentos/${id}/reschedule`, newData),
  
  // Marcar como concluído
  complete: (id) => api.put(`/agendamentos/${id}/complete`),
  
  // Buscar agendamentos por cliente
  getByClient: (email) => api.get(`/agendamentos/client/${email}`),
  
  // Buscar próximos agendamentos
  getUpcoming: (limit = 10) => api.get('/agendamentos/upcoming', { params: { limit } }),
};

// Serviços de assinatura
export const subscriptionService = {
  // Buscar assinatura ativa
  getActive: () => api.get('/subscriptions/active'),
  
  // Buscar histórico de assinaturas
  getHistory: () => api.get('/subscriptions/history'),
  
  // Criar assinatura (após pagamento)
  create: (subscriptionData) => api.post('/subscriptions', subscriptionData),
  
  // Atualizar assinatura
  update: (id, subscriptionData) => api.put(`/subscriptions/${id}`, subscriptionData),
  
  // Cancelar assinatura
  cancel: (id, motivo) => api.put(`/subscriptions/${id}/cancel`, { motivo }),
  
  // Renovar assinatura
  renew: (id) => api.put(`/subscriptions/${id}/renew`),
  
  // Buscar planos disponíveis
  getPlans: () => api.get('/subscriptions/plans'),
  
  // Fazer upgrade de plano
  upgrade: (plano) => api.post('/subscriptions/upgrade', { plano }),
};

// Serviços de pagamento (Stripe)
export const paymentService = {
  // Criar sessão de checkout
  createCheckoutSession: (plano) => api.post('/payments/checkout', { plano }),
  
  // Criar sessão de portal do cliente
  createPortalSession: () => api.post('/payments/portal'),
  
  // Verificar status do pagamento
  checkPaymentStatus: (sessionId) => api.get(`/payments/status/${sessionId}`),
  
  // Processar webhook do Stripe
  processWebhook: (webhookData) => api.post('/payments/webhook', webhookData),
};

// Serviços de notificação
export const notificationService = {
  // Enviar e-mail de confirmação
  sendConfirmationEmail: (agendamentoId) => 
    api.post(`/notifications/email/confirmation/${agendamentoId}`),
  
  // Enviar lembrete por e-mail
  sendReminderEmail: (agendamentoId) => 
    api.post(`/notifications/email/reminder/${agendamentoId}`),
  
  // Enviar notificação por WhatsApp
  sendWhatsAppNotification: (agendamentoId, tipo) => 
    api.post(`/notifications/whatsapp/${agendamentoId}`, { tipo }),
  
  // Configurar notificações
  updateSettings: (settings) => api.put('/notifications/settings', settings),
  
  // Buscar configurações de notificação
  getSettings: () => api.get('/notifications/settings'),
};

// Serviços de relatórios
export const reportService = {
  // Relatório de agendamentos por período
  getAppointmentsReport: (startDate, endDate) => 
    api.get('/reports/appointments', { params: { startDate, endDate } }),
  
  // Relatório de faturamento
  getBillingReport: (startDate, endDate) => 
    api.get('/reports/billing', { params: { startDate, endDate } }),
  
  // Relatório de clientes
  getClientsReport: () => api.get('/reports/clients'),
  
  // Relatório de agenda
  getAgendaReport: (startDate, endDate) => 
    api.get('/reports/agenda', { params: { startDate, endDate } }),
  
  // Exportar relatório em CSV
  exportReport: (reportType, params = {}) => 
    api.get(`/reports/export/${reportType}`, { 
      params,
      responseType: 'blob'
    }),
};

// Serviços de configuração
export const configService = {
  // Buscar configurações do usuário
  getUserConfig: () => api.get('/config/user'),
  
  // Atualizar configurações do usuário
  updateUserConfig: (config) => api.put('/config/user', config),
  
  // Buscar configurações da empresa
  getCompanyConfig: () => api.get('/config/company'),
  
  // Atualizar configurações da empresa
  updateCompanyConfig: (config) => api.put('/config/company', config),
  
  // Buscar configurações de notificação
  getNotificationConfig: () => api.get('/config/notifications'),
  
  // Atualizar configurações de notificação
  updateNotificationConfig: (config) => api.put('/config/notifications', config),
};

// Utilitários
export const utils = {
  // Formatar data
  formatDate: (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR');
  },
  
  // Formatar hora
  formatTime: (time) => {
    if (!time) return '';
    return time.substring(0, 5); // Remove segundos se houver
  },
  
  // Formatar moeda
  formatCurrency: (value, currency = 'BRL') => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(value);
  },
  
  // Validar e-mail
  validateEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  
  // Validar telefone
  validatePhone: (phone) => {
    const re = /^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}\-?[0-9]{4}$/;
    return re.test(phone);
  },
  
  // Validar CNPJ
  validateCNPJ: (cnpj) => {
    // Remove caracteres não numéricos
    const cnpjClean = cnpj.replace(/[^\d]/g, '');
    
    // Verifica se tem 14 dígitos
    if (cnpjClean.length !== 14) return false;
    
    // Verifica se não são todos iguais
    if (/^(\d)\1{13}$/.test(cnpjClean)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    let weight = 5;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnpjClean.charAt(i)) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    let digit = 11 - (sum % 11);
    if (digit > 9) digit = 0;
    if (parseInt(cnpjClean.charAt(12)) !== digit) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    weight = 6;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cnpjClean.charAt(i)) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    digit = 11 - (sum % 11);
    if (digit > 9) digit = 0;
    if (parseInt(cnpjClean.charAt(13)) !== digit) return false;
    
    return true;
  },
  
  // Validar CPF
  validateCPF: (cpf) => {
    // Remove caracteres não numéricos
    const cpfClean = cpf.replace(/[^\d]/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpfClean.length !== 11) return false;
    
    // Verifica se não são todos iguais
    if (/^(\d)\1{10}$/.test(cpfClean)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpfClean.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit > 9) digit = 0;
    if (parseInt(cpfClean.charAt(9)) !== digit) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpfClean.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit > 9) digit = 0;
    if (parseInt(cpfClean.charAt(10)) !== digit) return false;
    
    return true;
  },
  
  // Validar se data não é retroativa
  validateFutureDate: (date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Remove horas para comparar apenas a data
    
    return selectedDate >= today;
  },
  
  // Formatar telefone (apenas números)
  formatPhone: (phone) => {
    return phone.replace(/[^\d]/g, '');
  },
  
  // Formatar CNPJ/CPF (apenas números)
  formatDocument: (document) => {
    return document.replace(/[^\d]/g, '');
  },
  
  // Gerar ID único
  generateId: () => {
    return Math.random().toString(36).substr(2, 9);
  },

  // Verificar se é dia de trabalho
  isWorkingDay: (date, diasTrabalho) => {
    const dayOfWeek = new Date(date).getDay(); // 0 = Domingo, 1 = Segunda, etc.
    return diasTrabalho.includes(dayOfWeek);
  },

  // Gerar horários disponíveis para uma data
  generateAvailableSlots: (date, horarioInicio, horarioFim, duracao, intervalos) => {
    const slots = [];
    const startTime = new Date(`${date}T${horarioInicio}`);
    const endTime = new Date(`${date}T${horarioFim}`);
    
    let currentTime = new Date(startTime);
    
    while (currentTime < endTime) {
      const slotStart = new Date(currentTime);
      const slotEnd = new Date(currentTime.getTime() + duracao * 60000);
      
      if (slotEnd <= endTime) {
        slots.push({
          inicio: slotStart.toTimeString().slice(0, 5),
          fim: slotEnd.toTimeString().slice(0, 5),
          duracao: duracao
        });
      }
      
      currentTime = new Date(currentTime.getTime() + (duracao + intervalos) * 60000);
    }
    
    return slots;
  },

  // Verificar conflitos de horário
  hasTimeConflicts: (newStart, newEnd, existingAppointments) => {
    const newStartTime = new Date(`2000-01-01T${newStart}`);
    const newEndTime = new Date(`2000-01-01T${newEnd}`);
    
    return existingAppointments.some(appointment => {
      if (appointment.status === 'cancelado') return false;
      
      const existingStart = new Date(`2000-01-01T${appointment.hora_inicio}`);
      const existingEnd = new Date(`2000-01-01T${appointment.hora_fim}`);
      
      // Verificar sobreposição
      return (newStartTime < existingEnd && newEndTime > existingStart);
    });
  },

  // Filtrar horários disponíveis removendo conflitos
  filterAvailableSlots: (slots, existingAppointments) => {
    return slots.filter(slot => {
      return !utils.hasTimeConflicts(slot.inicio, slot.fim, existingAppointments);
    });
  },

  // Formatar horário para exibição
  formatTimeSlot: (inicio, fim) => {
    return `${inicio} - ${fim}`;
  }
};

export default api; 
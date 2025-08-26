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
  
  // Gerar ID único
  generateId: () => {
    return Math.random().toString(36).substr(2, 9);
  },
};

export default api; 
// Serviço de Notificações Múltiplas
class NotificationService {
  constructor() {
    this.notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
  }

  // Salvar notificações no localStorage
  saveNotifications() {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }

  // Enviar notificação de novo agendamento
  async sendNewAppointmentNotification(agendamento, empresa, funcionario, cliente) {
    const notification = {
      id: Date.now().toString(),
      type: 'new_appointment',
      empresa_id: empresa.id,
      agendamento_id: agendamento.id,
      cliente_id: cliente?.id,
      funcionario_id: funcionario.id,
      message: `Novo agendamento: ${cliente?.nome || agendamento.nome} - ${agendamento.data} às ${agendamento.hora}`,
      channels: ['email', 'whatsapp', 'app'],
      status: 'pending',
      created_at: new Date().toISOString()
    };

    this.notifications.push(notification);
    this.saveNotifications();

    // Simular envio por diferentes canais
    await this.sendEmailNotification(notification, empresa, cliente);
    await this.sendWhatsAppNotification(notification, empresa, cliente);
    await this.sendAppNotification(notification, empresa);

    return notification;
  }

  // Enviar notificação de confirmação
  async sendConfirmationNotification(agendamento, empresa, cliente) {
    const notification = {
      id: Date.now().toString(),
      type: 'confirmation',
      empresa_id: empresa.id,
      agendamento_id: agendamento.id,
      cliente_id: cliente?.id,
      message: `Agendamento confirmado: ${agendamento.data} às ${agendamento.hora}`,
      channels: ['email', 'whatsapp', 'app'],
      status: 'pending',
      created_at: new Date().toISOString()
    };

    this.notifications.push(notification);
    this.saveNotifications();

    await this.sendEmailNotification(notification, empresa, cliente);
    await this.sendWhatsAppNotification(notification, empresa, cliente);
    await this.sendAppNotification(notification, empresa);

    return notification;
  }

  // Enviar notificação de cancelamento
  async sendCancellationNotification(agendamento, empresa, cliente, motivo = '') {
    const notification = {
      id: Date.now().toString(),
      type: 'cancellation',
      empresa_id: empresa.id,
      agendamento_id: agendamento.id,
      cliente_id: cliente?.id,
      message: `Agendamento cancelado: ${agendamento.data} às ${agendamento.hora}${motivo ? ` - Motivo: ${motivo}` : ''}`,
      channels: ['email', 'whatsapp', 'app'],
      status: 'pending',
      created_at: new Date().toISOString()
    };

    this.notifications.push(notification);
    this.saveNotifications();

    await this.sendEmailNotification(notification, empresa, cliente);
    await this.sendWhatsAppNotification(notification, empresa, cliente);
    await this.sendAppNotification(notification, empresa);

    return notification;
  }

  // Enviar notificação de lembrete
  async sendReminderNotification(agendamento, empresa, cliente, horasAntes = 24) {
    const notification = {
      id: Date.now().toString(),
      type: 'reminder',
      empresa_id: empresa.id,
      agendamento_id: agendamento.id,
      cliente_id: cliente?.id,
      message: `Lembrete: Você tem um agendamento amanhã às ${agendamento.hora}`,
      channels: ['email', 'whatsapp', 'app'],
      status: 'pending',
      created_at: new Date().toISOString()
    };

    this.notifications.push(notification);
    this.saveNotifications();

    await this.sendEmailNotification(notification, empresa, cliente);
    await this.sendWhatsAppNotification(notification, empresa, cliente);
    await this.sendAppNotification(notification, empresa);

    return notification;
  }

  // Simular envio de email
  async sendEmailNotification(notification, empresa, cliente) {
    console.log(`📧 Email enviado para ${cliente?.email || 'cliente'}:`, notification.message);
    
    // Simular delay de envio
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Marcar como enviado
    this.markNotificationSent(notification.id, 'email');
  }

  // Simular envio de WhatsApp
  async sendWhatsAppNotification(notification, empresa, cliente) {
    if (empresa.whatsapp_contato && cliente?.telefone) {
      console.log(`📱 WhatsApp enviado para ${cliente.telefone}:`, notification.message);
      
      // Simular delay de envio
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Marcar como enviado
      this.markNotificationSent(notification.id, 'whatsapp');
    }
  }

  // Simular notificação no app
  async sendAppNotification(notification, empresa) {
    console.log(`🔔 Notificação no app para ${empresa.razaoSocial}:`, notification.message);
    
    // Simular delay de envio
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Marcar como enviado
    this.markNotificationSent(notification.id, 'app');
  }

  // Marcar notificação como enviada
  markNotificationSent(notificationId, channel) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      if (!notification.sent_channels) {
        notification.sent_channels = [];
      }
      notification.sent_channels.push(channel);
      
      // Se todos os canais foram enviados, marcar como completa
      if (notification.sent_channels.length === notification.channels.length) {
        notification.status = 'sent';
      }
      
      this.saveNotifications();
    }
  }

  // Obter notificações por empresa
  getNotificationsByEmpresa(empresaId) {
    return this.notifications.filter(n => n.empresa_id === empresaId);
  }

  // Obter notificações por cliente
  getNotificationsByCliente(clienteId) {
    return this.notifications.filter(n => n.cliente_id === clienteId);
  }

  // Obter estatísticas de notificações
  getNotificationStats(empresaId) {
    const empresaNotifications = this.getNotificationsByEmpresa(empresaId);
    
    return {
      total: empresaNotifications.length,
      sent: empresaNotifications.filter(n => n.status === 'sent').length,
      pending: empresaNotifications.filter(n => n.status === 'pending').length,
      byType: {
        new_appointment: empresaNotifications.filter(n => n.type === 'new_appointment').length,
        confirmation: empresaNotifications.filter(n => n.type === 'confirmation').length,
        cancellation: empresaNotifications.filter(n => n.type === 'cancellation').length,
        reminder: empresaNotifications.filter(n => n.type === 'reminder').length
      }
    };
  }

  // Limpar notificações antigas (mais de 30 dias)
  cleanOldNotifications() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    this.notifications = this.notifications.filter(n => 
      new Date(n.created_at) > thirtyDaysAgo
    );
    
    this.saveNotifications();
  }
}

// Instância singleton
const notificationService = new NotificationService();

export default notificationService;

const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuração do transporter (SendGrid)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'seu-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'sua-senha-app'
  }
});

// Configuração alternativa para SendGrid
const sendGridTransporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});

// Usar SendGrid se disponível, senão usar Gmail
const emailTransporter = process.env.SENDGRID_API_KEY ? sendGridTransporter : transporter;

// Templates de e-mail
const emailTemplates = {
  welcome: (nome) => ({
    subject: 'Bem-vindo ao Sistema de Agendamento! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Bem-vindo, ${nome}! 🎉</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Seu sistema de agendamento está pronto para uso</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">O que você pode fazer agora:</h2>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #667eea; margin: 0;">📅 Configurar sua agenda</h3>
            <p style="margin: 5px 0; color: #666;">Defina seus horários disponíveis e disponibilize para clientes</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #667eea; margin: 0;">🔗 Compartilhar link</h3>
            <p style="margin: 5px 0; color: #666;">Envie o link da sua agenda para clientes agendarem</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #667eea; margin: 0;">📱 Gerenciar agendamentos</h3>
            <p style="margin: 5px 0; color: #666;">Acompanhe todos os agendamentos pelo dashboard</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #667eea; margin: 0;">⚡ Plano Free</h3>
            <p style="margin: 5px 0; color: #666;">Você tem acesso gratuito a até 10 agendamentos por mês</p>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; background: #e9ecef;">
          <p style="margin: 0; color: #666;">Precisa de ajuda? Entre em contato conosco</p>
          <p style="margin: 5px 0; color: #666;">suporte@seudominio.com</p>
        </div>
      </div>
    `
  }),

  appointmentConfirmation: (dados) => ({
    subject: 'Agendamento Confirmado! ✅',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #28a745; padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Agendamento Confirmado! ✅</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">Detalhes do seu agendamento:</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Serviço:</strong> ${dados.servico}</p>
            <p><strong>Data:</strong> ${dados.data}</p>
            <p><strong>Horário:</strong> ${dados.horario}</p>
            <p><strong>Local:</strong> ${dados.local || 'A ser definido'}</p>
            ${dados.link_meeting ? `<p><strong>Link da reunião:</strong> <a href="${dados.link_meeting}">${dados.link_meeting}</a></p>` : ''}
          </div>
          
          <div style="background: #e7f3ff; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
            <p style="margin: 0; color: #0056b3;"><strong>Lembrete:</strong> Chegue com 10 minutos de antecedência</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dados.link_cancelamento}" style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Cancelar Agendamento</a>
            <a href="${dados.link_reagendamento}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-left: 10px;">Reagendar</a>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; background: #e9ecef;">
          <p style="margin: 0; color: #666;">Dúvidas? Entre em contato: ${dados.contato}</p>
        </div>
      </div>
    `
  }),

  appointmentReminder: (dados) => ({
    subject: 'Lembrete: Seu agendamento é hoje! ⏰',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ffc107; padding: 30px; text-align: center; color: #333;">
          <h1 style="margin: 0; font-size: 28px;">⏰ Lembrete de Agendamento</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Seu agendamento é hoje!</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">Detalhes do agendamento:</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Serviço:</strong> ${dados.servico}</p>
            <p><strong>Data:</strong> ${dados.data}</p>
            <p><strong>Horário:</strong> ${dados.horario}</p>
            <p><strong>Local:</strong> ${dados.local || 'A ser definido'}</p>
            ${dados.link_meeting ? `<p><strong>Link da reunião:</strong> <a href="${dados.link_meeting}">${dados.link_meeting}</a></p>` : ''}
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <p style="margin: 0; color: #856404;"><strong>Importante:</strong> Chegue com 10 minutos de antecedência</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dados.link_cancelamento}" style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Cancelar Agendamento</a>
            <a href="${dados.link_reagendamento}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-left: 10px;">Reagendar</a>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; background: #e9ecef;">
          <p style="margin: 0; color: #666;">Dúvidas? Entre em contato: ${dados.contato}</p>
        </div>
      </div>
    `
  }),

  appointmentCancellation: (dados) => ({
    subject: 'Agendamento Cancelado ❌',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc3545; padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Agendamento Cancelado ❌</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">Seu agendamento foi cancelado:</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Serviço:</strong> ${dados.servico}</p>
            <p><strong>Data:</strong> ${dados.data}</p>
            <p><strong>Horário:</strong> ${dados.horario}</p>
            <p><strong>Motivo:</strong> ${dados.motivo || 'Não informado'}</p>
          </div>
          
          <div style="background: #f8d7da; padding: 15px; border-left: 4px solid #dc3545; margin: 20px 0;">
            <p style="margin: 0; color: #721c24;"><strong>Gostaria de reagendar?</strong> Entre em contato conosco para marcar uma nova data</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dados.link_novo_agendamento}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Fazer Novo Agendamento</a>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; background: #e9ecef;">
          <p style="margin: 0; color: #666;">Dúvidas? Entre em contato: ${dados.contato}</p>
        </div>
      </div>
    `
  })
};

// Funções principais
const sendEmail = async (to, template, data = {}) => {
  try {
    if (!emailTemplates[template]) {
      throw new Error(`Template de e-mail '${template}' não encontrado`);
    }

    const emailContent = emailTemplates[template](data);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@timeflow.com',
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const result = await emailTransporter.sendMail(mailOptions);
    console.log(`✅ E-mail enviado para ${to}: ${template}`);
    return result;

  } catch (error) {
    console.error(`❌ Erro ao enviar e-mail para ${to}:`, error);
    throw error;
  }
};

// Funções específicas
const sendWelcomeEmail = async (email, nome) => {
  return sendEmail(email, 'welcome', { nome });
};

const sendAppointmentConfirmation = async (email, dados) => {
  return sendEmail(email, 'appointmentConfirmation', dados);
};

const sendAppointmentReminder = async (email, dados) => {
  return sendEmail(email, 'appointmentReminder', dados);
};

const sendAppointmentCancellation = async (email, dados) => {
  return sendEmail(email, 'appointmentCancellation', dados);
};

// Função para enviar e-mail personalizado
const sendCustomEmail = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@timeflow.com',
      to: to,
      subject: subject,
      html: htmlContent
    };

    const result = await emailTransporter.sendMail(mailOptions);
    console.log(`✅ E-mail personalizado enviado para ${to}`);
    return result;

  } catch (error) {
    console.error(`❌ Erro ao enviar e-mail personalizado para ${to}:`, error);
    throw error;
  }
};

// Testar conexão
const testConnection = async () => {
  try {
    await emailTransporter.verify();
    console.log('✅ Conexão com serviço de e-mail estabelecida');
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão com serviço de e-mail:', error);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendAppointmentConfirmation,
  sendAppointmentReminder,
  sendAppointmentCancellation,
  sendCustomEmail,
  testConnection
}; 
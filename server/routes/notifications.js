const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { sendAppointmentConfirmation, sendAppointmentReminder, sendAppointmentCancellation } = require('../services/emailService');
const { getOwnedEmpresaIds } = require('../middleware/userPermissions');
const { Agendamento, User, Empresa } = require('../models');

const router = express.Router();

async function canSendNotification(user, agendamento) {
  if (user.tipo === 'cliente') return agendamento.cliente_id === user.id;
  if (user.tipo === 'funcionario') return agendamento.funcionario_id === user.id;
  if (user.tipo === 'empresa') {
    const ownedIds = await getOwnedEmpresaIds(user);
    return ownedIds.some((id) => String(id) === String(agendamento.empresa_id));
  }
  return false;
}

async function findAuthorizedAppointment(req, res) {
  const agendamento = await Agendamento.findByPk(req.params.agendamentoId, {
    include: [
      { model: User, as: 'cliente', attributes: ['nome', 'email', 'telefone'] },
      { model: Empresa, as: 'empresa', attributes: ['nome', 'telefone'] }
    ]
  });
  if (!agendamento) {
    res.status(404).json({ success: false, message: 'Agendamento não encontrado' });
    return null;
  }
  if (!await canSendNotification(req.user, agendamento)) {
    res.status(403).json({ success: false, message: 'Sem permissão para este agendamento' });
    return null;
  }
  return agendamento;
}

// POST /api/notifications/email/confirmation/:agendamentoId - Enviar confirmação por email
router.post('/email/confirmation/:agendamentoId', authenticateToken, async (req, res) => {
  try {
    const { agendamentoId } = req.params;
    const agendamento = await findAuthorizedAppointment(req, res);
    if (!agendamento) return;

    // Dados para o email
    const emailData = {
      servico: agendamento.servico || 'Serviço',
      data: agendamento.data,
      horario: agendamento.hora,
      local: agendamento.local || 'A ser definido',
      contato: agendamento.empresa.telefone || agendamento.empresa.email,
      link_cancelamento: `${process.env.FRONTEND_URL}/cancelar/${agendamentoId}`,
      link_reagendamento: `${process.env.FRONTEND_URL}/reagendar/${agendamentoId}`
    };

    // Enviar email
    await sendAppointmentConfirmation(agendamento.cliente.email, emailData);

    res.json({
      success: true,
      message: 'Email de confirmação enviado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao enviar email de confirmação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/notifications/email/reminder/:agendamentoId - Enviar lembrete por email
router.post('/email/reminder/:agendamentoId', authenticateToken, async (req, res) => {
  try {
    const { agendamentoId } = req.params;
    const agendamento = await findAuthorizedAppointment(req, res);
    if (!agendamento) return;

    // Dados para o email
    const emailData = {
      servico: agendamento.servico || 'Serviço',
      data: agendamento.data,
      horario: agendamento.hora,
      local: agendamento.local || 'A ser definido',
      contato: agendamento.empresa.telefone || agendamento.empresa.email,
      link_cancelamento: `${process.env.FRONTEND_URL}/cancelar/${agendamentoId}`,
      link_reagendamento: `${process.env.FRONTEND_URL}/reagendar/${agendamentoId}`
    };

    // Enviar email
    await sendAppointmentReminder(agendamento.cliente.email, emailData);

    res.json({
      success: true,
      message: 'Email de lembrete enviado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao enviar email de lembrete:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/notifications/whatsapp/:agendamentoId - Enviar notificação por WhatsApp
router.post('/whatsapp/:agendamentoId', authenticateToken, async (req, res) => {
  try {
    const { agendamentoId } = req.params;
    const { tipo } = req.body; // 'confirmation', 'reminder', 'cancellation'
    if (!['confirmation', 'reminder', 'cancellation'].includes(tipo)) {
      return res.status(400).json({ success: false, message: 'Tipo de notificação inválido' });
    }
    const agendamento = await findAuthorizedAppointment(req, res);
    if (!agendamento) return;

    if (!agendamento.cliente.telefone) {
      return res.status(400).json({
        success: false,
        message: 'Cliente não possui telefone cadastrado'
      });
    }

    // Aqui você integraria com Twilio ou outro serviço de WhatsApp
    // Por enquanto, apenas logamos a ação
    console.log(`📱 WhatsApp ${tipo} para ${agendamento.cliente.telefone}: Agendamento ${agendamentoId}`);

    res.json({
      success: true,
      message: `Notificação WhatsApp (${tipo}) enviada com sucesso`
    });

  } catch (error) {
    console.error('❌ Erro ao enviar notificação WhatsApp:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;

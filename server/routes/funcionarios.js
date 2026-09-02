const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { checkFuncionarioEmpresa } = require('../middleware/userPermissions');
const { Empresa, User, Agendamento, sequelize } = require('../models');
const { isKnownStatus, canTransitionAppointment } = require('../utils/appointmentStatus');

// GET /api/funcionarios/empresa - Buscar dados da empresa do funcionário
router.get('/empresa', authenticateToken, checkFuncionarioEmpresa, async (req, res) => {
  try {
    const empresa = req.empresa;

    // Construir URLs completas
    let logoUrl = null;
    if (empresa.logo_url) {
      logoUrl = empresa.logo_url.startsWith('http') 
        ? empresa.logo_url 
        : `${req.protocol}://${req.get('host')}${empresa.logo_url}`;
    }

    let imagemFundoUrl = null;
    if (empresa.imagem_fundo_url) {
      imagemFundoUrl = empresa.imagem_fundo_url.startsWith('http')
        ? empresa.imagem_fundo_url
        : `${req.protocol}://${req.get('host')}${empresa.imagem_fundo_url}`;
    }

    // Retornar dados da empresa com URLs completas
    const empresaCompleta = {
      ...empresa.toJSON(),
      logo_url: logoUrl,
      imagem_fundo_url: imagemFundoUrl
    };

    res.json({
      success: true,
      data: empresaCompleta
    });
  } catch (error) {
    console.error('❌ Erro ao buscar dados da empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/funcionarios/agendamentos - Buscar agendamentos da empresa do funcionário
router.get('/agendamentos', authenticateToken, checkFuncionarioEmpresa, async (req, res) => {
  try {
    const empresa = req.empresa;
    const funcionario = req.user;

    // Buscar agendamentos do funcionário na empresa
    const agendamentos = await Agendamento.findAll({
      where: {
        empresa_id: empresa.id,
        funcionario_id: funcionario.id
      },
      include: [
        {
          model: User,
          as: 'cliente',
          attributes: ['id', 'nome', 'telefone', 'email']
        }
      ],
      order: [['data', 'ASC'], ['hora', 'ASC']]
    });

    res.json({
      success: true,
      data: agendamentos
    });
  } catch (error) {
    console.error('❌ Erro ao buscar agendamentos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/funcionarios/agendamento/:id/status - Atualizar status do agendamento
router.put('/agendamento/:id/status', authenticateToken, checkFuncionarioEmpresa, async (req, res) => {
  try {
    const { status } = req.body;
    const agendamentoId = req.params.id;
    const funcionario = req.user;
    const empresa = req.empresa;

    if (!isKnownStatus(status) || status === 'em_aprovacao') {
      return res.status(400).json({ success: false, message: 'Status inválido' });
    }

    const agendamento = await sequelize.transaction(async (transaction) => {
      const appointment = await Agendamento.findOne({
        where: {
          id: agendamentoId,
          empresa_id: empresa.id,
          funcionario_id: funcionario.id
        },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!appointment) return null;
      if (!canTransitionAppointment(appointment.status, status)) {
        const transitionError = new Error(`Não é possível alterar de ${appointment.status} para ${status}`);
        transitionError.statusCode = 409;
        throw transitionError;
      }

      const updateData = { status };
      if (status === 'confirmado' || status === 'agendado') updateData.data_confirmacao = new Date();
      if (status === 'realizado') updateData.data_realizacao = new Date();
      if (status === 'cancelado') {
        updateData.data_cancelamento = new Date();
        updateData.cancelado_por = 'funcionario';
      }
      await appointment.update(updateData, { transaction });
      return appointment;
    });

    if (!agendamento) {
      return res.status(404).json({ success: false, message: 'Agendamento não encontrado' });
    }

    res.json({
      success: true,
      message: 'Status do agendamento atualizado com sucesso',
      data: agendamento
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar agendamento:', error);
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;

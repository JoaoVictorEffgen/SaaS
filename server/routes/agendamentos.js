const express = require('express');
const router = express.Router();
const { Agendamento, User, Empresa, Servico, sequelize } = require('../models');
const { Op, Transaction } = require('sequelize');
const { authenticateToken: auth } = require('../middleware/auth');
const { canTransitionAppointment, belongsToCurrentStaffCompany } = require('../utils/appointmentStatus');
const { getBusinessClock, isFutureBusinessSlot, isValidDateOnly } = require('../utils/businessTime');

async function getEmpresaIdDoUsuario(user) {
  if (user.tipo === 'empresa') {
    const empresa = await Empresa.findOne({ where: { user_id: user.id } });
    return empresa?.id || null;
  }
  return user.empresa_id || null;
}

async function canManageAgendamento(user, agendamento) {
  if (user.tipo === 'cliente') return agendamento.cliente_id === user.id;
  if (user.tipo === 'funcionario') return belongsToCurrentStaffCompany(user, agendamento);
  if (user.tipo === 'empresa') return agendamento.empresa_id === await getEmpresaIdDoUsuario(user);
  return false;
}

const timeToMinutes = (value) => {
  const match = String(value || '').match(/^(\d{2}):(\d{2})/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours <= 23 && minutes <= 59 ? hours * 60 + minutes : null;
};

const getAppointmentDuration = (appointment) => {
  const duration = (appointment.servicos || []).reduce(
    (total, service) => total + (Number(service.duracao_minutos) || 0),
    0
  );
  return duration || 60;
};

// GET /api/agendamentos - Listar agendamentos
router.get('/', auth, async (req, res) => {
  try {
    let whereClause = {};
    
    // Filtrar por tipo de usuário
    if (req.user.tipo === 'empresa') {
      const empresaId = await getEmpresaIdDoUsuario(req.user);
      if (!empresaId) return res.status(404).json({ error: 'Empresa não encontrada' });
      whereClause.empresa_id = empresaId;
    } else if (req.user.tipo === 'funcionario') {
      if (!req.user.empresa_id) return res.json([]);
      whereClause.funcionario_id = req.user.id;
      whereClause.empresa_id = req.user.empresa_id;
    } else if (req.user.tipo === 'cliente') {
      whereClause.cliente_id = req.user.id;
    }
    
    const agendamentos = await Agendamento.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'cliente',
          attributes: ['nome', 'email', 'telefone']
        },
        {
          model: User,
          as: 'funcionario',
          attributes: ['nome', 'email', 'telefone']
        },
        {
          model: Empresa,
          as: 'empresa',
          attributes: ['id', 'nome', 'endereco', 'telefone']
        }
      ],
      order: [['data', 'DESC'], ['hora', 'DESC']]
    });
    
    res.json(agendamentos);
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/agendamentos - Criar novo agendamento
router.post('/', auth, async (req, res) => {
  try {
    const {
      empresa_id,
      funcionario_id,
      data_agendamento,
      hora_inicio,
      servicos,
      observacoes,
    } = req.body;
    
    if (req.user.tipo !== 'cliente') {
      return res.status(403).json({ error: 'Apenas clientes podem criar agendamentos' });
    }
    const empresa = await Empresa.findOne({ where: { id: empresa_id, ativo: true } });
    const funcionario = await User.findOne({
      where: { id: funcionario_id, tipo: 'funcionario', empresa_id, ativo: true }
    });
    if (!empresa || !funcionario) {
      return res.status(400).json({ error: 'Empresa ou funcionário inválido' });
    }
    const data = data_agendamento || req.body.data;
    const hora = hora_inicio || req.body.hora;
    if (!data || !hora) {
      return res.status(400).json({ error: 'Data e horário são obrigatórios' });
    }
    const requestedMinutes = timeToMinutes(hora);
    if (!isValidDateOnly(data) || requestedMinutes === null) {
      return res.status(400).json({ error: 'Data ou horário inválido' });
    }
    if (!isFutureBusinessSlot(data, requestedMinutes)) {
      return res.status(400).json({ error: 'Escolha uma data e horário futuros' });
    }

    const servicoIds = Array.isArray(servicos)
      ? servicos.map((item) => Number(item?.id ?? item)).filter(Number.isInteger)
      : [];
    if (servicoIds.length === 0) {
      return res.status(400).json({ error: 'Selecione ao menos um serviço' });
    }

    const servicosValidos = await Servico.findAll({
      where: { id: servicoIds, empresa_id, ativo: true }
    });
    if (servicosValidos.length !== new Set(servicoIds).size) {
      return res.status(400).json({ error: 'Um ou mais serviços não pertencem à empresa' });
    }

    const servicosSnapshot = servicosValidos.map((servico) => ({
      id: servico.id,
      nome: servico.nome,
      duracao_minutos: servico.duracao_minutos,
      preco: Number(servico.preco)
    }));

    const dayKeys = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const dayKey = dayKeys[new Date(`${data}T12:00:00Z`).getUTCDay()];
    const dayAvailability = funcionario.disponibilidade?.[dayKey];
    const companyHours = empresa.horario_funcionamento || {};
    const companyDays = Array.isArray(companyHours.dias_trabalho) ? companyHours.dias_trabalho.map(Number) : [];
    const dayIndex = new Date(`${data}T12:00:00Z`).getUTCDay();
    if (!dayAvailability && companyDays.length > 0 && !companyDays.includes(dayIndex)) {
      return res.status(409).json({ error: 'A empresa não atende neste dia' });
    }
    if (dayAvailability && !dayAvailability.disponivel) {
      return res.status(409).json({ error: 'O funcionário não atende neste dia' });
    }

    const startMinutes = requestedMinutes;
    const endMinutes = startMinutes + servicosSnapshot.reduce((total, service) => total + service.duracao_minutos, 0);
    const workStart = timeToMinutes(dayAvailability?.inicio || companyHours.horario_inicio || companyHours.inicio || '08:00');
    const workEnd = timeToMinutes(dayAvailability?.fim || companyHours.horario_fim || companyHours.fim || '18:00');
    if (startMinutes < workStart || endMinutes > workEnd) {
      return res.status(409).json({ error: 'O serviço não cabe no horário de atendimento' });
    }
    const overlapsBreak = (funcionario.pausas || []).some((pause) => {
      if (Array.isArray(pause.dias) && !pause.dias.includes(dayKey)) return false;
      const pauseStart = timeToMinutes(pause.inicio);
      const pauseEnd = timeToMinutes(pause.fim);
      return pauseStart !== null && pauseEnd !== null && startMinutes < pauseEnd && endMinutes > pauseStart;
    });
    if (overlapsBreak) return res.status(409).json({ error: 'O horário coincide com uma pausa do funcionário' });

    // O lock no funcionário serializa reservas concorrentes da mesma agenda.
    const agendamento = await sequelize.transaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
    }, async (transaction) => {
      await User.findByPk(funcionario.id, { transaction, lock: transaction.LOCK.UPDATE });
      const existentes = await Agendamento.findAll({
        where: {
          funcionario_id,
          data,
          status: { [Op.in]: ['em_aprovacao', 'agendado', 'confirmado'] }
        },
        transaction,
        lock: transaction.LOCK.UPDATE
      });
      const hasOverlap = existentes.some((existing) => {
        const existingStart = timeToMinutes(existing.hora);
        const existingEnd = existingStart + getAppointmentDuration(existing);
        return startMinutes < existingEnd && endMinutes > existingStart;
      });
      if (hasOverlap) {
        const error = new Error('Este horário não está mais disponível');
        error.statusCode = 409;
        throw error;
      }

      return Agendamento.create({
        empresa_id,
        cliente_id: req.user.id,
        funcionario_id,
        data,
        hora,
        status: 'em_aprovacao',
        observacoes,
        servicos: servicosSnapshot,
        valor_total: servicosSnapshot.reduce((total, servico) => total + servico.preco, 0)
      }, { transaction });
    });
    
    res.status(201).json(agendamento);
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/agendamentos/:id/confirmar - Confirmar agendamento
router.put('/:id/confirmar', auth, async (req, res) => {
  try {
    const agendamento = await sequelize.transaction(async (transaction) => {
      const appointment = await Agendamento.findByPk(req.params.id, {
        transaction,
        lock: transaction.LOCK.UPDATE
      });
      if (!appointment) return null;
      if (!['funcionario', 'empresa'].includes(req.user.tipo) || !await canManageAgendamento(req.user, appointment)) {
        const permissionError = new Error('Sem permissão para confirmar');
        permissionError.statusCode = 403;
        throw permissionError;
      }
      if (!canTransitionAppointment(appointment.status, 'confirmado')) {
        const transitionError = new Error(`O agendamento ${appointment.status} não pode ser confirmado`);
        transitionError.statusCode = 409;
        throw transitionError;
      }
      await appointment.update({ status: 'confirmado', data_confirmacao: new Date() }, { transaction });
      return appointment;
    });

    if (!agendamento) return res.status(404).json({ error: 'Agendamento não encontrado' });
    
    res.json(agendamento);
  } catch (error) {
    console.error('Erro ao confirmar agendamento:', error);
    if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/agendamentos/:id/cancelar - Cancelar agendamento
router.put('/:id/cancelar', auth, async (req, res) => {
  try {
    const { justificativa } = req.body;
    const agendamento = await sequelize.transaction(async (transaction) => {
      const appointment = await Agendamento.findByPk(req.params.id, {
        transaction,
        lock: transaction.LOCK.UPDATE
      });
      if (!appointment) return null;
      if (!await canManageAgendamento(req.user, appointment)) {
        const permissionError = new Error('Sem permissão para cancelar este agendamento');
        permissionError.statusCode = 403;
        throw permissionError;
      }
      if (!canTransitionAppointment(appointment.status, 'cancelado')) {
        const transitionError = new Error(`O agendamento ${appointment.status} não pode ser cancelado`);
        transitionError.statusCode = 409;
        throw transitionError;
      }
      await appointment.update({
        status: 'cancelado',
        data_cancelamento: new Date(),
        justificativa_cancelamento: justificativa,
        cancelado_por: req.user.tipo === 'empresa' ? 'sistema' : req.user.tipo
      }, { transaction });
      return appointment;
    });

    if (!agendamento) return res.status(404).json({ error: 'Agendamento não encontrado' });
    
    res.json(agendamento);
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error);
    if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/agendamentos/hoje - Agendamentos do dia
router.get('/hoje', auth, async (req, res) => {
  try {
    const dataHoje = getBusinessClock().date;
    
    let whereClause = {
      data: dataHoje
    };
    
    // Filtrar por tipo de usuário
    if (req.user.tipo === 'empresa') {
      const empresaId = await getEmpresaIdDoUsuario(req.user);
      if (!empresaId) return res.status(404).json({ error: 'Empresa não encontrada' });
      whereClause.empresa_id = empresaId;
    } else if (req.user.tipo === 'funcionario') {
      whereClause.funcionario_id = req.user.id;
    }
    
    const agendamentos = await Agendamento.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'cliente',
          attributes: ['nome', 'email', 'telefone']
        },
        {
          model: User,
          as: 'funcionario',
          attributes: ['nome', 'email']
        }
      ],
      order: [['hora', 'ASC']]
    });
    
    res.json(agendamentos);
  } catch (error) {
    console.error('Erro ao buscar agendamentos de hoje:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

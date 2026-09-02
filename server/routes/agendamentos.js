const express = require('express');
const router = express.Router();
const { Agendamento, User, Empresa, Servico } = require('../models');
const { Op } = require('sequelize');
const { authenticateToken: auth } = require('../middleware/auth');

async function getEmpresaIdDoUsuario(user) {
  if (user.tipo === 'empresa') {
    const empresa = await Empresa.findOne({ where: { user_id: user.id } });
    return empresa?.id || null;
  }
  return user.empresa_id || null;
}

async function canManageAgendamento(user, agendamento) {
  if (user.tipo === 'cliente') return agendamento.cliente_id === user.id;
  if (user.tipo === 'funcionario') return agendamento.funcionario_id === user.id;
  if (user.tipo === 'empresa') return agendamento.empresa_id === await getEmpresaIdDoUsuario(user);
  return false;
}

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
      whereClause.funcionario_id = req.user.id;
    } else if (req.user.tipo === 'cliente') {
      whereClause.cliente_id = req.user.id;
    } else {
      return res.status(403).json({ error: 'Sem permissão para listar agendamentos' });
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
          attributes: ['nome', 'endereco', 'telefone']
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
      hora_fim,
      servicos,
      observacoes,
      valor_total
    } = req.body;
    
    if (req.user.tipo !== 'cliente') {
      return res.status(403).json({ error: 'Apenas clientes podem criar agendamentos' });
    }
    const empresa = await Empresa.findOne({ where: { id: empresa_id, ativo: true } });
    const funcionario = await User.findOne({
      where: { id: funcionario_id, tipo: 'funcionario', empresa_id }
    });
    if (!empresa || !funcionario) {
      return res.status(400).json({ error: 'Empresa ou funcionário inválido' });
    }
    const data = data_agendamento || req.body.data;
    const hora = hora_inicio || req.body.hora;
    if (!data || !hora) {
      return res.status(400).json({ error: 'Data e horário são obrigatórios' });
    }

    const horarioOcupado = await Agendamento.findOne({
      where: {
        funcionario_id,
        data,
        hora,
        status: { [Op.notIn]: ['cancelado'] }
      }
    });
    if (horarioOcupado) {
      return res.status(409).json({ error: 'Horário indisponível para este funcionário' });
    }

    // Criar agendamento
    const agendamento = await Agendamento.create({
      empresa_id,
      cliente_id: req.user.id,
      funcionario_id,
      data,
      hora,
      status: 'em_aprovacao',
      observacoes,
      valor_total: Number.isFinite(Number(valor_total)) ? Number(valor_total) : null
    });
    
    // Associar serviços (se houver tabela de relacionamento)
    if (servicos && servicos.length > 0) {
      // Implementar associação com serviços
    }
    
    res.status(201).json(agendamento);
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/agendamentos/:id/confirmar - Confirmar agendamento
router.put('/:id/confirmar', auth, async (req, res) => {
  try {
    const agendamento = await Agendamento.findByPk(req.params.id);
    
    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    
    if (!['funcionario', 'empresa'].includes(req.user.tipo) || !await canManageAgendamento(req.user, agendamento)) {
      return res.status(403).json({ error: 'Sem permissão para confirmar' });
    }
    
    await agendamento.update({
      status: 'confirmado',
      data_confirmacao: new Date()
    });
    
    res.json(agendamento);
  } catch (error) {
    console.error('Erro ao confirmar agendamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/agendamentos/:id/cancelar - Cancelar agendamento
router.put('/:id/cancelar', auth, async (req, res) => {
  try {
    const agendamento = await Agendamento.findByPk(req.params.id);
    
    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    
    if (!await canManageAgendamento(req.user, agendamento)) {
      return res.status(403).json({ error: 'Sem permissão para cancelar este agendamento' });
    }
    const { justificativa } = req.body;
    
    await agendamento.update({
      status: 'cancelado',
      data_cancelamento: new Date(),
      justificativa_cancelamento: justificativa
    });
    
    res.json(agendamento);
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/agendamentos/hoje - Agendamentos do dia
router.get('/hoje', auth, async (req, res) => {
  try {
    const hoje = new Date();
    const dataHoje = [
      hoje.getFullYear(),
      String(hoje.getMonth() + 1).padStart(2, '0'),
      String(hoje.getDate()).padStart(2, '0')
    ].join('-');
    
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
    } else if (req.user.tipo === 'cliente') {
      whereClause.cliente_id = req.user.id;
    } else {
      return res.status(403).json({ error: 'Sem permissão para listar agendamentos' });
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

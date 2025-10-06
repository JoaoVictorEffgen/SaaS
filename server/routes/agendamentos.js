const express = require('express');
const router = express.Router();
const { Agendamento, User, Empresa, Servico } = require('../models');
const { Op } = require('sequelize');
const auth = require('../middleware/auth');

// GET /api/agendamentos - Listar agendamentos
router.get('/', auth, async (req, res) => {
  try {
    let whereClause = {};
    
    // Filtrar por tipo de usuário
    if (req.user.tipo === 'empresa') {
      whereClause.empresa_id = req.user.id;
    } else if (req.user.tipo === 'funcionario') {
      whereClause.funcionario_id = req.user.id;
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
          attributes: ['razaoSocial', 'endereco', 'telefone']
        }
      ],
      order: [['data_agendamento', 'DESC']]
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
    
    // Criar agendamento
    const agendamento = await Agendamento.create({
      empresa_id,
      cliente_id: req.user.id,
      funcionario_id,
      data_agendamento,
      hora_inicio,
      hora_fim,
      status: 'pendente',
      observacoes,
      valor_total
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
    
    // Verificar se o usuário pode confirmar
    if (req.user.tipo !== 'funcionario' && req.user.tipo !== 'empresa') {
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
    const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const fimDia = new Date(inicioDia.getTime() + 24 * 60 * 60 * 1000);
    
    let whereClause = {
      data_agendamento: {
        [Op.between]: [inicioDia, fimDia]
      }
    };
    
    // Filtrar por tipo de usuário
    if (req.user.tipo === 'empresa') {
      whereClause.empresa_id = req.user.id;
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
      order: [['hora_inicio', 'ASC']]
    });
    
    res.json(agendamentos);
  } catch (error) {
    console.error('Erro ao buscar agendamentos de hoje:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

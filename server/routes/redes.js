const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { RedeEmpresarial, User, Empresa } = require('../models');
const { checkTrialValid, checkCpfCnpjUsed, getTrialStatus, createTrial } = require('../middleware/trialMiddleware');

// Middleware para verificar se usuário é admin de rede
const isRedeAdmin = async (req, res, next) => {
  try {
    const { redeId } = req.params;
    const userId = req.user.id;
    
    const rede = await RedeEmpresarial.findOne({
      where: {
        id: redeId,
        usuario_admin_id: userId
      }
    });
    
    if (!rede) {
      return res.status(403).json({ 
        error: 'Acesso negado. Você não é administrador desta rede.' 
      });
    }
    
    req.rede = rede;
    next();
  } catch (error) {
    console.error('Erro ao verificar admin da rede:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Middleware para verificar plano Enterprise
const checkEnterprisePlan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const rede = await RedeEmpresarial.findOne({
      where: { usuario_admin_id: userId }
    });
    
    if (!rede) {
      return res.status(400).json({ 
        error: 'Usuário não possui uma rede empresarial.' 
      });
    }
    
    if (rede.plano !== 'enterprise') {
      return res.status(403).json({ 
        error: 'Esta funcionalidade requer plano Enterprise.' 
      });
    }
    
    req.rede = rede;
    next();
  } catch (error) {
    console.error('Erro ao verificar plano:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// GET /api/redes - Buscar rede do usuário logado
router.get('/', authenticateToken, getTrialStatus, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const rede = await RedeEmpresarial.findOne({
      where: { usuario_admin_id: userId },
      include: [
        {
          model: Empresa,
          as: 'empresas',
          include: [
            {
              model: User,
              as: 'funcionarios',
              where: { tipo: 'funcionario' },
              required: false,
              attributes: ['id', 'nome', 'email', 'cargo', 'ativo']
            }
          ]
        }
      ]
    });
    
    if (!rede) {
      return res.status(404).json({ 
        error: 'Usuário não possui uma rede empresarial.' 
      });
    }
    
    // Adicionar informações do trial
    const redeComTrial = {
      ...rede.toJSON(),
      trialStatus: req.trialStatus
    };
    
    res.json(redeComTrial);
  } catch (error) {
    console.error('Erro ao buscar rede:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/redes - Criar nova rede empresarial
router.post('/', authenticateToken, checkCpfCnpjUsed, async (req, res) => {
  try {
    const userId = req.user.id;
    const { nome_rede, descricao, plano = 'trial' } = req.body;
    const cpfCnpjLimpo = req.cpfCnpjLimpo;
    
    // Verificar se usuário já possui uma rede
    const redeExistente = await RedeEmpresarial.findOne({
      where: { usuario_admin_id: userId }
    });
    
    if (redeExistente) {
      return res.status(400).json({ 
        error: 'Usuário já possui uma rede empresarial.' 
      });
    }
    
    let rede;
    
    if (plano === 'trial') {
      // Criar trial de 15 dias
      rede = await createTrial(userId, cpfCnpjLimpo);
    } else {
      // Definir limite de empresas baseado no plano
      let limite_empresas = 1;
      if (plano === 'premium') limite_empresas = 3;
      if (plano === 'enterprise') limite_empresas = 999; // Ilimitado
      
      rede = await RedeEmpresarial.create({
        nome_rede,
        descricao,
        usuario_admin_id: userId,
        plano,
        limite_empresas,
        empresas_ativas: 0,
        cpf_cnpj_usado: cpfCnpjLimpo
      });
    }
    
    // Vincular empresa existente à rede (se existir)
    const empresaExistente = await Empresa.findOne({
      where: { user_id: userId }
    });
    
    if (empresaExistente) {
      await empresaExistente.update({ rede_id: rede.id });
      await rede.update({ empresas_ativas: 1 });
    }
    
    res.status(201).json(rede);
  } catch (error) {
    console.error('Erro ao criar rede:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/redes/:redeId/empresas - Criar nova empresa na rede
router.post('/:redeId/empresas', authenticateToken, checkTrialValid, isRedeAdmin, checkEnterprisePlan, async (req, res) => {
  try {
    const { redeId } = req.params;
    const { nome_unidade, endereco, cidade, estado, cep, whatsapp } = req.body;
    
    const rede = req.rede;
    
    // Verificar limite de empresas
    if (rede.empresas_ativas >= rede.limite_empresas) {
      return res.status(400).json({ 
        error: `Limite de empresas atingido. Plano ${rede.plano} permite ${rede.limite_empresas} empresas.` 
      });
    }
    
    // Criar nova empresa vinculada à rede
    const novaEmpresa = await Empresa.create({
      user_id: rede.usuario_admin_id,
      rede_id: redeId,
      nome_unidade: nome_unidade || `${rede.nome_rede} - Unidade ${rede.empresas_ativas + 1}`,
      endereco,
      cidade,
      estado,
      cep,
      whatsapp,
      ativo: true
    });
    
    // Atualizar contador de empresas ativas
    await rede.update({ 
      empresas_ativas: rede.empresas_ativas + 1 
    });
    
    res.status(201).json(novaEmpresa);
  } catch (error) {
    console.error('Erro ao criar empresa na rede:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/redes/:redeId/empresas - Listar empresas da rede
router.get('/:redeId/empresas', authenticateToken, isRedeAdmin, async (req, res) => {
  try {
    const { redeId } = req.params;
    
    const empresas = await Empresa.findAll({
      where: { rede_id: redeId },
      include: [
        {
          model: User,
          as: 'funcionarios',
          where: { tipo: 'funcionario' },
          required: false,
          attributes: ['id', 'nome', 'email', 'cargo', 'ativo']
        }
      ]
    });
    
    res.json(empresas);
  } catch (error) {
    console.error('Erro ao listar empresas da rede:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/redes/:redeId - Atualizar rede
router.put('/:redeId', authenticateToken, isRedeAdmin, async (req, res) => {
  try {
    const { redeId } = req.params;
    const { nome_rede, descricao, logo_rede_url, configuracoes } = req.body;
    
    const rede = await RedeEmpresarial.findByPk(redeId);
    
    if (!rede) {
      return res.status(404).json({ error: 'Rede não encontrada' });
    }
    
    await rede.update({
      nome_rede: nome_rede || rede.nome_rede,
      descricao: descricao || rede.descricao,
      logo_rede_url: logo_rede_url || rede.logo_rede_url,
      configuracoes: configuracoes || rede.configuracoes
    });
    
    res.json(rede);
  } catch (error) {
    console.error('Erro ao atualizar rede:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/redes/:redeId/relatorios - Relatórios consolidados da rede
router.get('/:redeId/relatorios', authenticateToken, isRedeAdmin, async (req, res) => {
  try {
    const { redeId } = req.params;
    const { periodo = '30' } = req.query; // dias
    
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - parseInt(periodo));
    
    // Buscar agendamentos de todas as empresas da rede
    const agendamentos = await Agendamento.findAll({
      include: [
        {
          model: Empresa,
          as: 'empresa',
          where: { rede_id: redeId }
        },
        {
          model: User,
          as: 'cliente',
          attributes: ['nome', 'email']
        },
        {
          model: User,
          as: 'funcionario',
          attributes: ['nome', 'cargo']
        }
      ],
      where: {
        data: {
          [require('sequelize').Op.gte]: dataInicio
        }
      }
    });
    
    // Calcular estatísticas
    const totalAgendamentos = agendamentos.length;
    const agendamentosRealizados = agendamentos.filter(a => a.status === 'realizado').length;
    const agendamentosCancelados = agendamentos.filter(a => a.status === 'cancelado').length;
    const receitaTotal = agendamentos
      .filter(a => a.status === 'realizado' && a.valor_total)
      .reduce((total, a) => total + parseFloat(a.valor_total), 0);
    
    // Estatísticas por empresa
    const statsPorEmpresa = {};
    agendamentos.forEach(agendamento => {
      const empresaNome = agendamento.empresa.nome_unidade || `Empresa ${agendamento.empresa.id}`;
      
      if (!statsPorEmpresa[empresaNome]) {
        statsPorEmpresa[empresaNome] = {
          total: 0,
          realizados: 0,
          cancelados: 0,
          receita: 0
        };
      }
      
      statsPorEmpresa[empresaNome].total++;
      if (agendamento.status === 'realizado') {
        statsPorEmpresa[empresaNome].realizados++;
        if (agendamento.valor_total) {
          statsPorEmpresa[empresaNome].receita += parseFloat(agendamento.valor_total);
        }
      }
      if (agendamento.status === 'cancelado') {
        statsPorEmpresa[empresaNome].cancelados++;
      }
    });
    
    const relatorio = {
      periodo: `${periodo} dias`,
      resumo: {
        totalAgendamentos,
        agendamentosRealizados,
        agendamentosCancelados,
        taxaRealizacao: totalAgendamentos > 0 ? (agendamentosRealizados / totalAgendamentos * 100).toFixed(1) : 0,
        receitaTotal: receitaTotal.toFixed(2)
      },
      porEmpresa: statsPorEmpresa,
      agendamentosRecentes: agendamentos.slice(0, 10) // Últimos 10
    };
    
    res.json(relatorio);
  } catch (error) {
    console.error('Erro ao gerar relatório da rede:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

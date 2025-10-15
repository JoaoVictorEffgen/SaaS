const { RedeEmpresarial } = require('../models');

/**
 * Middleware para verificar se o usuário tem acesso a funcionalidades baseadas no plano
 */
const checkPlanoAccess = (funcionalidade) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      
      // Buscar rede do usuário
      const rede = await RedeEmpresarial.findOne({
        where: { usuario_admin_id: userId }
      });
      
      if (!rede) {
        return res.status(400).json({ 
          error: 'Usuário não possui uma rede empresarial.' 
        });
      }
      
      // Verificar acesso baseado na funcionalidade
      let hasAccess = false;
      let requiredPlan = '';
      
      switch (funcionalidade) {
        case 'multiple_empresas':
          hasAccess = rede.plano === 'trial' || rede.plano === 'premium' || rede.plano === 'enterprise';
          requiredPlan = rede.plano === 'trial' ? 'Trial' : 'Premium';
          break;
          
        case 'unlimited_empresas':
          hasAccess = rede.plano === 'trial' || rede.plano === 'enterprise';
          requiredPlan = rede.plano === 'trial' ? 'Trial' : 'Enterprise';
          break;
          
        case 'relatorios_avancados':
          hasAccess = rede.plano === 'trial' || rede.plano === 'premium' || rede.plano === 'enterprise';
          requiredPlan = rede.plano === 'trial' ? 'Trial' : 'Premium';
          break;
          
        case 'api_access':
          hasAccess = rede.plano === 'trial' || rede.plano === 'enterprise';
          requiredPlan = rede.plano === 'trial' ? 'Trial' : 'Enterprise';
          break;
          
        case 'white_label':
          hasAccess = rede.plano === 'trial' || rede.plano === 'enterprise';
          requiredPlan = rede.plano === 'trial' ? 'Trial' : 'Enterprise';
          break;
          
        case 'whatsapp_integration':
          hasAccess = rede.plano === 'trial' || rede.plano === 'premium' || rede.plano === 'enterprise';
          requiredPlan = rede.plano === 'trial' ? 'Trial' : 'Premium';
          break;
          
        default:
          hasAccess = true; // Funcionalidade básica
      }
      
      if (!hasAccess) {
        return res.status(403).json({
          error: `Esta funcionalidade requer plano ${requiredPlan}.`,
          current_plan: rede.plano,
          required_plan: requiredPlan.toLowerCase(),
          upgrade_url: '/upgrade'
        });
      }
      
      // Adicionar informações da rede ao request
      req.rede = rede;
      next();
      
    } catch (error) {
      console.error('Erro ao verificar plano:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
};

/**
 * Middleware para verificar limite de empresas
 */
const checkEmpresasLimit = async (req, res, next) => {
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
    
    if (rede.empresas_ativas >= rede.limite_empresas) {
      return res.status(403).json({
        error: `Limite de empresas atingido. Plano ${rede.plano} permite ${rede.limite_empresas} empresas.`,
        current_plan: rede.plano,
        empresas_ativas: rede.empresas_ativas,
        limite_empresas: rede.limite_empresas,
        upgrade_url: '/upgrade'
      });
    }
    
    req.rede = rede;
    next();
    
  } catch (error) {
    console.error('Erro ao verificar limite de empresas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Middleware para verificar limite de funcionários por empresa
 */
const checkFuncionariosLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { empresaId } = req.params;
    
    const rede = await RedeEmpresarial.findOne({
      where: { usuario_admin_id: userId }
    });
    
    if (!rede) {
      return res.status(400).json({ 
        error: 'Usuário não possui uma rede empresarial.' 
      });
    }
    
    // Definir limite de funcionários baseado no plano
    let limiteFuncionarios = 5; // Básico
    if (rede.plano === 'premium') limiteFuncionarios = 20;
    if (rede.plano === 'enterprise') limiteFuncionarios = 999; // Ilimitado
    
    // Contar funcionários atuais da empresa
    const { Empresa, User } = require('../models');
    const empresa = await Empresa.findOne({
      where: { id: empresaId, rede_id: rede.id },
      include: [{
        model: User,
        as: 'funcionarios',
        where: { tipo: 'funcionario', ativo: true },
        required: false
      }]
    });
    
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    
    const funcionariosAtivos = empresa.funcionarios?.length || 0;
    
    if (funcionariosAtivos >= limiteFuncionarios) {
      return res.status(403).json({
        error: `Limite de funcionários atingido. Plano ${rede.plano} permite ${limiteFuncionarios} funcionários por empresa.`,
        current_plan: rede.plano,
        funcionarios_ativos: funcionariosAtivos,
        limite_funcionarios: limiteFuncionarios,
        upgrade_url: '/upgrade'
      });
    }
    
    req.rede = rede;
    req.empresa = empresa;
    next();
    
  } catch (error) {
    console.error('Erro ao verificar limite de funcionários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Middleware para verificar limite de agendamentos
 */
const checkAgendamentosLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { empresaId } = req.params;
    
    const rede = await RedeEmpresarial.findOne({
      where: { usuario_admin_id: userId }
    });
    
    if (!rede) {
      return res.status(400).json({ 
        error: 'Usuário não possui uma rede empresarial.' 
      });
    }
    
    // Definir limite de agendamentos baseado no plano
    let limiteAgendamentos = 200; // Básico
    if (rede.plano === 'premium') limiteAgendamentos = 1000;
    if (rede.plano === 'enterprise') limiteAgendamentos = 999999; // Ilimitado
    
    // Contar agendamentos do mês atual
    const { Agendamento, Empresa } = require('../models');
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);
    
    const fimMes = new Date();
    fimMes.setMonth(fimMes.getMonth() + 1);
    fimMes.setDate(0);
    fimMes.setHours(23, 59, 59, 999);
    
    const agendamentosMes = await Agendamento.count({
      include: [{
        model: Empresa,
        as: 'empresa',
        where: { rede_id: rede.id }
      }],
      where: {
        data: {
          [require('sequelize').Op.between]: [inicioMes, fimMes]
        }
      }
    });
    
    if (agendamentosMes >= limiteAgendamentos) {
      return res.status(403).json({
        error: `Limite de agendamentos atingido. Plano ${rede.plano} permite ${limiteAgendamentos} agendamentos por mês.`,
        current_plan: rede.plano,
        agendamentos_mes: agendamentosMes,
        limite_agendamentos: limiteAgendamentos,
        upgrade_url: '/upgrade'
      });
    }
    
    req.rede = rede;
    next();
    
  } catch (error) {
    console.error('Erro ao verificar limite de agendamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  checkPlanoAccess,
  checkEmpresasLimit,
  checkFuncionariosLimit,
  checkAgendamentosLimit
};

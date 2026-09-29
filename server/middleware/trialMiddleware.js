const { RedeEmpresarial } = require('../models');

/**
 * Middleware para verificar se o trial ainda é válido
 */
const checkTrialValid = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log('🔍 checkTrialValid - userId:', userId);
    
    const rede = await RedeEmpresarial.findOne({
      where: { usuario_admin_id: userId }
    });
    
    console.log('🌐 checkTrialValid - rede encontrada:', rede ? rede.id : 'Não encontrada');
    
    if (!rede) {
      return res.status(400).json({ 
        error: 'Usuário não possui uma rede empresarial.' 
      });
    }
    
    // Se não é trial, continuar normalmente
    if (rede.plano !== 'trial') {
      req.rede = rede;
      return next();
    }
    
    // Verificar se o trial expirou
    const agora = new Date();
    const trialFim = new Date(rede.trial_fim);
    
    if (agora > trialFim) {
      // Trial expirado - bloquear acesso
      return res.status(403).json({
        error: 'Seu trial de 15 dias expirou.',
        trial_expired: true,
        trial_end_date: rede.trial_fim,
        upgrade_url: '/upgrade',
        message: 'Para continuar usando o sistema, escolha um plano de assinatura.'
      });
    }
    
    // Trial ainda válido
    console.log('✅ checkTrialValid - trial válido, continuando...');
    req.rede = rede;
    next();
    
  } catch (error) {
    console.error('Erro ao verificar trial:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Middleware para verificar se CPF/CNPJ já foi usado
 */
const checkCpfCnpjUsed = async (req, res, next) => {
  try {
    const { cpf_cnpj } = req.body;
    
    if (!cpf_cnpj) {
      return res.status(400).json({ 
        error: 'CPF ou CNPJ é obrigatório para criar uma rede.' 
      });
    }
    
    // Limpar CPF/CNPJ (remover pontos, traços, etc.)
    const cpfCnpjLimpo = cpf_cnpj.replace(/[^\d]/g, '');
    
    // Verificar se já existe uma rede com este CPF/CNPJ
    const redeExistente = await RedeEmpresarial.findOne({
      where: { cpf_cnpj_usado: cpfCnpjLimpo }
    });
    
    if (redeExistente) {
      return res.status(400).json({
        error: 'Este CPF/CNPJ já foi usado para criar uma rede empresarial.',
        cpf_cnpj_used: true,
        message: 'Cada CPF/CNPJ pode criar apenas uma rede para evitar abuso do trial gratuito.',
        upgrade_url: '/upgrade'
      });
    }
    
    req.cpfCnpjLimpo = cpfCnpjLimpo;
    next();
    
  } catch (error) {
    console.error('Erro ao verificar CPF/CNPJ:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Middleware para verificar status do trial (para exibir informações)
 */
const getTrialStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const rede = await RedeEmpresarial.findOne({
      where: { usuario_admin_id: userId }
    });
    
    if (!rede) {
      req.trialStatus = null;
      return next();
    }
    
    const agora = new Date();
    const trialFim = new Date(rede.trial_fim);
    
    let trialStatus = {
      plano: rede.plano,
      isTrial: rede.plano === 'trial',
      trialInicio: rede.trial_inicio,
      trialFim: rede.trial_fim,
      diasRestantes: 0,
      expirado: false
    };
    
    if (rede.plano === 'trial') {
      const diasRestantes = Math.ceil((trialFim - agora) / (1000 * 60 * 60 * 24));
      trialStatus.diasRestantes = Math.max(0, diasRestantes);
      trialStatus.expirado = agora > trialFim;
    }
    
    req.trialStatus = trialStatus;
    next();
    
  } catch (error) {
    console.error('Erro ao obter status do trial:', error);
    req.trialStatus = null;
    next();
  }
};

/**
 * Função para criar trial de 15 dias
 */
const createTrial = async (usuarioId, cpfCnpj, extras = {}) => {
  const agora = new Date();
  const trialFim = new Date(agora);
  trialFim.setDate(trialFim.getDate() + 15); // 15 dias
  const nomeRede = String(extras.nome_rede || '').trim();
  const descricao = String(extras.descricao || '').trim();
  
  return await RedeEmpresarial.create({
    nome_rede: nomeRede || `Rede Trial - ${cpfCnpj}`,
    descricao: descricao || 'Rede criada durante período de trial gratuito',
    usuario_admin_id: usuarioId,
    plano: 'trial',
    limite_empresas: 999, // Ilimitado durante trial
    empresas_ativas: 0,
    trial_inicio: agora,
    trial_fim: trialFim,
    cpf_cnpj_usado: cpfCnpj
  });
};

/**
 * Função para verificar se trial expirou e bloquear se necessário
 */
const checkAndBlockExpiredTrials = async () => {
  try {
    const agora = new Date();
    
    const trialsExpirados = await RedeEmpresarial.findAll({
      where: {
        plano: 'trial',
        trial_fim: {
          [require('sequelize').Op.lt]: agora
        },
        ativo: true
      }
    });
    
    for (const rede of trialsExpirados) {
      await rede.update({ ativo: false });
      console.log(`🚫 Trial expirado bloqueado para rede ${rede.id} (usuário ${rede.usuario_admin_id})`);
    }
    
    return trialsExpirados.length;
  } catch (error) {
    console.error('Erro ao verificar trials expirados:', error);
    return 0;
  }
};

module.exports = {
  checkTrialValid,
  checkCpfCnpjUsed,
  getTrialStatus,
  createTrial,
  checkAndBlockExpiredTrials
};

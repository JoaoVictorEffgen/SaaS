// Middleware para verificar permissões de usuário
const { User, Empresa } = require('../models');

// Verificar se o usuário é dono da empresa
const checkEmpresaOwnership = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (user.tipo !== 'empresa') {
      return res.status(403).json({
        success: false,
        message: 'Apenas empresas podem gerenciar dados da empresa'
      });
    }

    // Buscar empresa associada ao usuário
    const empresa = await Empresa.findOne({
      where: { user_id: user.id }
    });

    if (!empresa) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada para este usuário'
      });
    }

    // Adicionar empresa ao request
    req.empresa = empresa;
    next();
  } catch (error) {
    console.error('❌ Erro ao verificar propriedade da empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Verificar se o funcionário pertence à empresa
const checkFuncionarioEmpresa = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (user.tipo !== 'funcionario') {
      return res.status(403).json({
        success: false,
        message: 'Apenas funcionários podem acessar esta funcionalidade'
      });
    }

    if (!user.empresa_id) {
      return res.status(400).json({
        success: false,
        message: 'Funcionário não está associado a nenhuma empresa'
      });
    }

    // Buscar empresa do funcionário
    const empresa = await Empresa.findByPk(user.empresa_id);

    if (!empresa) {
      return res.status(404).json({
        success: false,
        message: 'Empresa do funcionário não encontrada'
      });
    }

    // Adicionar empresa ao request
    req.empresa = empresa;
    next();
  } catch (error) {
    console.error('❌ Erro ao verificar empresa do funcionário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Verificar se é cliente
const checkIsCliente = (req, res, next) => {
  const user = req.user;
  
  if (user.tipo !== 'cliente') {
    return res.status(403).json({
      success: false,
      message: 'Apenas clientes podem acessar esta funcionalidade'
    });
  }

  next();
};

// Verificar se é empresa
const checkIsEmpresa = (req, res, next) => {
  const user = req.user;
  
  if (user.tipo !== 'empresa') {
    return res.status(403).json({
      success: false,
      message: 'Apenas empresas podem acessar esta funcionalidade'
    });
  }

  next();
};

module.exports = {
  checkEmpresaOwnership,
  checkFuncionarioEmpresa,
  checkIsCliente,
  checkIsEmpresa
};

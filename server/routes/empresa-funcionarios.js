const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { User, Empresa, RedeEmpresarial } = require('../models');
const { validateNewRedeEmployee, toSafeEmployee } = require('../utils/redeEmployeeCreate');

// Middleware para verificar se usuário é admin da rede
const isRedeAdmin = async (req, res, next) => {
  try {
    const { empresaId } = req.params;
    const userId = req.user.id;
    console.log('🔍 Verificando admin da rede:', { empresaId, userId });
    
    // Buscar a empresa
    const empresa = await Empresa.findByPk(empresaId);
    console.log('🏢 Empresa encontrada:', empresa ? empresa.id : 'Não encontrada');
    
    if (!empresa) {
      return res.status(404).json({ 
        error: 'Empresa não encontrada.' 
      });
    }
    
    // Buscar a rede da empresa
    const rede = await RedeEmpresarial.findByPk(empresa.rede_id);
    console.log('🌐 Rede encontrada:', rede ? { id: rede.id, admin_id: rede.usuario_admin_id } : 'Não encontrada');
    
    if (!rede || rede.usuario_admin_id !== userId) {
      return res.status(403).json({ 
        error: 'Acesso negado. Você não é administrador desta rede.' 
      });
    }
    
    req.empresa = empresa;
    req.rede = rede;
    next();
  } catch (error) {
    console.error('Erro ao verificar admin da rede:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// GET /api/empresas/:empresaId/funcionarios - Listar funcionários da empresa
router.get('/:empresaId/funcionarios', authenticateToken, isRedeAdmin, async (req, res) => {
  try {
    const { empresaId } = req.params;
    console.log('🔍 Buscando funcionários da empresa:', empresaId);
    
    const funcionarios = await User.findAll({
      where: { 
        empresa_id: empresaId,
        tipo: 'funcionario'
      },
      attributes: ['id', 'nome', 'email', 'telefone', 'cargo', 'ativo', 'created_at']
    });
    
    console.log('👥 Funcionários encontrados:', funcionarios.length);
    res.json({ funcionarios });
  } catch (error) {
    console.error('Erro ao listar funcionários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/empresas/:empresaId/funcionarios - Adicionar funcionário à empresa
router.post('/:empresaId/funcionarios', authenticateToken, isRedeAdmin, async (req, res) => {
  try {
    const { empresaId } = req.params;
    const { funcionario_id, nome, email, telefone, cargo } = req.body;
    
    if (funcionario_id) {
      // Adicionar funcionário existente
      const funcionario = await User.findByPk(funcionario_id);
      
      if (!funcionario) {
        return res.status(404).json({ error: 'Funcionário não encontrado' });
      }
      
      if (funcionario.empresa_id) {
        return res.status(400).json({ error: 'Funcionário já está vinculado a uma empresa' });
      }
      
      await funcionario.update({ empresa_id: empresaId });
      
      res.json({ 
        success: true, 
        message: 'Funcionário adicionado com sucesso',
        funcionario: toSafeEmployee(funcionario)
      });
    } else {
      const validation = validateNewRedeEmployee({ nome, email, telefone, cargo, senha: req.body.senha });
      if (!validation.ok) {
        return res.status(validation.status).json({ error: validation.error });
      }

      const existingEmail = await User.findOne({ where: { email: validation.data.email } });
      if (existingEmail) {
        return res.status(409).json({ error: 'E-mail já cadastrado' });
      }

      const novoFuncionario = await User.create({
        nome: validation.data.nome,
        email: validation.data.email,
        telefone: validation.data.telefone,
        cargo: validation.data.cargo,
        senha: validation.data.senha,
        tipo: 'funcionario',
        empresa_id: empresaId,
        ativo: true
      });

      res.status(201).json({
        success: true,
        message: 'Funcionário criado com sucesso',
        funcionario: toSafeEmployee(novoFuncionario)
      });
    }
  } catch (error) {
    console.error('Erro ao adicionar funcionário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/empresas/:empresaId/funcionarios/:funcionarioId - Remover funcionário da empresa
router.delete('/:empresaId/funcionarios/:funcionarioId', authenticateToken, isRedeAdmin, async (req, res) => {
  try {
    const { empresaId, funcionarioId } = req.params;
    
    const funcionario = await User.findOne({
      where: { 
        id: funcionarioId,
        empresa_id: empresaId,
        tipo: 'funcionario'
      }
    });
    
    if (!funcionario) {
      return res.status(404).json({ error: 'Funcionário não encontrado nesta empresa' });
    }
    
    await funcionario.update({ empresa_id: null });
    
    res.json({ 
      success: true, 
      message: 'Funcionário removido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover funcionário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

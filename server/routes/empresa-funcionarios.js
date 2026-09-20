const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { User, Empresa, RedeEmpresarial } = require('../models');
const { canAssignEmployeeToRede, toSafeEmployee } = require('../utils/employeeAssignment');

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
      const assignment = canAssignEmployeeToRede(funcionario, req.rede.id);
      if (!assignment.ok) {
        return res.status(assignment.status).json({ error: assignment.error });
      }

      await funcionario.update({ empresa_id: empresaId, rede_id: req.rede.id });

      res.json({
        success: true,
        message: 'Funcionário adicionado com sucesso',
        funcionario: toSafeEmployee(funcionario)
      });
    } else {
      // Criar novo funcionário
      const novoFuncionario = await User.create({
        nome,
        email,
        telefone,
        cargo,
        tipo: 'funcionario',
        empresa_id: empresaId,
        rede_id: req.rede.id,
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
    
    await funcionario.update({
      empresa_id: null,
      rede_id: funcionario.rede_id || req.rede.id
    });
    
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

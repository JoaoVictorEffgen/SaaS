const express = require('express');
const router = express.Router();
const { PacotePersonalizado, ContratoPacote, Empresa } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { checkPlanLimits } = require('../middleware/planoMiddleware');

// MIDDLEWARE PARA VERIFICAR SE É EMPRESA
const checkIsEmpresa = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || user.tipo !== 'empresa') {
      return res.status(403).json({ 
        success: false, 
        message: 'Acesso negado. Apenas empresas podem gerenciar pacotes.' 
      });
    }
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao verificar permissões' });
  }
};

// ===== CRIAÇÃO E GERENCIAMENTO DE PACOTES =====

// GET /api/pacotes - Listar pacotes da empresa
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const empresa = await Empresa.findOne({ where: { user_id: user.id } });
    
    if (!empresa) {
      return res.status(404).json({ 
        success: false, 
        message: 'Empresa não encontrada' 
      });
    }

    const pacotes = await PacotePersonalizado.findAll({
      where: { empresa_id: empresa.id },
      order: [['created_at', 'DESC']]
    });

    // Adicionar contagem de contratos ativos para cada pacote
    const pacotesComContratos = await Promise.all(
      pacotes.map(async (pacote) => {
        const contratosAtivos = await ContratoPacote.count({
          where: {
            pacote_id: pacote.id,
            empresa_vendedora_id: empresa.id,
            status: 'ativo'
          }
        });

        return {
          ...pacote.toJSON(),
          contratos_ativos: contratosAtivos
        };
      })
    );

    res.json({
      success: true,
      data: pacotesComContratos
    });
  } catch (error) {
    console.error('Erro ao listar pacotes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// POST /api/pacotes - Criar novo pacote
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 [DEBUG] Iniciando criação de pacote...');
    console.log('🔍 [DEBUG] Headers:', req.headers);
    console.log('🔍 [DEBUG] Body recebido:', JSON.stringify(req.body, null, 2));
    
    const user = req.user;
    console.log('🔍 [DEBUG] Usuário autenticado:', { id: user.id, tipo: user.tipo, nome: user.nome });
    
    const empresa = await Empresa.findOne({ where: { user_id: user.id } });
    console.log('🔍 [DEBUG] Empresa encontrada:', empresa ? { id: empresa.id, nome: empresa.nome } : 'Nenhuma');
    
    if (!empresa) {
      console.log('❌ [DEBUG] Empresa não encontrada para o usuário:', user.id);
      return res.status(404).json({ 
        success: false, 
        message: 'Empresa não encontrada' 
      });
    }

    const {
      nome,
      descricao,
      preco,
      tipo_cobranca,
      limite_funcionarios,
      limite_agendamentos_mes,
      limite_clientes,
      limite_servicos,
      funcionalidades,
      categoria,
      cor_primaria,
      cor_secundaria,
      ativo,
      publico
    } = req.body;

    console.log('🔍 [DEBUG] Dados processados:', {
      nome,
      descricao,
      preco,
      tipo_cobranca,
      limite_funcionarios,
      limite_agendamentos_mes,
      limite_clientes,
      limite_servicos,
      funcionalidades,
      categoria,
      ativo,
      publico
    });

    // Validações básicas
    if (!nome || !preco) {
      console.log('❌ [DEBUG] Validação falhou: nome ou preço ausente');
      return res.status(400).json({ 
        success: false, 
        message: 'Nome e preço são obrigatórios' 
      });
    }

    console.log('🔍 [DEBUG] Criando pacote no banco...');
    const pacote = await PacotePersonalizado.create({
      nome,
      descricao,
      empresa_id: empresa.id,
      preco,
      tipo_cobranca: tipo_cobranca || 'mensal',
      limite_funcionarios,
      limite_agendamentos_mes,
      limite_clientes,
      limite_servicos,
      funcionalidades: funcionalidades || {},
      categoria,
      cor_primaria,
      cor_secundaria,
      ativo: ativo !== undefined ? ativo : true,
      publico: publico !== undefined ? publico : false
    });

    console.log('✅ [DEBUG] Pacote criado com sucesso:', { id: pacote.id, nome: pacote.nome });

    res.status(201).json({
      success: true,
      message: 'Pacote criado com sucesso!',
      data: pacote
    });
  } catch (error) {
    console.error('❌ [DEBUG] Erro ao criar pacote:', error);
    console.error('❌ [DEBUG] Stack trace:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/pacotes/:id - Atualizar pacote
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const empresa = await Empresa.findOne({ where: { user_id: user.id } });
    
    if (!empresa) {
      return res.status(404).json({ 
        success: false, 
        message: 'Empresa não encontrada' 
      });
    }

    const { id } = req.params;
    const pacote = await PacotePersonalizado.findOne({
      where: { id, empresa_id: empresa.id }
    });

    if (!pacote) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pacote não encontrado' 
      });
    }

    await pacote.update(req.body);

    res.json({
      success: true,
      message: 'Pacote atualizado com sucesso!',
      data: pacote
    });
  } catch (error) {
    console.error('Erro ao atualizar pacote:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// DELETE /api/pacotes/:id - Deletar pacote
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const empresa = await Empresa.findOne({ where: { user_id: user.id } });
    
    if (!empresa) {
      return res.status(404).json({ 
        success: false, 
        message: 'Empresa não encontrada' 
      });
    }

    const { id } = req.params;
    const pacote = await PacotePersonalizado.findOne({
      where: { id, empresa_id: empresa.id }
    });

    if (!pacote) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pacote não encontrado' 
      });
    }

    // Verificar se há contratos ativos
    const contratosAtivos = await ContratoPacote.count({
      where: { pacote_id: id, status: 'ativo' }
    });

    if (contratosAtivos > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Não é possível deletar pacote com contratos ativos' 
      });
    }

    await pacote.destroy();

    res.json({
      success: true,
      message: 'Pacote deletado com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao deletar pacote:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// GET /api/pacotes/:id - Detalhes do pacote
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    // Buscar empresa do usuário
    const empresa = await Empresa.findOne({ where: { user_id: user.id } });
    
    if (!empresa) {
      return res.status(404).json({ 
        success: false, 
        message: 'Empresa não encontrada' 
      });
    }
    
    const pacote = await PacotePersonalizado.findOne({
      where: { 
        id: id,
        empresa_id: empresa.id // Só pode ver seus próprios pacotes
      },
      include: [{
        model: Empresa,
        as: 'empresaCriadora',
        attributes: ['nome', 'logo_url']
      }]
    });

    if (!pacote) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pacote não encontrado' 
      });
    }

    res.json({
      success: true,
      data: pacote
    });
  } catch (error) {
    console.error('Erro ao buscar pacote:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

module.exports = router;

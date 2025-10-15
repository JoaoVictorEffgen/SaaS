const express = require('express');
const router = express.Router();
const { Promocao, PacotePersonalizado } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// Middleware para verificar se é empresa
const checkIsEmpresa = (req, res, next) => {
  console.log('🔍 [MIDDLEWARE DEBUG] checkIsEmpresa executado');
  console.log('🔍 [MIDDLEWARE DEBUG] req.user:', req.user);
  
  if (!req.user) {
    console.log('❌ [MIDDLEWARE DEBUG] req.user não definido');
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }
  
  if (req.user.tipo !== 'empresa') {
    console.log('❌ [MIDDLEWARE DEBUG] Usuário não é empresa:', req.user.tipo);
    return res.status(403).json({ error: 'Acesso negado. Apenas empresas podem gerenciar promoções.' });
  }
  
  console.log('✅ [MIDDLEWARE DEBUG] Usuário é empresa, prosseguindo...');
  next();
};

// GET /api/promocoes - Listar promoções da empresa
router.get('/', authenticateToken, checkIsEmpresa, async (req, res) => {
  try {
    const user = req.user;
    const { Empresa } = require('../models');
    
    const empresa = await Empresa.findOne({ where: { user_id: user.id } });
    
    if (!empresa) {
      return res.status(404).json({ 
        success: false, 
        message: 'Empresa não encontrada' 
      });
    }
    
    const promocoes = await Promocao.findAll({
      where: { empresa_id: empresa.id },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: promocoes
    });
  } catch (error) {
    console.error('Erro ao buscar promoções:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro interno do servidor' 
    });
  }
});

// POST /api/promocoes - Criar nova promoção
router.post('/', authenticateToken, checkIsEmpresa, async (req, res) => {
  try {
    console.log('🔍 [DEBUG] Iniciando criação de promoção...');
    console.log('🔍 [DEBUG] Headers:', req.headers);
    console.log('🔍 [DEBUG] Body recebido:', JSON.stringify(req.body, null, 2));

    const user = req.user;
    console.log('🔍 [DEBUG] Usuário autenticado:', { id: user.id, tipo: user.tipo, nome: user.nome });
    
    const { Empresa } = require('../models');
    
    console.log('🔍 [DEBUG] Buscando empresa...');
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
      tipo_desconto,
      valor_desconto,
      meses_gratis,
      funcionalidade_extra,
      codigo_promocional,
      data_inicio,
      data_fim,
      pacotes_aplicaveis,
      condicoes,
      limite_uso,
      destaque,
      cor_destaque,
      imagem_promocao_url,
      observacoes
    } = req.body;

    console.log('🔍 [DEBUG] Dados processados:', {
      nome,
      descricao,
      tipo_desconto,
      valor_desconto,
      meses_gratis,
      data_inicio,
      data_fim,
      limite_uso,
      destaque
    });

    // Validar campos obrigatórios
    if (!nome || !tipo_desconto || !data_inicio || !data_fim) {
      console.log('❌ [DEBUG] Validação falhou: campos obrigatórios ausentes');
      return res.status(400).json({ 
        success: false,
        message: 'Campos obrigatórios: nome, tipo_desconto, data_inicio, data_fim' 
      });
    }

    // Validar datas
    const inicio = new Date(data_inicio);
    const fim = new Date(data_fim);
    
    console.log('🔍 [DEBUG] Datas processadas:', { 
      data_inicio, 
      data_fim, 
      inicio: inicio.toISOString(), 
      fim: fim.toISOString() 
    });
    
    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
      console.log('❌ [DEBUG] Datas inválidas');
      return res.status(400).json({ 
        success: false,
        message: 'Datas inválidas fornecidas' 
      });
    }
    
    if (fim <= inicio) {
      console.log('❌ [DEBUG] Data de fim deve ser posterior à data de início');
      return res.status(400).json({ 
        success: false,
        message: 'Data de fim deve ser posterior à data de início' 
      });
    }

    // Validar tipo de desconto
    if (tipo_desconto === 'percentual' && (!valor_desconto || valor_desconto <= 0.01 || valor_desconto > 100)) {
      console.log('❌ [DEBUG] Desconto percentual inválido:', valor_desconto);
      return res.status(400).json({ 
        success: false,
        message: 'Desconto percentual deve estar entre 0.01 e 100' 
      });
    }

    if (tipo_desconto === 'valor_fixo' && (!valor_desconto || valor_desconto <= 0)) {
      console.log('❌ [DEBUG] Desconto valor fixo inválido:', valor_desconto);
      return res.status(400).json({ 
        success: false,
        message: 'Desconto em valor fixo deve ser maior que zero' 
      });
    }

    if (tipo_desconto === 'meses_gratis' && (!meses_gratis || meses_gratis <= 0)) {
      console.log('❌ [DEBUG] Meses grátis inválido:', meses_gratis);
      return res.status(400).json({ 
        success: false,
        message: 'Número de meses gratuitos deve ser maior que zero' 
      });
    }

    // Verificar se código promocional já existe (se fornecido)
    if (codigo_promocional) {
      console.log('🔍 [DEBUG] Verificando código promocional:', codigo_promocional);
      const codigoExistente = await Promocao.findOne({
        where: { codigo_promocional }
      });
      
      if (codigoExistente) {
        console.log('❌ [DEBUG] Código promocional já existe');
        return res.status(400).json({ 
          success: false,
          message: 'Código promocional já existe' 
        });
      }
    }

    console.log('🔍 [DEBUG] Criando promoção no banco...');
    const promocao = await Promocao.create({
      nome,
      descricao,
      empresa_id: empresa.id,
      tipo_desconto,
      valor_desconto,
      meses_gratis,
      funcionalidade_extra,
      codigo_promocional,
      data_inicio: inicio,
      data_fim: fim,
      pacotes_aplicaveis: pacotes_aplicaveis || [],
      condicoes: condicoes || {},
      limite_uso,
      destaque: destaque || false,
      cor_destaque,
      imagem_promocao_url,
      observacoes
    });

    console.log('✅ [DEBUG] Promoção criada com sucesso:', { id: promocao.id, nome: promocao.nome });

    res.status(201).json({
      success: true,
      message: 'Promoção criada com sucesso!',
      data: promocao
    });
  } catch (error) {
    console.error('❌ [DEBUG] Erro ao criar promoção:', error);
    console.error('❌ [DEBUG] Stack trace:', error.stack);
    res.status(500).json({ 
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/promocoes/:id - Buscar promoção específica
router.get('/:id', authenticateToken, checkIsEmpresa, async (req, res) => {
  try {
    const user = req.user;
    const { Empresa } = require('../models');
    
    const empresa = await Empresa.findOne({ where: { user_id: user.id } });
    
    if (!empresa) {
      return res.status(404).json({ 
        success: false, 
        message: 'Empresa não encontrada' 
      });
    }
    
    const { id } = req.params;

    const promocao = await Promocao.findOne({
      where: { 
        id,
        empresa_id: empresa.id 
      }
    });

    if (!promocao) {
      return res.status(404).json({ error: 'Promoção não encontrada' });
    }

    res.json(promocao);
  } catch (error) {
    console.error('Erro ao buscar promoção:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/promocoes/:id - Atualizar promoção
router.put('/:id', authenticateToken, checkIsEmpresa, async (req, res) => {
  try {
    const user = req.user;
    const { Empresa } = require('../models');
    
    const empresa = await Empresa.findOne({ where: { user_id: user.id } });
    
    if (!empresa) {
      return res.status(404).json({ 
        success: false, 
        message: 'Empresa não encontrada' 
      });
    }
    
    const { id } = req.params;
    const updateData = req.body;

    // Verificar se promoção existe e pertence à empresa
    const promocao = await Promocao.findOne({
      where: { 
        id,
        empresa_id: empresa.id 
      }
    });

    if (!promocao) {
      return res.status(404).json({ error: 'Promoção não encontrada' });
    }

    // Validar datas se fornecidas
    if (updateData.data_inicio && updateData.data_fim) {
      const inicio = new Date(updateData.data_inicio);
      const fim = new Date(updateData.data_fim);
      
      if (fim <= inicio) {
        return res.status(400).json({ error: 'Data de fim deve ser posterior à data de início' });
      }
    }

    // Verificar código promocional se fornecido
    if (updateData.codigo_promocional && updateData.codigo_promocional !== promocao.codigo_promocional) {
      const codigoExistente = await Promocao.findOne({
        where: { 
          codigo_promocional: updateData.codigo_promocional,
          id: { [require('sequelize').Op.ne]: id }
        }
      });
      
      if (codigoExistente) {
        return res.status(400).json({ error: 'Código promocional já existe' });
      }
    }

    await promocao.update(updateData);

    res.json(promocao);
  } catch (error) {
    console.error('Erro ao atualizar promoção:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/promocoes/:id - Deletar promoção
router.delete('/:id', authenticateToken, checkIsEmpresa, async (req, res) => {
  try {
    const user = req.user;
    const { Empresa } = require('../models');
    
    const empresa = await Empresa.findOne({ where: { user_id: user.id } });
    
    if (!empresa) {
      return res.status(404).json({ 
        success: false, 
        message: 'Empresa não encontrada' 
      });
    }
    
    const { id } = req.params;

    const promocao = await Promocao.findOne({
      where: { 
        id,
        empresa_id: empresa.id 
      }
    });

    if (!promocao) {
      return res.status(404).json({ error: 'Promoção não encontrada' });
    }

    await promocao.destroy();

    res.json({ message: 'Promoção deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar promoção:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/promocoes/ativas - Listar promoções ativas
router.get('/ativas', authenticateToken, checkIsEmpresa, async (req, res) => {
  try {
    const user = req.user;
    const { Empresa } = require('../models');
    
    const empresa = await Empresa.findOne({ where: { user_id: user.id } });
    
    if (!empresa) {
      return res.status(404).json({ 
        success: false, 
        message: 'Empresa não encontrada' 
      });
    }
    
    const agora = new Date();

    const promocoes = await Promocao.findAll({
      where: { 
        empresa_id: empresa.id,
        ativo: true,
        data_inicio: { [require('sequelize').Op.lte]: agora },
        data_fim: { [require('sequelize').Op.gte]: agora }
      },
      order: [['destaque', 'DESC'], ['created_at', 'DESC']]
    });

    res.json(promocoes);
  } catch (error) {
    console.error('Erro ao buscar promoções ativas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/promocoes/:id/toggle-destaque - Alternar destaque
router.post('/:id/toggle-destaque', authenticateToken, checkIsEmpresa, async (req, res) => {
  try {
    const user = req.user;
    const { Empresa } = require('../models');
    
    const empresa = await Empresa.findOne({ where: { user_id: user.id } });
    
    if (!empresa) {
      return res.status(404).json({ 
        success: false, 
        message: 'Empresa não encontrada' 
      });
    }
    
    const { id } = req.params;

    const promocao = await Promocao.findOne({
      where: { 
        id,
        empresa_id: empresa.id 
      }
    });

    if (!promocao) {
      return res.status(404).json({ error: 'Promoção não encontrada' });
    }

    await promocao.update({ destaque: !promocao.destaque });

    res.json(promocao);
  } catch (error) {
    console.error('Erro ao alternar destaque:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

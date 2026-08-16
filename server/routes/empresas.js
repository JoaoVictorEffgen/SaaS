const express = require('express');
const router = express.Router();
const { Empresa, User } = require('../models');
const { authenticateToken: auth } = require('../middleware/auth');
const { checkEmpresaOwnership } = require('../middleware/userPermissions');

// GET /api/empresas - Listar todas as empresas
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Buscando todas as empresas...');
    
    // Buscar todas as empresas
    const empresas = await Empresa.findAll();
    
    console.log('📊 Empresas encontradas:', empresas.length);
    
    // Transformar dados das empresas com URLs completas
    const empresasFormatadas = empresas.map(empresa => {
      // Construir URL completa para logo
      let logoUrl = null;
      if (empresa.logo_url) {
        logoUrl = empresa.logo_url.startsWith('http') 
          ? empresa.logo_url 
          : `${req.protocol}://${req.get('host')}${empresa.logo_url}`;
      }

      // Construir URL completa para imagem de fundo
      let imagemFundoUrl = null;
      if (empresa.imagem_fundo_url) {
        imagemFundoUrl = empresa.imagem_fundo_url.startsWith('http')
          ? empresa.imagem_fundo_url
          : `${req.protocol}://${req.get('host')}${empresa.imagem_fundo_url}`;
      }

      return {
        id: empresa.id,
        nome: empresa.nome,
        endereco: empresa.endereco,
        cidade: empresa.cidade,
        estado: empresa.estado,
        cep: empresa.cep,
        descricao: empresa.descricao,
        horario_funcionamento: empresa.horario_funcionamento,
        logo_url: logoUrl,
        imagem_fundo_url: imagemFundoUrl,
        website: empresa.website,
        instagram: empresa.instagram,
        whatsapp: empresa.whatsapp,
        created_at: empresa.created_at,
        updated_at: empresa.updated_at
      };
    });
    
    res.json(empresasFormatadas);
  } catch (error) {
    console.error('❌ Erro ao buscar empresas:', error);
    res.status(500).json({ error: 'Erro interno do servidor', message: error.message });
  }
});

// GET /api/empresas/me - Buscar empresa da conta autenticada
router.get('/me', auth, checkEmpresaOwnership, async (req, res) => {
  res.json(req.empresa);
});

// GET /api/empresas/:id - Buscar empresa por ID
router.get('/:id', async (req, res) => {
  try {
    const empresa = await Empresa.findByPk(req.params.id);
    
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    // Construir URLs completas
    let logoUrl = null;
    if (empresa.logo_url) {
      logoUrl = empresa.logo_url.startsWith('http') 
        ? empresa.logo_url 
        : `${req.protocol}://${req.get('host')}${empresa.logo_url}`;
    }

    let imagemFundoUrl = null;
    if (empresa.imagem_fundo_url) {
      imagemFundoUrl = empresa.imagem_fundo_url.startsWith('http')
        ? empresa.imagem_fundo_url
        : `${req.protocol}://${req.get('host')}${empresa.imagem_fundo_url}`;
    }

    // Retornar empresa com URLs completas
    const empresaCompleta = {
      ...empresa.toJSON(),
      logo_url: logoUrl,
      imagem_fundo_url: imagemFundoUrl
    };
    
    res.json(empresaCompleta);
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/empresas/:id/promocoes - Buscar promoções de uma empresa
router.get('/:id/promocoes', async (req, res) => {
  try {
    const { Promocao } = require('../models');
    
    const promocoes = await Promocao.findAll({
      where: { 
        empresa_id: req.params.id,
        ativo: true,
        destaque: true
      },
      order: [['created_at', 'DESC']]
    });
    
    res.json(promocoes);
  } catch (error) {
    console.error('Erro ao buscar promoções:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/empresas - Criar nova empresa
router.post('/', auth, async (req, res) => {
  try {
    const { razaoSocial, cnpj, endereco, cidade, estado, cep, email_contato, telefone, descricao, categoria, horario_funcionamento } = req.body;
    if (req.user.tipo !== 'empresa') {
      return res.status(403).json({ error: 'Apenas contas de empresa podem criar empresas' });
    }

    const existingEmpresa = await Empresa.findOne({ where: { user_id: req.user.id } });
    if (existingEmpresa) {
      return res.status(409).json({ error: 'Esta conta já possui uma empresa' });
    }
    
    // Criar empresa
    const empresa = await Empresa.create({
      user_id: req.user.id,
      nome: razaoSocial,
      cnpj,
      endereco,
      cidade,
      estado,
      cep,
      telefone,
      descricao,
      categoria,
      horario_funcionamento
    });
    
    res.status(201).json({ empresa });
  } catch (error) {
    console.error('Erro ao criar empresa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/empresas/:id - Atualizar empresa
router.put('/:id', auth, checkEmpresaOwnership, async (req, res) => {
  try {
    const empresa = req.empresa; // Já validado pelo middleware
    
    // Se estão sendo enviadas configurações, salvar no campo horario_funcionamento
    if (req.body.configuracoes) {
      await empresa.update({
        horario_funcionamento: req.body.configuracoes
      });
    } else {
      const allowedFields = [
        'nome', 'cnpj', 'telefone', 'endereco', 'cidade', 'estado', 'cep',
        'descricao', 'horario_funcionamento', 'logo_url', 'logo_sistema',
        'imagem_fundo_url', 'website', 'instagram', 'whatsapp', 'latitude', 'longitude'
      ];
      const updateData = Object.fromEntries(
        Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
      );
      await empresa.update(updateData);
    }
    
    console.log('✅ Empresa atualizada com sucesso');
    res.json(empresa);
  } catch (error) {
    console.error('❌ Erro ao atualizar empresa:', error);
    res.status(500).json({ error: 'Erro interno do servidor', message: error.message });
  }
});

// DELETE /api/empresas/:id - Deletar empresa
router.delete('/:id', auth, checkEmpresaOwnership, async (req, res) => {
  try {
    const empresa = req.empresa;
    
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    
    await empresa.destroy();
    res.json({ message: 'Empresa deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar empresa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

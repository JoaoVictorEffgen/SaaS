const express = require('express');
const router = express.Router();
const { Empresa, User } = require('../models');
const auth = require('../middleware/auth');

// GET /api/empresas - Listar todas as empresas
router.get('/', async (req, res) => {
  try {
    const empresas = await Empresa.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['nome', 'email', 'telefone']
      }]
    });
    res.json(empresas);
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/empresas/:id - Buscar empresa por ID
router.get('/:id', async (req, res) => {
  try {
    const empresa = await Empresa.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['nome', 'email', 'telefone']
      }]
    });
    
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    
    res.json(empresa);
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/empresas - Criar nova empresa
router.post('/', async (req, res) => {
  try {
    const { razaoSocial, cnpj, endereco, cidade, estado, cep, email_contato, telefone, descricao, categoria, horario_funcionamento } = req.body;
    
    // Criar usuário primeiro
    const user = await User.create({
      nome: razaoSocial,
      email: email_contato,
      senha: req.body.senha || '123456', // Senha padrão temporária
      tipo: 'empresa'
    });
    
    // Criar empresa
    const empresa = await Empresa.create({
      user_id: user.id,
      razaoSocial,
      cnpj,
      endereco,
      cidade,
      estado,
      cep,
      email_contato,
      telefone,
      descricao,
      categoria,
      horario_funcionamento
    });
    
    res.status(201).json({ empresa, user });
  } catch (error) {
    console.error('Erro ao criar empresa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/empresas/:id - Atualizar empresa
router.put('/:id', auth, async (req, res) => {
  try {
    const empresa = await Empresa.findByPk(req.params.id);
    
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    
    await empresa.update(req.body);
    res.json(empresa);
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/empresas/:id - Deletar empresa
router.delete('/:id', auth, async (req, res) => {
  try {
    const empresa = await Empresa.findByPk(req.params.id);
    
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

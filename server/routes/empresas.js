const express = require('express');
const router = express.Router();
const { Empresa, User, Servico } = require('../models');
const { authenticateToken: auth } = require('../middleware/auth');
const { checkEmpresaOwnership } = require('../middleware/userPermissions');

// GET /api/empresas - Listar todas as empresas
router.get('/', auth, async (req, res) => {
  try {
    console.log('🔍 Buscando todas as empresas...');
    
    // Buscar todas as empresas
    if (req.user.tipo !== 'empresa') return res.status(403).json({ error: 'Acesso restrito a empresas' });
    const empresas = await Empresa.findAll({ where: { user_id: req.user.id, ativo: true } });
    
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

// Catálogo e equipe da empresa autenticada. Estes endpoints são a fonte única
// usada tanto pelo painel da empresa quanto pela vitrine do cliente.
router.get('/me/servicos', auth, checkEmpresaOwnership, async (req, res) => {
  try {
    const servicos = await Servico.findAll({
      where: { empresa_id: req.empresa.id },
      order: [['nome', 'ASC']]
    });
    res.json({ success: true, data: servicos });
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/me/servicos', auth, checkEmpresaOwnership, async (req, res) => {
  try {
    const nome = String(req.body.nome || '').trim();
    const duracaoMinutos = Number(req.body.duracao_minutos);
    const preco = Number(req.body.preco);

    if (!nome || !Number.isInteger(duracaoMinutos) || duracaoMinutos < 15 || duracaoMinutos > 480 || !Number.isFinite(preco) || preco < 0) {
      return res.status(400).json({ error: 'Nome, duração e preço do serviço são inválidos' });
    }

    const servico = await Servico.create({
      empresa_id: req.empresa.id,
      nome,
      descricao: String(req.body.descricao || '').trim() || null,
      duracao_minutos: duracaoMinutos,
      preco,
      categoria: String(req.body.categoria || '').trim() || null,
      ativo: req.body.ativo !== false
    });

    res.status(201).json({ success: true, data: servico });
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/me/servicos/:servicoId', auth, checkEmpresaOwnership, async (req, res) => {
  try {
    const servico = await Servico.findOne({
      where: { id: req.params.servicoId, empresa_id: req.empresa.id }
    });
    if (!servico) return res.status(404).json({ error: 'Serviço não encontrado' });

    const updateData = {};
    if (req.body.nome !== undefined) updateData.nome = String(req.body.nome).trim();
    if (req.body.descricao !== undefined) updateData.descricao = String(req.body.descricao || '').trim() || null;
    if (req.body.categoria !== undefined) updateData.categoria = String(req.body.categoria || '').trim() || null;
    if (req.body.ativo !== undefined) updateData.ativo = Boolean(req.body.ativo);
    if (req.body.duracao_minutos !== undefined) updateData.duracao_minutos = Number(req.body.duracao_minutos);
    if (req.body.preco !== undefined) updateData.preco = Number(req.body.preco);

    if (!String(updateData.nome ?? servico.nome).trim()
      || !Number.isInteger(Number(updateData.duracao_minutos ?? servico.duracao_minutos))
      || Number(updateData.duracao_minutos ?? servico.duracao_minutos) < 15
      || Number(updateData.duracao_minutos ?? servico.duracao_minutos) > 480
      || !Number.isFinite(Number(updateData.preco ?? servico.preco))
      || Number(updateData.preco ?? servico.preco) < 0) {
      return res.status(400).json({ error: 'Dados do serviço são inválidos' });
    }

    await servico.update(updateData);
    res.json({ success: true, data: servico });
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/me/servicos/:servicoId', auth, checkEmpresaOwnership, async (req, res) => {
  try {
    const servico = await Servico.findOne({
      where: { id: req.params.servicoId, empresa_id: req.empresa.id }
    });
    if (!servico) return res.status(404).json({ error: 'Serviço não encontrado' });
    await servico.destroy();
    res.json({ success: true, message: 'Serviço excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/me/funcionarios', auth, checkEmpresaOwnership, async (req, res) => {
  try {
    const funcionarios = await User.findAll({
      where: { empresa_id: req.empresa.id, tipo: 'funcionario', ativo: true },
      attributes: ['id', 'nome', 'email', 'telefone', 'cpf', 'cargo', 'foto_url', 'url_foto_perfil', 'ativo', 'created_at', 'updated_at'],
      order: [['nome', 'ASC']]
    });
    res.json({ success: true, data: funcionarios });
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/me/funcionarios', auth, checkEmpresaOwnership, async (req, res) => {
  try {
    const nome = String(req.body.nome || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const telefone = String(req.body.telefone || '').trim();
    const cpf = String(req.body.cpf || '').replace(/\D/g, '');
    const cargo = String(req.body.cargo || '').trim();
    const senha = String(req.body.senha || '');

    if (!nome || !email || !telefone || cpf.length !== 11 || !cargo || senha.length < 8) {
      return res.status(400).json({ error: 'Preencha os dados do funcionário; a senha deve ter ao menos 8 caracteres' });
    }

    const duplicate = await User.findOne({ where: { email } }) || await User.findOne({ where: { cpf } });
    if (duplicate) return res.status(409).json({ error: 'E-mail ou CPF já cadastrado' });

    const funcionario = await User.create({
      tipo: 'funcionario',
      empresa_id: req.empresa.id,
      nome,
      email,
      telefone,
      cpf,
      cargo,
      senha,
      ativo: true
    });

    const safeFuncionario = funcionario.toJSON();
    delete safeFuncionario.senha;
    res.status(201).json({ success: true, data: safeFuncionario });
  } catch (error) {
    console.error('Erro ao criar funcionário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/me/funcionarios/:funcionarioId', auth, checkEmpresaOwnership, async (req, res) => {
  try {
    const funcionario = await User.findOne({
      where: { id: req.params.funcionarioId, empresa_id: req.empresa.id, tipo: 'funcionario' }
    });
    if (!funcionario) return res.status(404).json({ error: 'Funcionário não encontrado' });

    const updateData = {};
    for (const field of ['nome', 'email', 'telefone', 'cargo']) {
      if (req.body[field] !== undefined) updateData[field] = String(req.body[field]).trim();
    }
    if (updateData.email) updateData.email = updateData.email.toLowerCase();
    if (req.body.cpf !== undefined) updateData.cpf = String(req.body.cpf).replace(/\D/g, '');
    if (req.body.senha) updateData.senha = String(req.body.senha);

    if (!String(updateData.nome ?? funcionario.nome).trim()
      || !String(updateData.email ?? funcionario.email).trim()
      || String(updateData.cpf ?? funcionario.cpf).length !== 11
      || (updateData.senha && updateData.senha.length < 8)) {
      return res.status(400).json({ error: 'Dados do funcionário são inválidos' });
    }

    const duplicateEmail = await User.findOne({ where: { email: updateData.email || funcionario.email } });
    if (duplicateEmail && duplicateEmail.id !== funcionario.id) {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }

    await funcionario.update(updateData);
    const safeFuncionario = funcionario.toJSON();
    delete safeFuncionario.senha;
    res.json({ success: true, data: safeFuncionario });
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/me/funcionarios/:funcionarioId', auth, checkEmpresaOwnership, async (req, res) => {
  try {
    const funcionario = await User.findOne({
      where: { id: req.params.funcionarioId, empresa_id: req.empresa.id, tipo: 'funcionario' }
    });
    if (!funcionario) return res.status(404).json({ error: 'Funcionário não encontrado' });
    await funcionario.update({ ativo: false });
    res.json({ success: true, message: 'Funcionário desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao desativar funcionário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/empresas/:id - Buscar empresa por ID
router.get('/:id', auth, checkEmpresaOwnership, async (req, res) => {
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

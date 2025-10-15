const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { checkIsCliente } = require('../middleware/userPermissions');
const { Empresa, Promocao } = require('../models');

// GET /api/clientes/empresas - Buscar empresas disponíveis para clientes
router.get('/empresas', authenticateToken, checkIsCliente, async (req, res) => {
  try {
    console.log('🔍 Buscando empresas para cliente...');
    
    // Buscar apenas empresas ativas
    const empresas = await Empresa.findAll({
      where: { ativo: true },
      attributes: [
        'id', 'nome', 'endereco', 'cidade', 'estado', 'cep', 
        'descricao', 'logo_url', 'imagem_fundo_url', 'website', 
        'instagram', 'whatsapp'
      ]
    });
    
    console.log('📊 Empresas encontradas para cliente:', empresas.length);
    
    // Transformar dados das empresas com URLs completas e promoções
    const empresasComPromocoes = await Promise.all(
      empresas.map(async (empresa) => {
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

        // Buscar promoções ativas e em destaque
        const promocoes = await Promocao.findAll({
          where: { 
            empresa_id: empresa.id,
            ativo: true,
            destaque: true
          },
          attributes: ['id', 'nome', 'tipo_desconto', 'valor_desconto', 'meses_gratis'],
          order: [['created_at', 'DESC']]
        });

        return {
          id: empresa.id,
          nome: empresa.nome,
          endereco: empresa.endereco,
          cidade: empresa.cidade,
          estado: empresa.estado,
          cep: empresa.cep,
          descricao: empresa.descricao,
          logo_url: logoUrl,
          imagem_fundo_url: imagemFundoUrl,
          website: empresa.website,
          instagram: empresa.instagram,
          whatsapp: empresa.whatsapp,
          promocoes: promocoes
        };
      })
    );
    
    res.json({
      success: true,
      data: empresasComPromocoes
    });
  } catch (error) {
    console.error('❌ Erro ao buscar empresas para cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/clientes/empresa/:id - Buscar detalhes de uma empresa específica
router.get('/empresa/:id', authenticateToken, checkIsCliente, async (req, res) => {
  try {
    const empresaId = req.params.id;
    
    // Buscar empresa ativa
    const empresa = await Empresa.findOne({
      where: { 
        id: empresaId,
        ativo: true 
      },
      attributes: [
        'id', 'nome', 'endereco', 'cidade', 'estado', 'cep', 
        'descricao', 'logo_url', 'imagem_fundo_url', 'website', 
        'instagram', 'whatsapp', 'horario_funcionamento'
      ]
    });
    
    if (!empresa) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada ou inativa'
      });
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

    // Buscar promoções ativas
    const promocoes = await Promocao.findAll({
      where: { 
        empresa_id: empresa.id,
        ativo: true
      },
      attributes: ['id', 'nome', 'descricao', 'tipo_desconto', 'valor_desconto', 'meses_gratis', 'destaque'],
      order: [['destaque', 'DESC'], ['created_at', 'DESC']]
    });

    // Retornar empresa com URLs completas e promoções
    const empresaCompleta = {
      ...empresa.toJSON(),
      logo_url: logoUrl,
      imagem_fundo_url: imagemFundoUrl,
      promocoes: promocoes
    };

    res.json({
      success: true,
      data: empresaCompleta
    });
  } catch (error) {
    console.error('❌ Erro ao buscar empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;

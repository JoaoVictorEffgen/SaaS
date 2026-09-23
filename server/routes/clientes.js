const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { checkIsCliente } = require('../middleware/userPermissions');
const { Empresa, Promocao, Servico, User, Agendamento } = require('../models');
const { appointmentOccupiesSlot, ACTIVE_BOOKING_STATUSES } = require('../utils/appointmentStatus');

// GET /api/clientes/empresas - Buscar empresas disponíveis para clientes
router.get('/empresas', async (req, res) => {
  try {
    console.log('🔍 Buscando empresas para cliente...');
    
    // Buscar apenas empresas ativas
    const empresas = await Empresa.findAll({
      where: { ativo: true },
      attributes: [
        'id', 'nome', 'endereco', 'cidade', 'estado', 'cep', 
        'descricao', 'categoria', 'logo_url', 'imagem_fundo_url', 'website',
        'instagram', 'whatsapp', 'horario_funcionamento'
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

        const [promocoes, servicos, totalProfissionais] = await Promise.all([
          Promocao.findAll({
            where: {
              empresa_id: empresa.id,
              ativo: true,
              destaque: true
            },
            attributes: ['id', 'nome', 'tipo_desconto', 'valor_desconto', 'meses_gratis'],
            order: [['created_at', 'DESC']]
          }),
          Servico.findAll({
            where: {
              empresa_id: empresa.id,
              ativo: true
            },
            attributes: ['id', 'nome', 'categoria', 'duracao_minutos', 'preco'],
            order: [['nome', 'ASC']]
          }),
          User.count({
            where: {
              empresa_id: empresa.id,
              tipo: 'funcionario',
              ativo: true
            }
          })
        ]);

        const categorias = [...new Set([
          empresa.categoria,
          ...servicos.map(servico => servico.categoria)
        ].filter(Boolean))];

        return {
          id: empresa.id,
          nome: empresa.nome,
          endereco: empresa.endereco,
          cidade: empresa.cidade,
          estado: empresa.estado,
          cep: empresa.cep,
          descricao: empresa.descricao,
          categoria: empresa.categoria,
          logo_url: logoUrl,
          imagem_fundo_url: imagemFundoUrl,
          website: empresa.website,
          instagram: empresa.instagram,
          whatsapp: empresa.whatsapp,
          horario_funcionamento: empresa.horario_funcionamento,
          promocoes,
          servicos,
          categorias,
          total_profissionais: totalProfissionais,
          disponivel_para_agendamento: servicos.length > 0 && totalProfissionais > 0
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
        'descricao', 'categoria', 'logo_url', 'imagem_fundo_url', 'website',
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

    const [promocoes, servicos, funcionarios] = await Promise.all([
      Promocao.findAll({
        where: {
          empresa_id: empresa.id,
          ativo: true
        },
        attributes: ['id', 'nome', 'descricao', 'tipo_desconto', 'valor_desconto', 'meses_gratis', 'destaque'],
        order: [['destaque', 'DESC'], ['created_at', 'DESC']]
      }),
      Servico.findAll({
        where: {
          empresa_id: empresa.id,
          ativo: true
        },
        attributes: ['id', 'nome', 'descricao', 'duracao_minutos', 'preco', 'categoria'],
        order: [['nome', 'ASC']]
      }),
      User.findAll({
        where: {
          empresa_id: empresa.id,
          tipo: 'funcionario',
          ativo: true
        },
        attributes: ['id', 'nome', 'cargo', 'foto_url', 'url_foto_perfil', 'disponibilidade', 'pausas'],
        order: [['nome', 'ASC']]
      })
    ]);

    // Retornar empresa com URLs completas e promoções
    const empresaCompleta = {
      ...empresa.toJSON(),
      logo_url: logoUrl,
      imagem_fundo_url: imagemFundoUrl,
      promocoes,
      servicos,
      funcionarios
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

// Retorna apenas blocos ocupados, sem expor dados de outros clientes.
router.get('/empresa/:id/disponibilidade', authenticateToken, checkIsCliente, async (req, res) => {
  try {
    const { data, funcionario_id: funcionarioId } = req.query;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(data || '')) || !funcionarioId) {
      return res.status(400).json({ error: 'Data e funcionário são obrigatórios' });
    }
    const funcionario = await User.findOne({
      where: { id: funcionarioId, empresa_id: req.params.id, tipo: 'funcionario', ativo: true },
      attributes: ['id']
    });
    if (!funcionario) return res.status(404).json({ error: 'Funcionário não encontrado' });

    const appointments = await Agendamento.findAll({
      where: {
        empresa_id: req.params.id,
        funcionario_id: funcionarioId,
        data,
        status: [...ACTIVE_BOOKING_STATUSES, 'realizado']
      },
      attributes: ['hora', 'servicos', 'status', 'data']
    });
    res.json({
      success: true,
      data: appointments.filter((appointment) => appointmentOccupiesSlot(appointment)).map((appointment) => ({
        hora: appointment.hora,
        duracao_minutos: (appointment.servicos || []).reduce(
          (total, service) => total + (Number(service.duracao_minutos) || 0),
          0
        ) || 60
      }))
    });
  } catch (error) {
    console.error('Erro ao consultar disponibilidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;

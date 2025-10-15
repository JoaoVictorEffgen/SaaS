// 🌐 Pacote Público - Rotas Abertas
const express = require('express');
const router = express.Router();

class PublicRoutes {
  constructor() {
    this.setupRoutes();
  }

  setupRoutes() {
    // Health check público
    router.get('/health', this.healthCheck);
    
    // Informações públicas do sistema
    router.get('/info', this.systemInfo);
    
    // Lista de empresas públicas (apenas dados básicos)
    router.get('/empresas', this.listPublicEmpresas);
  }

  /**
   * Health check público
   */
  healthCheck = (req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  };

  /**
   * Informações públicas do sistema
   */
  systemInfo = (req, res) => {
    res.json({
      name: 'Sistema SaaS de Agendamentos',
      version: '1.0.0',
      description: 'Sistema completo de agendamentos para empresas',
      features: [
        'Gestão de empresas e funcionários',
        'Sistema de agendamentos',
        'Interface moderna e responsiva',
        'PWA instalável',
        'Sistema de pacotes e promoções'
      ],
      supportedTypes: ['empresa', 'funcionario', 'cliente'],
      contact: {
        support: 'suporte@sistema.com',
        documentation: '/docs'
      }
    });
  };

  /**
   * Lista empresas públicas (dados limitados)
   */
  listPublicEmpresas = async (req, res) => {
    try {
      const { Empresa } = require('../../models');
      
      // Buscar apenas empresas ativas com dados públicos
      const empresas = await Empresa.findAll({
        where: { ativo: true },
        attributes: [
          'id', 'nome', 'cidade', 'estado', 
          'descricao', 'website', 'instagram'
        ],
        order: [['nome', 'ASC']]
      });

      res.json({
        success: true,
        data: empresas,
        count: empresas.length
      });
    } catch (error) {
      console.error('❌ Erro ao listar empresas públicas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };

  /**
   * Retorna as rotas configuradas
   */
  getRoutes() {
    return router;
  }
}

module.exports = PublicRoutes;

// 🔒 Pacote Privado - Rotas Protegidas
const express = require('express');
const router = express.Router();
const SecurityMiddleware = require('../security/middleware');

class PrivateRoutes {
  constructor() {
    this.securityMiddleware = new SecurityMiddleware();
    this.setupRoutes();
  }

  setupRoutes() {
    // Aplicar middleware de segurança em todas as rotas
    router.use(this.securityMiddleware.authenticateToken);
    router.use(this.securityMiddleware.securityLogger);

    // Rotas de empresa
    router.use('/empresa', this.empresaRoutes());
    
    // Rotas de funcionário
    router.use('/funcionario', this.funcionarioRoutes());
    
    // Rotas de cliente
    router.use('/cliente', this.clienteRoutes());
    
    // Rotas de administração
    router.use('/admin', this.adminRoutes());
  }

  /**
   * Rotas específicas para empresas
   */
  empresaRoutes() {
    const empresaRouter = express.Router();
    
    // Aplicar middleware específico para empresas
    empresaRouter.use(this.securityMiddleware.requireUserType(['empresa']));
    empresaRouter.use(this.securityMiddleware.requireEmpresaOwnership);

    // Dashboard da empresa
    empresaRouter.get('/dashboard', this.getEmpresaDashboard);
    
    // Configurações da empresa
    empresaRouter.get('/configuracoes', this.getEmpresaConfiguracoes);
    empresaRouter.put('/configuracoes', this.updateEmpresaConfiguracoes);
    
    // Upload de imagens
    empresaRouter.post('/upload/logo', this.uploadLogo);
    empresaRouter.post('/upload/imagem-fundo', this.uploadImagemFundo);
    
    // Gestão de funcionários
    empresaRouter.get('/funcionarios', this.getFuncionarios);
    empresaRouter.post('/funcionarios', this.createFuncionario);
    empresaRouter.put('/funcionarios/:id', this.updateFuncionario);
    empresaRouter.delete('/funcionarios/:id', this.deleteFuncionario);
    
    // Gestão de serviços
    empresaRouter.get('/servicos', this.getServicos);
    empresaRouter.post('/servicos', this.createServico);
    empresaRouter.put('/servicos/:id', this.updateServico);
    empresaRouter.delete('/servicos/:id', this.deleteServico);
    
    // Relatórios e KPIs
    empresaRouter.get('/relatorios', this.getRelatorios);
    empresaRouter.get('/kpis', this.getKPIs);
    
    return empresaRouter;
  }

  /**
   * Rotas específicas para funcionários
   */
  funcionarioRoutes() {
    const funcionarioRouter = express.Router();
    
    // Aplicar middleware específico para funcionários
    funcionarioRouter.use(this.securityMiddleware.requireUserType(['funcionario']));
    funcionarioRouter.use(this.securityMiddleware.requireFuncionarioEmpresa);

    // Dashboard do funcionário
    funcionarioRouter.get('/dashboard', this.getFuncionarioDashboard);
    
    // Agenda do funcionário
    funcionarioRouter.get('/agenda', this.getFuncionarioAgenda);
    funcionarioRouter.get('/agenda/:data', this.getAgendaPorData);
    
    // Gestão de agendamentos
    funcionarioRouter.get('/agendamentos', this.getAgendamentos);
    funcionarioRouter.put('/agendamentos/:id/status', this.updateAgendamentoStatus);
    funcionarioRouter.post('/agendamentos/:id/observacoes', this.addObservacoes);
    
    // Perfil do funcionário
    funcionarioRouter.get('/perfil', this.getFuncionarioPerfil);
    funcionarioRouter.put('/perfil', this.updateFuncionarioPerfil);
    
    return funcionarioRouter;
  }

  /**
   * Rotas específicas para clientes
   */
  clienteRoutes() {
    const clienteRouter = express.Router();
    
    // Aplicar middleware específico para clientes
    clienteRouter.use(this.securityMiddleware.requireUserType(['cliente']));

    // Dashboard do cliente
    clienteRouter.get('/dashboard', this.getClienteDashboard);
    
    // Empresas disponíveis
    clienteRouter.get('/empresas', this.getEmpresasDisponiveis);
    clienteRouter.get('/empresas/:id', this.getEmpresaDetalhes);
    
    // Agendamentos do cliente
    clienteRouter.get('/agendamentos', this.getClienteAgendamentos);
    clienteRouter.post('/agendamentos', this.createAgendamento);
    clienteRouter.put('/agendamentos/:id', this.updateAgendamento);
    clienteRouter.delete('/agendamentos/:id', this.cancelAgendamento);
    
    // Perfil do cliente
    clienteRouter.get('/perfil', this.getClientePerfil);
    clienteRouter.put('/perfil', this.updateClientePerfil);
    
    // Favoritos
    clienteRouter.get('/favoritos', this.getFavoritos);
    clienteRouter.post('/favoritos/:empresaId', this.addFavorito);
    clienteRouter.delete('/favoritos/:empresaId', this.removeFavorito);
    
    return clienteRouter;
  }

  /**
   * Rotas de administração (apenas para desenvolvimento)
   */
  adminRoutes() {
    const adminRouter = express.Router();
    
    // Apenas em desenvolvimento
    if (process.env.NODE_ENV !== 'development') {
      return adminRouter; // Retorna router vazio em produção
    }

    // Rotas de debug e administração
    adminRouter.get('/users', this.getAllUsers);
    adminRouter.get('/empresas', this.getAllEmpresas);
    adminRouter.get('/stats', this.getSystemStats);
    
    return adminRouter;
  }

  // Métodos de implementação das rotas (simplificados para exemplo)
  getEmpresaDashboard = async (req, res) => {
    try {
      const empresa = req.empresa;
      
      // Buscar dados do dashboard
      const stats = {
        totalFuncionarios: 0,
        totalServicos: 0,
        agendamentosHoje: 0,
        agendamentosSemana: 0
      };

      res.json({
        success: true,
        data: {
          empresa,
          stats
        }
      });
    } catch (error) {
      console.error('❌ Erro no dashboard da empresa:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };

  getFuncionarioDashboard = async (req, res) => {
    try {
      const funcionario = req.user;
      const empresa = req.empresa;
      
      res.json({
        success: true,
        data: {
          funcionario,
          empresa: {
            id: empresa.id,
            nome: empresa.nome,
            logo_url: empresa.logo_url
          }
        }
      });
    } catch (error) {
      console.error('❌ Erro no dashboard do funcionário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };

  getClienteDashboard = async (req, res) => {
    try {
      const cliente = req.user;
      
      res.json({
        success: true,
        data: {
          cliente: {
            id: cliente.id,
            nome: cliente.nome,
            email: cliente.email
          }
        }
      });
    } catch (error) {
      console.error('❌ Erro no dashboard do cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };

  // Métodos placeholder para outras rotas
  getEmpresaConfiguracoes = (req, res) => res.json({ success: true, message: 'Configurações da empresa' });
  updateEmpresaConfiguracoes = (req, res) => res.json({ success: true, message: 'Configurações atualizadas' });
  uploadLogo = (req, res) => res.json({ success: true, message: 'Logo enviado' });
  uploadImagemFundo = (req, res) => res.json({ success: true, message: 'Imagem de fundo enviada' });
  getFuncionarios = (req, res) => res.json({ success: true, data: [] });
  createFuncionario = (req, res) => res.json({ success: true, message: 'Funcionário criado' });
  updateFuncionario = (req, res) => res.json({ success: true, message: 'Funcionário atualizado' });
  deleteFuncionario = (req, res) => res.json({ success: true, message: 'Funcionário removido' });
  getServicos = (req, res) => res.json({ success: true, data: [] });
  createServico = (req, res) => res.json({ success: true, message: 'Serviço criado' });
  updateServico = (req, res) => res.json({ success: true, message: 'Serviço atualizado' });
  deleteServico = (req, res) => res.json({ success: true, message: 'Serviço removido' });
  getRelatorios = (req, res) => res.json({ success: true, data: [] });
  getKPIs = (req, res) => res.json({ success: true, data: {} });

  getFuncionarioAgenda = (req, res) => res.json({ success: true, data: [] });
  getAgendaPorData = (req, res) => res.json({ success: true, data: [] });
  getAgendamentos = (req, res) => res.json({ success: true, data: [] });
  updateAgendamentoStatus = (req, res) => res.json({ success: true, message: 'Status atualizado' });
  addObservacoes = (req, res) => res.json({ success: true, message: 'Observações adicionadas' });
  getFuncionarioPerfil = (req, res) => res.json({ success: true, data: {} });
  updateFuncionarioPerfil = (req, res) => res.json({ success: true, message: 'Perfil atualizado' });

  getEmpresasDisponiveis = (req, res) => res.json({ success: true, data: [] });
  getEmpresaDetalhes = (req, res) => res.json({ success: true, data: {} });
  getClienteAgendamentos = (req, res) => res.json({ success: true, data: [] });
  createAgendamento = (req, res) => res.json({ success: true, message: 'Agendamento criado' });
  updateAgendamento = (req, res) => res.json({ success: true, message: 'Agendamento atualizado' });
  cancelAgendamento = (req, res) => res.json({ success: true, message: 'Agendamento cancelado' });
  getClientePerfil = (req, res) => res.json({ success: true, data: {} });
  updateClientePerfil = (req, res) => res.json({ success: true, message: 'Perfil atualizado' });
  getFavoritos = (req, res) => res.json({ success: true, data: [] });
  addFavorito = (req, res) => res.json({ success: true, message: 'Adicionado aos favoritos' });
  removeFavorito = (req, res) => res.json({ success: true, message: 'Removido dos favoritos' });

  getAllUsers = (req, res) => res.json({ success: true, data: [] });
  getAllEmpresas = (req, res) => res.json({ success: true, data: [] });
  getSystemStats = (req, res) => res.json({ success: true, data: {} });

  /**
   * Retorna as rotas configuradas
   */
  getRoutes() {
    return router;
  }
}

module.exports = PrivateRoutes;

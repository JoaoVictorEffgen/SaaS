// 🔄 Pacote Legacy - Compatibilidade com Rotas Existentes
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth');

// Importar rotas existentes para compatibilidade
const authRoutes = require('../../routes/auth');
const empresasRoutes = require('../../routes/empresas');
const usersRoutes = require('../../routes/users');
const agendamentosRoutes = require('../../routes/agendamentos');
const redesRoutes = require('../../routes/redes');
const pacotesRoutes = require('../../routes/pacotes');
const promocoesRoutes = require('../../routes/promocoes');
const uploadRoutes = require('../../routes/upload');
const funcionariosRoutes = require('../../routes/funcionarios');
const clientesRoutes = require('../../routes/clientes');

class LegacyRoutes {
  constructor() {
    this.setupRoutes();
  }

  setupRoutes() {
    // Rotas públicas (sem autenticação)
    router.use('/users', usersRoutes);
    router.use('/auth', authRoutes);
    
    // Rotas protegidas (com autenticação)
    router.use('/empresas', authenticateToken, empresasRoutes);
    router.use('/agendamentos', authenticateToken, agendamentosRoutes);
    router.use('/redes', authenticateToken, redesRoutes);
    router.use('/pacotes', authenticateToken, pacotesRoutes);
    router.use('/promocoes', authenticateToken, promocoesRoutes);
    router.use('/upload', authenticateToken, uploadRoutes);
    router.use('/uploads', authenticateToken, uploadRoutes);
    router.use('/funcionarios', authenticateToken, funcionariosRoutes);
    router.use('/clientes', authenticateToken, clientesRoutes);
  }

  getRoutes() {
    return router;
  }
}

module.exports = LegacyRoutes;

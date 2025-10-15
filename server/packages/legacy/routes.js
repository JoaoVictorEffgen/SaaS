// 🔄 Pacote Legacy - Compatibilidade com Rotas Existentes
const express = require('express');
const router = express.Router();

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
    // Rotas de autenticação (mantidas para compatibilidade)
    router.use('/users', usersRoutes);
    router.use('/auth', authRoutes);
    
    // Rotas de empresas (mantidas para compatibilidade)
    router.use('/empresas', empresasRoutes);
    
    // Rotas de agendamentos (mantidas para compatibilidade)
    router.use('/agendamentos', agendamentosRoutes);
    
    // Rotas de redes (mantidas para compatibilidade)
    router.use('/redes', redesRoutes);
    
    // Rotas de pacotes (mantidas para compatibilidade)
    router.use('/pacotes', pacotesRoutes);
    
    // Rotas de promoções (mantidas para compatibilidade)
    router.use('/promocoes', promocoesRoutes);
    
    // Rotas de upload (mantidas para compatibilidade)
    router.use('/upload', uploadRoutes);
    router.use('/uploads', uploadRoutes);
    
    // Rotas de funcionários (mantidas para compatibilidade)
    router.use('/funcionarios', funcionariosRoutes);
    
    // Rotas de clientes (mantidas para compatibilidade)
    router.use('/clientes', clientesRoutes);
  }

  getRoutes() {
    return router;
  }
}

module.exports = LegacyRoutes;

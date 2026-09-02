// Camada de compatibilidade para as rotas já consumidas pelo cliente web.
const express = require('express');
const rateLimit = require('express-rate-limit');
const empresasRoutes = require('../../routes/empresas');
const usersRoutes = require('../../routes/users');
const agendamentosRoutes = require('../../routes/agendamentos');
const redesRoutes = require('../../routes/redes');
const empresaFuncionariosRoutes = require('../../routes/empresa-funcionarios');
const pacotesRoutes = require('../../routes/pacotes');
const promocoesRoutes = require('../../routes/promocoes');
const uploadFotosRoutes = require('../../routes/upload-fotos');
const funcionariosRoutes = require('../../routes/funcionarios');
const clientesRoutes = require('../../routes/clientes');
const notificationsRoutes = require('../../routes/notifications');
const recuperarSenhaRoutes = require('../../routes/recuperar-senha');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' }
});

class LegacyRoutes {
  constructor() {
    this.setupRoutes();
  }

  setupRoutes() {
    // As rotas públicas precisam ser registradas antes dos grupos protegidos.
    router.use('/users', usersRoutes);
    router.use('/auth', authLimiter, recuperarSenhaRoutes);
    router.use('/clientes', clientesRoutes);

    router.use('/empresas', empresasRoutes);
    router.use('/agendamentos', agendamentosRoutes);
    router.use('/redes', redesRoutes);
    router.use('/empresas', empresaFuncionariosRoutes);
    router.use('/pacotes', pacotesRoutes);
    router.use('/promocoes', promocoesRoutes);
    router.use('/upload-fotos', uploadFotosRoutes);
    router.use('/funcionarios', funcionariosRoutes);
    router.use('/notifications', notificationsRoutes);
  }

  getRoutes() {
    return router;
  }
}

module.exports = LegacyRoutes;

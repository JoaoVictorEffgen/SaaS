// 🏗️ Pacote Core - Gerenciamento de Banco de Dados
const { sequelize } = require('../../config/database');
const { isLocalDev } = require('../../config/localDev');

class DatabaseManager {
  constructor() {
    this.sequelize = sequelize;
    this.models = {};
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) {
      return this.sequelize;
    }

    try {
      await this.sequelize.authenticate();
      console.log('✅ [CORE] Conexão com banco estabelecida com sucesso');

      await this.loadModels();
      await this.setupAssociations();

      if (process.env.NODE_ENV !== 'production') {
        await this.syncDatabase();
      }

      if (isLocalDev) {
        const seedLocalDev = require('../../scripts/seed-local-dev');
        await seedLocalDev();
      }

      this.initialized = true;
      return this.sequelize;
    } catch (error) {
      console.error('❌ [CORE] Erro ao conectar com banco:', error);
      throw error;
    }
  }

  async loadModels() {
    try {
      const User = require('../../models/User');
      const Empresa = require('../../models/Empresa');
      const Agendamento = require('../../models/Agendamento');
      const Servico = require('../../models/Servico');
      const PacotePersonalizado = require('../../models/PacotePersonalizado');
      const ContratoPacote = require('../../models/ContratoPacote');
      const Promocao = require('../../models/Promocao');
      const RedeEmpresarial = require('../../models/RedeEmpresarial');

      this.models = {
        User,
        Empresa,
        Agendamento,
        Servico,
        PacotePersonalizado,
        ContratoPacote,
        Promocao,
        RedeEmpresarial
      };

      console.log('✅ [CORE] Modelos carregados com sucesso');
    } catch (error) {
      console.error('❌ [CORE] Erro ao carregar modelos:', error);
      throw error;
    }
  }

  async setupAssociations() {
    try {
      const setupAssociations = require('../../models/associations-simple');
      setupAssociations();
      console.log('✅ [CORE] Associações configuradas com sucesso');
    } catch (error) {
      console.error('❌ [CORE] Erro ao configurar associações:', error);
      throw error;
    }
  }

  async syncDatabase() {
    try {
      const syncOptions = isLocalDev ? {} : { alter: true };
      await this.sequelize.sync(syncOptions);
      console.log('✅ [CORE] Banco de dados sincronizado');
    } catch (error) {
      console.error('❌ [CORE] Erro ao sincronizar banco:', error);
      throw error;
    }
  }

  async transaction(callback) {
    const transaction = await this.sequelize.transaction();
    try {
      const result = await callback(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async close() {
    if (this.sequelize) {
      await this.sequelize.close();
      console.log('✅ [CORE] Conexão com banco fechada');
    }
  }

  getSequelize() {
    return this.sequelize;
  }

  getModels() {
    return this.models;
  }

  getModel(name) {
    return this.models[name];
  }

  async isConnected() {
    try {
      await this.sequelize.authenticate();
      return true;
    } catch (error) {
      return false;
    }
  }

  async getDatabaseInfo() {
    try {
      return {
        connected: true,
        dialect: this.sequelize.getDialect(),
        database: this.sequelize.config.storage || this.sequelize.config.database
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message
      };
    }
  }
}

const databaseManager = new DatabaseManager();

module.exports = databaseManager;

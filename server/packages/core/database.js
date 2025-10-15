// 🏗️ Pacote Core - Gerenciamento de Banco de Dados
const { Sequelize } = require('sequelize');

class DatabaseManager {
  constructor() {
    this.sequelize = null;
    this.models = {};
    this.initialized = false;
  }

  /**
   * Inicializa conexão com o banco de dados
   */
  async initialize() {
    if (this.initialized) {
      return this.sequelize;
    }

    try {
      // Configuração do banco
      const config = {
        database: process.env.DB_NAME || 'agendamentos_saas',
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        define: {
          timestamps: true,
          underscored: false,
          freezeTableName: true
        }
      };

      // Criar instância do Sequelize
      this.sequelize = new Sequelize(config);

      // Testar conexão
      await this.sequelize.authenticate();
      console.log('✅ [CORE] Conexão com MySQL estabelecida com sucesso');

      // Carregar modelos
      await this.loadModels();

      // Configurar associações
      await this.setupAssociations();

      // Sincronizar banco (apenas em desenvolvimento)
      if (process.env.NODE_ENV === 'development') {
        await this.syncDatabase();
      }

      this.initialized = true;
      return this.sequelize;
    } catch (error) {
      console.error('❌ [CORE] Erro ao conectar com MySQL:', error);
      throw error;
    }
  }

  /**
   * Carrega todos os modelos do banco
   */
  async loadModels() {
    try {
      // Importar modelos
      const User = require('../../models/User');
      const Empresa = require('../../models/Empresa');
      const Agendamento = require('../../models/Agendamento');
      const Servico = require('../../models/Servico');
      const PacotePersonalizado = require('../../models/PacotePersonalizado');
      const ContratoPacote = require('../../models/ContratoPacote');
      const Promocao = require('../../models/Promocao');
      const RedeEmpresarial = require('../../models/RedeEmpresarial');

      // Armazenar modelos
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

  /**
   * Configura associações entre modelos
   */
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

  /**
   * Sincroniza banco de dados (apenas desenvolvimento)
   */
  async syncDatabase() {
    try {
      await this.sequelize.sync({ alter: true });
      console.log('✅ [CORE] Banco de dados sincronizado');
    } catch (error) {
      console.error('❌ [CORE] Erro ao sincronizar banco:', error);
      throw error;
    }
  }

  /**
   * Executa transação
   */
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

  /**
   * Executa query raw
   */
  async query(sql, options = {}) {
    try {
      return await this.sequelize.query(sql, {
        type: Sequelize.QueryTypes.SELECT,
        ...options
      });
    } catch (error) {
      console.error('❌ [CORE] Erro na query:', error);
      throw error;
    }
  }

  /**
   * Fecha conexão com banco
   */
  async close() {
    if (this.sequelize) {
      await this.sequelize.close();
      console.log('✅ [CORE] Conexão com banco fechada');
    }
  }

  /**
   * Retorna instância do Sequelize
   */
  getSequelize() {
    return this.sequelize;
  }

  /**
   * Retorna modelos carregados
   */
  getModels() {
    return this.models;
  }

  /**
   * Retorna modelo específico
   */
  getModel(name) {
    return this.models[name];
  }

  /**
   * Verifica se banco está conectado
   */
  async isConnected() {
    try {
      await this.sequelize.authenticate();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Retorna informações do banco
   */
  async getDatabaseInfo() {
    try {
      const [results] = await this.sequelize.query('SELECT VERSION() as version');
      const version = results[0].version;

      const tables = await this.sequelize.query(
        "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?",
        {
          replacements: [process.env.DB_NAME || 'agendamentos_saas'],
          type: Sequelize.QueryTypes.SELECT
        }
      );

      return {
        connected: true,
        version,
        tables: tables.map(t => t.TABLE_NAME),
        dialect: this.sequelize.getDialect(),
        host: this.sequelize.config.host,
        database: this.sequelize.config.database
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message
      };
    }
  }
}

// Instância singleton
const databaseManager = new DatabaseManager();

module.exports = databaseManager;

const { sequelize } = require('./config/database');

async function testDatabase() {
  try {
    console.log('🔍 Testando conexão com o banco...');
    
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Listar bancos de dados
    const [results] = await sequelize.query('SHOW DATABASES;');
    console.log('📋 Bancos de dados encontrados:');
    results.forEach(db => {
      console.log(`  - ${db.Database}`);
    });
    
    // Verificar se o banco SaaS existe
    const saasExists = results.some(db => db.Database === 'SaaS');
    if (saasExists) {
      console.log('✅ Banco "SaaS" encontrado!');
      
      // Listar tabelas do banco SaaS
      await sequelize.query('USE SaaS;');
      const [tables] = await sequelize.query('SHOW TABLES;');
      console.log('📋 Tabelas no banco SaaS:');
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`  - ${tableName}`);
      });
    } else {
      console.log('❌ Banco "SaaS" não encontrado!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao conectar:', error.message);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  testDatabase();
}

module.exports = testDatabase;

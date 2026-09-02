const { sequelize } = require('../models');

async function prepareDatabase() {
  try {
    // Sem alter: cria as tabelas em instalações novas e preserva o schema de
    // instalações existentes para que as migrations façam mudanças controladas.
    await sequelize.sync();
    console.log('Banco preparado para executar migrations.');
  } finally {
    await sequelize.close();
  }
}

prepareDatabase().catch((error) => {
  console.error('Falha ao preparar o banco:', error);
  process.exitCode = 1;
});

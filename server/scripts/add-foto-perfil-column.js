const { sequelize } = require('../config/database');

async function addFotoPerfilColumn() {
  try {
    console.log('🔧 Adicionando coluna url_foto_perfil na tabela users...');
    
    // Verificar se a coluna já existe
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'url_foto_perfil'
      AND TABLE_SCHEMA = '${process.env.DB_NAME || 'SaaS'}'
    `);
    
    if (results.length > 0) {
      console.log('✅ Coluna url_foto_perfil já existe na tabela users');
      return;
    }
    
    // Adicionar a coluna
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN url_foto_perfil VARCHAR(500) NULL 
      COMMENT 'URL da foto de perfil do usuário'
    `);
    
    console.log('✅ Coluna url_foto_perfil adicionada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao adicionar coluna:', error);
  } finally {
    await sequelize.close();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  addFotoPerfilColumn();
}

module.exports = addFotoPerfilColumn;
require('dotenv').config();
const { sequelize } = require('./models');

async function addCompanyIdColumn() {
  try {
    console.log('🔍 Conectando ao MySQL...');
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida!');

    // Adicionar coluna identificador_empresa
    try {
      await sequelize.query(`
        ALTER TABLE empresas 
        ADD COLUMN identificador_empresa VARCHAR(50) UNIQUE
      `);
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('✅ Coluna identificador_empresa já existe');
      } else {
        throw error;
      }
    }

    console.log('✅ Coluna identificador_empresa adicionada com sucesso!');

    // Gerar IDs para empresas existentes que não têm
    const empresas = await sequelize.query(`
      SELECT e.id, e.user_id, u.razao_social 
      FROM empresas e 
      JOIN users u ON e.user_id = u.id 
      WHERE e.identificador_empresa IS NULL
    `, { type: sequelize.QueryTypes.SELECT });

    console.log(`📊 Empresas sem ID encontradas: ${empresas.length}`);

    for (const empresa of empresas) {
      // Gerar ID único
      const cleanName = empresa.razao_social.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substring(0, 15);
      const randomNumber = Math.floor(1000 + Math.random() * 9000);
      const identificador = `${cleanName}${randomNumber}`;

      // Verificar se já existe
      const existing = await sequelize.query(`
        SELECT id FROM empresas WHERE identificador_empresa = '${identificador}'
      `, { type: sequelize.QueryTypes.SELECT });

      if (existing.length === 0) {
        await sequelize.query(`
          UPDATE empresas 
          SET identificador_empresa = '${identificador}' 
          WHERE id = ${empresa.id}
        `);
        console.log(`✅ ID gerado para ${empresa.razao_social}: ${identificador}`);
      } else {
        console.log(`⚠️ ID ${identificador} já existe, tentando novamente...`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

addCompanyIdColumn();

const mysql = require('mysql2/promise');

async function checkKeys() {
  let connection;
  
  try {
    console.log('🔑 VERIFICANDO CHAVES PRIMÁRIAS E ESTRANGEIRAS:');
    
    connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: 'Cecilia@2020',
      database: 'SaaS'
    });
    
    // Verificar estrutura das tabelas
    const tables = ['users', 'empresas', 'servicos', 'agendamentos', 'agendamento_servicos', 'notificacoes', 'avaliacoes'];
    
    for (const table of tables) {
      console.log(`\n📋 Tabela: ${table}`);
      const [columns] = await connection.execute(`DESCRIBE ${table}`);
      console.log('Colunas:');
      columns.forEach(col => {
        const keyInfo = col.Key ? `[${col.Key}]` : '';
        const extraInfo = col.Extra ? `(${col.Extra})` : '';
        console.log(`  ${col.Field} | ${col.Type} | ${keyInfo} ${extraInfo}`);
      });
    }
    
    // Verificar relacionamentos (Foreign Keys)
    console.log('\n🔗 RELACIONAMENTOS (Foreign Keys):');
    const [fks] = await connection.execute(`
      SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        CONSTRAINT_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM 
        INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE 
        REFERENCED_TABLE_SCHEMA = 'SaaS' 
        AND REFERENCED_TABLE_NAME IS NOT NULL
      ORDER BY TABLE_NAME, COLUMN_NAME
    `);
    
    fks.forEach(fk => {
      console.log(`  ${fk.TABLE_NAME}.${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
    });
    
    // Verificar índices
    console.log('\n📊 ÍNDICES:');
    const [indexes] = await connection.execute(`
      SELECT 
        TABLE_NAME,
        INDEX_NAME,
        COLUMN_NAME,
        NON_UNIQUE
      FROM 
        INFORMATION_SCHEMA.STATISTICS 
      WHERE 
        TABLE_SCHEMA = 'SaaS'
      ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX
    `);
    
    let currentTable = '';
    let currentIndex = '';
    indexes.forEach(idx => {
      if (idx.TABLE_NAME !== currentTable) {
        console.log(`  ${idx.TABLE_NAME}:`);
        currentTable = idx.TABLE_NAME;
        currentIndex = '';
      }
      if (idx.INDEX_NAME !== currentIndex) {
        const unique = idx.NON_UNIQUE === 0 ? 'UNIQUE' : '';
        console.log(`    ${idx.INDEX_NAME} ${unique}`);
        currentIndex = idx.INDEX_NAME;
      }
      console.log(`      - ${idx.COLUMN_NAME}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexão fechada');
    }
  }
}

checkKeys();


const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('🔍 Testando conexão com MySQL...');
    
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: 'Cecilia@2020',
      database: 'SaaS'
    });
    
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Testar uma query simples
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query de teste executada:', rows);
    
    // Listar tabelas existentes
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tabelas existentes:', tables);
    
    await connection.end();
    console.log('🔌 Conexão fechada');
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 Banco de dados "SaaS" não existe. Tentando criar...');
      
      try {
        // Conectar sem especificar o banco
        const connection = await mysql.createConnection({
          host: '127.0.0.1',
          port: 3306,
          user: 'root',
          password: 'Cecilia@2020'
        });
        
        console.log('✅ Conexão com MySQL estabelecida (sem banco)');
        
        // Criar o banco de dados
        await connection.execute('CREATE DATABASE IF NOT EXISTS `SaaS`');
        console.log('✅ Banco de dados "SaaS" criado com sucesso!');
        
        await connection.end();
        console.log('🔌 Conexão fechada');
        
        // Testar novamente após criar o banco
        console.log('🔄 Testando conexão novamente após criar o banco...');
        await testConnection();
        
      } catch (createError) {
        console.error('❌ Erro ao criar banco:', createError.message);
      }
    }
  }
}

testConnection();

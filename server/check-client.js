const mysql = require('mysql2/promise');

async function checkClientCredentials() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Cecilia@2020',
    database: 'SaaS'
  });

  console.log('🔍 Verificando credenciais do cliente...');
  
  const [clientes] = await connection.execute('SELECT * FROM users WHERE tipo = "cliente"');
  
  clientes.forEach(cli => {
    console.log('');
    console.log('👤 CLIENTE:');
    console.log('  ID:', cli.id);
    console.log('  Nome:', cli.nome);
    console.log('  Email:', cli.email);
    console.log('  Telefone:', cli.telefone);
    console.log('  Senha:', cli.senha);
    console.log('  Tipo:', cli.tipo);
    console.log('  Ativo:', cli.ativo);
  });

  await connection.end();
}

checkClientCredentials().catch(console.error);

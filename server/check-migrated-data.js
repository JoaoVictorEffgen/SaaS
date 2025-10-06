const mysql = require('mysql2/promise');

async function checkData() {
  let connection;
  
  try {
    console.log('🔍 Verificando dados migrados...');
    
    connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: 'Cecilia@2020',
      database: 'SaaS'
    });
    
    console.log('✅ Conectado ao MySQL\n');
    
    // Verificar usuários por tipo
    console.log('👥 USUÁRIOS POR TIPO:');
    const [users] = await connection.execute(`
      SELECT tipo, COUNT(*) as total 
      FROM users 
      GROUP BY tipo 
      ORDER BY tipo
    `);
    
    users.forEach(user => {
      console.log(`  ${user.tipo}: ${user.total}`);
    });
    
    // Verificar empresas
    console.log('\n🏢 EMPRESAS:');
    const [empresas] = await connection.execute(`
      SELECT u.id, u.nome, u.email, u.telefone, e.cidade, e.estado
      FROM users u
      LEFT JOIN empresas e ON u.id = e.user_id
      WHERE u.tipo = 'empresa'
      ORDER BY u.nome
    `);
    
    empresas.forEach(empresa => {
      console.log(`  ${empresa.nome} (${empresa.email}) - ${empresa.cidade}/${empresa.estado}`);
    });
    
    // Verificar funcionários por empresa
    console.log('\n👨‍💼 FUNCIONÁRIOS POR EMPRESA:');
    const [funcionarios] = await connection.execute(`
      SELECT 
        u_empresa.nome as empresa_nome,
        u_funcionario.nome as funcionario_nome,
        u_funcionario.email as funcionario_email,
        u_funcionario.cargo
      FROM users u_funcionario
      JOIN users u_empresa ON u_funcionario.empresa_id = u_empresa.id
      WHERE u_funcionario.tipo = 'funcionario'
      ORDER BY u_empresa.nome, u_funcionario.nome
    `);
    
    let empresaAtual = '';
    funcionarios.forEach(funcionario => {
      if (funcionario.empresa_nome !== empresaAtual) {
        console.log(`  ${funcionario.empresa_nome}:`);
        empresaAtual = funcionario.empresa_nome;
      }
      console.log(`    - ${funcionario.funcionario_nome} (${funcionario.cargo})`);
    });
    
    // Verificar clientes
    console.log('\n👤 CLIENTES:');
    const [clientes] = await connection.execute(`
      SELECT nome, email, telefone
      FROM users
      WHERE tipo = 'cliente'
      ORDER BY nome
    `);
    
    clientes.forEach(cliente => {
      console.log(`  ${cliente.nome} (${cliente.email}) - ${cliente.telefone}`);
    });
    
    // Verificar serviços
    console.log('\n🔧 SERVIÇOS POR EMPRESA:');
    const [servicos] = await connection.execute(`
      SELECT 
        u.nome as empresa_nome,
        s.nome as servico_nome,
        s.duracao_minutos,
        s.preco,
        s.categoria
      FROM servicos s
      JOIN users u ON s.empresa_id = u.id
      ORDER BY u.nome, s.nome
    `);
    
    let empresaServicoAtual = '';
    servicos.forEach(servico => {
      if (servico.empresa_nome !== empresaServicoAtual) {
        console.log(`  ${servico.empresa_nome}:`);
        empresaServicoAtual = servico.empresa_nome;
      }
      console.log(`    - ${servico.servico_nome} (${servico.duracao_minutos}min, R$ ${servico.preco})`);
    });
    
    // Resumo final
    console.log('\n📊 RESUMO FINAL:');
    const [totalUsers] = await connection.execute('SELECT COUNT(*) as total FROM users');
    const [totalEmpresas] = await connection.execute('SELECT COUNT(*) as total FROM empresas');
    const [totalServicos] = await connection.execute('SELECT COUNT(*) as total FROM servicos');
    
    console.log(`  Total de usuários: ${totalUsers[0].total}`);
    console.log(`  Total de empresas: ${totalEmpresas[0].total}`);
    console.log(`  Total de serviços: ${totalServicos[0].total}`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexão fechada');
    }
  }
}

checkData();

require('dotenv').config({ path: '../.env' });
const { sequelize, User, Empresa, Agendamento, Servico, RedeEmpresarial, PacotePersonalizado, ContratoPacote, Promocao } = require('./models');
const bcrypt = require('bcrypt');

async function cleanAndRecreateUsers() {
  try {
    // Conectar ao banco de dados
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados');

    // Limpar todas as tabelas na ordem correta (respeitando foreign keys)
    console.log('🧹 Limpando dados existentes...');
    
    await ContratoPacote.destroy({ where: {}, force: true });
    await Promocao.destroy({ where: {}, force: true });
    await PacotePersonalizado.destroy({ where: {}, force: true });
    await Agendamento.destroy({ where: {}, force: true });
    await Servico.destroy({ where: {}, force: true });
    await RedeEmpresarial.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
    await Empresa.destroy({ where: {}, force: true });
    
    console.log('✅ Dados limpos com sucesso');

    // Recriar tabelas
    await sequelize.sync({ force: true });
    console.log('✅ Tabelas recriadas');

    const hashedPassword = await bcrypt.hash('123456', 10);

    // 1. Criar Usuário Empresa PRIMEIRO
    console.log('🏢 Criando usuário empresa...');
    const empresaUser = await User.create({
      nome: 'Empresa Teste',
      email: 'empresa@teste.com',
      senha: hashedPassword,
      tipo: 'empresa',
      cnpj: '11.111.111/0001-11',
      razao_social: 'Empresa Teste S.A.',
      ativo: true,
    });
    console.log(`✅ Usuário Empresa criado - ID: ${empresaUser.id}`);

    // 2. Criar Empresa associada ao usuário empresa
    console.log('🏢 Criando empresa...');
    const empresa = await Empresa.create({
      nome: 'Empresa Teste S.A.',
      cnpj: '11.111.111/0001-11',
      user_id: empresaUser.id,
      identificador_empresa: 'empresa_teste',
      ativo: true,
      horario_funcionamento: {
        segunda: { abre: '09:00', fecha: '18:00' },
        terca: { abre: '09:00', fecha: '18:00' },
        quarta: { abre: '09:00', fecha: '18:00' },
        quinta: { abre: '09:00', fecha: '18:00' },
        sexta: { abre: '09:00', fecha: '18:00' },
        sabado: { abre: '09:00', fecha: '13:00' },
        domingo: null,
      },
    });
    console.log(`✅ Empresa criada - ID: ${empresa.id}`);

    // 3. Criar Usuário Funcionário LIGADO à empresa
    console.log('👨‍💼 Criando funcionário ligado à empresa...');
    const funcionarioUser = await User.create({
      nome: 'Funcionário Teste',
      email: 'funcionario@teste.com',
      senha: hashedPassword,
      tipo: 'funcionario',
      cpf: '111.111.111-11',
      empresa_id: empresa.id, // SEMPRE ligado à empresa
      ativo: true,
    });
    console.log(`✅ Funcionário criado - ID: ${funcionarioUser.id}, Empresa ID: ${empresa.id}`);

    // 4. Criar Usuário Cliente
    console.log('👤 Criando cliente...');
    const clienteUser = await User.create({
      nome: 'Cliente Teste',
      email: 'cliente@teste.com',
      senha: hashedPassword,
      tipo: 'cliente',
      cpf: '222.222.222-22',
      ativo: true,
    });
    console.log(`✅ Cliente criado - ID: ${clienteUser.id}`);

    console.log('\n🎯 RESUMO DOS USUÁRIOS DE TESTE:');
    console.log('================================');
    console.log('🏢 EMPRESA:');
    console.log(`   Email: empresa@teste.com`);
    console.log(`   Senha: 123456`);
    console.log(`   User ID: ${empresaUser.id}`);
    console.log(`   Empresa ID: ${empresa.id}`);
    console.log('\n👨‍💼 FUNCIONÁRIO:');
    console.log(`   Email: funcionario@teste.com`);
    console.log(`   Senha: 123456`);
    console.log(`   User ID: ${funcionarioUser.id}`);
    console.log(`   Empresa ID: ${empresa.id} (SEMPRE LIGADO)`);
    console.log('\n👤 CLIENTE:');
    console.log(`   Email: cliente@teste.com`);
    console.log(`   Senha: 123456`);
    console.log(`   User ID: ${clienteUser.id}`);
    console.log('\n🔗 INFORMAÇÕES IMPORTANTES:');
    console.log(`   Para acessar funcionário: empresa_id = ${empresa.id}`);
    console.log(`   Email da empresa: empresa@teste.com`);
    console.log('\n🌐 URLs:');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Backend: http://localhost:5000');

  } catch (error) {
    console.error('❌ Erro ao limpar e recriar usuários:', error);
  } finally {
    await sequelize.close();
  }
}

cleanAndRecreateUsers();

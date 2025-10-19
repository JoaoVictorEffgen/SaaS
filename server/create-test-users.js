require('dotenv').config({ path: '../.env' });
const { sequelize, User, Empresa } = require('./models');
const bcrypt = require('bcrypt');

console.log('🔍 Configuração MySQL:', { 
  DB_NAME: process.env.DB_NAME, 
  DB_USER: process.env.DB_USER, 
  DB_HOST: process.env.DB_HOST, 
  DB_PORT: process.env.DB_PORT 
});

async function createTestUsers() {
  try {
    // Conectar ao banco de dados
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados');

    // Sincronizar modelos (garante que as tabelas existem)
    await sequelize.sync({ alter: true });
    console.log('✅ Conexão com MySQL estabelecida com sucesso');

    // Buscar empresas existentes para associar o funcionário
    const empresas = await Empresa.findAll({
      attributes: ['id', 'nome', 'user_id']
    });
    console.log('📊 Empresas encontradas:');
    empresas.forEach(emp => {
      console.log(`- ID: ${emp.id}, Nome: ${emp.nome}, Email do usuário: ${emp.user_id}`);
    });

    let empresaIdParaFuncionario = null;
    if (empresas.length > 0) {
      empresaIdParaFuncionario = empresas[0].id; // Associa o funcionário à primeira empresa encontrada
    } else {
      console.warn('⚠️ Nenhuma empresa encontrada. O funcionário não será associado a uma empresa.');
    }

    const hashedPassword = await bcrypt.hash('123456', 10);

    // 1. Usuário Empresa
    let empresaUser = await User.findOne({ where: { email: 'empresa@teste.com', tipo: 'empresa' } });
    if (!empresaUser) {
      empresaUser = await User.create({
        nome: 'Empresa Teste',
        email: 'empresa@teste.com',
        senha: hashedPassword,
        tipo: 'empresa',
        cnpj: '11.111.111/0001-11',
        razao_social: 'Empresa Teste S.A.',
        ativo: true,
      });
      console.log('✅ Usuário Empresa criado: empresa@teste.com');

      // Criar uma empresa associada a este usuário
      let empresaExistente = await Empresa.findOne({ where: { user_id: empresaUser.id } });
      if (!empresaExistente) {
        await Empresa.create({
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
        console.log('✅ Empresa associada ao usuário empresa criada.');
      } else {
        console.log('✅ Empresa associada ao usuário empresa já existe.');
      }
    } else {
      console.log('✅ Empresa já existe: empresa@teste.com');
    }

    // 2. Usuário Funcionário
    let funcionarioUser = await User.findOne({ where: { email: 'funcionario@teste.com', tipo: 'funcionario' } });
    if (!funcionarioUser) {
      funcionarioUser = await User.create({
        nome: 'Funcionário Teste',
        email: 'funcionario@teste.com',
        senha: hashedPassword,
        tipo: 'funcionario',
        cpf: '111.111.111-11',
        empresa_id: empresaIdParaFuncionario, // Associa ao ID da primeira empresa
        ativo: true,
      });
      console.log('✅ Usuário Funcionário criado: funcionario@teste.com');
    } else {
      console.log('✅ Funcionário já existe: funcionario@teste.com');
    }

    // 3. Usuário Cliente
    let clienteUser = await User.findOne({ where: { email: 'cliente@teste.com', tipo: 'cliente' } });
    if (!clienteUser) {
      clienteUser = await User.create({
        nome: 'Cliente Teste',
        email: 'cliente@teste.com',
        senha: hashedPassword,
        tipo: 'cliente',
        cpf: '222.222.222-22',
        ativo: true,
      });
      console.log('✅ Usuário Cliente criado: cliente@teste.com');
    } else {
      console.log('✅ Cliente já existe: cliente@teste.com');
    }

    console.log('\n🎯 RESUMO DOS USUÁRIOS DE TESTE:');
    console.log('================================');
    console.log('🏢 EMPRESA:');
    console.log('   Email: empresa@teste.com');
    console.log('   Senha: 123456');
    console.log('\n👨‍💼 FUNCIONÁRIO:');
    console.log('   Email: funcionario@teste.com');
    console.log('   Senha: 123456');
    console.log('   Empresa: Associado à primeira empresa do sistema');
    console.log('\n👤 CLIENTE:');
    console.log('   Email: cliente@teste.com');
    console.log('   Senha: 123456');
    console.log('\n🌐 URLs:');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Backend: http://localhost:5000');

  } catch (error) {
    console.error('❌ Erro ao criar usuários de teste:', error);
  } finally {
    await sequelize.close();
  }
}

createTestUsers();

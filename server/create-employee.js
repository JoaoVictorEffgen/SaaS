require('dotenv').config();
const { sequelize, User, Empresa } = require('./models');
const setupAssociations = require('./models/associations-simple');

async function createEmployee() {
  try {
    console.log('🔧 Configurando relacionamentos...');
    setupAssociations();
    
    console.log('🔍 Conectando ao MySQL...');
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida!');

    // Verificar se o funcionário já existe
    const existingEmployee = await User.findOne({ 
      where: { cpf: '123.456.789-00' } 
    });

    if (existingEmployee) {
      console.log('✅ Funcionário já existe:', existingEmployee.nome);
      console.log('📧 Email:', existingEmployee.email);
      console.log('🔑 Senha:', existingEmployee.senha);
      console.log('🏢 Empresa ID:', existingEmployee.empresa_id);
    } else {
      // Criar funcionário de teste
      const employee = await User.create({
        tipo: 'funcionario',
        nome: 'João Silva',
        email: 'joao@barbeariamoderna.com',
        senha: 'funcionario123',
        cpf: '123.456.789-00',
        empresa_id: 1, // ID da empresa de teste
        cargo: 'Barbeiro',
        ativo: true,
      });
      
      console.log('✅ Funcionário criado:', employee.nome);
      console.log('📧 Email:', employee.email);
      console.log('🔑 Senha:', employee.senha);
    }

    // Listar todos os funcionários
    const employees = await User.findAll({
      where: { tipo: 'funcionario' }
    });
    
    console.log('\n👨‍💼 Funcionários no banco:');
    employees.forEach(emp => {
      console.log(`- ${emp.nome} (CPF: ${emp.cpf}) - Senha: ${emp.senha}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

createEmployee();

require('dotenv').config();
const { sequelize, User, Empresa } = require('./models');
const setupAssociations = require('./models/associations-simple');

async function createEmployeeForJete() {
  try {
    console.log('🔧 Configurando relacionamentos...');
    setupAssociations();
    
    console.log('🔍 Conectando ao MySQL...');
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida!');

    // Buscar a empresa "Jete"
    const empresa = await Empresa.findOne({
      include: [{
        model: User,
        as: 'owner',
        where: { email: 'jet@empresa.com' }
      }]
    });

    if (!empresa) {
      console.log('❌ Empresa "Jete" não encontrada');
      return;
    }

    console.log('✅ Empresa encontrada:', empresa.owner.email);
    console.log('🆔 ID da Empresa:', empresa.identificador_empresa);

    // Verificar se o funcionário já existe
    const existingEmployee = await User.findOne({ 
      where: { 
        cpf: '111.111.111-11',
        empresa_id: empresa.id 
      } 
    });

    if (existingEmployee) {
      console.log('✅ Funcionário já existe:', existingEmployee.nome);
      console.log('📧 Email:', existingEmployee.email);
      console.log('🔑 Senha:', existingEmployee.senha);
      console.log('🏢 Empresa ID:', existingEmployee.empresa_id);
    } else {
      // Criar funcionário de teste para a empresa Jete
      const employee = await User.create({
        tipo: 'funcionario',
        nome: 'Pedro Silva',
        email: 'pedro@jet.com',
        senha: 'funcionario123',
        cpf: '111.111.111-11',
        empresa_id: empresa.id,
        cargo: 'Atendente',
        ativo: true,
      });
      
      console.log('✅ Funcionário criado:', employee.nome);
      console.log('📧 Email:', employee.email);
      console.log('🔑 Senha:', employee.senha);
      console.log('🏢 Empresa ID:', employee.empresa_id);
    }

    // Listar todos os funcionários da empresa Jete
    const employees = await User.findAll({
      where: { 
        tipo: 'funcionario',
        empresa_id: empresa.id 
      }
    });
    
    console.log('\n👨‍💼 Funcionários da empresa Jete:');
    employees.forEach(emp => {
      console.log(`- ${emp.nome} (CPF: ${emp.cpf}) - Senha: ${emp.senha}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

createEmployeeForJete();

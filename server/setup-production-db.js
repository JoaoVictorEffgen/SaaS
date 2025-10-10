require('dotenv').config();
const { sequelize, User, Empresa, Servico, Agendamento } = require('./models');
const setupAssociations = require('./models/associations-simple');
const bcrypt = require('bcryptjs');

async function setupProductionDatabase() {
  console.log('🚀 Configurando banco de dados para produção...');
  
  try {
    // Configurar associações
    setupAssociations();
    
    // Conectar ao banco
    await sequelize.authenticate();
    console.log('✅ Conexão com banco estabelecida');
    
    // Sincronizar tabelas
    await sequelize.sync({ force: false });
    console.log('✅ Tabelas sincronizadas');
    
    // Criar dados de teste se não existirem
    
    // 1. Criar empresa de teste
    const existingEmpresa = await User.findOne({
      where: { email: 'teste@empresa.com' }
    });
    
    if (!existingEmpresa) {
      const hashedPasswordEmpresa = await bcrypt.hash('empresa123', 10);
      
      const empresaUser = await User.create({
        tipo: 'empresa',
        nome: 'Empresa Teste',
        email: 'teste@empresa.com',
        senha: hashedPasswordEmpresa,
        telefone: '(11) 99999-9999',
        cnpj: '12.345.678/0001-90',
        razao_social: 'Empresa Teste LTDA',
        ativo: true
      });
      
      const empresa = await Empresa.create({
        user_id: empresaUser.id,
        endereco: 'Rua das Flores, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567',
        descricao: 'Empresa de teste para demonstração do sistema',
        horario_funcionamento: JSON.stringify({
          segunda: { inicio: '08:00', fim: '18:00' },
          terca: { inicio: '08:00', fim: '18:00' },
          quarta: { inicio: '08:00', fim: '18:00' },
          quinta: { inicio: '08:00', fim: '18:00' },
          sexta: { inicio: '08:00', fim: '18:00' },
          sabado: { inicio: '08:00', fim: '12:00' }
        }),
        identificador_empresa: 'teste1234',
        ativo: true
      });
      
      console.log('✅ Empresa de teste criada');
      
      // 2. Criar funcionário de teste
      const hashedPasswordFuncionario = await bcrypt.hash('funcionario123', 10);
      
      const funcionario = await User.create({
        tipo: 'funcionario',
        nome: 'João Silva',
        email: 'joao@empresa.com',
        senha: hashedPasswordFuncionario,
        cpf: '123.456.789-00',
        empresa_id: empresa.id,
        cargo: 'Atendente',
        ativo: true
      });
      
      console.log('✅ Funcionário de teste criado');
      
      // 3. Criar cliente de teste
      const hashedPasswordCliente = await bcrypt.hash('cliente123', 10);
      
      const cliente = await User.create({
        tipo: 'cliente',
        nome: 'Maria Santos',
        email: 'cliente@teste.com',
        senha: hashedPasswordCliente,
        telefone: '(11) 88888-8888',
        cpf: '987.654.321-00',
        ativo: true
      });
      
      console.log('✅ Cliente de teste criado');
      
      // 4. Criar serviços de exemplo
      const servicos = [
        {
          nome: 'Corte de Cabelo',
          descricao: 'Corte masculino tradicional',
          duracao_minutos: 30,
          preco: 25.00,
          categoria: 'Cabelo',
          empresa_id: empresa.id,
          ativo: true
        },
        {
          nome: 'Barba',
          descricao: 'Aparar e modelar barba',
          duracao_minutos: 20,
          preco: 15.00,
          categoria: 'Barba',
          empresa_id: empresa.id,
          ativo: true
        },
        {
          nome: 'Corte + Barba',
          descricao: 'Pacote completo',
          duracao_minutos: 45,
          preco: 35.00,
          categoria: 'Combo',
          empresa_id: empresa.id,
          ativo: true
        }
      ];
      
      for (const servico of servicos) {
        await Servico.create(servico);
      }
      
      console.log('✅ Serviços de exemplo criados');
      
    } else {
      console.log('ℹ️ Dados de teste já existem');
    }
    
    console.log('\n🎉 Banco de dados configurado com sucesso!');
    console.log('\n👥 Usuários de teste:');
    console.log('🏢 EMPRESA: teste@empresa.com / empresa123');
    console.log('👨‍💼 FUNCIONÁRIO: 123.456.789-00 / funcionario123');
    console.log('👤 CLIENTE: cliente@teste.com / cliente123');
    console.log('\n🔗 ID da Empresa: teste1234');
    
  } catch (error) {
    console.error('❌ Erro ao configurar banco:', error);
  } finally {
    await sequelize.close();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setupProductionDatabase();
}

module.exports = setupProductionDatabase;

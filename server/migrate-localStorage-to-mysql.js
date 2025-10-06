const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function migrateData() {
  let connection;
  
  try {
    console.log('🔄 Iniciando migração dos dados do localStorage para MySQL...');
    
    // Conectar ao MySQL
    connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: 'Cecilia@2020',
      database: 'SaaS'
    });
    
    console.log('✅ Conectado ao MySQL');
    
    // Simular dados do localStorage (você pode ajustar conforme necessário)
    const empresasLocalStorage = [
      {
        id: 'salao_beleza_estilo_7890',
        nome: 'Salão Beleza & Estilo',
        email: 'contato@belezaestilo.com',
        telefone: '(11) 99999-1111',
        whatsapp_contato: '(11) 99999-1111',
        especializacao: 'Beleza e Estética',
        descricao_servico: 'Salão completo com serviços de cabelo, unhas, maquiagem e tratamentos estéticos.',
        horario_inicio: '08:00',
        horario_fim: '18:00',
        dias_funcionamento: [1, 2, 3, 4, 5, 6],
        logo_url: null,
        notaMedia: 4.8,
        totalAvaliacoes: 127,
        funcionarios: [
          { id: '1', nome: 'Ana Silva', especialidade: 'Cabelereira' },
          { id: '2', nome: 'Carlos Santos', especialidade: 'Barbeiro' }
        ]
      },
      {
        id: 'clinica_saude_total_2468',
        nome: 'Clínica Saúde Total',
        email: 'contato@saudetotal.com',
        telefone: '(11) 99999-2222',
        whatsapp_contato: '(11) 99999-2222',
        especializacao: 'Saúde e Bem-estar',
        descricao_servico: 'Clínica médica com consultas em diversas especialidades e exames.',
        horario_inicio: '07:00',
        horario_fim: '19:00',
        dias_funcionamento: [1, 2, 3, 4, 5],
        logo_url: null,
        notaMedia: 4.9,
        totalAvaliacoes: 89,
        funcionarios: [
          { id: '3', nome: 'Dr. João Silva', especialidade: 'Clínico Geral' },
          { id: '4', nome: 'Dra. Maria Santos', especialidade: 'Cardiologista' }
        ]
      },
      {
        id: 'academia_fitlife_1357',
        nome: 'Academia FitLife',
        email: 'contato@fitlife.com',
        telefone: '(11) 99999-3333',
        whatsapp_contato: '(11) 99999-3333',
        especializacao: 'Fitness e Academia',
        descricao_servico: 'Academia moderna com equipamentos de última geração e personal trainers.',
        horario_inicio: '05:00',
        horario_fim: '23:00',
        dias_funcionamento: [1, 2, 3, 4, 5, 6, 0],
        logo_url: null,
        notaMedia: 4.7,
        totalAvaliacoes: 203,
        funcionarios: [
          { id: '5', nome: 'Pedro Costa', especialidade: 'Personal Trainer' },
          { id: '6', nome: 'Juliana Lima', especialidade: 'Instrutora de Pilates' }
        ]
      }
    ];
    
    const clientesLocalStorage = [
      {
        id: 'cliente_teste_001',
        nome: 'João da Silva',
        email: 'joao@email.com',
        telefone: '(11) 99999-0001',
        cpf: '123.456.789-00'
      },
      {
        id: 'cliente_teste_002', 
        nome: 'Maria Santos',
        email: 'maria@email.com',
        telefone: '(11) 99999-0002',
        cpf: '987.654.321-00'
      }
    ];
    
    console.log('📋 Migrando empresas...');
    
    // Migrar empresas
    for (const empresa of empresasLocalStorage) {
      // Criar hash da senha
      const senhaHash = await bcrypt.hash('senha123', 10);
      
      // Inserir empresa como usuário
      const [userResult] = await connection.execute(`
        INSERT INTO users (tipo, nome, email, senha, telefone, razao_social) VALUES 
        ('empresa', ?, ?, ?, ?, ?)
      `, [
        empresa.nome,
        empresa.email,
        senhaHash,
        empresa.telefone,
        empresa.nome
      ]);
      
      const userId = userResult.insertId;
      
      // Inserir dados da empresa
      await connection.execute(`
        INSERT INTO empresas (user_id, endereco, cidade, estado, descricao, horario_funcionamento, whatsapp) VALUES 
        (?, ?, ?, ?, ?, ?, ?)
      `, [
        userId,
        'Endereço não informado',
        'São Paulo',
        'SP',
        empresa.descricao_servico,
        JSON.stringify({
          segunda: empresa.dias_funcionamento.includes(1) ? { inicio: empresa.horario_inicio, fim: empresa.horario_fim } : null,
          terca: empresa.dias_funcionamento.includes(2) ? { inicio: empresa.horario_inicio, fim: empresa.horario_fim } : null,
          quarta: empresa.dias_funcionamento.includes(3) ? { inicio: empresa.horario_inicio, fim: empresa.horario_fim } : null,
          quinta: empresa.dias_funcionamento.includes(4) ? { inicio: empresa.horario_inicio, fim: empresa.horario_fim } : null,
          sexta: empresa.dias_funcionamento.includes(5) ? { inicio: empresa.horario_inicio, fim: empresa.horario_fim } : null,
          sabado: empresa.dias_funcionamento.includes(6) ? { inicio: empresa.horario_inicio, fim: empresa.horario_fim } : null,
          domingo: empresa.dias_funcionamento.includes(0) ? { inicio: empresa.horario_inicio, fim: empresa.horario_fim } : null
        }),
        empresa.whatsapp_contato
      ]);
      
      // Inserir funcionários da empresa
      for (const funcionario of empresa.funcionarios) {
        const funcionarioSenhaHash = await bcrypt.hash('funcionario123', 10);
        
        await connection.execute(`
          INSERT INTO users (tipo, nome, email, senha, cpf, empresa_id, cargo) VALUES 
          ('funcionario', ?, ?, ?, ?, ?, ?)
        `, [
          funcionario.nome,
          `${funcionario.nome.toLowerCase().replace(/\s+/g, '.')}@${empresa.email.split('@')[1]}`,
          funcionarioSenhaHash,
          `${Math.floor(Math.random() * 900000000) + 100000000}`,
          userId,
          funcionario.especialidade
        ]);
      }
      
      // Inserir serviços básicos para cada empresa
      const servicos = [
        { nome: 'Consulta Básica', descricao: 'Serviço básico', duracao: 60, preco: 50.00, categoria: 'Geral' },
        { nome: 'Serviço Premium', descricao: 'Serviço premium', duracao: 90, preco: 80.00, categoria: 'Premium' }
      ];
      
      for (const servico of servicos) {
        await connection.execute(`
          INSERT INTO servicos (empresa_id, nome, descricao, duracao_minutos, preco, categoria) VALUES 
          (?, ?, ?, ?, ?, ?)
        `, [
          userId,
          servico.nome,
          servico.descricao,
          servico.duracao,
          servico.preco,
          servico.categoria
        ]);
      }
      
      console.log(`✅ Empresa "${empresa.nome}" migrada com sucesso`);
    }
    
    console.log('👥 Migrando clientes...');
    
    // Migrar clientes
    for (const cliente of clientesLocalStorage) {
      const clienteSenhaHash = await bcrypt.hash('cliente123', 10);
      
      await connection.execute(`
        INSERT INTO users (tipo, nome, email, senha, telefone, cpf) VALUES 
        ('cliente', ?, ?, ?, ?, ?)
      `, [
        cliente.nome,
        cliente.email,
        clienteSenhaHash,
        cliente.telefone,
        cliente.cpf
      ]);
      
      console.log(`✅ Cliente "${cliente.nome}" migrado com sucesso`);
    }
    
    // Mostrar resumo final
    console.log('\n📊 RESUMO DA MIGRAÇÃO:');
    
    const [userCount] = await connection.execute('SELECT COUNT(*) as total FROM users');
    console.log('👥 Total de usuários:', userCount[0].total);
    
    const [empresaCount] = await connection.execute('SELECT COUNT(*) as total FROM users WHERE tipo = "empresa"');
    console.log('🏢 Total de empresas:', empresaCount[0].total);
    
    const [funcionarioCount] = await connection.execute('SELECT COUNT(*) as total FROM users WHERE tipo = "funcionario"');
    console.log('👨‍💼 Total de funcionários:', funcionarioCount[0].total);
    
    const [clienteCount] = await connection.execute('SELECT COUNT(*) as total FROM users WHERE tipo = "cliente"');
    console.log('👤 Total de clientes:', clienteCount[0].total);
    
    const [servicoCount] = await connection.execute('SELECT COUNT(*) as total FROM servicos');
    console.log('🔧 Total de serviços:', servicoCount[0].total);
    
    console.log('\n🎉 Migração concluída com sucesso!');
    console.log('\n📋 CREDENCIAIS DE TESTE:');
    console.log('🏢 Empresas:');
    console.log('  - contato@belezaestilo.com / senha123');
    console.log('  - contato@saudetotal.com / senha123');
    console.log('  - contato@fitlife.com / senha123');
    console.log('\n👨‍💼 Funcionários:');
    console.log('  - ana.silva@belezaestilo.com / funcionario123');
    console.log('  - carlos.santos@belezaestilo.com / funcionario123');
    console.log('\n👤 Clientes:');
    console.log('  - joao@email.com / cliente123');
    console.log('  - maria@email.com / cliente123');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão fechada');
    }
  }
}

migrateData();

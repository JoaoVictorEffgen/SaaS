// Script para criar dados de teste
import localStorageService from '../services/localStorageService';

export const createTestData = () => {
  // Verificar se já existem dados
  const empresas = localStorageService.getEmpresas();
  const funcionarios = JSON.parse(localStorage.getItem('funcionarios') || '[]');
  const agendamentos = localStorageService.getAgendamentos();

  console.log('Dados atuais:');
  console.log('Empresas:', empresas.length);
  console.log('Funcionários:', funcionarios.length);
  console.log('Agendamentos:', agendamentos.length);

  // Criar empresa de teste se não existir
  let empresaTeste = empresas.find(emp => emp.nome === 'Barbearia do João');
  
  if (!empresaTeste) {
    empresaTeste = {
      id: 'emp_teste_001',
      nome: 'Barbearia do João',
      email: 'joao@barbearia.com',
      senha: '123456',
      telefone: '11999887766',
      endereco: 'Rua das Flores, 123 - Centro',
      especializacao: 'Barbearia e Estética Masculina',
      descricao_servico: 'Cortes modernos, barba, bigode e tratamentos estéticos masculinos',
      notaMedia: 4.8,
      totalAvaliacoes: 156,
      latitude: -23.5505, // São Paulo - Centro
      longitude: -46.6333,
      funcionarios: [],
      servicos: [
        {
          id: 'serv_001',
          nome: 'Corte Masculino',
          preco: 25.00,
          duracao: 30,
          descricao: 'Corte moderno masculino'
        },
        {
          id: 'serv_002',
          nome: 'Barba Completa',
          preco: 20.00,
          duracao: 25,
          descricao: 'Aparar e modelar barba'
        },
        {
          id: 'serv_003',
          nome: 'Corte + Barba',
          preco: 40.00,
          duracao: 50,
          descricao: 'Pacote completo'
        }
      ]
    };

    // Criar empresas adicionais para testar proximidade
    const empresasAdicionais = [
      {
        id: 'emp_teste_002',
        nome: 'Salão Beleza Total',
        email: 'contato@beleza.com',
        senha: '123456',
        telefone: '11988776655',
        endereco: 'Av. Paulista, 1000 - Bela Vista',
        especializacao: 'Cabelo e Estética Feminina',
        descricao_servico: 'Cortes, coloração, tratamentos capilares e estética',
        notaMedia: 4.7,
        totalAvaliacoes: 89,
        latitude: -23.5615, // Próximo ao Centro (dentro de 15km)
        longitude: -46.6565,
        funcionarios: [],
        servicos: [
          {
            id: 'serv_004',
            nome: 'Corte Feminino',
            preco: 35.00,
            duracao: 45,
            descricao: 'Corte moderno feminino'
          },
          {
            id: 'serv_005',
            nome: 'Coloração',
            preco: 80.00,
            duracao: 120,
            descricao: 'Coloração completa'
          }
        ]
      },
      {
        id: 'emp_teste_003',
        nome: 'Clínica Odontológica Sorriso',
        email: 'contato@sorriso.com',
        senha: '123456',
        telefone: '11977665544',
        endereco: 'Rua Augusta, 500 - Consolação',
        especializacao: 'Odontologia',
        descricao_servico: 'Consultas, limpeza, clareamento e tratamentos odontológicos',
        notaMedia: 4.9,
        totalAvaliacoes: 234,
        latitude: -23.5431, // Próximo ao Centro (dentro de 15km)
        longitude: -46.6291,
        funcionarios: [],
        servicos: [
          {
            id: 'serv_006',
            nome: 'Consulta Odontológica',
            preco: 150.00,
            duracao: 60,
            descricao: 'Consulta completa com avaliação'
          },
          {
            id: 'serv_007',
            nome: 'Limpeza Dental',
            preco: 120.00,
            duracao: 45,
            descricao: 'Profilaxia completa'
          }
        ]
      },
      {
        id: 'emp_teste_004',
        nome: 'Academia Fitness Pro',
        email: 'contato@fitness.com',
        senha: '123456',
        telefone: '11966554433',
        endereco: 'Rua Oscar Freire, 200 - Jardins',
        especializacao: 'Academia e Personal Training',
        descricao_servico: 'Musculação, aeróbica, personal training e avaliação física',
        notaMedia: 4.6,
        totalAvaliacoes: 167,
        latitude: -23.5687, // Próximo ao Centro (dentro de 15km)
        longitude: -46.6765,
        funcionarios: [],
        servicos: [
          {
            id: 'serv_008',
            nome: 'Personal Training',
            preco: 80.00,
            duracao: 60,
            descricao: 'Treino personalizado'
          },
          {
            id: 'serv_009',
            nome: 'Avaliação Física',
            preco: 50.00,
            duracao: 30,
            descricao: 'Análise completa do condicionamento'
          }
        ]
      },
      {
        id: 'emp_teste_005',
        nome: 'Spa Relaxamento Total',
        email: 'contato@spa.com',
        senha: '123456',
        telefone: '11955443322',
        endereco: 'Av. Faria Lima, 1500 - Itaim Bibi',
        especializacao: 'Spa e Bem-estar',
        descricao_servico: 'Massagens, tratamentos faciais e corporais, relaxamento',
        notaMedia: 4.8,
        totalAvaliacoes: 98,
        latitude: -23.5845, // Próximo ao Centro (dentro de 15km)
        longitude: -46.6887,
        funcionarios: [],
        servicos: [
          {
            id: 'serv_010',
            nome: 'Massagem Relaxante',
            preco: 120.00,
            duracao: 60,
            descricao: 'Massagem terapêutica completa'
          },
          {
            id: 'serv_011',
            nome: 'Tratamento Facial',
            preco: 80.00,
            duracao: 45,
            descricao: 'Limpeza e hidratação facial'
          }
        ]
      },
      {
        id: 'emp_teste_006',
        nome: 'Restaurante Sabor & Arte',
        email: 'contato@sabor.com',
        senha: '123456',
        telefone: '11944332211',
        endereco: 'Rua Bela Cintra, 800 - Jardins',
        especializacao: 'Gastronomia',
        descricao_servico: 'Almoço executivo, jantar romântico, eventos corporativos',
        notaMedia: 4.7,
        totalAvaliacoes: 145,
        latitude: -23.5789, // Próximo ao Centro (dentro de 15km)
        longitude: -46.6723,
        funcionarios: [],
        servicos: [
          {
            id: 'serv_012',
            nome: 'Almoço Executivo',
            preco: 45.00,
            duracao: 60,
            descricao: 'Menu executivo completo'
          },
          {
            id: 'serv_013',
            nome: 'Jantar Romântico',
            preco: 120.00,
            duracao: 120,
            descricao: 'Menu especial para casais'
          }
        ]
      },
      {
        id: 'emp_teste_007',
        nome: 'Barbearia Moderna',
        email: 'contato@moderna.com',
        senha: '123456',
        telefone: '11933221100',
        endereco: 'Rua da Consolação, 1500 - Centro',
        especializacao: 'Barbearia Premium',
        descricao_servico: 'Cortes premium, barba, bigode e tratamentos masculinos',
        notaMedia: 4.9,
        totalAvaliacoes: 203,
        latitude: -23.5456, // Próximo ao Centro (dentro de 15km)
        longitude: -46.6345,
        funcionarios: [],
        servicos: [
          {
            id: 'serv_014',
            nome: 'Corte Premium',
            preco: 35.00,
            duracao: 40,
            descricao: 'Corte masculino premium'
          },
          {
            id: 'serv_015',
            nome: 'Barba Premium',
            preco: 25.00,
            duracao: 30,
            descricao: 'Barba com navalha quente'
          }
        ]
      }
    ];

    // Adicionar empresas
    const empresasAtualizadas = [...empresas, empresaTeste, ...empresasAdicionais];
    localStorage.setItem('empresas', JSON.stringify(empresasAtualizadas));
    console.log('✅ Empresa de teste criada:', empresaTeste.nome);
    console.log('✅ Empresas adicionais criadas:', empresasAdicionais.length);
  }

  // Criar funcionários de teste se não existirem
  const funcionariosTeste = [
    {
      id: 'func_teste_001',
      nome: 'Carlos Silva',
      cpf: '12345678901',
      email: 'carlos@barbearia.com',
      telefone: '11988776655',
      cargo: 'Barbeiro',
      especialidades: ['Corte Masculino', 'Barba Completa', 'Corte + Barba'],
      empresaId: empresaTeste.id,
      ativo: true,
      horariosTrabalho: {
        segunda: { inicio: '09:00', fim: '18:00' },
        terca: { inicio: '09:00', fim: '18:00' },
        quarta: { inicio: '09:00', fim: '18:00' },
        quinta: { inicio: '09:00', fim: '18:00' },
        sexta: { inicio: '09:00', fim: '18:00' },
        sabado: { inicio: '08:00', fim: '17:00' },
        domingo: null
      }
    },
    {
      id: 'func_teste_002',
      nome: 'Pedro Santos',
      cpf: '98765432109',
      email: 'pedro@barbearia.com',
      telefone: '11977665544',
      cargo: 'Barbeiro Sênior',
      especialidades: ['Corte Masculino', 'Barba Completa', 'Corte + Barba'],
      empresaId: empresaTeste.id,
      ativo: true,
      horariosTrabalho: {
        segunda: { inicio: '10:00', fim: '19:00' },
        terca: { inicio: '10:00', fim: '19:00' },
        quarta: { inicio: '10:00', fim: '19:00' },
        quinta: { inicio: '10:00', fim: '19:00' },
        sexta: { inicio: '10:00', fim: '19:00' },
        sabado: { inicio: '09:00', fim: '16:00' },
        domingo: null
      }
    }
  ];

  funcionariosTeste.forEach(funcionario => {
    const existeFuncionario = funcionarios.find(f => f.id === funcionario.id);
    if (!existeFuncionario) {
      funcionarios.push(funcionario);
      localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
      console.log('✅ Funcionário de teste criado:', funcionario.nome);
    }
  });

  // Criar agendamentos de teste se não existirem
  const hoje = new Date();
  const amanha = new Date(hoje);
  amanha.setDate(hoje.getDate() + 1);
  
  const agendamentosTeste = [
    {
      id: 'agend_teste_001',
      clienteNome: 'João da Silva',
      clienteEmail: 'joao.silva@email.com',
      clienteTelefone: '11999887766',
      empresaId: empresaTeste.id,
      funcionarioId: 'func_teste_001',
      servico: 'Corte Masculino',
      dataAgendamento: hoje.toISOString().split('T')[0],
      horaAgendamento: '10:00',
      status: 'agendado',
      observacoes: 'Corte mais curto nas laterais',
      dataCancelamento: null
    },
    {
      id: 'agend_teste_002',
      clienteNome: 'Maria Santos',
      clienteEmail: 'maria.santos@email.com',
      clienteTelefone: '11988776655',
      empresaId: empresaTeste.id,
      funcionarioId: 'func_teste_001',
      servico: 'Barba Completa',
      dataAgendamento: amanha.toISOString().split('T')[0],
      horaAgendamento: '14:30',
      status: 'confirmado',
      observacoes: 'Primeira vez no estabelecimento',
      dataCancelamento: null
    },
    {
      id: 'agend_teste_003',
      clienteNome: 'Roberto Lima',
      clienteEmail: 'roberto.lima@email.com',
      clienteTelefone: '11977665544',
      empresaId: empresaTeste.id,
      funcionarioId: 'func_teste_002',
      servico: 'Corte + Barba',
      dataAgendamento: hoje.toISOString().split('T')[0],
      horaAgendamento: '16:00',
      status: 'realizado',
      observacoes: 'Cliente satisfeito',
      dataCancelamento: null
    }
  ];

  agendamentosTeste.forEach(agendamento => {
    const existeAgendamento = agendamentos.find(a => a.id === agendamento.id);
    if (!existeAgendamento) {
      const agendamentosAtualizados = [...agendamentos, agendamento];
      localStorage.setItem('agendamentos', JSON.stringify(agendamentosAtualizados));
      console.log('✅ Agendamento de teste criado:', agendamento.clienteNome);
    }
  });

  console.log('\n🎉 Dados de teste criados com sucesso!');
  console.log('\n📋 Dados para teste:');
  console.log('Empresa ID:', empresaTeste.id);
  console.log('Funcionário 1 - Carlos Silva - CPF: 12345678901');
  console.log('Funcionário 2 - Pedro Santos - CPF: 98765432109');
  console.log('\n🔑 Para acessar a agenda do funcionário:');
  // Criar alguns agendamentos concluídos para avaliação
  const agendamentosConcluidos = [
    {
      id: 'agend_concluido_001',
      empresa_id: empresaTeste.id,
      funcionario_id: funcionariosTeste[0].id,
      funcionario_nome: funcionariosTeste[0].nome,
      cliente_id: 'cliente_teste_001',
      cliente_nome: 'João Silva',
      cliente_email: 'joao.silva@email.com',
      servico_nome: 'Corte Masculino',
      data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 dias atrás
      hora_inicio: '10:00',
      hora_fim: '10:30',
      status: 'concluido',
      observacoes: 'Cliente satisfeito com o atendimento',
      avaliado: false,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'agend_concluido_002',
      empresa_id: empresaTeste.id,
      funcionario_id: funcionariosTeste[1].id,
      funcionario_nome: funcionariosTeste[1].nome,
      cliente_id: 'cliente_teste_002',
      cliente_nome: 'Maria Santos',
      cliente_email: 'maria.santos@email.com',
      servico_nome: 'Barba Completa',
      data: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 dias atrás
      hora_inicio: '14:00',
      hora_fim: '14:25',
      status: 'concluido',
      observacoes: 'Atendimento excelente',
      avaliado: true,
      dataAvaliacao: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Adicionar agendamentos concluídos
  agendamentos.push(...agendamentosConcluidos);
  localStorage.setItem('agendamentos', JSON.stringify(agendamentos));

  console.log('✅ Dados de teste criados com sucesso!');
  console.log('📊 Resumo:');
  console.log(`- ${empresas.length} empresas`);
  console.log(`- ${funcionarios.length} funcionários`);
  console.log(`- ${agendamentos.length} agendamentos`);
  console.log(`- ${agendamentosConcluidos.length} agendamentos concluídos para avaliação`);
  
  console.log('1. Vá para a tela inicial');
  console.log('2. Clique em "Área do Funcionário"');
  console.log('3. Digite:');
  console.log('   - ID da Empresa: ' + empresaTeste.id);
  console.log('   - CPF: 12345678901 (Carlos) ou 98765432109 (Pedro)');
  console.log('4. Clique em "Acessar Agenda"');
};

// Removido execução automática - será executado apenas quando necessário

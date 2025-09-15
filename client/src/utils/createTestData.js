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

    // Adicionar empresa
    const empresasAtualizadas = [...empresas, empresaTeste];
    localStorage.setItem('empresas', JSON.stringify(empresasAtualizadas));
    console.log('✅ Empresa de teste criada:', empresaTeste.nome);
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
  console.log('1. Vá para a tela inicial');
  console.log('2. Clique em "Área do Funcionário"');
  console.log('3. Digite:');
  console.log('   - ID da Empresa: ' + empresaTeste.id);
  console.log('   - CPF: 12345678901 (Carlos) ou 98765432109 (Pedro)');
  console.log('4. Clique em "Acessar Agenda"');
};

// Removido execução automática - será executado apenas quando necessário

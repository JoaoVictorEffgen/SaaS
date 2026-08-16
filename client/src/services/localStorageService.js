// Serviço para gerenciar dados localmente no navegador
class LocalStorageService {
  constructor() {
    this.initializeData();
  }

  // Inicializar dados padrão se não existirem
  initializeData() {
    if (!localStorage.getItem('users')) {
      const defaultUsers = [
        {
          id: '1',
          nome: 'Admin',
          email: 'admin@agendapro.com',
          senha: 'admin123', // Em produção, seria hash
          plano: 'business',
          empresa: 'AgendaPro',
          especializacao: 'Tecnologia'
        },
        {
          id: '2',
          nome: 'Maria Santos',
          email: 'maria@empresa.com',
          senha: '123456',
          plano: 'free',
          empresa: 'Consultoria Santos',
          especializacao: 'Consultoria'
        }
      ];
      localStorage.setItem('users', JSON.stringify(defaultUsers));
    }

    if (!localStorage.getItem('agendas')) {
      const defaultAgendas = [
        {
          id: '1',
          usuario_id: '2',
          titulo: 'Consulta de Psicologia',
          data: '2024-01-15',
          hora_inicio: '09:00',
          hora_fim: '17:00',
          duracao: 45,
          status: 'disponivel'
        }
      ];
      localStorage.setItem('agendas', JSON.stringify(defaultAgendas));
    }

    if (!localStorage.getItem('agendamentos')) {
      const defaultAgendamentos = [
        {
          id: '1',
          agenda_id: '1',
          usuario_id: '2',
          cliente_nome: 'Maria Santos',
          cliente_email: 'maria@email.com',
          data: '2024-01-15',
          hora_inicio: '09:00',
          status: 'confirmado'
        }
      ];
      localStorage.setItem('agendamentos', JSON.stringify(defaultAgendamentos));
    }

    // Inicializar empresas de exemplo
    if (!localStorage.getItem('empresas')) {
      const defaultEmpresas = [
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
          dias_funcionamento: [1, 2, 3, 4, 5, 6], // Segunda a Sábado
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
          dias_funcionamento: [1, 2, 3, 4, 5], // Segunda a Sexta
          logo_url: null,
          notaMedia: 4.9,
          totalAvaliacoes: 89,
          funcionarios: [
            { id: '3', nome: 'Dr. João Silva', especialidade: 'Clínico Geral' },
            { id: '4', nome: 'Dra. Maria Santos', especialidade: 'Cardiologista' }
          ]
        },
        {
          id: '3',
          nome: 'Academia FitLife',
          email: 'contato@fitlife.com',
          telefone: '(11) 99999-3333',
          whatsapp_contato: '(11) 99999-3333',
          especializacao: 'Fitness e Academia',
          descricao_servico: 'Academia moderna com equipamentos de última geração e personal trainers.',
          horario_inicio: '05:00',
          horario_fim: '23:00',
          dias_funcionamento: [1, 2, 3, 4, 5, 6, 0], // Todos os dias
          logo_url: null,
          notaMedia: 4.7,
          totalAvaliacoes: 203,
          funcionarios: [
            { id: '5', nome: 'Pedro Costa', especialidade: 'Personal Trainer' },
            { id: '6', nome: 'Juliana Lima', especialidade: 'Instrutora de Pilates' }
          ]
        },
        {
          id: '4',
          nome: 'Consultório Odontológico Sorriso',
          email: 'contato@sorriso.com',
          telefone: '(11) 99999-4444',
          whatsapp_contato: '(11) 99999-4444',
          especializacao: 'Odontologia',
          descricao_servico: 'Consultório odontológico com tratamentos completos e tecnologia avançada.',
          horario_inicio: '08:30',
          horario_fim: '17:30',
          dias_funcionamento: [1, 2, 3, 4, 5], // Segunda a Sexta
          logo_url: null,
          notaMedia: 4.9,
          totalAvaliacoes: 156,
          funcionarios: [
            { id: '7', nome: 'Dr. Roberto Alves', especialidade: 'Ortodontista' },
            { id: '8', nome: 'Dra. Fernanda Costa', especialidade: 'Endodontista' }
          ]
        },
        // Empresa de teste para funcionários
        {
          id: 'empresa_teste_funcionarios_1234',
          nome: 'Empresa Teste Funcionários',
          email: 'teste@empresa.com',
          telefone: '11999999999',
          endereco: 'Rua Teste, 123 - São Paulo, SP',
          cnpj: '12345678000123',
          descricao: 'Empresa para teste de funcionários',
          categoria: 'Serviços',
          horario_inicio: '08:00',
          horario_fim: '18:00',
          dias_funcionamento: [1, 2, 3, 4, 5], // Segunda a Sexta
          logo_url: null,
          notaMedia: 4.5,
          totalAvaliacoes: 50,
          funcionarios: []
        }
      ];
      localStorage.setItem('empresas', JSON.stringify(defaultEmpresas));

      // Criar funcionários de teste
      const funcionarios = [
        {
          id: '1',
          empresaId: 'empresa_teste_funcionarios_1234',
          nome: 'João Funcionário',
          cpf: '12345678901',
          email: 'joao.funcionario@teste.com',
          telefone: '11987654321',
          especialidade: 'Atendimento Geral',
          horario_inicio: '08:00',
          horario_fim: '17:00',
          intervalos: [
            { inicio: '12:00', fim: '13:00', descricao: 'Almoço' }
          ]
        },
        {
          id: '3',
          empresaId: 'empresa_teste_funcionarios_1234',
          nome: 'Maria Funcionária',
          cpf: '98765432100',
          email: 'maria.funcionaria@teste.com',
          telefone: '11912345678',
          especialidade: 'Especialista',
          horario_inicio: '09:00',
          horario_fim: '18:00',
          intervalos: [
            { inicio: '12:30', fim: '13:30', descricao: 'Almoço' }
          ]
        }
      ];

      // Salvar funcionários no localStorage
      localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
    }
  }

  // Usuários
  getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
  }

  getUserById(id) {
    const users = this.getUsers();
    return users.find(user => user.id === id);
  }

  getUserByEmail(email) {
    const users = this.getUsers();
    return users.find(user => user.email === email);
  }

  createUser(userData) {
    const users = this.getUsers();
    const newUser = {
      ...userData,
      id: (users.length + 1).toString(),
      plano: 'free'
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    return newUser;
  }

  updateUser(id, updates) {
    const users = this.getUsers();
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem('users', JSON.stringify(users));
      return users[index];
    }
    return null;
  }

  // Agendas
  getAgendas() {
    return JSON.parse(localStorage.getItem('agendas') || '[]');
  }

  getAgendasByUser(userId) {
    const agendas = this.getAgendas();
    return agendas.filter(agenda => agenda.usuario_id === userId);
  }

  createAgenda(agendaData) {
    const agendas = this.getAgendas();
    const newAgenda = {
      ...agendaData,
      id: (agendas.length + 1).toString(),
      status: 'disponivel'
    };
    agendas.push(newAgenda);
    localStorage.setItem('agendas', JSON.stringify(agendas));
    return newAgenda;
  }

  updateAgenda(id, updates) {
    const agendas = this.getAgendas();
    const index = agendas.findIndex(agenda => agenda.id === id);
    if (index !== -1) {
      agendas[index] = { ...agendas[index], ...updates };
      localStorage.setItem('agendas', JSON.stringify(agendas));
      return agendas[index];
    }
    return null;
  }

  deleteAgenda(id) {
    const agendas = this.getAgendas();
    const filtered = agendas.filter(agenda => agenda.id !== id);
    localStorage.setItem('agendas', JSON.stringify(filtered));
    return true;
  }

  // Empresas
  getEmpresas() {
    return JSON.parse(localStorage.getItem('empresas') || '[]');
  }

  getEmpresaById(id) {
    const empresas = this.getEmpresas();
    return empresas.find(empresa => empresa.id === id);
  }

  createEmpresa(empresaData) {
    const empresas = this.getEmpresas();
    
    // Gerar ID único: nome da empresa + número aleatório
    const generateUniqueId = (nome) => {
      const nomeLimpo = nome
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '_') // Substitui espaços por underscore
        .substring(0, 20); // Limita a 20 caracteres
      
      let id;
      let existe;
      const idsExistentes = new Set(empresas.map(empresa => empresa.id));
      do {
        const numeroAleatorio = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        id = `${nomeLimpo}_${numeroAleatorio}`;
        existe = idsExistentes.has(id);
      } while (existe);
      
      return id;
    };
    
    const newEmpresa = {
      ...empresaData,
      id: generateUniqueId(empresaData.nome),
      notaMedia: 0,
      totalAvaliacoes: 0,
      funcionarios: []
    };
    empresas.push(newEmpresa);
    localStorage.setItem('empresas', JSON.stringify(empresas));
    return newEmpresa;
  }

  updateEmpresa(id, updates) {
    const empresas = this.getEmpresas();
    const index = empresas.findIndex(empresa => empresa.id === id);
    if (index !== -1) {
      empresas[index] = { ...empresas[index], ...updates };
      localStorage.setItem('empresas', JSON.stringify(empresas));
      return empresas[index];
    }
    return null;
  }

  deleteEmpresa(id) {
    const empresas = this.getEmpresas();
    const filtered = empresas.filter(empresa => empresa.id !== id);
    localStorage.setItem('empresas', JSON.stringify(filtered));
    return true;
  }

  // Agendamentos
  getAgendamentos() {
    return JSON.parse(localStorage.getItem('agendamentos') || '[]');
  }

  getAgendamentosByUser(userId) {
    const agendamentos = this.getAgendamentos();
    return agendamentos.filter(agendamento => agendamento.usuario_id === userId);
  }

  createAgendamento(agendamentoData) {
    const agendamentos = this.getAgendamentos();
    const newAgendamento = {
      ...agendamentoData,
      id: (agendamentos.length + 1).toString(),
      status: 'em_aprovacao', // Novo status inicial
      data_criacao: new Date().toISOString()
    };
    agendamentos.push(newAgendamento);
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
    
    // Também salvar na chave específica da empresa se tiver empresa_id
    if (newAgendamento.empresa_id) {
      const agendamentosEmpresa = JSON.parse(localStorage.getItem(`agendamentos_${newAgendamento.empresa_id}`) || '[]');
      agendamentosEmpresa.push(newAgendamento);
      localStorage.setItem(`agendamentos_${newAgendamento.empresa_id}`, JSON.stringify(agendamentosEmpresa));
    }
    
    // Enviar notificação para o funcionário sobre novo agendamento pendente
    this.enviarNotificacaoFuncionario(newAgendamento, 'pendente');
    
    return newAgendamento;
  }

  updateAgendamento(id, updates) {
    const agendamentos = this.getAgendamentos();
    const index = agendamentos.findIndex(agendamento => agendamento.id === id);
    if (index !== -1) {
      agendamentos[index] = { ...agendamentos[index], ...updates };
      localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
      return agendamentos[index];
    }
    return null;
  }

  // Confirmar agendamento
  confirmarAgendamento(agendamentoId) {
    const agendamentos = this.getAgendamentos();
    const index = agendamentos.findIndex(a => String(a.id) === String(agendamentoId));
    if (index !== -1) {
      agendamentos[index].status = 'agendado'; // Mudança: 'confirmado' → 'agendado'
      agendamentos[index].dataConfirmacao = new Date().toISOString();
      localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
      
      // Atualizar também na chave específica da empresa
      if (agendamentos[index].empresa_id) {
        const agendamentosEmpresa = JSON.parse(localStorage.getItem(`agendamentos_${agendamentos[index].empresa_id}`) || '[]');
        const indexEmpresa = agendamentosEmpresa.findIndex(a => String(a.id) === String(agendamentoId));
        if (indexEmpresa !== -1) {
          agendamentosEmpresa[indexEmpresa] = agendamentos[index];
          localStorage.setItem(`agendamentos_${agendamentos[index].empresa_id}`, JSON.stringify(agendamentosEmpresa));
        }
      }
      
      // Enviar notificação para o funcionário
      this.enviarNotificacaoFuncionario(agendamentos[index], 'confirmado');
      
      console.log('✅ Agendamento confirmado:', agendamentos[index]);
      return agendamentos[index];
    }
    return null;
  }

  // Confirmar todos os agendamentos pendentes de um cliente
  confirmarTodosAgendamentosPendentes(clienteEmail) {
    const agendamentos = this.getAgendamentos();
    let confirmados = 0;
    
    agendamentos.forEach(agendamento => {
      if ((agendamento.cliente_email === clienteEmail || agendamento.clienteEmail === clienteEmail) && 
          (agendamento.status === 'agendado' || agendamento.status === 'pendente')) {
        agendamento.status = 'confirmado';
        agendamento.dataConfirmacao = new Date().toISOString();
        confirmados++;
      }
    });
    
    if (confirmados > 0) {
      localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
      console.log(`✅ ${confirmados} agendamentos confirmados para ${clienteEmail}`);
    }
    
    return confirmados;
  }

  // Verificar se pode cancelar agendamento (regra de 1 hora)
  podeCancelarAgendamento(agendamento) {
    if (agendamento.status === 'cancelado' || agendamento.status === 'realizado' || agendamento.status === 'concluido') {
      return { pode: false, motivo: 'Agendamento já finalizado' };
    }

    if (agendamento.status === 'agendado' || agendamento.status === 'pendente') {
      return { pode: true, motivo: null };
    }

    if (agendamento.status === 'confirmado') {
      // Verificar se faltam mais de 1 hora
      const agora = new Date();
      const dataAgendamento = new Date(`${agendamento.data}T${agendamento.hora || agendamento.hora_inicio}`);
      const diferencaMinutos = (dataAgendamento - agora) / (1000 * 60);
      
      if (diferencaMinutos <= 60) {
        return { pode: false, motivo: `Menos de 1 hora restante (${Math.round(diferencaMinutos)} min)` };
      }
      
      return { pode: true, motivo: null };
    }

    return { pode: false, motivo: 'Status não permitido para cancelamento' };
  }

  // Cancelar agendamento específico
  cancelarAgendamento(agendamentoId, motivo = 'Cancelado pelo cliente') {
    const agendamentos = this.getAgendamentos();
    const index = agendamentos.findIndex(a => String(a.id) === String(agendamentoId));
    
    if (index !== -1) {
      const agendamento = agendamentos[index];
      const verificacao = this.podeCancelarAgendamento(agendamento);
      
      if (!verificacao.pode) {
        return { sucesso: false, erro: verificacao.motivo };
      }
      
      agendamentos[index].status = 'cancelado';
      agendamentos[index].dataCancelamento = new Date().toISOString();
      agendamentos[index].cancelamento_motivo = motivo;
      agendamentos[index].cancelamento_por = 'cliente';
      
      localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
      
      // Atualizar também na chave específica da empresa
      if (agendamentos[index].empresa_id) {
        const agendamentosEmpresa = JSON.parse(localStorage.getItem(`agendamentos_${agendamentos[index].empresa_id}`) || '[]');
        const indexEmpresa = agendamentosEmpresa.findIndex(a => String(a.id) === String(agendamentoId));
        if (indexEmpresa !== -1) {
          agendamentosEmpresa[indexEmpresa] = agendamentos[index];
          localStorage.setItem(`agendamentos_${agendamentos[index].empresa_id}`, JSON.stringify(agendamentosEmpresa));
        }
      }
      
      // Enviar notificação para o funcionário
      this.enviarNotificacaoFuncionario(agendamentos[index], 'cancelado');
      
      console.log('❌ Agendamento cancelado:', agendamentos[index]);
      
      return { sucesso: true, agendamento: agendamentos[index] };
    }
    
    return { sucesso: false, erro: 'Agendamento não encontrado' };
  }

  // Cancelar todos os agendamentos canceláveis de um cliente
  cancelarTodosAgendamentosCancelaveis(clienteEmail) {
    const agendamentos = this.getAgendamentos();
    let cancelados = 0;
    let naoCancelaveis = [];
    
    agendamentos.forEach(agendamento => {
      if ((agendamento.cliente_email === clienteEmail || agendamento.clienteEmail === clienteEmail) && 
          (agendamento.status === 'agendado' || agendamento.status === 'pendente' || agendamento.status === 'confirmado')) {
        
        const verificacao = this.podeCancelarAgendamento(agendamento);
        
        if (verificacao.pode) {
          agendamento.status = 'cancelado';
          agendamento.dataCancelamento = new Date().toISOString();
          agendamento.cancelamento_motivo = 'Cancelado em lote pelo cliente';
          agendamento.cancelamento_por = 'cliente';
          cancelados++;
        } else {
          naoCancelaveis.push({
            id: agendamento.id,
            motivo: verificacao.motivo,
            data: agendamento.data,
            hora: agendamento.hora || agendamento.hora_inicio
          });
        }
      }
    });
    
    if (cancelados > 0 || naoCancelaveis.length > 0) {
      localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
      console.log(`❌ ${cancelados} agendamentos cancelados para ${clienteEmail}`);
      if (naoCancelaveis.length > 0) {
        console.log(`⚠️ ${naoCancelaveis.length} agendamentos não puderam ser cancelados:`, naoCancelaveis);
      }
    }
    
    return { cancelados, naoCancelaveis };
  }

  deleteAgendamento(id) {
    const agendamentos = this.getAgendamentos();
    const filtered = agendamentos.filter(agendamento => agendamento.id !== id);
    localStorage.setItem('agendamentos', JSON.stringify(filtered));
    return true;
  }

  // Enviar notificação para o funcionário
  enviarNotificacaoFuncionario(agendamento, acao) {
    try {
      console.log('🔔 Enviando notificação para funcionário:', { agendamento, acao });
      
      const funcionarioId = agendamento.funcionario_id;
      const empresaId = agendamento.empresa_id;
      
      console.log('🔍 IDs:', { funcionarioId, empresaId });
      
      // Buscar dados do funcionário
      const funcionarios = JSON.parse(localStorage.getItem(`funcionarios_${empresaId}`) || '[]');
      console.log('👥 Funcionários encontrados:', funcionarios);
      
      const funcionario = funcionarios.find(f => f.id === funcionarioId);
      console.log('👤 Funcionário específico:', funcionario);
      
      if (!funcionario) {
        console.log('⚠️ Funcionário não encontrado para notificação');
        return;
      }
      
      // Se o agendamento foi confirmado, agendar notificação para o cliente 1h antes
      if (acao === 'confirmado') {
        this.agendarNotificacaoCliente(agendamento);
      }
      
      // Criar mensagem baseada na ação
      let mensagem = '';
      let titulo = '';
      
      if (acao === 'pendente') {
        titulo = 'Novo Agendamento - Aguardando Confirmação';
        mensagem = `🔄 Novo agendamento aguardando sua confirmação: ${agendamento.cliente_nome} - ${agendamento.data} às ${agendamento.hora}`;
      } else if (acao === 'confirmado') {
        titulo = 'Agendamento Confirmado';
        mensagem = `✅ Agendamento confirmado: ${agendamento.cliente_nome} - ${agendamento.data} às ${agendamento.hora}`;
      } else if (acao === 'cancelado') {
        titulo = 'Agendamento Cancelado';
        mensagem = `❌ Agendamento cancelado: ${agendamento.cliente_nome} - ${agendamento.data} às ${agendamento.hora}`;
      }
      
      // Buscar notificações existentes do funcionário
      const notifications = JSON.parse(localStorage.getItem(`notifications_funcionario_${funcionarioId}`) || '[]');
      
      // Criar nova notificação
      const newNotification = {
        id: Date.now().toString(),
        tipo: 'agendamento',
        acao: acao,
        titulo: titulo,
        mensagem: mensagem,
        agendamentoId: agendamento.id,
        clienteNome: agendamento.cliente_nome,
        data: agendamento.data,
        hora: agendamento.hora,
        empresaId: empresaId,
        lida: false,
        dataCriacao: new Date().toISOString(),
        // Informações para ações (apenas para agendamentos pendentes)
        ...(acao === 'pendente' && {
          podeConfirmar: true,
          podeCancelar: true,
          clienteEmail: agendamento.cliente_email || agendamento.clienteEmail
        })
      };
      
      // Adicionar no início da lista (mais recente primeiro)
      notifications.unshift(newNotification);
      
      // Manter apenas as últimas 50 notificações
      if (notifications.length > 50) {
        notifications.splice(50);
      }
      
      // Salvar notificações
      localStorage.setItem(`notifications_funcionario_${funcionarioId}`, JSON.stringify(notifications));
      console.log('💾 Notificações salvas no localStorage:', notifications);
      
      // Disparar evento customizado para atualização em tempo real
      window.dispatchEvent(new CustomEvent('notificationUpdate', {
        detail: { funcionarioId, acao, agendamentoId: agendamento.id }
      }));
      console.log('📡 Evento customizado disparado');
      
      console.log(`🔔 Notificação enviada para funcionário ${funcionarioId}:`, mensagem);
      
    } catch (error) {
      console.error('❌ Erro ao enviar notificação para funcionário:', error);
    }
  }

  // Agendar notificação para o cliente 1h antes do agendamento confirmado
  agendarNotificacaoCliente(agendamento) {
    try {
      console.log('⏰ Agendando notificação para cliente 1h antes:', agendamento);
      
      const dataAgendamento = new Date(`${agendamento.data}T${agendamento.hora}`);
      const umaHoraAntes = new Date(dataAgendamento.getTime() - (60 * 60 * 1000)); // 1h antes
      const agora = new Date();
      
      // Se já passou de 1h antes, enviar imediatamente
      if (umaHoraAntes <= agora) {
        console.log('⏰ Já passou de 1h antes, enviando notificação imediatamente');
        this.enviarNotificacaoCliente(agendamento);
        return;
      }
      
      // Calcular tempo restante em milissegundos
      const tempoRestante = umaHoraAntes.getTime() - agora.getTime();
      
      console.log('⏰ Agendamento programado para:', umaHoraAntes.toLocaleString());
      console.log('⏰ Tempo restante:', Math.round(tempoRestante / 1000 / 60), 'minutos');
      
      // Agendar a notificação
      setTimeout(() => {
        this.enviarNotificacaoCliente(agendamento);
      }, tempoRestante);
      
    } catch (error) {
      console.error('❌ Erro ao agendar notificação para cliente:', error);
    }
  }

  // Enviar notificação para o cliente confirmar presença
  enviarNotificacaoCliente(agendamento) {
    try {
      console.log('📱 Enviando notificação para cliente confirmar presença:', agendamento);
      
      const clienteEmail = agendamento.cliente_email || agendamento.clienteEmail;
      
      // Criar notificação para o cliente
      const notificacaoCliente = {
        id: Date.now().toString(),
        tipo: 'confirmacao_presenca',
        titulo: 'Confirmar Presença',
        mensagem: `Seu agendamento está confirmado! Por favor, confirme sua presença para ${agendamento.data} às ${agendamento.hora}`,
        agendamentoId: agendamento.id,
        empresaNome: agendamento.empresa_nome || 'Empresa',
        data: agendamento.data,
        hora: agendamento.hora,
        lida: false,
        dataCriacao: new Date().toISOString(),
        podeConfirmar: true,
        podeCancelar: true
      };
      
      // Salvar notificação do cliente
      const clienteNotifications = JSON.parse(localStorage.getItem(`notifications_cliente_${clienteEmail}`) || '[]');
      clienteNotifications.unshift(notificacaoCliente);
      
      // Manter apenas as últimas 20 notificações
      if (clienteNotifications.length > 20) {
        clienteNotifications.splice(20);
      }
      
      localStorage.setItem(`notifications_cliente_${clienteEmail}`, JSON.stringify(clienteNotifications));
      
      console.log('✅ Notificação de confirmação enviada para cliente:', clienteEmail);
      
    } catch (error) {
      console.error('❌ Erro ao enviar notificação para cliente:', error);
    }
  }

  // Cancelar agendamento com justificativa (para funcionário cancelar agendamentos confirmados)
  cancelarAgendamentoComJustificativa(agendamentoId, justificativa) {
    try {
      console.log('❌ Cancelando agendamento com justificativa:', { agendamentoId, justificativa });
      
      const agendamentos = this.getAgendamentos();
      const index = agendamentos.findIndex(agendamento => agendamento.id === agendamentoId);
      
      if (index === -1) {
        return { sucesso: false, erro: 'Agendamento não encontrado' };
      }
      
      const agendamento = agendamentos[index];
      
      // Verificar se pode cancelar (agendamentos confirmados/agendados)
      if (!['agendado', 'confirmado'].includes(agendamento.status)) {
        return { sucesso: false, erro: 'Este agendamento não pode ser cancelado' };
      }
      
      // Atualizar status e adicionar justificativa
      agendamentos[index] = {
        ...agendamento,
        status: 'cancelado',
        dataCancelamento: new Date().toISOString(),
        canceladoPor: 'funcionario',
        justificativaCancelamento: justificativa
      };
      
      // Salvar agendamentos atualizados
      localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
      
      // Também atualizar na chave específica da empresa
      if (agendamentos[index].empresa_id) {
        const agendamentosEmpresa = JSON.parse(localStorage.getItem(`agendamentos_${agendamentos[index].empresa_id}`) || '[]');
        const indexEmpresa = agendamentosEmpresa.findIndex(a => a.id === agendamentoId);
        if (indexEmpresa !== -1) {
          agendamentosEmpresa[indexEmpresa] = agendamentos[index];
          localStorage.setItem(`agendamentos_${agendamentos[index].empresa_id}`, JSON.stringify(agendamentosEmpresa));
        }
      }
      
      // Enviar notificação para o cliente sobre o cancelamento
      this.enviarNotificacaoCancelamentoCliente(agendamentos[index], justificativa);
      
      console.log('✅ Agendamento cancelado com justificativa:', agendamentos[index]);
      
      return { sucesso: true, agendamento: agendamentos[index] };
      
    } catch (error) {
      console.error('❌ Erro ao cancelar agendamento com justificativa:', error);
      return { sucesso: false, erro: 'Erro interno do sistema' };
    }
  }

  // Enviar notificação para o cliente sobre cancelamento com justificativa
  enviarNotificacaoCancelamentoCliente(agendamento, justificativa) {
    try {
      console.log('📱 Enviando notificação de cancelamento para cliente:', { agendamento, justificativa });
      
      const clienteEmail = agendamento.cliente_email || agendamento.clienteEmail;
      
      // Criar notificação para o cliente
      const notificacaoCliente = {
        id: Date.now().toString(),
        tipo: 'cancelamento_justificado',
        titulo: 'Agendamento Cancelado',
        mensagem: `Seu agendamento foi cancelado pela empresa. Motivo: ${justificativa}`,
        agendamentoId: agendamento.id,
        empresaNome: agendamento.empresa_nome || 'Empresa',
        data: agendamento.data,
        hora: agendamento.hora,
        justificativa: justificativa,
        lida: false,
        dataCriacao: new Date().toISOString(),
        podeConfirmar: false,
        podeCancelar: false
      };
      
      // Salvar notificação do cliente
      const clienteNotifications = JSON.parse(localStorage.getItem(`notifications_cliente_${clienteEmail}`) || '[]');
      clienteNotifications.unshift(notificacaoCliente);
      
      // Manter apenas as últimas 20 notificações
      if (clienteNotifications.length > 20) {
        clienteNotifications.splice(20);
      }
      
      localStorage.setItem(`notifications_cliente_${clienteEmail}`, JSON.stringify(clienteNotifications));
      
      // Disparar evento customizado para atualização em tempo real
      window.dispatchEvent(new CustomEvent('notificationUpdate', {
        detail: { clienteEmail, tipo: 'cancelamento_justificado', agendamentoId: agendamento.id }
      }));
      
      console.log('✅ Notificação de cancelamento enviada para cliente:', clienteEmail);
      
    } catch (error) {
      console.error('❌ Erro ao enviar notificação de cancelamento para cliente:', error);
    }
  }

  // Limpar todos os dados (para reset)
  clearAllData() {
    localStorage.clear();
    this.initializeData();
  }
}

const localStorageService = new LocalStorageService();
export default localStorageService;

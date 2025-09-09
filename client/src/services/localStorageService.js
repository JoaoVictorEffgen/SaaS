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
          nome: 'João Silva',
          email: 'joao@exemplo.com',
          senha: '123456',
          plano: 'free',
          empresa: 'Consultoria Silva',
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
          id: '1',
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
          id: '2',
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
        }
      ];
      localStorage.setItem('empresas', JSON.stringify(defaultEmpresas));
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
    const newEmpresa = {
      ...empresaData,
      id: (empresas.length + 1).toString(),
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
      status: 'pendente'
    };
    agendamentos.push(newAgendamento);
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
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

  deleteAgendamento(id) {
    const agendamentos = this.getAgendamentos();
    const filtered = agendamentos.filter(agendamento => agendamento.id !== id);
    localStorage.setItem('agendamentos', JSON.stringify(filtered));
    return true;
  }

  // Autenticação
  login(email, senha) {
    const user = this.getUserByEmail(email);
    if (user && user.senha === senha) {
      const token = this.generateToken(user.id);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('authToken', token);
      return { user, token };
    }
    return null;
  }

  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  }

  getCurrentUser() {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser) : null;
  }

  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  // Token simples (em produção seria JWT)
  generateToken(userId) {
    return `token_${userId}_${Date.now()}`;
  }

  // Limpar todos os dados (para reset)
  clearAllData() {
    localStorage.clear();
    this.initializeData();
  }
}

const localStorageService = new LocalStorageService();
export default localStorageService; 
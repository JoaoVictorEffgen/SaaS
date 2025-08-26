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
          empresa: 'AgendaPro'
        },
        {
          id: '2',
          nome: 'João Silva',
          email: 'joao@exemplo.com',
          senha: '123456',
          plano: 'free',
          empresa: 'Consultoria Silva'
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
    return JSON.parse(localStorage.getItem('currentUser'));
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

export default new LocalStorageService(); 
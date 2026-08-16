const API_BASE_URL = '/api';
const TOKEN_KEY = 'token';
const USER_KEY = 'currentUser';

const getStoredToken = () =>
  sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = getStoredToken();
    this.devUserType = localStorage.getItem('localDevUserType') || 'empresa';
  }

  // Método genérico para fazer requisições
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (this.devUserType) {
      config.headers['X-Dev-User-Type'] = this.devUserType;
    }

    // Adicionar o token da sessão atual, persistente ou temporária.
    const token = this.token || getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      // Verificar se a resposta é JSON válido
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error('Resposta inválida do servidor');
      }

      if (!response.ok) {
        throw new Error(data.error || `Erro ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error(`Erro na API ${endpoint}:`, error);
      
      // Melhorar mensagens de erro específicas
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Servidor não está respondendo. Verifique sua conexão.');
      }
      
      throw error;
    }
  }

  // Método genérico POST
  async post(endpoint, data) {
    return await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Método genérico GET
  async get(endpoint) {
    return await this.request(endpoint);
  }

  // Método genérico PUT
  async put(endpoint, data) {
    return await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Método genérico DELETE
  async delete(endpoint) {
    return await this.request(endpoint, {
      method: 'DELETE'
    });
  }

  // ===== AUTENTICAÇÃO =====
  async login(identifier, senha, tipo = null, companyIdentifier = null, rememberSession = true) {
    const requestData = { identifier, senha, tipo };
    
    // Adicionar companyIdentifier apenas se fornecido (para funcionários)
    if (companyIdentifier) {
      requestData.companyIdentifier = companyIdentifier;
    }
    
    const data = await this.post('/users/login', requestData);

    if (data.token) {
      this.token = data.token;
      const targetStorage = rememberSession ? localStorage : sessionStorage;
      const otherStorage = rememberSession ? sessionStorage : localStorage;

      otherStorage.removeItem(TOKEN_KEY);
      otherStorage.removeItem(USER_KEY);
      targetStorage.setItem(TOKEN_KEY, data.token);
      targetStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }

    return data;
  }

  async register(userData) {
    const data = await this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    return data;
  }

  async getProfile() {
    return await this.request('/users/profile');
  }

  async updateProfile(profileData) {
    return await this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  // ===== EMPRESAS =====
  async getEmpresas() {
    return await this.request('/empresas');
  }

  async getEmpresa(id) {
    return await this.request(`/empresas/${id}`);
  }

  async createEmpresa(empresaData) {
    return await this.request('/empresas', {
      method: 'POST',
      body: JSON.stringify(empresaData)
    });
  }

  async updateEmpresa(id, empresaData) {
    return await this.request(`/empresas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(empresaData)
    });
  }

  async deleteEmpresa(id) {
    return await this.request(`/empresas/${id}`, {
      method: 'DELETE'
    });
  }

  async getPromocoesEmpresa(empresaId) {
    return await this.request(`/empresas/${empresaId}/promocoes`);
  }

  // ===== ENDPOINTS ESPECÍFICOS POR TIPO DE USUÁRIO =====
  // Endpoints para funcionários
  async getFuncionarioEmpresa() {
    return await this.request('/funcionarios/empresa');
  }

  async getFuncionarioAgendamentos() {
    return await this.request('/funcionarios/agendamentos');
  }

  async updateAgendamentoStatus(agendamentoId, status) {
    return await this.request(`/funcionarios/agendamento/${agendamentoId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  // Endpoints para clientes
  async getClientesEmpresas() {
    return await this.request('/clientes/empresas');
  }

  async getClienteEmpresa(empresaId) {
    return await this.request(`/clientes/empresa/${empresaId}`);
  }

  // ===== AGENDAMENTOS =====
  async getAgendamentos() {
    return await this.request('/agendamentos');
  }

  async getAgendamentosHoje() {
    return await this.request('/agendamentos/hoje');
  }

  async createAgendamento(agendamentoData) {
    return await this.request('/agendamentos', {
      method: 'POST',
      body: JSON.stringify(agendamentoData)
    });
  }

  async confirmarAgendamento(id) {
    return await this.request(`/agendamentos/${id}/confirmar`, {
      method: 'PUT'
    });
  }

  async cancelarAgendamento(id, justificativa = '') {
    return await this.request(`/agendamentos/${id}/cancelar`, {
      method: 'PUT',
      body: JSON.stringify({ justificativa })
    });
  }

  // ===== UTILITÁRIOS =====
  logout() {
    this.token = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('authToken');
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem('authToken');
  }

  setDevUserType(tipo) {
    this.devUserType = tipo;
    localStorage.setItem('localDevUserType', tipo);
  }

  setToken(token, rememberSession = localStorage.getItem(TOKEN_KEY) !== null) {
    this.token = token;
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');

    if (token) {
      const targetStorage = rememberSession ? localStorage : sessionStorage;
      const otherStorage = rememberSession ? sessionStorage : localStorage;
      otherStorage.removeItem(TOKEN_KEY);
      targetStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
    }
  }

  getToken() {
    return this.token || getStoredToken();
  }
}

// Instância singleton
const apiService = new ApiService();
export default apiService;

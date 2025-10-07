const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
    console.log('🔧 ApiService inicializado com token:', this.token ? 'Presente' : 'Ausente');
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

    // Adicionar token se disponível (verificar tanto na instância quanto no localStorage)
    const token = this.token || localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token sendo enviado:', token.substring(0, 20) + '...');
    } else {
      console.log('⚠️ Nenhum token encontrado para a requisição');
    }

    console.log('🌐 Fazendo requisição para:', url);
    console.log('🔑 Headers:', config.headers);
    console.log('📦 Body:', options.body);

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

  // ===== AUTENTICAÇÃO =====
  async login(identifier, senha, tipo = null) {
    const data = await this.post('/users/login', { identifier, senha, tipo });

    if (data.token) {
      this.token = data.token;
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
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
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
    console.log('🔧 Token atualizado no ApiService:', token ? 'Presente' : 'Ausente');
  }

  getToken() {
    return this.token || localStorage.getItem('authToken');
  }
}

// Instância singleton
const apiService = new ApiService();
export default apiService;

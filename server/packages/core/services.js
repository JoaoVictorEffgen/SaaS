// 🏗️ Pacote Core - Serviços Centrais
const AuthSecurity = require('../security/auth');

class CoreServices {
  constructor() {
    this.authSecurity = new AuthSecurity();
    this.services = new Map();
  }

  /**
   * Registra um serviço no container
   */
  registerService(name, service) {
    this.services.set(name, service);
    console.log(`✅ [CORE] Serviço '${name}' registrado`);
  }

  /**
   * Obtém um serviço registrado
   */
  getService(name) {
    return this.services.get(name);
  }

  /**
   * Serviço de validação de dados
   */
  getValidationService() {
    if (!this.services.has('validation')) {
      const validationService = {
        validateEmail: (email) => this.authSecurity.isValidEmail(email),
        validatePassword: (password) => this.authSecurity.validatePasswordStrength(password),
        validateCPF: (cpf) => this.validateCPF(cpf),
        validateCNPJ: (cnpj) => this.validateCNPJ(cnpj),
        validatePhone: (phone) => this.validatePhone(phone),
        sanitizeInput: (input) => this.authSecurity.sanitizeInput(input)
      };
      this.registerService('validation', validationService);
    }
    return this.getService('validation');
  }

  /**
   * Serviço de geração de códigos
   */
  getCodeService() {
    if (!this.services.has('code')) {
      const codeService = {
        generateVerificationCode: (length) => this.authSecurity.generateVerificationCode(length),
        generateUniqueId: () => this.generateUniqueId(),
        generateSlug: (text) => this.generateSlug(text)
      };
      this.registerService('code', codeService);
    }
    return this.getService('code');
  }

  /**
   * Serviço de formatação de dados
   */
  getFormatService() {
    if (!this.services.has('format')) {
      const formatService = {
        formatCPF: (cpf) => this.formatCPF(cpf),
        formatCNPJ: (cnpj) => this.formatCNPJ(cnpj),
        formatPhone: (phone) => this.formatPhone(phone),
        formatCurrency: (value) => this.formatCurrency(value),
        formatDate: (date) => this.formatDate(date)
      };
      this.registerService('format', formatService);
    }
    return this.getService('format');
  }

  /**
   * Serviço de cache simples
   */
  getCacheService() {
    if (!this.services.has('cache')) {
      const cache = new Map();
      const cacheService = {
        set: (key, value, ttl = 300000) => { // 5 minutos default
          cache.set(key, {
            value,
            expires: Date.now() + ttl
          });
        },
        get: (key) => {
          const item = cache.get(key);
          if (!item) return null;
          if (Date.now() > item.expires) {
            cache.delete(key);
            return null;
          }
          return item.value;
        },
        delete: (key) => cache.delete(key),
        clear: () => cache.clear()
      };
      this.registerService('cache', cacheService);
    }
    return this.getService('cache');
  }

  // Métodos de validação
  validateCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;

    return true;
  }

  validateCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]/g, '');
    
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cnpj)) return false;

    let sum = 0;
    let weight = 2;
    for (let i = 11; i >= 0; i--) {
      sum += parseInt(cnpj.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    let remainder = sum % 11;
    let digit1 = remainder < 2 ? 0 : 11 - remainder;
    if (digit1 !== parseInt(cnpj.charAt(12))) return false;

    sum = 0;
    weight = 2;
    for (let i = 12; i >= 0; i--) {
      sum += parseInt(cnpj.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    remainder = sum % 11;
    let digit2 = remainder < 2 ? 0 : 11 - remainder;
    if (digit2 !== parseInt(cnpj.charAt(13))) return false;

    return true;
  }

  validatePhone(phone) {
    phone = phone.replace(/[^\d]/g, '');
    return phone.length >= 10 && phone.length <= 11;
  }

  // Métodos de formatação
  formatCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  formatCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]/g, '');
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  formatPhone(phone) {
    phone = phone.replace(/[^\d]/g, '');
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (phone.length === 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  }

  formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  }

  // Métodos auxiliares
  generateUniqueId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  generateSlug(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Inicializa todos os serviços
   */
  async initialize() {
    console.log('🏗️ [CORE] Inicializando serviços centrais...');
    
    // Registrar serviços básicos
    this.getValidationService();
    this.getCodeService();
    this.getFormatService();
    this.getCacheService();
    
    console.log('✅ [CORE] Serviços centrais inicializados');
  }

  /**
   * Retorna estatísticas dos serviços
   */
  getStats() {
    return {
      totalServices: this.services.size,
      services: Array.from(this.services.keys()),
      initialized: true
    };
  }
}

// Instância singleton
const coreServices = new CoreServices();

module.exports = coreServices;

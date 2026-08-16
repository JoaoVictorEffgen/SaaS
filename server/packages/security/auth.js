// 🛡️ Pacote de Segurança - Autenticação
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class AuthSecurity {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET;
    if (!this.jwtSecret || this.jwtSecret.length < 32) {
      throw new Error('JWT_SECRET deve ser configurado com pelo menos 32 caracteres');
    }
    this.tokenExpiry = '24h';
  }

  /**
   * Gera hash seguro da senha
   * @param {string} password - Senha em texto plano
   * @returns {Promise<string>} - Hash bcrypt da senha
   */
  async hashPassword(password) {
    try {
      const saltRounds = 12; // Aumentado para maior segurança
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      console.error('❌ Erro ao gerar hash da senha:', error);
      throw new Error('Erro interno de segurança');
    }
  }

  /**
   * Verifica se a senha confere com o hash
   * @param {string} password - Senha em texto plano
   * @param {string} hash - Hash armazenado
   * @returns {Promise<boolean>} - True se a senha confere
   */
  async verifyPassword(password, hash) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error('❌ Erro ao verificar senha:', error);
      return false;
    }
  }

  /**
   * Gera token JWT seguro
   * @param {Object} payload - Dados do usuário
   * @returns {string} - Token JWT
   */
  generateToken(payload) {
    try {
      // Adicionar timestamp para maior segurança
      const securePayload = {
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        jti: this.generateTokenId() // ID único do token
      };

      return jwt.sign(securePayload, this.jwtSecret, {
        expiresIn: this.tokenExpiry,
        algorithm: 'HS256'
      });
    } catch (error) {
      console.error('❌ Erro ao gerar token:', error);
      throw new Error('Erro interno de segurança');
    }
  }

  /**
   * Verifica e decodifica token JWT
   * @param {string} token - Token JWT
   * @returns {Object|null} - Payload decodificado ou null
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret, {
        algorithms: ['HS256']
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        console.log('⚠️ Token expirado');
        return null;
      } else if (error.name === 'JsonWebTokenError') {
        console.log('⚠️ Token inválido');
        return null;
      } else {
        console.error('❌ Erro ao verificar token:', error);
        return null;
      }
    }
  }

  /**
   * Gera ID único para o token (JTI - JSON Web Token ID)
   * @returns {string} - ID único
   */
  generateTokenId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Valida formato de email
   * @param {string} email - Email para validar
   * @returns {boolean} - True se válido
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida força da senha
   * @param {string} password - Senha para validar
   * @returns {Object} - {valid: boolean, message: string}
   */
  validatePasswordStrength(password) {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return {
        valid: false,
        message: `Senha deve ter pelo menos ${minLength} caracteres`
      };
    }

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return {
        valid: false,
        message: 'Senha deve conter pelo menos: 1 maiúscula, 1 minúscula e 1 número'
      };
    }

    return { valid: true, message: 'Senha válida' };
  }

  /**
   * Sanitiza entrada do usuário
   * @param {string} input - Entrada para sanitizar
   * @returns {string} - Entrada sanitizada
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove caracteres HTML básicos
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+=/gi, ''); // Remove event handlers
  }

  /**
   * Gera código de verificação seguro
   * @param {number} length - Tamanho do código
   * @returns {string} - Código alfanumérico
   */
  generateVerificationCode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }
}

module.exports = AuthSecurity;

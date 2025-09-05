import { useState } from 'react';
import { 
  validateEmail as validateEmailUtil,
  validatePhone,
  validateCNPJ,
  validateCPF,
  validatePassword as validatePasswordUtil,
  validateRequired as validateRequiredUtil,
  validateFutureDate,
  validateTimeFormat,
  validateServiceDuration,
  validatePrice,
  validateURL,
  validateImageFile,
  validateWorkingDays
} from '../utils/validators';

export const useValidation = () => {
  const [errors, setErrors] = useState({});

  // Validar telefone (apenas números)
  const validatePhoneInput = (value) => {
    return value.replace(/[^\d]/g, '');
  };

  // Validar CNPJ/CPF (apenas números)
  const validateDocumentInput = (value) => {
    return value.replace(/[^\d]/g, '');
  };

  // Validar data não retroativa
  const validateDateInput = (date) => {
    if (!validateFutureDate(date)) {
      return 'Data não pode ser no passado';
    }
    return null;
  };

  // Validar campo obrigatório
  const validateRequired = (value, fieldName) => {
    if (!validateRequiredUtil(value)) {
      return `${fieldName} é obrigatório`;
    }
    return null;
  };

  // Validar email
  const validateEmail = (email) => {
    if (!validateEmailUtil(email)) {
      return 'E-mail inválido';
    }
    return null;
  };

  // Validar senha
  const validatePassword = (password) => {
    if (!validatePasswordUtil(password)) {
      return 'Senha deve ter pelo menos 6 caracteres';
    }
    return null;
  };

  // Validar confirmação de senha
  const validatePasswordConfirmation = (password, confirmPassword) => {
    if (password !== confirmPassword) {
      return 'Senhas não coincidem';
    }
    return null;
  };

  // Validar telefone completo
  const validatePhoneField = (phone) => {
    if (!validatePhone(phone)) {
      return 'Telefone inválido';
    }
    return null;
  };

  // Validar CNPJ
  const validateCNPJField = (cnpj) => {
    if (!validateCNPJ(cnpj)) {
      return 'CNPJ inválido';
    }
    return null;
  };

  // Validar CPF
  const validateCPFField = (cpf) => {
    if (!validateCPF(cpf)) {
      return 'CPF inválido';
    }
    return null;
  };

  // Validar horário
  const validateTimeField = (time) => {
    if (!validateTimeFormat(time)) {
      return 'Horário inválido';
    }
    return null;
  };

  // Validar duração do serviço
  const validateServiceDurationField = (duration) => {
    if (!validateServiceDuration(duration)) {
      return 'Duração deve estar entre 15 e 480 minutos';
    }
    return null;
  };

  // Validar preço
  const validatePriceField = (price) => {
    if (!validatePrice(price)) {
      return 'Preço deve ser maior ou igual a zero';
    }
    return null;
  };

  // Validar URL
  const validateURLField = (url) => {
    if (!validateURL(url)) {
      return 'URL inválida';
    }
    return null;
  };

  // Validar arquivo de imagem
  const validateImageFileField = (file, maxSize = 5 * 1024 * 1024) => {
    if (!validateImageFile(file, maxSize)) {
      return 'Arquivo de imagem inválido ou muito grande';
    }
    return null;
  };

  // Validar dias de trabalho
  const validateWorkingDaysField = (days) => {
    if (!validateWorkingDays(days)) {
      return 'Dias de trabalho inválidos';
    }
    return null;
  };

  // Adicionar erro
  const addError = (field, message) => {
    setErrors(prev => ({
      ...prev,
      [field]: message
    }));
  };

  // Limpar erro
  const clearError = (field) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // Limpar todos os erros
  const clearAllErrors = () => {
    setErrors({});
  };

  // Verificar se há erros
  const hasErrors = () => {
    return Object.keys(errors).length > 0;
  };

  return {
    errors,
    validatePhoneInput,
    validateDocumentInput,
    validateDateInput,
    validateRequired,
    validateEmail,
    validatePassword,
    validatePasswordConfirmation,
    validatePhoneField,
    validateCNPJField,
    validateCPFField,
    validateTimeField,
    validateServiceDurationField,
    validatePriceField,
    validateURLField,
    validateImageFileField,
    validateWorkingDaysField,
    addError,
    clearError,
    clearAllErrors,
    hasErrors
  };
};

import { useState } from 'react';

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
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return 'Data não pode ser no passado';
    }
    return null;
  };

  // Validar campo obrigatório
  const validateRequired = (value, fieldName) => {
    if (!value || value.trim() === '') {
      return `${fieldName} é obrigatório`;
    }
    return null;
  };

  // Validar email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) {
      return 'E-mail inválido';
    }
    return null;
  };

  // Validar senha
  const validatePassword = (password) => {
    if (password.length < 6) {
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
    addError,
    clearError,
    clearAllErrors,
    hasErrors
  };
};

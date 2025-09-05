// Funções de validação

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  if (!phone) return true; // Telefone é opcional
  
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 11;
};

export const validateCNPJ = (cnpj) => {
  if (!cnpj) return true; // CNPJ é opcional
  
  const cleaned = cnpj.replace(/\D/g, '');
  
  // Verifica se tem 14 dígitos
  if (cleaned.length !== 14) return false;
  
  // Verifica se não são todos iguais
  if (/^(\d)\1{13}$/.test(cleaned)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  let weight = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned.charAt(i)) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  let digit = 11 - (sum % 11);
  if (digit > 9) digit = 0;
  if (parseInt(cleaned.charAt(12)) !== digit) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  weight = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned.charAt(i)) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  digit = 11 - (sum % 11);
  if (digit > 9) digit = 0;
  if (parseInt(cleaned.charAt(13)) !== digit) return false;
  
  return true;
};

export const validateCPF = (cpf) => {
  if (!cpf) return true; // CPF é opcional
  
  const cleaned = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleaned.length !== 11) return false;
  
  // Verifica se não são todos iguais
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit > 9) digit = 0;
  if (parseInt(cleaned.charAt(9)) !== digit) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit > 9) digit = 0;
  if (parseInt(cleaned.charAt(10)) !== digit) return false;
  
  return true;
};

export const validatePassword = (password) => {
  if (!password) return false;
  return password.length >= 6;
};

export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

export const validateMinLength = (value, minLength) => {
  return value && value.toString().length >= minLength;
};

export const validateMaxLength = (value, maxLength) => {
  return !value || value.toString().length <= maxLength;
};

export const validateFutureDate = (date) => {
  if (!date) return true;
  
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return inputDate >= today;
};

export const validateTimeRange = (startTime, endTime) => {
  if (!startTime || !endTime) return true;
  
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  
  return start < end;
};

export const validateServiceDuration = (duration) => {
  return duration >= 15 && duration <= 480;
};

export const validatePrice = (price) => {
  return price >= 0;
};

export const validateURL = (url) => {
  if (!url) return true; // URL é opcional
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateImageFile = (file, maxSize = 5 * 1024 * 1024) => {
  if (!file) return true;
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    return false;
  }
  
  if (file.size > maxSize) {
    return false;
  }
  
  return true;
};

export const validateWorkingDays = (days) => {
  if (!days || !Array.isArray(days)) return false;
  
  return days.every(day => day >= 0 && day <= 6);
};

export const validateTimeFormat = (time) => {
  if (!time) return true;
  
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

// Funções de formatação

export const formatCurrency = (value, currency = 'BRL') => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency
  }).format(value);
};

export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options
  };
  
  return new Intl.DateTimeFormat('pt-BR', defaultOptions).format(new Date(date));
};

export const formatTime = (time) => {
  if (!time) return '--:--';
  return time.substring(0, 5); // HH:MM
};

export const formatDateTime = (dateTime) => {
  if (!dateTime) return '--/--/---- --:--';
  
  const date = new Date(dateTime);
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const formatDuration = (minutes) => {
  if (!minutes || minutes === 0) return '0min';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins > 0 ? mins + 'min' : ''}`.trim();
  }
  return `${mins}min`;
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  
  // Remove todos os caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Formata baseado no tamanho
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
};

export const formatCNPJ = (cnpj) => {
  if (!cnpj) return '';
  
  const cleaned = cnpj.replace(/\D/g, '');
  
  if (cleaned.length === 14) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  
  return cnpj;
};

export const formatCPF = (cpf) => {
  if (!cpf) return '';
  
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  return cpf;
};

export const formatWhatsAppLink = (phone, message = '') => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/55${cleaned}${message ? `?text=${encodedMessage}` : ''}`;
};

export const getInitials = (name) => {
  if (!name) return '?';
  
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength).trim() + '...';
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatHorario = (empresa) => {
  if (!empresa.horario_inicio || !empresa.horario_fim) return 'Não informado';
  return `${empresa.horario_inicio} - ${empresa.horario_fim}`;
};

export const getDiasTrabalho = (empresa) => {
  if (!empresa.dias_funcionamento || empresa.dias_funcionamento.length === 0) return 'Não informado';
  if (empresa.dias_funcionamento.length === 7) return 'Todos os dias';
  if (empresa.dias_funcionamento.length === 5 && empresa.dias_funcionamento.every(d => d >= 1 && d <= 5)) return 'Segunda a Sexta';
  
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return empresa.dias_funcionamento.map(d => diasSemana[d]).join(', ');
};

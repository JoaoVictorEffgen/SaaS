import { API_BASE_URL } from '../config/appConfig';

const TOKEN_KEY = 'assistente_token';

export const getToken = () => sessionStorage.getItem(TOKEN_KEY) || '';

export const setToken = (token) => {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
};

export const api = async (path, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Nao foi possivel concluir a operacao');
  }
  return data;
};

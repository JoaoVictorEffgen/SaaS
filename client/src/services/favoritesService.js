/**
 * Serviço para gerenciar empresas favoritas
 */

const FAVORITES_KEY = 'empresas_favoritas';

/**
 * Obtém a lista de empresas favoritas
 * @returns {Array} Lista de IDs das empresas favoritas
 */
export const getFavorites = () => {
  try {
    const favorites = localStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Erro ao carregar favoritos:', error);
    return [];
  }
};

/**
 * Adiciona uma empresa aos favoritos
 * @param {string} empresaId - ID da empresa
 * @returns {boolean} Sucesso da operação
 */
export const addToFavorites = (empresaId) => {
  try {
    const favorites = getFavorites();
    if (!favorites.includes(empresaId)) {
      favorites.push(empresaId);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erro ao adicionar aos favoritos:', error);
    return false;
  }
};

/**
 * Remove uma empresa dos favoritos
 * @param {string} empresaId - ID da empresa
 * @returns {boolean} Sucesso da operação
 */
export const removeFromFavorites = (empresaId) => {
  try {
    const favorites = getFavorites();
    const updatedFavorites = favorites.filter(id => id !== empresaId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
    return true;
  } catch (error) {
    console.error('Erro ao remover dos favoritos:', error);
    return false;
  }
};

/**
 * Verifica se uma empresa está nos favoritos
 * @param {string} empresaId - ID da empresa
 * @returns {boolean} Se está nos favoritos
 */
export const isFavorite = (empresaId) => {
  try {
    const favorites = getFavorites();
    return favorites.includes(empresaId);
  } catch (error) {
    console.error('Erro ao verificar favoritos:', error);
    return false;
  }
};

/**
 * Alterna o status de favorito de uma empresa
 * @param {string} empresaId - ID da empresa
 * @returns {boolean} Novo status (true = favorita, false = não favorita)
 */
export const toggleFavorite = (empresaId) => {
  if (isFavorite(empresaId)) {
    removeFromFavorites(empresaId);
    return false;
  } else {
    addToFavorites(empresaId);
    return true;
  }
};

/**
 * Obtém as empresas favoritas com dados completos
 * @returns {Array} Lista de empresas favoritas com dados completos
 */
export const getFavoriteEmpresas = () => {
  try {
    const favorites = getFavorites();
    const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
    
    return empresas.filter(empresa => favorites.includes(empresa.id));
  } catch (error) {
    console.error('Erro ao carregar empresas favoritas:', error);
    return [];
  }
};

/**
 * Limpa todos os favoritos
 * @returns {boolean} Sucesso da operação
 */
export const clearAllFavorites = () => {
  try {
    localStorage.removeItem(FAVORITES_KEY);
    return true;
  } catch (error) {
    console.error('Erro ao limpar favoritos:', error);
    return false;
  }
};

/**
 * Conta o número de favoritos
 * @returns {number} Número de empresas favoritas
 */
export const getFavoritesCount = () => {
  return getFavorites().length;
};

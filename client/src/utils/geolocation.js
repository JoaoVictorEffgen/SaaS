/**
 * Utilitários para geolocalização e cálculo de distâncias
 */

/**
 * Calcula a distância entre duas coordenadas usando a fórmula de Haversine
 * @param {number} lat1 - Latitude do primeiro ponto
 * @param {number} lon1 - Longitude do primeiro ponto
 * @param {number} lat2 - Latitude do segundo ponto
 * @param {number} lon2 - Longitude do segundo ponto
 * @returns {number} Distância em quilômetros
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 100) / 100; // Arredondar para 2 casas decimais
};

/**
 * Filtra empresas por raio de distância
 * @param {Array} empresas - Lista de empresas
 * @param {number} userLat - Latitude do usuário
 * @param {number} userLon - Longitude do usuário
 * @param {number} radiusKm - Raio em quilômetros (padrão: 15km)
 * @returns {Array} Empresas dentro do raio
 */
export const filterEmpresasByRadius = (empresas, userLat, userLon, radiusKm = 15) => {
  if (!userLat || !userLon) {
    console.warn('Coordenadas do usuário não disponíveis');
    return empresas; // Retorna todas se não tiver localização
  }

  return empresas.filter(empresa => {
    if (!empresa.latitude || !empresa.longitude) {
      return false; // Empresa sem coordenadas
    }

    const distance = calculateDistance(
      userLat, 
      userLon, 
      empresa.latitude, 
      empresa.longitude
    );

    return distance <= radiusKm;
  }).map(empresa => ({
    ...empresa,
    distancia: calculateDistance(
      userLat, 
      userLon, 
      empresa.latitude, 
      empresa.longitude
    )
  })).sort((a, b) => a.distancia - b.distancia); // Ordenar por distância
};

/**
 * Solicita permissão de geolocalização do usuário
 * @returns {Promise<{lat: number, lng: number} | null>}
 */
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalização não é suportada por este navegador'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.warn('Erro ao obter localização:', error.message);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutos
      }
    );
  });
};

/**
 * Formata a distância para exibição
 * @param {number} distance - Distância em km
 * @returns {string} Distância formatada
 */
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance}km`;
};

/**
 * Verifica se a geolocalização está disponível
 * @returns {boolean}
 */
export const isGeolocationAvailable = () => {
  return 'geolocation' in navigator;
};

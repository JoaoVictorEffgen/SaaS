import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, RefreshCw } from 'lucide-react';
import { getCurrentPosition, filterEmpresasByRadius, isGeolocationAvailable } from '../../utils/geolocation';
import EmpresaCardWithFavorites from './EmpresaCardWithFavorites';

const EmpresasProximas = ({ empresas, radius = 15 }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [empresasProximas, setEmpresasProximas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const loadUserLocation = async () => {
    if (!isGeolocationAvailable()) {
      setError('Geolocalização não é suportada por este navegador');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const position = await getCurrentPosition();
      setUserLocation(position);
      
      // Filtrar empresas por raio
      const proximas = filterEmpresasByRadius(empresas, position.lat, position.lng, radius);
      setEmpresasProximas(proximas);
      
      console.log(`📍 Encontradas ${proximas.length} empresas em um raio de ${radius}km`);
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      
      if (error.code === 1) { // PERMISSION_DENIED
        setPermissionDenied(true);
        setError('Permissão de localização negada');
      } else {
        setError('Erro ao obter sua localização');
      }
      
      // Mostrar todas as empresas se não conseguir localização
      setEmpresasProximas(empresas.map(empresa => ({ ...empresa, distancia: null })));
    } finally {
      setLoading(false);
    }
  };

  const handleRequestLocation = () => {
    loadUserLocation();
  };

  useEffect(() => {
    // Tentar carregar localização automaticamente
    loadUserLocation();
  }, [empresas, radius]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-center space-x-3">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Buscando empresas próximas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Empresas Próximas</h2>
              <p className="text-sm text-gray-600">
                {userLocation 
                  ? `Em um raio de ${radius}km da sua localização`
                  : 'Permita o acesso à localização para ver empresas próximas'
                }
              </p>
            </div>
          </div>

          {!userLocation && (
            <button
              onClick={handleRequestLocation}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              <span>Ativar Localização</span>
            </button>
          )}
        </div>

        {/* Status da localização */}
        {userLocation && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">
                Localização detectada! Mostrando {empresasProximas.length} empresas próximas.
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-700">
                {error}
                {permissionDenied && (
                  <span className="block mt-1">
                    Vá para as configurações do navegador e permita o acesso à localização.
                  </span>
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Lista de empresas */}
      {empresasProximas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {empresasProximas.map((empresa) => (
            <EmpresaCardWithFavorites
              key={empresa.id}
              empresa={empresa}
              userLocation={userLocation}
              showDistance={!!userLocation}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma empresa encontrada
          </h3>
          <p className="text-gray-600 mb-4">
            Não encontramos empresas próximas a você no momento.
          </p>
          <button
            onClick={handleRequestLocation}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Tentar Novamente</span>
          </button>
        </div>
      )}

      {/* Estatísticas */}
      {empresasProximas.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Mostrando {empresasProximas.length} de {empresas.length} empresas
            </span>
            {userLocation && (
              <span>
                Raio de busca: {radius}km
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpresasProximas;

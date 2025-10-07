import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, ExternalLink, X } from 'lucide-react';

const CompanyLocation = ({ empresa, onClose }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(false);

  // Função para calcular distância entre duas coordenadas (Fórmula de Haversine)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Obter localização do usuário
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      console.log('Geolocalização não suportada');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        
        // Calcular distância
        if (empresa.latitude && empresa.longitude) {
          const dist = calculateDistance(
            latitude, longitude,
            empresa.latitude, empresa.longitude
          );
          setDistance(dist.toFixed(1));
        }
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao obter localização:', error);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Abrir no Google Maps
  const openInGoogleMaps = () => {
    const { latitude, longitude } = empresa;
    
    // URL para Google Maps com direções
    const googleMapsUrl = userLocation 
      ? `https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${latitude},${longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    
    window.open(googleMapsUrl, '_blank');
  };

  // Abrir no Waze
  const openInWaze = () => {
    const { latitude, longitude } = empresa;
    const wazeUrl = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
    window.open(wazeUrl, '_blank');
  };

  // Copiar endereço
  const copyAddress = () => {
    const address = `${empresa.endereco}, ${empresa.cidade}, ${empresa.estado} - ${empresa.cep}`;
    navigator.clipboard.writeText(address).then(() => {
      alert('Endereço copiado para a área de transferência!');
    });
  };

  useEffect(() => {
    getUserLocation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!empresa.latitude || !empresa.longitude) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
          <div className="p-6 text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Localização não disponível
            </h3>
            <p className="text-gray-600 mb-4">
              Esta empresa ainda não possui informações de localização cadastradas.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Localização</h3>
                <p className="text-blue-200 text-sm">{empresa.nome}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Endereço */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Endereço</h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {empresa.endereco}<br/>
                  {empresa.cidade}, {empresa.estado} - {empresa.cep}
                </p>
              </div>
            </div>
          </div>

          {/* Distância */}
          {loading && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-blue-700">Calculando distância...</span>
              </div>
            </div>
          )}

          {distance && (
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Navigation className="w-5 h-5 text-green-600" />
                <div>
                  <h4 className="font-semibold text-green-900">Distância</h4>
                  <p className="text-green-700 text-sm">{distance} km de distância</p>
                </div>
              </div>
            </div>
          )}

          {/* Mapa simplificado */}
          <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center relative overflow-hidden">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">
                {empresa.latitude.toFixed(4)}, {empresa.longitude.toFixed(4)}
              </p>
              <p className="text-gray-500 text-xs mt-1">Coordenadas GPS</p>
            </div>
            
            {/* Indicador de localização do usuário */}
            {userLocation && (
              <div className="absolute top-4 left-4 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                📍 Você está aqui
              </div>
            )}
          </div>

          {/* Botões de ação */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={openInGoogleMaps}
              className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Google Maps</span>
            </button>
            
            <button
              onClick={openInWaze}
              className="flex items-center justify-center space-x-2 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Navigation className="w-4 h-4" />
              <span>Waze</span>
            </button>
          </div>

          {/* Botão copiar endereço */}
          <button
            onClick={copyAddress}
            className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <span>📋</span>
            <span>Copiar Endereço</span>
          </button>

          {/* Botão atualizar localização */}
          <button
            onClick={getUserLocation}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-green-100 text-green-700 py-3 px-4 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
          >
            <Navigation className="w-4 h-4" />
            <span>{loading ? 'Calculando...' : 'Atualizar Distância'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyLocation;

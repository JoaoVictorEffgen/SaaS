import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, MapPin, Clock, Users } from 'lucide-react';
import { isFavorite, toggleFavorite } from '../../services/favoritesService';
import { formatDistance } from '../../utils/geolocation';

const EmpresaCardWithFavorites = ({ empresa, userLocation, showDistance = true }) => {
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    setIsFavorited(isFavorite(empresa.id));
  }, [empresa.id]);

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newStatus = toggleFavorite(empresa.id);
    setIsFavorited(newStatus);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <Link 
      to={`/cliente/empresa/${empresa.id}`}
      className="block bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100"
    >
      <div className="p-6">
        {/* Header com favorito */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {empresa.nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{empresa.nome}</h3>
              <p className="text-sm text-gray-600">{empresa.especializacao}</p>
            </div>
          </div>
          
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-full transition-all duration-200 ${
              isFavorited 
                ? 'bg-red-100 text-red-500 hover:bg-red-200' 
                : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-500'
            }`}
            title={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Avaliação */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="flex items-center space-x-1">
            {renderStars(empresa.notaMedia)}
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {empresa.notaMedia}
          </span>
          <span className="text-sm text-gray-500">
            ({empresa.totalAvaliacoes} avaliações)
          </span>
        </div>

        {/* Localização e distância */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{empresa.endereco}</span>
          </div>
          
          {showDistance && empresa.distancia && (
            <div className="flex items-center space-x-1 text-blue-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-semibold">
                {formatDistance(empresa.distancia)}
              </span>
            </div>
          )}
        </div>

        {/* Descrição do serviço */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {empresa.descricao_servico}
        </p>

        {/* Informações adicionais */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>Horário comercial</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{empresa.funcionarios?.length || 0} profissionais</span>
          </div>
        </div>

        {/* Badge de favorito */}
        {isFavorited && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
            Favorito
          </div>
        )}
      </div>
    </Link>
  );
};

export default EmpresaCardWithFavorites;

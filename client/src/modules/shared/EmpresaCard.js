import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Clock, Users, Heart } from 'lucide-react';

const EmpresaCard = ({ empresa, onToggleFavorite, isFavorite = false }) => {
  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(empresa.id);
    }
  };

  return (
    <Link
      to={`/cliente/empresa/${empresa.id}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-blue-300 overflow-hidden"
    >
      <div className="p-6">
        {/* Header com logo e favorito */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              {empresa.nome?.charAt(0) || 'E'}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{empresa.nome}</h3>
              <p className="text-sm text-gray-600">{empresa.especializacao}</p>
            </div>
          </div>
          
          <button
            onClick={handleFavoriteClick}
            className={`p-2 rounded-full transition-colors ${
              isFavorite 
                ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Descrição */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {empresa.descricao_servico || empresa.descricao || 'Descrição não disponível'}
        </p>

        {/* Informações */}
        <div className="space-y-2 mb-4">
          {empresa.endereco && (
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              <span className="truncate">{empresa.endereco}</span>
            </div>
          )}
          
          <div className="flex items-center text-gray-600 text-sm">
            <Clock className="w-4 h-4 mr-2 text-gray-400" />
            <span>{empresa.horario_inicio} - {empresa.horario_fim}</span>
          </div>
          
          {empresa.funcionarios && empresa.funcionarios.length > 0 && (
            <div className="flex items-center text-gray-600 text-sm">
              <Users className="w-4 h-4 mr-2 text-gray-400" />
              <span>{empresa.funcionarios.length} funcionário{empresa.funcionarios.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Rating e avaliações */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
            <span className="text-sm font-medium text-gray-900">
              {empresa.notaMedia || 0}
            </span>
            <span className="text-sm text-gray-500 ml-1">
              ({empresa.totalAvaliacoes || 0} avaliações)
            </span>
          </div>
          
          <span className="text-sm text-blue-600 font-medium hover:text-blue-700">
            Agendar →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default EmpresaCard;
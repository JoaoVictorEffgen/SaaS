import React, { useState, useEffect } from 'react';
import { Heart, Star } from 'lucide-react';
import { getFavoriteEmpresas } from '../../services/favoritesService';
import EmpresaCardWithFavorites from './EmpresaCardWithFavorites';

const EmpresasFavoritas = ({ empresas }) => {
  const [empresasFavoritas, setEmpresasFavoritas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = () => {
      const favorites = getFavoriteEmpresas();
      setEmpresasFavoritas(favorites);
      setLoading(false);
    };

    loadFavorites();

    // Escutar mudanças nos favoritos
    const handleStorageChange = () => {
      loadFavorites();
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [empresas]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-center space-x-3">
          <Heart className="w-5 h-5 animate-pulse text-red-500" />
          <span className="text-gray-600">Carregando favoritos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 text-white fill-current" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Empresas Favoritas</h2>
            <p className="text-sm text-gray-600">
              {empresasFavoritas.length > 0 
                ? `${empresasFavoritas.length} empresas favoritadas`
                : 'Nenhuma empresa favoritada ainda'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Lista de favoritos */}
      {empresasFavoritas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {empresasFavoritas.map((empresa) => (
            <EmpresaCardWithFavorites
              key={empresa.id}
              empresa={empresa}
              userLocation={null}
              showDistance={false}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma empresa favoritada
          </h3>
          <p className="text-gray-600 mb-4">
            Explore as empresas disponíveis e clique no coração para adicionar aos seus favoritos.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Star className="w-4 h-4" />
            <span>Suas empresas favoritas aparecerão aqui</span>
          </div>
        </div>
      )}

      {/* Estatísticas */}
      {empresasFavoritas.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {empresasFavoritas.length} empresa{empresasFavoritas.length !== 1 ? 's' : ''} favoritada{empresasFavoritas.length !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center space-x-1">
              <Heart className="w-4 h-4 text-red-500" />
              <span>Favoritos</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpresasFavoritas;

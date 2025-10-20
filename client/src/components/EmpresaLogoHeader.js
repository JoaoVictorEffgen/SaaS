import React, { useState, useEffect } from 'react';
import { useMySqlAuth } from '../contexts/MySqlAuthContext';
import apiService from '../services/apiService';

const EmpresaLogoHeader = ({ className = "", showText = true }) => {
  const { user } = useMySqlAuth();
  const [empresaData, setEmpresaData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarEmpresa = async () => {
      if (!user || user.tipo !== 'empresa') {
        setLoading(false);
        return;
      }

      try {
        const response = await apiService.get(`/empresas/user/${user.id}`);
        if (response.success) {
          setEmpresaData(response.data);
        }
      } catch (error) {
        console.error('Erro ao carregar dados da empresa:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarEmpresa();
  }, [user]);

  if (loading) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
        {showText && <div className="ml-2 w-20 h-4 bg-gray-200 rounded animate-pulse"></div>}
      </div>
    );
  }

  if (!empresaData) {
    return null;
  }

  return (
    <div className={`flex items-center ${className}`}>
      {empresaData.logo_sistema ? (
        <img
          src={empresaData.logo_sistema}
          alt={`${empresaData.nome} - Logo`}
          className="h-8 w-auto max-w-32 object-contain"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      ) : (
        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {empresaData.nome?.charAt(0)?.toUpperCase() || 'E'}
          </span>
        </div>
      )}
      
      {showText && empresaData.nome && (
        <span className="ml-2 text-gray-900 font-medium text-sm hidden sm:block">
          {empresaData.nome}
        </span>
      )}
    </div>
  );
};

export default EmpresaLogoHeader;

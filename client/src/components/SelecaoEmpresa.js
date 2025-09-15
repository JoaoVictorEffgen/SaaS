import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import EmpresaCard from './EmpresaCard';
import { LogOut, Star, Crown, Award } from 'lucide-react';
import { useLocalAuth } from '../contexts/LocalAuthContext';
import localStorageService from '../services/localStorageService';

const SelecaoEmpresa = () => {
  const { user, logout } = useLocalAuth();
  const [empresas, setEmpresas] = useState([]);
  const [empresasDestaque, setEmpresasDestaque] = useState([]);
  const [empresasNormais, setEmpresasNormais] = useState([]);

  useEffect(() => {
    // Carregar empresas usando o serviço
    const empresasData = localStorageService.getEmpresas();
    
    // Ordenar por nota média (maior para menor) e depois por total de avaliações
    const empresasOrdenadas = empresasData.sort((a, b) => {
      const notaA = a.notaMedia || 0;
      const notaB = b.notaMedia || 0;
      const avaliacoesA = a.totalAvaliacoes || 0;
      const avaliacoesB = b.totalAvaliacoes || 0;
      
      // Primeiro critério: nota média
      if (notaA !== notaB) {
        return notaB - notaA;
      }
      // Segundo critério: total de avaliações (mais avaliações = mais confiável)
      return avaliacoesB - avaliacoesA;
    });
    
    setEmpresas(empresasOrdenadas);
    
    // Separar empresas em destaque (nota >= 4.5 e pelo menos 10 avaliações)
    const destaque = empresasOrdenadas.filter(empresa => 
      (empresa.notaMedia || 0) >= 4.5 && (empresa.totalAvaliacoes || 0) >= 10
    );
    
    // Separar empresas normais
    const normais = empresasOrdenadas.filter(empresa => 
      (empresa.notaMedia || 0) < 4.5 || (empresa.totalAvaliacoes || 0) < 10
    );
    
    setEmpresasDestaque(destaque);
    setEmpresasNormais(normais);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/cliente/login';
  };

  // Redirecionar se não estiver logado
  if (!user) {
    return <Navigate to="/cliente/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Olá, {user.nome}!</h1>
              <p className="text-sm text-gray-600">Escolha uma empresa para agendar</p>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">🏢 Empresas Disponíveis</h2>
          <p className="text-gray-600">Selecione uma empresa para agendar seus serviços</p>
        </div>

        {empresas.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma empresa cadastrada</h3>
            <p className="text-gray-600 mb-6">
              Ainda não há empresas disponíveis para agendamento.
            </p>
            <Link
              to="/empresa/cadastro"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Cadastrar Empresa
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Seção de Empresas em Destaque */}
            {empresasDestaque.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-2">
                    <Crown className="h-6 w-6 text-yellow-500" />
                    <h3 className="text-2xl font-bold text-gray-900">Empresas em Destaque</h3>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    <Star className="h-4 w-4 fill-current" />
                    <span>Melhor Avaliadas</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {empresasDestaque.map((empresa) => (
                    <div key={empresa.id} className="relative">
                      {/* Badge de Destaque */}
                      <div className="absolute -top-2 -right-2 z-10">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          <span>DESTAQUE</span>
                        </div>
                      </div>
                      <EmpresaCard 
                        empresa={empresa} 
                        onSelect={(empresa) => {
                          // Navegar para a página de agendamento da empresa
                          window.location.href = `/cliente/empresa/${empresa.id}`;
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seção de Outras Empresas */}
            {empresasNormais.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Outras Empresas</h3>
                  <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    <Star className="h-4 w-4" />
                    <span>Disponíveis</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {empresasNormais.map((empresa) => (
                    <EmpresaCard 
                      key={empresa.id} 
                      empresa={empresa} 
                      onSelect={(empresa) => {
                        // Navegar para a página de agendamento da empresa
                        window.location.href = `/cliente/empresa/${empresa.id}`;
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelecaoEmpresa;

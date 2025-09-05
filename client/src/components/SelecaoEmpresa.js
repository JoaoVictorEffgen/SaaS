import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import EmpresaCard from './EmpresaCard';
import { LogOut } from 'lucide-react';
import { useLocalAuth } from '../contexts/LocalAuthContext';

const SelecaoEmpresa = () => {
  const { user, logout } = useLocalAuth();
  const [empresas, setEmpresas] = useState([]);

  useEffect(() => {
    // Carregar empresas
    const empresasData = JSON.parse(localStorage.getItem('empresas') || '[]');
    setEmpresas(empresasData);
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {empresas.map((empresa) => (
              <EmpresaCard key={empresa.id} empresa={empresa} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelecaoEmpresa;

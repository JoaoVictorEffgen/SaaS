import React from 'react';
import { Link } from 'react-router-dom';

const AccessSelector = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">AgendaPro</h1>
          <p className="text-gray-600">Sistema de Agendamento Online</p>
        </div>
        
        <div className="space-y-4">
          <Link
            to="/empresa/login"
            className="block w-full bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            🏢 Área da Empresa
          </Link>
          
          <Link
            to="/cliente/login"
            className="block w-full bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            👥 Agendar Serviço
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p><strong>Empresa:</strong> Gerencie suas agendas e clientes</p>
          <p><strong>Cliente:</strong> Agende serviços online</p>
        </div>
      </div>
    </div>
  );
};

export default AccessSelector;

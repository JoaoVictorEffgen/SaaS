import React from 'react';
import { BarChart3, CheckSquare, Star, User } from 'lucide-react';

const FuncionarioStatsTab = ({ agendamentos }) => {
  const realizados = agendamentos.filter((item) => item.status === 'realizado').length;
  const taxaComparecimento = agendamentos.length > 0
    ? Math.round((realizados / agendamentos.length) * 100)
    : 0;
  const totalClientes = new Set(agendamentos.map((item) => item.clienteId)).size;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
        Minhas Estatísticas
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Agendamentos Realizados</p>
              <p className="text-3xl font-bold">{realizados}</p>
            </div>
            <CheckSquare className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Taxa de Comparecimento</p>
              <p className="text-3xl font-bold">{taxaComparecimento}%</p>
            </div>
            <Star className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Total de Clientes</p>
              <p className="text-3xl font-bold">{totalClientes}</p>
            </div>
            <User className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Avaliações dos Clientes</h3>
        <p className="text-gray-600">
          As avaliações dos clientes são gerenciadas pela empresa e ficam disponíveis
          no sistema de gestão. Você pode solicitar feedback direto aos clientes
          após a realização dos serviços.
        </p>
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Dica:</strong> Sempre pergunte aos clientes como foi o atendimento
            e se ficaram satisfeitos com o serviço prestado.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FuncionarioStatsTab;


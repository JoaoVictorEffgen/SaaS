import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Calendar, 
  User, 
  Briefcase, 
  X, 
  ChevronDown,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import localStorageService from '../services/localStorageService';

const AdvancedFilters = ({ onFiltersChange, userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    funcionario: '',
    servico: '',
    periodo: '30d',
    dataInicio: '',
    dataFim: '',
    status: '',
    valorMin: '',
    valorMax: ''
  });

  const [funcionarios, setFuncionarios] = useState([]);
  const [servicos, setServicos] = useState([]);

  useEffect(() => {
    if (userId) {
      loadFuncionarios();
      loadServicos();
    }
  }, [userId]);

  const loadFuncionarios = () => {
    const funcionariosData = JSON.parse(localStorage.getItem(`funcionarios_${userId}`) || '[]');
    setFuncionarios(funcionariosData);
  };

  const loadServicos = () => {
    const servicosData = JSON.parse(localStorage.getItem(`servicos_${userId}`) || '[]');
    setServicos(servicosData);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters = {
      funcionario: '',
      servico: '',
      periodo: '30d',
      dataInicio: '',
      dataFim: '',
      status: '',
      valorMin: '',
      valorMax: ''
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== '' && value !== '30d'
    ).length;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmado':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pendente':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'cancelado':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="relative">
      {/* Botão do Filtro */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-gray-700 hover:text-gray-900"
      >
        <Filter className="h-4 w-4 mr-2" />
        Filtros Avançados
        {getActiveFiltersCount() > 0 && (
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {getActiveFiltersCount()}
          </span>
        )}
        <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Painel de Filtros */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filtros Avançados</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Período */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Período
              </label>
              <select
                value={filters.periodo}
                onChange={(e) => handleFilterChange('periodo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
                <option value="1y">Último ano</option>
                <option value="custom">Período personalizado</option>
              </select>
            </div>

            {/* Período Personalizado */}
            {filters.periodo === 'custom' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Início
                  </label>
                  <input
                    type="date"
                    value={filters.dataInicio}
                    onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Fim
                  </label>
                  <input
                    type="date"
                    value={filters.dataFim}
                    onChange={(e) => handleFilterChange('dataFim', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Funcionário */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                Funcionário
              </label>
              <select
                value={filters.funcionario}
                onChange={(e) => handleFilterChange('funcionario', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos os funcionários</option>
                {funcionarios.map((funcionario) => (
                  <option key={funcionario.id} value={funcionario.id}>
                    {funcionario.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Serviço */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="h-4 w-4 inline mr-1" />
                Serviço
              </label>
              <select
                value={filters.servico}
                onChange={(e) => handleFilterChange('servico', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos os serviços</option>
                {servicos.map((servico) => (
                  <option key={servico.id} value={servico.id}>
                    {servico.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status do Agendamento
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos os status</option>
                <option value="pendente">Pendente</option>
                <option value="confirmado">Confirmado</option>
                <option value="cancelado">Cancelado</option>
                <option value="concluido">Concluído</option>
              </select>
            </div>

            {/* Faixa de Valor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Faixa de Valor
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Valor mínimo"
                  value={filters.valorMin}
                  onChange={(e) => handleFilterChange('valorMin', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Valor máximo"
                  value={filters.valorMax}
                  onChange={(e) => handleFilterChange('valorMax', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Limpar Filtros
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;

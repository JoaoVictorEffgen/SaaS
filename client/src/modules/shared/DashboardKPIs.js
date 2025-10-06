import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Clock, 
  Calendar,
  Star,
  BarChart3,
  RefreshCw,
  ArrowLeft,
  Filter,
  FileText,
  UserPlus,
  Eye
} from 'lucide-react';
// kpiService será criado se necessário
import { useMySqlAuth } from '../../contexts/MySqlAuthContext';
// formatCurrency será criado se necessário
import AdvancedFilters from './AdvancedFilters';
import VisualReports from './VisualReports';
import PDFExport from './PDFExport';
import CRMClientes from './CRMClientes';

const DashboardKPIs = () => {
  const { user } = useMySqlAuth();
  const navigate = useNavigate();
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('30d');
  const [filters, setFilters] = useState({});
  const [activeTab, setActiveTab] = useState('overview'); // overview, reports, crm, export
  const [agendamentos, setAgendamentos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [servicos, setServicos] = useState([]);


  const loadKPIs = useCallback(() => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // kpiService será implementado posteriormente
      const kpisData = {
        totalAgendamentos: 0,
        agendamentosConfirmados: 0,
        agendamentosCancelados: 0,
        receitaTotal: 0,
        receitaMediaPorAgendamento: 0,
        taxaConfirmacao: 0,
        clientesAtivos: 0
      };
      setKpis(kpisData);
    } catch (error) {
      console.error('Erro ao carregar KPIs:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, periodo]);

  const loadData = useCallback(() => {
    if (!user?.id) return;
    
    const agendamentosData = JSON.parse(localStorage.getItem(`agendamentos_${user.id}`) || '[]');
    const funcionariosData = JSON.parse(localStorage.getItem(`funcionarios_${user.id}`) || '[]');
    const servicosData = JSON.parse(localStorage.getItem(`servicos_${user.id}`) || '[]');
    
    setAgendamentos(agendamentosData);
    setFuncionarios(funcionariosData);
    setServicos(servicosData);
  }, [user?.id]);

  useEffect(() => {
    loadKPIs();
    loadData();
  }, [loadKPIs, loadData]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Usar formatação do utils/formatters.js

  const formatPercentage = useMemo(() => {
    return (value) => `${(value || 0).toFixed(1)}%`;
  }, []);

  const getTrendIcon = (trend) => {
    const value = trend || 0;
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <BarChart3 className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (trend) => {
    const value = trend || 0;
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando KPIs...</p>
        </div>
      </div>
    );
  }

  if (!kpis) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado disponível</h3>
        <p className="text-gray-600">Não há agendamentos suficientes para gerar KPIs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Avançado</h2>
          <p className="text-gray-600">Métricas, relatórios visuais e gestão de clientes</p>
        </div>
        <div className="flex space-x-4">
          <AdvancedFilters 
            onFiltersChange={handleFiltersChange} 
            userId={user?.id}
          />
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </select>
          <button
            onClick={loadKPIs}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2 inline" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Tabs de Navegação */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
            { id: 'reports', label: 'Relatórios Visuais', icon: TrendingUp },
            { id: 'crm', label: 'CRM Clientes', icon: UserPlus },
            { id: 'export', label: 'Exportar PDF', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Botão Voltar - Discreto */}
      <div className="mb-4">
        <button
          onClick={() => navigate('/empresa/dashboard')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar ao Dashboard
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'overview' && (
        <>
          {/* Cards principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Agendamentos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Agendamentos</p>
              <p className="text-2xl font-bold text-gray-900">{kpis.totalAgendamentos || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {getTrendIcon(kpis.tendenciaAgendamentos)}
            <span className={`ml-2 text-sm font-medium ${getTrendColor(kpis.tendenciaAgendamentos)}`}>
              {formatPercentage(Math.abs(kpis.tendenciaAgendamentos || 0))}
            </span>
            <span className="ml-2 text-sm text-gray-500">vs período anterior</span>
          </div>
        </div>

        {/* Taxa de Comparecimento */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Comparecimento</p>
              <p className="text-2xl font-bold text-gray-900">{formatPercentage(kpis.taxaComparecimento)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${kpis.taxaComparecimento || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Receita Total */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">R$ {(kpis.receitaTotal || 0).toFixed(2)}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {getTrendIcon(kpis.tendenciaReceita)}
            <span className={`ml-2 text-sm font-medium ${getTrendColor(kpis.tendenciaReceita)}`}>
              {formatPercentage(Math.abs(kpis.tendenciaReceita || 0))}
            </span>
            <span className="ml-2 text-sm text-gray-500">vs período anterior</span>
          </div>
        </div>

        {/* Satisfação Média */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Satisfação Média</p>
              <p className="text-2xl font-bold text-gray-900">{(kpis.satisfacaoMedia || 0).toFixed(1)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < Math.floor(kpis.satisfacaoMedia || 0) ? 'fill-current' : ''}`} 
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-500">de 5.0</span>
          </div>
        </div>
      </div>

      {/* Métricas secundárias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tempo Médio por Cliente */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-gray-600">Tempo Médio por Cliente</p>
              <p className="text-xl font-bold text-gray-900">{(kpis.tempoMedioPorCliente || 0).toFixed(0)} min</p>
            </div>
          </div>
        </div>

        {/* Receita Média por Agendamento */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Média por Agendamento</p>
              <p className="text-xl font-bold text-gray-900">R$ {(kpis.receitaMediaPorAgendamento || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Taxa de Conversão */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-purple-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
              <p className="text-xl font-bold text-gray-900">{formatPercentage(kpis.taxaConversao)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos e análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Horários Mais Populares */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Horários Mais Populares</h3>
          <div className="space-y-3">
            {(kpis.horariosMaisPopulares || []).map((horario, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{horario.hora}</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(horario.count / (kpis.horariosMaisPopulares?.[0]?.count || 1)) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{horario.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Serviços Mais Solicitados */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Serviços Mais Solicitados</h3>
          <div className="space-y-3">
            {(kpis.servicosMaisSolicitados || []).map((servico, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{servico.nome}</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(servico.count / (kpis.servicosMaisSolicitados?.[0]?.count || 1)) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{servico.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Funcionário Mais Produtivo */}
      {kpis.funcionarioMaisProdutivo && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Funcionário Mais Produtivo</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{kpis.funcionarioMaisProdutivo?.nome || 'Nenhum'}</p>
                <p className="text-sm text-gray-600">{kpis.funcionarioMaisProdutivo?.totalAgendamentos || 0} agendamentos</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{kpis.funcionarioMaisProdutivo?.totalAgendamentos || 0}</p>
              <p className="text-sm text-gray-500">total</p>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {activeTab === 'reports' && (
        <VisualReports 
          filters={filters}
          userId={user?.id}
          userPlan={user?.plano}
        />
      )}

      {activeTab === 'crm' && (
        <CRMClientes 
          userId={user?.id}
          userPlan={user?.plano}
        />
      )}

      {activeTab === 'export' && (
        <PDFExport 
          filters={filters}
          userId={user?.id}
          userPlan={user?.plano}
          agendamentos={agendamentos}
          funcionarios={funcionarios}
          servicos={servicos}
          kpis={kpis}
        />
      )}
    </div>
  );
};

export default DashboardKPIs;

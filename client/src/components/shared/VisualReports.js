import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  Calendar,
  Users,
  DollarSign,
  Clock
} from 'lucide-react';
import localStorageService from '../../services/localStorageService';
import { formatCurrency } from '../../utils/formatters';

const VisualReports = ({ filters, userId, userPlan }) => {
  const [chartData, setChartData] = useState({
    agendamentosPorDia: [],
    receitaPorMes: [],
    servicosMaisSolicitados: [],
    funcionariosPerformance: [],
    agendamentosPorStatus: [],
    comparativoMensal: []
  });

  const [loading, setLoading] = useState(true);

  // Verificar se o usuário tem acesso aos relatórios visuais
  const hasVisualReportsAccess = userPlan === 'pro' || userPlan === 'business';

  useEffect(() => {
    if (userId && hasVisualReportsAccess) {
      loadChartData();
    }
  }, [userId, filters, hasVisualReportsAccess]);

  const loadChartData = async () => {
    setLoading(true);
    try {
      const data = await generateChartData();
      setChartData(data);
    } catch (error) {
      console.error('Erro ao carregar dados dos gráficos:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = async () => {
    const agendamentos = JSON.parse(localStorage.getItem(`agendamentos_${userId}`) || '[]');
    const servicos = JSON.parse(localStorage.getItem(`servicos_${userId}`) || '[]');
    const funcionarios = JSON.parse(localStorage.getItem(`funcionarios_${userId}`) || '[]');

    // Filtrar agendamentos baseado nos filtros
    const filteredAgendamentos = filterAgendamentos(agendamentos);

    return {
      agendamentosPorDia: generateAgendamentosPorDia(filteredAgendamentos),
      receitaPorMes: generateReceitaPorMes(filteredAgendamentos),
      servicosMaisSolicitados: generateServicosMaisSolicitados(filteredAgendamentos, servicos),
      funcionariosPerformance: generateFuncionariosPerformance(filteredAgendamentos, funcionarios),
      agendamentosPorStatus: generateAgendamentosPorStatus(filteredAgendamentos),
      comparativoMensal: generateComparativoMensal(agendamentos)
    };
  };

  const filterAgendamentos = (agendamentos) => {
    return agendamentos.filter(agendamento => {
      // Filtro por funcionário
      if (filters.funcionario && agendamento.funcionario_id !== filters.funcionario) {
        return false;
      }

      // Filtro por serviço
      if (filters.servico && agendamento.servico_id !== filters.servico) {
        return false;
      }

      // Filtro por status
      if (filters.status && agendamento.status !== filters.status) {
        return false;
      }

      // Filtro por valor
      const valor = parseFloat(agendamento.valor_total) || 0;
      if (filters.valorMin && valor < parseFloat(filters.valorMin)) {
        return false;
      }
      if (filters.valorMax && valor > parseFloat(filters.valorMax)) {
        return false;
      }

      // Filtro por período
      if (filters.periodo !== 'custom' && filters.periodo !== '30d') {
        const dataAgendamento = new Date(agendamento.data);
        const hoje = new Date();
        const dias = parseInt(filters.periodo.replace('d', '')) || 30;
        const dataLimite = new Date(hoje.getTime() - (dias * 24 * 60 * 60 * 1000));
        
        if (dataAgendamento < dataLimite) {
          return false;
        }
      }

      // Filtro por período customizado
      if (filters.periodo === 'custom') {
        const dataAgendamento = new Date(agendamento.data);
        if (filters.dataInicio && dataAgendamento < new Date(filters.dataInicio)) {
          return false;
        }
        if (filters.dataFim && dataAgendamento > new Date(filters.dataFim)) {
          return false;
        }
      }

      return true;
    });
  };

  const generateAgendamentosPorDia = (agendamentos) => {
    const ultimos7Dias = [];
    for (let i = 6; i >= 0; i--) {
      const data = new Date();
      data.setDate(data.getDate() - i);
      const dataStr = data.toISOString().split('T')[0];
      
      const count = agendamentos.filter(a => a.data === dataStr).length;
      ultimos7Dias.push({
        data: data.toLocaleDateString('pt-BR', { weekday: 'short' }),
        agendamentos: count,
        dataCompleta: dataStr
      });
    }
    return ultimos7Dias;
  };

  const generateReceitaPorMes = (agendamentos) => {
    const meses = {};
    agendamentos.forEach(agendamento => {
      if (agendamento.status === 'confirmado') {
        const mes = agendamento.data.substring(0, 7); // YYYY-MM
        const valor = parseFloat(agendamento.valor_total) || 0;
        meses[mes] = (meses[mes] || 0) + valor;
      }
    });

    return Object.entries(meses)
      .map(([mes, valor]) => ({
        mes: new Date(mes + '-01').toLocaleDateString('pt-BR', { month: 'short' }),
        receita: valor
      }))
      .slice(-6); // Últimos 6 meses
  };

  const generateServicosMaisSolicitados = (agendamentos, servicos) => {
    const servicosCount = {};
    agendamentos.forEach(agendamento => {
      const servicoId = agendamento.servico_id;
      servicosCount[servicoId] = (servicosCount[servicoId] || 0) + 1;
    });

    return Object.entries(servicosCount)
      .map(([servicoId, count]) => {
        const servico = servicos.find(s => s.id === servicoId);
        return {
          nome: servico?.nome || 'Serviço não encontrado',
          agendamentos: count,
          valor: servico?.preco || 0
        };
      })
      .sort((a, b) => b.agendamentos - a.agendamentos)
      .slice(0, 5);
  };

  const generateFuncionariosPerformance = (agendamentos, funcionarios) => {
    const funcionariosCount = {};
    agendamentos.forEach(agendamento => {
      const funcionarioId = agendamento.funcionario_id;
      funcionariosCount[funcionarioId] = (funcionariosCount[funcionarioId] || 0) + 1;
    });

    return Object.entries(funcionariosCount)
      .map(([funcionarioId, count]) => {
        const funcionario = funcionarios.find(f => f.id === funcionarioId);
        return {
          nome: funcionario?.nome || 'Funcionário não encontrado',
          agendamentos: count
        };
      })
      .sort((a, b) => b.agendamentos - a.agendamentos);
  };

  const generateAgendamentosPorStatus = (agendamentos) => {
    const statusCount = {};
    agendamentos.forEach(agendamento => {
      statusCount[agendamento.status] = (statusCount[agendamento.status] || 0) + 1;
    });

    const colors = {
      'pendente': '#F59E0B',
      'confirmado': '#10B981',
      'cancelado': '#EF4444',
      'concluido': '#6366F1'
    };

    return Object.entries(statusCount).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      color: colors[status] || '#6B7280'
    }));
  };

  const generateComparativoMensal = (agendamentos) => {
    const ultimos3Meses = [];
    for (let i = 2; i >= 0; i--) {
      const data = new Date();
      data.setMonth(data.getMonth() - i);
      const mes = data.toISOString().substring(0, 7);
      
      const agendamentosMes = agendamentos.filter(a => a.data.startsWith(mes));
      const receitaMes = agendamentosMes
        .filter(a => a.status === 'confirmado')
        .reduce((sum, a) => sum + (parseFloat(a.valor_total) || 0), 0);

      ultimos3Meses.push({
        mes: data.toLocaleDateString('pt-BR', { month: 'short' }),
        agendamentos: agendamentosMes.length,
        receita: receitaMes
      });
    }
    return ultimos3Meses;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' && entry.value > 100 
                ? formatCurrency(entry.value) 
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!hasVisualReportsAccess) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-8 text-center">
        <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Relatórios Visuais</h3>
        <p className="text-gray-600 mb-4">
          Gráficos e relatórios visuais estão disponíveis nos planos Pro e Business.
        </p>
        <div className="bg-white rounded-lg p-4 inline-block">
          <p className="text-sm text-gray-500">Seu plano atual: <span className="font-semibold capitalize">{userPlan}</span></p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando relatórios visuais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Grid de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agendamentos por Dia */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <Calendar className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Agendamentos por Dia</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData.agendamentosPorDia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="agendamentos" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Receita por Mês */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <DollarSign className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Receita por Mês</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData.receitaPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="receita" stroke="#10B981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Serviços Mais Solicitados */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Serviços Mais Solicitados</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData.servicosMaisSolicitados} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="nome" type="category" width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="agendamentos" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Agendamentos por Status */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <PieChartIcon className="h-5 w-5 text-orange-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Agendamentos por Status</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData.agendamentosPorStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {chartData.agendamentosPorStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparativo Mensal */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center mb-4">
          <TrendingUp className="h-5 w-5 text-indigo-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Comparativo dos Últimos 3 Meses</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData.comparativoMensal}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="agendamentos"
              stackId="1"
              stroke="#3B82F6"
              fill="#3B82F6"
              name="Agendamentos"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="receita"
              stackId="2"
              stroke="#10B981"
              fill="#10B981"
              name="Receita"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Performance dos Funcionários */}
      {chartData.funcionariosPerformance.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <Users className="h-5 w-5 text-teal-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Performance dos Funcionários</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chartData.funcionariosPerformance.map((funcionario, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{funcionario.nome}</h4>
                  <span className="text-2xl font-bold text-blue-600">{funcionario.agendamentos}</span>
                </div>
                <p className="text-sm text-gray-600">agendamentos</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${(funcionario.agendamentos / chartData.funcionariosPerformance[0].agendamentos) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualReports;

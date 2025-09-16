import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Star,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Clock,
  TrendingUp,
  Heart,
  Award,
  Crown,
  Filter,
  Search,
  Plus,
  Edit,
  Eye
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const CRMClientes = ({ userId, userPlan }) => {
  const [clientes, setClientes] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('all'); // all, vip, regular, novo
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Verificar se o usuário tem acesso ao CRM
  const hasCRMAccess = userPlan === 'pro' || userPlan === 'business';

  useEffect(() => {
    if (userId && hasCRMAccess) {
      loadData();
    }
  }, [userId, hasCRMAccess]);

  const loadData = async () => {
    setLoading(true);
    try {
      const agendamentosData = JSON.parse(localStorage.getItem(`agendamentos_${userId}`) || '[]');
      setAgendamentos(agendamentosData);
      
      // Extrair clientes únicos dos agendamentos
      const clientesUnicos = extractClientesFromAgendamentos(agendamentosData);
      setClientes(clientesUnicos);
    } catch (error) {
      console.error('Erro ao carregar dados do CRM:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractClientesFromAgendamentos = (agendamentos) => {
    const clientesMap = new Map();

    agendamentos.forEach(agendamento => {
      const clienteKey = agendamento.cliente_email;
      
      if (!clientesMap.has(clienteKey)) {
        clientesMap.set(clienteKey, {
          id: agendamento.cliente_email,
          nome: agendamento.cliente_nome,
          email: agendamento.cliente_email,
          telefone: agendamento.cliente_telefone || '',
          endereco: agendamento.cliente_endereco || '',
          primeiroAgendamento: agendamento.data,
          ultimoAgendamento: agendamento.data,
          totalAgendamentos: 0,
          totalGasto: 0,
          statusAgendamentos: {
            confirmado: 0,
            cancelado: 0,
            pendente: 0,
            concluido: 0
          },
          agendamentos: []
        });
      }

      const cliente = clientesMap.get(clienteKey);
      cliente.totalAgendamentos++;
      cliente.totalGasto += parseFloat(agendamento.valor_total) || 0;
      cliente.statusAgendamentos[agendamento.status]++;
      cliente.agendamentos.push(agendamento);

      // Atualizar datas
      if (new Date(agendamento.data) < new Date(cliente.primeiroAgendamento)) {
        cliente.primeiroAgendamento = agendamento.data;
      }
      if (new Date(agendamento.data) > new Date(cliente.ultimoAgendamento)) {
        cliente.ultimoAgendamento = agendamento.data;
      }
    });

    return Array.from(clientesMap.values()).map(cliente => ({
      ...cliente,
      tipo: determineClienteTipo(cliente),
      score: calculateClienteScore(cliente),
      satisfacao: calculateSatisfacao(cliente),
      recencia: calculateRecencia(cliente.ultimoAgendamento)
    }));
  };

  const determineClienteTipo = (cliente) => {
    if (cliente.totalAgendamentos >= 10 && cliente.totalGasto >= 1000) {
      return 'vip';
    } else if (cliente.totalAgendamentos >= 5 || cliente.totalGasto >= 500) {
      return 'regular';
    } else {
      return 'novo';
    }
  };

  const calculateClienteScore = (cliente) => {
    let score = 0;
    
    // Pontos por agendamentos
    score += cliente.totalAgendamentos * 10;
    
    // Pontos por gasto
    score += cliente.totalGasto * 0.1;
    
    // Pontos por fidelidade (tempo desde primeiro agendamento)
    const diasFidelidade = Math.floor((new Date() - new Date(cliente.primeiroAgendamento)) / (1000 * 60 * 60 * 24));
    score += Math.min(diasFidelidade * 0.5, 100);
    
    // Pontos por taxa de comparecimento
    const taxaComparecimento = (cliente.statusAgendamentos.confirmado + cliente.statusAgendamentos.concluido) / cliente.totalAgendamentos;
    score += taxaComparecimento * 50;
    
    return Math.min(Math.round(score), 1000);
  };

  const calculateSatisfacao = (cliente) => {
    // Simular satisfação baseada em comportamento
    const taxaComparecimento = (cliente.statusAgendamentos.confirmado + cliente.statusAgendamentos.concluido) / cliente.totalAgendamentos;
    const taxaCancelamento = cliente.statusAgendamentos.cancelado / cliente.totalAgendamentos;
    
    let satisfacao = 3.0; // Base
    
    if (taxaComparecimento >= 0.8) satisfacao += 1.5;
    else if (taxaComparecimento >= 0.6) satisfacao += 1.0;
    else if (taxaComparecimento >= 0.4) satisfacao += 0.5;
    
    if (taxaCancelamento <= 0.1) satisfacao += 0.5;
    else if (taxaCancelamento <= 0.2) satisfacao += 0.2;
    else satisfacao -= 0.5;
    
    return Math.min(Math.max(satisfacao, 1.0), 5.0);
  };

  const calculateRecencia = (ultimoAgendamento) => {
    const dias = Math.floor((new Date() - new Date(ultimoAgendamento)) / (1000 * 60 * 60 * 24));
    if (dias <= 7) return 'muito-recente';
    if (dias <= 30) return 'recente';
    if (dias <= 90) return 'moderado';
    return 'antigo';
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'vip':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'regular':
        return <Award className="h-4 w-4 text-blue-500" />;
      case 'novo':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'vip':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'regular':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'novo':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRecenciaColor = (recencia) => {
    switch (recencia) {
      case 'muito-recente':
        return 'text-green-600';
      case 'recente':
        return 'text-blue-600';
      case 'moderado':
        return 'text-yellow-600';
      case 'antigo':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredClientes = useMemo(() => {
    let filtered = clientes;

    // Filtro por tipo
    if (filterTipo !== 'all') {
      filtered = filtered.filter(cliente => cliente.tipo === filterTipo);
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(cliente =>
        cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar por score (maior primeiro)
    return filtered.sort((a, b) => b.score - a.score);
  }, [clientes, filterTipo, searchTerm]);

  const estatisticasCRM = useMemo(() => {
    const total = clientes.length;
    const vip = clientes.filter(c => c.tipo === 'vip').length;
    const regular = clientes.filter(c => c.tipo === 'regular').length;
    const novo = clientes.filter(c => c.tipo === 'novo').length;
    const receitaTotal = clientes.reduce((sum, c) => sum + c.totalGasto, 0);
    const satisfacaoMedia = clientes.length > 0 
      ? clientes.reduce((sum, c) => sum + c.satisfacao, 0) / clientes.length 
      : 0;

    return {
      total,
      vip,
      regular,
      novo,
      receitaTotal,
      satisfacaoMedia
    };
  }, [clientes]);

  const openClienteModal = (cliente) => {
    setSelectedCliente(cliente);
    setShowModal(true);
  };

  if (!hasCRMAccess) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-8 text-center">
        <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">CRM de Clientes</h3>
        <p className="text-gray-600 mb-4">
          Sistema de gestão de clientes recorrentes está disponível nos planos Pro e Business.
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
          <p className="text-gray-600">Carregando dados do CRM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header e Estatísticas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">CRM de Clientes</h2>
            <p className="text-gray-600">Gestão de clientes recorrentes e análise de relacionamento</p>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Clientes</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticasCRM.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <Crown className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Clientes VIP</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticasCRM.vip}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <UserPlus className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Novos</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticasCRM.novo}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Receita Total</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(estatisticasCRM.receitaTotal)}</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Satisfação Média</p>
                <p className="text-xl font-bold text-gray-900">{estatisticasCRM.satisfacaoMedia.toFixed(1)}/5</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os tipos</option>
              <option value="vip">VIP</option>
              <option value="regular">Regulares</option>
              <option value="novo">Novos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Clientes ({filteredClientes.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredClientes.map((cliente) => (
            <div key={cliente.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {cliente.nome.charAt(0).toUpperCase()}
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-lg font-semibold text-gray-900">{cliente.nome}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTipoColor(cliente.tipo)}`}>
                        {getTipoIcon(cliente.tipo)}
                        <span className="ml-1 capitalize">{cliente.tipo}</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {cliente.email}
                      </div>
                      {cliente.telefone && (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {cliente.telefone}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {cliente.totalAgendamentos} agendamentos
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {formatCurrency(cliente.totalGasto)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm text-gray-600">Score:</span>
                      <span className="font-bold text-blue-600">{cliente.score}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">{cliente.satisfacao.toFixed(1)}/5</span>
                    </div>
                    <div className={`text-sm ${getRecenciaColor(cliente.recencia)}`}>
                      {cliente.recencia === 'muito-recente' && 'Muito ativo'}
                      {cliente.recencia === 'recente' && 'Ativo'}
                      {cliente.recencia === 'moderado' && 'Moderado'}
                      {cliente.recencia === 'antigo' && 'Inativo'}
                    </div>
                  </div>

                  <button
                    onClick={() => openClienteModal(cliente)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredClientes.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum cliente encontrado com os filtros aplicados.</p>
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Cliente */}
      {showModal && selectedCliente && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Detalhes do Cliente</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Informações Básicas */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Informações Básicas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nome</p>
                    <p className="font-medium">{selectedCliente.nome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedCliente.email}</p>
                  </div>
                  {selectedCliente.telefone && (
                    <div>
                      <p className="text-sm text-gray-600">Telefone</p>
                      <p className="font-medium">{selectedCliente.telefone}</p>
                    </div>
                  )}
                  {selectedCliente.endereco && (
                    <div>
                      <p className="text-sm text-gray-600">Endereço</p>
                      <p className="font-medium">{selectedCliente.endereco}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Métricas */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Métricas de Relacionamento</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-900">{selectedCliente.totalAgendamentos}</p>
                    <p className="text-sm text-gray-600">Agendamentos</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(selectedCliente.totalGasto)}</p>
                    <p className="text-sm text-gray-600">Total Gasto</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3 text-center">
                    <Star className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-900">{selectedCliente.satisfacao.toFixed(1)}</p>
                    <p className="text-sm text-gray-600">Satisfação</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-900">{selectedCliente.score}</p>
                    <p className="text-sm text-gray-600">Score</p>
                  </div>
                </div>
              </div>

              {/* Histórico de Agendamentos */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Últimos Agendamentos</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedCliente.agendamentos
                    .sort((a, b) => new Date(b.data) - new Date(a.data))
                    .slice(0, 10)
                    .map((agendamento, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{agendamento.data}</p>
                          <p className="text-sm text-gray-600">{agendamento.hora_inicio}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            agendamento.status === 'confirmado' ? 'bg-green-100 text-green-800' :
                            agendamento.status === 'cancelado' ? 'bg-red-100 text-red-800' :
                            agendamento.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {agendamento.status}
                          </span>
                          <p className="text-sm text-gray-600 mt-1">{formatCurrency(agendamento.valor_total)}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMClientes;

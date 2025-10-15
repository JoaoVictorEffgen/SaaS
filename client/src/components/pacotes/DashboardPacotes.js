import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  ArrowLeft, 
  Package, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff,
  Star,
  Users,
  Calendar,
  DollarSign,
  Settings,
  TrendingUp,
  CheckCircle,
  XCircle,
  Gift,
  Percent,
  Clock,
  Tag
} from 'lucide-react';

const DashboardPacotes = () => {
  const navigate = useNavigate();
  const [pacotes, setPacotes] = useState([]);
  const [promocoes, setPromocoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pacotes'); // 'pacotes' ou 'promocoes'
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPacote, setEditingPacote] = useState(null);
  const [showCreatePromocao, setShowCreatePromocao] = useState(false);
  const [editingPromocao, setEditingPromocao] = useState(null);

  useEffect(() => {
    carregarPacotes();
    carregarPromocoes();
  }, []);

  const carregarPromocoes = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/promocoes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setPromocoes(result.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar promoções:', error);
    }
  };

  const carregarPacotes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/pacotes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPacotes(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar pacotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const criarPromocao = async (dadosPromocao) => {
    try {
      console.log('🔍 [FRONTEND DEBUG] Dados da promoção:', dadosPromocao);
      
      const token = localStorage.getItem('authToken');
      console.log('🔍 [FRONTEND DEBUG] Token encontrado:', token ? 'Sim' : 'Não');
      
      const response = await fetch('/api/promocoes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosPromocao)
      });

      console.log('🔍 [FRONTEND DEBUG] Status da resposta:', response.status);
      console.log('🔍 [FRONTEND DEBUG] Headers da resposta:', response.headers);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ [FRONTEND DEBUG] Promoção criada com sucesso:', result);
        await carregarPromocoes();
        setShowCreatePromocao(false);
        window.alert('Promoção criada com sucesso!');
      } else {
        const error = await response.json();
        console.error('❌ [FRONTEND DEBUG] Erro na resposta:', error);
        window.alert(`Erro: ${error.message || error.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('❌ [FRONTEND DEBUG] Erro ao criar promoção:', error);
      window.alert('Erro ao criar promoção');
    }
  };

  const atualizarPromocao = async (id, dadosPromocao) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/promocoes/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosPromocao)
      });

      if (response.ok) {
        await carregarPromocoes();
        setEditingPromocao(null);
        window.alert('Promoção atualizada com sucesso!');
      } else {
        const error = await response.json();
        window.alert(`Erro: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar promoção:', error);
      window.alert('Erro ao atualizar promoção');
    }
  };

  const deletarPromocao = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar esta promoção?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/promocoes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await carregarPromocoes();
        window.alert('Promoção deletada com sucesso!');
      } else {
        const error = await response.json();
        window.alert(`Erro: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao deletar promoção:', error);
      window.alert('Erro ao deletar promoção');
    }
  };

  const toggleDestaquePromocao = async (promocao) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/promocoes/${promocao.id}/toggle-destaque`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await carregarPromocoes();
      }
    } catch (error) {
      console.error('Erro ao alternar destaque:', error);
    }
  };

  const criarPacote = async (dadosPacote) => {
    try {
      console.log('🔍 [FRONTEND DEBUG] Dados do pacote:', dadosPacote);
      
      const token = localStorage.getItem('authToken');
      console.log('🔍 [FRONTEND DEBUG] Token encontrado:', token ? 'Sim' : 'Não');
      
      const response = await fetch('/api/pacotes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosPacote)
      });

      console.log('🔍 [FRONTEND DEBUG] Status da resposta:', response.status);
      console.log('🔍 [FRONTEND DEBUG] Headers da resposta:', response.headers);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ [FRONTEND DEBUG] Pacote criado com sucesso:', result);
        await carregarPacotes();
        setShowCreateForm(false);
        window.alert('Pacote criado com sucesso!');
      } else {
        const error = await response.json();
        console.error('❌ [FRONTEND DEBUG] Erro na resposta:', error);
        window.alert(`Erro: ${error.message}`);
      }
    } catch (error) {
      console.error('❌ [FRONTEND DEBUG] Erro ao criar pacote:', error);
      window.alert('Erro ao criar pacote');
    }
  };

  const atualizarPacote = async (id, dadosPacote) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/pacotes/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosPacote)
      });

      if (response.ok) {
        await carregarPacotes();
        setEditingPacote(null);
        window.alert('Pacote atualizado com sucesso!');
      } else {
        const error = await response.json();
        window.alert(`Erro: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar pacote:', error);
      window.alert('Erro ao atualizar pacote');
    }
  };

  const deletarPacote = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este pacote?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/pacotes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await carregarPacotes();
        window.alert('Pacote deletado com sucesso!');
      } else {
        const error = await response.json();
        window.alert(`Erro: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao deletar pacote:', error);
      window.alert('Erro ao deletar pacote');
    }
  };

  const togglePublico = async (pacote) => {
    const novosDados = {
      ...pacote,
      publico: !pacote.publico
    };
    await atualizarPacote(pacote.id, novosDados);
  };

  const formatarPreco = (preco) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  };

  const getStatusBadge = (pacote) => {
    if (!pacote.ativo) {
      return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Inativo</span>;
    }
    if (pacote.publico) {
      return <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">Público</span>;
    }
    return <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">Privado</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando pacotes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/empresa/dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Voltar ao Dashboard</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Pacotes & Promoções</h1>
                  <p className="text-sm text-gray-600">Gerencie seus pacotes e promoções</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Tabs */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('pacotes')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'pacotes'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Package className="h-4 w-4 inline mr-2" />
                  Pacotes
                </button>
                <button
                  onClick={() => setActiveTab('promocoes')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'promocoes'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Gift className="h-4 w-4 inline mr-2" />
                  Promoções
                </button>
              </div>
              
              {/* Create Button */}
              <button
                onClick={() => {
                  if (activeTab === 'pacotes') {
                    setShowCreateForm(true);
                  } else {
                    setShowCreatePromocao(true);
                  }
                }}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus className="h-5 w-5" />
                <span>
                  {activeTab === 'pacotes' ? 'Criar Pacote' : 'Criar Promoção'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'pacotes' ? (
          /* PACOTES TAB */
          pacotes.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="mb-8">
                  <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
                    <Package className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Nenhum pacote criado
                  </h3>
                  <p className="text-gray-600 mb-8">
                    Crie seu primeiro pacote personalizado para oferecer aos seus clientes
                  </p>
                </div>
                
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Plus className="h-5 w-5" />
                  <span>Criar Primeiro Pacote</span>
                </button>
              </div>
            </div>
          ) : (
            /* Packages Grid */
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total de Pacotes</p>
                      <p className="text-2xl font-bold text-gray-900">{pacotes.length}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pacotes Ativos</p>
                      <p className="text-2xl font-bold text-green-600">
                        {pacotes.filter(p => p.ativo).length}
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pacotes Públicos</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {pacotes.filter(p => p.publico).length}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Star className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Contratos Ativos</p>
                      <p className="text-2xl font-bold text-indigo-600">
                        {pacotes.reduce((total, p) => total + (p.contratos_ativos || 0), 0)}
                      </p>
                    </div>
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <Users className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Receita Total</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {formatarPreco(pacotes.reduce((total, p) => total + parseFloat(p.receita_total || 0), 0))}
                      </p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Packages List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {pacotes.map((pacote) => (
                  <div key={pacote.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden">
                    {/* Package Header */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {pacote.nome}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {pacote.descricao || 'Sem descrição'}
                          </p>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(pacote)}
                            <span className="text-xs text-gray-500">
                              {pacote.vendas_totais} vendas
                            </span>
                            <span className="text-xs text-blue-600 font-medium">
                              {pacote.contratos_ativos || 0} contratos ativos
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => setEditingPacote(pacote)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deletarPacote(pacote.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-2xl font-bold text-gray-900 mb-2">
                        {formatarPreco(pacote.preco)}
                        <span className="text-sm font-normal text-gray-600 ml-1">
                          /{pacote.tipo_cobranca}
                        </span>
                      </div>
                    </div>

                    {/* Package Features */}
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {pacote.limite_funcionarios || '∞'} funcionários
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {pacote.limite_agendamentos_mes || '∞'} agendamentos/mês
                          </span>
                        </div>
                      </div>
                      
                      {pacote.categoria && (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">{pacote.categoria}</span>
                        </div>
                      )}
                    </div>

                    {/* Package Actions */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => togglePublico(pacote)}
                          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            pacote.publico
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {pacote.publico ? (
                            <>
                              <Eye className="h-4 w-4" />
                              <span>Público</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-4 w-4" />
                              <span>Privado</span>
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => setEditingPacote(pacote)}
                          className="flex items-center space-x-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors duration-200"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Configurar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : (
          /* PROMOÇÕES TAB */
          promocoes.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="mb-8">
                  <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-100 to-yellow-100 rounded-full flex items-center justify-center mb-6">
                    <Gift className="h-12 w-12 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Nenhuma promoção criada
                  </h3>
                  <p className="text-gray-600 mb-8">
                    Crie sua primeira promoção para atrair mais clientes
                  </p>
                </div>
                
                <button
                  onClick={() => setShowCreatePromocao(true)}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-yellow-600 text-white px-8 py-4 rounded-lg font-medium hover:from-green-700 hover:to-yellow-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Plus className="h-5 w-5" />
                  <span>Criar Primeira Promoção</span>
                </button>
              </div>
            </div>
          ) : (
            /* Promoções Grid */
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total de Promoções</p>
                      <p className="text-2xl font-bold text-gray-900">{promocoes.length}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Gift className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Promoções Ativas</p>
                      <p className="text-2xl font-bold text-green-600">
                        {promocoes.filter(p => p.ativo && new Date(p.data_fim) > new Date()).length}
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Em Destaque</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {promocoes.filter(p => p.destaque).length}
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <Star className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total de Usos</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {promocoes.reduce((total, p) => total + (p.uso_atual || 0), 0)}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Promoções List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {promocoes.map((promocao) => (
                  <div key={promocao.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden">
                    {/* Promoção Header */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {promocao.nome}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {promocao.descricao || 'Sem descrição'}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              promocao.ativo && new Date(promocao.data_fim) > new Date()
                                ? 'bg-green-100 text-green-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {promocao.ativo && new Date(promocao.data_fim) > new Date() ? 'Ativa' : 'Inativa'}
                            </span>
                            {promocao.destaque && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs font-medium">
                                Destaque
                              </span>
                            )}
                            <span className="text-xs text-blue-600 font-medium">
                              {promocao.uso_atual || 0} usos
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => setEditingPromocao(promocao)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deletarPromocao(promocao.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-2xl font-bold text-gray-900 mb-2">
                        {promocao.tipo_desconto === 'percentual' && (
                          <>
                            <Percent className="h-6 w-6 inline mr-1" />
                            {promocao.valor_desconto}% OFF
                          </>
                        )}
                        {promocao.tipo_desconto === 'valor_fixo' && (
                          <>
                            <DollarSign className="h-6 w-6 inline mr-1" />
                            {formatarPreco(promocao.valor_desconto)} OFF
                          </>
                        )}
                        {promocao.tipo_desconto === 'meses_gratis' && (
                          <>
                            <Clock className="h-6 w-6 inline mr-1" />
                            {promocao.meses_gratis} meses grátis
                          </>
                        )}
                        {promocao.tipo_desconto === 'funcionalidade_extra' && (
                          <>
                            <Star className="h-6 w-6 inline mr-1" />
                            Funcionalidades extras
                          </>
                        )}
                      </div>
                    </div>

                    {/* Promoção Details */}
                    <div className="p-6 space-y-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {new Date(promocao.data_inicio).toLocaleDateString('pt-BR')} - {new Date(promocao.data_fim).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      
                      {promocao.codigo_promocional && (
                        <div className="flex items-center space-x-2">
                          <Tag className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Código: {promocao.codigo_promocional}
                          </span>
                        </div>
                      )}
                      
                      {promocao.limite_uso && (
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Limite: {promocao.limite_uso} usos
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Promoção Actions */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => toggleDestaquePromocao(promocao)}
                          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            promocao.destaque
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Star className="h-4 w-4" />
                          <span>{promocao.destaque ? 'Em Destaque' : 'Destacar'}</span>
                        </button>
                        
                        <button
                          onClick={() => setEditingPromocao(promocao)}
                          className="flex items-center space-x-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors duration-200"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Configurar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {(showCreateForm || editingPacote) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPacote ? 'Editar Pacote' : 'Criar Novo Pacote'}
              </h2>
            </div>
            
            <div className="p-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const dados = {
                  nome: formData.get('nome'),
                  descricao: formData.get('descricao'),
                  preco: parseFloat(formData.get('preco')),
                  tipo_cobranca: formData.get('tipo_cobranca'),
                  categoria: formData.get('categoria'),
                  limite_funcionarios: formData.get('limite_funcionarios') ? parseInt(formData.get('limite_funcionarios')) : null,
                  limite_agendamentos_mes: formData.get('limite_agendamentos_mes') ? parseInt(formData.get('limite_agendamentos_mes')) : null,
                  limite_clientes: formData.get('limite_clientes') ? parseInt(formData.get('limite_clientes')) : null,
                  limite_servicos: formData.get('limite_servicos') ? parseInt(formData.get('limite_servicos')) : null,
                  funcionalidades: {
                    relatorios_avancados: formData.get('relatorios_avancados') === 'on',
                    api_access: formData.get('api_access') === 'on',
                    suporte_prioritario: formData.get('suporte_prioritario') === 'on',
                    backup_automatico: formData.get('backup_automatico') === 'on'
                  },
                  ativo: formData.get('ativo') === 'on',
                  publico: formData.get('publico') === 'on'
                };
                
                if (editingPacote) {
                  atualizarPacote(editingPacote.id, dados);
                } else {
                  criarPacote(dados);
                }
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Pacote
                    </label>
                    <input
                      type="text"
                      name="nome"
                      defaultValue={editingPacote?.nome || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      name="descricao"
                      defaultValue={editingPacote?.descricao || ''}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preço (R$)
                    </label>
                    <input
                      type="number"
                      name="preco"
                      step="0.01"
                      defaultValue={editingPacote?.preco || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Cobrança
                    </label>
                    <select
                      name="tipo_cobranca"
                      defaultValue={editingPacote?.tipo_cobranca || 'mensal'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="mensal">Mensal</option>
                      <option value="trimestral">Trimestral</option>
                      <option value="semestral">Semestral</option>
                      <option value="anual">Anual</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria
                    </label>
                    <input
                      type="text"
                      name="categoria"
                      defaultValue={editingPacote?.categoria || ''}
                      placeholder="Ex: Estética, Saúde, Fitness"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Limite de Funcionários
                    </label>
                    <input
                      type="number"
                      name="limite_funcionarios"
                      defaultValue={editingPacote?.limite_funcionarios || ''}
                      placeholder="Deixe vazio para ilimitado"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Agendamentos por Mês
                    </label>
                    <input
                      type="number"
                      name="limite_agendamentos_mes"
                      defaultValue={editingPacote?.limite_agendamentos_mes || ''}
                      placeholder="Deixe vazio para ilimitado"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Limite de Clientes
                    </label>
                    <input
                      type="number"
                      name="limite_clientes"
                      defaultValue={editingPacote?.limite_clientes || ''}
                      placeholder="Deixe vazio para ilimitado"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Limite de Serviços
                    </label>
                    <input
                      type="number"
                      name="limite_servicos"
                      defaultValue={editingPacote?.limite_servicos || ''}
                      placeholder="Deixe vazio para ilimitado"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Funcionalidades</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="relatorios_avancados"
                        defaultChecked={editingPacote?.funcionalidades?.relatorios_avancados || false}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Relatórios Avançados</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="api_access"
                        defaultChecked={editingPacote?.funcionalidades?.api_access || false}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Acesso à API</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="suporte_prioritario"
                        defaultChecked={editingPacote?.funcionalidades?.suporte_prioritario || false}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Suporte Prioritário</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="backup_automatico"
                        defaultChecked={editingPacote?.funcionalidades?.backup_automatico || false}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Backup Automático</span>
                    </label>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="ativo"
                        defaultChecked={editingPacote?.ativo !== false}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Pacote Ativo</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="publico"
                        defaultChecked={editingPacote?.publico || false}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Pacote Público</span>
                    </label>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingPacote(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    {editingPacote ? 'Atualizar Pacote' : 'Criar Pacote'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Create/Edit Promoção Modal */}
      {(showCreatePromocao || editingPromocao) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPromocao ? 'Editar Promoção' : 'Criar Nova Promoção'}
              </h2>
            </div>
            
            <div className="p-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const dados = {
                  nome: formData.get('nome'),
                  descricao: formData.get('descricao'),
                  tipo_desconto: formData.get('tipo_desconto'),
                  valor_desconto: formData.get('valor_desconto') ? parseFloat(formData.get('valor_desconto').replace(',', '.')) : null,
                  meses_gratis: formData.get('meses_gratis') ? parseInt(formData.get('meses_gratis')) : null,
                  funcionalidade_extra: null, // Campo não usado no formulário atual
                  codigo_promocional: formData.get('codigo_promocional'),
                  data_inicio: formData.get('data_inicio'),
                  data_fim: formData.get('data_fim'),
                  limite_uso: formData.get('limite_uso') ? parseInt(formData.get('limite_uso')) : null,
                  destaque: formData.get('destaque') === 'on',
                  cor_destaque: formData.get('cor_destaque'),
                  observacoes: formData.get('observacoes')
                };
                
                if (editingPromocao) {
                  atualizarPromocao(editingPromocao.id, dados);
                } else {
                  criarPromocao(dados);
                }
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Promoção
                    </label>
                    <input
                      type="text"
                      name="nome"
                      defaultValue={editingPromocao?.nome || ''}
                      placeholder="Ex: Black Friday, Natal, Verão"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      name="descricao"
                      defaultValue={editingPromocao?.descricao || ''}
                      rows={3}
                      placeholder="Descreva os benefícios da promoção"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Desconto
                    </label>
                    <select
                      name="tipo_desconto"
                      defaultValue={editingPromocao?.tipo_desconto || 'percentual'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="percentual">Desconto Percentual (%)</option>
                      <option value="valor_fixo">Desconto em Valor Fixo (R$)</option>
                      <option value="meses_gratis">Meses Grátis</option>
                      <option value="funcionalidade_extra">Funcionalidades Extras</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valor do Desconto
                    </label>
                    <input
                      type="number"
                      name="valor_desconto"
                      step="0.01"
                      defaultValue={editingPromocao?.valor_desconto || ''}
                      placeholder="Ex: 50 (para 50% ou R$ 50)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meses Grátis
                    </label>
                    <input
                      type="number"
                      name="meses_gratis"
                      defaultValue={editingPromocao?.meses_gratis || ''}
                      placeholder="Ex: 1, 2, 3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código Promocional
                    </label>
                    <input
                      type="text"
                      name="codigo_promocional"
                      defaultValue={editingPromocao?.codigo_promocional || ''}
                      placeholder="Ex: BLACK50, GRATIS1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Início
                    </label>
                    <input
                      type="datetime-local"
                      name="data_inicio"
                      defaultValue={editingPromocao?.data_inicio ? new Date(editingPromocao.data_inicio).toISOString().slice(0, 16) : ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Fim
                    </label>
                    <input
                      type="datetime-local"
                      name="data_fim"
                      defaultValue={editingPromocao?.data_fim ? new Date(editingPromocao.data_fim).toISOString().slice(0, 16) : ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Limite de Usos
                    </label>
                    <input
                      type="number"
                      name="limite_uso"
                      defaultValue={editingPromocao?.limite_uso || ''}
                      placeholder="Deixe vazio para ilimitado"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cor de Destaque
                    </label>
                    <input
                      type="color"
                      name="cor_destaque"
                      defaultValue={editingPromocao?.cor_destaque || '#ff6b6b'}
                      className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observações
                    </label>
                    <textarea
                      name="observacoes"
                      defaultValue={editingPromocao?.observacoes || ''}
                      rows={2}
                      placeholder="Observações adicionais sobre a promoção"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="destaque"
                        defaultChecked={editingPromocao?.destaque || false}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Promoção em Destaque</span>
                    </label>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreatePromocao(false);
                      setEditingPromocao(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-yellow-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-yellow-700 transition-all duration-200"
                  >
                    {editingPromocao ? 'Atualizar Promoção' : 'Criar Promoção'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPacotes;
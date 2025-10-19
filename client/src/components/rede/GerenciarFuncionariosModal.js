import React, { useState, useEffect } from 'react';
import { X, Users, UserPlus, ArrowRight, ArrowLeft, Building, User } from 'lucide-react';

const GerenciarFuncionariosModal = ({ isOpen, onClose, empresaId, empresaNome }) => {
  const [funcionarios, setFuncionarios] = useState([]);
  const [funcionariosDisponiveis, setFuncionariosDisponiveis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('adicionar'); // 'adicionar' ou 'transferir'

  useEffect(() => {
    if (isOpen && empresaId) {
      carregarFuncionarios();
      carregarFuncionariosDisponiveis();
    }
  }, [isOpen, empresaId]);

  const carregarFuncionarios = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/empresas/${empresaId}/funcionarios`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const dados = await response.json();
        console.log('👥 Funcionários da empresa recebidos:', dados);
        setFuncionarios(dados.funcionarios || []);
      } else {
        console.error('❌ Erro ao carregar funcionários da empresa:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
    }
  };

  const carregarFuncionariosDisponiveis = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/redes/funcionarios-disponiveis`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const dados = await response.json();
        console.log('📋 Funcionários disponíveis recebidos:', dados);
        setFuncionariosDisponiveis(dados.funcionarios || []);
      } else {
        console.error('❌ Erro ao carregar funcionários disponíveis:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Erro ao carregar funcionários disponíveis:', error);
    }
  };

  const adicionarFuncionario = async (funcionarioId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/empresas/${empresaId}/funcionarios`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ funcionario_id: funcionarioId })
      });

      if (response.ok) {
        await carregarFuncionarios();
        await carregarFuncionariosDisponiveis();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao adicionar funcionário');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const removerFuncionario = async (funcionarioId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/empresas/${empresaId}/funcionarios/${funcionarioId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await carregarFuncionarios();
        await carregarFuncionariosDisponiveis();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao remover funcionário');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const criarNovoFuncionario = async (dadosFuncionario) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/empresas/${empresaId}/funcionarios`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosFuncionario)
      });

      if (response.ok) {
        await carregarFuncionarios();
        await carregarFuncionariosDisponiveis();
        setActiveTab('adicionar');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao criar funcionário');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Building className="h-6 w-6 text-purple-600 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Gerenciar Funcionários</h2>
              <p className="text-sm text-gray-600">{empresaNome}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('adicionar')}
            className={`flex-1 px-6 py-3 text-sm font-medium ${
              activeTab === 'adicionar'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <UserPlus className="h-4 w-4 inline mr-2" />
            Adicionar/Criar
          </button>
          <button
            onClick={() => setActiveTab('transferir')}
            className={`flex-1 px-6 py-3 text-sm font-medium ${
              activeTab === 'transferir'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ArrowRight className="h-4 w-4 inline mr-2" />
            Transferir
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {activeTab === 'adicionar' && (
            <AdicionarFuncionarioTab
              funcionariosDisponiveis={funcionariosDisponiveis}
              onAdicionarFuncionario={adicionarFuncionario}
              onCriarFuncionario={criarNovoFuncionario}
              loading={loading}
            />
          )}

          {activeTab === 'transferir' && (
            <TransferirFuncionarioTab
              funcionarios={funcionarios}
              onRemoverFuncionario={removerFuncionario}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Componente para adicionar funcionários
const AdicionarFuncionarioTab = ({ funcionariosDisponiveis, onAdicionarFuncionario, onCriarFuncionario, loading }) => {
  const [showCriarForm, setShowCriarForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cargo: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCriarFuncionario(formData);
    setFormData({ nome: '', email: '', telefone: '', cargo: '' });
    setShowCriarForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Funcionários Disponíveis */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Funcionários Disponíveis</h3>
          <button
            onClick={() => setShowCriarForm(!showCriarForm)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            {showCriarForm ? 'Cancelar' : 'Criar Novo'}
          </button>
        </div>

        {/* Formulário de Criação */}
        {showCriarForm && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                <input
                  type="text"
                  value={formData.cargo}
                  onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: Barbeiro, Recepcionista"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Criando...' : 'Criar Funcionário'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Funcionários Disponíveis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {funcionariosDisponiveis.map((funcionario) => (
            <div key={funcionario.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{funcionario.nome}</h4>
                  <p className="text-sm text-gray-600">{funcionario.email}</p>
                  {funcionario.cargo && <p className="text-xs text-gray-500">{funcionario.cargo}</p>}
                </div>
                <button
                  onClick={() => onAdicionarFuncionario(funcionario.id)}
                  disabled={loading}
                  className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
                >
                  Adicionar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Componente para transferir funcionários
const TransferirFuncionarioTab = ({ funcionarios, onRemoverFuncionario, loading }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Funcionários Atuais</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {funcionarios.map((funcionario) => (
          <div key={funcionario.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <User className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{funcionario.nome}</h4>
                  <p className="text-sm text-gray-600">{funcionario.email}</p>
                  {funcionario.cargo && <p className="text-xs text-gray-500">{funcionario.cargo}</p>}
                </div>
              </div>
              <button
                onClick={() => onRemoverFuncionario(funcionario.id)}
                disabled={loading}
                className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm"
              >
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GerenciarFuncionariosModal;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMySqlAuth } from '../../contexts/MySqlAuthContext';
import apiService from '../../services/apiService';
import AdicionarEmpresaModal from './AdicionarEmpresaModal';
import GerenciarFuncionariosModal from './GerenciarFuncionariosModal';

const DashboardRede = () => {
  const navigate = useNavigate();
  const { user } = useMySqlAuth();
  const [rede, setRede] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdicionarEmpresa, setShowAdicionarEmpresa] = useState(false);
  const [showGerenciarFuncionarios, setShowGerenciarFuncionarios] = useState(false);
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);

  useEffect(() => {
    fetchRede();
  }, []);

  const fetchRede = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/redes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const redeData = await response.json();
        setRede(redeData);
      } else if (response.status === 404) {
        // Usuário não possui rede, mostrar opção de criar
        setRede(null);
      } else {
        throw new Error('Erro ao carregar dados da rede');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const criarRede = async (dadosRede) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/redes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosRede)
      });

      if (response.ok) {
        const novaRede = await response.json();
        setRede(novaRede);
        return novaRede;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar rede');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const adicionarEmpresa = (novaEmpresa) => {
    setRede(prev => ({
      ...prev,
      empresas: [...(prev.empresas || []), novaEmpresa],
      empresas_ativas: prev.empresas_ativas + 1
    }));
  };

  const abrirGerenciarFuncionarios = (empresa) => {
    setEmpresaSelecionada(empresa);
    setShowGerenciarFuncionarios(true);
  };

  const confirmarExclusaoEmpresa = (empresa) => {
    // Verificar se é a empresa principal (comparar com admin da rede)
    if (empresa.user_id === rede?.usuario_admin_id) {
      alert('❌ Não é possível excluir a empresa principal da rede.\n\nApenas filiais podem ser excluídas.');
      return;
    }
    
    const confirmacao = window.confirm(
      `Tem certeza que deseja excluir a filial "${empresa.nome_unidade || `Empresa ${empresa.id}`}"?\n\n` +
      `Esta ação irá:\n` +
      `• Remover todos os funcionários desta filial\n` +
      `• Excluir todos os agendamentos relacionados\n` +
      `• Esta ação NÃO pode ser desfeita\n\n` +
      `Digite "EXCLUIR" para confirmar:`
    );
    
    if (confirmacao) {
      const confirmacaoFinal = window.prompt(
        `Para confirmar a exclusão, digite exatamente: EXCLUIR`
      );
      
      if (confirmacaoFinal === 'EXCLUIR') {
        excluirEmpresa(empresa.id);
      } else {
        alert('Exclusão cancelada. Texto de confirmação incorreto.');
      }
    }
  };

  const excluirEmpresa = async (empresaId) => {
    try {
      console.log('🗑️ Tentando excluir empresa ID:', empresaId);
      const response = await apiService.delete(`/redes/empresas/${empresaId}`);
      console.log('✅ Resposta da API:', response);
      
      if (response.success) {
        alert('Filial excluída com sucesso!');
        fetchRede(); // Recarregar dados da rede
      } else {
        alert(`Erro ao excluir filial: ${response.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('❌ Erro ao excluir empresa:', error);
      alert(`Erro de conexão: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Erro: {error}</p>
      </div>
    );
  }

  if (!rede) {
    return <CriarRedeForm onCriarRede={criarRede} />;
  }

  return (
    <div className="space-y-6">
      {/* Banner de Trial */}
      {rede.trialStatus && rede.trialStatus.isTrial && !rede.trialStatus.expirado && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">
                  Trial Gratuito - {rede.trialStatus.diasRestantes} dias restantes
                </h3>
                <p className="text-blue-700">
                  Experimente todas as funcionalidades sem limitações!
                </p>
              </div>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Escolher Plano
            </button>
          </div>
        </div>
      )}

      {/* Header da Rede */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center mb-2">
              <button
                onClick={() => navigate('/empresa/dashboard')}
                className="mr-4 text-gray-600 hover:text-gray-900 transition-colors"
                title="Voltar ao Dashboard"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">{rede.nome_rede}</h1>
            </div>
            <p className="text-gray-600">{rede.descricao}</p>
            <div className="flex items-center mt-2">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                rede.plano === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                rede.plano === 'premium' ? 'bg-blue-100 text-blue-800' :
                rede.plano === 'trial' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {rede.plano === 'trial' ? 'Trial Gratuito' : `Plano ${rede.plano.charAt(0).toUpperCase() + rede.plano.slice(1)}`}
              </span>
              <span className="ml-2 text-sm text-gray-500">
                {rede.empresas_ativas}/{rede.limite_empresas} empresas
              </span>
              {rede.trialStatus && rede.trialStatus.isTrial && !rede.trialStatus.expirado && (
                <span className="ml-2 text-sm text-orange-600 font-medium">
                  {rede.trialStatus.diasRestantes} dias restantes
                </span>
              )}
            </div>
          </div>
          {rede.logo_rede_url && (
            <img 
              src={rede.logo_rede_url} 
              alt="Logo da Rede" 
              className="w-16 h-16 rounded-lg object-cover"
            />
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h4m0 0h4m-4 0v4m0-4V7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Filiais</p>
              <p className="text-2xl font-semibold text-gray-900">
                {rede.empresas?.filter(empresa => empresa.user_id !== rede.usuario_admin_id).length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Funcionários</p>
              <p className="text-2xl font-semibold text-gray-900">
                {rede.empresas?.reduce((total, empresa) => total + (empresa.funcionarios?.length || 0), 0) || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Plano</p>
              <p className="text-2xl font-semibold text-gray-900 capitalize">{rede.plano}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Empresas */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Filiais da Rede</h2>
            {(rede.plano === 'enterprise' || rede.plano === 'trial') && (
              <button 
                onClick={() => setShowAdicionarEmpresa(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Adicionar Filial
              </button>
            )}
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {rede.empresas?.filter(empresa => empresa.user_id !== rede.usuario_admin_id).map((empresa) => (
            <div key={empresa.id} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {empresa.nome_unidade || `Empresa ${empresa.id}`}
                  </h3>
                  <p className="text-gray-600">{empresa.endereco}</p>
                  <p className="text-sm text-gray-500">
                    {empresa.funcionarios?.length || 0} funcionários
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    empresa.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {empresa.ativo ? 'Ativa' : 'Inativa'}
                  </span>
                  <button 
                    onClick={() => abrirGerenciarFuncionarios(empresa)}
                    className="bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    Gerenciar Funcionários
                  </button>
                  <button className="text-blue-600 hover:text-blue-800">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => confirmarExclusaoEmpresa(empresa)}
                    className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                    title="Excluir Filial"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )) || (
            <div className="p-6 text-center text-gray-500">
              Nenhuma filial cadastrada na rede
            </div>
          )}
        </div>
      </div>

      {/* Relatórios */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Relatórios da Rede</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <div>
                <p className="font-medium text-gray-900">Relatório de Vendas</p>
                <p className="text-sm text-gray-600">Receita consolidada</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div>
                <p className="font-medium text-gray-900">Performance</p>
                <p className="text-sm text-gray-600">Por empresa e funcionário</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Modal para adicionar empresa */}
      <AdicionarEmpresaModal
        isOpen={showAdicionarEmpresa}
        onClose={() => setShowAdicionarEmpresa(false)}
        onAdicionarEmpresa={adicionarEmpresa}
        redeId={rede?.id}
      />

      {/* Modal para gerenciar funcionários */}
      <GerenciarFuncionariosModal
        isOpen={showGerenciarFuncionarios}
        onClose={() => setShowGerenciarFuncionarios(false)}
        empresaId={empresaSelecionada?.id}
        empresaNome={empresaSelecionada?.nome_unidade || `Empresa ${empresaSelecionada?.id}`}
      />
    </div>
  );
};

const CriarRedeForm = ({ onCriarRede }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome_rede: '',
    descricao: '',
    plano: 'trial',
    cpf_cnpj: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onCriarRede(formData);
    } catch (error) {
      console.error('Erro ao criar rede:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <button
            onClick={() => navigate('/empresa/dashboard')}
            className="mr-4 text-gray-600 hover:text-gray-900 transition-colors"
            title="Voltar ao Dashboard"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold text-gray-900">Criar Rede Empresarial</h2>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-green-800 font-medium">15 dias grátis com tudo liberado!</span>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome da Rede
          </label>
          <input
            type="text"
            value={formData.nome_rede}
            onChange={(e) => setFormData({...formData, nome_rede: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: Barbearia do João"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            value={formData.descricao}
            onChange={(e) => setFormData({...formData, descricao: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Descrição da sua rede empresarial"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CPF ou CNPJ (apenas para rede principal)
          </label>
          <input
            type="text"
            value={formData.cpf_cnpj}
            onChange={(e) => setFormData({...formData, cpf_cnpj: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Necessário apenas para a rede principal. Filiais usarão o mesmo documento.
          </p>
        </div>

        <div className="hidden">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plano
          </label>
          <select
            value={formData.plano}
            onChange={(e) => setFormData({...formData, plano: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="trial">Trial Gratuito (15 dias)</option>
            <option value="basico">Básico (1 empresa)</option>
            <option value="premium">Premium (3 empresas)</option>
            <option value="enterprise">Enterprise (ilimitado)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Criando...' : 'Criar Rede'}
        </button>
      </form>
    </div>
  );
};

export default DashboardRede;

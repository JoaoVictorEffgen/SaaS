import React, { useState, useEffect } from 'react';
import { useMySqlAuth } from '../../contexts/MySqlAuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, User, Save, X, ArrowLeft } from 'lucide-react';
import apiService from '../../services/apiService';

const FuncionariosManagement = () => {
  const { user, loading } = useMySqlAuth();
  const navigate = useNavigate();
  const [funcionarios, setFuncionarios] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    email: '',
    telefone: '',
    cpf: '',
    cargo: '',
    senha: '',
    confirmarSenha: '',
  });

  useEffect(() => {
    if (user?.id) {
      loadFuncionarios();
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Se ainda está carregando, mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando funcionários...</p>
        </div>
      </div>
    );
  }

  // Se não há usuário, mostrar mensagem
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">Você precisa estar logado como empresa para acessar esta página.</p>
          <a href="/empresa/login" className="text-blue-600 hover:text-blue-800">Fazer Login</a>
        </div>
      </div>
    );
  }

  const loadFuncionarios = async () => {
    if (!user?.id) return;
    try {
      setDataLoading(true);
      setError('');
      const response = await apiService.getMeusFuncionarios();
      setFuncionarios(response?.data || []);
    } catch (loadError) {
      setError(loadError.message || 'Não foi possível carregar os funcionários.');
      setFuncionarios([]);
    } finally {
      setDataLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.id) {
      alert('Usuário não encontrado. Faça login novamente.');
      return;
    }

    // Validação básica
    if (!formData.nome.trim() || !formData.sobrenome.trim()) {
      alert('Nome e sobrenome são obrigatórios.');
      return;
    }

    if (!formData.telefone.trim()) {
      alert('Telefone é obrigatório.');
      return;
    }

    if (!formData.email.trim()) {
      alert('E-mail é obrigatório.');
      return;
    }

    if (!formData.cpf.trim()) {
      alert('CPF é obrigatório.');
      return;
    }

    if (!formData.cargo.trim()) {
      alert('Cargo é obrigatório.');
      return;
    }

    // Validação básica do CPF (11 dígitos)
    const cpfNumbers = formData.cpf.replace(/[^\d]/g, '');
    if (cpfNumbers.length !== 11) {
      alert('CPF deve ter 11 dígitos.');
      return;
    }

    // Validação de senha (apenas para novos funcionários)
    if (!editingFuncionario) {
      if (!formData.senha.trim()) {
        alert('Senha é obrigatória para novos funcionários.');
        return;
      }

      if (formData.senha.length < 8) {
        alert('A senha deve ter pelo menos 8 caracteres.');
        return;
      }

      if (formData.senha !== formData.confirmarSenha) {
        alert('As senhas não coincidem.');
        return;
      }
    }
    
    const funcionarioData = {
      nome: `${formData.nome.trim()} ${formData.sobrenome.trim()}`,
      email: formData.email.trim(),
      telefone: formData.telefone.trim(),
      cpf: cpfNumbers,
      cargo: formData.cargo.trim(),
      ...(formData.senha.trim() ? { senha: formData.senha.trim() } : {})
    };

    try {
      setSaving(true);
      setError('');
      if (editingFuncionario) {
        await apiService.updateMeuFuncionario(editingFuncionario.id, funcionarioData);
      } else {
        await apiService.createMeuFuncionario(funcionarioData);
      }
      await loadFuncionarios();
      resetForm();
    } catch (saveError) {
      setError(saveError.message || 'Não foi possível salvar o funcionário.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      sobrenome: '',
      email: '',
      telefone: '',
      cpf: '',
      cargo: '',
      senha: '',
      confirmarSenha: ''
    });
    setEditingFuncionario(null);
    setShowModal(false);
  };

  const handleEdit = (funcionario) => {
    if (!funcionario) return;
    
    setEditingFuncionario(funcionario);
    const partesNome = String(funcionario.nome || '').trim().split(/\s+/);
    setFormData({
      nome: partesNome.shift() || '',
      sobrenome: partesNome.join(' '),
      email: funcionario.email || '',
      telefone: funcionario.telefone || '',
      cpf: funcionario.cpf || '',
      cargo: funcionario.cargo || '',
      senha: '', // Não mostrar senha na edição
      confirmarSenha: ''
    });
    setShowModal(true);
  };

  const handleDelete = async (funcionarioId) => {
    if (!funcionarioId) return;
    
    if (window.confirm('Tem certeza que deseja desativar este funcionário?')) {
      try {
        setError('');
        await apiService.deleteMeuFuncionario(funcionarioId);
        await loadFuncionarios();
      } catch (deleteError) {
        setError(deleteError.message || 'Não foi possível desativar o funcionário.');
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestão de Funcionários</h1>
              <p className="mt-2 text-gray-600">
                Gerencie os funcionários da sua empresa
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Funcionário
            </button>
          </div>
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

        {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {/* Funcionários List */}
        <div className="bg-white shadow rounded-lg">
          {dataLoading ? (
            <div className="py-12 text-center text-sm text-gray-500">Carregando funcionários...</div>
          ) : funcionarios.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <User className="h-full w-full" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum funcionário cadastrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comece adicionando funcionários para sua empresa.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Funcionário
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Funcionário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telefone/WhatsApp
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {funcionarios.map((funcionario) => (
                    <tr key={funcionario.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {funcionario.foto || funcionario.foto_url || funcionario.url_foto_perfil ? (
                              <img 
                                src={funcionario.foto || funcionario.foto_url || funcionario.url_foto_perfil} 
                                alt={funcionario.nome_completo || funcionario.nome}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {funcionario.nome}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{funcionario.telefone || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(funcionario)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(funcionario.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingFuncionario ? 'Editar Funcionário' : 'Novo Funcionário'}
                  </h3>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nome}
                        onChange={(e) => setFormData({...formData, nome: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nome"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sobrenome *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.sobrenome}
                        onChange={(e) => setFormData({...formData, sobrenome: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Sobrenome"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="funcionario@empresa.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone/WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.telefone}
                      onChange={(e) => setFormData({...formData, telefone: e.target.value.replace(/[^\d]/g, '')})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="11999999999"
                      maxLength="11"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CPF *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.cpf}
                      onChange={(e) => {
                        let value = e.target.value.replace(/[^\d]/g, '');
                        if (value.length <= 11) {
                          // Formatar CPF: 000.000.000-00
                          value = value.replace(/(\d{3})(\d)/, '$1.$2');
                          value = value.replace(/(\d{3})(\d)/, '$1.$2');
                          value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                          setFormData({...formData, cpf: value});
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="000.000.000-00"
                      maxLength="14"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cargo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.cargo}
                      onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Recepcionista, Barbeiro, Manicure"
                    />
                  </div>

                  {/* Campos de senha - apenas para novos funcionários */}
                  {!editingFuncionario && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Senha *
                        </label>
                        <input
                          type="password"
                          required
                          value={formData.senha}
                          onChange={(e) => setFormData({...formData, senha: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Mínimo 6 caracteres"
                          minLength="6"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirmar Senha *
                        </label>
                        <input
                          type="password"
                          required
                          value={formData.confirmarSenha}
                          onChange={(e) => setFormData({...formData, confirmarSenha: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Digite a senha novamente"
                        />
                      </div>
                    </>
                  )}

                  <p className="rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-700">
                    A foto pode ser adicionada pelo funcionário no próprio perfil após o primeiro acesso.
                  </p>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Salvando...' : editingFuncionario ? 'Atualizar' : 'Criar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FuncionariosManagement;

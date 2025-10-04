import React, { useState, useEffect } from 'react';
import { useLocalAuth } from '../contexts/LocalAuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, User, Save, X, ArrowLeft } from 'lucide-react';

const FuncionariosManagement = () => {
  const { user, loading } = useLocalAuth();
  const navigate = useNavigate();
  const [funcionarios, setFuncionarios] = useState([]);
  
  console.log('FuncionariosManagement - user:', user, 'loading:', loading);
  const [showModal, setShowModal] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    telefone: '',
    cpf: '',
    cargo: '',
    foto: null
  });

  useEffect(() => {
    if (user?.id) {
      loadFuncionarios();
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Se ainda está carregando, mostrar loading
  if (loading) {
    console.log('FuncionariosManagement - Mostrando loading...');
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
    console.log('FuncionariosManagement - Nenhum usuário encontrado');
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

  const loadFuncionarios = () => {
    if (!user?.id) return;
    try {
      // Simular carregamento de funcionários do localStorage
      const funcionariosData = JSON.parse(localStorage.getItem(`funcionarios_${user.id}`) || '[]');
      setFuncionarios(funcionariosData);
    } catch (error) {
      console.error('Erro ao carregar funcionários do localStorage:', error);
      setFuncionarios([]);
    }
  };

  const saveFuncionarios = (newFuncionarios) => {
    if (!user?.id) return;
    try {
      localStorage.setItem(`funcionarios_${user.id}`, JSON.stringify(newFuncionarios));
      setFuncionarios(newFuncionarios);
    } catch (error) {
      console.error('Erro ao salvar funcionários no localStorage:', error);
    }
  };

  const handleSubmit = (e) => {
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
    
    const funcionarioData = {
      id: editingFuncionario?.id || Date.now().toString(),
      nome_completo: `${formData.nome.trim()} ${formData.sobrenome.trim()}`,
      nome: formData.nome.trim(),
      sobrenome: formData.sobrenome.trim(),
      telefone: formData.telefone.trim(),
      cpf: cpfNumbers,
      cargo: formData.cargo.trim(),
      foto: formData.foto,
      empresa_id: user.id,
      created_at: editingFuncionario?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    let newFuncionarios;
    if (editingFuncionario) {
      newFuncionarios = funcionarios.map(f => f.id === editingFuncionario.id ? funcionarioData : f);
    } else {
      newFuncionarios = [...funcionarios, funcionarioData];
    }

    saveFuncionarios(newFuncionarios);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      sobrenome: '',
      telefone: '',
      cpf: '',
      cargo: '',
      foto: null
    });
    setEditingFuncionario(null);
    setShowModal(false);
  };

  const handleEdit = (funcionario) => {
    if (!funcionario) return;
    
    setEditingFuncionario(funcionario);
    setFormData({
      nome: funcionario.nome || '',
      sobrenome: funcionario.sobrenome || '',
      telefone: funcionario.telefone || '',
      cpf: funcionario.cpf || '',
      cargo: funcionario.cargo || '',
      foto: funcionario.foto || null
    });
    setShowModal(true);
  };

  const handleDelete = (funcionarioId) => {
    if (!funcionarioId) return;
    
    if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
      const newFuncionarios = funcionarios.filter(f => f.id !== funcionarioId);
      saveFuncionarios(newFuncionarios);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
      }

      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Arquivo muito grande. Máximo 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          foto: e.target.result
        }));
      };
      reader.onerror = () => {
        alert('Erro ao ler o arquivo. Tente novamente.');
      };
      reader.readAsDataURL(file);
    }
  };

  console.log('FuncionariosManagement - Renderizando componente principal');
  
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

        {/* Funcionários List */}
        <div className="bg-white shadow rounded-lg">
          {funcionarios.length === 0 ? (
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
                            {funcionario.foto ? (
                              <img 
                                src={funcionario.foto} 
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
                              {funcionario.nome_completo || `${funcionario.nome} ${funcionario.sobrenome}`}
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Foto do Funcionário (opcional)
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        {formData.foto ? (
                          <div className="flex flex-col items-center">
                            <img 
                              src={formData.foto} 
                              alt="Preview" 
                              className="h-20 w-20 rounded-full object-cover mb-2"
                            />
                            <button
                              type="button"
                              onClick={() => setFormData({...formData, foto: null})}
                              className="text-sm text-red-600 hover:text-red-800"
                            >
                              Remover foto
                            </button>
                          </div>
                        ) : (
                          <div>
                            <User className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                <span>Adicionar foto</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileChange}
                                  className="sr-only"
                                />
                              </label>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG até 5MB</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

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
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {editingFuncionario ? 'Atualizar' : 'Criar'}
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


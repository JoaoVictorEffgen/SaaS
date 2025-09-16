import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ImageUpload from '../shared/ImageUpload';

const EmpresaCadastro = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  const addError = (field, message) => {
    setErrors(prev => ({
      ...prev,
      [field]: message
    }));
  };

  const clearErrors = () => {
    setErrors({});
  };
  
  const [formData, setFormData] = useState({
    razaoSocial: '',
    cnpj: '',
    email: '',
    telefone: '',
    endereco: '',
    especializacao: '',
    descricao_servico: '',
    whatsapp_contato: '',
    logo_url: '',
    horario_inicio: '',
    horario_fim: '',
    dias_funcionamento: [],
    plano: 'free'
  });

  const handleLogoChange = (url) => {
    setFormData(prev => ({ ...prev, logo_url: url }));
  };

  const diasSemana = [
    { valor: 0, nome: 'Domingo' },
    { valor: 1, nome: 'Segunda-feira' },
    { valor: 2, nome: 'Terça-feira' },
    { valor: 3, nome: 'Quarta-feira' },
    { valor: 4, nome: 'Quinta-feira' },
    { valor: 5, nome: 'Sexta-feira' },
    { valor: 6, nome: 'Sábado' }
  ];

  const handleNumericInput = (value) => {
    return value.replace(/[^\d]/g, '');
  };

  const handleDiaChange = (dia) => {
    setFormData(prev => ({
      ...prev,
      dias_funcionamento: prev.dias_funcionamento.includes(dia)
        ? prev.dias_funcionamento.filter(d => d !== dia)
        : [...prev.dias_funcionamento, dia].sort()
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validações
    const validationErrors = {};
    
    if (!formData.razaoSocial.trim()) validationErrors.razaoSocial = 'Razão social é obrigatória';
    if (!formData.cnpj.trim()) validationErrors.cnpj = 'CNPJ é obrigatório';
    if (!formData.email.trim()) validationErrors.email = 'Email é obrigatório';
    if (!formData.telefone.trim()) validationErrors.telefone = 'Telefone é obrigatório';
    if (!formData.especializacao.trim()) validationErrors.especializacao = 'Especialização é obrigatória';
    if (!formData.horario_inicio) validationErrors.horario_inicio = 'Horário de início é obrigatório';
    if (!formData.horario_fim) validationErrors.horario_fim = 'Horário de fim é obrigatório';
    if (formData.dias_funcionamento.length === 0) validationErrors.dias_funcionamento = 'Selecione pelo menos um dia de funcionamento';
    
    // Limpar erros anteriores
    clearErrors();
    
    // Validar campos individuais
    Object.keys(validationErrors).forEach(key => {
      addError(key, validationErrors[key]);
    });

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      clearErrors();
      
      // Criar nova empresa
      const novaEmpresa = {
        id: Date.now().toString(),
        nome: formData.razaoSocial,
        email: formData.email,
        telefone: formData.telefone,
        whatsapp_contato: formData.whatsapp_contato,
        especializacao: formData.especializacao,
        descricao_servico: formData.descricao_servico,
        logo_url: formData.logo_url,
        horario_inicio: formData.horario_inicio,
        horario_fim: formData.horario_fim,
        dias_funcionamento: formData.dias_funcionamento,
        notaMedia: 0,
        totalAvaliacoes: 0,
        funcionarios: [],
        created_at: new Date().toISOString()
      };

      // Salvar empresa
      const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
      empresas.push(novaEmpresa);
      localStorage.setItem('empresas', JSON.stringify(empresas));

      // Auto-login após cadastro
      localStorage.setItem('empresaLogada', JSON.stringify(novaEmpresa));
      
      alert('Empresa cadastrada com sucesso! Redirecionando para o dashboard...');
      navigate('/empresa/dashboard');
      
    } catch (error) {
      console.error('Erro no cadastro:', error);
      alert('Erro ao cadastrar empresa. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🏢 Cadastro de Empresa</h1>
            <p className="text-gray-600">Preencha os dados da sua empresa</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Informações Básicas</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Razão Social *</label>
                  <input
                    type="text"
                    value={formData.razaoSocial}
                    onChange={(e) => setFormData({...formData, razaoSocial: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nome da empresa"
                  />
                  {errors.razaoSocial && <p className="text-red-500 text-sm mt-1">{errors.razaoSocial}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CNPJ *</label>
                  <input
                    type="text"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({...formData, cnpj: handleNumericInput(e.target.value)})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="00.000.000/0000-00"
                    maxLength="14"
                  />
                  {errors.cnpj && <p className="text-red-500 text-sm mt-1">{errors.cnpj}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="empresa@exemplo.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefone *</label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => setFormData({...formData, telefone: handleNumericInput(e.target.value)})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(11) 99999-9999"
                    maxLength="11"
                  />
                  {errors.telefone && <p className="text-red-500 text-sm mt-1">{errors.telefone}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                <input
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Rua, número, bairro, cidade"
                />
              </div>
            </div>

            {/* Especialização e Serviços */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Especialização e Serviços</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Especialização *</label>
                <input
                  type="text"
                  value={formData.especializacao}
                  onChange={(e) => setFormData({...formData, especializacao: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Consultoria, Estética, Saúde..."
                />
                {errors.especializacao && <p className="text-red-500 text-sm mt-1">{errors.especializacao}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição dos Serviços</label>
                <textarea
                  value={formData.descricao_servico}
                  onChange={(e) => setFormData({...formData, descricao_servico: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Descreva os serviços oferecidos pela sua empresa..."
                />
              </div>
            </div>

            {/* Contato WhatsApp */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Contato WhatsApp</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp para Contato</label>
                <input
                  type="tel"
                  value={formData.whatsapp_contato}
                  onChange={(e) => setFormData({...formData, whatsapp_contato: handleNumericInput(e.target.value)})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(11) 99999-9999"
                  maxLength="11"
                />
              </div>
            </div>

            {/* Logo da Empresa */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Logo da Empresa</h2>
              
              <ImageUpload
                value={formData.logo_url}
                onChange={handleLogoChange}
                placeholder="Clique para fazer upload do logo da empresa"
              />
            </div>

            {/* Horário de Funcionamento */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Horário de Funcionamento</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Horário de Início *</label>
                  <input
                    type="time"
                    value={formData.horario_inicio}
                    onChange={(e) => setFormData({...formData, horario_inicio: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.horario_inicio && <p className="text-red-500 text-sm mt-1">{errors.horario_inicio}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Horário de Fim *</label>
                  <input
                    type="time"
                    value={formData.horario_fim}
                    onChange={(e) => setFormData({...formData, horario_fim: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.horario_fim && <p className="text-red-500 text-sm mt-1">{errors.horario_fim}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dias de Funcionamento *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {diasSemana.map((dia) => (
                    <label key={dia.valor} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.dias_funcionamento.includes(dia.valor)}
                        onChange={() => handleDiaChange(dia.valor)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">{dia.nome}</span>
                    </label>
                  ))}
                </div>
                {errors.dias_funcionamento && <p className="text-red-500 text-sm mt-1">{errors.dias_funcionamento}</p>}
              </div>
            </div>

            {/* Botões */}
            <div className="flex space-x-4 pt-6">
              <Link
                to="/"
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Cadastrar Empresa
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmpresaCadastro;
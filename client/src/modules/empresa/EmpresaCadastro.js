import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMySqlAuth } from '../../contexts/MySqlAuthContext';

const EmpresaCadastro = () => {
  const navigate = useNavigate();
  const { register } = useMySqlAuth();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
    senha: '',
    confirmarSenha: '',
    telefone: '',
    endereco: '',
    cep: '',
    cidade: '',
    estado: '',
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamanho do arquivo (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert('Arquivo muito grande. Tamanho máximo permitido: 10MB');
        return;
      }

      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Tipo de arquivo não permitido. Use apenas imagens (JPEG, PNG, GIF, WEBP)');
        return;
      }

      try {
        console.log('📤 Enviando arquivo:', file.name, 'Tamanho:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
        
        // Criar FormData para upload
        const formData = new FormData();
        formData.append('logo', file);

        // Fazer upload para o servidor
        const response = await fetch('http://localhost:5000/api/upload/logo', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Erro na resposta:', errorText);
          throw new Error(`Erro no servidor: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          // Salvar a URL da imagem no estado
          handleLogoChange(result.url);
          console.log('✅ Logo enviado com sucesso:', result.url);
        } else {
          throw new Error(result.error || 'Erro no upload');
        }
      } catch (error) {
        console.error('❌ Erro no upload:', error);
        alert(`Erro ao fazer upload do logo: ${error.message}`);
      }
    }
  };

  const buscarCep = async (cep) => {
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            cidade: data.localidade || '',
            estado: data.uf || '',
            endereco: prev.endereco || `${data.logradouro || ''}, ${data.bairro || ''}`.trim()
          }));
        }
      } catch (error) {
        console.log('Erro ao buscar CEP:', error);
      }
    }
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
    if (!formData.senha.trim()) validationErrors.senha = 'Senha é obrigatória';
    if (formData.senha.length < 6) validationErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    if (!formData.confirmarSenha.trim()) validationErrors.confirmarSenha = 'Confirmação de senha é obrigatória';
    if (formData.senha !== formData.confirmarSenha) validationErrors.confirmarSenha = 'As senhas não coincidem';
    if (!formData.telefone.trim()) validationErrors.telefone = 'Telefone é obrigatório';
    if (!formData.cep.trim()) validationErrors.cep = 'CEP é obrigatório';
    if (!formData.cidade.trim()) validationErrors.cidade = 'Cidade é obrigatória';
    if (!formData.estado.trim()) validationErrors.estado = 'Estado é obrigatório';
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
      setLoading(true);
      clearErrors();
      
      // Dados para enviar ao backend
      const empresaData = {
        razaoSocial: formData.razaoSocial,
        email: formData.email,
        senha: formData.senha,
        telefone: formData.telefone,
        cnpj: formData.cnpj,
        endereco: formData.endereco,
        cep: formData.cep,
        cidade: formData.cidade,
        estado: formData.estado,
        especializacao: formData.especializacao,
        horario_inicio: formData.horario_inicio,
        horario_fim: formData.horario_fim,
        dias_funcionamento: formData.dias_funcionamento,
        logo_url: formData.logo_url,
        whatsapp_contato: formData.whatsapp_contato,
        descricao_servico: formData.descricao_servico
      };

      // Registrar empresa via backend
      const result = await register(empresaData);
      
      if (result && result.success) {
        alert('Empresa cadastrada com sucesso! Redirecionando para o dashboard...');
        navigate('/empresa/dashboard');
      } else {
        alert('Erro ao cadastrar empresa. Verifique os dados e tente novamente.');
      }
      
    } catch (error) {
      console.error('Erro no cadastro:', error);
      alert('Erro ao cadastrar empresa. Tente novamente.');
    } finally {
      setLoading(false);
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Senha *</label>
                  <input
                    type="password"
                    value={formData.senha}
                    onChange={(e) => setFormData({...formData, senha: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mínimo 6 caracteres"
                  />
                  {errors.senha && <p className="text-red-500 text-sm mt-1">{errors.senha}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Senha *</label>
                  <input
                    type="password"
                    value={formData.confirmarSenha}
                    onChange={(e) => setFormData({...formData, confirmarSenha: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digite a senha novamente"
                  />
                  {errors.confirmarSenha && <p className="text-red-500 text-sm mt-1">{errors.confirmarSenha}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                <input
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Rua, número, bairro"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CEP *</label>
                  <input
                    type="text"
                    value={formData.cep}
                    onChange={(e) => {
                      const cep = handleNumericInput(e.target.value);
                      setFormData({...formData, cep});
                      buscarCep(cep);
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="00000-000"
                    maxLength="8"
                  />
                  {errors.cep && <p className="text-red-500 text-sm mt-1">{errors.cep}</p>}
                  <p className="text-xs text-gray-500 mt-1">Digite o CEP para preenchimento automático</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cidade *</label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nome da cidade"
                  />
                  {errors.cidade && <p className="text-red-500 text-sm mt-1">{errors.cidade}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado *</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione o estado</option>
                    <option value="AC">Acre</option>
                    <option value="AL">Alagoas</option>
                    <option value="AP">Amapá</option>
                    <option value="AM">Amazonas</option>
                    <option value="BA">Bahia</option>
                    <option value="CE">Ceará</option>
                    <option value="DF">Distrito Federal</option>
                    <option value="ES">Espírito Santo</option>
                    <option value="GO">Goiás</option>
                    <option value="MA">Maranhão</option>
                    <option value="MT">Mato Grosso</option>
                    <option value="MS">Mato Grosso do Sul</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="PA">Pará</option>
                    <option value="PB">Paraíba</option>
                    <option value="PR">Paraná</option>
                    <option value="PE">Pernambuco</option>
                    <option value="PI">Piauí</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="RN">Rio Grande do Norte</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="RO">Rondônia</option>
                    <option value="RR">Roraima</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="SP">São Paulo</option>
                    <option value="SE">Sergipe</option>
                    <option value="TO">Tocantins</option>
                  </select>
                  {errors.estado && <p className="text-red-500 text-sm mt-1">{errors.estado}</p>}
                </div>
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
              
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-colors"
                >
                  {formData.logo_url ? (
                    <img
                      src={formData.logo_url}
                      alt="Logo da empresa"
                      className="max-w-full max-h-full object-contain rounded"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="text-2xl mb-2">📸</div>
                      <span className="text-gray-500">Clique para fazer upload do logo</span>
                    </div>
                  )}
                </label>
              </div>
              {formData.logo_url && (
                <p className="text-green-600 text-sm">✅ Logo carregado com sucesso!</p>
              )}
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
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Cadastrando...' : 'Cadastrar Empresa'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmpresaCadastro;
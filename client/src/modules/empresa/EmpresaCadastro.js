import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, CheckCircle2, ImagePlus, Trash2, Upload } from 'lucide-react';
import { useMySqlAuth } from '../../contexts/MySqlAuthContext';
import apiService from '../../services/apiService';

const ALLOWED_LOGO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_LOGO_SIZE = 5 * 1024 * 1024;

const EmpresaCadastro = () => {
  const navigate = useNavigate();
  const { register } = useMySqlAuth();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const logoInputRef = useRef(null);
  
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
    horario_inicio: '',
    horario_fim: '',
    dias_funcionamento: [],
    plano: 'free'
  });

  useEffect(() => () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
  }, [logoPreview]);

  const selectLogo = (file) => {
    setErrors(prev => ({ ...prev, logo: undefined }));

    if (!file) return;
    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      setErrors(prev => ({ ...prev, logo: 'Escolha uma imagem JPG, PNG ou WebP.' }));
      return;
    }
    if (file.size > MAX_LOGO_SIZE) {
      setErrors(prev => ({ ...prev, logo: 'A imagem deve ter no máximo 5MB.' }));
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    setErrors(prev => ({ ...prev, logo: undefined }));
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleFileUpload = (event) => {
    selectLogo(event.target.files?.[0]);
  };

  const handleLogoDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    if (!loading) selectLogo(event.dataTransfer.files?.[0]);
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

  const formatCnpj = (value) => handleNumericInput(value)
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');

  const formatPhone = (value) => handleNumericInput(value)
    .slice(0, 11)
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');

  const formatCep = (value) => handleNumericInput(value)
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, '$1-$2');

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
    if (formData.cnpj.length !== 14) validationErrors.cnpj = 'Informe os 14 dígitos do CNPJ';
    if (!formData.email.trim()) validationErrors.email = 'Email é obrigatório';
    if (!formData.senha.trim()) validationErrors.senha = 'Senha é obrigatória';
    if (formData.senha.length < 8) validationErrors.senha = 'Senha deve ter pelo menos 8 caracteres';
    if (!formData.confirmarSenha.trim()) validationErrors.confirmarSenha = 'Confirmação de senha é obrigatória';
    if (formData.senha !== formData.confirmarSenha) validationErrors.confirmarSenha = 'As senhas não coincidem';
    if (!formData.telefone.trim()) validationErrors.telefone = 'Telefone é obrigatório';
    if (!formData.cep.trim()) validationErrors.cep = 'CEP é obrigatório';
    if (!formData.cidade.trim()) validationErrors.cidade = 'Cidade é obrigatória';
    if (!formData.estado.trim()) validationErrors.estado = 'Estado é obrigatório';
    if (!formData.especializacao.trim()) validationErrors.especializacao = 'Especialização é obrigatória';
    if (!formData.horario_inicio) validationErrors.horario_inicio = 'Horário de início é obrigatório';
    if (!formData.horario_fim) validationErrors.horario_fim = 'Horário de fim é obrigatório';
    if (formData.horario_inicio && formData.horario_fim && formData.horario_inicio >= formData.horario_fim) {
      validationErrors.horario_fim = 'O encerramento deve ser depois do horário de início';
    }
    if (formData.dias_funcionamento.length === 0) validationErrors.dias_funcionamento = 'Selecione pelo menos um dia de funcionamento';
    setErrors(validationErrors);
    setSubmitMessage('');

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      setSubmitMessage('Criando sua conta e o perfil da empresa...');
      
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
        tipo: 'empresa',
        whatsapp_contato: formData.whatsapp_contato,
        descricao_servico: formData.descricao_servico
      };

      // Registrar empresa via backend
      const result = await register(empresaData);
      
      if (result && result.success) {
        let logoWarning = '';

        if (logoFile && result.empresa?.id) {
          setSubmitMessage('Conta criada. Salvando a logo da empresa...');
          try {
            await apiService.uploadCompanyLogo(result.empresa.id, logoFile);
          } catch (logoError) {
            logoWarning = ' A conta foi criada, mas a logo não pôde ser enviada agora. Você poderá adicioná-la nas configurações.';
          }
        }

        alert(`Empresa cadastrada com sucesso!${logoWarning}`);
        navigate('/empresa/dashboard');
      } else {
        setSubmitMessage('');
        setErrors(prev => ({ ...prev, submit: result?.error || 'Não foi possível cadastrar a empresa.' }));
      }
      
    } catch (error) {
      console.error('Erro no cadastro:', error);
      setSubmitMessage('');
      setErrors(prev => ({ ...prev, submit: error.message || 'Não foi possível cadastrar a empresa.' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-6 sm:py-10 dark:from-slate-950 dark:via-slate-950 dark:to-blue-950">
      <div className="max-w-3xl mx-auto px-4">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-blue-700 dark:text-slate-300 dark:hover:text-cyan-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o início
        </Link>

        <div className="rounded-2xl border border-white/70 bg-white p-6 shadow-xl shadow-slate-900/10 sm:p-8 dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <Building2 className="h-6 w-6" />
            </div>
            <span className="mb-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              Cadastro gratuito
            </span>
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Cadastro de Empresa</h1>
            <p className="max-w-lg text-gray-600 dark:text-slate-300">Configure os dados que seus clientes verão ao procurar e agendar seus serviços.</p>
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
                    value={formatCnpj(formData.cnpj)}
                    onChange={(e) => setFormData({...formData, cnpj: handleNumericInput(e.target.value)})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="00.000.000/0000-00"
                    maxLength="18"
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
                    value={formatPhone(formData.telefone)}
                    onChange={(e) => setFormData({...formData, telefone: handleNumericInput(e.target.value)})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(11) 99999-9999"
                    maxLength="15"
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
                    placeholder="Mínimo 8 caracteres"
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
                    value={formatCep(formData.cep)}
                    onChange={(e) => {
                      const cep = handleNumericInput(e.target.value);
                      setFormData({...formData, cep});
                      buscarCep(cep);
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="00000-000"
                    maxLength="9"
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
                  value={formatPhone(formData.whatsapp_contato)}
                  onChange={(e) => setFormData({...formData, whatsapp_contato: handleNumericInput(e.target.value)})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(11) 99999-9999"
                  maxLength="15"
                />
              </div>
            </div>

            {/* Logo da Empresa */}
            <div className="space-y-4">
              <div className="flex items-end justify-between gap-4 border-b pb-2">
                <h2 className="text-xl font-semibold text-gray-900">Logo da Empresa</h2>
                <span className="text-xs font-semibold text-gray-500">Opcional</span>
              </div>

              <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[140px_1fr] dark:border-slate-700 dark:bg-slate-800/60">
                <div className="flex h-32 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Prévia da logo da empresa" className="h-full w-full object-contain p-3" />
                  ) : (
                    <div className="text-center text-slate-400">
                      <ImagePlus className="mx-auto h-8 w-8" />
                      <span className="mt-2 block text-xs">Sem logo</span>
                    </div>
                  )}
                </div>

                <div
                  onDragEnter={(event) => { event.preventDefault(); setDragActive(true); }}
                  onDragOver={(event) => event.preventDefault()}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleLogoDrop}
                  className={`flex min-h-32 flex-col justify-center rounded-xl border-2 border-dashed p-4 transition-colors ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40'
                      : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900'
                  }`}
                >
                  <p className="font-semibold text-slate-800 dark:text-white">
                    {logoFile ? logoFile.name : 'Arraste a imagem ou selecione um arquivo'}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">JPG, PNG ou WebP, até 5MB. Recomendado: imagem quadrada.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileUpload}
                      className="sr-only"
                      id="logo-upload"
                      disabled={loading}
                    />
                    <label
                      htmlFor="logo-upload"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                      <Upload className="h-4 w-4" />
                      {logoFile ? 'Trocar imagem' : 'Selecionar imagem'}
                    </label>
                    {logoFile && (
                      <button
                        type="button"
                        onClick={removeLogo}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {errors.logo && <p className="text-sm text-red-500">{errors.logo}</p>}
              {logoFile && !errors.logo && (
                <p className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  A logo será enviada com segurança após a criação da empresa.
                </p>
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
            {errors.submit && (
              <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                {errors.submit}
              </div>
            )}
            {loading && submitMessage && (
              <p role="status" className="text-center text-sm font-medium text-blue-700 dark:text-cyan-300">{submitMessage}</p>
            )}
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
                {loading ? 'Finalizando cadastro...' : 'Cadastrar Empresa'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmpresaCadastro;

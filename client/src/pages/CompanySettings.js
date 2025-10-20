import React, { useState, useEffect } from 'react';
import { useMySqlAuth } from '../contexts/MySqlAuthContext';
import { Calendar, Clock, Save, Building, Upload, Image } from 'lucide-react';
import apiService from '../services/apiService';
import EmpresaLogoUpload from '../components/EmpresaLogoUpload';
import EmpresaLogoSistemaUpload from '../components/EmpresaLogoSistemaUpload';
import EmpresaLogoHeader from '../components/EmpresaLogoHeader';

const CompanySettings = () => {
  const { user, updateUser } = useMySqlAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [empresaData, setEmpresaData] = useState(null);

  const [configuracoes, setConfiguracoes] = useState({
    dias_trabalho: [1, 2, 3, 4, 5], // Segunda a Sexta padrão
    horario_inicio: '08:00',
    horario_fim: '18:00',
    duracao_padrao: 60,
    intervalo_agendamento: 30,
    notificacoes_email: true,
    notificacoes_whatsapp: false
  });

  const diasSemana = [
    { valor: 0, nome: 'Domingo' },
    { valor: 1, nome: 'Segunda-feira' },
    { valor: 2, nome: 'Terça-feira' },
    { valor: 3, nome: 'Quarta-feira' },
    { valor: 4, nome: 'Quinta-feira' },
    { valor: 5, nome: 'Sexta-feira' },
    { valor: 6, nome: 'Sábado' }
  ];

  useEffect(() => {
    const carregarConfiguracoes = async () => {
      if (user && user.tipo === 'empresa') {
        try {
          // Buscar empresa associada ao usuário
          const empresas = await apiService.getEmpresas();
          const empresa = empresas.find(e => e.user_id === user.id);
          
          if (empresa) {
            console.log('⚙️ Carregando configurações existentes:', empresa);
            setEmpresaData(empresa);
            
            if (empresa.horario_funcionamento) {
              setConfiguracoes(prev => ({
                ...prev,
                ...empresa.horario_funcionamento
              }));
            }
          }
        } catch (error) {
          console.error('Erro ao carregar configurações:', error);
        }
      }
    };
    
    carregarConfiguracoes();
  }, [user]);

  const handleDiaChange = (dia) => {
    setConfiguracoes(prev => {
      const dias = prev.dias_trabalho.includes(dia)
        ? prev.dias_trabalho.filter(d => d !== dia)
        : [...prev.dias_trabalho, dia].sort();
      
      return { ...prev, dias_trabalho: dias };
    });
  };

  const handleImagemFundoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      window.alert('❌ A imagem deve ter no máximo 5MB');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      window.alert('❌ Por favor, selecione apenas imagens (JPG, PNG, GIF)');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Iniciando upload da imagem de fundo...');
      
      const formData = new FormData();
      formData.append('imagem', file);

      const token = localStorage.getItem('token');
      if (!token) {
        window.alert('❌ Token de autenticação não encontrado. Faça login novamente.');
        return;
      }

      const response = await fetch('/api/upload/imagem-fundo', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📡 Resposta do servidor:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Imagem de fundo enviada:', result);
        
        // Atualizar dados da empresa
        setEmpresaData(prev => ({
          ...prev,
          imagem_fundo_url: result.url
        }));
        
        // Mostrar feedback de sucesso
        window.alert('🎉 Imagem de fundo atualizada com sucesso!\n\nA imagem já está sendo exibida na área do cliente.');
        
        // Limpar o input para permitir upload da mesma imagem novamente
        event.target.value = '';
      } else {
        const error = await response.json();
        console.error('❌ Erro na resposta:', error);
        window.alert(`❌ Erro ao enviar imagem:\n${error.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('❌ Erro ao enviar imagem:', error);
      window.alert(`❌ Erro de conexão:\n${error.message}\n\nVerifique sua conexão e tente novamente.`);
    } finally {
      setLoading(false);
    }
  };


  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Validar configurações
      if (configuracoes.dias_trabalho.length === 0) {
        alert('Selecione pelo menos um dia de trabalho');
        return;
      }

      if (configuracoes.horario_inicio >= configuracoes.horario_fim) {
        alert('Horário de início deve ser anterior ao horário de fim');
        return;
      }

      if (configuracoes.duracao_padrao <= 0) {
        alert('Duração padrão deve ser maior que zero');
        return;
      }

      // Atualizar configurações
      const resultado = await updateUser({ configuracoes });
      
      if (resultado.success) {
        setSaved(true);
        alert('Configurações salvas com sucesso!');
        
        // Redirecionar para o dashboard da empresa após 2 segundos
        setTimeout(() => {
          window.location.href = '/empresa/dashboard';
        }, 2000);
      } else {
        alert('Erro ao salvar: ' + (resultado.error || 'Erro desconhecido'));
      }
      
    } catch (error) {
      alert('Erro ao salvar configurações: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Configurações da Empresa</h1>
                <p className="text-gray-600">Configure seus horários de funcionamento</p>
              </div>
            </div>
            <EmpresaLogoHeader showText={false} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Dias de Trabalho */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Calendar className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Dias de Trabalho</h3>
              </div>
              
              <div className="space-y-3">
                {diasSemana.map((dia) => (
                  <label key={dia.valor} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={configuracoes.dias_trabalho.includes(dia.valor)}
                      onChange={() => handleDiaChange(dia.valor)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-gray-700">{dia.nome}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Horário de Funcionamento */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Clock className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Horário de Funcionamento</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horário de Início
                  </label>
                  <input
                    type="time"
                    value={configuracoes.horario_inicio}
                    onChange={(e) => setConfiguracoes(prev => ({ ...prev, horario_inicio: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horário de Fim
                  </label>
                  <input
                    type="time"
                    value={configuracoes.horario_fim}
                    onChange={(e) => setConfiguracoes(prev => ({ ...prev, horario_fim: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Configurações de Agendamento */}
          <div className="mt-8 bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações de Agendamento</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duração Padrão (minutos)
                </label>
                <input
                  type="number"
                  min="15"
                  max="480"
                  step="15"
                  value={configuracoes.duracao_padrao}
                  onChange={(e) => setConfiguracoes(prev => ({ ...prev, duracao_padrao: parseInt(e.target.value) }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="60"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Duração padrão de cada agendamento
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intervalo entre Agendamentos (minutos)
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  step="15"
                  value={configuracoes.intervalo_agendamento}
                  onChange={(e) => setConfiguracoes(prev => ({ ...prev, intervalo_agendamento: parseInt(e.target.value) }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="30"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Intervalo entre um agendamento e outro
                </p>
              </div>
            </div>
          </div>

          {/* Notificações */}
          <div className="mt-8 bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notificações</h3>
            
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={configuracoes.notificacoes_email}
                  onChange={(e) => setConfiguracoes(prev => ({ ...prev, notificacoes_email: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-gray-700">Receber notificações por email</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={configuracoes.notificacoes_whatsapp}
                  onChange={(e) => setConfiguracoes(prev => ({ ...prev, notificacoes_whatsapp: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-gray-700">Receber notificações por WhatsApp</span>
              </label>
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="mt-8 text-center">
            <button
              onClick={handleSave}
              disabled={loading}
              className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                saved ? 'bg-green-600 hover:bg-green-700' : ''
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : saved ? (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Configurações Salvas!
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Salvar Configurações
                </>
              )}
            </button>
          </div>
        </div>

        {/* Logo da Empresa */}
        {empresaData && (
          <EmpresaLogoUpload
            empresaId={empresaData.id}
            currentLogo={empresaData.logo_url}
            onLogoUpload={(url) => {
              setEmpresaData(prev => ({ ...prev, logo_url: url }));
            }}
            loading={loading}
          />
        )}

        {/* Logo do Sistema (White Label) */}
        {empresaData && (
          <EmpresaLogoSistemaUpload
            empresaId={empresaData.id}
            currentLogoSistema={empresaData.logo_sistema}
            onLogoSistemaUpload={(url) => {
              setEmpresaData(prev => ({ ...prev, logo_sistema: url }));
            }}
            loading={loading}
          />
        )}

        {/* Imagem de Fundo */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Image className="h-6 w-6 mr-3 text-blue-600" />
            Plano de Fundo da Empresa
          </h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Image className="h-5 w-5 text-blue-600 mt-0.5" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Como aparece para os clientes
                </h3>
                <p className="mt-1 text-sm text-blue-700">
                  Esta imagem será exibida como plano de fundo do card da sua empresa na área do cliente, 
                  tornando sua empresa mais atrativa e profissional.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Upload da Imagem de Fundo
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2 font-medium">Arraste uma imagem aqui ou clique para selecionar</p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>📷 Formatos aceitos: JPG, PNG, GIF</p>
                  <p>📏 Tamanho máximo: 5MB</p>
                  <p>🎨 Recomendado: 800x600px ou superior</p>
                  <p>💡 Dica: Use imagens com boa qualidade e contraste</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="imagem-fundo"
                  onChange={handleImagemFundoUpload}
                  disabled={loading}
                />
                <label
                  htmlFor="imagem-fundo"
                  className={`mt-6 inline-block px-6 py-3 rounded-lg font-medium transition-colors ${
                    loading 
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                  }`}
                >
                  {loading ? 'Enviando...' : 'Selecionar Imagem'}
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preview da Imagem
              </label>
              <div className="h-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                {empresaData?.imagem_fundo_url ? (
                  <div className="relative h-full">
                    <img
                      src={empresaData.imagem_fundo_url}
                      alt="Preview da imagem de fundo"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                      <div className="bg-white bg-opacity-90 px-4 py-2 rounded-lg">
                        <p className="text-sm font-medium text-gray-800">Sua empresa</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Image className="h-16 w-16 mx-auto mb-3 text-gray-300" />
                      <p className="font-medium">Nenhuma imagem selecionada</p>
                      <p className="text-sm mt-1">Faça upload de uma imagem para personalizar seu card</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-3 text-sm text-gray-600">
                <p>✅ Esta imagem aparecerá como fundo do card da sua empresa</p>
                <p>✅ Melhora a apresentação visual para os clientes</p>
                <p>✅ Deixa sua empresa mais profissional e atrativa</p>
              </div>
            </div>
          </div>
        </div>

        {/* Preview dos Horários */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📅 Preview dos Horários Disponíveis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dias de Trabalho</h3>
              <div className="space-y-2">
                {configuracoes.dias_trabalho.length > 0 ? (
                  configuracoes.dias_trabalho
                    .sort()
                    .map(dia => diasSemana[dia])
                    .map(dia => (
                      <div key={dia.valor} className="flex items-center text-gray-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        {dia.nome}
                      </div>
                    ))
                ) : (
                  <p className="text-gray-500">Nenhum dia selecionado</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Horários Gerados</h3>
              <div className="text-sm text-gray-600">
                <p><strong>Funcionamento:</strong> {configuracoes.horario_inicio} - {configuracoes.horario_fim}</p>
                <p><strong>Duração:</strong> {configuracoes.duracao_padrao} minutos</p>
                <p><strong>Intervalo:</strong> {configuracoes.intervalo_agendamento} minutos</p>
                <p><strong>Total de slots:</strong> {Math.floor((new Date(`2000-01-01T${configuracoes.horario_fim}`) - new Date(`2000-01-01T${configuracoes.horario_inicio}`)) / (1000 * 60 * (configuracoes.duracao_padrao + configuracoes.intervalo_agendamento)))}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySettings;

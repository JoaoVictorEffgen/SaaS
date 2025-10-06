import React, { useState, useEffect } from 'react';
import { useMySqlAuth } from '../contexts/MySqlAuthContext';
import { Calendar, Clock, Save, Building } from 'lucide-react';

const CompanySettings = () => {
  const { user, updateUser } = useMySqlAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

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
    if (user) {
      // Carregar configurações existentes
      const userConfigs = user.configuracoes || {};
      setConfiguracoes(prev => ({
        ...prev,
        ...userConfigs
      }));
    }
  }, [user]);

  const handleDiaChange = (dia) => {
    setConfiguracoes(prev => {
      const dias = prev.dias_trabalho.includes(dia)
        ? prev.dias_trabalho.filter(d => d !== dia)
        : [...prev.dias_trabalho, dia].sort();
      
      return { ...prev, dias_trabalho: dias };
    });
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
      const resultado = updateUser({ configuracoes });
      
      if (resultado.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
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
          <div className="flex items-center mb-6">
            <Building className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Configurações da Empresa</h1>
              <p className="text-gray-600">Configure seus horários de funcionamento</p>
            </div>
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

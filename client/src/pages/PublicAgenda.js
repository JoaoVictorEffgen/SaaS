import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import availabilityService from '../services/availabilityService';
import { utils } from '../services/api';

const PublicAgenda = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [showQuickBooking, setShowQuickBooking] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const [quickBooking, setQuickBooking] = useState({
    nome: '',
    email: '',
    telefone: '',
    data: '',
    hora: ''
  });
  
  const [signupData, setSignupData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });

  // Função para validar data não retroativa
  const validateFutureDate = (date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setErrors(prev => ({
        ...prev,
        data: 'Data não pode ser no passado'
      }));
      return false;
    }
    
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.data;
      return newErrors;
    });
    return true;
  };

  useEffect(() => {
    // Buscar dados da empresa
    const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
    const empresaEncontrada = empresas.find(e => e.id === userId);
    
    if (empresaEncontrada) {
      setEmpresa(empresaEncontrada);
      setUser({
        id: userId,
        nome: empresaEncontrada.razaoSocial,
        empresa: empresaEncontrada.razaoSocial,
        especialidade: empresaEncontrada.especializacao || 'Serviços'
      });
    } else {
      // Fallback para dados mock se não encontrar empresa
      setUser({
        id: userId,
        nome: 'Dr. João Silva',
        empresa: 'Consultoria Silva',
        especialidade: 'Psicologia'
      });
      setEmpresa({
        id: userId,
        razaoSocial: 'Consultoria Silva',
        especializacao: 'Psicologia',
        configuracoes: {
          dias_trabalho: [1, 2, 3, 4, 5],
          horario_inicio: '09:00',
          horario_fim: '17:00',
          duracao_padrao: 45,
          intervalo_agendamento: 15
        }
      });
    }
  }, [userId]);

  // Buscar horários disponíveis quando a data mudar
  useEffect(() => {
    if (selectedDate && empresa) {
      const slots = availabilityService.getAvailableSlots(empresa.id, selectedDate);
      const formattedSlots = availabilityService.formatAvailableSlots(slots);
      setAvailableSlots(formattedSlots);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate, empresa]);

  const handleDateChange = (date) => {
    if (!validateFutureDate(date)) return;
    
    setSelectedDate(date);
    setQuickBooking(prev => ({ ...prev, data: date, hora: '' }));
  };

  const isCompanyOpenOnDate = (date) => {
    if (!empresa) return false;
    return availabilityService.isCompanyOpen(empresa.id, date);
  };

  const getNextAvailableDate = () => {
    if (!empresa) return null;
    return availabilityService.getNextAvailableDate(empresa.id);
  };

  const handleQuickBooking = async (e) => {
    e.preventDefault();
    
    if (!quickBooking.nome || !quickBooking.email || !quickBooking.data || !quickBooking.hora) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    try {
      setLoading(true);
      
      // Encontrar o slot selecionado
      const selectedSlot = availableSlots.find(slot => slot.inicio === quickBooking.hora);
      if (!selectedSlot) {
        alert('Horário não disponível!');
        return;
      }

      // Criar agendamento
      const agendamento = availabilityService.reserveTimeSlot(
        empresa.id,
        quickBooking.data,
        selectedSlot.inicio,
        selectedSlot.fim,
        {
          nome: quickBooking.nome,
          email: quickBooking.email,
          telefone: quickBooking.telefone
        }
      );

      alert(`Agendamento realizado com sucesso!\n\nData: ${quickBooking.data}\nHorário: ${selectedSlot.display}\n\nVocê receberá uma confirmação por email.`);
      
      setShowQuickBooking(false);
      setQuickBooking({ nome: '', email: '', telefone: '', data: '', hora: '' });
      setSelectedDate('');
      
    } catch (error) {
      alert(`Erro ao realizar agendamento: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user || !empresa) return <div>Carregando...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Agendar com {user.nome}
          </h1>
          <p className="text-xl text-gray-600 mb-2">{user.empresa}</p>
          <p className="text-lg text-gray-500">{user.especialidade}</p>
        </div>

        {/* Seleção de Data */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📅 Escolha uma data</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data do agendamento
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.data ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.data && <p className="text-red-500 text-sm mt-1">{errors.data}</p>}
              
              {/* Informações da empresa */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">ℹ️ Informações da empresa</h4>
                <p className="text-sm text-gray-600">
                  <strong>Dias de trabalho:</strong> {empresa.configuracoes?.dias_trabalho?.map(d => ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][d]).slice(0, 5).join(', ')}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Horário de funcionamento:</strong> {empresa.configuracoes?.horario_inicio} - {empresa.configuracoes?.horario_fim}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Duração padrão:</strong> {empresa.configuracoes?.duracao_padrao} minutos
                </p>
              </div>
            </div>

            {/* Horários disponíveis */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                ⏰ Horários disponíveis
              </h3>
              
              {selectedDate ? (
                isCompanyOpenOnDate(selectedDate) ? (
                  availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => setQuickBooking(prev => ({ ...prev, hora: slot.inicio }))}
                          className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                            quickBooking.hora === slot.inicio
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                          }`}
                        >
                          {slot.display}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-2">Nenhum horário disponível nesta data</p>
                      <p className="text-sm text-gray-400">Tente outra data ou entre em contato conosco</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-2">Empresa não trabalha nesta data</p>
                    {getNextAvailableDate() && (
                      <button
                        onClick={() => handleDateChange(getNextAvailableDate())}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Ver próximo dia disponível
                      </button>
                    )}
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Selecione uma data para ver os horários disponíveis</p>
                </div>
              )}
            </div>
          </div>

          {/* Botão de agendamento */}
          {selectedDate && availableSlots.length > 0 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowQuickBooking(true)}
                className="bg-green-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Agendar Horário
              </button>
            </div>
          )}
        </div>

        {/* Modal Agendamento Rápido */}
        {showQuickBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Agendamento Rápido</h3>
              <form onSubmit={handleQuickBooking}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome completo *</label>
                    <input
                      type="text"
                      value={quickBooking.nome}
                      onChange={(e) => setQuickBooking({...quickBooking, nome: e.target.value})}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={quickBooking.email}
                      onChange={(e) => setQuickBooking({...quickBooking, email: e.target.value})}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefone (opcional)</label>
                    <input
                      type="tel"
                      value={quickBooking.telefone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d]/g, '');
                        setQuickBooking({...quickBooking, telefone: value});
                      }}
                      className="w-full p-2 border rounded"
                      placeholder="Apenas números (11987654321)"
                      maxLength="11"
                    />
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">
                      <strong>Data:</strong> {quickBooking.data}<br/>
                      <strong>Horário:</strong> {quickBooking.hora}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowQuickBooking(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50"
                  >
                    {loading ? 'Confirmando...' : 'Confirmar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicAgenda; 
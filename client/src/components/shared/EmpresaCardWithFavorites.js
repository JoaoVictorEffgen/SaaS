import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart, MapPin, Clock, Users, Calendar, CheckCircle } from 'lucide-react';
import { isFavorite, toggleFavorite } from '../../services/favoritesService';
import { formatDistance } from '../../utils/geolocation';
import { useLocalAuth } from '../../contexts/LocalAuthContext';
import localStorageService from '../../services/localStorageService';

const EmpresaCardWithFavorites = ({ empresa, userLocation, showDistance = true }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [agendamentoStatus, setAgendamentoStatus] = useState(null);
  const { user: currentUser } = useLocalAuth();
  const navigate = useNavigate();

  const checkAgendamentoStatus = useCallback(() => {
    if (!currentUser || currentUser.tipo !== 'cliente') {
      setAgendamentoStatus(null);
      return;
    }

    const agendamentos = localStorageService.getAgendamentos();
    
    // Buscar agendamentos ativos (não concluídos) com esta empresa
    const agendamentosAtivos = agendamentos.filter(agendamento => 
      agendamento.clienteEmail === currentUser.email && 
      agendamento.empresa_id === empresa.id &&
      (agendamento.status === 'agendado' || agendamento.status === 'confirmado') &&
      agendamento.status !== 'realizado' && 
      agendamento.status !== 'concluido' &&
      agendamento.status !== 'cancelado'
    );

    if (agendamentosAtivos.length > 0) {
      const temConfirmado = agendamentosAtivos.some(ag => ag.status === 'confirmado');
      setAgendamentoStatus(temConfirmado ? 'confirmado' : 'agendado');
    } else {
      setAgendamentoStatus(null);
    }
  }, [currentUser, empresa.id]);

  useEffect(() => {
    setIsFavorited(isFavorite(empresa.id));
    checkAgendamentoStatus();
  }, [empresa.id, currentUser, checkAgendamentoStatus]);

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newStatus = toggleFavorite(empresa.id);
    setIsFavorited(newStatus);
  };

  const handleBookingClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // A verificação de login já foi feita antes de chegar nesta tela
    // Se o usuário chegou aqui, ele já está logado como cliente
    
    // Se já tem agendamento confirmado, não permitir novo agendamento
    if (agendamentoStatus === 'confirmado') {
      return;
    }
    
    // Se tem agendamento pendente, mostrar mensagem ou permitir visualizar
    if (agendamentoStatus === 'agendado') {
      // Aqui você pode implementar uma lógica para visualizar o agendamento existente
      alert('Você já tem um agendamento pendente com esta empresa.');
      return;
    }
    
    // Redirecionar para a página de agendamento
    navigate(`/cliente/empresa/${empresa.id}`);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 relative">
      <div className="p-6">
        {/* Header com favorito */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {empresa.logo_url ? (
              <img 
                src={empresa.logo_url} 
                alt={`Logo ${empresa.nome}`}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {empresa.nome.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{empresa.nome}</h3>
              <p className="text-sm text-gray-600">{empresa.especializacao}</p>
            </div>
          </div>
          
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-full transition-all duration-200 ${
              isFavorited 
                ? 'bg-red-100 text-red-500 hover:bg-red-200' 
                : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-500'
            }`}
            title={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Avaliação */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="flex items-center space-x-1">
            {renderStars(empresa.notaMedia)}
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {empresa.notaMedia}
          </span>
          <span className="text-sm text-gray-500">
            ({empresa.totalAvaliacoes} avaliações)
          </span>
        </div>

        {/* Localização e distância */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{empresa.endereco}</span>
          </div>
          
          {showDistance && empresa.distancia && (
            <div className="flex items-center space-x-1 text-blue-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-semibold">
                {formatDistance(empresa.distancia)}
              </span>
            </div>
          )}
        </div>

        {/* Dias da semana */}
        <div className="flex items-center space-x-1 mb-3">
          <Calendar className="w-4 h-4 text-gray-500" />
          <div className="flex space-x-1">
            {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((dia, index) => (
              <span 
                key={index}
                className={`w-6 h-6 text-xs rounded-full flex items-center justify-center font-semibold ${
                  index < 5 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-500'
                }`}
                title={['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'][index]}
              >
                {dia}
              </span>
            ))}
          </div>
        </div>

        {/* Descrição do serviço */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {empresa.descricao_servico}
        </p>

        {/* Informações adicionais */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>
              {empresa.horario_inicio && empresa.horario_fim 
                ? `${empresa.horario_inicio} - ${empresa.horario_fim}`
                : 'Horário comercial'
              }
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{empresa.funcionarios?.length || 0} profissionais</span>
          </div>
        </div>

        {/* Botão de agendar */}
        <button 
          onClick={handleBookingClick}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-center transition-all duration-200 flex items-center justify-center space-x-2 ${
            agendamentoStatus === 'confirmado' 
              ? 'bg-green-600 text-white hover:bg-green-700 cursor-default'
              : agendamentoStatus === 'agendado'
              ? 'bg-yellow-600 text-white hover:bg-yellow-700 cursor-pointer'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 cursor-pointer'
          }`}
        >
          {agendamentoStatus === 'confirmado' ? (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Serviço Agendado</span>
            </>
          ) : agendamentoStatus === 'agendado' ? (
            <>
              <Clock className="w-5 h-5" />
              <span>Agendamento Pendente</span>
            </>
          ) : (
            <>
              <Calendar className="w-5 h-5" />
              <span>Agendar Serviço</span>
            </>
          )}
        </button>

        {/* Badge de favorito */}
        {isFavorited && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
            Favorito
          </div>
        )}
      </div>

    </div>
  );
};

export default EmpresaCardWithFavorites;

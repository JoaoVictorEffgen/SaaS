import React from 'react';
import { Clock, Phone, Mail, Users, Star, MessageCircle } from 'lucide-react';
import { formatWhatsAppLink, formatHorario, getDiasTrabalho } from '../../utils/formatters';

const EmpresaCard = ({ empresa, onSelect, showWhatsApp = true }) => {

  const handleWhatsAppClick = () => {
    if (empresa.whatsapp_contato) {
      const message = `Olá! Gostaria de agendar um serviço com ${empresa.nome || empresa.empresa}.`;
      const whatsappLink = formatWhatsAppLink(empresa.whatsapp_contato, message);
      window.open(whatsappLink, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Header com Logo como Background */}
      <div className={`relative h-32 overflow-hidden ${empresa.logo_url ? '' : 'bg-gradient-to-r from-blue-500 to-purple-600'}`}>
        {empresa.logo_url ? (
          <>
            {/* Logo como background principal */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${empresa.logo_url})` }}
            />
            {/* Overlay sutil apenas para melhorar legibilidade do texto */}
            <div className="absolute inset-0 bg-black/20" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-blue-600">
                {(empresa.nome || empresa.empresa || 'E').charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}
        
        {/* Badge de Especialização */}
        {empresa.especializacao && (
          <div className="absolute top-3 right-3">
            <span className="bg-white bg-opacity-90 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
              {empresa.especializacao}
            </span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-6">
        {/* Nome e Avaliação */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {empresa.nome || empresa.empresa || 'Empresa'}
          </h3>
          <div className="flex items-center">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${
                    i < Math.floor(empresa.notaMedia || 0) 
                      ? 'fill-current' 
                      : 'stroke-current fill-none'
                  }`} 
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {empresa.notaMedia ? empresa.notaMedia.toFixed(1) : 'N/A'} 
              ({empresa.totalAvaliacoes || 0} avaliações)
            </span>
          </div>
        </div>

        {/* Descrição */}
        {empresa.descricao_servico && (
          <div className="mb-4">
            <p className="text-gray-600 text-sm line-clamp-3">
              {empresa.descricao_servico}
            </p>
          </div>
        )}

        {/* Informações */}
        <div className="space-y-3 mb-6">
          {/* Horário de Funcionamento */}
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2 text-gray-400" />
            <div>
              <span className="font-medium">Horário:</span> {formatHorario(empresa)}
            </div>
          </div>

          {/* Dias de Trabalho */}
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2 text-gray-400" />
            <div>
              <span className="font-medium">Dias:</span> {getDiasTrabalho(empresa)}
            </div>
          </div>

          {/* Funcionários */}
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2 text-gray-400" />
            <div>
              <span className="font-medium">Funcionários:</span> {empresa.funcionarios?.length || 0} disponíveis
            </div>
          </div>

          {/* Contato */}
          {empresa.telefone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2 text-gray-400" />
              <span>{empresa.telefone}</span>
            </div>
          )}

          {empresa.email && (
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="h-4 w-4 mr-2 text-gray-400" />
              <span>{empresa.email}</span>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex space-x-3">
          <button
            onClick={() => onSelect(empresa)}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Agendar Serviço
          </button>
          
          {showWhatsApp && empresa.whatsapp_contato && (
            <button
              onClick={handleWhatsAppClick}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmpresaCard;

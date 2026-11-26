import React, { useState } from 'react';
import { MessageCircle, X, Send, Phone } from 'lucide-react';
import { formatTime } from '../../utils/formatters';

export const getCompanyChatLabel = (empresa) => {
  const name = String(empresa?.nome || empresa?.razaoSocial || '').trim();
  return name || 'Empresa';
};

export const getCompanyWhatsAppDigits = (empresa) =>
  String(empresa?.whatsapp || empresa?.whatsapp_contato || '').replace(/\D/g, '');

const WhatsAppChat = ({ empresa, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const companyName = getCompanyChatLabel(empresa);
  const whatsappDigits = getCompanyWhatsAppDigits(empresa);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'cliente',
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    setTimeout(() => {
      const autoReply = {
        id: (Date.now() + 1).toString(),
        text: `Olá! Recebemos sua mensagem. Nossa equipe entrará em contato em breve. Obrigado por escolher ${companyName}!`,
        sender: 'empresa',
        timestamp: new Date().toISOString(),
        status: 'delivered'
      };
      setMessages(prev => [...prev, autoReply]);
    }, 2000);
  };

  const handleWhatsAppRedirect = () => {
    if (!whatsappDigits) return;
    const message = `Olá! Gostaria de conversar sobre serviços da ${companyName}.`;
    window.open(`https://wa.me/55${whatsappDigits}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (!empresa) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-white rounded-lg shadow-2xl border border-gray-200">
      <div className="bg-green-500 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-green-500 font-bold text-sm">
              {companyName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-sm">{companyName}</h3>
            <p className="text-xs text-green-100">Online agora</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {whatsappDigits ? (
            <button
              onClick={handleWhatsAppRedirect}
              className="text-white hover:text-green-200 transition-colors"
              title="Abrir WhatsApp"
            >
              <Phone className="h-4 w-4" />
            </button>
          ) : null}
          <button
            onClick={() => {
              if (typeof onClose === 'function') onClose();
              else setIsMinimized(true);
            }}
            className="text-white hover:text-green-200 transition-colors"
            title="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="h-64 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm">
            <p>Inicie uma conversa com {companyName}</p>
            <p className="mt-1">Nossa equipe está pronta para ajudar!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'cliente' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                  message.sender === 'cliente'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p>{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'cliente' ? 'text-green-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          />
          <button
            onClick={handleSendMessage}
            className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        {whatsappDigits ? (
          <p className="text-xs text-gray-500 mt-2">
            Ou{' '}
            <button
              onClick={handleWhatsAppRedirect}
              className="text-green-500 hover:text-green-600 underline"
            >
              abra o WhatsApp
            </button>
            {' '}para conversar diretamente
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default WhatsAppChat;

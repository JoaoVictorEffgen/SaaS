import React, { useState, useEffect, useCallback } from 'react';
import { X, Send, MessageCircle, Phone, Mail } from 'lucide-react';

const EmpresaChatModal = ({ isOpen, onClose, cliente, empresa }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadMessages = useCallback(() => {
    const chatKey = `chat_${empresa.id}_${cliente.email}`;
    const savedMessages = JSON.parse(localStorage.getItem(chatKey) || '[]');
    setMessages(savedMessages);
  }, [empresa.id, cliente.email]);

  useEffect(() => {
    if (isOpen && cliente) {
      loadMessages();
    }
  }, [isOpen, cliente, loadMessages]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    
    const newMessage = {
      id: Date.now(),
      from: 'empresa',
      to: cliente.email,
      message: message.trim(),
      timestamp: new Date().toISOString(),
      empresa: empresa.nome,
      cliente: cliente.nome || cliente.email
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);

    // Salvar no localStorage
    const chatKey = `chat_${empresa.id}_${cliente.email}`;
    localStorage.setItem(chatKey, JSON.stringify(updatedMessages));

    // Salvar histórico geral de mensagens
    const allMessages = JSON.parse(localStorage.getItem('empresa_messages') || '[]');
    allMessages.push(newMessage);
    localStorage.setItem('empresa_messages', JSON.stringify(allMessages));

    setMessage('');
    setLoading(false);

    // Simular notificação para o cliente (em um sistema real, seria via API)
    showNotificationToCliente(newMessage);
  };

  const showNotificationToCliente = (message) => {
    // Criar notificação para o cliente
    const notification = {
      id: Date.now(),
      type: 'empresa_message',
      title: `Nova mensagem de ${message.empresa}`,
      message: message.message,
      timestamp: message.timestamp,
      read: false,
      cliente: message.to
    };

    const notifications = JSON.parse(localStorage.getItem('cliente_notifications') || '[]');
    notifications.push(notification);
    localStorage.setItem('cliente_notifications', JSON.stringify(notifications));
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Chat com Cliente</h2>
              <p className="text-sm text-gray-600">{cliente.nome || cliente.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Cliente Info */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-semibold text-sm">
                {(cliente.nome || cliente.email).charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{cliente.nome || 'Cliente'}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  {cliente.email}
                </span>
                {cliente.telefone && (
                  <span className="flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {cliente.telefone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma mensagem ainda</p>
              <p className="text-sm">Inicie uma conversa com o cliente</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.from === 'empresa' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    msg.from === 'empresa'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p className={`text-xs mt-1 ${
                    msg.from === 'empresa' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex space-x-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Digite sua mensagem..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !message.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>Enviar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmpresaChatModal;

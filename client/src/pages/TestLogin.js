import React from 'react';
import { useLocalAuth } from '../contexts/LocalAuthContext';
import { useNavigate } from 'react-router-dom';

const TestLogin = () => {
  const { login } = useLocalAuth();
  const navigate = useNavigate();

  const handleQuickLogin = async () => {
    // Login com usuário de teste
    const result = await login('admin@agendapro.com', 'admin123');
    if (result.success) {
      console.log('Login bem-sucedido:', result.user);
      navigate('/funcionarios');
    } else {
      console.error('Erro no login:', result.error);
      alert('Erro no login: ' + result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Teste Rápido</h2>
        <p className="text-gray-600 mb-4">
          Clique no botão abaixo para fazer login automaticamente com uma empresa de teste e acessar a página de funcionários.
        </p>
        <button
          onClick={handleQuickLogin}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Login Automático
        </button>
        <div className="mt-4 text-sm text-gray-500">
          <p><strong>Email:</strong> admin@agendapro.com</p>
          <p><strong>Senha:</strong> admin123</p>
        </div>
      </div>
    </div>
  );
};

export default TestLogin;

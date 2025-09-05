import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLocalAuth } from '../contexts/LocalAuthContext';

const ClienteLogin = () => {
  const navigate = useNavigate();
  const { login } = useLocalAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerData, setRegisterData] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const result = await login(email, senha);
      if (result && result.success) {
        navigate('/cliente');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      alert('Email ou senha incorretos!');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    
    if (registerData.senha !== registerData.confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }
    
    const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
    
    // Verificar se email já existe
    if (clientes.find(c => c.email === registerData.email)) {
      alert('Este email já está cadastrado!');
      return;
    }
    
    const novoCliente = {
      id: Date.now().toString(),
      ...registerData,
      created_at: new Date().toISOString()
    };
    
    clientes.push(novoCliente);
    localStorage.setItem('clientes', JSON.stringify(clientes));
    localStorage.setItem('clienteLogado', JSON.stringify(novoCliente));
    
    alert('Conta criada com sucesso!');
    navigate('/cliente');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-96">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">👥 {isRegistering ? 'Cadastro' : 'Login'} Cliente</h1>
          <p className="text-gray-600">
            {isRegistering ? 'Crie sua conta para agendar serviços' : 'Acesse sua conta'}
          </p>
        </div>

        {!isRegistering ? (
          // Formulário de Login
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Sua senha"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Entrar
            </button>
          </form>
        ) : (
          // Formulário de Cadastro
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
              <input
                type="text"
                value={registerData.nome}
                onChange={(e) => setRegisterData({...registerData, nome: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
              <input
                type="tel"
                value={registerData.telefone}
                onChange={(e) => setRegisterData({...registerData, telefone: e.target.value.replace(/[^\d]/g, '')})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="(11) 99999-9999"
                maxLength="11"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <input
                type="password"
                value={registerData.senha}
                onChange={(e) => setRegisterData({...registerData, senha: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Mínimo 6 caracteres"
                minLength="6"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Senha</label>
              <input
                type="password"
                value={registerData.confirmarSenha}
                onChange={(e) => setRegisterData({...registerData, confirmarSenha: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Digite a senha novamente"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Criar Conta
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-green-600 hover:text-green-800 font-medium"
          >
            {isRegistering ? 'Já tem conta? Faça login' : 'Não tem conta? Cadastre-se'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm">
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClienteLogin;

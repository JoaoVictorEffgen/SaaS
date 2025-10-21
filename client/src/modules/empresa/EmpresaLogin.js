import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMySqlAuth } from '../../contexts/MySqlAuthContext';
import RecuperarSenha from '../../components/RecuperarSenha';

const EmpresaLogin = () => {
  const navigate = useNavigate();
  const { login } = useMySqlAuth();
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  const [loading, setLoading] = useState(false);
  const [showRecuperarSenha, setShowRecuperarSenha] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🔐 EmpresaLogin: Tentando login com:', formData.email);
      const result = await login(formData.email, formData.senha);
      console.log('🔐 EmpresaLogin: Resultado do login:', result);
      
      if (result && result.success) {
        console.log('✅ EmpresaLogin: Login bem-sucedido, navegando para dashboard');
        navigate('/empresa/dashboard');
      } else {
        console.log('❌ EmpresaLogin: Login falhou:', result);
        alert('Credenciais inválidas. Verifique email e senha.');
      }
    } catch (error) {
      console.error('❌ EmpresaLogin: Erro no login:', error);
      alert('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-96">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🏢 Login Empresa</h1>
          <p className="text-gray-600">Acesse sua conta empresarial</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="empresa@exemplo.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
            <input
              type="password"
              value={formData.senha}
              onChange={(e) => setFormData({...formData, senha: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Sua senha"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Link para recuperar senha */}
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowRecuperarSenha(true)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Esqueceu a senha?
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Não tem uma conta?{' '}
            <Link to="/empresa/cadastro" className="text-blue-600 hover:text-blue-800 font-medium">
              Cadastre-se
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm">
            ← Voltar ao início
          </Link>
        </div>
      </div>

      {/* Modal de recuperação de senha */}
      {showRecuperarSenha && (
        <RecuperarSenha
          tipoUsuario="empresa"
          onBack={() => setShowRecuperarSenha(false)}
        />
      )}
    </div>
  );
};

export default EmpresaLogin;

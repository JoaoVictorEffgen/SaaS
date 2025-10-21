import React, { useState } from 'react';
import { Eye, EyeOff, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import apiService from '../services/apiService';

const RecuperarSenha = ({ onBack, tipoUsuario = 'empresa' }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: Código, 3: Nova Senha
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Dados do formulário
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const tiposUsuario = {
    empresa: 'Empresa',
    cliente: 'Cliente',
    funcionario: 'Funcionário'
  };

  // Função para enviar código de recuperação
  const enviarCodigoRecuperacao = async () => {
    if (!email) {
      setError('Por favor, digite seu e-mail');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await apiService.post('/auth/recuperar-senha', {
        email,
        tipo: tipoUsuario
      });

      if (response.success) {
        setMessage('Código de recuperação enviado para seu e-mail!');
        setStep(2);
      } else {
        setError(response.message || 'Erro ao enviar código de recuperação');
      }
    } catch (error) {
      setError('Erro ao enviar código de recuperação. Tente novamente.');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para verificar código
  const verificarCodigo = async () => {
    if (!codigo) {
      setError('Por favor, digite o código de recuperação');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await apiService.post('/auth/verificar-codigo', {
        email,
        codigo,
        tipo: tipoUsuario
      });

      if (response.success) {
        setMessage('Código verificado com sucesso!');
        setStep(3);
      } else {
        setError(response.message || 'Código inválido');
      }
    } catch (error) {
      setError('Erro ao verificar código. Tente novamente.');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para redefinir senha
  const redefinirSenha = async () => {
    if (!novaSenha || !confirmarSenha) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    if (novaSenha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await apiService.post('/auth/redefinir-senha', {
        email,
        codigo,
        novaSenha,
        tipo: tipoUsuario
      });

      if (response.success) {
        setMessage('Senha redefinida com sucesso!');
        setTimeout(() => {
          onBack(); // Voltar para o login
        }, 2000);
      } else {
        setError(response.message || 'Erro ao redefinir senha');
      }
    } catch (error) {
      setError('Erro ao redefinir senha. Tente novamente.');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para reenviar código
  const reenviarCodigo = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await apiService.post('/auth/recuperar-senha', {
        email,
        tipo: tipoUsuario
      });

      if (response.success) {
        setMessage('Código reenviado com sucesso!');
      } else {
        setError(response.message || 'Erro ao reenviar código');
      }
    } catch (error) {
      setError('Erro ao reenviar código. Tente novamente.');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 rounded-full p-2 mr-3">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Recuperar Senha</h2>
                <p className="text-blue-100 text-sm">Redefina sua senha de acesso</p>
              </div>
            </div>
            <button
              onClick={onBack}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Mensagens */}
          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800 text-sm">{message}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          )}

          {/* Step 1: Email */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Digite seu e-mail
                </h3>
                <p className="text-gray-600 text-sm">
                  Enviaremos um código de recuperação para seu e-mail cadastrado
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu e-mail"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <button
                onClick={enviarCodigoRecuperacao}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Enviar Código'}
              </button>
            </div>
          )}

          {/* Step 2: Código */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Digite o código
                </h3>
                <p className="text-gray-600 text-sm">
                  Verifique seu e-mail e digite o código de 6 dígitos
                </p>
                <p className="text-blue-600 text-sm font-medium mt-1">
                  {email}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Recuperação *
                </label>
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
                  disabled={loading}
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={reenviarCodigo}
                  disabled={loading}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reenviar
                </button>
                <button
                  onClick={verificarCodigo}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Verificar
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Nova Senha */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nova Senha
                </h3>
                <p className="text-gray-600 text-sm">
                  Digite sua nova senha de acesso
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nova Senha *
                </label>
                <div className="relative">
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Digite sua nova senha"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {mostrarSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Nova Senha *
                </label>
                <div className="relative">
                  <input
                    type={mostrarConfirmarSenha ? 'text' : 'password'}
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="Confirme sua nova senha"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {mostrarConfirmarSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                onClick={redefinirSenha}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Redefinindo...' : 'Redefinir Senha'}
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 text-center">
            <button
              onClick={onBack}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              ← Voltar para o login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecuperarSenha;

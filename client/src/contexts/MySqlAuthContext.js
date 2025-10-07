import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/apiService';

const MySqlAuthContext = createContext();

export const useMySqlAuth = () => {
  const context = useContext(MySqlAuthContext);
  if (!context) {
    throw new Error('useMySqlAuth deve ser usado dentro de um MySqlAuthProvider');
  }
  return context;
};

export const MySqlAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState({
    plano: 'free',
    status: 'inativo',
    recursos: {
      whatsapp: false,
      relatorios: false,
      multiusuario: false
    }
  });

  // Carregar dados do MySQL na inicialização
  useEffect(() => {
    const loadUserFromToken = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        if (token) {
          apiService.setToken(token);
          
          // Buscar perfil do usuário via API
          const profile = await apiService.getProfile();
          if (profile) {
            setUser(profile);
            setSubscription({
              plano: profile.plano || 'free',
              status: 'ativo',
              recursos: {
                whatsapp: profile.plano !== 'free',
                relatorios: profile.plano !== 'free',
                multiusuario: profile.plano === 'business'
              }
            });
          }
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        // Se não conseguir carregar, limpar tudo
        apiService.logout();
      } finally {
        setLoading(false);
      }
    };

    loadUserFromToken();
  }, []);

  // Função para limpar erros
  const clearError = () => {
    setError(null);
  };

  // Login via MySQL
  const login = async (identifier, senha, tipo = null) => {
    try {
      setLoading(true);
      setError(null); // Limpar erros anteriores
      console.log('MySqlAuth - Login via MySQL:', identifier, tipo);
      
      const result = await apiService.login(identifier, senha, tipo);
      
      if (result && result.user) {
        const userData = result.user;
        setUser(userData);
        
        setSubscription({
          plano: userData.plano || 'free',
          status: 'ativo',
          recursos: {
            whatsapp: userData.plano !== 'free',
            relatorios: userData.plano !== 'free',
            multiusuario: userData.plano === 'business'
          }
        });
        
        console.log('✅ Login MySQL bem-sucedido:', userData);
        return { success: true, user: userData };
      } else {
        const errorMsg = result?.error || 'Credenciais inválidas';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error('❌ Erro no login MySQL:', error);
      const errorMsg = error.message || 'Erro ao fazer login';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Registro via MySQL
  const register = async (userData) => {
    try {
      setLoading(true);
      console.log('MySqlAuth - Registro via MySQL:', userData);
      
      const result = await apiService.register(userData);
      
      if (result && result.user) {
        setUser(result.user);
        setSubscription({
          plano: result.user.plano || 'free',
          status: 'ativo',
          recursos: {
            whatsapp: result.user.plano !== 'free',
            relatorios: result.user.plano !== 'free',
            multiusuario: result.user.plano === 'business'
          }
        });
        
        console.log('✅ Registro MySQL bem-sucedido:', result.user);
        return { success: true };
      } else {
        return { success: false, error: result?.error || 'Erro no registro' };
      }
    } catch (error) {
      console.error('❌ Erro no registro MySQL:', error);
      return { success: false, error: error.message || 'Erro ao registrar' };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    console.log('MySqlAuth - Logout via MySQL');
    apiService.logout();
    setUser(null);
    setSubscription({
      plano: 'free',
      status: 'inativo',
      recursos: {
        whatsapp: false,
        relatorios: false,
        multiusuario: false
      }
    });
  };

  const value = {
    user,
    loading,
    error,
    subscription,
    login,
    register,
    logout,
    clearError,
    apiService
  };

  return (
    <MySqlAuthContext.Provider value={value}>
      {children}
    </MySqlAuthContext.Provider>
  );
};

export default MySqlAuthContext;

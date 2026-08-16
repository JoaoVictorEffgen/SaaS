import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';
import { LOCAL_DEV, getLocalDevUser } from '../config/appConfig';

const MySqlAuthContext = createContext();

export const useMySqlAuth = () => {
  const context = useContext(MySqlAuthContext);
  if (!context) {
    throw new Error('useMySqlAuth deve ser usado dentro de um MySqlAuthProvider');
  }
  return context;
};

const getStoredDevUserType = () =>
  localStorage.getItem('localDevUserType') || 'empresa';

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

  const applySubscription = useCallback((userData) => {
    setSubscription({
      plano: userData?.plano || 'free',
      status: 'ativo',
      recursos: {
        whatsapp: userData?.plano !== 'free',
        relatorios: userData?.plano !== 'free',
        multiusuario: userData?.plano === 'business'
      }
    });
  }, []);

  const setLocalDevUser = useCallback((tipo = 'empresa') => {
    const devUser = getLocalDevUser(tipo);
    localStorage.setItem('localDevUserType', tipo);
    apiService.setDevUserType(tipo);
    setUser(devUser);
    applySubscription(devUser);
    setLoading(false);
    setError(null);
    return devUser;
  }, [applySubscription]);

  useEffect(() => {
    const loadUserFromToken = async () => {
      try {
        setLoading(true);

        if (LOCAL_DEV) {
          setLocalDevUser(getStoredDevUserType());
          return;
        }

        const token = apiService.getToken();

        if (token) {
          apiService.setToken(token);
          const profile = await apiService.getProfile();
          if (profile) {
            setUser(profile);
            applySubscription(profile);
          }
        }
      } catch (loadError) {
        console.error('Erro ao carregar perfil:', loadError);
        if (LOCAL_DEV) {
          setLocalDevUser(getStoredDevUserType());
        } else {
          apiService.logout();
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserFromToken();
  }, [applySubscription, setLocalDevUser]);

  const clearError = () => {
    setError(null);
  };

  const login = async (
    identifier,
    senha,
    tipo = null,
    companyIdentifier = null,
    rememberSession = true
  ) => {
    if (LOCAL_DEV) {
      const devUser = setLocalDevUser(tipo || 'empresa');
      return { success: true, user: devUser };
    }

    try {
      setLoading(true);
      setError(null);

      const result = await apiService.login(
        identifier,
        senha,
        tipo,
        companyIdentifier,
        rememberSession
      );

      if (result && result.user) {
        const userData = result.user;
        setUser(userData);
        applySubscription(userData);
        return { success: true, user: userData };
      }

      const errorMsg = result?.error || 'Credenciais inválidas';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } catch (loginError) {
      const errorMsg = loginError.message || 'Erro ao fazer login';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    if (LOCAL_DEV) {
      const devUser = setLocalDevUser(userData?.tipo || 'cliente');
      return { success: true, user: devUser };
    }

    try {
      setLoading(true);
      const result = await apiService.register(userData);

      if (result && result.user) {
        setUser(result.user);
        applySubscription(result.user);
        return { success: true };
      }

      return { success: false, error: result?.error || 'Erro no registro' };
    } catch (registerError) {
      return { success: false, error: registerError.message || 'Erro ao registrar' };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData) => {
    try {
      if (LOCAL_DEV) {
        setUser((prev) => ({ ...prev, ...userData }));
        return { success: true };
      }

      if (user && user.tipo === 'empresa') {
        const empresas = await apiService.getEmpresas();
        const empresa = empresas.find((e) => e.user_id === user.id);

        if (empresa) {
          const result = await apiService.updateEmpresa(empresa.id, userData);
          if (result) {
            setUser((prev) => ({ ...prev, ...userData }));
            return { success: true };
          }
        }
      }

      const result = await apiService.updateProfile(userData);
      if (result) {
        setUser((prev) => ({ ...prev, ...userData }));
        return { success: true };
      }

      return { success: false, error: 'Erro ao atualizar usuário' };
    } catch (updateError) {
      return { success: false, error: updateError.message || 'Erro ao atualizar usuário' };
    }
  };

  const logout = () => {
    if (LOCAL_DEV) {
      setLocalDevUser('empresa');
      return;
    }

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
    updateUser,
    logout,
    clearError,
    setLocalDevUser,
    localDev: LOCAL_DEV,
    apiService
  };

  return (
    <MySqlAuthContext.Provider value={value}>
      {children}
    </MySqlAuthContext.Provider>
  );
};

export default MySqlAuthContext;

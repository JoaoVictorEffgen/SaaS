import React, { createContext, useContext, useState, useEffect } from 'react';
import localStorageService from '../services/localStorageService';
import toast from 'react-hot-toast';

const LocalAuthContext = createContext();

export const useLocalAuth = () => {
  const context = useContext(LocalAuthContext);
  if (!context) {
    throw new Error('useLocalAuth deve ser usado dentro de um LocalAuthProvider');
  }
  return context;
};

export const LocalAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  // Verificar se usuário está logado ao carregar
  useEffect(() => {
    try {
      const currentUser = localStorageService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setSubscription({
          plano: currentUser.plano,
          status: 'ativo',
          recursos: {
            whatsapp: currentUser.plano !== 'free',
            relatorios: currentUser.plano !== 'free',
            multiusuario: currentUser.plano === 'business'
          }
        });
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Login
  const login = async (email, senha) => {
    try {
      setLoading(true);
      const result = localStorageService.login(email, senha);
      
      if (result) {
        setUser(result.user);
        setSubscription({
          plano: result.user.plano,
          status: 'ativo',
          recursos: {
            whatsapp: result.user.plano !== 'free',
            relatorios: result.user.plano !== 'free',
            multiusuario: result.user.plano === 'business'
          }
        });
        toast.success('Login realizado com sucesso!');
        return { success: true };
      } else {
        toast.error('E-mail ou senha incorretos');
        return { success: false, error: 'Credenciais inválidas' };
      }
    } catch (error) {
      toast.error('Erro ao fazer login');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Registro
  const register = async (userData) => {
    try {
      setLoading(true);
      
      // Verificar se email já existe
      const existingUser = localStorageService.getUserByEmail(userData.email);
      if (existingUser) {
        toast.error('E-mail já cadastrado');
        return { success: false, error: 'E-mail já cadastrado' };
      }

      const newUser = localStorageService.createUser(userData);
      const result = localStorageService.login(newUser.email, userData.senha);
      
      setUser(result.user);
      setSubscription({
        plano: result.user.plano,
        status: 'ativo',
        recursos: {
          whatsapp: result.user.plano !== 'free',
          relatorios: result.user.plano !== 'free',
          multiusuario: result.user.plano === 'business'
        }
      });
      
      toast.success('Conta criada com sucesso!');
      return { success: true };
    } catch (error) {
      toast.error('Erro ao criar conta');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorageService.logout();
    setUser(null);
    setSubscription(null);
    toast.success('Logout realizado com sucesso!');
  };

  // Atualizar usuário
  const updateUser = (updates) => {
    if (user) {
      const updatedUser = localStorageService.updateUser(user.id, updates);
      if (updatedUser) {
        setUser(updatedUser);
        localStorageService.updateUser(updatedUser.id, updatedUser);
        toast.success('Perfil atualizado com sucesso!');
        return { success: true };
      }
    }
    return { success: false };
  };

  // Verificar se tem plano específico
  const hasPlan = (planName) => {
    return subscription?.plano === planName;
  };

  // Verificar se pode fazer agendamento (plano free tem limite)
  const canMakeAppointment = () => {
    if (!user) return false;
    if (user.plano !== 'free') return true;
    
    const agendamentos = localStorageService.getAgendamentosByUser(user.id);
    return agendamentos.length < 10; // Limite do plano free
  };

  // Obter limite de agendamentos
  const getAppointmentLimit = () => {
    if (!user) return 0;
    if (user.plano !== 'free') return 'ilimitado';
    return 10;
  };

  // Obter agendamentos usados
  const getAppointmentsUsed = () => {
    if (!user) return 0;
    const agendamentos = localStorageService.getAgendamentosByUser(user.id);
    return agendamentos.length;
  };

  // Reset de dados (para desenvolvimento)
  const resetData = () => {
    localStorageService.clearAllData();
    setUser(null);
    setSubscription(null);
    toast.success('Dados resetados com sucesso!');
  };

  const value = {
    user,
    loading,
    subscription,
    login,
    register,
    logout,
    updateUser,
    hasPlan,
    canMakeAppointment,
    getAppointmentLimit,
    getAppointmentsUsed,
    resetData,
    isAuthenticated: !!user
  };

  return (
    <LocalAuthContext.Provider value={value}>
      {children}
    </LocalAuthContext.Provider>
  );
}; 
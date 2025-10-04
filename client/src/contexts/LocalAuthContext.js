import React, { createContext, useContext, useState, useEffect } from 'react';
import localStorageService from '../services/localStorageService';

const LocalAuthContext = createContext();

export const useLocalAuth = () => {
  const context = useContext(LocalAuthContext);
  if (!context) {
    console.error('useLocalAuth deve ser usado dentro de um LocalAuthProvider');
    // Retornar valores padrão em vez de lançar erro
    return {
      user: null,
      loading: true,
      subscription: null,
      login: () => Promise.resolve({ success: false }),
      register: () => Promise.resolve({ success: false }),
      logout: () => {},
      updateUser: () => ({ success: false }),
      hasPlan: () => false,
      canMakeAppointment: () => false,
      getAppointmentLimit: () => 0,
      getAppointmentsUsed: () => 0,
      resetData: () => {},
      isAuthenticated: false
    };
  }
  return context;
};

export const LocalAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  // Verificar se usuário está logado ao carregar
  useEffect(() => {
    const loadUser = () => {
      try {
        const currentUser = localStorageService.getCurrentUser();
        
        if (currentUser && currentUser.id) {
          setUser(currentUser);
          setSubscription({
            plano: currentUser.plano || 'business',
            status: 'ativo',
            recursos: {
              whatsapp: (currentUser.plano || 'business') !== 'free',
              relatorios: (currentUser.plano || 'business') !== 'free',
              multiusuario: (currentUser.plano || 'business') === 'business'
            }
          });
        } else {
          setUser(null);
          setSubscription(null);
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        setUser(null);
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    };

    // Carregar usuário inicial
    loadUser();

    // Escutar mudanças no localStorage
    const handleStorageChange = () => {
      console.log('🔄 Storage change detected, reloading user...');
      loadUser();
    };

    const handleUserLogin = (event) => {
      console.log('🔄 User login event detected, updating user...');
      setUser(event.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleUserLogin);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleUserLogin);
    };
  }, []);

  // Login
  const login = async (identifier, senha, tipo = null) => {
    try {
      setLoading(true);
      console.log('LocalAuthContext - Tentando login com:', identifier, 'tipo:', tipo);
      const result = localStorageService.login(identifier, senha);
      console.log('LocalAuthContext - Resultado do login:', result);
      
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
        // Removido o toast.success - deixar para o componente decidir
        return { success: true, user: result.user };
      } else {
        // Removido o toast.error - deixar para o componente decidir
        return { success: false, error: 'Credenciais inválidas' };
      }
    } catch (error) {
      // Removido o toast.error - deixar para o componente decidir
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
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      console.log('🚪 Iniciando logout do contexto...');
      
      // Limpar estados do contexto primeiro
      setUser(null);
      setSubscription(null);
      setLoading(true);
      
      // Limpar localStorage (sem reload automático)
      localStorageService.logout();
      
      console.log('✅ Logout do contexto realizado com sucesso');
      
    } catch (error) {
      console.error('❌ Erro durante logout do contexto:', error);
      // Mesmo com erro, limpar os estados
      setUser(null);
      setSubscription(null);
      setLoading(false);
      
      // Forçar limpeza completa
      localStorage.clear();
      sessionStorage.clear();
    }
  };

  // Atualizar usuário
  const updateUser = (updates) => {
    if (user) {
      const updatedUser = localStorageService.updateUser(user.id, updates);
      if (updatedUser) {
        setUser(updatedUser);
        localStorageService.updateUser(updatedUser.id, updatedUser);
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
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
      sessions: { empresa: null, funcionario: null, cliente: null },
      login: () => Promise.resolve({ success: false }),
      register: () => Promise.resolve({ success: false }),
      logout: () => {},
      switchToSession: () => ({ success: false }),
      getEmpresaData: () => null,
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
  const [sessions, setSessions] = useState({
    empresa: null,
    funcionario: null,
    cliente: null
  });

  // Verificar se usuário está logado ao carregar
  useEffect(() => {
    const loadUser = () => {
      try {
        // Carregar todas as sessões
        const empresaSession = localStorage.getItem('empresaSession');
        const funcionarioSession = localStorage.getItem('funcionarioSession');
        const clienteSession = localStorage.getItem('clienteSession');
        
        const loadedSessions = {
          empresa: empresaSession ? JSON.parse(empresaSession) : null,
          funcionario: funcionarioSession ? JSON.parse(funcionarioSession) : null,
          cliente: clienteSession ? JSON.parse(clienteSession) : null
        };
        
        setSessions(loadedSessions);
        
        // Determinar usuário ativo (prioridade: empresa > funcionario > cliente)
        let activeUser = null;
        if (loadedSessions.empresa) {
          activeUser = loadedSessions.empresa;
        } else if (loadedSessions.funcionario) {
          activeUser = loadedSessions.funcionario;
        } else if (loadedSessions.cliente) {
          activeUser = loadedSessions.cliente;
        }
        
        if (activeUser && activeUser.id) {
          setUser(activeUser);
          setSubscription({
            plano: activeUser.plano || 'business',
            status: 'ativo',
            recursos: {
              whatsapp: (activeUser.plano || 'business') !== 'free',
              relatorios: (activeUser.plano || 'business') !== 'free',
              multiusuario: (activeUser.plano || 'business') === 'business'
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
        setSessions({ empresa: null, funcionario: null, cliente: null });
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
      
      if (result && result.user) {
        const userData = result.user;
        
        // Salvar em sessão específica baseada no tipo
        const sessionKey = `${userData.tipo}Session`;
        localStorage.setItem(sessionKey, JSON.stringify(userData));
        
        // Atualizar estado das sessões
        const newSessions = { ...sessions };
        newSessions[userData.tipo] = userData;
        setSessions(newSessions);
        
        // Definir como usuário ativo
        setUser(userData);
        setSubscription({
          plano: userData.plano,
          status: 'ativo',
          recursos: {
            whatsapp: userData.plano !== 'free',
            relatorios: userData.plano !== 'free',
            multiusuario: userData.plano === 'business'
          }
        });
        
        console.log('✅ Sessão salva para tipo:', userData.tipo);
        return { success: true, user: userData };
      } else {
        return { success: false, error: 'Credenciais inválidas' };
      }
    } catch (error) {
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
  const logout = async (tipoUsuario = null) => {
    try {
      console.log('🚪 Iniciando logout do contexto...');
      
      if (tipoUsuario) {
        // Logout específico de um tipo de usuário
        console.log(`🚪 Fazendo logout específico do tipo: ${tipoUsuario}`);
        
        // Remover sessão específica
        localStorage.removeItem(`${tipoUsuario}Session`);
        
        // Atualizar estado das sessões
        const newSessions = { ...sessions };
        newSessions[tipoUsuario] = null;
        setSessions(newSessions);
        
        // Se o usuário ativo era do tipo que está fazendo logout, trocar para outro
        if (user && user.tipo === tipoUsuario) {
          let newActiveUser = null;
          
          // Prioridade: empresa > funcionario > cliente
          if (newSessions.empresa) {
            newActiveUser = newSessions.empresa;
          } else if (newSessions.funcionario) {
            newActiveUser = newSessions.funcionario;
          } else if (newSessions.cliente) {
            newActiveUser = newSessions.cliente;
          }
          
          if (newActiveUser) {
            setUser(newActiveUser);
            setSubscription({
              plano: newActiveUser.plano || 'business',
              status: 'ativo',
              recursos: {
                whatsapp: (newActiveUser.plano || 'business') !== 'free',
                relatorios: (newActiveUser.plano || 'business') !== 'free',
                multiusuario: (newActiveUser.plano || 'business') === 'business'
              }
            });
            console.log(`✅ Troca automática para usuário ativo: ${newActiveUser.tipo}`);
          } else {
            setUser(null);
            setSubscription(null);
            console.log('✅ Nenhum usuário ativo restante');
          }
        }
      } else {
        // Logout completo (comportamento original)
        setUser(null);
        setSubscription(null);
        setSessions({ empresa: null, funcionario: null, cliente: null });
        localStorageService.logout();
      }
      
      setLoading(false);
      console.log('✅ Logout do contexto realizado com sucesso');
      
    } catch (error) {
      console.error('❌ Erro durante logout do contexto:', error);
      setUser(null);
      setSubscription(null);
      setSessions({ empresa: null, funcionario: null, cliente: null });
      setLoading(false);
    }
  };

  // Trocar para uma sessão específica
  const switchToSession = (tipoUsuario) => {
    if (sessions[tipoUsuario]) {
      const sessionUser = sessions[tipoUsuario];
      setUser(sessionUser);
      setSubscription({
        plano: sessionUser.plano || 'business',
        status: 'ativo',
        recursos: {
          whatsapp: (sessionUser.plano || 'business') !== 'free',
          relatorios: (sessionUser.plano || 'business') !== 'free',
          multiusuario: (sessionUser.plano || 'business') === 'business'
        }
      });
      console.log(`✅ Trocado para sessão: ${tipoUsuario}`);
      return { success: true, user: sessionUser };
    }
    return { success: false, error: `Sessão ${tipoUsuario} não encontrada` };
  };

  // Obter dados da empresa para funcionário
  const getEmpresaData = () => {
    if (user && user.tipo === 'funcionario' && user.empresa_id) {
      // Buscar dados da empresa
      const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
      const empresa = empresas.find(emp => emp.id === user.empresa_id);
      return empresa;
    }
    return null;
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
    sessions,
    login,
    register,
    logout,
    switchToSession,
    getEmpresaData,
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
import React, { useEffect } from 'react';
import { useMySqlAuth } from '../../contexts/MySqlAuthContext';
import { useNavigate } from 'react-router-dom';

const TypedProtectedRoute = ({ children, allowedTypes = [] }) => {
  const { user, loading } = useMySqlAuth();
  const navigate = useNavigate();
  
  // 🧪 MODO TESTE: Desabilitar proteções de tipo de usuário
  const TEST_MODE = true; // Altere para false em produção
  
  console.log('TypedProtectedRoute - user:', user, 'loading:', loading, 'allowedTypes:', allowedTypes);

  useEffect(() => {
    // Se estiver em modo de teste, não fazer verificações de tipo
    if (TEST_MODE) {
      console.log('🧪 MODO TESTE: Verificações de tipo de usuário desabilitadas');
      console.log('🔍 Usuário atual:', user?.tipo, 'Tipos permitidos:', allowedTypes);
      return;
    }

    console.log('🔍 TypedProtectedRoute: Verificando acesso. Loading:', loading, 'User:', user?.tipo, 'Allowed:', allowedTypes);
    
    // Se não está carregando e não há usuário, redirecionar para tela inicial
    if (!loading && !user) {
      console.log('❌ TypedProtectedRoute: Usuário não logado, redirecionando para /');
      navigate('/');
      return;
    }

    // Se há usuário mas não é do tipo permitido
    if (!loading && user && allowedTypes.length > 0 && !allowedTypes.includes(user.tipo)) {
      console.log('🚫 TypedProtectedRoute: Tipo de usuário não permitido:', user.tipo, 'Permitidos:', allowedTypes);
      
      // Redirecionar para a área correta do usuário
      switch (user.tipo) {
        case 'empresa':
          navigate('/empresa/dashboard', { replace: true });
          break;
        case 'funcionario':
          navigate('/funcionario/agenda', { replace: true });
          break;
        case 'cliente':
          navigate('/cliente', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
      }
    }
  }, [loading, user, allowedTypes, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Redirecionando...</h2>
          <p className="text-gray-600 mb-4">Você será redirecionado para a página de login.</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Verificar se o tipo do usuário está permitido (apenas se não estiver em modo de teste)
  if (!TEST_MODE && allowedTypes.length > 0 && !allowedTypes.includes(user.tipo)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">Você não tem permissão para acessar esta área.</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return children;
};

export default TypedProtectedRoute;

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMySqlAuth } from '../../contexts/MySqlAuthContext';

const RedirectHandler = () => {
  const { user, loading } = useMySqlAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 🧪 MODO TESTE: Desabilitar redirecionamentos automáticos
  const TEST_MODE = true; // Altere para false em produção

  useEffect(() => {
    // Se estiver em modo de teste, não fazer redirecionamentos automáticos
    if (TEST_MODE) {
      console.log('🧪 MODO TESTE: Redirecionamentos automáticos desabilitados');
      console.log('🔍 Usuário atual:', user?.tipo, 'Rota atual:', location.pathname);
      return;
    }

    // Só redirecionar se não estiver carregando e houver usuário
    if (!loading && user) {
      const currentPath = location.pathname;
      console.log('🔍 RedirectHandler: Verificando rota:', currentPath, 'Usuário:', user.tipo);

      // Se estiver na página inicial e já logado, redirecionar para a área correta
      if (currentPath === '/') {
        console.log('🔄 RedirectHandler: Usuário logado, redirecionando...', user.tipo);

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
            console.warn('Tipo de usuário desconhecido:', user.tipo);
        }
      }
      
      // Proteger rotas por tipo de usuário
      if (currentPath.startsWith('/empresa/') && user.tipo !== 'empresa') {
        console.log('🚫 Acesso negado: Usuário não é empresa');
        switch (user.tipo) {
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
      
      if (currentPath.startsWith('/funcionario/') && user.tipo !== 'funcionario') {
        console.log('🚫 Acesso negado: Usuário não é funcionário');
        switch (user.tipo) {
          case 'empresa':
            navigate('/empresa/dashboard', { replace: true });
            break;
          case 'cliente':
            navigate('/cliente', { replace: true });
            break;
          default:
            navigate('/', { replace: true });
        }
      }
      
      if (currentPath.startsWith('/cliente/') && user.tipo !== 'cliente') {
        console.log('🚫 Acesso negado: Usuário não é cliente');
        switch (user.tipo) {
          case 'empresa':
            navigate('/empresa/dashboard', { replace: true });
            break;
          case 'funcionario':
            navigate('/funcionario/agenda', { replace: true });
            break;
          default:
            navigate('/', { replace: true });
        }
      }
    }
  }, [user, loading, navigate, location.pathname]);

  // Este componente não renderiza nada, só faz o controle de redirecionamento
  return null;
};

export default RedirectHandler;

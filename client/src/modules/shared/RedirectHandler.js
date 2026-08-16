import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMySqlAuth } from '../../contexts/MySqlAuthContext';
import { LOCAL_DEV } from '../../config/appConfig';

const RedirectHandler = () => {
  const { user, loading } = useMySqlAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (LOCAL_DEV) {
      return;
    }

    if (!loading && user) {
      const currentPath = location.pathname;

      if (currentPath === '/') {
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
            break;
        }
      }

      if (currentPath.startsWith('/empresa/') && user.tipo !== 'empresa') {
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

  return null;
};

export default RedirectHandler;

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMySqlAuth } from '../../contexts/MySqlAuthContext';
import { LOCAL_DEV } from '../../config/appConfig';
import { getUserHomeRoute } from '../../utils/authRoutes';

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
      const userHomeRoute = getUserHomeRoute(user.tipo);

      if (currentPath === '/' && userHomeRoute) {
        navigate(userHomeRoute, { replace: true });
        return;
      }

      if (currentPath.startsWith('/empresa/') && user.tipo !== 'empresa') {
        navigate(userHomeRoute || '/', { replace: true });
      }

      if (currentPath.startsWith('/funcionario/') && user.tipo !== 'funcionario') {
        navigate(userHomeRoute || '/', { replace: true });
      }

      if (currentPath.startsWith('/cliente/') && user.tipo !== 'cliente') {
        navigate(userHomeRoute || '/', { replace: true });
      }
    }
  }, [user, loading, navigate, location.pathname]);

  return null;
};

export default RedirectHandler;

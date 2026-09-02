import React, { useEffect } from 'react';
import { useMySqlAuth } from '../../contexts/MySqlAuthContext';
import { useNavigate } from 'react-router-dom';
import { LOCAL_DEV } from '../../config/appConfig';
import { getUserHomeRoute } from '../../utils/authRoutes';

const TypedProtectedRoute = ({ children, allowedTypes = [] }) => {
  const { user, loading, localDev } = useMySqlAuth();
  const navigate = useNavigate();
  const bypassAuth = LOCAL_DEV || localDev;

  useEffect(() => {
    if (bypassAuth) {
      return;
    }

    if (!loading && !user) {
      navigate('/');
      return;
    }

    if (!loading && user && allowedTypes.length > 0 && !allowedTypes.includes(user.tipo)) {
      navigate(getUserHomeRoute(user.tipo) || '/', { replace: true });
    }
  }, [loading, user, allowedTypes, navigate, bypassAuth]);

  if (loading && !bypassAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user && !bypassAuth) {
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

  if (!bypassAuth && allowedTypes.length > 0 && !allowedTypes.includes(user.tipo)) {
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

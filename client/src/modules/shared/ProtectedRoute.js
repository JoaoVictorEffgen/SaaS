import React, { useEffect } from 'react';
import { useMySqlAuth } from '../../contexts/MySqlAuthContext';
import { useNavigate } from 'react-router-dom';
import { LOCAL_DEV } from '../../config/appConfig';

const ProtectedRoute = ({ children }) => {
  const { user, loading, localDev } = useMySqlAuth();
  const navigate = useNavigate();
  const bypassAuth = LOCAL_DEV || localDev;

  useEffect(() => {
    if (!bypassAuth && !loading && !user) {
      navigate('/');
    }
  }, [loading, user, navigate, bypassAuth]);

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

  return children;
};

export default ProtectedRoute;

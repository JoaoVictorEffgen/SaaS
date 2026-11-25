import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth';
import Agendar from './paginas/Agendar';
import Login from './paginas/Login';
import Painel from './paginas/Painel';

function RotaProtegida() {
  const { usuario, carregando } = useAuth();
  if (carregando) return <p className="p-6 text-center text-slate-500">Carregando...</p>;
  return usuario ? <Painel /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Agendar />} />
          <Route path="/login" element={<Login />} />
          <Route path="/painel" element={<RotaProtegida />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

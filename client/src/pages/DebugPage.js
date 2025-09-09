import React, { useState, useEffect } from 'react';
import localStorageService from '../services/localStorageService';

const DebugPage = () => {
  const [users, setUsers] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Carregar dados para debug
    const allUsers = localStorageService.getUsers();
    const allEmpresas = localStorageService.getEmpresas();
    const current = localStorageService.getCurrentUser();
    
    setUsers(allUsers);
    setEmpresas(allEmpresas);
    setCurrentUser(current);
    
    console.log('Debug - Usuários:', allUsers);
    console.log('Debug - Empresas:', allEmpresas);
    console.log('Debug - Usuário atual:', current);
  }, []);

  const testLogin = () => {
    const result = localStorageService.login('admin@agendapro.com', 'admin123');
    console.log('Teste de login:', result);
    if (result) {
      setCurrentUser(result.user);
      alert('Login bem-sucedido!');
    } else {
      alert('Login falhou!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Debug - Dados do Sistema</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Usuários */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Usuários ({users.length})</h2>
            {users.map(user => (
              <div key={user.id} className="border-b pb-2 mb-2">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Nome:</strong> {user.nome}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Plano:</strong> {user.plano}</p>
              </div>
            ))}
          </div>

          {/* Empresas */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Empresas ({empresas.length})</h2>
            {empresas.map(empresa => (
              <div key={empresa.id} className="border-b pb-2 mb-2">
                <p><strong>ID:</strong> {empresa.id}</p>
                <p><strong>Nome:</strong> {empresa.nome}</p>
                <p><strong>Email:</strong> {empresa.email}</p>
                <p><strong>Funcionários:</strong> {empresa.funcionarios?.length || 0}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Usuário Atual */}
        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h2 className="text-xl font-bold mb-4">Usuário Atual</h2>
          {currentUser ? (
            <div>
              <p><strong>ID:</strong> {currentUser.id}</p>
              <p><strong>Nome:</strong> {currentUser.nome}</p>
              <p><strong>Email:</strong> {currentUser.email}</p>
              <p><strong>Plano:</strong> {currentUser.plano}</p>
            </div>
          ) : (
            <p className="text-gray-500">Nenhum usuário logado</p>
          )}
        </div>

        {/* Botões de Teste */}
        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h2 className="text-xl font-bold mb-4">Testes</h2>
          <button
            onClick={testLogin}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-4"
          >
            Testar Login Admin
          </button>
          <button
            onClick={() => {
              localStorageService.logout();
              setCurrentUser(null);
              alert('Logout realizado!');
            }}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebugPage;

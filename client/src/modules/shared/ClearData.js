import React from 'react';

const ClearData = () => {
  const clearAllData = () => {
    localStorage.clear();
    alert('Todos os dados foram limpos! Recarregue a página.');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Limpar Dados</h2>
        <p className="text-gray-600 mb-6">
          Clique no botão abaixo para limpar todos os dados do localStorage e começar do zero.
        </p>
        <button
          onClick={clearAllData}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
        >
          Limpar Todos os Dados
        </button>
      </div>
    </div>
  );
};

export default ClearData;

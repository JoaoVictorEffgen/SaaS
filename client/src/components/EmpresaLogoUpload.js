import React, { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

const EmpresaLogoUpload = ({ 
  empresaId,
  currentLogo, 
  onLogoUpload, 
  loading = false 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', null
  const [uploadMessage, setUploadMessage] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = async (file) => {
    // Validações
    if (!file.type.startsWith('image/')) {
      setUploadStatus('error');
      setUploadMessage('Apenas arquivos de imagem são permitidos');
      return;
    }

    if (file.size > 30 * 1024 * 1024) { // 30MB
      setUploadStatus('error');
      setUploadMessage('Arquivo muito grande. Máximo permitido: 30MB');
      return;
    }

    try {
      setUploadStatus(null);
      setUploadMessage('');
      
      const formData = new FormData();
      formData.append('logo', file);

      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/upload-fotos/logo-empresa/${empresaId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setUploadStatus('success');
        setUploadMessage('Logo enviado com sucesso!');
        onLogoUpload(result.url);
        
        // Limpar mensagem de sucesso após 3 segundos
        setTimeout(() => {
          setUploadStatus(null);
          setUploadMessage('');
        }, 3000);
      } else {
        setUploadStatus('error');
        setUploadMessage(result.message || 'Erro ao enviar logo');
      }
    } catch (error) {
      setUploadStatus('error');
      setUploadMessage('Erro ao enviar logo: ' + error.message);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <Upload className="h-6 w-6 mr-3 text-blue-600" />
        Logo da Empresa
      </h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Upload className="h-5 w-5 text-blue-600 mt-0.5" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Identidade visual da empresa
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              O logo da sua empresa aparecerá em todos os lugares do sistema, 
              tornando sua marca mais reconhecível e profissional.
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Upload do Logo
          </label>
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400'
            } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2 font-medium">
              Arraste um logo aqui ou clique para selecionar
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>📷 Formatos aceitos: JPG, PNG, GIF, WebP</p>
              <p>📏 Tamanho máximo: 30MB</p>
              <p>🎨 Recomendado: 200x200px ou superior</p>
              <p>💡 Dica: Use logo com fundo transparente</p>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="logo-upload"
              onChange={handleFileInput}
              disabled={loading}
            />
            <label
              htmlFor="logo-upload"
              className={`mt-6 inline-block px-6 py-3 rounded-lg font-medium transition-colors ${
                loading 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
              }`}
            >
              {loading ? 'Enviando...' : 'Selecionar Logo'}
            </label>
          </div>
          
          {/* Status do upload */}
          {uploadStatus && (
            <div className={`mt-4 p-3 rounded-lg flex items-center ${
              uploadStatus === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {uploadStatus === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              )}
              <span className={`text-sm ${
                uploadStatus === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {uploadMessage}
              </span>
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Preview do Logo
          </label>
          <div className="h-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 flex items-center justify-center">
            {currentLogo ? (
              <div className="relative">
                <img
                  src={currentLogo}
                  alt="Preview do logo"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : (
              <div className="text-center">
                <Upload className="h-16 w-16 mx-auto mb-3 text-gray-300" />
                <p className="font-medium text-gray-400">Nenhum logo selecionado</p>
                <p className="text-sm mt-1 text-gray-400">Faça upload de um logo para personalizar sua empresa</p>
              </div>
            )}
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <p>✅ Este logo aparecerá no dashboard da empresa</p>
            <p>✅ Será exibido em todos os documentos e comunicações</p>
            <p>✅ Deixa sua empresa mais profissional</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmpresaLogoUpload;

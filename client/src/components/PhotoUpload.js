import React, { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

const PhotoUpload = ({ 
  currentImage, 
  onImageUpload, 
  loading = false, 
  maxSizeMB = 30,
  accept = "image/*",
  uploadEndpoint,
  title = "Upload de Foto",
  description = "Faça upload de uma imagem"
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

    if (file.size > maxSizeMB * 1024 * 1024) {
      setUploadStatus('error');
      setUploadMessage(`Arquivo muito grande. Máximo permitido: ${maxSizeMB}MB`);
      return;
    }

    try {
      setUploadStatus(null);
      setUploadMessage('');
      
      const formData = new FormData();
      formData.append('foto', file);

      const token = localStorage.getItem('token');
      
      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setUploadStatus('success');
        setUploadMessage('Imagem enviada com sucesso!');
        onImageUpload(result.url);
        
        // Limpar mensagem de sucesso após 3 segundos
        setTimeout(() => {
          setUploadStatus(null);
          setUploadMessage('');
        }, 3000);
      } else {
        setUploadStatus('error');
        setUploadMessage(result.message || 'Erro ao enviar imagem');
      }
    } catch (error) {
      setUploadStatus('error');
      setUploadMessage('Erro ao enviar imagem: ' + error.message);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <Upload className="h-6 w-6 mr-3 text-blue-600" />
        {title}
      </h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Upload className="h-5 w-5 text-blue-600 mt-0.5" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              {description}
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              A imagem será salva no servidor e apenas a URL será armazenada no banco de dados.
              Tamanho máximo: {maxSizeMB}MB.
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Upload da Imagem
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
              Arraste uma imagem aqui ou clique para selecionar
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>📷 Formatos aceitos: JPG, PNG, GIF, WebP</p>
              <p>📏 Tamanho máximo: {maxSizeMB}MB</p>
              <p>🎨 Recomendado: 200x200px ou superior</p>
              <p>💡 Dica: Use imagens com boa qualidade</p>
            </div>
            <input
              type="file"
              accept={accept}
              className="hidden"
              id="photo-upload"
              onChange={handleFileInput}
              disabled={loading}
            />
            <label
              htmlFor="photo-upload"
              className={`mt-6 inline-block px-6 py-3 rounded-lg font-medium transition-colors ${
                loading 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
              }`}
            >
              {loading ? 'Enviando...' : 'Selecionar Imagem'}
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
            Preview da Imagem
          </label>
          <div className="h-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 flex items-center justify-center">
            {currentImage ? (
              <div className="relative">
                <img
                  src={currentImage}
                  alt="Preview da imagem"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : (
              <div className="text-center">
                <Upload className="h-16 w-16 mx-auto mb-3 text-gray-300" />
                <p className="font-medium text-gray-400">Nenhuma imagem selecionada</p>
                <p className="text-sm mt-1 text-gray-400">Faça upload de uma imagem para visualizar aqui</p>
              </div>
            )}
          Diego</div>
          <div className="mt-3 text-sm text-gray-600">
            <p>✅ Esta imagem será exibida no perfil</p>
            <p>✅ Será acessível via URL pública</p>
            <p>✅ Armazenada no sistema de arquivos</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoUpload;

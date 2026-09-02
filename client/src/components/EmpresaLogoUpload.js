import React, { useRef, useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import apiService from '../services/apiService';

const EmpresaLogoUpload = ({ 
  empresaId,
  currentLogo, 
  onLogoUpload, 
  loading = false 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', null
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const isDisabled = loading || uploading || !empresaId;

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
    
    if (!isDisabled && e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = async (file) => {
    // Validações
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadStatus('error');
      setUploadMessage('Escolha uma imagem JPG, PNG ou WebP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus('error');
      setUploadMessage('A imagem deve ter no máximo 5MB.');
      return;
    }

    try {
      setUploading(true);
      setUploadStatus(null);
      setUploadMessage('');

      const result = await apiService.uploadCompanyLogo(empresaId, file);

      if (result.success) {
        setUploadStatus('success');
        setUploadMessage('Logo enviado com sucesso!');
        onLogoUpload?.(result.url);
        
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
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      setUploading(true);
      setUploadStatus(null);
      const result = await apiService.removeCompanyLogo(empresaId);
      setUploadStatus('success');
      setUploadMessage(result.message || 'Logo removido com sucesso!');
      onLogoUpload?.(null);
    } catch (error) {
      setUploadStatus('error');
      setUploadMessage(error.message || 'Não foi possível remover o logo.');
    } finally {
      setUploading(false);
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
              O logo identifica sua empresa no catálogo dos clientes e nas áreas de gestão.
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
            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
              <p>📷 Formatos aceitos: JPG, PNG e WebP</p>
              <p>📏 Tamanho máximo: 5MB</p>
              <p>🎨 Recomendado: 200x200px ou superior</p>
              <p>💡 Dica: Use logo com fundo transparente</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              id="logo-upload"
              onChange={handleFileInput}
              disabled={isDisabled}
            />
            <label
              htmlFor="logo-upload"
              className={`mt-6 inline-block px-6 py-3 rounded-lg font-medium transition-colors ${
                isDisabled
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
              }`}
            >
              {uploading ? 'Enviando...' : 'Selecionar Logo'}
            </label>
            {currentLogo && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                disabled={isDisabled}
                className="ml-2 mt-3 inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-3 font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Remover logo
              </button>
            )}
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
            <p>✅ Será exibido no catálogo e no agendamento</p>
            <p>✅ Você poderá substituí-lo quando quiser</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmpresaLogoUpload;

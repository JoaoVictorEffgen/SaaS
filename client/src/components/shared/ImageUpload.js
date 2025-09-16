import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const ImageUpload = ({ 
  value, 
  onChange, 
  placeholder = "Clique para fazer upload da imagem",
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  className = ""
}) => {

  // TODOS os hooks devem ser chamados sempre, antes de qualquer validação condicional
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(value || null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Sincronizar preview com value
  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  // Validação das props (após TODOS os hooks)
  if (onChange && typeof onChange !== 'function') {
    console.error('❌ ImageUpload: onChange deve ser uma função, recebido:', typeof onChange, onChange);
    return (
      <div className="p-4 border-2 border-red-300 rounded-lg bg-red-50">
        <p className="text-red-600">Erro: onChange não é uma função válida</p>
        <p className="text-xs text-red-500 mt-1">
          Tipo recebido: {typeof onChange} | Valor: {String(onChange)}
        </p>
      </div>
    );
  }

  const handleFiles = (files) => {
    const file = files[0];
    
    if (!file) return;

    // Validar tipo de arquivo
    if (!acceptedTypes.includes(file.type)) {
      setError('Tipo de arquivo não suportado. Use JPG, PNG, GIF ou WebP.');
      return;
    }

    // Validar tamanho
    if (file.size > maxSize) {
      setError(`Arquivo muito grande. Máximo ${maxSize / (1024 * 1024)}MB.`);
      return;
    }

    setError('');

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target.result;
      setPreview(result);
      
      // Chamar onChange se for uma função válida
      if (typeof onChange === 'function') {
        onChange(result);
      }
    };
    reader.onerror = (e) => {
      console.error('Erro ao ler arquivo:', e);
      setError('Erro ao ler o arquivo. Tente novamente.');
    };
    reader.readAsDataURL(file);
  };

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
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    try {
      if (e.target.files && e.target.files[0]) {
        handleFiles(e.target.files);
      }
    } catch (error) {
      console.error('Erro no handleChange:', error);
      setError('Erro ao processar arquivo. Tente novamente.');
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const removeImage = () => {
    setPreview(null);
    if (typeof onChange === 'function') {
      onChange(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  return (
    <div className={`w-full ${className}`}>
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : preview 
              ? 'border-green-400 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleChange}
          className="hidden"
        />

        {preview ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <img
                src={preview}
                alt="Preview"
                className="max-h-32 max-w-full rounded-lg shadow-sm"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-green-600 font-medium">
              ✓ Imagem carregada com sucesso
            </p>
            <button
              type="button"
              onClick={onButtonClick}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Alterar imagem
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 text-gray-400">
              <ImageIcon className="w-full h-full" />
            </div>
            <div>
              <button
                type="button"
                onClick={onButtonClick}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Upload className="h-4 w-4 mr-2" />
                Fazer Upload
              </button>
              <p className="mt-2 text-sm text-gray-500">
                ou arraste e solte aqui
              </p>
            </div>
            <p className="text-xs text-gray-400">
              {placeholder}
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      <div className="mt-2 text-xs text-gray-500">
        Formatos aceitos: JPG, PNG, GIF, WebP • Máximo: {maxSize / (1024 * 1024)}MB
      </div>
    </div>
  );
};

export default ImageUpload;

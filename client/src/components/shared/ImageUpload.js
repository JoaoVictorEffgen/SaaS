import React, { useState, useRef } from 'react';
import { Upload, X, Camera, Image as ImageIcon } from 'lucide-react';

const ImageUpload = ({ 
  currentImage, 
  onImageChange, 
  type = 'logo', // 'logo' ou 'foto'
  size = 'medium', // 'small', 'medium', 'large'
  className = '',
  disabled = false 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage);
  const fileInputRef = useRef(null);

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    setIsUploading(true);

    try {
      // Converter para base64 para preview imediato
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target.result;
        setPreview(base64Image);
        
        // Chamar callback com a imagem
        if (onImageChange) {
          onImageChange(base64Image, file);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      alert('Erro ao processar a imagem. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    if (onImageChange) {
      onImageChange(null, null);
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        onClick={handleClick}
        className={`
          ${sizeClasses[size]} 
          rounded-full border-2 border-dashed border-gray-300 
          flex items-center justify-center cursor-pointer
          hover:border-blue-400 hover:bg-blue-50 transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${preview ? 'border-solid border-blue-400 bg-blue-50' : ''}
        `}
      >
        {preview ? (
          <div className="relative w-full h-full">
            <img
              src={preview}
              alt={type === 'logo' ? 'Logo da empresa' : 'Foto do funcionário'}
              className="w-full h-full rounded-full object-cover"
            />
            {!disabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ) : (
          <div className="text-center">
            {type === 'logo' ? (
              <ImageIcon className="w-6 h-6 text-gray-400 mx-auto" />
            ) : (
              <Camera className="w-6 h-6 text-gray-400 mx-auto" />
            )}
            <p className="text-xs text-gray-500 mt-1">
              {isUploading ? 'Carregando...' : type === 'logo' ? 'Logo' : 'Foto'}
            </p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {!disabled && (
        <div className="mt-2 text-center">
          <button
            type="button"
            onClick={handleClick}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            {preview ? 'Alterar' : 'Adicionar'} {type === 'logo' ? 'logo' : 'foto'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

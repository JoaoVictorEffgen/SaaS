import React from 'react';
import PhotoUpload from './PhotoUpload';

const EmpresaLogoSistemaUpload = ({ empresaId, currentLogoSistema, onLogoSistemaUpload, loading }) => {
  const uploadEndpoint = `/api/upload-fotos/logo-sistema/${empresaId}`;

  return (
    <PhotoUpload
      currentImage={currentLogoSistema}
      onImageUpload={onLogoSistemaUpload}
      fieldName="logo_sistema"
      uploadEndpoint={uploadEndpoint}
      loading={loading}
    />
  );
};

export default EmpresaLogoSistemaUpload;

import React from 'react';
import PhotoUpload from './PhotoUpload';

const EmpresaLogoSistemaUpload = ({ empresaId, currentLogoSistema, onLogoSistemaUpload, loading }) => {
  const uploadEndpoint = `/api/upload-fotos/logo-sistema/${empresaId}`;

  return (
    <PhotoUpload
      userId={empresaId} // Usamos empresaId como userId para consistência no PhotoUpload
      currentPhotoUrl={currentLogoSistema}
      onPhotoUpload={onLogoSistemaUpload}
      fieldName="logo_sistema"
      uploadEndpoint={uploadEndpoint}
      loading={loading}
    />
  );
};

export default EmpresaLogoSistemaUpload;

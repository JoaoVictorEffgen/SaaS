// =============================================
// ROTAS PÚBLICAS DE UPLOAD - SaaS AgendaPro
// =============================================

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/environment');

const router = express.Router();

// =============================================
// CONFIGURAÇÃO DE ARMAZENAMENTO
// =============================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = '';
    
    if (file.fieldname === 'foto_perfil') {
      uploadPath = path.join(config.upload.dir, 'fotos-perfil');
    } else if (file.fieldname === 'logo_empresa') {
      uploadPath = path.join(config.upload.dir, 'logos-empresa');
    } else if (file.fieldname === 'documento') {
      uploadPath = path.join(config.upload.dir, 'documentos');
    } else {
      uploadPath = path.join(config.upload.dir, 'temp');
    }

    // Criar diretório se não existir
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    
    // Nome do arquivo baseado no tipo
    let baseName = '';
    if (file.fieldname === 'foto_perfil') {
      baseName = 'temp_perfil';
    } else if (file.fieldname === 'logo_empresa') {
      baseName = 'temp_logo';
    } else if (file.fieldname === 'documento') {
      baseName = 'temp_doc';
    } else {
      baseName = 'temp_file';
    }

    cb(null, `${baseName}_${uniqueSuffix}${fileExtension}`);
  }
});

// Filtro de arquivos
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'foto_perfil': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    'logo_empresa': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    'documento': ['application/pdf', 'image/jpeg', 'image/png']
  };

  const allowedMimeTypes = allowedTypes[file.fieldname] || ['image/jpeg', 'image/png', 'image/gif'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de arquivo não permitido para ${file.fieldname}. Tipos aceitos: ${allowedMimeTypes.join(', ')}`), false);
  }
};

// Configuração do multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize // 30MB
  }
});

// =============================================
// MIDDLEWARE DE VALIDAÇÃO PÚBLICA
// =============================================

const validatePublicUpload = (req, res, next) => {
  // Verificar se o upload é para cadastro público
  const allowedOrigins = [
    '/cadastro',
    '/registro',
    '/signup',
    '/public/upload'
  ];

  const referer = req.get('Referer') || '';
  const isPublicUpload = allowedOrigins.some(origin => referer.includes(origin));

  if (!isPublicUpload) {
    return res.status(403).json({
      success: false,
      message: 'Upload público permitido apenas durante cadastro'
    });
  }

  next();
};

// =============================================
// ROTAS PÚBLICAS
// =============================================

// POST /api/public/uploads/foto-perfil - Upload público de foto de perfil
router.post('/foto-perfil', validatePublicUpload, upload.single('foto_perfil'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma imagem foi enviada'
      });
    }

    const baseUrl = config.getPublicUploadUrl();
    const imageUrl = `${baseUrl}/fotos-perfil/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Foto de perfil enviada com sucesso!',
      url: imageUrl,
      filename: req.file.filename,
      temp: true, // Indica que é um arquivo temporário
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expira em 24 horas
    });

  } catch (error) {
    console.error('❌ Erro no upload público da foto de perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: config.development.debug ? error.message : undefined
    });
  }
});

// POST /api/public/uploads/logo-empresa - Upload público de logo da empresa
router.post('/logo-empresa', validatePublicUpload, upload.single('logo_empresa'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma imagem foi enviada'
      });
    }

    const baseUrl = config.getPublicUploadUrl();
    const imageUrl = `${baseUrl}/logos-empresa/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Logo da empresa enviado com sucesso!',
      url: imageUrl,
      filename: req.file.filename,
      temp: true, // Indica que é um arquivo temporário
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expira em 24 horas
    });

  } catch (error) {
    console.error('❌ Erro no upload público do logo da empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: config.development.debug ? error.message : undefined
    });
  }
});

// POST /api/public/uploads/documento - Upload público de documento
router.post('/documento', validatePublicUpload, upload.single('documento'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum documento foi enviado'
      });
    }

    const baseUrl = config.getPublicUploadUrl();
    const documentUrl = `${baseUrl}/documentos/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Documento enviado com sucesso!',
      url: documentUrl,
      filename: req.file.filename,
      temp: true, // Indica que é um arquivo temporário
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expira em 24 horas
    });

  } catch (error) {
    console.error('❌ Erro no upload público do documento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: config.development.debug ? error.message : undefined
    });
  }
});

// GET /api/public/uploads/:filename - Servir arquivos públicos
router.get('/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', config.upload.dir, filename);

    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Arquivo não encontrado'
      });
    }

    // Servir o arquivo
    res.sendFile(filePath);

  } catch (error) {
    console.error('❌ Erro ao servir arquivo público:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao servir arquivo',
      error: config.development.debug ? error.message : undefined
    });
  }
});

// =============================================
// MIDDLEWARE DE ERRO
// =============================================

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `Arquivo muito grande. Tamanho máximo permitido: ${Math.round(config.upload.maxFileSize / 1024 / 1024)}MB`
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Muitos arquivos enviados'
      });
    }
  }

  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: config.development.debug ? error.message : undefined
  });
});

module.exports = router;

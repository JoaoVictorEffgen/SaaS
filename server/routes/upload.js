const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');
const { checkEmpresaOwnership } = require('../middleware/userPermissions');
const { Empresa } = require('../models');

const router = express.Router();

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/imagens-fundo');
    
    // Criar diretório se não existir
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `fundo-${uniqueSuffix}${extension}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Verificar se é uma imagem
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
    }
  }
});

// POST /api/upload/imagem-fundo - Upload de imagem de fundo da empresa
router.post('/imagem-fundo', authenticateToken, checkEmpresaOwnership, upload.single('imagem'), async (req, res) => {
  try {
    console.log('🔍 Upload de imagem de fundo iniciado');
    console.log('🔍 Arquivo recebido:', req.file);
    console.log('🔍 Usuário:', req.user?.id, req.user?.tipo);
    console.log('🔍 Empresa:', req.empresa?.id);
    
    if (!req.file) {
      console.log('❌ Nenhuma imagem foi enviada');
      return res.status(400).json({ 
        success: false, 
        message: 'Nenhuma imagem foi enviada' 
      });
    }

    const empresa = req.empresa; // Já validado pelo middleware

    // URL da imagem com protocolo completo
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/api/uploads/imagens-fundo/${req.file.filename}`;
    
    console.log('🔍 URL da imagem:', imageUrl);
    
    // Atualizar empresa com a URL da imagem de fundo
    await empresa.update({ imagem_fundo_url: imageUrl });
    
    console.log('✅ Imagem de fundo salva com sucesso:', imageUrl);
    
    res.json({
      success: true,
      message: 'Imagem de fundo enviada com sucesso!',
      url: imageUrl,
      filename: req.file.filename
    });
    
  } catch (error) {
    console.error('❌ Erro no upload de imagem de fundo:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/upload/logo - Upload de logo da empresa
router.post('/logo', authenticateToken, checkEmpresaOwnership, upload.single('logo'), async (req, res) => {
  try {
    console.log('🔍 Upload de logo iniciado');
    console.log('🔍 Arquivo recebido:', req.file);
    console.log('🔍 Usuário:', req.user?.id, req.user?.tipo);
    console.log('🔍 Empresa:', req.empresa?.id);
    
    if (!req.file) {
      console.log('❌ Nenhuma imagem foi enviada');
      return res.status(400).json({ 
        success: false, 
        message: 'Nenhuma imagem foi enviada' 
      });
    }

    const empresa = req.empresa; // Já validado pelo middleware

    // URL da imagem com protocolo completo
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/api/uploads/imagens-fundo/${req.file.filename}`;
    
    console.log('🔍 URL do logo:', imageUrl);
    
    // Atualizar empresa com a URL do logo
    await empresa.update({ logo_url: imageUrl });
    
    console.log('✅ Logo salvo com sucesso:', imageUrl);
    
    res.json({
      success: true,
      message: 'Logo enviado com sucesso!',
      url: imageUrl,
      filename: req.file.filename
    });
    
  } catch (error) {
    console.error('❌ Erro no upload do logo:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/uploads/imagens-fundo/:filename - Servir imagens de fundo
router.use('/imagens-fundo', express.static(path.join(__dirname, '../uploads/imagens-fundo')));

router.get('/imagens-fundo/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const imagePath = path.join(__dirname, '../uploads/imagens-fundo', filename);
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Imagem não encontrada' 
      });
    }
    
    // Servir a imagem
    res.sendFile(imagePath);
  } catch (error) {
    console.error('❌ Erro ao servir imagem:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao carregar imagem'
    });
  }
});

module.exports = router;

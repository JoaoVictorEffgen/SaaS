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
    console.log('🔍 Upload de imagem de fundo:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nenhuma imagem foi enviada' 
      });
    }

    const empresa = req.empresa; // Já validado pelo middleware

    // URL da imagem
    const imageUrl = `/api/uploads/imagens-fundo/${req.file.filename}`;
    
    // Atualizar empresa com a URL da imagem de fundo
    await empresa.update({ imagem_fundo_url: imageUrl });
    
    console.log('✅ Imagem de fundo salva:', imageUrl);
    
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

// GET /api/uploads/imagens-fundo/:filename - Servir imagens de fundo
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

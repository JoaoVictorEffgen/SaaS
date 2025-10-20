const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');
const { User, Empresa } = require('../models');

const router = express.Router();

// Configuração do Multer para upload de fotos de perfil
const storageFotosPerfil = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/fotos-perfil');
    
    // Criar diretório se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Gerar nome único: usuario_[ID]_[timestamp].[extensão]
    const userId = req.user?.id || 'unknown';
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const sanitizedName = file.originalname
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Remove caracteres especiais
      .substring(0, 50); // Limita tamanho
    
    const filename = `usuario_${userId}_${timestamp}${extension}`;
    cb(null, filename);
  }
});

// Configuração do Multer para upload de logos de empresa
const storageLogosEmpresa = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/logos-empresa');
    
    // Criar diretório se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Gerar nome único: empresa_[ID]_[timestamp].[extensão]
    const empresaId = req.empresa?.id || 'unknown';
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const sanitizedName = file.originalname
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Remove caracteres especiais
      .substring(0, 50); // Limita tamanho
    
    const filename = `empresa_${empresaId}_${timestamp}${extension}`;
    cb(null, filename);
  }
});

// Filtro de validação de arquivos
const fileFilter = (req, file, cb) => {
  // Verificar se é uma imagem
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
  }
};

// Configuração do multer para fotos de perfil
const uploadFotosPerfil = multer({
  storage: storageFotosPerfil,
  fileFilter: fileFilter,
  limits: {
    fileSize: 30 * 1024 * 1024, // 30MB
    files: 1 // Apenas 1 arquivo por vez
  }
});

// Configuração do multer para logos de empresa
const uploadLogosEmpresa = multer({
  storage: storageLogosEmpresa,
  fileFilter: fileFilter,
  limits: {
    fileSize: 30 * 1024 * 1024, // 30MB
    files: 1 // Apenas 1 arquivo por vez
  }
});

// Middleware para verificar se o usuário é dono da empresa
const checkEmpresaOwnership = async (req, res, next) => {
  try {
    const { empresaId } = req.params;
    
    if (!empresaId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID da empresa é obrigatório' 
      });
    }

    // Buscar empresa
    const empresa = await Empresa.findByPk(empresaId);
    if (!empresa) {
      return res.status(404).json({ 
        success: false, 
        message: 'Empresa não encontrada' 
      });
    }

    // Verificar se o usuário é dono da empresa
    if (req.user.tipo === 'empresa' && req.user.id === empresa.user_id) {
      req.empresa = empresa;
      return next();
    }

    // Se for funcionário, verificar se pertence à empresa
    if (req.user.tipo === 'funcionario' && req.user.empresa_id === empresa.id) {
      req.empresa = empresa;
      return next();
    }

    return res.status(403).json({ 
      success: false, 
      message: 'Você não tem permissão para acessar esta empresa' 
    });

  } catch (error) {
    console.error('❌ Erro no middleware checkEmpresaOwnership:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
};

// POST /api/upload/foto-perfil - Upload de foto de perfil do usuário
router.post('/foto-perfil', authenticateToken, uploadFotosPerfil.single('foto'), async (req, res) => {
  try {
    console.log('🔍 Upload de foto de perfil iniciado');
    console.log('🔍 Arquivo recebido:', req.file);
    console.log('🔍 Usuário:', req.user?.id, req.user?.tipo);
    
    if (!req.file) {
      console.log('❌ Nenhuma imagem foi enviada');
      return res.status(400).json({ 
        success: false, 
        message: 'Nenhuma imagem foi enviada' 
      });
    }

    const userId = req.user.id;

    // URL da imagem com protocolo completo
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/api/uploads/fotos-perfil/${req.file.filename}`;
    
    console.log('🔍 URL da foto:', imageUrl);
    
    // Atualizar usuário com a URL da foto
    await User.update(
      { url_foto_perfil: imageUrl },
      { where: { id: userId } }
    );
    
    console.log('✅ Foto de perfil salva com sucesso:', imageUrl);
    
    res.json({
      success: true,
      message: 'Foto de perfil enviada com sucesso!',
      url: imageUrl,
      filename: req.file.filename
    });
    
  } catch (error) {
    console.error('❌ Erro no upload da foto de perfil:', error);
    
    // Deletar arquivo se houver erro
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (deleteError) {
        console.error('❌ Erro ao deletar arquivo:', deleteError);
      }
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/upload/logo-empresa/:empresaId - Upload de logo da empresa
router.post('/logo-empresa/:empresaId', authenticateToken, checkEmpresaOwnership, uploadLogosEmpresa.single('logo'), async (req, res) => {
  try {
    console.log('🔍 Upload de logo da empresa iniciado');
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
    const imageUrl = `${baseUrl}/api/uploads/logos-empresa/${req.file.filename}`;
    
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
    
    // Deletar arquivo se houver erro
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (deleteError) {
        console.error('❌ Erro ao deletar arquivo:', deleteError);
      }
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/upload/foto-perfil/:userId - Obter foto de perfil do usuário
router.get('/foto-perfil/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'nome', 'url_foto_perfil']
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        nome: user.nome,
        url_foto_perfil: user.url_foto_perfil
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar foto de perfil:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/upload-fotos/logo-sistema/:empresaId - Upload de logo do sistema (White Label)
router.post('/logo-sistema/:empresaId', authenticateToken, checkEmpresaOwnership, uploadLogosEmpresa.single('logo_sistema'), async (req, res) => {
  try {
    console.log('🎨 Upload de logo do sistema (White Label) iniciado');
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
    const imageUrl = `${baseUrl}/api/uploads/logos-empresa/${req.file.filename}`;
    
    console.log('🎨 URL do logo do sistema:', imageUrl);
    
    // Atualizar empresa com a URL do logo do sistema
    await empresa.update({ logo_sistema: imageUrl });
    
    console.log('✅ Logo do sistema salvo com sucesso:', imageUrl);
    
    res.json({
      success: true,
      message: 'Logo do sistema enviado com sucesso!',
      url: imageUrl,
      filename: req.file.filename
    });
    
  } catch (error) {
    console.error('❌ Erro no upload do logo do sistema:', error);
    
    // Deletar arquivo se houver erro
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (deleteError) {
        console.error('❌ Erro ao deletar arquivo:', deleteError);
      }
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Middleware para servir arquivos estáticos
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

module.exports = router;

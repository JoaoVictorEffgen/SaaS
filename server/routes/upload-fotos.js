const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');
const { User, Empresa } = require('../models');

const router = express.Router();
const ALLOWED_IMAGE_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp'
};
const LOGO_UPLOAD_DIR = path.join(__dirname, '../uploads/logos-empresa');
const PROFILE_UPLOAD_DIR = path.join(__dirname, '../uploads/fotos-perfil');

const hasValidImageSignature = async (file) => {
  const bytes = await fs.promises.readFile(file.path);

  if (file.mimetype === 'image/jpeg') {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (file.mimetype === 'image/png') {
    return bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'));
  }

  if (file.mimetype === 'image/webp') {
    return bytes.length >= 12 &&
      bytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
      bytes.subarray(8, 12).toString('ascii') === 'WEBP';
  }

  return false;
};

const removeManagedLogo = async (logoUrl) => {
  if (!logoUrl) return;

  try {
    const pathname = new URL(logoUrl, 'http://timeflow.local').pathname;
    const filename = path.basename(pathname);
    const resolvedDirectory = path.resolve(LOGO_UPLOAD_DIR);
    const resolvedFile = path.resolve(LOGO_UPLOAD_DIR, filename);

    if (!resolvedFile.startsWith(`${resolvedDirectory}${path.sep}`) || !/^empresa_\d+_\d+\.(jpg|png|webp)$/i.test(filename)) {
      return;
    }

    await fs.promises.unlink(resolvedFile).catch((error) => {
      if (error.code !== 'ENOENT') throw error;
    });
  } catch (error) {
    console.warn('⚠️ Não foi possível remover o logo anterior:', error.message);
  }
};

const removeManagedProfilePhoto = async (photoUrl) => {
  if (!photoUrl) return;

  try {
    const pathname = new URL(photoUrl, 'http://timeflow.local').pathname;
    const filename = path.basename(pathname);
    const resolvedDirectory = path.resolve(PROFILE_UPLOAD_DIR);
    const resolvedFile = path.resolve(PROFILE_UPLOAD_DIR, filename);

    if (!resolvedFile.startsWith(`${resolvedDirectory}${path.sep}`) || !/^usuario_\d+_\d+\.(jpg|png|webp)$/i.test(filename)) {
      return;
    }

    await fs.promises.unlink(resolvedFile).catch((error) => {
      if (error.code !== 'ENOENT') throw error;
    });
  } catch (error) {
    console.warn('⚠️ Não foi possível remover a foto anterior:', error.message);
  }
};

// Configuração do Multer para upload de fotos de perfil
const storageFotosPerfil = multer.diskStorage({
  destination: function (req, file, cb) {
    // Criar diretório se não existir
    if (!fs.existsSync(PROFILE_UPLOAD_DIR)) {
      fs.mkdirSync(PROFILE_UPLOAD_DIR, { recursive: true });
    }
    
    cb(null, PROFILE_UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    // Gerar nome único: usuario_[ID]_[timestamp].[extensão]
    const userId = req.user?.id || 'unknown';
    const timestamp = Date.now();
    const extension = ALLOWED_IMAGE_TYPES[file.mimetype];
    
    const filename = `usuario_${userId}_${timestamp}${extension}`;
    cb(null, filename);
  }
});

// Configuração do Multer para upload de logos de empresa
const storageLogosEmpresa = multer.diskStorage({
  destination: function (req, file, cb) {
    // Criar diretório se não existir
    if (!fs.existsSync(LOGO_UPLOAD_DIR)) {
      fs.mkdirSync(LOGO_UPLOAD_DIR, { recursive: true });
    }
    
    cb(null, LOGO_UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    // Gerar nome único: empresa_[ID]_[timestamp].[extensão]
    const empresaId = req.empresa?.id || 'unknown';
    const timestamp = Date.now();
    const extension = ALLOWED_IMAGE_TYPES[file.mimetype];
    
    const filename = `empresa_${empresaId}_${timestamp}${extension}`;
    cb(null, filename);
  }
});

// Filtro de validação de arquivos
const fileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES[file.mimetype]) {
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
    fileSize: 5 * 1024 * 1024,
    files: 1 // Apenas 1 arquivo por vez
  }
});

// Configuração do multer para logos de empresa
const uploadLogosEmpresa = multer({
  storage: storageLogosEmpresa,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
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

    return res.status(403).json({ 
      success: false, 
      message: 'Apenas o proprietário pode alterar a identidade visual da empresa'
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
    console.log('🔍 Usuário:', req.user?.id, req.user?.tipo);
    
    if (!req.file) {
      console.log('❌ Nenhuma imagem foi enviada');
      return res.status(400).json({ 
        success: false, 
        message: 'Nenhuma imagem foi enviada' 
      });
    }

    if (!(await hasValidImageSignature(req.file))) {
      const invalidFilePath = req.file.path;
      req.file = null;
      await fs.promises.unlink(invalidFilePath).catch(() => {});
      return res.status(400).json({
        success: false,
        message: 'O arquivo enviado não é uma imagem JPG, PNG ou WebP válida.'
      });
    }

    const userId = req.user.id;
    const user = await User.findByPk(userId);
    const previousPhoto = user?.url_foto_perfil;
    const imageUrl = `/api/uploads/fotos-perfil/${req.file.filename}`;
    
    console.log('🔍 URL da foto:', imageUrl);
    
    // Atualizar usuário com a URL da foto
    await User.update(
      { url_foto_perfil: imageUrl },
      { where: { id: userId } }
    );
    await removeManagedProfilePhoto(previousPhoto);
    
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
    console.log('🔍 Usuário:', req.user?.id, req.user?.tipo);
    console.log('🔍 Empresa:', req.empresa?.id);
    
    if (!req.file) {
      console.log('❌ Nenhuma imagem foi enviada');
      return res.status(400).json({ 
        success: false, 
        message: 'Nenhuma imagem foi enviada' 
      });
    }

    if (!(await hasValidImageSignature(req.file))) {
      const invalidFilePath = req.file.path;
      req.file = null;
      await fs.promises.unlink(invalidFilePath).catch(() => {});
      return res.status(400).json({
        success: false,
        message: 'O arquivo enviado não é uma imagem JPG, PNG ou WebP válida.'
      });
    }

    const empresa = req.empresa; // Já validado pelo middleware
    const previousLogo = empresa.logo_url;
    const imageUrl = `/api/uploads/logos-empresa/${req.file.filename}`;
    
    console.log('🔍 URL do logo:', imageUrl);
    
    // Atualizar empresa com a URL do logo
    await empresa.update({ logo_url: imageUrl });
    await removeManagedLogo(previousLogo);
    
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

router.delete('/logo-empresa/:empresaId', authenticateToken, checkEmpresaOwnership, async (req, res) => {
  try {
    const previousLogo = req.empresa.logo_url;
    await req.empresa.update({ logo_url: null });
    await removeManagedLogo(previousLogo);

    res.json({
      success: true,
      message: 'Logo removido com sucesso.',
      url: null
    });
  } catch (error) {
    console.error('❌ Erro ao remover logo:', error);
    res.status(500).json({
      success: false,
      message: 'Não foi possível remover o logo.'
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

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'A imagem deve ter no máximo 5MB.'
    });
  }

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Não foi possível processar a imagem.'
    });
  }

  next();
});

module.exports = router;

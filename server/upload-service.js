const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar diretório de uploads
const uploadDir = path.join(__dirname, 'uploads', 'logos');

// Criar diretório se não existir
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do multer para upload de logos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Gerar nome único: timestamp + extensão original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'logo-' + uniqueSuffix + ext);
  }
});

// Filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas (JPEG, JPG, PNG, GIF, WEBP)'));
  }
};

// Configurar multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
  },
  fileFilter: fileFilter
});

// Middleware para upload de logo
const uploadLogo = upload.single('logo');

// Função para servir imagens
const serveImage = (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(uploadDir, filename);
  
  // Verificar se arquivo existe
  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.status(404).json({ error: 'Imagem não encontrada' });
  }
};

// Função para deletar imagem
const deleteImage = (filename) => {
  const imagePath = path.join(uploadDir, filename);
  
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
    return true;
  }
  return false;
};

// Função para gerar URL da imagem
const getImageUrl = (filename) => {
  if (!filename) return null;
  return `/api/uploads/logos/${filename}`;
};

module.exports = {
  uploadLogo,
  serveImage,
  deleteImage,
  getImageUrl
};

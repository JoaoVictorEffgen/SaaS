const fs = require('fs');
const path = require('path');

// Criar ícones SVG que podem ser convertidos
const createSVGIcon = (size) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fundo com bordas arredondadas -->
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  
  <!-- Ícone de Calendário -->
  <g transform="translate(${size * 0.2}, ${size * 0.2})">
    <!-- Corpo do calendário -->
    <rect x="0" y="${size * 0.12}" width="${size * 0.6}" height="${size * 0.42}" rx="${size * 0.06}" fill="white"/>
    
    <!-- Topo do calendário -->
    <rect x="0" y="0" width="${size * 0.6}" height="${size * 0.18}" fill="white"/>
    
    <!-- Argolas -->
    <circle cx="${size * 0.12}" cy="${size * 0.05}" r="${size * 0.045}" fill="#3b82f6"/>
    <circle cx="${size * 0.48}" cy="${size * 0.05}" r="${size * 0.045}" fill="#3b82f6"/>
    
    <!-- Linhas do calendário -->
    <line x1="${size * 0.09}" y1="${size * 0.27}" x2="${size * 0.51}" y2="${size * 0.27}" stroke="#3b82f6" stroke-width="${size * 0.03}"/>
    <line x1="${size * 0.09}" y1="${size * 0.36}" x2="${size * 0.51}" y2="${size * 0.36}" stroke="#3b82f6" stroke-width="${size * 0.03}"/>
    <line x1="${size * 0.09}" y1="${size * 0.45}" x2="${size * 0.51}" y2="${size * 0.45}" stroke="#3b82f6" stroke-width="${size * 0.03}"/>
  </g>
</svg>`;
};

// Criar favicon ICO (simplificado como SVG)
const createFavicon = () => {
  return createSVGIcon(32);
};

// Salvar arquivos
const publicDir = path.join(__dirname, 'public');

try {
  // Criar ícone 192x192
  fs.writeFileSync(
    path.join(publicDir, 'icon-192.svg'),
    createSVGIcon(192)
  );
  console.log('✅ Criado: icon-192.svg');

  // Criar ícone 512x512
  fs.writeFileSync(
    path.join(publicDir, 'icon-512.svg'),
    createSVGIcon(512)
  );
  console.log('✅ Criado: icon-512.svg');

  // Criar favicon
  fs.writeFileSync(
    path.join(publicDir, 'favicon.svg'),
    createFavicon()
  );
  console.log('✅ Criado: favicon.svg');

  console.log('\n🎉 Ícones SVG criados com sucesso!');
  console.log('\n📝 Próximos passos:');
  console.log('1. Os ícones SVG funcionam perfeitamente em PWA');
  console.log('2. Se precisar de PNG, use um conversor online:');
  console.log('   - https://cloudconvert.com/svg-to-png');
  console.log('   - Ou use: npm install -g svg-to-png-cli');
  console.log('3. O manifest.json já está configurado para usar os ícones PNG');
  
} catch (error) {
  console.error('❌ Erro ao criar ícones:', error);
}


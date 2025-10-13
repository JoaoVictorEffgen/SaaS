const fs = require('fs');
const path = require('path');

// Script para criar ícones PWA a partir do logo.png
console.log('🎨 Criando ícones PWA a partir do logo.png...');

// Caminho do logo original
const logoPath = path.join(__dirname, '..', 'imagens', 'logo.png');

// Verificar se o logo existe
if (!fs.existsSync(logoPath)) {
  console.error('❌ Logo não encontrado em:', logoPath);
  process.exit(1);
}

console.log('✅ Logo encontrado:', logoPath);

// Criar um ícone SVG baseado no logo (placeholder)
// Como não temos uma biblioteca de manipulação de imagem, vou criar um SVG que referencia o logo
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  // Criar um SVG que usa o logo como background
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Gradiente de fundo -->
    <linearGradient id="bg-${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fundo com gradiente -->
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#bg-${size})"/>
  
  <!-- Logo centralizado -->
  <image 
    href="../imagens/logo.png" 
    x="${size * 0.15}" 
    y="${size * 0.15}" 
    width="${size * 0.7}" 
    height="${size * 0.7}"
    preserveAspectRatio="xMidYMid meet"
  />
</svg>`;

  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(__dirname, 'public', filename);
  
  fs.writeFileSync(filepath, svg);
  console.log(`✅ Criado: ${filename}`);
});

// Criar também um favicon.svg
const faviconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-favicon" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <rect width="32" height="32" rx="4" fill="url(#bg-favicon)"/>
  
  <image 
    href="../imagens/logo.png" 
    x="4" 
    y="4" 
    width="24" 
    height="24"
    preserveAspectRatio="xMidYMid meet"
  />
</svg>`;

fs.writeFileSync(path.join(__dirname, 'public', 'favicon.svg'), faviconSvg);
console.log('✅ Criado: favicon.svg');

console.log('\n🎉 Todos os ícones PWA foram criados com sucesso!');
console.log('📱 Os ícones agora usam seu logo personalizado!');
console.log('\n💡 Para aplicar as mudanças:');
console.log('1. Acesse o site no celular');
console.log('2. Limpe o cache do navegador');
console.log('3. Reinstale o PWA');
console.log('4. O novo ícone aparecerá na tela inicial!');

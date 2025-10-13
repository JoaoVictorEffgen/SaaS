const fs = require('fs');
const path = require('path');

// Script corrigido para criar ícones PWA a partir do logo.png
console.log('🎨 Criando ícones PWA corrigidos a partir do logo.png...');

// Caminho do logo original
const logoPath = path.join(__dirname, '..', 'imagens', 'logo.png');

// Verificar se o logo existe
if (!fs.existsSync(logoPath)) {
  console.error('❌ Logo não encontrado em:', logoPath);
  process.exit(1);
}

console.log('✅ Logo encontrado:', logoPath);

// Copiar o logo.png para a pasta public como base para os ícones
const publicLogoPath = path.join(__dirname, 'public', 'logo-base.png');
fs.copyFileSync(logoPath, publicLogoPath);
console.log('✅ Logo copiado para pasta public');

// Criar um ícone SVG que usa o logo como data URI (base64)
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  // Criar um SVG mais simples que funciona melhor
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
  
  <!-- Logo centralizado com padding -->
  <image 
    href="logo-base.png" 
    x="${size * 0.1}" 
    y="${size * 0.1}" 
    width="${size * 0.8}" 
    height="${size * 0.8}"
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
    href="logo-base.png" 
    x="3" 
    y="3" 
    width="26" 
    height="26"
    preserveAspectRatio="xMidYMid meet"
  />
</svg>`;

fs.writeFileSync(path.join(__dirname, 'public', 'favicon.svg'), faviconSvg);
console.log('✅ Criado: favicon.svg');

// Criar também um ícone PNG simples usando o logo
// Como não temos biblioteca de manipulação de imagem, vou criar um HTML temporário para conversão
const htmlConverter = `<!DOCTYPE html>
<html>
<head>
    <title>Converter Logo para Ícones</title>
</head>
<body>
    <canvas id="canvas" width="512" height="512" style="display:none;"></canvas>
    <script>
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        
        const img = new Image();
        img.onload = function() {
            // Desenhar fundo azul
            const gradient = ctx.createLinearGradient(0, 0, 512, 512);
            gradient.addColorStop(0, '#3b82f6');
            gradient.addColorStop(1, '#2563eb');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 512, 512);
            
            // Desenhar logo centralizado
            const logoSize = 512 * 0.8;
            const logoX = (512 - logoSize) / 2;
            const logoY = (512 - logoSize) / 2;
            ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
            
            // Converter para PNG
            const dataURL = canvas.toDataURL('image/png');
            
            // Salvar (isso seria feito via servidor, mas por enquanto vamos usar SVG)
            console.log('Logo convertido com sucesso!');
        };
        img.src = 'logo-base.png';
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'public', 'convert-logo.html'), htmlConverter);

console.log('\n🎉 Ícones PWA corrigidos criados com sucesso!');
console.log('📱 Os ícones agora devem mostrar seu logo!');
console.log('\n💡 Para aplicar as mudanças:');
console.log('1. Acesse o site no celular');
console.log('2. Limpe o cache do navegador');
console.log('3. Reinstale o PWA');
console.log('4. O novo ícone com seu logo aparecerá!');
console.log('\n🔧 Se ainda não funcionar:');
console.log('- Acesse: http://192.168.0.7:3000/convert-logo.html');
console.log('- Isso vai testar se o logo carrega corretamente');

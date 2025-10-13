const fs = require('fs');
const path = require('path');

// Criar ícones PNG simples para PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Fundo gradiente azul -->
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fundo -->
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  
  <!-- Calendário -->
  <rect x="${size * 0.2}" y="${size * 0.25}" width="${size * 0.6}" height="${size * 0.5}" 
        rx="${size * 0.05}" fill="white" opacity="0.95"/>
  
  <!-- Topo do calendário -->
  <rect x="${size * 0.2}" y="${size * 0.25}" width="${size * 0.6}" height="${size * 0.12}" 
        rx="${size * 0.05}" fill="white" opacity="1"/>
  
  <!-- Argolas -->
  <circle cx="${size * 0.35}" cy="${size * 0.25}" r="${size * 0.03}" fill="#1e40af"/>
  <circle cx="${size * 0.5}" cy="${size * 0.25}" r="${size * 0.03}" fill="#1e40af"/>
  <circle cx="${size * 0.65}" cy="${size * 0.25}" r="${size * 0.03}" fill="#1e40af"/>
  
  <!-- Checkmark -->
  <path d="M ${size * 0.35} ${size * 0.52} L ${size * 0.43} ${size * 0.6} L ${size * 0.65} ${size * 0.43}" 
        stroke="#3b82f6" stroke-width="${size * 0.04}" fill="none" 
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  fs.writeFileSync(
    path.join(__dirname, 'public', `icon-${size}x${size}.svg`),
    svg
  );
  
  console.log(`✅ Criado: icon-${size}x${size}.svg`);
});

console.log('\n🎉 Todos os ícones PWA foram criados com sucesso!');


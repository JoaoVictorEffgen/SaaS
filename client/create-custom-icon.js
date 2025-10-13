const fs = require('fs');
const path = require('path');

// Script para criar ícone personalizado usando Canvas
console.log('🎨 Criando ícone personalizado...');

// Caminho do logo original
const logoPath = path.join(__dirname, '..', 'imagens', 'logo.png');

// Verificar se o logo existe
if (!fs.existsSync(logoPath)) {
  console.error('❌ Logo não encontrado em:', logoPath);
  process.exit(1);
}

console.log('✅ Logo encontrado:', logoPath);

// Copiar o logo para a pasta public
const publicLogoPath = path.join(__dirname, 'public', 'logo-base.png');
fs.copyFileSync(logoPath, publicLogoPath);
console.log('✅ Logo copiado para pasta public');

// Criar um gerador de ícones que funciona no navegador
const iconGeneratorHTML = `<!DOCTYPE html>
<html>
<head>
    <title>Criador de Ícone PWA</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 30px;
        }
        .preview-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 30px 0;
        }
        .preview {
            text-align: center;
            padding: 20px;
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            background: #f8f9fa;
        }
        .icon-preview {
            display: inline-block;
            margin: 10px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        canvas {
            border: 2px solid #3b82f6;
            border-radius: 8px;
            margin: 5px;
        }
        button {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            margin: 10px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }
        button:disabled {
            background: #94a3b8;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        .status {
            margin: 20px 0;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            font-weight: 500;
        }
        .success {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
        }
        .error {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
        }
        .info {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
        }
        .instructions {
            background: #fef3c7;
            border: 2px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .instructions h3 {
            color: #92400e;
            margin-top: 0;
        }
        .instructions ol {
            color: #92400e;
        }
        .instructions code {
            background: #fbbf24;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
        }
        .size-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 Criador de Ícone PWA</h1>
        <p style="text-align: center; color: #666; font-size: 16px;">
            Gerador automático de ícones personalizados para seu PWA
        </p>
        
        <div id="status" class="status info">
            Carregando seu logo...
        </div>
        
        <div class="preview-section">
            <div class="preview">
                <h3>📱 Ícones Gerados</h3>
                <div id="iconPreviews" class="size-grid"></div>
            </div>
            
            <div class="preview">
                <h3>🎯 Preview Final</h3>
                <div id="finalPreview" style="text-align: center;">
                    <canvas id="previewCanvas" width="128" height="128" style="border: 3px solid #3b82f6; border-radius: 20px; margin: 20px;"></canvas>
                    <p><strong>Ícone PWA Final</strong></p>
                </div>
            </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <button onclick="generateAllIcons()" id="generateBtn" disabled>
                🚀 Gerar Ícones Personalizados
            </button>
            <button onclick="downloadAll()" id="downloadBtn" disabled>
                📥 Baixar Todos os Ícones
            </button>
        </div>
        
        <div id="instructions" class="instructions" style="display: none;">
            <h3>✅ Ícones Criados com Sucesso!</h3>
            <p><strong>Próximos passos:</strong></p>
            <ol>
                <li>Os arquivos PNG foram baixados automaticamente</li>
                <li>Copie todos os arquivos <code>icon-*.png</code> para a pasta <code>client/public/</code></li>
                <li>Limpe o cache do navegador completamente</li>
                <li>Reinstale o PWA no celular</li>
                <li>Seu logo personalizado aparecerá! 🎉</li>
            </ol>
        </div>
    </div>
    
    <script>
        const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
        const iconPreviews = document.getElementById('iconPreviews');
        const finalPreview = document.getElementById('finalPreview');
        const previewCanvas = document.getElementById('previewCanvas');
        const status = document.getElementById('status');
        const generateBtn = document.getElementById('generateBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const instructions = document.getElementById('instructions');
        
        let logoImage = null;
        let generatedIcons = {};
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = function() {
            logoImage = img;
            status.innerHTML = '✅ Logo carregado com sucesso! Clique no botão para gerar os ícones personalizados.';
            status.className = 'status success';
            generateBtn.disabled = false;
            
            // Criar previews dos tamanhos
            sizes.forEach(size => {
                const preview = document.createElement('div');
                preview.className = 'icon-preview';
                preview.innerHTML = \`
                    <div><strong>\${size}x\${size}</strong></div>
                    <canvas width="64" height="64" style="border: 1px solid #ddd; border-radius: 8px;"></canvas>
                \`;
                iconPreviews.appendChild(preview);
            });
        };
        
        img.onerror = function() {
            status.innerHTML = '❌ Erro ao carregar o logo. Verifique se o arquivo existe.';
            status.className = 'status error';
        };
        
        img.src = 'logo-base.png';
        
        function generateAllIcons() {
            if (!logoImage) {
                alert('Logo não carregado!');
                return;
            }
            
            generateBtn.disabled = true;
            status.innerHTML = '🎨 Gerando ícones personalizados...';
            status.className = 'status info';
            
            sizes.forEach((size, index) => {
                setTimeout(() => {
                    const canvas = document.createElement('canvas');
                    canvas.width = size;
                    canvas.height = size;
                    const ctx = canvas.getContext('2d');
                    
                    // Criar fundo com gradiente moderno
                    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
                    gradient.addColorStop(0, '#3b82f6');
                    gradient.addColorStop(0.7, '#1d4ed8');
                    gradient.addColorStop(1, '#1e40af');
                    
                    // Desenhar fundo arredondado
                    ctx.fillStyle = gradient;
                    const radius = size * 0.2;
                    ctx.beginPath();
                    ctx.roundRect(0, 0, size, size, radius);
                    ctx.fill();
                    
                    // Adicionar brilho sutil
                    const glowGradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/3);
                    glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
                    glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    ctx.fillStyle = glowGradient;
                    ctx.fill();
                    
                    // Desenhar logo centralizado com padding
                    const logoSize = size * 0.7;
                    const logoX = (size - logoSize) / 2;
                    const logoY = (size - logoSize) / 2;
                    
                    // Adicionar sombra ao logo
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                    ctx.shadowBlur = size * 0.05;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = size * 0.02;
                    
                    ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
                    
                    // Resetar sombra
                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                    
                    // Salvar para download
                    generatedIcons[size] = canvas;
                    
                    // Atualizar preview
                    const previewCanvas = iconPreviews.children[index].querySelector('canvas');
                    const previewCtx = previewCanvas.getContext('2d');
                    previewCtx.drawImage(canvas, 0, 0, 64, 64);
                    
                    // Atualizar preview final com o maior tamanho
                    if (size === 512) {
                        const finalCtx = previewCanvas.getContext('2d');
                        finalCtx.drawImage(canvas, 0, 0, 128, 128);
                    }
                    
                    if (index === sizes.length - 1) {
                        status.innerHTML = '✅ Todos os ícones foram gerados com sucesso!';
                        status.className = 'status success';
                        downloadBtn.disabled = false;
                        instructions.style.display = 'block';
                    }
                }, index * 150);
            });
        }
        
        function downloadAll() {
            Object.keys(generatedIcons).forEach(size => {
                const canvas = generatedIcons[size];
                canvas.toBlob(function(blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = \`icon-\${size}x\${size}.png\`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 'image/png');
            });
            
            status.innerHTML = '📥 Downloads iniciados! Copie os arquivos para client/public/';
            status.className = 'status success';
        }
    </script>
</body>
</html>`;

// Salvar o gerador HTML
fs.writeFileSync(path.join(__dirname, 'public', 'criador-icone.html'), iconGeneratorHTML);
console.log('✅ Criador de ícones criado: criador-icone.html');

// Atualizar manifest para usar ícones PNG
const manifest = {
  "short_name": "AgendaPro",
  "name": "AgendaPro - Sistema de Agendamento",
  "description": "Sistema de agendamento online",
  "icons": [
    {
      "src": "icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#3b82f6",
  "background_color": "#ffffff",
  "orientation": "any",
  "scope": "/"
};

// Salvar manifest atualizado
fs.writeFileSync(
  path.join(__dirname, 'public', 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);

console.log('✅ Manifest atualizado para usar ícones PNG');
console.log('\n🎉 Pronto! Agora você tem:');
console.log('\n📱 Para criar os ícones PNG:');
console.log('1. Acesse: http://localhost:3000/criador-icone.html');
console.log('2. Clique em "Gerar Ícones Personalizados"');
console.log('3. Clique em "Baixar Todos os Ícones"');
console.log('4. Copie os arquivos PNG para client/public/');
console.log('5. Reinstale o PWA no celular');
console.log('\n💡 Os ícones terão:');
console.log('- Fundo azul gradiente moderno');
console.log('- Seu logo centralizado');
console.log('- Cantos arredondados');
console.log('- Efeito de brilho sutil');
console.log('- Sombras para profundidade');
console.log('\n🎯 Resultado: Ícone profissional e personalizado!');

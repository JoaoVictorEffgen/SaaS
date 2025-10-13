const fs = require('fs');
const path = require('path');

// Script final para criar ícones PWA usando o logo.png
console.log('🎨 Criando ícones PWA finais com seu logo...');

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

// Criar um HTML que vai gerar os ícones PNG automaticamente
const iconGeneratorHTML = `<!DOCTYPE html>
<html>
<head>
    <title>Gerador de Ícones PWA</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            background: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .preview {
            display: inline-block;
            margin: 10px;
            text-align: center;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background: white;
        }
        canvas {
            border: 1px solid #ccc;
            margin: 5px;
        }
        button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            margin: 10px 5px;
        }
        button:hover {
            background: #2563eb;
        }
        .status {
            margin: 20px 0;
            padding: 15px;
            border-radius: 5px;
            background: #e7f3ff;
            border-left: 4px solid #3b82f6;
        }
        .success {
            background: #e7f5e7;
            border-left-color: #28a745;
            color: #155724;
        }
        .error {
            background: #ffe7e7;
            border-left-color: #dc3545;
            color: #721c24;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 Gerador de Ícones PWA</h1>
        <p>Este gerador vai criar ícones PNG em todos os tamanhos necessários para o PWA, usando seu logo personalizado.</p>
        
        <div id="status" class="status">
            Carregando seu logo...
        </div>
        
        <div id="previews"></div>
        
        <div style="text-align: center; margin: 30px 0;">
            <button onclick="generateAllIcons()" id="generateBtn" disabled>
                🚀 Gerar Todos os Ícones
            </button>
            <button onclick="downloadAll()" id="downloadBtn" disabled>
                📥 Baixar Todos os Ícones
            </button>
        </div>
        
        <div id="instructions" style="display: none; background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
            <h3>📋 Próximos Passos:</h3>
            <ol>
                <li>Clique em "Baixar Todos os Ícones"</li>
                <li>Os arquivos PNG serão baixados automaticamente</li>
                <li>Copie os arquivos para a pasta <code>client/public/</code></li>
                <li>Reinstale o PWA no celular</li>
            </ol>
        </div>
    </div>
    
    <script>
        const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
        const previews = document.getElementById('previews');
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
            status.innerHTML = '✅ Logo carregado com sucesso! Clique em "Gerar Todos os Ícones" para continuar.';
            status.className = 'status success';
            generateBtn.disabled = false;
            
            // Criar previews
            sizes.forEach(size => {
                const preview = document.createElement('div');
                preview.className = 'preview';
                preview.innerHTML = \`
                    <div><strong>\${size}x\${size}</strong></div>
                    <canvas width="64" height="64" style="border: 1px solid #ccc;"></canvas>
                    <div>Ícone \${size}px</div>
                \`;
                previews.appendChild(preview);
            });
        };
        
        img.onerror = function() {
            status.innerHTML = '❌ Erro ao carregar o logo. Verifique se o arquivo existe em: logo-base.png';
            status.className = 'status error';
        };
        
        img.src = 'logo-base.png';
        
        function generateAllIcons() {
            if (!logoImage) {
                alert('Logo não carregado!');
                return;
            }
            
            status.innerHTML = '🎨 Gerando ícones...';
            status.className = 'status';
            
            sizes.forEach((size, index) => {
                setTimeout(() => {
                    const canvas = document.createElement('canvas');
                    canvas.width = size;
                    canvas.height = size;
                    const ctx = canvas.getContext('2d');
                    
                    // Criar fundo com gradiente azul
                    const gradient = ctx.createLinearGradient(0, 0, size, size);
                    gradient.addColorStop(0, '#3b82f6');
                    gradient.addColorStop(1, '#2563eb');
                    
                    // Desenhar fundo arredondado
                    ctx.fillStyle = gradient;
                    const radius = size * 0.15;
                    ctx.beginPath();
                    ctx.roundRect(0, 0, size, size, radius);
                    ctx.fill();
                    
                    // Desenhar logo centralizado
                    const logoSize = size * 0.8;
                    const logoX = (size - logoSize) / 2;
                    const logoY = (size - logoSize) / 2;
                    ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
                    
                    // Salvar para download
                    generatedIcons[size] = canvas;
                    
                    // Atualizar preview
                    const previewCanvas = previews.children[index].querySelector('canvas');
                    const previewCtx = previewCanvas.getContext('2d');
                    previewCtx.drawImage(canvas, 0, 0, 64, 64);
                    
                    if (index === sizes.length - 1) {
                        status.innerHTML = '✅ Todos os ícones foram gerados com sucesso!';
                        status.className = 'status success';
                        downloadBtn.disabled = false;
                        instructions.style.display = 'block';
                    }
                }, index * 100);
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
fs.writeFileSync(path.join(__dirname, 'public', 'gerador-icones.html'), iconGeneratorHTML);
console.log('✅ Gerador HTML criado: gerador-icones.html');

// Criar manifest que usa o logo diretamente (solução temporária)
const manifest = {
  "short_name": "AgendaPro",
  "name": "AgendaPro - Sistema de Agendamento",
  "description": "Sistema de agendamento online",
  "icons": [
    {
      "src": "logo-base.png",
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

// Salvar manifest simplificado
fs.writeFileSync(
  path.join(__dirname, 'public', 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);

console.log('✅ Manifest simplificado criado (usa logo diretamente)');
console.log('\n🎉 Pronto! Agora você tem duas opções:');
console.log('\n📱 OPÇÃO 1 - Teste Rápido:');
console.log('1. Acesse: http://localhost:3000');
console.log('2. Limpe cache do celular');
console.log('3. Reinstale o PWA');
console.log('4. Deve mostrar seu logo!');
console.log('\n🎨 OPÇÃO 2 - Ícones Profissionais:');
console.log('1. Acesse: http://localhost:3000/gerador-icones.html');
console.log('2. Clique em "Gerar Todos os Ícones"');
console.log('3. Clique em "Baixar Todos os Ícones"');
console.log('4. Copie os arquivos PNG para client/public/');
console.log('5. Reinstale o PWA');
console.log('\n💡 Recomendo testar a OPÇÃO 1 primeiro!');

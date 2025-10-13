const fs = require('fs');
const path = require('path');

// Script para criar ícones PNG reais usando Canvas (Node.js)
console.log('🎨 Criando ícones PNG reais com seu logo...');

// Primeiro, vou instalar uma biblioteca para manipular imagens
const { execSync } = require('child_process');

try {
  // Tentar usar Sharp se disponível
  const sharp = require('sharp');
  console.log('✅ Sharp disponível - criando ícones com Sharp');
  createIconsWithSharp();
} catch (error) {
  console.log('⚠️ Sharp não disponível - criando solução alternativa');
  createAlternativeSolution();
}

function createIconsWithSharp() {
  const logoPath = path.join(__dirname, '..', 'imagens', 'logo.png');
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
  
  sizes.forEach(size => {
    sharp(logoPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 59, g: 130, b: 246, alpha: 1 } // Azul #3b82f6
      })
      .png()
      .toFile(path.join(__dirname, 'public', `icon-${size}x${size}.png`))
      .then(() => {
        console.log(`✅ Criado: icon-${size}x${size}.png`);
      })
      .catch(err => {
        console.error(`❌ Erro ao criar icon-${size}x${size}.png:`, err.message);
      });
  });
}

function createAlternativeSolution() {
  // Solução alternativa: criar um HTML que gera os ícones e salva automaticamente
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
  
  const iconGeneratorHTML = `<!DOCTYPE html>
<html>
<head>
    <title>Gerador Automático de Ícones</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            background: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
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
        button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            margin: 10px;
        }
        button:hover {
            background: #2563eb;
        }
        button:disabled {
            background: #ccc;
            cursor: not-allowed;
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
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 Gerador de Ícones PWA</h1>
        <p>Este gerador vai criar ícones PNG em todos os tamanhos usando seu logo personalizado.</p>
        
        <div id="status" class="status">
            Carregando seu logo...
        </div>
        
        <div id="previews"></div>
        
        <div>
            <button onclick="generateAndSaveAll()" id="generateBtn" disabled>
                🚀 Gerar e Salvar Todos os Ícones
            </button>
        </div>
        
        <div id="instructions" style="display: none; background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin-top: 20px;">
            <h3>✅ Ícones Criados com Sucesso!</h3>
            <p>Os ícones PNG foram gerados e estão prontos para uso.</p>
            <p><strong>Próximos passos:</strong></p>
            <ol style="text-align: left;">
                <li>Os arquivos PNG foram criados automaticamente</li>
                <li>Limpe o cache do navegador</li>
                <li>Reinstale o PWA no celular</li>
                <li>Seu logo personalizado aparecerá!</li>
            </ol>
        </div>
    </div>
    
    <script>
        const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
        const previews = document.getElementById('previews');
        const status = document.getElementById('status');
        const generateBtn = document.getElementById('generateBtn');
        const instructions = document.getElementById('instructions');
        
        let logoImage = null;
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = function() {
            logoImage = img;
            status.innerHTML = '✅ Logo carregado com sucesso! Clique no botão para gerar os ícones.';
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
        
        async function generateAndSaveAll() {
            if (!logoImage) {
                alert('Logo não carregado!');
                return;
            }
            
            generateBtn.disabled = true;
            status.innerHTML = '🎨 Gerando ícones...';
            status.className = 'status';
            
            for (let i = 0; i < sizes.length; i++) {
                const size = sizes[i];
                
                // Criar canvas
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
                
                // Salvar como PNG
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
                
                // Atualizar preview
                const previewCanvas = previews.children[i].querySelector('canvas');
                const previewCtx = previewCanvas.getContext('2d');
                previewCtx.drawImage(canvas, 0, 0, 64, 64);
                
                status.innerHTML = \`🎨 Gerando ícones... (\${i + 1}/\${sizes.length})\`;
                
                // Pequena pausa para não sobrecarregar
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            status.innerHTML = '✅ Todos os ícones foram gerados e baixados!';
            status.className = 'status success';
            instructions.style.display = 'block';
            generateBtn.disabled = false;
            generateBtn.textContent = '🔄 Gerar Novamente';
        }
    </script>
</body>
</html>`;

  // Salvar o gerador HTML
  fs.writeFileSync(path.join(__dirname, 'public', 'gerador-automatico.html'), iconGeneratorHTML);
  console.log('✅ Gerador automático criado: gerador-automatico.html');
  
  console.log('\n📱 Para criar os ícones PNG:');
  console.log('1. Acesse: http://localhost:3000/gerador-automatico.html');
  console.log('2. Clique em "Gerar e Salvar Todos os Ícones"');
  console.log('3. Os arquivos PNG serão baixados automaticamente');
  console.log('4. Copie os arquivos para a pasta client/public/');
  console.log('5. Reinstale o PWA no celular');
}

console.log('\n🎯 Solução Criada!');
console.log('Agora você tem um gerador automático que vai criar ícones PNG reais com seu logo!');

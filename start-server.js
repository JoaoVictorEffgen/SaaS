#!/usr/bin/env node

// =============================================
// SCRIPT DE INICIALIZAÇÃO DO SERVIDOR
// =============================================

const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 Iniciando SaaS AgendaPro...');
console.log('📁 Diretório:', process.cwd());

// Verificar se estamos no diretório correto
const serverDir = path.join(process.cwd(), 'server');
const clientDir = path.join(process.cwd(), 'client');

console.log('🔍 Verificando estrutura do projeto...');

// Função para executar comandos
function runCommand(command, args, cwd, name) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Iniciando ${name}...`);
    
    const process = spawn(command, args, {
      cwd: cwd,
      stdio: 'inherit',
      shell: true
    });

    process.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${name} encerrado com sucesso`);
        resolve();
      } else {
        console.log(`❌ ${name} encerrado com código ${code}`);
        reject(new Error(`Process exited with code ${code}`));
      }
    });

    process.on('error', (error) => {
      console.error(`❌ Erro ao iniciar ${name}:`, error);
      reject(error);
    });
  });
}

// Iniciar servidor
async function startServer() {
  try {
    console.log('🔧 Iniciando servidor Node.js...');
    await runCommand('node', ['app.js'], serverDir, 'Servidor Backend');
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Iniciar cliente (opcional)
async function startClient() {
  try {
    console.log('🎨 Iniciando cliente React...');
    await runCommand('npm', ['start'], clientDir, 'Cliente Frontend');
  } catch (error) {
    console.error('❌ Erro ao iniciar cliente:', error);
  }
}

// Verificar argumentos da linha de comando
const args = process.argv.slice(2);
const startClientFlag = args.includes('--client') || args.includes('-c');

// Iniciar aplicação
async function main() {
  if (startClientFlag) {
    console.log('🚀 Iniciando servidor e cliente...');
    // Iniciar ambos em paralelo
    Promise.all([
      startServer(),
      startClient()
    ]).catch(error => {
      console.error('❌ Erro ao iniciar aplicação:', error);
      process.exit(1);
    });
  } else {
    console.log('🚀 Iniciando apenas o servidor...');
    startServer();
  }
}

// Capturar sinais de interrupção
process.on('SIGINT', () => {
  console.log('\n🛑 Interrompido pelo usuário');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Terminado pelo sistema');
  process.exit(0);
});

// Iniciar aplicação
main();

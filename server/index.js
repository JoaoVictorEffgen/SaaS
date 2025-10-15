// 🚀 Servidor Principal - Usando Arquitetura de Pacotes
const application = require('./packages');
const { ENV_CONFIG } = require('./packages/shared/constants');

/**
 * Função principal para iniciar o servidor
 */
async function startServer() {
  try {
    console.log('🚀 Iniciando Sistema SaaS de Agendamentos...');
    console.log(`🌍 Ambiente: ${ENV_CONFIG.NODE_ENV}`);
    console.log(`🔗 Porta: ${ENV_CONFIG.PORT}`);
    
    // Iniciar aplicação com nova arquitetura
    await application.start(ENV_CONFIG.PORT);
    
    console.log('✅ Sistema iniciado com sucesso!');
    console.log('📚 Documentação: http://localhost:' + ENV_CONFIG.PORT + '/api/public/info');
    console.log('🔍 Health Check: http://localhost:' + ENV_CONFIG.PORT + '/api/health');
    
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Iniciar servidor se este arquivo for executado diretamente
if (require.main === module) {
  startServer();
}

module.exports = application;
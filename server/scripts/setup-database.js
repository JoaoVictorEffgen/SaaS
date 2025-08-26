const { sequelize } = require('../config/database');
const { User, Agenda, Agendamento, Subscription } = require('../models');

async function setupDatabase() {
  try {
    console.log('🚀 Iniciando configuração do banco de dados...');
    
    // Testar conexão
    await sequelize.authenticate();
    console.log('✅ Conexão com banco estabelecida');
    
    // Sincronizar modelos (criar tabelas)
    console.log('📋 Sincronizando modelos...');
    await sequelize.sync({ force: true }); // force: true recria todas as tabelas
    console.log('✅ Tabelas criadas/atualizadas');
    
    // Criar usuário administrador padrão
    console.log('👤 Criando usuário administrador...');
    const adminUser = await User.create({
      nome: 'Administrador',
      email: 'admin@agendapro.com',
      senha: 'admin123',
      empresa: 'AgendaPro',
      plano: 'business',
      status: 'ativo',
      email_verificado: true,
      configuracoes: {
        notificacoes_email: true,
        notificacoes_whatsapp: true,
        horario_padrao: '09:00',
        duracao_padrao: 60,
        intervalo_agendamento: 30,
        dias_trabalho: [1, 2, 3, 4, 5],
        horario_inicio: '08:00',
        horario_fim: '18:00'
      }
    });
    console.log('✅ Usuário administrador criado:', adminUser.email);
    
    // Criar assinatura para o admin
    const adminSubscription = await Subscription.create({
      usuario_id: adminUser.id,
      plano: 'business',
      status: 'ativo',
      preco_mensal: 99.90,
      data_inicio: new Date(),
      data_fim: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
      recursos_inclusos: {
        whatsapp: true,
        relatorios: true,
        multiusuario: true,
        personalizacao: true,
        integracoes: true,
        suporte_prioritario: true
      }
    });
    console.log('✅ Assinatura Business criada para admin');
    
    // Criar usuário de exemplo (plano free)
    console.log('👤 Criando usuário de exemplo...');
    const exampleUser = await User.create({
      nome: 'João Silva',
      email: 'joao@exemplo.com',
      senha: '123456',
      empresa: 'Consultoria Silva',
      plano: 'free',
      status: 'ativo',
      email_verificado: true,
      configuracoes: {
        notificacoes_email: true,
        notificacoes_whatsapp: false,
        horario_padrao: '10:00',
        duracao_padrao: 45,
        intervalo_agendamento: 15,
        dias_trabalho: [1, 2, 3, 4, 5],
        horario_inicio: '09:00',
        horario_fim: '17:00'
      }
    });
    console.log('✅ Usuário de exemplo criado:', exampleUser.email);
    
    // Criar assinatura gratuita
    const freeSubscription = await Subscription.create({
      usuario_id: exampleUser.id,
      plano: 'free',
      status: 'ativo',
      preco_mensal: 0.00,
      data_inicio: new Date(),
      data_fim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      limite_agendamentos: 10,
      recursos_inclusos: {
        whatsapp: false,
        relatorios: false,
        multiusuario: false,
        personalizacao: false,
        integracoes: false,
        suporte_prioritario: false
      }
    });
    console.log('✅ Assinatura Free criada para usuário de exemplo');
    
    // Criar algumas agendas de exemplo
    console.log('📅 Criando agendas de exemplo...');
    
    // Agenda para hoje
    const hoje = new Date();
    const agenda1 = await Agenda.create({
      usuario_id: exampleUser.id,
      titulo: 'Consulta de Psicologia',
      descricao: 'Sessão de terapia individual',
      data: hoje.toISOString().split('T')[0],
      hora_inicio: '09:00',
      hora_fim: '17:00',
      duracao: 45,
      intervalo: 15,
      max_agendamentos: 16,
      status: 'disponivel',
      tipo: 'unico',
      preco: 120.00,
      local: 'Consultório - Rua das Flores, 123',
      cor: '#3B82F6',
      tags: ['psicologia', 'terapia', 'individual']
    });
    
    // Agenda para amanhã
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);
    const agenda2 = await Agenda.create({
      usuario_id: exampleUser.id,
      titulo: 'Avaliação Inicial',
      descricao: 'Primeira consulta para novos pacientes',
      data: amanha.toISOString().split('T')[0],
      hora_inicio: '14:00',
      hora_fim: '18:00',
      duracao: 60,
      intervalo: 30,
      max_agendamentos: 8,
      status: 'disponivel',
      tipo: 'unico',
      preco: 150.00,
      local: 'Consultório - Rua das Flores, 123',
      cor: '#10B981',
      tags: ['avaliação', 'primeira consulta', '60min']
    });
    
    console.log('✅ 2 agendas de exemplo criadas');
    
    // Criar alguns agendamentos de exemplo
    console.log('📝 Criando agendamentos de exemplo...');
    
    const agendamento1 = await Agendamento.create({
      agenda_id: agenda1.id,
      usuario_id: exampleUser.id,
      cliente_nome: 'Maria Santos',
      cliente_email: 'maria@email.com',
      cliente_telefone: '(11) 99999-9999',
      cliente_observacoes: 'Primeira consulta, preferência por manhã',
      data: hoje.toISOString().split('T')[0],
      hora_inicio: '09:00',
      hora_fim: '09:45',
      duracao: 45,
      status: 'confirmado',
      tipo: 'presencial',
      local: 'Consultório - Rua das Flores, 123',
      preco: 120.00,
      pagamento_status: 'pago',
      confirmacao_enviada: true
    });
    
    const agendamento2 = await Agendamento.create({
      agenda_id: agenda1.id,
      usuario_id: exampleUser.id,
      cliente_nome: 'Pedro Oliveira',
      cliente_email: 'pedro@email.com',
      cliente_telefone: '(11) 88888-8888',
      cliente_observacoes: 'Retorno, última consulta foi há 2 semanas',
      data: hoje.toISOString().split('T')[0],
      hora_inicio: '10:00',
      hora_fim: '10:45',
      duracao: 45,
      status: 'confirmado',
      tipo: 'presencial',
      local: 'Consultório - Rua das Flores, 123',
      preco: 120.00,
      pagamento_status: 'pendente',
      confirmacao_enviada: true
    });
    
    console.log('✅ 2 agendamentos de exemplo criados');
    
    // Atualizar contadores das agendas
    await agenda1.update({ agendamentos_atuais: 2 });
    await agenda2.update({ agendamentos_atuais: 0 });
    
    // Atualizar contador de agendamentos utilizados na assinatura
    await freeSubscription.update({ agendamentos_utilizados: 2 });
    
    console.log('✅ Contadores atualizados');
    
    console.log('\n🎉 Configuração do banco concluída com sucesso!');
    console.log('\n📋 Resumo:');
    console.log(`   • Usuário Admin: admin@agendapro.com / admin123`);
    console.log(`   • Usuário Exemplo: joao@exemplo.com / 123456`);
    console.log(`   • 2 agendas criadas`);
    console.log(`   • 2 agendamentos criados`);
    console.log(`   • Assinaturas configuradas`);
    
    console.log('\n🔗 URLs de acesso:');
    console.log(`   • Frontend: http://localhost:3000`);
    console.log(`   • Backend: http://localhost:5000`);
    console.log(`   • API Health: http://localhost:5000/api/health`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erro na configuração do banco:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase }; 
const bcrypt = require('bcrypt');
const { User, Empresa, Servico, Promocao } = require('../models');

const SENHA_DEMO = '123456';

async function seedLocalDev() {
  try {
    const existingUsers = await User.count();
    if (existingUsers > 0) {
      console.log('ℹ️ [SEED] Banco já possui dados, seed ignorado');
      return;
    }

    console.log('🌱 [SEED] Criando dados demo para primeiro acesso local...');
    const senhaHash = await bcrypt.hash(SENHA_DEMO, 10);

    const empresaUser = await User.create({
      id: 1,
      tipo: 'empresa',
      nome: 'Empresa Demo',
      email: 'empresa@local.dev',
      senha: senhaHash,
      telefone: '(11) 99999-0001',
      cnpj: '12.345.678/0001-90',
      razao_social: 'Empresa Demo LTDA',
      ativo: true
    });

    const empresa = await Empresa.create({
      id: 1,
      nome: 'Salão Beleza Demo',
      cnpj: '12.345.678/0001-90',
      telefone: '(11) 99999-0001',
      user_id: empresaUser.id,
      endereco: 'Rua Demo, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01000-000',
      descricao: 'Empresa de demonstração para testes locais',
      whatsapp: '(11) 99999-0001',
      ativo: true,
      identificador_empresa: 'DEMO001'
    });

    await User.create({
      id: 2,
      tipo: 'cliente',
      nome: 'Cliente Demo',
      email: 'cliente@local.dev',
      senha: senhaHash,
      telefone: '(11) 98888-0002',
      ativo: true
    });

    await User.create({
      id: 3,
      tipo: 'funcionario',
      nome: 'Funcionario Demo',
      email: 'funcionario@local.dev',
      senha: senhaHash,
      telefone: '(11) 97777-0003',
      cpf: '123.456.789-00',
      empresa_id: empresa.id,
      ativo: true
    });

    await Servico.create({
      empresa_id: empresa.id,
      nome: 'Corte de Cabelo',
      descricao: 'Corte masculino ou feminino',
      preco: 45.0,
      duracao_minutos: 30,
      ativo: true
    });

    await Servico.create({
      empresa_id: empresa.id,
      nome: 'Barba',
      descricao: 'Barba completa',
      preco: 25.0,
      duracao_minutos: 20,
      ativo: true
    });

    await Promocao.create({
      empresa_id: empresa.id,
      nome: 'Promoção de Boas-Vindas',
      descricao: '10% de desconto no primeiro agendamento',
      tipo_desconto: 'percentual',
      valor_desconto: 10,
      data_inicio: new Date(),
      data_fim: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      ativo: true,
      destaque: true
    });

    console.log('✅ [SEED] Dados demo criados com sucesso');
    console.log('   Empresa: empresa@local.dev / 123456');
    console.log('   Cliente: cliente@local.dev / 123456');
    console.log('   Funcionário: funcionario@local.dev / 123456');
  } catch (error) {
    console.error('❌ [SEED] Erro ao criar dados demo:', error.message);
  }
}

module.exports = seedLocalDev;

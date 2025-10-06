const mysql = require('mysql2/promise');

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔍 Conectando ao MySQL...');
    
    // Conectar diretamente ao banco SaaS
    connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: 'Cecilia@2020',
      database: 'SaaS'
    });
    
    console.log('✅ Conexão estabelecida');
    
    // Criar tabelas
    console.log('📋 Criando tabelas...');
    
    // Tabela de usuários (empresas, funcionários, clientes)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tipo ENUM('empresa', 'funcionario', 'cliente') NOT NULL,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        telefone VARCHAR(20),
        cpf VARCHAR(14),
        cnpj VARCHAR(18),
        razao_social VARCHAR(255),
        empresa_id INT,
        cargo VARCHAR(100),
        foto_url VARCHAR(500),
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_tipo (tipo),
        INDEX idx_email (email),
        INDEX idx_empresa_id (empresa_id)
      )
    `);
    
    // Tabela de empresas (dados específicos)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS empresas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        endereco TEXT,
        cidade VARCHAR(100),
        estado VARCHAR(2),
        cep VARCHAR(10),
        descricao TEXT,
        horario_funcionamento JSON,
        logo_url VARCHAR(500),
        website VARCHAR(255),
        instagram VARCHAR(255),
        whatsapp VARCHAR(20),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Tabela de serviços
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS servicos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        empresa_id INT NOT NULL,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        duracao_minutos INT NOT NULL DEFAULT 60,
        preco DECIMAL(10, 2) NOT NULL,
        categoria VARCHAR(100),
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (empresa_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Tabela de agendamentos
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS agendamentos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cliente_id INT NOT NULL,
        funcionario_id INT NOT NULL,
        empresa_id INT NOT NULL,
        data DATE NOT NULL,
        hora TIME NOT NULL,
        status ENUM('em_aprovacao', 'agendado', 'confirmado', 'realizado', 'cancelado') DEFAULT 'em_aprovacao',
        observacoes TEXT,
        valor_total DECIMAL(10, 2),
        data_confirmacao TIMESTAMP NULL,
        data_realizacao TIMESTAMP NULL,
        data_cancelamento TIMESTAMP NULL,
        justificativa_cancelamento TEXT,
        cancelado_por ENUM('cliente', 'funcionario', 'sistema'),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_cliente_id (cliente_id),
        INDEX idx_funcionario_id (funcionario_id),
        INDEX idx_empresa_id (empresa_id),
        INDEX idx_data_hora (data, hora),
        INDEX idx_status (status),
        FOREIGN KEY (cliente_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (funcionario_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (empresa_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Tabela de agendamento_servicos (relacionamento muitos para muitos)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS agendamento_servicos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        agendamento_id INT NOT NULL,
        servico_id INT NOT NULL,
        quantidade INT DEFAULT 1,
        preco_unitario DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id) ON DELETE CASCADE,
        FOREIGN KEY (servico_id) REFERENCES servicos(id) ON DELETE CASCADE
      )
    `);
    
    // Tabela de notificações
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notificacoes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        tipo ENUM('agendamento', 'confirmacao', 'cancelamento', 'lembrete') NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        mensagem TEXT NOT NULL,
        lida BOOLEAN DEFAULT false,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        data_leitura TIMESTAMP NULL,
        agendamento_id INT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id) ON DELETE SET NULL
      )
    `);
    
    // Tabela de avaliações
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS avaliacoes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cliente_id INT NOT NULL,
        empresa_id INT NOT NULL,
        agendamento_id INT NOT NULL,
        nota INT NOT NULL CHECK (nota >= 1 AND nota <= 5),
        comentario TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (empresa_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id) ON DELETE CASCADE,
        UNIQUE KEY unique_agendamento_avaliacao (agendamento_id)
      )
    `);
    
    console.log('✅ Todas as tabelas criadas com sucesso!');
    
    // Verificar se já existem dados
    const [userCount] = await connection.execute('SELECT COUNT(*) as total FROM users');
    
    if (userCount[0].total === 0) {
      console.log('🌱 Inserindo dados de teste...');
      
      // Inserir empresa de teste
      await connection.execute(`
        INSERT INTO users (tipo, nome, email, senha, cnpj, razao_social) VALUES 
        ('empresa', 'Barbearia Moderna', 'contato@barbeariamoderna.com', '$2b$10$example', '12.345.678/0001-90', 'Barbearia Moderna Ltda')
      `);
      
      const [empresaResult] = await connection.execute('SELECT LAST_INSERT_ID() as id');
      const empresaId = empresaResult[0].id;
      
      // Inserir dados da empresa
      await connection.execute(`
        INSERT INTO empresas (user_id, endereco, cidade, estado, cep, descricao, horario_funcionamento) VALUES 
        (${empresaId}, 'Rua das Flores, 123', 'São Paulo', 'SP', '01234-567', 'A melhor barbearia da cidade', '{"segunda": {"inicio": "08:00", "fim": "18:00"}, "terca": {"inicio": "08:00", "fim": "18:00"}, "quarta": {"inicio": "08:00", "fim": "18:00"}, "quinta": {"inicio": "08:00", "fim": "18:00"}, "sexta": {"inicio": "08:00", "fim": "18:00"}, "sabado": {"inicio": "08:00", "fim": "16:00"}, "domingo": null}')
      `);
      
      // Inserir funcionário de teste
      await connection.execute(`
        INSERT INTO users (tipo, nome, email, senha, cpf, empresa_id, cargo) VALUES 
        ('funcionario', 'João Silva', 'joao@barbeariamoderna.com', '$2b$10$example', '123.456.789-00', ${empresaId}, 'Barbeiro')
      `);
      
      // Inserir cliente de teste
      await connection.execute(`
        INSERT INTO users (tipo, nome, email, senha, cpf, telefone) VALUES 
        ('cliente', 'Maria Santos', 'maria@email.com', '$2b$10$example', '987.654.321-00', '(11) 99999-9999')
      `);
      
      // Inserir serviços
      await connection.execute(`
        INSERT INTO servicos (empresa_id, nome, descricao, duracao_minutos, preco, categoria) VALUES 
        (${empresaId}, 'Corte de Cabelo', 'Corte masculino moderno', 30, 25.00, 'Corte'),
        (${empresaId}, 'Barba', 'Aparar e modelar barba', 20, 15.00, 'Barba'),
        (${empresaId}, 'Corte + Barba', 'Corte completo com barba', 45, 35.00, 'Combo')
      `);
      
      console.log('✅ Dados de teste inseridos com sucesso!');
    } else {
      console.log('ℹ️ Dados já existem no banco');
    }
    
    // Mostrar resumo
    console.log('\n📊 RESUMO DO BANCO:');
    
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tabelas:', tables.map(t => Object.values(t)[0]).join(', '));
    
    const [userCountFinal] = await connection.execute('SELECT COUNT(*) as total FROM users');
    console.log('👥 Total de usuários:', userCountFinal[0].total);
    
    const [serviceCount] = await connection.execute('SELECT COUNT(*) as total FROM servicos');
    console.log('🔧 Total de serviços:', serviceCount[0].total);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão fechada');
    }
  }
}

setupDatabase();

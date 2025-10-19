// 🔄 Pacote Legacy - Compatibilidade com Rotas Existentes
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth');

// Importar rotas existentes para compatibilidade
const authRoutes = require('../../routes/auth');
const empresasRoutes = require('../../routes/empresas');
const usersRoutes = require('../../routes/users');
const agendamentosRoutes = require('../../routes/agendamentos');
const redesRoutes = require('../../routes/redes');
const empresaFuncionariosRoutes = require('../../routes/empresa-funcionarios');
const pacotesRoutes = require('../../routes/pacotes');
const promocoesRoutes = require('../../routes/promocoes');
const uploadRoutes = require('../../routes/upload');
const uploadFotosRoutes = require('../../routes/upload-fotos');
const funcionariosRoutes = require('../../routes/funcionarios');
const clientesRoutes = require('../../routes/clientes');
const notificationsRoutes = require('../../routes/notifications');

class LegacyRoutes {
  constructor() {
    this.setupRoutes();
  }

  setupRoutes() {
    // IMPORTANTE: Criar rotas públicas PRIMEIRO (sem middleware de autenticação)
    
    // Rota de login específica SEM autenticação
    router.post('/users/login', async (req, res) => {
      try {
        const { identifier, senha, tipo, companyIdentifier } = req.body;
        
        // Importar modelos diretamente
        const { User, Empresa } = require('../../models');
        const { Op } = require('sequelize');
        const bcrypt = require('bcrypt');
        const jwt = require('jsonwebtoken');
        
        console.log('🔍 Tentativa de login:', { identifier, tipo, companyIdentifier });
        
        // Buscar usuário
        let whereCondition = {
          [Op.or]: [
            { email: identifier },
            { telefone: identifier },
            { cnpj: identifier }
          ],
          tipo: tipo || 'cliente'
        };
        
        if (tipo === 'funcionario') {
          whereCondition[Op.or].push({ cpf: identifier });
          const cpfFormatado = identifier.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
          whereCondition[Op.or].push({ cpf: cpfFormatado });
          
          if (companyIdentifier) {
            const empresa = await Empresa.findOne({
              where: {
                [Op.or]: [
                  { email: companyIdentifier },
                  { telefone: companyIdentifier },
                  { cnpj: companyIdentifier },
                  { id: companyIdentifier }
                ]
              }
            });
            
            if (!empresa) {
              return res.status(401).json({ error: 'Empresa não encontrada' });
            }
            
            whereCondition.empresa_id = empresa.id;
          }
        }
        
        const user = await User.findOne({ where: whereCondition });
        
        if (!user) {
          console.log('❌ Usuário não encontrado');
          return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        
        // Verificar senha
        const senhaValida = await bcrypt.compare(senha, user.senha);
        if (!senhaValida) {
          console.log('❌ Senha inválida');
          return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        
        // Gerar token
        const token = jwt.sign(
          { 
            userId: user.id, 
            tipo: user.tipo,
            empresa_id: user.empresa_id,
            empresa_nome: user.tipo === 'empresa' ? user.razao_social : null
          },
          process.env.JWT_SECRET || 'sua-chave-secreta-aqui',
          { expiresIn: '24h' }
        );
        
        console.log('✅ Login realizado com sucesso:', user.email);
        
        res.json({
          message: 'Login realizado com sucesso!',
          token,
          user: {
            id: user.id,
            nome: user.nome,
            email: user.email,
            tipo: user.tipo,
            empresa_id: user.empresa_id
          }
        });
        
      } catch (error) {
        console.error('❌ Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    });
    
    // Outras rotas públicas
    router.use('/auth', authRoutes);
    
    // Rotas protegidas (com autenticação)
    router.use('/users', authenticateToken, usersRoutes);
    router.use('/empresas', authenticateToken, empresasRoutes);
    router.use('/agendamentos', authenticateToken, agendamentosRoutes);
    router.use('/redes', authenticateToken, redesRoutes);
    router.use('/empresas', authenticateToken, empresaFuncionariosRoutes);
    router.use('/pacotes', authenticateToken, pacotesRoutes);
    router.use('/promocoes', authenticateToken, promocoesRoutes);
    router.use('/upload', uploadRoutes); // Upload sem middleware adicional
    router.use('/uploads', uploadRoutes); // Upload sem middleware adicional
    router.use('/upload-fotos', uploadFotosRoutes); // Novo sistema de upload de fotos
    router.use('/funcionarios', authenticateToken, funcionariosRoutes);
    router.use('/clientes', authenticateToken, clientesRoutes);
    router.use('/notifications', authenticateToken, notificationsRoutes);
  }

  getRoutes() {
    return router;
  }
}

module.exports = LegacyRoutes;

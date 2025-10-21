// =============================================
// ROTAS DE RECUPERAÇÃO DE SENHA - SaaS AgendaPro
// =============================================

const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { User, Empresa } = require('../models');
const { SECURITY_CONFIG } = require('../packages/shared/constants');

const router = express.Router();

// =============================================
// CONFIGURAÇÃO DO EMAIL (SendGrid)
// =============================================

const transporter = nodemailer.createTransport({
  service: 'gmail', // Pode ser alterado para SendGrid em produção
  auth: {
    user: process.env.EMAIL_USER || 'seu-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'sua-senha-app'
  }
});

// =============================================
// FUNÇÕES AUXILIARES
// =============================================

// Gerar código de recuperação
const gerarCodigoRecuperacao = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Gerar token de recuperação
const gerarTokenRecuperacao = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Enviar email de recuperação
const enviarEmailRecuperacao = async (email, codigo, nome, tipo) => {
  const tiposUsuario = {
    empresa: 'Empresa',
    cliente: 'Cliente',
    funcionario: 'Funcionário'
  };

  const tipoTexto = tiposUsuario[tipo] || 'Usuário';

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@agendapro.com',
    to: email,
    subject: `Recuperação de Senha - ${tipoTexto}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Recuperação de Senha</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">SaaS AgendaPro</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Olá, ${nome}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Recebemos uma solicitação para redefinir a senha da sua conta ${tipoTexto}.
          </p>
          
          <div style="background: white; border: 2px solid #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
            <p style="color: #333; margin: 0 0 10px 0; font-weight: bold;">Seu código de recuperação:</p>
            <h1 style="color: #667eea; margin: 0; font-size: 36px; letter-spacing: 5px; font-family: monospace;">${codigo}</h1>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Use este código para redefinir sua senha. O código é válido por <strong>15 minutos</strong>.
          </p>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>⚠️ Importante:</strong> Se você não solicitou esta recuperação de senha, ignore este e-mail. 
              Sua senha não será alterada.
            </p>
          </div>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: white; margin: 0; font-size: 14px;">
            © 2024 SaaS AgendaPro. Todos os direitos reservados.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return false;
  }
};

// =============================================
// ROTAS
// =============================================

// POST /api/recuperar-senha - Solicitar recuperação de senha
router.post('/', async (req, res) => {
  try {
    const { email, tipo } = req.body;

    if (!email || !tipo) {
      return res.status(400).json({
        success: false,
        message: 'Email e tipo são obrigatórios'
      });
    }

    // Buscar usuário
    const user = await User.findOne({
      where: { email },
      include: tipo === 'empresa' ? [{ model: Empresa, as: 'empresa' }] : []
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se o tipo do usuário corresponde
    if (user.tipo !== tipo) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de usuário incorreto'
      });
    }

    // Gerar código de recuperação
    const codigoRecuperacao = gerarCodigoRecuperacao();
    const tokenRecuperacao = gerarTokenRecuperacao();
    const expiracao = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Salvar código no banco (usando campos temporários)
    await user.update({
      codigo_recuperacao: codigoRecuperacao,
      token_recuperacao: tokenRecuperacao,
      expiracao_recuperacao: expiracao
    });

    // Enviar email
    const nomeUsuario = user.nome || user.email;
    const emailEnviado = await enviarEmailRecuperacao(email, codigoRecuperacao, nomeUsuario, tipo);

    if (!emailEnviado) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao enviar email. Tente novamente.'
      });
    }

    res.json({
      success: true,
      message: 'Código de recuperação enviado para seu e-mail',
      expiracao: expiracao
    });

  } catch (error) {
    console.error('Erro na recuperação de senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/recuperar-senha/verificar-codigo - Verificar código de recuperação
router.post('/verificar-codigo', async (req, res) => {
  try {
    const { email, codigo, tipo } = req.body;

    if (!email || !codigo || !tipo) {
      return res.status(400).json({
        success: false,
        message: 'Email, código e tipo são obrigatórios'
      });
    }

    // Buscar usuário
    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se o código existe e não expirou
    if (!user.codigo_recuperacao || !user.expiracao_recuperacao) {
      return res.status(400).json({
        success: false,
        message: 'Código de recuperação não encontrado ou expirado'
      });
    }

    if (new Date() > user.expiracao_recuperacao) {
      return res.status(400).json({
        success: false,
        message: 'Código de recuperação expirado'
      });
    }

    if (user.codigo_recuperacao !== codigo) {
      return res.status(400).json({
        success: false,
        message: 'Código de recuperação inválido'
      });
    }

    res.json({
      success: true,
      message: 'Código verificado com sucesso',
      token: user.token_recuperacao
    });

  } catch (error) {
    console.error('Erro na verificação do código:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/recuperar-senha/redefinir - Redefinir senha
router.post('/redefinir', async (req, res) => {
  try {
    const { email, codigo, novaSenha, tipo } = req.body;

    if (!email || !codigo || !novaSenha || !tipo) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos são obrigatórios'
      });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A senha deve ter pelo menos 6 caracteres'
      });
    }

    // Buscar usuário
    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se o código existe e não expirou
    if (!user.codigo_recuperacao || !user.expiracao_recuperacao) {
      return res.status(400).json({
        success: false,
        message: 'Código de recuperação não encontrado ou expirado'
      });
    }

    if (new Date() > user.expiracao_recuperacao) {
      return res.status(400).json({
        success: false,
        message: 'Código de recuperação expirado'
      });
    }

    if (user.codigo_recuperacao !== codigo) {
      return res.status(400).json({
        success: false,
        message: 'Código de recuperação inválido'
      });
    }

    // Hash da nova senha
    const senhaHash = await bcrypt.hash(novaSenha, 10);

    // Atualizar senha e limpar campos de recuperação
    await user.update({
      senha: senhaHash,
      codigo_recuperacao: null,
      token_recuperacao: null,
      expiracao_recuperacao: null
    });

    res.json({
      success: true,
      message: 'Senha redefinida com sucesso'
    });

  } catch (error) {
    console.error('Erro na redefinição de senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

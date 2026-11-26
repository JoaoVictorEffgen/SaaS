const crypto = require('crypto');

const GENERIC_RECOVERY_MESSAGE =
  'Se os dados informados existirem, você receberá instruções para redefinir sua senha';

const normalizeRecoveryEmail = (email) => String(email || '').trim().toLowerCase();

const hashRecoveryCode = (codigo, secret = process.env.JWT_SECRET) =>
  crypto.createHash('sha256').update(`${secret}:${codigo}`).digest('hex');

const isValidRecoveryCode = (user, codigo, tipo, now = new Date()) => {
  if (!user || user.tipo !== tipo || !user.codigo_recuperacao_hash || !user.expiracao_recuperacao) {
    return false;
  }
  if (user.tentativas_recuperacao >= 5 || now > user.expiracao_recuperacao) {
    return false;
  }

  try {
    const stored = Buffer.from(String(user.codigo_recuperacao_hash), 'hex');
    const provided = Buffer.from(hashRecoveryCode(codigo), 'hex');
    if (stored.length !== provided.length) return false;
    return crypto.timingSafeEqual(stored, provided);
  } catch {
    return false;
  }
};

module.exports = {
  GENERIC_RECOVERY_MESSAGE,
  normalizeRecoveryEmail,
  hashRecoveryCode,
  isValidRecoveryCode
};

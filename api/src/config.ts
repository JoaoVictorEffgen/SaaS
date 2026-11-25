export const config = {
  port: Number(process.env.PORT) || 5000,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  timezone: process.env.TIMEZONE || 'America/Sao_Paulo',
  establishmentName: process.env.ESTABLISHMENT_NAME || 'Meu Estabelecimento',
  donoNome: process.env.DONO_NOME || 'Dono',
  donoEmail: process.env.DONO_EMAIL || 'dono@timeflow.local',
  donoSenha: process.env.DONO_SENHA || 'trocar123',
  sessaoHoras: 12
};

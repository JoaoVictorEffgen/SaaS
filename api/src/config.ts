export const config = {
  port: Number(process.env.PORT) || 5000,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  establishmentName: process.env.ESTABLISHMENT_NAME || 'Meu Estabelecimento'
};

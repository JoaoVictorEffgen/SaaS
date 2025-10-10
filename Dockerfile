# Dockerfile para o backend
FROM node:18-alpine

WORKDIR /app

# Copiar package.json e package-lock.json
COPY server/package*.json ./

# Instalar dependências
RUN npm install

# Copiar código do servidor
COPY server/ ./

# Expor porta
EXPOSE 5000

# Comando para iniciar o servidor
CMD ["node", "mysql-server.js"]

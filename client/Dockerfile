# =============================================
# DOCKERFILE - Cliente SaaS AgendaPro
# =============================================

FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Expor porta
EXPOSE 3000

# Comando de inicialização
CMD ["npm", "start"]

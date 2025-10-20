# =============================================
# DOCKERFILE - Servidor SaaS AgendaPro
# =============================================

FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Criar diretório de uploads
RUN mkdir -p uploads/fotos-perfil uploads/logos-empresa

# Expor porta
EXPOSE 5000

# Comando de inicialização
CMD ["npm", "start"]

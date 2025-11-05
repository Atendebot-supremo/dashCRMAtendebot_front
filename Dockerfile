# Build stage
FROM node:18-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Argumentos de build para variáveis de ambiente
ARG VITE_HELENA_API_URL
ARG VITE_HELENA_API_TOKEN

# Definir variáveis de ambiente para o build
ENV VITE_HELENA_API_URL=$VITE_HELENA_API_URL
ENV VITE_HELENA_API_TOKEN=$VITE_HELENA_API_TOKEN

# Build da aplicação Vite (variáveis são "baked in" no código)
RUN npm run build

# Production stage
FROM nginx:alpine

# Copiar arquivos buildados para o nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta
EXPOSE 8080

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]


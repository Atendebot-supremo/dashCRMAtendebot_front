# ===========================================
# STAGE 1: BUILD
# ===========================================
FROM node:18-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar todas as dependências (dev + prod) para build
RUN npm ci

# Copiar código fonte
COPY . .

# Argumentos de build para variáveis de ambiente Vite
# Estas variáveis são "baked in" no código durante o build
ARG VITE_HELENA_API_URL
ARG VITE_HELENA_API_TOKEN

# Definir variáveis de ambiente para o build
ENV VITE_HELENA_API_URL=$VITE_HELENA_API_URL
ENV VITE_HELENA_API_TOKEN=$VITE_HELENA_API_TOKEN

# Build da aplicação React + Vite
RUN npm run build

# ===========================================
# STAGE 2: PRODUCTION
# ===========================================
FROM nginx:alpine

# Copiar arquivos buildados do stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta 8080 (Railway usa PORT dinâmico, mas definimos padrão)
EXPOSE 8080

# Iniciar nginx em modo foreground
CMD ["nginx", "-g", "daemon off;"]


# Dockerfile multietapa para frontend Angular/Ionic
# Optimizado para producción con múltiples etapas

# ================================
# Etapa 1: Build Stage
# ================================
FROM node:20-alpine AS builder

# Metadatos del contenedor
LABEL maintainer="MAGA Development Team"
LABEL description="Frontend Angular/Ionic para aplicación MAGA"

# Instalar dependencias del sistema
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de npm primero (para aprovechar cache de Docker)
COPY package*.json ./

# Instalar dependencias (se cachea si package.json no cambia)
RUN npm ci --only=production --silent

# Copiar código fuente
COPY . .

# Construir la aplicación para producción
RUN npm run build --prod

# Verificar que el build se creó correctamente
RUN ls -la www/ && \
    test -d www/

# ================================
# Etapa 2: Runtime Stage
# ================================
FROM nginx:1.25-alpine AS runtime

# Metadatos del contenedor
LABEL maintainer="MAGA Development Team"
LABEL description="Frontend Angular/Ionic para aplicación MAGA - Nginx"
LABEL version="1.0.0"

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache \
    curl \
    tzdata && \
    # Configurar timezone
    cp /usr/share/zoneinfo/America/Mexico_City /etc/localtime && \
    echo "America/Mexico_City" > /etc/timezone

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar archivos estáticos desde la etapa de build
COPY --from=builder --chown=appuser:appgroup /app/www /usr/share/nginx/html

# Crear directorio para logs
RUN mkdir -p /var/log/nginx && \
    chown -R appuser:appgroup /var/log/nginx /var/cache/nginx /var/run

# Cambiar a usuario no-root
USER appuser

# Exponer puerto de la aplicación
EXPOSE 80

# Health check para verificar que Nginx está funcionando
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:80 || exit 1

# Comando para ejecutar Nginx
CMD ["nginx", "-g", "daemon off;"]

# ================================
# Etapa 3: Development Stage (opcional)
# ================================
FROM node:20-alpine AS development

# Instalar herramientas de desarrollo
RUN apk add --no-cache \
    git \
    curl \
    vim

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies)
RUN npm install

# Copiar código fuente
COPY . .

# Exponer puerto para desarrollo
EXPOSE 4200

# Comando para desarrollo con hot reload
CMD ["npm", "start"]
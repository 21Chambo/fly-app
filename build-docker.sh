#!/bin/bash

# Script para construir la imagen Docker del frontend MAGA
# Uso: ./build-docker.sh [tag]

set -e

# Configuración por defecto
DEFAULT_TAG="maga-frontend:latest"
TAG=${1:-$DEFAULT_TAG}

echo "🏗️  Construyendo imagen Docker del frontend MAGA..."
echo "📦 Tag: $TAG"
echo ""

# Verificar que Docker está ejecutándose
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker no está ejecutándose"
    echo "   Por favor, inicia Docker Desktop o el daemon de Docker"
    exit 1
fi

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json"
    echo "   Ejecuta este script desde el directorio del frontend"
    exit 1
fi

# Construir la imagen
echo "🔨 Construyendo imagen..."
docker build -t "$TAG" .

# Verificar que la imagen se creó correctamente
if docker images "$TAG" --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" | grep -q "$TAG"; then
    echo ""
    echo "✅ Imagen construida exitosamente!"
    echo ""
    echo "📊 Información de la imagen:"
    docker images "$TAG" --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
    echo ""
    echo "🚀 Para ejecutar el contenedor:"
    echo "   docker run -p 80:80 --name maga-frontend $TAG"
    echo ""
    echo "🔍 Para inspeccionar la imagen:"
    echo "   docker inspect $TAG"
else
    echo "❌ Error: La imagen no se construyó correctamente"
    exit 1
fi
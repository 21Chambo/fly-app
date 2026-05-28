@echo off
REM Script para construir la imagen Docker del frontend MAGA en Windows
REM Uso: build-docker.bat [tag]

setlocal enabledelayedexpansion

REM Configuración por defecto
set DEFAULT_TAG=maga-frontend:latest
if "%1"=="" (
    set TAG=%DEFAULT_TAG%
) else (
    set TAG=%1
)

echo 🏗️  Construyendo imagen Docker del frontend MAGA...
echo 📦 Tag: %TAG%
echo.

REM Verificar que Docker está ejecutándose
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Docker no está ejecutándose
    echo    Por favor, inicia Docker Desktop
    exit /b 1
)

REM Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo ❌ Error: No se encontró package.json
    echo    Ejecuta este script desde el directorio del frontend
    exit /b 1
)

REM Construir la imagen
echo 🔨 Construyendo imagen...
docker build -t "%TAG%" .

if errorlevel 1 (
    echo ❌ Error: Falló la construcción de la imagen
    exit /b 1
)

REM Verificar que la imagen se creó correctamente
docker images "%TAG%" --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" | findstr "%TAG%" >nul
if errorlevel 1 (
    echo ❌ Error: La imagen no se construyó correctamente
    exit /b 1
)

echo.
echo ✅ Imagen construida exitosamente!
echo.
echo 📊 Información de la imagen:
docker images "%TAG%" --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
echo.
echo 🚀 Para ejecutar el contenedor:
echo    docker run -p 80:80 --name maga-frontend %TAG%
echo.
echo 🔍 Para inspeccionar la imagen:
echo    docker inspect %TAG%

endlocal
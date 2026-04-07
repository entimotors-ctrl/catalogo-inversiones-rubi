#!/bin/bash

# Script para subir proyecto a GitHub
# Uso: ./push-to-github.sh [nombre-repositorio]

echo "🚀 Subiendo proyecto a GitHub..."

# Verificar si se proporcionó nombre del repositorio
if [ -z "$1" ]; then
    REPO_NAME="catalogo-digital-profesional"
else
    REPO_NAME="$1"
fi

echo "📦 Nombre del repositorio: $REPO_NAME"

# Verificar si ya existe remote origin
if git remote get-url origin >/dev/null 2>&1; then
    echo "⚠️  Remote 'origin' ya existe. Eliminando..."
    git remote remove origin
fi

# Agregar remote origin
echo "🔗 Conectando con GitHub..."
git remote add origin "https://github.com/Stwinki/$REPO_NAME.git"

# Hacer push
echo "📤 Subiendo código..."
git push -u origin master

if [ $? -eq 0 ]; then
    echo "✅ ¡Proyecto subido exitosamente!"
    echo "🌐 URL del repositorio: https://github.com/Stwinki/$REPO_NAME"
else
    echo "❌ Error al subir el proyecto. Verifica:"
    echo "   - Que el repositorio existe en GitHub"
    echo "   - Que tienes permisos para hacer push"
    echo "   - Que tu token de acceso personal es válido"
fi
#!/bin/bash

# Script para cambiar el nombre del repositorio remoto
echo "🔄 Cambiando nombre del repositorio remoto..."

if [ -z "$1" ]; then
    echo "❌ Uso: $0 <nuevo-nombre-repositorio>"
    echo "Ejemplo: $0 mi-catalogo-ferreteria"
    exit 1
fi

NUEVO_NOMBRE="$1"
URL_REMOTA="https://github.com/Stwinki/$NUEVO_NOMBRE.git"

echo "📝 Cambiando remote origin a: $URL_REMOTA"
git remote set-url origin "$URL_REMOTA"

echo "✅ Remote actualizado. Ahora:"
echo "   1. Crea el repositorio '$NUEVO_NOMBRE' en GitHub"
echo "   2. Ejecuta: git push -u origin master"
echo ""
echo "🌐 URL del nuevo repositorio: https://github.com/Stwinki/$NUEVO_NOMBRE"
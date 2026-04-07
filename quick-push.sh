#!/bin/bash

# Script rápido para hacer push al repositorio catalogo-ferreteria
echo "🚀 Subiendo código a catalogo-ferreteria..."

# Verificar que el remote esté configurado
if ! git remote get-url origin >/dev/null 2>&1; then
    echo "❌ No hay remote origin configurado"
    exit 1
fi

# Verificar que apunte al repositorio correcto
REMOTE_URL=$(git remote get-url origin)
if [[ $REMOTE_URL != *"catalogo-ferreteria"* ]]; then
    echo "⚠️  El remote no apunta a catalogo-ferreteria"
    echo "URL actual: $REMOTE_URL"
    echo "Ejecuta: git remote set-url origin https://github.com/Stwinki/catalogo-ferreteria.git"
    exit 1
fi

echo "📤 Subiendo código..."
git push -u origin master

if [ $? -eq 0 ]; then
    echo "✅ ¡Código subido exitosamente!"
    echo "🌐 https://github.com/Stwinki/catalogo-ferreteria"
else
    echo "❌ Error al subir. Asegúrate de que:"
    echo "   - El repositorio existe en GitHub"
    echo "   - Tienes permisos para hacer push"
    echo "   - El repositorio no esté vacío (si es nuevo)"
fi
# 🛍️ Catálogo - Guía de Inicio Rápido

## 📋 Requisitos
- Node.js instalado
- Supabase configurado (credenciales en `backend/.env`)

## 🚀 Para Iniciar la Aplicación

### Opción 1: Ejecutar los scripts (Recomendado)

**Terminal 1 - Backend:**
```bash
bash /home/wilkin/Escritorio/catalogo-1.0/catalogo-todo-en-uno/backend/start.sh
```

**Terminal 2 - Frontend:**
```bash
bash /home/wilkin/Escritorio/catalogo-1.0/catalogo-todo-en-uno/frontend/start.sh
```

### Opción 2: Comandos manuales

**Terminal 1 - Backend:**
```bash
cd /home/wilkin/Escritorio/catalogo-1.0/catalogo-todo-en-uno/backend
node index.js
```

**Terminal 2 - Frontend:**
```bash
cd /home/wilkin/Escritorio/catalogo-1.0/catalogo-todo-en-uno/frontend
npm run dev
```

## 🌐 Acceder a la App

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api
- **Admin Panel:** http://localhost:5173/admin
  - Usuario: admin
  - Contraseña: admin123

## 🔧 Solución de Problemas

### Error "Request failed with status code 404"
- Verifica que el **backend esté ejecutándose** en Terminal 1
- Haz clic en **"Test Backend"** en el panel de admin

### Error de conexión a SUPABASE
- Verifica las credenciales en `backend/.env`
- Conectividad a internet
- Las contraseñas con caracteres especiales están manejadas correctamente

### Frontend no se carga
- Verifica que **npm run dev** esté en ejecución
- Actualiza la página (F5)
- Borra la caché del navegador (Ctrl+Shift+Delete)

## 📂 Estructura del Proyecto

```
catalogo-todo-en-uno/
├── backend/          # API Node.js + Express
│   ├── index.js      # Servidor principal
│   ├── db.js         # Conexión a Supabase
│   ├── .env          # Variables de entorno
│   └── start.sh      # Script para iniciar
│
└── frontend/         # React + Vite
    ├── src/
    │   ├── App.jsx   # Componente principal
    │   ├── pages/    # Páginas (Login, PanelAdmin, etc)
    │   └── services/ # API calls
    └── start.sh      # Script para iniciar
```

## ✨ Funcionalidades

✅ Login seguro  
✅ Crear/Editar/Eliminar categorías  
✅ Crear/Editar/Eliminar productos  
✅ Catálogo público visualizable  
✅ Integración con Supabase  
✅ Manejo de errores robusto  

---

**¿Necesitas ayuda?** Verifica que:
1. Los scripts tienen permisos de ejecución: `chmod +x *.sh`
2. Node.js está instalado: `node --version`
3. El puerto 3000 está disponible para el backend
4. El puerto 5173 está disponible para el frontend

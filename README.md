# 🛍️ Catálogo Digital Profesional

<div align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-18.x-green?style=for-the-badge&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-4.x-646CFF?style=for-the-badge&logo=vite" alt="Vite" />
</div>

<br />

<div align="center">
  <h3>🛒 Catálogo digital inspirado en PriceSmart con diseño profesional y moderno</h3>
  <p>Interfaz elegante, responsive y optimizada para ventas online</p>
</div>

## ✨ Características Principales

### 🎨 **Diseño Profesional**
- **Inspirado en PriceSmart**: Interfaz limpia y moderna
- **Dark Mode**: Toggle entre modo claro y oscuro
- **Responsive Design**: Optimizado para móvil, tablet y desktop
- **Animaciones Suaves**: Transiciones fluidas y efectos hover

### 🛠️ **Funcionalidades**
- 🔍 **Búsqueda en Tiempo Real**: Filtra productos por nombre
- 📂 **Categorías Dinámicas**: Navegación por secciones
- 💬 **WhatsApp Integration**: Contacto directo con clientes
- 📱 **Mobile-First**: Experiencia óptima en dispositivos móviles
- 🌙 **Tema Oscuro**: Interfaz adaptable a preferencias del usuario

### 🏗️ **Arquitectura Técnica**
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Supabase
- **Base de Datos**: PostgreSQL (Supabase)
- **Estado**: React Hooks + Context API
- **Routing**: React Router v6

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18.x o superior
- Cuenta de Supabase configurada

### Instalación

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/catalogo-digital.git
   cd catalogo-digital
   ```

2. **Configura el Backend:**
   ```bash
   cd backend
   # Crea archivo .env con tus credenciales de Supabase
   cp .env.example .env
   npm install
   ```

3. **Configura el Frontend:**
   ```bash
   cd ../frontend
   npm install
   ```

### Ejecución

**Opción 1: Scripts Automáticos**
```bash
# Terminal 1 - Backend
./backend/start.sh

# Terminal 2 - Frontend
./frontend/start.sh
```

**Opción 2: Comandos Manuales**
```bash
# Terminal 1 - Backend
cd backend && node index.js

# Terminal 2 - Frontend
cd frontend && npm run dev
```

## 🌐 Acceso a la Aplicación

- **🏪 Catálogo Principal**: http://localhost:5173
- **🎭 Demo (Sin Backend)**: http://localhost:5173/demo
- **🔧 Panel de Administración**: http://localhost:5173/admin
- **🔑 Login Admin**: usuario: `admin`, contraseña: `admin123`
- **📡 API Backend**: http://localhost:3000/api

## 📁 Estructura del Proyecto

```
catalogo-digital/
├── backend/                 # API REST con Node.js
│   ├── index.js            # Servidor principal
│   ├── db.js              # Conexión a Supabase
│   ├── crearTablas.js     # Scripts de base de datos
│   └── package.json       # Dependencias backend
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── pages/         # Páginas principales
│   │   │   ├── CatalogoPublico.jsx
│   │   │   ├── CatalogoDemo.jsx
│   │   │   └── PanelAdmin.jsx
│   │   ├── components/    # Componentes reutilizables
│   │   ├── services/      # API calls
│   │   └── App.css        # Estilos personalizados
│   └── package.json       # Dependencias frontend
├── 📚 Documentación Completa/
│   ├── QUICK_START.md     # Inicio rápido detallado
│   ├── GUIA_TECNICA_UI.md # Guía técnica de UI
│   ├── CHEAT_SHEET.md     # Referencia rápida
│   └── ...
└── README.md
```

## 🎨 Personalización

### Colores Principales
```css
--color-primary: #002855    /* Azul PriceSmart */
--color-success: #25D366    /* Verde WhatsApp */
--color-bg: #f8f9fa         /* Fondo claro */
```

### Fuentes
- **Principal**: Inter (Google Fonts)
- **Secundaria**: Roboto (Google Fonts)

## 🔧 Solución de Problemas

### Error de Conexión al Backend
```bash
# Verifica que el backend esté corriendo
curl http://localhost:3000/api/categorias
```

### Problemas con Supabase
1. Verifica las credenciales en `backend/.env`
2. Asegúrate de que las tablas existan
3. Revisa la consola del navegador (F12)

### Error de Dependencias
```bash
# Reinstala dependencias
cd backend && rm -rf node_modules && npm install
cd ../frontend && rm -rf node_modules && npm install
```

## 📊 Métricas del Proyecto

- **⭐ Diseño**: Inspirado en PriceSmart
- **📱 Responsive**: 100% móvil optimizado
- **⚡ Performance**: Carga rápida con Vite
- **🎯 UX**: Interfaz intuitiva y moderna
- **🔧 Mantenibilidad**: Código bien estructurado

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🙋‍♂️ Soporte

¿Necesitas ayuda? Abre un issue en GitHub o contacta al desarrollador.

---

<div align="center">
  <p>Desarrollado con ❤️ usando React, Node.js y Supabase</p>
  <p>
    <a href="#-características-principales">Características</a> •
    <a href="#-inicio-rápido">Instalación</a> •
    <a href="#-estructura-del-proyecto">Estructura</a> •
    <a href="#-personalización">Personalización</a>
  </p>
</div>
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

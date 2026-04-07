# ⚡ CHEAT SHEET - Referencia Rápida

## 🚀 INICIAR EN 30 SEGUNDOS

```bash
# 1. Abre terminal
cd /home/wilkin/Escritorio/catalogo-1.0/catalogo-todo-en-uno/frontend

# 2. Inicia proyecto
npm run dev

# 3. Abre navegador
http://localhost:5173
```

---

## 🎨 COLORES (Hex)

| Nombre | Código | Uso |
|--------|--------|-----|
| Azul Primario | `#002855` | Header, precios, botones activos |
| Azul Gradiente | `#004080` | Header gradiente |
| Verde WhatsApp | `#25D366` | Botón CTA |
| Verde Hover | `#20a856` | Botón hover |
| Blanco | `#FFFFFF` | Fondo tarjetas |
| Gris Claro | `#F8F9FA` | Fondo general |
| Gris Bordes | `#E5E5E5` | Bordes tarjetas |
| Texto Principal | `#1A1A1A` | Texto general |
| Texto Secundario | `#666666` | Descripciones |

---

## 📐 DIMENSIONES

| Elemento | Tamaño | Notas |
|----------|--------|-------|
| Header Logo | 1.875rem (30px) | Font-weight: 800 |
| Nombre Producto | 0.95rem (15px) | Font-weight: 600 |
| Precio | 1.875rem (30px) | Font-weight: 700 |
| Descripción | 0.85rem (13.6px) | Font-weight: 400 |
| Botón Texto | 0.9rem (14.4px) | Font-weight: 600 |
| Imagen Aspecto | 1:1 | Cuadrada |
| Padding Tarjeta | 1rem (16px) | Interno |
| Gap Grid | 1.5rem (24px) | Entre tarjetas |
| Borde Redondeado | 12px | Tarjetas |
| Borde Redondeado | 8px | Botones, inputs |

---

## 🔧 CUSTOMIZACIONES RÁPIDAS

### Cambiar Número WhatsApp
**Archivo:** `src/pages/CatalogoPublico.jsx`  
**Línea:** 8

```javascript
// ANTES:
const numeroWhatsApp = "50499999999"

// DESPUÉS (tu número):
const numeroWhatsApp = "50499999999"  // Honduras
// O
const numeroWhatsApp = "34666666666"  // España
```

### Cambiar Color Primario
**Archivo:** `src/App.css`  
**Línea:** 14-18

```css
/* ANTES */
--color-primary: #002855;
--color-primary-light: #004080;

/* DESPUÉS */
--color-primary: #1e40af;        /* Tu azul */
--color-primary-light: #3b82f6;  /* Tu azul más claro */
```

### Cambiar Verde WhatsApp
**Archivo:** `src/App.css`  
**Línea:** 15

```css
/* ANTES */
--color-success: #25D366;

/* DESPUÉS */
--color-success: #10b981;  /* Tu verde */
```

### Cambiar Fuente
**Archivo:** `src/App.css`  
**Línea:** 1-3

```css
/* ANTES */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Roboto:wght@300;400;500;700&display=swap');

/* DESPUÉS */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
```

### Cambiar Columnas Grid
**Archivo:** `src/pages/CatalogoPublico.jsx`  
**Línea:** 65

```jsx
/* ANTES: 4 columnas desktop */
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

/* DESPUÉS: 3 columnas desktop */
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

/* DESPUÉS: 5 columnas desktop */
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
```

### Cambiar Efecto Hover (elevación)
**Archivo:** `src/App.css`  
**Línea:** 103-108

```css
/* ANTES: Sube 8px */
.product-card:hover {
  transform: translateY(-8px);
}

/* DESPUÉS: Sube 12px */
.product-card:hover {
  transform: translateY(-12px);
}

/* O: Sin elevación (solo sombra) */
.product-card:hover {
  transform: translateY(0px);
}
```

### Cambiar Duración Transición
**Archivo:** `src/App.css`  
**Línea:** 20

```css
/* ANTES: 300ms */
--transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* DESPUÉS: Más lento */
--transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);

/* O: Más rápido */
--transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
```

### Cambiar Altura Imagen
**Archivo:** `src/pages/CatalogoPublico.jsx`  
**Línea:** 75

```jsx
/* ANTES */
<div className="relative overflow-hidden bg-gray-200 aspect-square">

/* DESPUÉS: más alto */
<div className="relative overflow-hidden bg-gray-200 aspect-auto h-96">

/* O: Rectangular */
<div className="relative overflow-hidden bg-gray-200 aspect-video">
```

---

## 📱 BREAKPOINTS

| Nombre | Ancho | Columnas | Uso |
|--------|-------|----------|-----|
| **xs** | < 640px | 1-2 | Móvil pequeño |
| **sm** | 640px-767px | 2 | Móvil grande |
| **md** | 768px-1023px | 2-3 | Tablet |
| **lg** | 1024px-1279px | 3 | Desktop normal |
| **xl** | 1280px+ | 4 | Desktop grande |

---

## 🎬 ANIMACIONES

| Nombre | Duración | Uso |
|--------|----------|-----|
| Header slideDown | 300ms | Aparición header |
| Card fadeIn | 400ms | Aparición tarjetas |
| Card elevate | 300ms | Hover tarjeta |
| Image zoom | 400ms | Hover imagen |
| Button move | 300ms | Hover botón |

---

## 🔍 BÚSQUEDA (Cómo Funciona)

```javascript
// Busca en NOMBRE y DESCRIPCIÓN
// Case-insensitive (no importa mayúsculas)
// Tiempo real (al escribir)
// Se combina con filtro de categoría

// Ejemplo: Usuario escribe "taladro"
// Muestra: Todos los productos donde:
//   - nombre CONTIENE "taladro" O
//   - descripción CONTIENE "taladro"
```

---

## 📋 FILTROS (Cómo Funciona)

```javascript
// Primero: Se filtra por categoría activa
// Luego: Se filtra por término de búsqueda
// Resultado: Intersección de ambos filtros

// Ejemplo:
// 1. Usuario selecciona "Ferretería" → 8 productos
// 2. Usuario escribe "taladro" → 2 productos (de esos 8)
```

---

## 🗂️ ESTRUCTURA ARCHIVOS

```
frontend/
├─ src/
│  ├─ App.jsx (+ import './App.css')
│  ├─ App.css (NUEVO - 330 líneas)
│  ├─ pages/
│  │  └─ CatalogoPublico.jsx (RENOVADO)
│  └─ services/
│     └─ api.js (SIN CAMBIOS)
└─ package.json (SIN CAMBIOS)
```

---

## 🔗 API (Backend Sin Cambios)

```javascript
// GET /categorias
[
  { id: 1, nombre: "Ferretería", tema_visual: "ferreteria" },
  { id: 2, nombre: "Alimentación", tema_visual: "general" }
]

// GET /productos
[
  {
    id: 1,
    nombre: "Taladro",
    precio: "89.99",
    imagen_url: "https://...",
    descripcion: "Taladro profesional...",
    categoria_id: 1,
    categoria_nombre: "Ferretería"
  }
]
```

✅ **NO requiere cambios en backend**

---

## 🎯 CLASES CSS PRINCIPALES

```css
.sticky-header           /* Header sticky azul */
.product-card            /* Tarjeta producto */
.sidebar-categories     /* Sidebar categorías */

/* No necesitas conocer estas,
   están configuradas automáticamente */
```

---

## 🚀 COMANDOS ÚTILES

```bash
# Iniciar desarrollo
npm run dev

# Build producción
npm run build

# Preview build
npm run preview

# Limpiar cache
rm -rf node_modules/.vite

# Instalar dependencias
npm install
```

---

## 🐛 DEBUGGING TIPS

```javascript
// Ver estado de búsqueda
console.log("searchTerm:", searchTerm);
console.log("categoriaActiva:", categoriaActiva);
console.log("productosFiltrados:", productosFiltrados);

// Ver si fetch funciona
api.get('/categorias').then(res => console.log(res.data));
api.get('/productos').then(res => console.log(res.data));
```

```css
/* Agregar border rojo para ver layouts */
.product-card { border: 2px solid red !important; }
.sticky-header { border: 2px solid red !important; }
```

---

## 📊 TEST CASES

### Test 1: Búsqueda
```
1. Escribe "taladro" en buscador
2. Solo aparecen productos con "taladro"
3. Contador actualiza
4. ✅ PASS
```

### Test 2: Filtro Categoría
```
1. Click en "Ferretería"
2. Botón se pone azul
3. Solo productos de Ferretería
4. ✅ PASS
```

### Test 3: Combinado
```
1. Selecciona "Ferretería"
2. Escribe "taladro"
3. Solo taladros de Ferretería
4. ✅ PASS
```

### Test 4: Hover
```
1. Pasa mouse sobre tarjeta
2. Tarjeta sube 8px
3. Sombra aumenta
4. Imagen hace zoom 1.08x
5. ✅ PASS (suave, ~300ms)
```

### Test 5: Mobile
```
1. Abre DevTools (F12)
2. Toggle device toolbar
3. Selecciona iPhone 12
4. ✅ Ve 1-2 columnas
5. ✅ Botones grandes
6. ✅ Header compacto
```

### Test 6: WhatsApp
```
1. Click en botón "💬 Pedir por WhatsApp"
2. Abre WhatsApp Web
3. Mensaje preformateado
4. ✅ Incluye nombre y precio
```

---

## 📞 REFERENCIA RÁPIDA COLORES

**Copy-Paste ready:**

```css
Azul Primario: #002855
Azul Gradiente: #004080
Verde WhatsApp: #25D366
Verde Hover: #20a856
Blanco: #FFFFFF
Gris Claro: #F8F9FA
Gris Bordes: #E5E5E5
Texto: #1A1A1A
Texto Claro: #666666
```

---

## 🎯 VARIABLES CSS (Modificables)

```css
:root {
  --color-primary: #002855;
  --color-primary-light: #004080;
  --color-success: #25D366;
  --color-text: #1a1a1a;
  --color-text-light: #666666;
  --color-border: #e5e5e5;
  --color-bg: #f8f9fa;
  --shadow-hover: 0 20px 40px rgba(0, 40, 85, 0.2);
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Solo cambias estas y se aplica a todo el site 🎯**

---

## ⚡ PERFORMANCE

```
Header Load:     300ms slideDown
Card Load:       400ms fadeIn
Search Filter:   < 50ms (instant)
Hover Effect:    300ms suave
FPS Esperado:    60 (fluido)
Lighthouse:      95+ esperado
```

---

## ✅ PRE-LAUNCH CHECKLIST

- [ ] npm run dev inicia sin errores
- [ ] Header sticky visible
- [ ] Sidebar con categorías
- [ ] 4 columnas en desktop
- [ ] Buscador funciona
- [ ] Filtros funcionan
- [ ] Hover effects suaves
- [ ] Mobile responde bien
- [ ] WhatsApp abre con mensaje
- [ ] No hay console errors
- [ ] Performance > 90 Lighthouse

---

## 📸 SCREENSHOT REFERENCE

```
Arriba:   Header azul gradiente (sticky)
Izqda:    Sidebar categorías (sticky)
Centro:   Grid 4 columnas tarjetas
Tarjeta:  Imagen 1:1 + nombre + precio + botón WA
Hover:    ↑ +8px, sombra, zoom img
```

---

## 🎁 BONUS TIPS

```javascript
// Cambiar logo personalizado
// En CatalogoPublico.jsx línea 52:
📦 Club de Compras  →  🏪 Mi Tienda
```

```css
// Agregar branding adicional
// En App.css, agrega:
.sticky-header::after {
  content: "🎉 LO MEJOR DEL MERCADO";
  font-size: 0.75rem;
}
```

```javascript
// Agregar mensaje personalizado
// En CatalogoPublico.jsx línea 61:
onClick={() => setSearchTerm('')}  // Clear search with click
```

---

## 🔄 FLUJO DE USUARIO

```
1. Abre la app
   ↓
2. Ve header sticky arriba
   ↓
3. Busca producto (opcional)
   ↓
4. Selecciona categoría (opcional)
   ↓
5. Pasa mouse sobre tarjeta
   ↓ (Tarjeta se eleva suavemente)
   ↓
6. Hace click en "💬 Pedir por WhatsApp"
   ↓ (Abre WhatsApp con mensaje)
```

---

## 🆘 SOLUCIONES RÁPIDAS

| Problema | Solución |
|----------|----------|
| CSS no aplica | `npm run dev` y refresh (Ctrl+Shift+R) |
| Grid mal | Verifica `lg:grid-cols-4` en JSX |
| Colores raros | Limpia browser cache |
| Mobile se ve raro | Verifica breakpoints en DevTools |
| Búsqueda lento | Busca en console por errores |
| Botón WA no va | Verifica número formato +5049... |

---

## 📖 DOCS COMPLETOS

Para más detalles, consulta:
- 🚀 [QUICK_START.md](QUICK_START.md)
- 📊 [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md)
- 🎨 [VISUALIZACION_ASCII.md](VISUALIZACION_ASCII.md)
- 🔧 [GUIA_TECNICA_UI.md](GUIA_TECNICA_UI.md)
- 📝 [TRANSFORMACION_INTERFAZ.md](TRANSFORMACION_INTERFAZ.md)

---

**⚡ CHEAT SHEET v1.0 | 7 Abril 2026**


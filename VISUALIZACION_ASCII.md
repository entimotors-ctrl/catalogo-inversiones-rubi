# 🎨 VISUALIZACIÓN ASCII - INTERFAZ FINAL

## 📱 Desktop (1280px+)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║ 📦 Club de Compras                                                        ║
║                    🔍  [    Buscar productos...    ]                     ║
╚═══════════════════════════════════════════════════════════════════════════╝

┌────────────────────────────┬─────────────────────────────────────────────┐
│ 📋 CATEGORÍAS              │ 📦 PRODUCTOS (4 COLUMNAS)                   │
├────────────────────────────┤                                             │
│                            │ ┌─────────────┐ ┌─────────────┐ ┌─────────┐
│ ✓ Todos                    │ │  IMAGEN     │ │  IMAGEN     │ │  IMAGEN │
│   (azul oscuro)            │ │    1:1      │ │    1:1      │ │   1:1   │
│                            │ │             │ │             │ │         │
│ • Ferretería               │ ├─────────────┤ ├─────────────┤ ├─────────┤
│   (hover: bg-gray-100)     │ │ Taladro     │ │ Martillo    │ │ Clavo   │
│                            │ │ Profesional │ │ Industrial  │ │ Caja    │
│ • Alimentación             │ │             │ │             │ │         │
│   (hover: bg-gray-100)     │ │ $89.99      │ │ $45.50      │ │ $12.99  │
│                            │ │ (azul oscuro)│ │ (azul oscuro│ │(azul os │
│ • Electrónica              │ │             │ │             │ │         │
│   (hover: bg-gray-100)     │ │ 💬 Pedir WA │ │ 💬 Pedir WA │ │💬 Pedir │
│                            │ │ (verde #25) │ │ (verde #25) │ │ (verde) │
│ • Ropa                     │ └─────────────┘ └─────────────┘ └─────────┘
│   (hover: bg-gray-100)     │    ↑ HOVER:          ↑ HOVER:       ↑ HOVER:
│                            │  Eleva 8px        Eleva 8px      Eleva 8px
│ • Hogar                    │  Sombra +         Sombra +       Sombra +
│   (hover: bg-gray-100)     │  Zoom 1.08x       Zoom 1.08x     Zoom 1.08x
│                            │
│                            │ ┌─────────────┐ ┌─────────────┐ ┌─────────┐
│ (Sticky top: 96px)         │ │  IMAGEN     │ │  IMAGEN     │ │  IMAGEN │
│                            │ │    1:1      │ │    1:1      │ │   1:1   │
│                            │ ├─────────────┤ ├─────────────┤ ├─────────┤
│                            │ │ Producto 5  │ │ Producto 6  │ │Producto │
│                            │ │ Description │ │ Description │ │Descript │
│                            │ │ $99.99      │ │ $199.99     │ │ $49.99  │
│                            │ │ 💬 Pedir WA │ │ 💬 Pedir WA │ │💬 Pedir │
│                            │ └─────────────┘ └─────────────┘ └─────────┘
│                            │
│                            │ Mostrando 12 productos
│                            │ (Contador dinámico)
│                            │
└────────────────────────────┴─────────────────────────────────────────────┘
```

### Colores Desktop:
```
HEADER:
  Fondo: Gradiente #002855 → #004080 (Azul oscuro profesional)
  Texto: Blanco
  Logo Font: Inter 800, 1.875rem
  Buscador: Input blanco, borde 2px white, rounded-full
  
SIDEBAR:
  Fondo: #f8f9fa (Gris muy claro)
  Texto activo: Blanco en #002855 (Azul oscuro)
  Texto inactivo: #1a1a1a en bg-white
  Border: 1px #e5e5e5
  Hover no-activo: #f0f0f0
  
GRID:
  Bg: Blanco
  
TARJETAS:
  Bg: Gradiente #ffffff → #f8f9fa
  Border: 2px #e5e5e5
  Nombre: Negro #1a1a1a, font-weight 600, truncado 2 líneas
  Desc: Gris #666666, font-weight 400, truncado 2 líneas
  Precio: Azul oscuro #002855, font-weight 700, 1.875rem
  Botón: Verde #25D366, hover #20a856
```

---

## 🎯 Tablet (768px - 1023px)

```
╔═══════════════════════════════════════════════════════════╗
║ 📦 Club de Compras                                        ║
║          🔍  [  Buscar productos...  ]                   ║
╚═══════════════════════════════════════════════════════════╝

CATEGORÍAS:
┌──────────────────────────────────────────────────────────┐
│ ✓ Todos  • Ferretería  • Alimentación  • Electrónica     │
│ • Ropa  • Hogar                                           │
└──────────────────────────────────────────────────────────┘

GRID 2-3 COLUMNAS:
┌────────────────────┬────────────────────┐
│    IMAGEN 1:1      │    IMAGEN 1:1      │
│                    │                    │
├────────────────────┼────────────────────┤
│ Producto 1         │ Producto 2         │
│ Descripción...     │ Descripción...     │
│ $89.99 (azul)      │ $45.50 (azul)      │
│ 💬 Pedir WhatsApp  │ 💬 Pedir WhatsApp  │
└────────────────────┴────────────────────┘

┌────────────────────┐
│    IMAGEN 1:1      │
│                    │
├────────────────────┤
│ Producto 3         │
│ Descripción...     │
│ $99.99 (azul)      │
│ 💬 Pedir WhatsApp  │
└────────────────────┘

Mostrando 3 productos
```

### Cambios en Tablet:
```
• Categorías como botones horizontales
• Grid: 2-3 columnas (en lugar de 4)
• Font reducido ligeramente
• Padding ajustado
• Sidebar colapsa/reorganiza
```

---

## 📱 Mobile (< 768px)

```
╔════════════════════════════════════════╗
║ 📦 Club de Compras                     ║
║    🔍 [   Buscar...   ]               ║
╚════════════════════════════════════════╝

CATEGORÍAS (SCROLL HORIZONTAL):
┌────────────────────────────────────────┐
│ ✓Todos ●Ferret. ●Aliment. ●Electr...  │
│ ◄        (scroll horizontal)         ► │
└────────────────────────────────────────┘

GRID 1-2 COLUMNAS:
┌─────────────┬─────────────┐
│  IMAGEN 1:1 │  IMAGEN 1:1 │
│             │             │
├─────────────┼─────────────┤
│ Prod. 1     │ Prod. 2     │
│ Desc...     │ Desc...     │
│ $89.99      │ $45.50      │
│ 💬 Pedir WA │ 💬 Pedir WA │
└─────────────┴─────────────┘

┌─────────────┐
│  IMAGEN 1:1 │
│             │
├─────────────┤
│ Prod. 3     │
│ Desc...     │
│ $99.99      │
│ 💬 Pedir WA │
└─────────────┘

Mostrando 3 productos
(contador dinámico)
```

### Cambios en Mobile:
```
• Header compacto (padding reducido)
• Buscador ajustado al ancho
• Categorías scroll horizontal
• Grid: 1 columna (o 2 si hay espacio)
• Botones más grandes para tocar (48px+)
• Font size reducido pero legible
• Padding interno ajustado
```

---

## 🎯 Elemento Individual: Tarjeta Producto

### Normal State:
```
┌─────────────────────────────────────────────────┐
│                                                 │
│             IMAGEN CUADRADA (1:1)               │
│                                                 │
│         ┌─────────────────────────────┐        │
│         │ object-fit: cover           │        │
│         │ width: 100%                 │        │
│         │ height: 100%                │        │
│         └─────────────────────────────┘        │
│                                                 │
├─────────────────────────────────────────────────┤
│ Nombre Muy Largo del Producto                   │
│ (font-weight: 600, line-clamp-2)                │
│                                                 │
│ Descripción breve del producto...               │
│ (color: #666666, line-clamp-2, font-size: 85%) │
│                                                 │
├─ ──────────────────────────────────────────────┤
│                                                 │
│              $99.99                             │
│         (Azul #002855, 1.875rem, 700)          │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│         💬 PEDIR POR WHATSAPP                   │
│                                                 │
│     (Verde #25D366, width: 100%, py: 12px)    │
│     (border-radius: 8px, font-weight: 600)     │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Hover State:
```
                    ↑
                  +8px
                    ↑

        ┌─────────────────────────┐
        │                         │  ┌──────────────────────┐
        │    IMAGEN (ZOOM 1.08x)  │  │ Sombra Grande:       │
        │   Se amplía ligeramente │  │ 0 20px 40px rgba...  │
        │                         │  └──────────────────────┘
        │                         │
        ├─────────────────────────┤  ┌──────────────────────┐
        │ Nombre... (igual)       │  │ Border Color:        │
        │ Desc... (igual)         │  │ #002855 (azul)       │
        │ $99.99 (igual)          │  └──────────────────────┘
        │                         │
        ├─────────────────────────┤
        │ 💬 PEDIR (hover)       │  ┌──────────────────────┐
        │ Bg: #20a856 (verde os) │  │ Box-shadow:          │
        │ puede estar ↑2px       │  │ 0 6px 16px green30%  │
        └─────────────────────────┘  └──────────────────────┘

Transición: 300ms cubic-bezier(0.4, 0, 0.2, 1)
Efecto: Suave y elegante, NO abrupt
```

---

## 🔍 Tarjeta en Estado de Búsqueda

```
USUARIO BUSCA: "taladro"
    ↓
SISTEMA FILTRA: productos.filter(p => 
  p.nombre.includes("taladro") || 
  p.descripcion.includes("taladro")
)
    ↓
RESULTADO:

┌─────────────────────────────────────┐
│ Mostrando 2 productos               │ ← Contador actualizado
└─────────────────────────────────────┘

┌─────────────────────────┐ ┌─────────────────────────┐
│   TALADRO IMAGEN        │ │  TALADRO MINI IMAGEN    │
│   RELEVANTE             │ │  RELEVANTE              │
├─────────────────────────┤ ├─────────────────────────┤
│ Taladro Profesional     │ │ Taladro Manual         │
│ Potent taladro eléct... │ │ Pequeño taladro manual │
│ $89.99                  │ │ $12.99                  │
│ 💬 Pedir WhatsApp       │ │ 💬 Pedir WhatsApp       │
└─────────────────────────┘ └─────────────────────────┘

(Otros productos NO en "taladro" desaparecen)
```

---

## 📋 Tarjeta en Estado de Filtro de Categoría

```
USUARIO SELECCIONA: "Ferretería"
    ↓
SIDEBAR SE PONE AZUL:
┌──────────────────┐
│ ✓ Todos          │
│ • Ferretería [✓] │ ← AZUL OSCURO + SOMBRA
│ • Alimentación   │
└──────────────────┘
    ↓
SOLO MUESTRA PRODUCTOS DONDE categoria_id = ferreteria_id
    ↓

RESULTADO:

Mostrando 8 productos (solo Ferretería)

┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Taladro  │ │ Martillo │ │ Serrucho │ │ Destorn. │
│ $89.99   │ │ $45.50   │ │ $34.20   │ │ $18.99   │
│ 💬 WA    │ │ 💬 WA    │ │ 💬 WA    │ │ 💬 WA    │
└──────────┘ └──────────┘ └──────────┘ └──────────┘

┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Clavo    │ │ Tornillo │ │ Destorn. │ │ Llave    │
│ $5.99    │ │ $8.50    │ │ $22.30   │ │ $15.00   │
│ 💬 WA    │ │ 💬 WA    │ │ 💬 WA    │ │ 💬 WA    │
└──────────┘ └──────────┘ └──────────┘ └──────────┘

(Otros productos de categorías diferentes desaparecen)
```

---

## 🔄 Combinado: Filtro + Búsqueda

```
USUARIO:
1. Selecciona "Ferretería" → Contador: 8 productos
2. Busca "taladro" → Contador: 2 productos

RESULTADO:

Mostrando 2 productos
(2 taladros que están TAMBIÉN en ferretería)

┌──────────────────────────┐ ┌──────────────────────────┐
│ Taladro Profesional      │ │ Taladro Manual Mini      │
│ Potente y resistente...  │ │ Pequeño y manejable...   │
│ $89.99                   │ │ $12.99                   │
│ 💬 Pedir WhatsApp        │ │ 💬 Pedir WhatsApp        │
└──────────────────────────┘ └──────────────────────────┘

(Solo aparecen si: 
  categoria = "Ferretería" AND 
  ("taladro" IN nombre OR "taladro" IN descripción)
)
```

---

## 🎬 Animaciones Visuales

### Header Entrance (Page Load):

```
Tiempo: 0ms        Tiempo: 150ms       Tiempo: 300ms
        ↓                  ↓                   ↓

╔═ Opacity: 0    ╔═ Opacity: 0.5     ╔═══════════════╗
║ Y: -100%       ║ Y: -50%             ║ ✓ VISIBLE     ║
                                        ║ Opacity: 1    ║
                                        ║ Y: 0%         ║
                                        ╚═══════════════╝

Easing: ease-out (rápido al inicio, lento al final)
```

### Card Entrance (Load):

```
Tiempo: 0ms        Tiempo: 200ms       Tiempo: 400ms
        ↓                  ↓                   ↓

┌─────────────┐  ┌─────────────┐     ┌─────────────┐
│ Opacity: 0  │  │ Opacity: 0.5│     │ Opacity: 1  │
│ Y: +10px    │  │ Y: +5px     │     │ Y: 0px      │
│ (abajo)     │  │ (arriba)    │     │ (VISIBLE)   │
└─────────────┘  └─────────────┘     └─────────────┘

Easing: ease-out
```

### Card Hover (Mouse Over):

```
Estado Normal            Estado Hover (300ms)

┌──────────────┐         ╔══════════════════╗
│ Y: 0px       │    →    ║ Y: -8px (ARRIBA) ║
│ Shadow: md   │         ║ Shadow: hover    ║
│ Scale-img: 1 │         ║ Scale-img: 1.08  ║
│ Border: gray │         ║ Border: #002855  ║
└──────────────┘         ╚══════════════════╝

Transform: translateY(-8px)
Box-shadow: 0 20px 40px rgba(0,40,85,0.2)
Image: transform scale(1.08)

Easing: cubic-bezier(0.4, 0, 0.2, 1)
Smooth and professional feel
```

---

## ⚡ Performance Metrics

```
Esperado durante uso:

First Paint (FP):         < 500ms
First Contentful Paint:   < 1.5s
Largest Contentful Paint: < 3s

Animation FPS:            60 fps (suave como mantequilla)
Transition Duration:      300ms (perceptible pero no lento)
Search Filter Speed:      < 50ms (tiempo real)

Lighthouse Scores:
  Performance:      95+
  Accessibility:    90+
  Best Practices:   95+
  SEO:             90+
```

---

## 🎨 Resumen de Transiciones

```
Element              Type              Duration    Easing
───────────────────────────────────────────────────────────
Header               slideDown         300ms       ease-out
Cards (Load)         fadeIn            400ms       ease-out
Card (Hover)         elevate           300ms       cubic-bezier
Image (Hover)        scale             400ms       cubic-bezier
Button (Hover)       translateY        300ms       cubic-bezier
Sidebar (Active)     bgColor+shadow    200ms       ease-in-out
Search (Real-time)   filter            < 50ms      instant
```

---

**Visualización ASCII Completa del Design System**
**Versión 1.0 | 7 Abril 2026**
**Estado: ✅ LISTO PARA PRODUCCIÓN**


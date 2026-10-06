# Total Electrodomésticos — Web

Tienda online de Total Electrodomésticos. **Etapa actual: prototipo visual aprobable por el cliente.**

## Qué hay acá

Dos prototipos estáticos generados con Claude Design. No hay build: es HTML + un runtime (`support.js`) que carga React desde unpkg y renderiza el template.

| Archivo | Qué es |
| --- | --- |
| `index.html` | La tienda completa (13 pantallas, navegación por hash) |
| `admin.html` | El panel web (dashboard, catálogo, producto, home, pedidos) |
| `support.js` | Runtime de Claude Design (generado, no editar a mano) |
| `assets/` | Logo y logotipos de marcas |

Para verlo en local hace falta servirlo por HTTP (no abrir el archivo directo, el runtime no levanta desde `file://`):

```bash
python3 -m http.server 8787
```

Y entrar a http://localhost:8787

## Navegación

La tienda rutea por hash: `#/productos`, `#/categoria/televisores`, `#/marca/samsung`,
`#/producto/<slug>`, `#/ofertas`, `#/novedades`, `#/checkout`, `#/confirmacion`,
`#/ingresar`, `#/cuenta`. Abajo a la izquierda hay un selector de pantalla para saltar
entre las 13 vistas durante el QA.

## Datos

**Todo es mock.** 14 productos de ejemplo definidos dentro de `index.html`. El catálogo real
(~3.400 artículos) todavía no está cargado y **no se versiona en este repo**: el archivo trae
una columna `COSTO` que es información interna y no puede salir en la web ni quedar en git.

## El ERP no está conectado

El ERP vive en `neura-erp-total` y se trabaja en una segunda etapa. En esta web no hay
integración, endpoints, sincronización, lógica de stock ni facturación. Los estados de
producto, pedido y pago son interfaz, no lógica.

## Qué falta

Relevado sobre el prototipo:

- El botón flotante de WhatsApp es verde y grande; tiene que ser chico y en azul Total
- "Marcas" no está en el nav principal y no hay página de marca propia
- Favoritos está a medias: hay corazón en las cards, falta acceso y listado
- Las fotos de producto son placeholders
- Falta el tramo tablet (hoy hay un solo corte, en 760px)
- Falta estado de error de carga de catálogo
- El panel web está mucho menos desarrollado que la tienda: falta login, detalle de pedido,
  banners, orden de categorías, SEO global, marcas, usuarios y permisos
- Nada de SEO real todavía (metadata, Open Graph, sitemap, robots, canonical)

## Despliegue

- **Vercel** — pruebas y aprobación del cliente. Sitio estático, sin build.
- **Hostinger** — producción, vía git desde la rama `master`. Hay que pushear a `main` y a
  `master`: Hostinger despliega desde `master`.

No pasar a producción antes de validar en Vercel.

---

Desarrollado por [Neura](https://neura.com.py)

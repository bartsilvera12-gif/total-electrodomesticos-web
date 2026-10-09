# Total Electrodomésticos — Web

Tienda online de Total Electrodomésticos. Next.js + TypeScript + Tailwind.

El ERP vive en [`neura-erp-total`](https://github.com/bartsilvera12-gif/neura-erp-total)
y es la etapa 2. Esta web está hecha desacoplada, esperándolo.

## Arrancar

```bash
npm install
npm run dev
```

## Cómo está armado

```
src/lib/catalogo/     tipos, mock y servicio del catálogo
src/lib/tienda/       carrito, sesión y pedidos
src/components/       UI de la tienda
src/components/admin/ panel web
src/app/              rutas
```

### Dónde vive cada cosa

`src/lib/catalogo/servicio.ts` es el único punto por donde la web lee productos.

El carrito y los favoritos siguen en `localStorage`: son de ese dispositivo y no
hace falta cuenta para armarlos. La sesión del cliente es Supabase Auth y los
pedidos viven en la base, así que se ven desde cualquier dispositivo y el panel
mira los mismos.

Los precios se recalculan en el servidor al crear el pedido
(`src/app/api/pedidos/route.ts`), contra el catálogo. Lo que diga el navegador
sobre el precio no se usa: por eso tampoco hay policy de INSERT en `web_pedido`.

### Qué controla cada sistema

El ERP es la fuente de verdad de producto, precio, stock, cliente, pedido, venta
y factura. La web solo manda en lo editorial: imágenes, descripciones
comerciales, destacados, orden de la home y SEO. El panel web muestra los campos
del ERP marcados como solo lectura, para no construir una segunda lógica que
después entre en conflicto.

## Qué funciona

- **Catálogo** — sale del ERP, filtra y pagina en la base
- **Carrito** — arranca vacío, persiste entre recargas, resuelve precio y stock en vivo
- **Cuentas de cliente** — Supabase Auth, con registro y recuperación de contraseña
- **Checkout** — valida los campos, captura cliente y entrega
- **PagoPar** — flujo completo con los cinco estados. La pasarela está simulada:
  la integración real va con las claves del comercio
- **Pedidos** — quedan en la base, numerados por una secuencia de Postgres, y los
  ven el cliente en Mi cuenta y el panel
- **Catálogo** — filtros por categoría, marca, precio, disponibilidad, y filtros
  técnicos por rubro (pulgadas en TV, BTU en climatización, capacidad en heladeras)
- **Buscador** — ⌘K, instantáneo, por nombre, marca, subcategoría y código
- **Favoritos** — persisten, con su propia página
- **SEO** — metadata por ruta, Open Graph, canonical, sitemap, robots y datos
  estructurados de producto
- **WhatsApp** — dos líneas de atención. Cada punto de contacto abre un selector
  de asesor y le pasa el mensaje con el contexto (producto, carrito o pedido)

## Los números de WhatsApp

Están en `ASESORES`, en `src/lib/sitio.ts`. Las etiquetas "Asesor 1" y "Asesor 2"
son provisorias: cuando Total confirme quién atiende cada línea, se cambian ahí y
se propagan solas a los siete puntos de contacto. Si en algún momento queda un
solo número, el selector desaparece y vuelve a ser un enlace directo, sin tocar
ningún componente.

## La base

La web **comparte el schema `total` con el ERP**. El ERP es la fuente de verdad
de producto, precio y stock, así que no hay sincronización que mantener.

La regla que ordena todo: `total.productos` tiene la columna `costo_promedio`.
La tienda **nunca** consulta esa tabla. Lee por las vistas `web_catalogo`,
`web_categoria_publica` y `web_marca_publica`, que no la incluyen. Además el RLS
del ERP bloquea `productos` a quien no esté en `total.usuarios`, así que un
cliente de la tienda no la alcanza ni logueado.

Lo que la web posee son las tablas `web_*`: contenido editorial, banners,
configuración de la home y los pedidos que entran por la tienda.

### Scripts

| Archivo | Qué hace |
| --- | --- |
| `supabase/01_capa_web.sql` | Tablas `web_*`, las vistas seguras, RLS y permisos |
| `supabase/02_catalogo_ejemplo.sql` | 20 productos de muestra para poder mostrar la tienda |

El de ejemplo se borra con `DELETE FROM total.productos WHERE sku LIKE 'DEMO-%'`.

## Panel administrador

En `/admin`. Se entra con el **mismo usuario del ERP**: no hay cuentas de
administrador propias de la web. Tener sesión en Supabase no alcanza, hay que
estar en `total.usuarios` con rol admin.

| Pantalla | Qué administra |
| --- | --- |
| Resumen | Cuántos productos hay, cuántos publicados, cuántos sin foto |
| Productos | Qué se publica, enlace, descripción, ficha técnica, fotos, SEO |
| Categorías | Cuáles se ven, orden y peso en la portada |
| Home | Textos del hero, orden y visibilidad de los bloques, SEO |
| Pedidos | Los que entran por la tienda, con su estado |

El nombre, el precio y el stock se muestran pero **no se editan**: salen del ERP.

## Variables de entorno

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY     # solo servidor, nunca con prefijo NEXT_PUBLIC_
NEXT_PUBLIC_SITE_URL
```

En local van en `.env.local` (ignorado por git). En Vercel, en Settings →
Environment Variables. Este repo es público: ninguna clave vive acá.

## Taxonomía que no viene del ERP

En `src/lib/catalogo/mock.ts` quedan los espacios de la casa, las zonas del
hero, los filtros técnicos por rubro y los logotipos de marca. Son decisiones de
la tienda, no datos del ERP.

El catálogo real son ~3.400 artículos y no está acá: el brief pide no cargar todo
el catálogo en el cliente, y el archivo de origen trae una columna `COSTO` que es
información interna. **El `.gitignore` bloquea `.xls`, `.xlsx` y `.csv`** — este
repo es público.

## Qué falta

- **PagoPar productivo.** El flujo está completo con sus cinco estados, pero la
  pasarela está simulada: falta conectar con las claves del comercio.
- **Fotos de producto.** Se cargan en el ERP (`productos.imagen_url`) y el panel
  suma las adicionales por URL. Falta subida de archivos.
- **Banners.** La tabla `web_banner` existe y la home todavía no los usa.
- Los **20 productos de ejemplo** hay que borrarlos cuando Total cargue el
  catálogo real.

## El prototipo original

El diseño aprobado en Claude Design quedó en `public/prototipo/` para comparar:
[/prototipo/index.html](public/prototipo/index.html) y
[/prototipo/admin.html](public/prototipo/admin.html). No se toca.

## Despliegue

- **Vercel** — pruebas y aprobación del cliente, con auto-deploy desde `main`
- **Hostinger** — producción, vía git desde `master`

Hay que pushear a las dos ramas:

```bash
git push origin main && git push origin main:master
```

No pasar a producción antes de validar en Vercel.

---

Desarrollado por [Neura](https://neura.com.py)

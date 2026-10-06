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

### La capa que se cambia cuando llegue el ERP

`src/lib/catalogo/servicio.ts` es el único punto por donde la web lee productos.
Hoy resuelve contra un mock en memoria; cuando exista el ERP se reimplementa ahí
contra su base y ningún componente se entera. Todo devuelve promesas aunque hoy
sean síncronas, para que la firma ya sea la que va a necesitar la integración.

`src/lib/tienda/almacenamiento.ts` es la otra. Mientras no haya base de datos, el
carrito, la sesión y los pedidos viven en `localStorage`. Es a propósito la única
capa que sabe eso.

### Qué controla cada sistema

El ERP es la fuente de verdad de producto, precio, stock, cliente, pedido, venta
y factura. La web solo manda en lo editorial: imágenes, descripciones
comerciales, destacados, orden de la home y SEO. El panel web muestra los campos
del ERP marcados como solo lectura, para no construir una segunda lógica que
después entre en conflicto.

## Qué funciona de verdad

- **Carrito** — arranca vacío, persiste entre recargas, suma y resta unidades
- **Login y registro** — guarda la sesión con los datos que la persona ingresa
- **Checkout** — valida los campos, captura cliente y entrega
- **PagoPar** — flujo completo con los cinco estados. La pasarela está simulada:
  la integración real va con las claves del comercio
- **Pedidos** — se crean de verdad, numerados, y aparecen en Mi cuenta y en el panel
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

## Datos

**14 productos de ejemplo**, en `src/lib/catalogo/mock.ts`.

El catálogo real son ~3.400 artículos y no está acá: el brief pide no cargar todo
el catálogo en el cliente, y el archivo de origen trae una columna `COSTO` que es
información interna. **El `.gitignore` bloquea `.xls`, `.xlsx` y `.csv`** — este
repo es público.

## Qué falta

- Backend: base con schema propio, autenticación real, pedidos del lado del servidor
- Integración con el ERP
- PagoPar productivo
- Fotos de producto: hoy son marcadores con la descripción, no fotos de stock
  que no corresponden al artículo
- Panel web: login, detalle de pedido, banners, orden de categorías, SEO global, marcas

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

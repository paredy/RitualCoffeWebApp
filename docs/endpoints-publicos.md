# API pública del menú

La API permite consultar el menú sin iniciar sesión. Estos endpoints no crean pedidos ni
permiten modificar el catálogo. La publicación en internet y la conexión del frontend son
fases posteriores; en desarrollo el backend escucha en `http://localhost:3000`.

## Rutas

| Método | Ruta | Respuesta |
| --- | --- | --- |
| GET | `/api/v1/menu/categories` | `{ "data": [...] }` |
| GET | `/api/v1/menu/products` | `{ "data": [...], "meta": { ... } }` |
| GET | `/api/v1/menu/products/:slug` | `{ "data": { ... } }` |

El endpoint de plantilla `GET /api/v1` sigue respondiendo `Hello World!`.

## Reglas de publicación

Las categorías deben tener `isActive: true`. Se listan por `sortOrder` ascendente y después
por `_id` ascendente para mantener un orden estable. También aparecen las categorías
activas que todavía no tengan productos públicos.

Un producto se publica únicamente cuando cumple todas estas condiciones:

- `isVisible: true`.
- `isArchived: false`.
- `isAvailable: true`.
- Su categoría existe y tiene `isActive: true`.
- Si `pricingType` es `variant`, al menos una variante tiene `isAvailable: true`.

Listado y detalle comparten las mismas reglas. Un producto oculto, archivado, agotado,
sin categoría válida o sin variantes disponibles responde `404` en el detalle, igual que
uno inexistente. El contenido público no permite distinguir esos casos.

Las variantes y extras no disponibles se omiten de la respuesta. Las variantes disponibles
se ordenan por `sortOrder` y, en caso de empate, por `code`. Los extras conservan el orden
del array almacenado. `isAvailable` representa disponibilidad manual; no hay cantidades
de inventario ni descuento automático de existencias.

## Parámetros

Solo el listado de productos admite parámetros de consulta:

| Parámetro | Tipo | Predeterminado | Reglas |
| --- | --- | --- | --- |
| `category` | String | Sin filtro de categoría | Slug en minúsculas: segmentos alfanuméricos separados por guiones |
| `page` | Number | `1` | Entero positivo y seguro; el desplazamiento calculado también debe ser seguro |
| `limit` | Number | `20` | Entero entre 1 y 50 |

Ejemplo:

```http
GET /api/v1/menu/products?category=cafes-calientes&page=1&limit=20
```

Los números deben enviarse como dígitos decimales enteros. No se admiten fracciones,
notación científica, valores vacíos, parámetros repetidos ni objetos como `category[$ne]`.
Los parámetros desconocidos se rechazan con `400`, incluyendo intentos de cambiar filtros
como `isVisible=false` o `includeArchived=true`.

Categorías y detalle no aceptan parámetros de consulta. El slug del detalle debe tener el
mismo formato válido. Un slug mal formado devuelve `400`; uno válido pero no público,
`404`.

Los productos se ordenan por `sortOrder` ascendente y `_id` ascendente. La paginación es
por desplazamiento, no una instantánea persistente entre solicitudes: cambios concurrentes
del catálogo pueden mover productos entre páginas.

## Respuestas

Categorías:

```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Cafés calientes",
      "slug": "cafes-calientes",
      "description": "Nuestra selección de cafés",
      "imageUrl": null
    }
  ]
}
```

Listado de productos:

```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "Capuchino",
      "slug": "capuchino",
      "description": "Café con leche espumada",
      "category": {
        "id": "507f1f77bcf86cd799439011",
        "name": "Cafés calientes",
        "slug": "cafes-calientes"
      },
      "pricingType": "fixed",
      "price": "3.50",
      "currency": "USD",
      "imageUrl": null,
      "isAvailable": true,
      "variants": [],
      "extras": [
        {
          "code": "oat-milk",
          "name": "Leche de avena",
          "price": "0.75",
          "isAvailable": true,
          "maxQuantity": 1
        }
      ]
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```

El detalle devuelve exactamente el mismo contrato de producto dentro de `data`, sin `meta`.
Para `pricingType: "variant"`, `price` es null y cada variante incluye `code`, `name`,
`price` e `isAvailable`.

Los precios son cadenas USD con dos decimales, sin conversión a `Number` ni pérdida de
precisión. La conversión explícita funciona también para los resultados de agregación de
MongoDB, que no ejecutan los transformadores `toJSON()` de Mongoose.

La API selecciona sus campos públicos mediante proyección y mapeadores de respuesta.
No expone `_id`, `categoryId`, `isVisible`, `isArchived`, marcas de tiempo ni campos internos
adicionales que puedan existir en los documentos. Los identificadores públicos aparecen
como cadenas bajo `id`.

Si no hay resultados, la respuesta es `200`. Una categoría válida pero inexistente o
inactiva también devuelve una lista vacía. Sin productos públicos:

```json
{
  "data": [],
  "meta": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 }
}
```

Una página posterior a la última devuelve `data: []`, pero conserva el total y el número
de páginas calculados para la consulta.

## Errores

Se utiliza el formato estándar de excepciones de NestJS:

- `400`: parámetros inválidos o desconocidos; `message` puede contener una lista de errores de validación.
- `404`: producto no encontrado o no publicado; `message` es `Producto no encontrado`.
- `500`: error interno; la respuesta no devuelve documentos, credenciales ni detalles internos de MongoDB.

Ejemplo:

```json
{
  "message": "Producto no encontrado",
  "error": "Not Found",
  "statusCode": 404
}
```

## Arquitectura

- `PublicCategoriesController` y `PublicProductsController`: reciben y validan solicitudes.
- `CategoriesService`: consulta categorías activas con proyección y orden definidos.
- `ProductsService`: agrega productos con su categoría activa, aplica las reglas públicas
  y calcula datos y total sobre la misma entrada mediante `$facet`.
- `CategoriesModule` exporta su registro Mongoose; `ProductsModule` lo importa para consultar
  la categoría, sin duplicar el esquema ni asumir que un ObjectId garantiza su existencia.
- Los DTO de entrada son clases con `class-validator` y `class-transformer`.
- Los contratos de salida son interfaces TypeScript y mapeadores explícitos que seleccionan
  las propiedades públicas; no dependen de serializar automáticamente documentos completos.
- `configureHttpApp()` comparte el prefijo y la validación entre el arranque real y las e2e.

La conexión de MongoDB, sus credenciales y los esquemas de las siete colecciones se conservan.
No se incorporan rutas administrativas, autenticación ni cambios al frontend.

## Verificación local

Con MongoDB encendido, desde la raíz:

```powershell
pnpm.cmd dev:api
```

Desde otra terminal:

```powershell
Invoke-RestMethod 'http://localhost:3000/api/v1/menu/categories'
Invoke-RestMethod 'http://localhost:3000/api/v1/menu/products?page=1&limit=20'
Invoke-RestMethod 'http://localhost:3000/api/v1/menu/products/capuchino'
```

No se crean productos reales ni datos permanentes de ejemplo. Si `ritual_coffee` está vacía,
los listados estarán vacíos y el detalle responderá `404`.

```powershell
pnpm.cmd build:api
pnpm.cmd --dir apps/api test
pnpm.cmd --dir apps/api test:e2e
pnpm.cmd --dir apps/api lint
pnpm.cmd --dir apps/api exec tsc --noEmit --incremental false
```

Las e2e usan únicamente `ritual_coffee_test` en MongoDB local, con la conexión de pruebas ya
documentada en [database.md](database.md). Crean sus propias categorías/productos y limpian
por `_id` solamente los documentos de su ejecución, incluso tras un fallo de comprobación.
No eliminan bases ni colecciones ni insertan datos en `ritual_coffee`.

# Modelos de datos de Ritual Coffee

La capa de datos usa NestJS, Mongoose y MongoDB 8. Los siete modelos están registrados
en módulos por funcionalidad. No incluye controladores de negocio, CRUD, autenticación,
pagos ni emisión de comprobantes electrónicos.

## Convenciones

- `_id`: `ObjectId` automático en cada colección principal.
- `createdAt` y `updatedAt`: fechas automáticas, excepto auditoría, que solo tiene `createdAt`.
- Sin `__v`. Subdocumentos de variantes, extras y conceptos sin `_id` propio.
- Referencias mediante `ObjectId` y `ref`; no son claves foráneas verificadas por MongoDB.
- Todos los importes son USD, `Decimal128`, no negativos y de máximo dos decimales.
  Las funciones compartidas están en `apps/api/src/common/schema-validation.ts`.
- En JSON de documentos Mongoose, productos, pedidos y facturas convierten importes
  a cadenas con dos decimales, por ejemplo `"3.50"`. No hay cálculos monetarios con `Number`.
  Las consultas `lean()`, el driver nativo y `toObject()` no ejecutan este transformador:
  los futuros servicios deberán definir su DTO de salida y exigir entradas decimales como cadenas.
- Slugs y códigos de variantes/extras se recortan y normalizan a minúsculas.
  Formato: segmentos alfanuméricos ASCII separados por guiones (`small`, `oat-milk`).
- Enteros nuevos: positivos o no negativos según el campo, dentro del rango seguro de JavaScript.
- `unique` declara un índice, no un validador de Mongoose. La unicidad se verifica en MongoDB
  cuando el índice existe; los futuros servicios deben manejar el error `11000`.

## users — `User`

| Campos | Tipo y reglas |
| --- | --- |
| `name` | String obligatorio, trim, 2–100 caracteres |
| `email` | String obligatorio, trim, minúsculas, formato básico de email |
| `passwordHash` | String obligatorio, excluido de consultas normales (`select: false`) y de `toJSON()` |
| `role` | Obligatorio: `admin` o `barista` |
| `isActive` | Boolean, `true` por defecto |
| `lastLoginAt` | Date o null, null por defecto |

Índice único: `email`. No hay cuentas de clientes.
El futuro servicio de usuarios debe generar un hash seguro antes de guardar: el esquema no
implementa hashing ni puede demostrar criptográficamente que una cadena sea un hash válido.
No registrar hashes en auditoría ni devolverlos en DTO, incluso con consultas `lean()` y selección explícita.

## categories — `Category`

Se conserva el esquema existente.

| Campos | Tipo y reglas |
| --- | --- |
| `name` | String obligatorio, trim, 2–80 caracteres |
| `slug` | String obligatorio, normalizado, formato de slug |
| `description` | String, máximo 500, `""` por defecto |
| `imageUrl` | String o null, null por defecto |
| `sortOrder` | Number entero no negativo, 0 por defecto |
| `isActive` | Boolean, true por defecto |

Índices: `slug` único; `{ isActive: 1, sortOrder: 1 }`.

## products — `Product`

| Campos | Tipo y reglas |
| --- | --- |
| `name` | String obligatorio, trim, 2–120 caracteres |
| `slug` | String obligatorio, normalizado, formato de slug |
| `description` | String, máximo 1000, `""` por defecto |
| `categoryId` | ObjectId obligatorio → `Category` |
| `pricingType` | Obligatorio: `fixed` o `variant` |
| `price` | Decimal128 o null; obligatorio en `fixed`, null en `variant` |
| `variants`, `extras` | Arrays de subdocumentos, vacíos por defecto, sin elementos nulos |
| `imageUrl` | String o null, null por defecto |
| `isAvailable` | Boolean, true por defecto |
| `isVisible`, `isArchived` | Boolean, false por defecto |
| `sortOrder` | Number entero no negativo, 0 por defecto |

`ProductVariant`: `code` normalizado obligatorio, `name` obligatorio, `price` Decimal128
obligatorio, `isAvailable=true`, `sortOrder` entero no negativo con valor inicial 0.

`ProductExtra`: `code` normalizado obligatorio, `name` obligatorio, `price` Decimal128
obligatorio, `isAvailable=true`, `maxQuantity` entero positivo con valor inicial 1.

`fixed` no permite variantes. `variant` requiere al menos una variante y no permite precio
principal. Códigos únicos dentro de cada array, después de normalizarlos.

Índices: `slug` único; `{ categoryId: 1, isVisible: 1, isArchived: 1, sortOrder: 1 }`.
El futuro servicio comprobará que la categoría exista y pueda utilizarse.

## orders — `Order`

| Campos | Tipo y reglas |
| --- | --- |
| `orderNumber` | Number obligatorio, entero positivo y único |
| `createdBy` | ObjectId obligatorio → `User` |
| `orderType` | Obligatorio: `dine_in` o `takeaway` |
| `tableNumber` | String con trim o null; obligatorio y no vacío para `dine_in`; ausente/null para `takeaway` |
| `customerName` | String opcional, máximo 100 |
| `items` | Array obligatorio con al menos un `OrderItem`, sin elementos nulos |
| `subtotal`, `total` | Decimal128 obligatorios |
| `discount` | Decimal128 obligatorio, `0.00` por defecto |
| `status` | `pending` (defecto), `preparing`, `ready`, `delivered` o `cancelled` |
| `notes`, `cancelReason` | Strings opcionales |
| `cancelledBy` | ObjectId opcional → `User`, null por defecto |
| `cancelledAt`, `deliveredAt` | Date o null, null por defecto |

`OrderItem`:

- `productId`: ObjectId obligatorio → `Product`.
- `productName`: String histórico obligatorio.
- `variantCode`: código normalizado o null; `variantName`: String o null.
- `quantity`: entero positivo obligatorio.
- `unitPrice`, `lineTotal`: Decimal128 obligatorios.
- `selectedExtras`: array de `OrderSelectedExtra`, vacío por defecto, sin elementos nulos.
- `notes`: String opcional.

`OrderSelectedExtra`: `code` normalizado, `name`, `unitPrice` Decimal128 y `quantity`
entero positivo, todos obligatorios.

Los nombres y precios se almacenan como instantáneas, sin depender de `populate()` para
reconstruir pedidos antiguos. Cambiar el catálogo no los cambia automáticamente.

Índices: `orderNumber` único; `{ status: 1, createdAt: -1 }`;
`{ createdBy: 1, createdAt: -1 }`; `{ orderType: 1, createdAt: -1 }`.

Pendiente en servicios: generación atómica del número de pedido (no usar `count + 1`),
transiciones de estado, requisitos de cancelación/entrega y cálculos consistentes de totales,
incluyendo la semántica de cantidad de extras por línea o por unidad. No hay campos de pago.
`cancelReason` y datos de cancelación permanecen opcionales hasta cerrar esas reglas.

## invoices — `Invoice`

Registro histórico de comprobantes existentes. No emite facturas electrónicas ni se integra con SRI.

| Campos | Tipo y reglas |
| --- | --- |
| `orderId` | ObjectId opcional → `Order`, null por defecto |
| `invoiceNumber` | String obligatorio, trim, sin índice único global |
| `issuedAt` | Date obligatoria |
| `customer` | Subdocumento opcional |
| `items` | Array de `InvoiceItem`, vacío por defecto, sin elementos nulos |
| `subtotal`, `total` | Decimal128 obligatorios |
| `discount`, `tax` | Decimal128 obligatorios, `0.00` por defecto |
| `currency` | String obligatorio, solo `USD`, USD por defecto |
| `paymentMethod` | String histórico o null, null por defecto |
| `status`, `notes` | Strings opcionales, sin enum fiscal inventado |
| `createdBy` | ObjectId obligatorio → `User` |

`InvoiceCustomer`: strings opcionales `name`, `identificationType`, `identificationNumber`,
`email`, `address`. Sin reglas fiscales ni restricciones sobre tipos de identificación.

`InvoiceItem`: `productId` ObjectId opcional → `Product`; `description` String obligatorio;
`quantity` Number finito positivo obligatorio (admite fracciones); `unitPrice` y `subtotal`
Decimal128 obligatorios. La descripción y los precios son históricos.

Solo índice `_id` por ahora. No se asume unicidad global de `invoiceNumber` hasta definir
emisor, establecimiento, serie o punto de emisión. Estados, impuestos, conservación,
redondeos y relación uno/muchos con pedidos requieren definición futura.

## audit_logs — `AuditLog`

| Campos | Tipo y reglas |
| --- | --- |
| `actorUserId` | ObjectId opcional → `User`, null por defecto |
| `action`, `entityType` | Strings obligatorios, trim |
| `entityId` | ObjectId opcional, null por defecto; entidad indicada por `entityType` |
| `changes`, `metadata` | Objetos opcionales de campos relevantes, no arrays ni strings |
| `createdAt` | Date automática; sin `updatedAt` |

Índices: `{ createdAt: -1 }`; `{ entityType: 1, entityId: 1 }`; `{ actorUserId: 1 }`.
No se fuerza un enum de acciones. Ejemplos: `product.price_updated`, `order.cancelled`.

Se rechazan claves sensibles conocidas, también anidadas: password, hash, token, secret,
credential, authorization y cookie. Esto no detecta secretos bajo cualquier nombre ni
información personal innecesaria: el futuro productor debe usar una lista permitida de campos.
El esquema no garantiza inmutabilidad de auditorías; los futuros servicios y permisos deberán
impedir su modificación arbitraria. No existe un controlador público de auditoría.

## coffee_types — `CoffeeType`

| Campos | Tipo y reglas |
| --- | --- |
| `name` | String obligatorio, trim |
| `slug` | String obligatorio, normalizado, formato de slug |
| `classification` | Obligatorio: `species` o `variety` |
| `scientificName`, `origin`, `imageUrl` | String o null, null por defecto |
| `description` | String obligatorio, trim |
| `flavorNotes` | Array de strings, vacío por defecto |
| `isPublished` | Boolean, false por defecto |
| `sortOrder` | Number entero no negativo, 0 por defecto |

Índices: `slug` único; `{ classification: 1, isPublished: 1, sortOrder: 1 }`.
No tiene referencias a otras colecciones. Almacena especies/variedades botánicas, no bebidas.

## Límites de los esquemas

Mongoose aplica casting y validación de documentos, enumeraciones, límites y hooks de
`validate()`. Las reglas entre campos se comprueban al validar/guardar documentos.
No usar `validateSync()` para comprobar hooks asíncronos de validación.

`updateOne()` y `findOneAndUpdate()` no ejecutan los hooks de documento `pre('validate')`;
`runValidators: true` no sustituye las reglas entre campos. Los futuros servicios deben
cargar el documento, aplicar cambios, validar y guardar cuando esas reglas estén implicadas.
También deberán controlar concurrencia y consistencia de totales, referencias y permisos.

Las escrituras directas desde Compass o el driver omiten los validadores de Mongoose.
No se han instalado validadores MongoDB `$jsonSchema`: la pestaña Validation de Compass
no representa los decoradores de TypeScript. Los índices sí residen en MongoDB.

## Preparación y verificación local

Desde la raíz, con Docker Desktop iniciado y los `.env` locales ya configurados:

```powershell
docker compose --env-file infrastructure/.env -f infrastructure/compose.dev.yaml up -d
pnpm.cmd --dir apps/api db:prepare
pnpm.cmd build:api
pnpm.cmd --dir apps/api test
pnpm.cmd --dir apps/api test:e2e
pnpm.cmd --dir apps/api lint
pnpm.cmd --dir apps/api exec tsc --noEmit --incremental false
```

En PowerShell se usa `pnpm.cmd` para evitar bloqueos de `pnpm.ps1` por la política de scripts.
`db:prepare` compila, conecta con el usuario de aplicación y crea colecciones/índices faltantes
solo en `ritual_coffee` de `localhost`/`127.0.0.1`. No crea documentos, no sincroniza eliminando
índices, no migra datos y no elimina nada. Un conflicto de datos/índices detiene la operación;
pueden haberse preparado colecciones anteriores. Requiere revisión antes de resolver conflictos.
El arranque normal conserva la configuración de conexión previa y el comportamiento de
autocreación de Mongoose; no se ha configurado un despliegue de producción.

Las pruebas unitarias no necesitan MongoDB. Las e2e arrancan Fastify con el prefijo `/api/v1`
y usan exclusivamente la base local `ritual_coffee_test`. Se puede proporcionar `TEST_MONGO_URI`
con un usuario de pruebas con permisos de lectura/escritura e índices. Si no se proporciona,
usan en memoria las credenciales del administrador Docker de `infrastructure/.env` con
`authSource=admin`; no cambian permisos ni escriben credenciales. Nunca se usa esa cuenta
administradora en la conexión normal del backend.

Las e2e crean índices en la base aislada, insertan documentos identificados con UUID/ObjectId
de esa ejecución y limpian únicamente esos documentos por `_id`. No borran bases ni colecciones.
La base de pruebas y sus colecciones vacías permanecen. Una interrupción abrupta puede dejar
documentos de esa prueba, que deben revisarse por su identificador, sin limpiezas globales.

Verificación de esta entrega: compilación, comprobación de tipos, pruebas unitarias, e2e y lint
del backend ejecutados correctamente. Se prepararon y verificaron físicamente las siete
colecciones de `ritual_coffee` con sus índices, todas con cero documentos; no se añadieron seeds.

## Ver las colecciones en MongoDB Compass

1. Abre **Add New Connection** y usa `mongodb://127.0.0.1:27017/ritual_coffee`.
2. En **Advanced Connection Options → Authentication → Username / Password**, introduce
   el valor local de `MONGO_USER` y `MONGO_PASSWORD` de `apps/api/.env`.
3. Indica `ritual_coffee` como **Authentication Database** y conecta.
4. Abre `ritual_coffee`: deben aparecer `users`, `categories`, `products`, `orders`, `invoices`,
   `audit_logs` y `coffee_types`. En **Indexes** puedes revisar los índices creados.
5. **Documents** muestra los documentos guardados. **Schema** analiza una muestra de esos
   documentos; no importa el esquema de Mongoose. Al estar vacías las colecciones no habrá
   campos que inferir. Consulta las tablas de este documento para conocer el diseño completo.

No uses la cuenta administradora Docker para consultar normalmente la aplicación. Tampoco
es necesario insertar datos de ejemplo para comprobar que las colecciones e índices existen.

Referencias oficiales: [conexión y autenticación](https://www.mongodb.com/docs/compass/connect/advanced-connection-options/authentication-connection/),
[análisis de esquema](https://www.mongodb.com/docs/compass/schema/),
[índices](https://www.mongodb.com/docs/compass/indexes/).

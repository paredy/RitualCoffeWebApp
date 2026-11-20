# Autenticación del personal — contrato del backend

Esta entrega implementa únicamente el backend. No modifica `apps/web`, no conecta la pantalla
de login ni crea cuentas reales automáticamente. El menú público continúa accesible sin sesión.

## Endpoints

Base local: `http://localhost:3000/api/v1`.

| Método | Ruta | Resultado |
| --- | --- | --- |
| POST | `/auth/login` | `200`, usuario público, token CSRF y cookie de sesión |
| GET | `/auth/me` | `200`, usuario actual y token CSRF de la sesión |
| POST | `/auth/logout` | `204`, revocación en MongoDB y eliminación de cookie |

No existe `/auth/register`. Solo se admiten usuarios del personal (`admin`, `barista`).
No se autentica por email: se utiliza `username`, independiente del nombre visible `name`.

## Login

Requiere `Content-Type: application/json` y un `Origin` de la lista permitida. El navegador
envía `Origin` automáticamente; Postman, curl y otros clientes deben establecerlo explícitamente.
El control de origen también protege el login frente a CSRF; el formulario URL-encoded no se acepta.

```http
POST /api/v1/auth/login
Origin: http://localhost:5173
Content-Type: application/json
```

```json
{
  "username": "erick",
  "password": "<contraseña-del-usuario>"
}
```

Reglas:

- Username único, 3–30 caracteres: empieza por letra ASCII o número y permite letras sin
  tildes, números, punto, guion y guion bajo. Se recorta y convierte a minúsculas.
- La contraseña nunca se recorta ni normaliza. Login admite 1–128 caracteres para poder
  verificar cuentas existentes; el comando de creación exige 12–128 caracteres.
- Campos adicionales y parámetros de consulta se rechazan con `400`.
- El email sigue siendo obligatorio como contacto al crear la cuenta, pero no participa en login.

Respuesta `200` de login y de `/auth/me`:

```json
{
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Erick",
    "username": "erick",
    "role": "admin"
  },
  "csrfToken": "<token-csrf-de-la-sesion>"
}
```

No se devuelve contraseña, hash, email, documento completo de usuario ni identificador de
sesión en JSON. El token CSRF no es una credencial para iniciar sesión y no sustituye la cookie.
Usuario inexistente, contraseña incorrecta y cuenta inactiva devuelven el mismo `401`
con mensaje `Credenciales inválidas`. La verificación usa Argon2id; las cuentas inexistentes
también ejecutan una verificación de contraseña ficticia para reducir diferencias de tiempo.

## Sesión y cookies

- Identificador opaco de 256 bits, generado con `randomBytes(32)` y codificado en base64url.
- MongoDB guarda solamente `SHA-256(identificador)`, `userId`, `expiresAt` y timestamps en `sessions`.
- Cookie host-only (sin `Domain`), `Path=/`, `HttpOnly`, `SameSite=Lax`.
- Desarrollo: `ritual_session`; producción: `__Host-ritual_session` y `Secure`.
- Caducidad absoluta de ocho horas por defecto. No se renueva silenciosamente por actividad.
- Un login correcto crea un identificador nuevo y revoca la sesión anterior presentada por
  ese navegador. No cierra automáticamente otras sesiones de otros dispositivos.
- `/auth/me` verifica el vencimiento y el estado/rol actual del usuario en MongoDB.
- Una sesión que consulta una cuenta eliminada o inactiva se revoca y devuelve `401`.
  Al implementar la futura administración de usuarios, desactivar cuentas o cambiar
  contraseñas deberá revocar todas sus sesiones de forma explícita.
- Logout elimina la sesión del servidor. Reutilizar la cookie anterior ya no autentica.
- La expiración se comprueba en cada solicitud; el índice TTL es limpieza auxiliar y no
  garantiza eliminación inmediata. No se confía en su temporizador para autorizar.
- Las respuestas de autenticación usan `Cache-Control: no-store`.

La autenticación utiliza exclusivamente la cookie: no acepta identificadores de sesión por
URL, cabeceras Bearer ni `localStorage`. No hay JWT, refresh tokens ni clave compartida para
firmarlos; la validez del identificador aleatorio se comprueba contra su hash persistido.

## CSRF y logout

Después de login, conserva `csrfToken` en memoria. Al recargar el frontend, llama a `/auth/me`
para recuperar la identidad y el token CSRF.

Logout requiere cookie, un `Origin` permitido y la cabecera `X-CSRF-Token` de esa sesión:

```http
POST /api/v1/auth/logout
Origin: http://localhost:5173
Cookie: ritual_session=<gestionada-por-el-navegador>
X-CSRF-Token: <csrfToken-devuelto-por-login-o-me>
```

No necesita cuerpo ni Content-Type. También acepta un cuerpo JSON vacío `{}`. No llames a
`response.json()` después de un `204` porque no hay cuerpo.

El token CSRF se deriva con HMAC-SHA256 del identificador aleatorio de sesión y se compara
en tiempo constante. No basta con conocerlo sin poseer la cookie. Los cambios de sesión
también cambian el token CSRF. Los futuros endpoints de escritura con cookies deberán usar
`AuthOriginGuard`, `SessionAuthGuard` y `CsrfGuard`, junto con su autorización de negocio.

## Integración para la persona encargada del frontend

Estos ejemplos son documentación; no se ha modificado el frontend.

```typescript
const API = 'http://localhost:3000/api/v1'; // En un único dominio: '/api/v1'.
let csrfToken: string | undefined;

async function login(username: string, password: string) {
  const response = await fetch(`${API}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error('No se pudo iniciar sesión');
  csrfToken = body.csrfToken;
  return body.data;
}

async function restoreSession() {
  const response = await fetch(`${API}/auth/me`, { credentials: 'include' });
  if (response.status === 401) {
    csrfToken = undefined;
    return null;
  }
  if (!response.ok) throw new Error('No se pudo consultar la sesión');
  const body = await response.json();
  csrfToken = body.csrfToken;
  return body.data;
}

async function logout() {
  if (!csrfToken) throw new Error('Consulta primero la sesión');
  const response = await fetch(`${API}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'X-CSRF-Token': csrfToken },
  });
  if (!response.ok && response.status !== 401) throw new Error('No se pudo cerrar sesión');
  csrfToken = undefined;
}
```

El navegador gestiona `Cookie` y `Origin`: no intentes establecer esas cabeceras desde
JavaScript. Tampoco intentes leer `Set-Cookie` ni acceder al identificador mediante
`document.cookie`. `HttpOnly` lo impide deliberadamente.

Conserva el mismo host en desarrollo: frontend `http://localhost:5173` con API
`http://localhost:3000`, o ambos en `127.0.0.1`. Mezclar `localhost` con `127.0.0.1` cambia
el sitio y puede impedir el envío de cookies `SameSite=Lax`, aunque CORS permita el origen.
En producción se espera frontend y API bajo el mismo dominio y HTTPS.

## Configuración del backend

Las variables nuevas están descritas en `apps/api/.env.example`. No se modificó el `.env`
real ni las credenciales MongoDB.

| Variable | Predeterminado y validación |
| --- | --- |
| `NODE_ENV` | En desarrollo puede omitirse; producción debe usar `production` |
| `AUTH_ALLOWED_ORIGINS` | Desarrollo: localhost y 127.0.0.1 en puertos 5173 y 3000. Lista separada por comas, sin barra final ni comodines |
| `AUTH_SESSION_TTL_SECONDS` | `28800`; entero entre 60 y 86400 |

Con `NODE_ENV=production`, `AUTH_ALLOWED_ORIGINS` es obligatorio y solo admite orígenes HTTPS.
CORS permite credenciales únicamente a los orígenes configurados y las cabeceras
`Content-Type`, `X-CSRF-Token`. Las rutas públicas siguen sin exigir sesión, aunque una web
de otro origen necesita autorización CORS para leerlas mediante JavaScript.

Login tiene límites de 10 verificaciones por IP cada 60 segundos y 20 por username cada
15 minutos, contando intentos correctos e incorrectos. Las ventanas y contadores son
acotados y viven en memoria de cada proceso; reiniciar los reinicia. Para múltiples réplicas
se necesitará un limitador compartido o equivalente en infraestructura.
La API no confía por defecto en `X-Forwarded-For`. Antes de desplegar detrás de Nginx,
configura únicamente los proxies de confianza para que el límite use la IP real del cliente.

## Crear el primer administrador local

Con MongoDB encendido y desde la raíz:

```powershell
pnpm.cmd --dir apps/api db:prepare
pnpm.cmd --dir apps/api users:create-admin
pnpm.cmd dev:api
```

El comando pide nombre, username, email y contraseña confirmada con entrada oculta.
Los campos se validan antes de conectar a MongoDB. Si una contraseña tiene menos de
12 caracteres, se muestra el requisito concreto sin imprimir el valor introducido.
No toma la contraseña por argumentos ni genera una predeterminada. Requiere terminal
interactiva y guarda solo Argon2id con salt aleatorio (19 MiB, 2 iteraciones, paralelismo 1).
Si ya existe cualquier administrador, se detiene sin sobrescribir cuentas. Ejecútalo una
sola vez, sin invocaciones concurrentes: la comprobación inicial no es una transacción distribuida.

El comando está limitado a desarrollo, base `ritual_coffee` y MongoDB local. El aprovisionamiento
de producción requiere revisar el procedimiento e índices antes de ejecutarlo allí.
Esta entrega no crea automáticamente ningún administrador ni ofrece registro público,
gestión de baristas, cambio ni recuperación de contraseña.

Si otra instalación ya tiene usuarios, asigna usernames válidos y únicos mediante un
procedimiento revisado antes de aplicar el índice. No se asignan nombres automáticamente
ni se modifican cuentas existentes. En el entorno local revisado no había usuarios.

## Errores y pruebas

| Código | Significado |
| --- | --- |
| 400 | Datos mal formados, campos extra o query no admitida |
| 401 | Credenciales inválidas o sesión ausente, vencida o revocada |
| 403 | Origin ausente/no permitido o token CSRF inválido |
| 415 | Content-Type diferente de application/json en operaciones de autenticación |
| 429 | Límite temporal de intentos de login |
| 500 | Error interno, sin detalles sensibles en la respuesta |

Se mantiene el formato de errores de NestJS. En `401`, el frontend debe volver al estado
sin sesión; en `429`, informar que debe esperar. Los roles devueltos pueden controlar la
interfaz, pero la autorización real de futuros endpoints privados se implementará también
en el backend. No se ha añadido todavía el CRUD privado ni un guard de roles para él.

```powershell
pnpm.cmd build:api
pnpm.cmd --dir apps/api test
pnpm.cmd --dir apps/api test:e2e
pnpm.cmd --dir apps/api exec tsc --noEmit --incremental false
pnpm.cmd --dir apps/api lint
```

Las e2e usan exclusivamente `ritual_coffee_test`: prueban contraseñas reales con Argon2id,
cookies, persistencia, CORS, CSRF, revocación, vencimiento, usuario inactivo, rotación,
límites y creación de administrador. Limpian solamente los usuarios y sesiones de esa
ejecución. El menú público y los siete modelos de negocio conservan sus pruebas.

Referencias: [OWASP sesiones](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html),
[OWASP contraseñas](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html),
[Fastify cookies](https://github.com/fastify/fastify-cookie).

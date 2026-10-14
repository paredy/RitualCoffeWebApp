# Ritual Coffee — PWA y sistema de gestión

Aplicación web progresiva (**PWA**) para una cafetería. Incluye un sitio público donde los clientes consultan información y menú, y un área para baristas desde la que, cuando estén implementadas esas funcionalidades, podrán administrar productos y registrar/gestionar las órdenes del día.

> **Estado actual:** repositorio base en desarrollo. Están configurados React + Vite + TypeScript + Tailwind CSS + React Router; NestJS + Fastify + Mongoose; MongoDB local con Docker Compose. Las rutas del barista son **pantallas provisionales sin autenticación**: no usar este estado en producción. No están implementados todavía el CRUD real del menú, el login ni la gestión real de órdenes. La instalación como PWA también está pendiente de configurar y verificar.

## 1. Funciones previstas

**Vista pública (sin login)**
- Página de inicio e información de la cafetería.
- Menú con categorías, productos, precios y disponibilidad.
- Los clientes **no crean pedidos**.

**Vista barista (requerirá autenticación)**
- Iniciar sesión.
- Añadir, editar, mostrar/ocultar y desactivar artículos del menú.
- Crear órdenes manualmente y gestionar sus estados durante el día.

El diseño visual se implementará a partir del prototipo de Figma de Ritual Coffee. La API deberá validar permisos; ocultar una ruta en React no constituye seguridad.

## 2. Tecnologías

| Área | Tecnología |
| --- | --- |
| Monorepositorio | pnpm Workspaces |
| Frontend | React, TypeScript, Vite |
| Estilos | Tailwind CSS v4 |
| Navegación | React Router |
| Backend | NestJS, Fastify, TypeScript (ESM) |
| Pruebas backend | Vitest |
| Base de datos | MongoDB 8 (contenedor Docker) |
| Acceso a datos | Mongoose y `@nestjs/mongoose` |
| Configuración API | `@nestjs/config` |

El desarrollo es local. El servidor físico de la cafetería se configurará más adelante, después de auditar el entorno de hosting existente.

## 3. Estructura del repositorio

```text
RitualCoffeWebApp/
├── apps/
│   ├── web/                       # Frontend React
│   │   ├── public/                # Assets públicos
│   │   └── src/
│   │       ├── app/
│   │       │   ├── router.tsx
│   │       │   └── layouts/
│   │       │       ├── PublicLayout.tsx
│   │       │       └── BaristaLayout.tsx
│   │       ├── features/          # Módulos de interfaz (se amplían luego)
│   │       ├── App.tsx
│   │       ├── main.tsx
│   │       └── index.css
│   └── api/                       # Backend NestJS
│       ├── src/
│       │   ├── app.module.ts      # Configuración y conexión Mongoose
│       │   └── main.ts            # Arranque Fastify; prefijo /api/v1
│       ├── test/
│       ├── .env.example
│       └── package.json
├── packages/
│   └── contracts/                 # Tipos/contratos compartidos (pendiente)
├── infrastructure/
│   ├── compose.dev.yaml           # MongoDB para desarrollo
│   └── .env.example
├── .gitignore
├── package.json                   # Scripts principales
├── pnpm-lock.yaml
└── pnpm-workspace.yaml
```

Git puede no mostrar carpetas vacías, como `packages/contracts`.

## 4. Requisitos para un equipo nuevo

Entorno recomendado: **Windows 10/11 con PowerShell y Visual Studio Code**. En Linux/macOS cambian algunos comandos de terminal.

Instalar:

1. **Git** y acceso a GitHub (invitación aceptada al repositorio privado).
2. **Node.js 22.x** (versión utilizada durante la configuración inicial: `22.22.0`).
3. **pnpm 10.x** (versión utilizada inicialmente: `10.34.7`).
4. **Docker Desktop** con motor de **contenedores Linux** y WSL 2 operativo en Windows.
5. **Visual Studio Code** (recomendado, no obligatorio).

Comprobar desde PowerShell:

```powershell
git --version
node -v
npm -v
pnpm -v
docker info
docker compose version
```

Si `pnpm` no existe, probar `corepack --version`. La activación global de Corepack puede fallar con `EPERM` al escribir en `C:\Program Files\nodejs`; como alternativa, con Node instalado:

```powershell
npm install -g pnpm@10
pnpm -v
```

No hace falta instalar MongoDB directamente en Windows. Si `docker info` no muestra la sección `Server`, iniciar Docker Desktop y esperar a que su motor esté activo.

## 5. Clonar el repositorio e instalar dependencias

En PowerShell:

```powershell
git clone https://github.com/paredy/RitualCoffeWebApp.git
cd RitualCoffeWebApp
pnpm install
```

> **Nota para colaboradores:** ejecutar estos pasos una vez que la rama de configuración inicial haya sido integrada a `main`. Si todavía está en un Pull Request, cambiar a su rama antes de instalar:
>
> `git fetch origin` y `git switch --track origin/chore/project-setup` (solo si existe en remoto).

`pnpm install` instala las dependencias de todos los proyectos del workspace. **No subir** `node_modules` al repositorio y **sí versionar** `pnpm-lock.yaml`.

## 6. Configurar MongoDB en Docker

### 6.1. Crear variables privadas para el contenedor

Desde la raíz del repositorio:

```powershell
Copy-Item infrastructure/.env.example infrastructure/.env
```

Editar `infrastructure/.env` con valores propios. Ejemplo del **formato**, nunca usar una contraseña publicada:

```dotenv
MONGO_ROOT_USER=ritual_admin
MONGO_ROOT_PASSWORD=REEMPLAZAR_POR_UN_SECRETO_ALEATORIO
```

> Una cuenta administradora de MongoDB es distinta del usuario de aplicación. **Cada desarrollador tendrá su propia contraseña local.** No compartir ni subir los `.env`.

### 6.2. Levantar MongoDB

```powershell
docker compose --env-file infrastructure/.env -f infrastructure/compose.dev.yaml config --quiet
docker compose --env-file infrastructure/.env -f infrastructure/compose.dev.yaml up -d
docker ps
```

El contenedor esperado se llama `ritual-coffee-mongodb` y el puerto de desarrollo queda vinculado a `127.0.0.1:27017`. Los datos permanecen en un volumen Docker.

Si el puerto 27017 ya está ocupado, revisar qué proceso lo utiliza antes de modificar Compose. Evitar ejecutar dos instancias distintas de MongoDB con el mismo puerto.

### 6.3. Crear la cuenta de aplicación (solo primera inicialización)

Entrar con el usuario administrador configurado en `infrastructure/.env`:

```powershell
docker exec -it ritual-coffee-mongodb mongosh -u ritual_admin --authenticationDatabase admin --password
```

En `mongosh` (no en PowerShell):

```javascript
use ritual_coffee

db.createUser({
  user: 'ritual_app',
  pwd: passwordPrompt(),
  roles: [{ role: 'readWrite', db: 'ritual_coffee' }]
})

db.getUser('ritual_app')
exit
```

Elegir una contraseña **distinta de la administradora** y guardarla en el gestor de contraseñas personal. Si el shell rechaza caracteres Unicode durante la normalización, utilizar una contraseña larga y aleatoria con caracteres ASCII.

**No ejecutar `db.createUser` si el usuario ya existe.** Se puede comprobar con `db.getUser('ritual_app')` desde una sesión administradora.

### 6.4. Configurar variables privadas de NestJS

Desde la raíz:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
```

Editar `apps/api/.env`:

```dotenv
PORT=3000
MONGO_USER=ritual_app
MONGO_PASSWORD=REEMPLAZAR_POR_CONTRASENA_DEL_USUARIO_DE_APLICACION
MONGO_HOST=127.0.0.1
MONGO_PORT=27017
MONGO_DATABASE=ritual_coffee
```

La contraseña debe coincidir con la que se definió en `db.createUser`. **No usar la contraseña `MONGO_ROOT_PASSWORD` aquí.** La configuración NestJS arma una URI codificando las credenciales e incluye `authSource=ritual_coffee`.

> **Importante:** las variables `MONGO_INITDB_ROOT_*` del archivo Compose se utilizan en la **primera inicialización** de un volumen vacío; editar `infrastructure/.env` después no cambia la contraseña de un usuario ya creado. No borrar volúmenes para “arreglar” contraseñas: se perderían datos.

## 7. Arrancar frontend y backend

Abrir **dos terminales** en la raíz del proyecto:

**Terminal 1 — API**

```powershell
pnpm dev:api
```

Abrir `http://localhost:3000/api/v1`: actualmente devuelve `Hello World!`.

**Terminal 2 — Web**

```powershell
pnpm dev:web
```

Abrir `http://localhost:5173/`.

Rutas configuradas actualmente:

| Ruta | Pantalla |
| --- | --- |
| `/` | Inicio público (provisional) |
| `/menu` | Menú público (provisional) |
| `/barista/login` | Login (provisional; todavía sin autenticación) |
| `/barista` | Dashboard (provisional; no protegido) |
| `/barista/menu` | Gestión del menú (provisional; no protegida) |
| `/barista/orders` | Gestión de órdenes (provisional; no protegida) |

Detener cada servidor con `Ctrl + C`. Docker puede seguir activo cuando se cierran las terminales.

## 8. Compilar y ejecutar pruebas

Desde la raíz:

```powershell
pnpm build:web
pnpm build:api
pnpm --dir apps/api test
pnpm --dir apps/api test:e2e
```

Las pruebas de NestJS actuales cubren la plantilla inicial; **no prueban todavía productos, pedidos o permisos**. La conexión y operaciones de prueba en MongoDB ya se validaron manualmente durante la configuración original; cada colaborador debe comprobar también su conexión local al arrancar la API.

## 9. Comandos de Docker útiles

Desde la raíz:

```powershell
# Ver contenedores
docker ps

# Consultar logs de MongoDB
docker logs ritual-coffee-mongodb --tail 100

# Detener MongoDB sin borrar el volumen
docker compose --env-file infrastructure/.env -f infrastructure/compose.dev.yaml down

# Volver a arrancar MongoDB
docker compose --env-file infrastructure/.env -f infrastructure/compose.dev.yaml up -d
```

**Nunca ejecutar `docker compose down -v` sin autorización y copia de seguridad:** la opción `-v` elimina los volúmenes gestionados por Compose y puede destruir los datos locales.

## 10. Git y colaboración entre dos desarrolladores

`main` será la rama compartida estable. Después de integrar la configuración inicial:

```powershell
git switch main
git pull origin main
git switch -c feature/nombre-de-funcionalidad
```

Al terminar cambios:

```powershell
git add .
git status
git commit -m "feat: describir cambio"
git push -u origin feature/nombre-de-funcionalidad
```

Crear un **Pull Request** hacia `main`, pedir revisión del otro desarrollador y ejecutar compilaciones y pruebas antes de fusionarlo. Usar una **rama por funcionalidad**, no una rama permanente por persona.

Antes de cualquier commit, verificar:

```powershell
git check-ignore -v apps/api/.env
git check-ignore -v infrastructure/.env
git diff --cached --name-only
```

No subir contraseñas, archivos `.env`, `node_modules`, `dist`, ni `*.tsbuildinfo`. Los `.env.example` deben contener exclusivamente valores de ejemplo.

## 11. Problemas frecuentes

| Síntoma | Revisión sugerida |
| --- | --- |
| `pnpm` no se reconoce | Instalar `pnpm@10` y reiniciar terminal |
| `docker info` no conecta al motor | Abrir Docker Desktop y comprobar contenedores Linux/WSL 2 |
| Puerto `27017` ocupado | Ver procesos y contenedores existentes antes de cambiar puertos |
| Error de autenticación MongoDB | Confirmar usuario, contraseña y `authSource`; no confundir usuario root con `ritual_app` |
| `.env: not found` | Ejecutar comandos desde la carpeta correcta; el backend usa `apps/api/.env` |
| Puerto `3000` o `5173` ocupado | Detener proceso previo y revisar el puerto real que anuncia cada servidor |
| Vite no reconoce `@theme` en VS Code | Instalar Tailwind CSS IntelliSense; si Vite compila, puede ser solo aviso del editor |
| Recargar `/menu` en producción devuelve 404 | Configurar fallback SPA en el servidor web (durante desarrollo Vite lo maneja) |

## 12. Próximas etapas

1. Diseñar e implementar los componentes reales desde Figma.
2. Construir login y control de autorización para baristas (backend y frontend).
3. Implementar categorías/productos, visibilidad y disponibilidad.
4. Implementar creación y estados de órdenes, preservando precios históricos.
5. Completar la PWA instalable (manifest, service worker, políticas de caché).
6. Pruebas de integración y despliegue en el servidor físico existente.

**Política de seguridad:** hasta implementar la autenticación y los permisos, las rutas administrativas son únicamente demostrativas. No publicar operaciones administrativas abiertas en internet.
# Contract Manager — LegalTech PyME

Sistema de gestión de contratos y vencimientos para PyMEs. Proyecto integrador final — Tecnicatura Universitaria en Programación (UTN).

---

## 📁 Estructura del repositorio

```text
contract-manager/
├── backend/    — API REST en Spring Boot (Java 21)
├── frontend/   — Aplicación React + Vite (TypeScript)
└── docs/       — Diagramas y documentación funcional (ERD, matriz RBAC, historias de usuario, máquina de estados)
```

---

## 🛠️ Estructura interna del frontend

```text
frontend/src/
├── components/          — Componentes reutilizables (ej. ConfirmModal)
├── contexts/            — Contextos globales (AuthContext, ThemeContext)
├── hooks/               — Hooks reutilizables (ej. useSortableData)
├── pages/               — Una carpeta por pantalla (ej. Dashboard/, Clients/, Contracts/)
├── services/            — Clientes de la API (authService, clientService, contractService, etc.)
├── styles/              — Estilos compartidos (shared.module.css)
├── types/               — Tipos TypeScript compartidos (Contract, Client, etc.)
├── constants/           — Constantes reutilizables (ej. códigos de país)
└── index.css            — Estilos globales
```

---

## 🛠️ Stack Tecnológico

- Backend: Spring Boot 4.1.1 (Java 21), Spring Data JPA, Spring Security + JWT.
- Base de datos: PostgreSQL 16 (gestión automatizada vía Docker Compose).
- Migraciones: Flyway (`backend/src/main/resources/db/migration`).
- Documentación: Swagger UI (`/swagger-ui/index.html`).
- Frontend: React + Vite + TypeScript, CSS Modules.

---

## ⚙️ Setup del Backend (Spring Boot)

### 1. Preparación inicial

1. Cloná el repositorio y abrí la carpeta `backend/` en IntelliJ IDEA.
2. En la carpeta `backend/` (al lado del `pom.xml`), copiá `.env.example` y renombrá la copia a `.env`.

### 2. Completar el `.env`

El archivo `.env` es la única fuente de configuración: lo leen tanto Docker Compose (para crear la base) como Spring Boot (mediante `spring.config.import`). No hace falta cargar variables en IntelliJ.

| Variable | Qué poner |
| :--- | :--- |
| `POSTGRES_DB`, `POSTGRES_USER` | Pueden quedar como están (`legaltech`). |
| `POSTGRES_PASSWORD` | Una contraseña propia. Para generar una: `openssl rand -base64 16` |
| `JWT_SECRET` | Un secreto en Base64. Para generarlo: `openssl rand -base64 32` |
| `FRONTEND_URL` | `http://localhost:5173` (origen permitido por CORS, sin `/` al final). |
| `BOOTSTRAP_ADMIN_USERNAME` | Usuario del administrador inicial. |
| `BOOTSTRAP_ADMIN_PASSWORD` | Contraseña del administrador inicial (reemplazar `change_me`). |

> Importante: Agregá los valores sin comillas y sin espacios antes o después del `=`. Las comillas pasan a formar parte del valor y rompen, por ejemplo, la decodificación del `JWT_SECRET`.

### 3. Configuración de IntelliJ

Lo único que hay que configurar es el directorio de trabajo, para que la app encuentre el `docker-compose.yml`. Si abriste solo la carpeta `backend/` como proyecto (paso 1), el directorio de trabajo ya es el correcto y podés saltear este paso.

Si abriste la raíz del monorepo:

1. Run -> Edit Configurations...
2. Seleccioná `ContractManagerApplication` (si la lista está vacía, creala con **+** > **Application** y elegí la clase `ar.edu.utn.legaltech.contract_manager.ContractManagerApplication`).
3. Activá Modify options -> Working directory y poné la ruta completa a la carpeta `backend/` (por ejemplo `.../contract-manager/backend`).
4. Apply -> OK.

> Alternativa sin configurar el IDE: desde la terminal, `cd backend` y `./mvnw spring-boot:run` (en PowerShell: `.\mvnw.cmd spring-boot:run`).

### 4. Ejecución del servidor

- Requisito previo: Necesitás Docker Desktop instalado y corriendo (la app levanta Postgres sola, no hace falta ejecutar `docker compose up` a mano).
- Iniciar: Corré con el botón de Play al lado de `ContractManagerApplication`.

Cuando el log muestre `Started ContractManagerApplication in X seconds`, la API estará lista para usarse. Podés verificarlo en `http://localhost:8080/swagger-ui/index.html`.

---

## 📑 Documentación interactiva y Primeros Pasos

Al iniciar, si no existe ningún usuario ADMIN, el sistema crea uno con las credenciales de las variables `BOOTSTRAP_ADMIN_USERNAME` y `BOOTSTRAP_ADMIN_PASSWORD` (se leen desde `backend/.env`). Si no se definen, no se crea ningún usuario. Con ese usuario se inicia sesión y los demás se crean desde la pantalla de Usuarios o con `POST /api/users`. Conviene cambiar la contraseña inicial.

El sistema no ofrece autorregistro: los usuarios adicionales deben ser creados por un usuario con rol ADMIN mediante `POST /api/users`.

---

## 💻 Setup del Frontend (React + Vite)

1. Abrí la carpeta `frontend/` en VS Code.
2. Copiá `.env.example` a `.env` y verificá que apunte al backend:

   `VITE_API_URL=http://localhost:8080/api`

3. Instalá las dependencias de Node (solo la primera vez):

   `npm install`

4. Iniciá el servidor de desarrollo:

   `npm run dev`

5. La interfaz se abrirá en [http://localhost:5173](http://localhost:5173) (necesita el backend corriendo en el puerto 8080 para comunicarse).

> Si cambiás `VITE_API_URL`, reiniciá `npm run dev`: Vite lee las variables solo al arrancar.

---

## 🔌 Endpoints de la API REST

### Autenticación y usuarios

- `POST /api/auth/login` — Autenticación, devuelve el JWT (público).
- `GET /api/users` — Listar usuarios (requiere rol ADMIN).
- `POST /api/users` — Crear usuario (requiere rol ADMIN). Único punto de alta de usuarios.
- `PUT /api/users/{id}/role` — Modificar el rol de un usuario (requiere rol ADMIN).
- `DELETE /api/users/{id}` — Eliminar usuario (requiere rol ADMIN).

### Contratos

- `GET /api/contracts` — Listar contratos.
- `GET /api/contracts/{id}` — Obtener un contrato por ID.
- `POST /api/contracts` — Crear un contrato (requiere token).
- `PUT /api/contracts/{id}` — Modificar un contrato (requiere token).
- `DELETE /api/contracts/{id}` — Eliminar un contrato (requiere rol ADMIN).
- `POST /api/contracts/update-statuses` — Recalcular estados de contratos (requiere token).
- `GET /api/contracts/expiring-soon` — Consultar contratos próximos a vencer.
- `GET /api/contracts/dashboard` — Consultar métricas e indicadores agregados.
- `GET /api/contracts/{id}/audit` — Consultar el historial de auditoría de un contrato.

### Adjuntos de contratos

Todos los endpoints de adjuntos requieren autenticación mediante JWT.

- `POST /api/contracts/{id}/attachments` — Adjuntar un PDF a un contrato (requiere token).
- `GET /api/contracts/{id}/attachments` — Listar los archivos adjuntos de un contrato (requiere token).
- `GET /api/contracts/{id}/attachments/{attachmentId}` — Descargar un PDF adjunto (requiere token).

### Clientes

- `GET /api/clients` — Listar clientes.
- `POST /api/clients` — Crear un cliente (requiere token).
- `PUT /api/clients/{id}` — Modificar un cliente (requiere token).
- `DELETE /api/clients/{id}` — Eliminar un cliente (requiere rol ADMIN).

> **Seguridad:** El inicio de sesión (`POST /api/auth/login`) y las rutas de documentación Swagger son públicas. La administración de usuarios (`/api/users/**`) requiere rol ADMIN. Las operaciones DELETE también están restringidas a usuarios con rol ADMIN. Las operaciones de adjuntos requieren autenticación JWT, tanto para subir como para listar y descargar archivos.

### Respuestas de error

Los errores devuelven siempre un objeto JSON: `{"error": "mensaje"}` en general, o `{"campo": "mensaje"}` cuando el error pertenece a un campo del formulario.

| Estado HTTP | Cuándo ocurre |
| :---: | :--- |
| 400 | Validación fallida, DNI/CUIT/CUIL inválido (`{"taxId": "..."}`) o archivo adjunto inválido. |
| 401 | Credenciales inválidas en el login, o token ausente, inválido o vencido. |
| 403 | Autenticado, pero sin permiso por rol (por ejemplo, un OPERATOR intentando un DELETE). |
| 404 | Recurso inexistente. |
| 409 | Regla de negocio o duplicado (username repetido, eliminar el propio usuario, eliminar un cliente con contratos). |
| 413 | Archivo adjunto de más de 10 MB. |

---

## 📎 Adjuntos PDF de contratos

El sistema permite asociar varios archivos PDF a un mismo contrato.

### Características

- Se permite adjuntar más de un PDF por contrato.
- El tamaño máximo permitido es de **10 MB por archivo**; si lo supera, la API responde `413 Payload Too Large`.
- Se rechazan archivos vacíos, sin la firma `%PDF-` o con un nombre inválido (hasta 255 caracteres), con `400 Bad Request`.
- Los archivos se almacenan directamente en PostgreSQL mediante columnas `BYTEA`.
- Los datos binarios no se exponen en las respuestas JSON de listado.
- La descarga se realiza mediante un endpoint específico y devuelve el contenido como PDF.
- Cada adjunto registra el nombre original, tamaño, usuario que lo subió y fecha y hora de carga.
- Los endpoints de carga, listado y descarga requieren autenticación JWT.
- Un adjunto solo puede descargarse si pertenece al contrato indicado en la URL.
- Al eliminar un contrato, sus archivos adjuntos se eliminan automáticamente mediante una clave foránea con `ON DELETE CASCADE`.

---

## 👤 Administración de usuarios

La administración de usuarios está disponible exclusivamente para usuarios con rol ADMIN.

El módulo permite:

- Consultar los usuarios registrados.
- Crear nuevos usuarios.
- Modificar el rol de un usuario.
- Eliminar usuarios.

Un administrador no puede eliminar su propio usuario ni cambiar su propio rol. No pueden existir dos usuarios con el mismo `username` (la API responde `409 Conflict`).

---

## 📋 Auditoría de contratos

El sistema registra las principales acciones realizadas sobre los contratos para mantener un historial de trazabilidad.

Las acciones auditadas son:

- `CREATED` — Creación de un contrato.
- `UPDATED` — Actualización de los datos de un contrato.
- `STATUS_CHANGED` — Cambio de estado de un contrato.
- `ATTACHMENT_ADDED` — Incorporación de un archivo adjunto a un contrato.

Cada registro de auditoría almacena:

- Usuario que realizó la acción.
- Acción realizada.
- Detalle de la acción o cambio de estado.
- Fecha y hora en que ocurrió.

Al adjuntar un archivo, el detalle de auditoría registra el nombre del PDF incorporado.

Los cambios de estado realizados automáticamente por el sistema se registran con `SYSTEM` como usuario ejecutor.

El historial de un contrato puede consultarse mediante:

`GET /api/contracts/{id}/audit`

---

## 📌 Alcance y Consideraciones

- **Alcance de Notificaciones:** El sistema prioriza un esquema de alertas visuales en tiempo real dentro del Dashboard (badges, estados y filtros de vencimiento). La integración con un proveedor SMTP para notificaciones por email se identificó como un módulo desacoplado para futuras iteraciones, evitando dependencias de infraestructura externa durante el despliegue de la demo.

---

## 🧯 Problemas frecuentes

| Síntoma | Causa y solución |
| :--- | :--- |
| `No Docker Compose file found in directory ...` | El directorio de trabajo no es `backend/`. Ver sección 3 del setup. |
| `Could not resolve placeholder 'JWT_SECRET'` | Falta el `.env` en `backend/` o la variable está vacía. |
| `Illegal base64 character 22` | El `JWT_SECRET` tiene comillas en el `.env`. Quitarlas. |
| `Successfully validated 0 migrations` | Las migraciones no están en `src/main/resources/db/migration`. |
| `password authentication failed` | `POSTGRES_PASSWORD` no coincide con la que se usó al crear el volumen. Ver la última sección. |
| El front muestra `ERR_CONNECTION_REFUSED` | El backend no está corriendo. Verificar `http://localhost:8080/swagger-ui/index.html`. |
| Error de CORS en el navegador | `FRONTEND_URL` debe ser exactamente `http://localhost:5173`, sin `/` final. Reiniciar el backend. |

---

## 🛑 Al terminar de trabajar

Si querés liberar recursos de tu PC cuando termines por el día, podés bajar el contenedor de Postgres desde la terminal con:

```bash
cd backend
docker compose down
```

Esto no borra tus datos. Evitá usar el flag `-v` (`docker compose down -v`), salvo que quieras resetear la base de datos a propósito.

El archivo `.env` no se versiona. Si se pierde, recrearlo desde `.env.example`. Si la base ya existía, `POSTGRES_PASSWORD` debe ser la misma con la que se creó el volumen; si no se recuerda, se puede recrear la base con `docker compose down -v` (borra los datos).
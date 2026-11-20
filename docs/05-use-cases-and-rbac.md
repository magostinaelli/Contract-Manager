# 🔐 Matriz de Permisos (RBAC) y Casos de Uso

## 1. Matriz de Control de Acceso Basado en Roles (RBAC)

El sistema define dos roles de usuario con diferentes niveles de privilegio sobre la API REST:

| Funcionalidad / Endpoint | Métodos HTTP | Rol OPERATOR | Rol ADMIN |
| :--- | :--- | :---: | :---: |
| Autenticación / Login | POST /api/auth/login | ✅ | ✅ |
| Registro de Usuarios | POST /api/auth/register | ❌ | ✅ |
| Administración de Usuarios | GET /api/users | ❌ | ✅ |
| Crear Usuario | POST /api/users | ❌ | ✅ |
| Modificar Rol de Usuario | PUT /api/users/{id}/role | ❌ | ✅ |
| Eliminar Usuario | DELETE /api/users/{id} | ❌ | ✅ |
| Consulta de Clientes | GET /api/clients | ✅ | ✅ |
| Crear Cliente | POST /api/clients | ✅ | ✅ |
| Editar Cliente | PUT /api/clients/{id} | ✅ | ✅ |
| Eliminar Cliente | DELETE /api/clients/{id} | ❌ | ✅ |
| Consulta de Contratos | GET /api/contracts | ✅ | ✅ |
| Consulta de Contrato | GET /api/contracts/{id} | ✅ | ✅ |
| Crear Contrato | POST /api/contracts | ✅ | ✅ |
| Editar Contrato | PUT /api/contracts/{id} | ✅ | ✅ |
| Recalcular Estados | POST /api/contracts/update-statuses | ✅ | ✅ |
| Contratos Próximos a Vencer | GET /api/contracts/expiring-soon | ✅ | ✅ |
| Dashboard y Alertas Visuales | GET /api/contracts/dashboard | ✅ | ✅ |
| Historial de Auditoría | GET /api/contracts/{id}/audit | ✅ | ✅ |
| Eliminar Contrato | DELETE /api/contracts/{id} | ❌ | ✅ |
| Subir PDF a un Contrato | POST /api/contracts/{id}/attachments | ✅ | ✅ |
| Listar Adjuntos de un Contrato | GET /api/contracts/{id}/attachments | ✅ | ✅ |
| Descargar Adjunto | GET /api/contracts/{id}/attachments/{attachmentId} | ✅ | ✅ |

> **Regla de Seguridad:** Todas las acciones destructivas (DELETE) y la administración de usuarios están restringidas exclusivamente al perfil ADMIN. Las operaciones de adjuntos requieren autenticación mediante JWT, pero están disponibles para ambos roles.

---

## 2. Historias de Usuario / Casos de Uso Principales

### HU-01: Autenticación de Usuarios

* **Como** usuario del sistema (`ADMIN` u `OPERATOR`)
* **Quiero** ingresar mis credenciales (`username` y `password`)
* **Para** obtener un token JWT que me permita operar en las funciones protegidas de la plataforma.

**Criterios de Aceptación:**

* Las contraseñas se almacenan utilizando BCrypt.
* Al autenticar correctamente, el sistema retorna un token JWT válido.
* El endpoint de login es público.
* Las operaciones protegidas requieren autenticación mediante JWT.

### HU-02: Gestión de Contratos (CRUD)

* **Como** `OPERATOR` o `ADMIN`
* **Quiero** registrar, editar y consultar contratos asociándolos a un `Client` existente
* **Para** mantener el control centralizado de los acuerdos comerciales de la empresa.

**Criterios de Aceptación:**

* Un contrato debe incluir obligatoriamente: `title`, `client_id`, `startDate` y `endDate`.
* El estado del contrato es calculado automáticamente por el backend a partir de las fechas.
* Los estados automáticos contemplados son `DRAFT`, `ACTIVE`, `EXPIRING_SOON` y `EXPIRED`.
* El estado `UNDER_RENEWAL` está reservado para representar una renovación en curso; no forma parte del cálculo automático y, en la versión actual, no existe una acción para asignarlo.
* Los usuarios `OPERATOR` y `ADMIN` pueden crear y editar contratos.
* La eliminación de contratos está restringida al rol `ADMIN`.

### HU-03: Monitoreo y Dashboard de Vencimientos

* **Como** usuario del sistema
* **Quiero** visualizar un panel central con métricas e indicadores de contratos próximos a vencer
* **Para** tomar acciones preventivas de renovación antes de la fecha de caducidad.

**Criterios de Aceptación:**

* El sistema calcula los estados de los contratos según la fecha actual.
* Los contratos pueden ser consultados según su estado y proximidad al vencimiento.
* La interfaz resalta visualmente los contratos en estado `EXPIRING_SOON` y `EXPIRED`.
* El endpoint de actualización de estados permite sincronizar los estados de los contratos administrados por el sistema.
* Los estados se recalculan automáticamente cada día a la 01:00 y al iniciar la aplicación; también pueden recalcularse a demanda con el endpoint de actualización.

### HU-04: Administración de Seguridad (Admin Only)

* **Como** `ADMIN`
* **Quiero** administrar los usuarios del sistema y poder eliminar registros críticos de clientes o contratos
* **Para** garantizar el mantenimiento del sistema y la integridad de la información.

**Criterios de Aceptación:**

* Un usuario `ADMIN` puede consultar los usuarios registrados.
* Un usuario `ADMIN` puede crear nuevos usuarios.
* Un usuario `ADMIN` puede modificar el rol de un usuario.
* Un usuario `ADMIN` puede eliminar usuarios.
* Un usuario `OPERATOR` no puede acceder a la administración de usuarios.
* Un usuario `OPERATOR` que intente consumir un endpoint `DELETE` recibirá una respuesta de acceso denegado.
* Un administrador no puede eliminar su propio usuario ni cambiar su propio rol (la restricción se valida en el backend y la interfaz deshabilita las acciones).

### HU-05: Auditoría de Contratos

* **Como** usuario del sistema
* **Quiero** consultar el historial de acciones realizadas sobre un contrato
* **Para** disponer de trazabilidad sobre sus modificaciones y cambios de estado.

**Criterios de Aceptación:**

* La creación de un contrato genera un registro de auditoría con acción `CREATED`.
* La modificación de un contrato genera un registro de auditoría con acción `UPDATED`.
* Los cambios de estado generan un registro de auditoría con acción `STATUS_CHANGED`.
* La incorporación de un archivo adjunto genera un registro de auditoría con acción `ATTACHMENT_ADDED`.
* Cada registro almacena la acción realizada, el usuario que la ejecutó, el detalle y la fecha y hora.
* Los cambios de estado realizados automáticamente por el sistema se registran con `SYSTEM` como usuario ejecutor.
* El historial puede consultarse mediante `GET /api/contracts/{id}/audit`.

### HU-06: Gestión de Archivos Adjuntos PDF

* **Como** `OPERATOR` o `ADMIN`
* **Quiero** adjuntar, consultar y descargar archivos PDF asociados a un contrato
* **Para** centralizar la documentación respaldatoria de los acuerdos comerciales.

**Criterios de Aceptación:**

* Un contrato puede tener múltiples archivos PDF adjuntos.
* Cada archivo debe tener un tamaño máximo de 10 MB.
* El sistema rechaza archivos vacíos o que no presenten la firma inicial `%PDF-`.
* Los archivos se almacenan en PostgreSQL utilizando el tipo de dato `BYTEA`.
* Cada archivo registra su nombre, tamaño, usuario que lo subió y fecha y hora de carga.
* Los usuarios autenticados con rol `OPERATOR` o `ADMIN` pueden subir archivos, consultar el listado de adjuntos y descargarlos.
* Los endpoints de adjuntos requieren autenticación mediante JWT.
* Un archivo solo puede descargarse si pertenece al contrato indicado en la URL.
* La incorporación de un archivo genera un registro de auditoría con acción `ATTACHMENT_ADDED` y el nombre del archivo.
* Al eliminar un contrato, sus archivos adjuntos se eliminan automáticamente mediante eliminación en cascada (`ON DELETE CASCADE`).
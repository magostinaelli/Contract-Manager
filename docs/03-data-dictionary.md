
# Diccionario de Datos - Contract Manager

**Proyecto:** Contract Manager  
**Motor de base de datos:** PostgreSQL 16  
**Gestor de migraciones:** Flyway  
**Versión:** 1.0

---

## 1. Introducción

El presente documento describe la estructura de datos del sistema Contract Manager, detallando las tablas que componen la base de datos, sus atributos, tipos de datos, restricciones y relaciones.

El objetivo del diccionario de datos es proporcionar una referencia técnica que permita comprender la organización y el funcionamiento de la información almacenada en el sistema.

La estructura documentada corresponde al esquema relacional definido mediante las migraciones de Flyway.

## 2. Estructura general de la base de datos

La base de datos está compuesta por cinco tablas principales:

| Tabla | Descripción |
|---|---|
| CLIENTS | Almacena información de los clientes. |
| CONTRACTS | Almacena los contratos asociados a los clientes. |
| USERS | Almacena los usuarios y sus roles de acceso. |
| CONTRACT_AUDIT_LOG | Registra las operaciones realizadas sobre los contratos. |
| CONTRACT_ATTACHMENTS | Almacena los archivos adjuntos de los contratos. |

### 2.1. Presentación del esquema

La tabla central del modelo es CONTRACTS. Cada contrato pertenece a un único cliente (CLIENTS) y concentra dos tablas dependientes: CONTRACT_AUDIT_LOG, con el historial de acciones realizadas sobre el contrato, y CONTRACT_ATTACHMENTS, con los archivos PDF asociados. Al eliminar un contrato, ambas se eliminan en cascada.

La tabla USERS es independiente: guarda las credenciales y el rol (ADMIN u OPERATOR) de quienes usan el sistema. No se relaciona mediante clave foránea con el resto; la auditoría y los adjuntos registran el nombre de usuario como texto, de modo que el historial se conserva aunque el usuario se elimine.

Las relaciones del esquema son:

- CLIENTS 1:N CONTRACTS
- CONTRACTS 1:N CONTRACT_AUDIT_LOG
- CONTRACTS 1:N CONTRACT_ATTACHMENTS

El diagrama entidad-relación completo se encuentra en el documento `01-der-database.md`.

## 3. Descripción de las tablas

### 3.1. CLIENTS

**Descripción:** Almacena la información de los clientes registrados en el sistema.

| Campo | Tipo de dato | Restricciones | Descripción |
|---|---|---|---|
| id | BIGINT | PK, IDENTITY | Identificador único del cliente. |
| name | VARCHAR(255) | NOT NULL | Nombre o razón social del cliente. |
| tax_id | VARCHAR(255) | NULL | DNI (7 u 8 dígitos) o CUIT/CUIL (11 dígitos). El CUIT/CUIL se guarda con el formato XX-XXXXXXXX-X; el backend normaliza y valida el valor. |
| email | VARCHAR(255) | NULL | Correo electrónico del cliente. |
| phone_country_code | VARCHAR(5) | NULL | Código telefónico internacional. |
| phone_number | VARCHAR(20) | NULL | Número telefónico del cliente. |

### 3.2. CONTRACTS

**Descripción:** Almacena los contratos registrados en el sistema, incluyendo sus datos principales, fechas, importes y estados.

| Campo | Tipo de dato | Restricciones | Descripción |
|---|---|---|---|
| id | BIGINT | PK, IDENTITY | Identificador único del contrato. |
| title | VARCHAR(255) | NOT NULL | Título del contrato. |
| client_id | BIGINT | FK, NOT NULL | Identificador del cliente asociado. |
| start_date | DATE | NOT NULL | Fecha de inicio del contrato. |
| end_date | DATE | NOT NULL | Fecha de finalización del contrato. |
| amount | NUMERIC(12,2) | NULL | Importe económico del contrato. |
| status | VARCHAR(255) | NOT NULL, CHECK | Estado actual del contrato. |

**Valores permitidos para el campo status:**

| Valor | Descripción |
|---|---|
| DRAFT | Borrador. |
| ACTIVE | Activo. |
| EXPIRING_SOON | Próximo a vencer. |
| EXPIRED | Vencido. |
| UNDER_RENEWAL | En proceso de renovación. |

### 3.3. USERS

**Descripción:** Almacena los usuarios habilitados para acceder al sistema y sus respectivos roles.

| Campo | Tipo de dato | Restricciones | Descripción |
|---|---|---|---|
| id | BIGINT | PK, IDENTITY | Identificador único del usuario. |
| username | VARCHAR(255) | NOT NULL, UNIQUE | Nombre de usuario. |
| password | VARCHAR(255) | NOT NULL | Contraseña almacenada de forma segura mediante hash. |
| role | VARCHAR(255) | NOT NULL, CHECK | Rol asignado al usuario. |

**Valores permitidos para el campo role:**

| Valor | Descripción |
|---|---|
| ADMIN | Administrador del sistema. |
| OPERATOR | Operador del sistema. |

### 3.4. CONTRACT_AUDIT_LOG

**Descripción:** Registra las operaciones realizadas sobre los contratos, permitiendo mantener un historial de auditoría.

| Campo | Tipo de dato | Restricciones | Descripción |
|---|---|---|---|
| id | BIGINT | PK, IDENTITY | Identificador único del registro. |
| contract_id | BIGINT | FK, NOT NULL | Identificador del contrato relacionado. |
| action | VARCHAR(255) | NOT NULL, CHECK | Tipo de acción realizada. |
| performed_by | VARCHAR(255) | NOT NULL | Usuario que realizó la operación. |
| detail | VARCHAR(500) | NULL | Descripción detallada de la operación. |
| created_at | TIMESTAMP | NOT NULL | Fecha y hora del registro. |

**Valores permitidos para el campo action:**

| Valor | Descripción |
|---|---|
| CREATED | Creación de un contrato. |
| UPDATED | Modificación de un contrato. |
| STATUS_CHANGED | Cambio de estado de un contrato. |
| ATTACHMENT_ADDED | Incorporación de un archivo adjunto. |

### 3.5. CONTRACT_ATTACHMENTS

**Descripción:** Almacena los archivos adjuntos asociados a los contratos, incluyendo sus metadatos y contenido binario.

| Campo | Tipo de dato | Restricciones | Descripción |
|---|---|---|---|
| id | BIGINT | PK, IDENTITY | Identificador único del archivo. |
| contract_id | BIGINT | FK, NOT NULL | Identificador del contrato asociado. |
| file_name | VARCHAR(255) | NOT NULL | Nombre del archivo adjunto. |
| file_size | BIGINT | NOT NULL, CHECK | Tamaño del archivo en bytes. |
| file_data | BYTEA | NOT NULL | Contenido binario del archivo. |
| uploaded_by | VARCHAR(255) | NOT NULL | Usuario que cargó el archivo. |
| uploaded_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha y hora de carga del archivo. |

**Restricciones adicionales:**

El tamaño del archivo debe ser mayor a cero y menor o igual a 10.485.760 bytes (10 MB).

## 4. Relaciones entre tablas

Las relaciones establecidas en la base de datos son las siguientes:

| Tabla origen | Campo | Tabla destino | Cardinalidad |
|---|---|---|---|
| CONTRACTS | client_id | CLIENTS.id | N:1 |
| CONTRACT_AUDIT_LOG | contract_id | CONTRACTS.id | N:1 |
| CONTRACT_ATTACHMENTS | contract_id | CONTRACTS.id | N:1 |

### 4.1. Reglas de integridad referencial

- Un cliente puede tener múltiples contratos.
- Cada contrato pertenece a un único cliente.
- Un contrato puede tener múltiples registros de auditoría.
- Un contrato puede tener múltiples archivos adjuntos.
- Al eliminar un contrato, sus registros de auditoría y archivos adjuntos se eliminan automáticamente mediante `ON DELETE CASCADE`.
- No existe eliminación en cascada configurada para la relación entre clientes y contratos.
- Los campos performed_by (CONTRACT_AUDIT_LOG) y uploaded_by (CONTRACT_ATTACHMENTS) guardan el nombre de usuario como texto y no como clave foránea hacia USERS, de modo que el historial se conserva aunque el usuario sea eliminado.
- Un cliente con contratos asociados no puede eliminarse: la regla se valida en la capa de servicio y la API responde 409 Conflict.
- La tabla flyway_schema_history es administrada por Flyway para registrar las migraciones aplicadas y no forma parte del modelo de negocio.

## 5. Índices y restricciones

### 5.1. Claves primarias

Todas las tablas cuentan con una clave primaria sobre el campo `id`, que identifica de manera única cada registro.

### 5.2. Restricciones UNIQUE

| Tabla | Campo | Descripción |
|---|---|---|
| USERS | username | Impide registrar nombres de usuario duplicados. |

### 5.3. Restricciones CHECK

| Tabla | Campo | Condición |
|---|---|---|
| CONTRACTS | status | Limita los estados a los valores definidos. |
| USERS | role | Limita los roles a ADMIN y OPERATOR. |
| CONTRACT_AUDIT_LOG | action | Limita las acciones a los valores definidos. |
| CONTRACT_ATTACHMENTS | file_size | Exige un tamaño mayor a cero y menor o igual a 10 MB. |

### 5.4. Índices adicionales

| Índice | Tabla | Campo |
|---|---|---|
| idx_contract_attachments_contract_id | CONTRACT_ATTACHMENTS | contract_id |

Este índice permite optimizar las consultas de archivos adjuntos asociados a un contrato.

## 6. Tipos de datos utilizados

| Tipo | Descripción |
|---|---|
| BIGINT | Número entero de 64 bits. |
| VARCHAR(n) | Cadena de caracteres con longitud máxima definida. |
| NUMERIC(12,2) | Número decimal con precisión de 12 dígitos y 2 decimales. |
| DATE | Fecha sin información horaria. |
| TIMESTAMP | Fecha y hora sin zona horaria. |
| BYTEA | Almacenamiento de información binaria. |

## 7. Convenciones y consideraciones

- Las claves primarias utilizan generación automática de identificadores mediante `IDENTITY`.
- Las claves foráneas garantizan la integridad referencial entre las entidades relacionadas.
- Los campos definidos como `NOT NULL` son obligatorios.
- Los campos definidos como `UNIQUE` no admiten valores duplicados.
- Las restricciones `CHECK` garantizan que determinados atributos respeten los valores permitidos.
- Los archivos adjuntos se almacenan directamente en PostgreSQL mediante el tipo `BYTEA`.
- El campo `uploaded_at` utiliza `CURRENT_TIMESTAMP` como valor predeterminado.

## 8. Gestión de versiones del esquema

La estructura de la base de datos se administra mediante Flyway, utilizando migraciones SQL versionadas.

Cada migración representa una modificación controlada del esquema de la base de datos, permitiendo mantener la estructura sincronizada entre los distintos entornos de desarrollo y ejecución.

Este diccionario documenta la estructura funcional y técnica de las tablas principales del sistema Contract Manager.



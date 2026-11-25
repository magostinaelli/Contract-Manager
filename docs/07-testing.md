# 🧪 Estrategia de Pruebas

## 1. Alcance

El backend cuenta con pruebas automatizadas de dos niveles. Ninguna requiere Docker, base de datos ni el servidor en ejecución, por lo que corren en pocos segundos.

| Nivel | Herramientas | Qué verifica |
| :--- | :--- | :--- |
| Unitarias de servicio | JUnit 5, Mockito, AssertJ | Reglas de negocio aisladas de la base de datos (los repositorios se simulan). |
| De controller (capa web) | `@WebMvcTest`, MockMvc, Spring Security Test | Códigos HTTP, formato de errores JSON y reglas de acceso por rol (RBAC). |

No se incluyen pruebas de integración con una base real ni pruebas automatizadas del frontend (ver sección 5).

## 2. Cómo ejecutarlas

Desde la carpeta `backend/`:

```bash
./mvnw test
```

Los reportes detallados quedan en `backend/target/surefire-reports`.

## 3. Qué se prueba

### 3.1. Pruebas unitarias de servicio

**`ContractServiceTest`**
- Cálculo automático del estado (`DRAFT`, `ACTIVE`, `EXPIRING_SOON`, `EXPIRED`) a partir de las fechas, incluidos los valores límite: justo dentro y justo fuera de la ventana de vencimiento, y contrato que vence hoy.
- Registro de auditoría `CREATED` al crear un contrato, con el usuario ejecutor.
- Al actualizar: se registran `UPDATED` y, solo si el estado cambia, `STATUS_CHANGED` con el detalle `ACTIVE -> EXPIRED`.
- Actualización automática de estados: registra el cambio con `SYSTEM` como usuario y no genera auditoría si nada cambia.
- Error `ResourceNotFoundException` cuando el contrato no existe.

**`ClientServiceTest`**
- Normalización del DNI/CUIT/CUIL: DNI de 7 y 8 dígitos, con puntos, CUIT con y sin formato y con espacios.
- Valores nulos o vacíos se almacenan como `null`.
- Valores inválidos (letras, longitudes incorrectas) lanzan `InvalidTaxIdException` y no se persisten.
- No se puede eliminar un cliente con contratos asociados.

**`UserServiceTest`**
- Alta de usuario con contraseña hasheada.
- Rechazo de username duplicado (`DuplicateResourceException`).
- Un administrador no puede cambiar su propio rol ni eliminar su propio usuario.
- Error al consultar un usuario inexistente.

### 3.2. Pruebas de controller

**`ContractControllerTest`**
- Sin token: `401 Unauthorized`.
- Un `OPERATOR` puede consultar contratos pero recibe `403 Forbidden` al intentar un `DELETE`.
- Un `ADMIN` puede eliminar un contrato (`204 No Content`).
- Creación válida: el usuario autenticado se pasa al servicio para la auditoría.
- Validación: un contrato sin título devuelve `400` con `{"title": "..."}`.
- Contrato inexistente: `404` con `{"error": "..."}`.
- Archivo adjunto demasiado grande: `413 Payload Too Large`.

**`UserControllerTest`**
- Un `OPERATOR` recibe `403` al listar o crear usuarios.
- Un `ADMIN` puede listar usuarios.
- Alta con username repetido: `409 Conflict` con el mensaje de error.

## 4. Resultado de la última ejecución

| Dato | Valor |
| :--- | :--- |
| Fecha | 23/11/2026 |
| Pruebas ejecutadas | 49 |
| Fallos | 0 |
| Errores | 0 |
| Omitidas | 0 |
| Resultado | `BUILD SUCCESS` |

## 5. Limitaciones y mejoras futuras

- No hay pruebas de integración con PostgreSQL real (por ejemplo, con Testcontainers), por lo que las migraciones de Flyway y las consultas JPA no se verifican automáticamente.
- Los controllers de clientes y autenticación (`ClientController`, `AuthController`) no tienen pruebas propias; seguirían el mismo patrón que los existentes.
- Los servicios `AuthService` y `ContractAttachmentService` no tienen pruebas unitarias propias.
- No hay pruebas automatizadas del frontend.
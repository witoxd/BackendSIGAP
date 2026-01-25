# API Documentation - Sistema de Información Educativa

## Tabla de Contenidos
1. [Autenticación](#autenticación)
2. [Usuarios](#usuarios)
3. [Personas](#personas)
4. [Estudiantes](#estudiantes)
5. [Profesores](#profesores)
6. [Administrativos](#administrativos)
7. [Cursos](#cursos)
8. [Matriculas](#matriculas)
9. [Sedes](#sedes)
10. [Jornadas](#jornadas)
11. [Acudientes](#acudientes)
12. [Roles y Permisos](#roles-y-permisos)
13. [Auditoría](#auditoría)

---

## Base URL
\`\`\`
http://localhost:3000/api
\`\`\`

## Autenticación

### 1. Registrar Usuario (Solo Admin)
**POST** `/auth/register`

**Headers:**
\`\`\`json
{
  "Authorization": "Bearer YOUR_ADMIN_TOKEN",
  "Content-Type": "application/json"
}
\`\`\`

**Body:**
\`\`\`json
{
  "persona_id": 1,
  "email": "usuario@example.com",
  "password": "Password123!",
  "username": "usuario123"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "usuario_id": 1,
    "persona_id": 1,
    "email": "usuario@example.com",
    "username": "usuario123",
    "activo": true
  },
  "message": "Usuario registrado exitosamente"
}
\`\`\`

### 2. Login
**POST** `/auth/login`

**Body:**
\`\`\`json
{
  "email": "usuario@example.com",
  "password": "Password123!"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "usuario_id": 1,
      "email": "usuario@example.com",
      "persona_id": 1,
      "roles": ["administrador"]
    }
  },
  "message": "Login exitoso"
}
\`\`\`

### 3. Obtener Usuario Actual
**GET** `/auth/me`

**Headers:**
\`\`\`json
{
  "Authorization": "Bearer YOUR_TOKEN"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "usuario_id": 1,
    "email": "usuario@example.com",
    "persona_id": 1,
    "roles": ["administrador"],
    "persona": {
      "nombres": "Juan",
      "apellido_paterno": "Pérez",
      "apellido_materno": "García"
    }
  }
}
\`\`\`

### 4. Cambiar Contraseña
**POST** `/auth/change-password`

**Headers:**
\`\`\`json
{
  "Authorization": "Bearer YOUR_TOKEN",
  "Content-Type": "application/json"
}
\`\`\`

**Body:**
\`\`\`json
{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword456!"
}
\`\`\`

---

## Usuarios

### 1. Buscar Usuarios
**GET** `/users/search?query=juan&page=1&limit=10`

**Headers:**
\`\`\`json
{
  "Authorization": "Bearer YOUR_TOKEN"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "usuario_id": 1,
      "email": "juan@example.com",
      "username": "juan123",
      "activo": true,
      "persona": {
        "nombres": "Juan",
        "apellido_paterno": "Pérez"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
\`\`\`

### 2. Obtener Usuario por ID
**GET** `/users/:id`

**Headers:**
\`\`\`json
{
  "Authorization": "Bearer YOUR_TOKEN"
}
\`\`\`

---

## Personas

### 1. Crear Persona
**POST** `/personas`

**Headers:**
\`\`\`json
{
  "Authorization": "Bearer YOUR_TOKEN",
  "Content-Type": "application/json"
}
\`\`\`

**Body:**
\`\`\`json
{
  "nombres": "María",
  "apellido_paterno": "González",
  "apellido_materno": "Rodríguez",
  "fecha_nacimiento": "2000-05-15",
  "genero": "Femenino",
  "direccion": "Calle Principal #123",
  "telefono": "+57 300 123 4567",
  "email": "maria.gonzalez@example.com"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "persona_id": 2,
    "nombres": "María",
    "apellido_paterno": "González",
    "apellido_materno": "Rodríguez",
    "fecha_nacimiento": "2000-05-15",
    "genero": "Femenino",
    "direccion": "Calle Principal #123",
    "telefono": "+57 300 123 4567",
    "email": "maria.gonzalez@example.com",
    "created_at": "2025-01-04T10:30:00.000Z"
  },
  "message": "Persona creada exitosamente"
}
\`\`\`

### 2. Listar Personas
**GET** `/personas?page=1&limit=20`

**Headers:**
\`\`\`json
{
  "Authorization": "Bearer YOUR_TOKEN"
}
\`\`\`

### 3. Obtener Persona por ID
**GET** `/personas/:id`

### 4. Actualizar Persona
**PUT** `/personas/:id`

**Body:**
\`\`\`json
{
  "telefono": "+57 300 999 8888",
  "direccion": "Nueva Dirección #456"
}
\`\`\`

### 5. Eliminar Persona
**DELETE** `/personas/:id`

---

## Estudiantes

### 1. Crear Estudiante
**POST** `/estudiantes`

**Headers:**
\`\`\`json
{
  "Authorization": "Bearer YOUR_TOKEN",
  "Content-Type": "application/json"
}
\`\`\`

**Body:**
\`\`\`json
{
  "persona_id": 2,
  "sede_id": 1,
  "jornada_id": 1,
  "codigo_estudiante": "EST-2025-001",
  "fecha_ingreso": "2025-01-15",
  "estado": "activo"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "estudiante_id": 1,
    "persona_id": 2,
    "sede_id": 1,
    "jornada_id": 1,
    "codigo_estudiante": "EST-2025-001",
    "fecha_ingreso": "2025-01-15",
    "estado": "activo"
  },
  "message": "Estudiante creado exitosamente"
}
\`\`\`

### 2. Listar Estudiantes
**GET** `/estudiantes?page=1&limit=20`

### 3. Buscar Estudiante
**GET** `/estudiantes/search/:query`

**Example:**
\`\`\`
GET /estudiantes/search/María
\`\`\`

### 4. Obtener Estudiante por ID
**GET** `/estudiantes/:id`

### 5. Actualizar Estudiante
**PUT** `/estudiantes/:id`

**Body:**
\`\`\`json
{
  "estado": "graduado"
}
\`\`\`

### 6. Eliminar Estudiante
**DELETE** `/estudiantes/:id`

---

## Profesores

### 1. Crear Profesor
**POST** `/profesores`

**Headers:**
\`\`\`json
{
  "Authorization": "Bearer YOUR_TOKEN",
  "Content-Type": "application/json"
}
\`\`\`

**Body:**
\`\`\`json
{
  "persona_id": 3,
  "sede_id": 1,
  "codigo_profesor": "PROF-2025-001",
  "titulo": "Licenciado en Matemáticas",
  "especialidad": "Matemáticas y Física",
  "fecha_contratacion": "2025-01-10",
  "estado": "activo"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "profesor_id": 1,
    "persona_id": 3,
    "sede_id": 1,
    "codigo_profesor": "PROF-2025-001",
    "titulo": "Licenciado en Matemáticas",
    "especialidad": "Matemáticas y Física",
    "fecha_contratacion": "2025-01-10",
    "estado": "activo"
  },
  "message": "Profesor creado exitosamente"
}
\`\`\`

### 2. Listar Profesores
**GET** `/profesores?page=1&limit=20`

### 3. Obtener Profesor por ID
**GET** `/profesores/:id`

### 4. Actualizar Profesor
**PUT** `/profesores/:id`

### 5. Eliminar Profesor
**DELETE** `/profesores/:id`

---

## Administrativos

### 1. Crear Administrativo
**POST** `/administrativos`

**Body:**
\`\`\`json
{
  "persona_id": 4,
  "sede_id": 1,
  "cargo": "Secretario Académico",
  "departamento": "Secretaría",
  "fecha_contratacion": "2024-08-01",
  "estado": "activo"
}
\`\`\`

### 2. Listar Administrativos
**GET** `/administrativos?page=1&limit=20`

### 3. Obtener Administrativo por ID
**GET** `/administrativos/:id`

### 4. Actualizar Administrativo
**PUT** `/administrativos/:id`

### 5. Eliminar Administrativo
**DELETE** `/administrativos/:id`

---

## Cursos

### 1. Crear Curso
**POST** `/cursos`

**Body:**
\`\`\`json
{
  "nombre": "Grado 10-A",
  "grado": "10",
  "nivel": "Media",
  "seccion": "A",
  "capacidad_maxima": 35,
  "sede_id": 1,
  "jornada_id": 1,
  "profesor_id": 1,
  "anio_escolar": 2025,
  "activo": true
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "curso_id": 1,
    "nombre": "Grado 10-A",
    "grado": "10",
    "nivel": "Media",
    "seccion": "A",
    "capacidad_maxima": 35,
    "sede_id": 1,
    "jornada_id": 1,
    "profesor_id": 1,
    "anio_escolar": 2025,
    "activo": true
  },
  "message": "Curso creado exitosamente"
}
\`\`\`

### 2. Listar Cursos
**GET** `/cursos?page=1&limit=20`

### 3. Obtener Curso por ID
**GET** `/cursos/:id`

### 4. Actualizar Curso
**PUT** `/cursos/:id`

### 5. Eliminar Curso
**DELETE** `/cursos/:id`

---

## Matriculas

### 1. Crear Matrícula
**POST** `/matriculas`

**Body:**
\`\`\`json
{
  "estudiante_id": 1,
  "curso_id": 1,
  "anio_escolar": 2025,
  "fecha_matricula": "2025-01-15",
  "estado": "activa",
  "observaciones": "Matrícula regular"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "matricula_id": 1,
    "estudiante_id": 1,
    "curso_id": 1,
    "anio_escolar": 2025,
    "fecha_matricula": "2025-01-15",
    "estado": "activa",
    "observaciones": "Matrícula regular"
  },
  "message": "Matrícula creada exitosamente"
}
\`\`\`

### 2. Listar Matrículas
**GET** `/matriculas?page=1&limit=20`

### 3. Obtener Matrícula por ID
**GET** `/matriculas/:id`

### 4. Actualizar Matrícula
**PUT** `/matriculas/:id`

### 5. Eliminar Matrícula
**DELETE** `/matriculas/:id`

---

## Sedes

### 1. Crear Sede
**POST** `/sedes`

**Body:**
\`\`\`json
{
  "nombre": "Sede Principal",
  "direccion": "Avenida Principal #100",
  "telefono": "+57 1 234 5678",
  "email": "principal@colegio.edu.co",
  "activo": true
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "sede_id": 1,
    "nombre": "Sede Principal",
    "direccion": "Avenida Principal #100",
    "telefono": "+57 1 234 5678",
    "email": "principal@colegio.edu.co",
    "activo": true
  },
  "message": "Sede creada exitosamente"
}
\`\`\`

### 2. Listar Sedes
**GET** `/sedes?page=1&limit=20`

### 3. Obtener Sede por ID
**GET** `/sedes/:id`

### 4. Actualizar Sede
**PUT** `/sedes/:id`

### 5. Eliminar Sede
**DELETE** `/sedes/:id`

---

## Jornadas

### 1. Crear Jornada
**POST** `/jornadas`

**Body:**
\`\`\`json
{
  "nombre": "Jornada Mañana",
  "hora_inicio": "07:00:00",
  "hora_fin": "13:00:00",
  "activo": true
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "jornada_id": 1,
    "nombre": "Jornada Mañana",
    "hora_inicio": "07:00:00",
    "hora_fin": "13:00:00",
    "activo": true
  },
  "message": "Jornada creada exitosamente"
}
\`\`\`

### 2. Listar Jornadas
**GET** `/jornadas?page=1&limit=20`

### 3. Obtener Jornada por ID
**GET** `/jornadas/:id`

### 4. Actualizar Jornada
**PUT** `/jornadas/:id`

### 5. Eliminar Jornada
**DELETE** `/jornadas/:id`

---

## Acudientes

### 1. Crear Acudiente
**POST** `/acudientes`

**Body:**
\`\`\`json
{
  "persona_id": 5,
  "parentesco": "Madre",
  "es_responsable": true
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "acudiente_id": 1,
    "persona_id": 5,
    "parentesco": "Madre",
    "es_responsable": true
  },
  "message": "Acudiente creado exitosamente"
}
\`\`\`

### 2. Listar Acudientes
**GET** `/acudientes?page=1&limit=20`

### 3. Obtener Acudiente por ID
**GET** `/acudientes/:id`

### 4. Actualizar Acudiente
**PUT** `/acudientes/:id`

### 5. Eliminar Acudiente
**DELETE** `/acudientes/:id`

---

## Roles y Permisos

### 1. Crear Role
**POST** `/roles`

**Body:**
\`\`\`json
{
  "nombre": "coordinador",
  "descripcion": "Coordinador académico",
  "activo": true
}
\`\`\`

### 2. Listar Roles
**GET** `/roles?page=1&limit=20`

### 3. Crear Permiso
**POST** `/permisos`

**Body:**
\`\`\`json
{
  "nombre": "ver_estudiantes",
  "descripcion": "Permiso para ver estudiantes",
  "recurso": "estudiantes",
  "accion": "read"
}
\`\`\`

### 4. Listar Permisos
**GET** `/permisos?page=1&limit=20`

### 5. Asignar Permiso a Role
**POST** `/roles/:roleId/permisos`

**Body:**
\`\`\`json
{
  "permiso_id": 1
}
\`\`\`

---

## Auditoría

### 1. Listar Auditorías
**GET** `/auditoria?page=1&limit=50`

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "auditoria_id": 1,
      "usuario_id": 1,
      "accion": "CREATE",
      "tabla": "estudiantes",
      "registro_id": 1,
      "datos_anteriores": null,
      "datos_nuevos": {"nombre": "Juan", "estado": "activo"},
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "fecha": "2025-01-04T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
\`\`\`

### 2. Obtener Auditoría por ID
**GET** `/auditoria/:id`

### 3. Listar Auditorías por Usuario
**GET** `/auditoria/usuario/:usuarioId`

### 4. Listar Auditorías por Acción
**GET** `/auditoria/accion/:accion`

**Example:**
\`\`\`
GET /auditoria/accion/CREATE
GET /auditoria/accion/UPDATE
GET /auditoria/accion/DELETE
\`\`\`

---

## Códigos de Estado HTTP

- `200 OK` - Solicitud exitosa
- `201 Created` - Recurso creado exitosamente
- `400 Bad Request` - Error de validación
- `401 Unauthorized` - No autenticado
- `403 Forbidden` - No tiene permisos
- `404 Not Found` - Recurso no encontrado
- `409 Conflict` - Conflicto (ej: email duplicado)
- `429 Too Many Requests` - Límite de tasa excedido
- `500 Internal Server Error` - Error del servidor

---

## Notas Importantes

1. **Autenticación**: Todas las rutas excepto `/auth/login` requieren un token JWT en el header `Authorization: Bearer TOKEN`

2. **Permisos**: Las acciones están controladas por el sistema ACL (Access Control List). Los administradores tienen acceso completo.

3. **Paginación**: La mayoría de endpoints GET que retornan listas soportan paginación mediante `?page=1&limit=20`

4. **Rate Limiting**: Las rutas de autenticación tienen límite de tasa para prevenir ataques de fuerza bruta

5. **Validación**: Todos los datos son validados. Errores de validación retornan código 400 con detalles de los campos inválidos

6. **Auditoría**: Todas las operaciones CREATE, UPDATE y DELETE son registradas automáticamente en la tabla de auditoría

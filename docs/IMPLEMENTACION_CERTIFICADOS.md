# Implementación del Módulo de Certificados

**Fecha:** 21 de diciembre de 2025  
**Estado:** ✅ Completado  
**Requerimientos:** RF-22 a RF-34  
**Última actualización:** Implementación completa del módulo con backend y frontend integrados

## Resumen

Se ha implementado completamente el módulo de certificados de capacitación siguiendo arquitectura hexagonal y principios SOLID. El módulo incluye generación automática de PDF, códigos QR, verificación pública y soporte para certificados retroactivos con auditoría.

## Requerimientos Implementados

### RF-22: Generación Automática de Certificado PDF ✅
- **Backend:** `CreateCertificadoUseCase` genera automáticamente el PDF al crear un certificado
- **Servicio:** `PdfGeneratorService` crea el PDF con todos los campos requeridos
- **Almacenamiento:** PDFs guardados en `./storage/certificates` (configurable)

### RF-23: Campos del Certificado ✅
El certificado incluye todos los campos requeridos:
- Membrete institucional (configurable)
- Nombre completo del conductor
- Número de documento de identidad
- Nombre del curso aprobado
- Fecha de emisión (puede ser retroactiva)
- Nombre del capacitador responsable
- Firma digital (imagen asociada)
- Código QR único

### RF-24: Código QR con UUID v4 ✅
- **Servicio:** `QrGeneratorService` genera tokens UUID v4 únicos
- **QR Code:** Generado como imagen base64 usando librería `qrcode`
- **URL de verificación:** `https://plataforma.com/verify/{token}`

### RF-25 a RF-31: Certificados Retroactivos ✅
- **RF-25:** Solo administrador puede emitir certificado retroactivo
- **RF-26:** Funcionalidad deshabilitada por defecto, requiere activación manual
- **RF-27:** Validación de fecha retroactiva (máximo 6 meses atrás)
- **RF-28:** Solo se muestra fecha retroactiva en documento público
- **RF-29:** Log de auditoría inmutable en `AuditoriaCertificadoRetroactivo`
- **RF-30:** Log accesible solo para administrador (pendiente exportación)
- **RF-31:** Portal de verificación muestra fecha retroactiva como fecha de emisión

### RF-32 a RF-34: Verificación Externa ✅
- **RF-32:** Endpoint público `/public/verify/:token` sin autenticación
- **RF-33:** Muestra información del certificado (nombre, documento, curso, fechas, estado)
- **RF-34:** No muestra información técnica, de usuario ni datos del administrador

## Estructura del Módulo

### Backend

```
training_api/src/
├── domain/certificados/
│   └── ports/
│       └── certificados.repository.port.ts  # Puerto del repositorio
├── application/certificados/
│   ├── dto/
│   │   ├── create-certificado.dto.ts
│   │   ├── update-certificado.dto.ts
│   │   └── index.ts
│   └── use-cases/
│       ├── create-certificado.use-case.ts
│       ├── find-all-certificados.use-case.ts
│       ├── find-one-certificado.use-case.ts
│       ├── verify-certificado.use-case.ts
│       ├── update-certificado-retroactivo.use-case.ts
│       └── index.ts
├── infrastructure/certificados/
│   ├── certificados.controller.ts          # Endpoints protegidos
│   ├── public-certificados.controller.ts   # Endpoint público
│   ├── certificados.repository.adapter.ts
│   └── certificados.module.ts
└── infrastructure/shared/services/
    ├── pdf-generator.service.ts
    └── qr-generator.service.ts
```

### Frontend

```
training/src/
├── infrastructure/http/certificates/
│   └── certificates.service.ts             # Conectado con backend real
└── presentation/certificates/
    ├── pages/
    │   ├── CertificatesListPage.vue
    │   ├── CertificateDetailPage.vue
    │   └── CertificateVerificationPage.vue
    └── components/
        └── CertificatePreview.vue
```

## Endpoints de la API

### Endpoints Protegidos (requieren autenticación JWT)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/certificados` | Crear un nuevo certificado |
| POST | `/certificados/list` | Listar certificados con paginación |
| GET | `/certificados/:id` | Obtener certificado por ID |
| GET | `/certificados/:id/download` | Descargar PDF del certificado |
| PATCH | `/certificados/:id/retroactivo` | Actualizar certificado retroactivo (solo admin) |
| DELETE | `/certificados/:id` | Eliminar certificado (no permitido por políticas) |

### Endpoints Públicos (sin autenticación)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/public/verify/:token` | Verificar certificado por token público |

## Configuración

### Variables de Entorno

```env
# Almacenamiento de PDFs
PDF_STORAGE_PATH=./storage/certificates

# URL base de la aplicación
APP_URL=http://localhost:3000

# URL pública de verificación
PUBLIC_VERIFICATION_URL=https://plataforma.com/verify

# Imagen del membrete institucional (opcional)
CERTIFICATE_HEADER_IMAGE=./assets/membrete.png
```

### Dependencias Agregadas

```json
{
  "dependencies": {
    "pdfkit": "^0.15.0",
    "qrcode": "^1.5.4",
    "uuid": "^11.0.3"
  },
  "devDependencies": {
    "@types/pdfkit": "^0.13.5",
    "@types/qrcode": "^1.5.5",
    "@types/uuid": "^10.0.0"
  }
}
```

## Flujo de Generación de Certificado

1. **Aprobación de Evaluación:** Cuando un estudiante aprueba una evaluación
2. **Creación de Certificado:** Se llama a `POST /certificados` con `inscripcionId`
3. **Validación:** Se valida que la inscripción esté aprobada
4. **Generación de Token:** Se genera UUID v4 único
5. **Generación de QR:** Se crea código QR con URL de verificación
6. **Generación de PDF:** Se crea el PDF con todos los campos
7. **Almacenamiento:** PDF guardado en sistema de archivos
8. **Persistencia:** Certificado guardado en base de datos con todas las referencias

## Flujo de Verificación Pública

1. **Acceso:** Usuario accede a `/public/verify/{token}`
2. **Búsqueda:** Sistema busca certificado por `hashVerificacion`
3. **Validación:** Se verifica que el certificado esté activo y no vencido
4. **Respuesta:** Se retorna información pública (sin datos técnicos)

## Flujo de Certificado Retroactivo

1. **Solicitud:** Administrador solicita certificado retroactivo
2. **Validación:** Se valida fecha (máximo 6 meses atrás) y justificación
3. **Auditoría:** Se registra en `AuditoriaCertificadoRetroactivo` ANTES de actualizar
4. **Actualización:** Se actualiza certificado con fecha retroactiva
5. **Regeneración:** Se regenera PDF con fecha retroactiva

## Próximos Pasos

### Pendientes
- [ ] Endpoint de exportación de auditoría (RF-30)
- [ ] Integración con S3 para almacenamiento de PDFs
- [ ] Historial de verificaciones (tracking de accesos)
- [ ] Estadísticas avanzadas de certificados
- [ ] Notificaciones de vencimiento (RF-35 a RF-39)

### Mejoras Futuras
- [ ] Plantillas personalizables de certificados
- [ ] Firma digital con certificado X.509
- [ ] Integración con blockchain para verificación inmutable
- [ ] API de verificación para terceros

## Testing

### Endpoints a Probar

1. **Crear Certificado:**
```bash
POST /certificados
{
  "inscripcionId": 1
}
```

2. **Listar Certificados:**
```bash
POST /certificados/list
{
  "page": 1,
  "limit": 10
}
```

3. **Descargar PDF:**
```bash
GET /certificados/1/download
```

4. **Verificar Públicamente:**
```bash
GET /public/verify/{token}
```

5. **Actualizar Retroactivo:**
```bash
PATCH /certificados/1/retroactivo
{
  "esRetroactivo": true,
  "fechaRetroactiva": "2024-12-01",
  "justificacionRetroactiva": "Capacitación presencial realizada con posterior registro"
}
```

## Notas Técnicas

- **Arquitectura:** Hexagonal (puertos y adaptadores)
- **Principios SOLID:** Aplicados en toda la implementación
- **Validación:** DTOs con class-validator
- **Documentación:** Swagger automático con decoradores
- **Seguridad:** JWT para endpoints protegidos, público para verificación
- **Auditoría:** Log inmutable para certificados retroactivos

## Integración Frontend-Backend

### Estado de la Integración ✅

El frontend está completamente conectado con el backend:

- ✅ **Servicio HTTP actualizado:** `CertificatesService` eliminó todos los mocks
- ✅ **Mapeo de datos:** Conversión correcta de respuestas backend → modelos de dominio
- ✅ **Manejo de errores:** Implementado con try-catch y mensajes descriptivos
- ✅ **Endpoints conectados:**
  - `POST /certificados` - Crear certificado
  - `POST /certificados/list` - Listar con paginación
  - `GET /certificados/:id` - Obtener por ID
  - `GET /certificados/:id/download` - Descargar PDF
  - `GET /public/verify/:token` - Verificación pública
  - `PATCH /certificados/:id/retroactivo` - Actualizar retroactivo

### Cambios en el Frontend

1. **Eliminación de mocks:** Todos los datos mock fueron reemplazados por llamadas HTTP reales
2. **Mapeo mejorado:** Función `mapBackendToDomain` actualizada para manejar estructura real del backend
3. **Tipos actualizados:** Interface `BackendCertificate` alineada con respuesta real del API

## Path de Almacenamiento

El path completo de almacenamiento de PDFs depende del directorio de trabajo actual:

**Path relativo configurado:**
```env
PDF_STORAGE_PATH=./storage/certificates
```

**Path completo (desde raíz del proyecto backend):**
```
C:\Users\USUARIO\Documents\Capacitaciones\training_api\storage\certificates
```

**Nota:** El código usa `path.resolve()` para asegurar que el path sea absoluto desde el directorio de trabajo actual (`process.cwd()`).

## Referencias

- [SRS_CAPACITACIONES.md](./SRS_CAPACITACIONES.md) - Requerimientos funcionales
- [INFORME_ESTADO_Y_PLANNING_MVP.md](./INFORME_ESTADO_Y_PLANNING_MVP.md) - Estado del proyecto


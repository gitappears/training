# ¡Déjanos Ser Parte De Tu Evolución!

# DOCUMENTO DE REQUERIMIENTOS DEL SISTEMA

## Plataforma de Capacitación Virtual para Conductores de Empresas de Transporte

**Cliente:** CONFIANZA IPS S.A.S.  
**Desarrollador:** Appears S.A.S.  
**Fecha:** 18 de diciembre de 2025  
**Versión:** 4.0  
**Nivel de madurez:** Cumplimiento regulatorio + flexibilidad operativa + optimización de recursos + gestión de pagos y habilitación de usuarios

---

## 1. Objetivo del Sistema

Desarrollar una plataforma digital que permita a empresas de transporte y conductores independientes gestionar de forma integral, segura y escalable la capacitación obligatoria en temas críticos (manejo defensivo, primeros auxilios, transporte de mercancías peligrosas, etc.), mediante los siguientes objetivos:

- Crear, gestionar y asignar capacitaciones obligatorias con evaluaciones automatizadas de cinco tipos de preguntas.
- Integrar material de apoyo multimedia (PDF, imágenes y videos vía URL de YouTube, Google Drive o OneDrive) sin consumir almacenamiento local.
- Generar certificados digitales automáticos tras la aprobación, personalizados con membrete institucional, firmas autorizadas y código QR único.
- Permitir la emisión de certificados con fecha retroactiva autorizada, exclusivamente por el administrador, bajo controles de justificación, trazabilidad y auditoría inmutable.
- Gestionar vigencias de certificaciones, con alertas automáticas a empresas y conductores ante vencimientos próximos.
- Facilitar reportes institucionales en tiempo real para seguimiento de cumplimiento, cobertura y eficacia.
- Permitir a clientes empresariales cargar sus conductores, habilitarlos y asignarles cursos específicos.
- Permitir al administrador de la plataforma crear usuarios externos (conductores independientes) y asignarles cursos, únicamente tras registrar un pago manual previo realizado con IPS Confianza.
- Garantizar el cumplimiento normativo con la Ley 1581 de 2012 (protección de datos personales en Colombia) y políticas de tratamiento de información.

---

## 2. Actores del Sistema

El sistema contempla tres tipos de actores principales:

1. **Administrador de la Plataforma (IPS Confianza)**
2. **Cliente Institucional (Empresas de Transporte)**
3. **Conductor (Personas Naturales)**

---

## 3. Requerimientos Funcionales

### 3.1. Gestión de Usuarios

- **RF-01:** El sistema permitirá el registro de usuarios como personas naturales (conductores) y personas jurídicas (empresas de transporte).

- **RF-02:** Las empresas podrán registrar conductores asociados de forma individual o masiva mediante archivo CSV con campos: nombre completo, número de documento, correo electrónico y teléfono.

- **RF-03:** El sistema implementará tres roles de usuario diferenciados:
  - **Administrador:** Acceso total a la configuración de la plataforma.
  - **Cliente Institucional:** Acceso limitado a la gestión de sus conductores y reportes.
  - **Conductor:** Acceso solo a cursos asignados y descarga de certificados.

- **RF-04:** El Administrador de la Plataforma podrá crear usuarios externos (conductores independientes) desde el panel de administración, ingresando:
  - Nombre completo
  - Número de documento
  - Correo electrónico
  - Teléfono
  - Empresa (opcional, si no aplica, se deja en blanco)

- **RF-05:** Un conductor externo no podrá iniciar sesión ni acceder a cursos hasta que el Administrador lo habilite explícitamente.

- **RF-06:** La habilitación de un conductor externo requiere que el Administrador registre un pago manual previo realizado con IPS Confianza. Este pago se registrará en el sistema con los siguientes campos:
  - Fecha de pago
  - Valor pagado
  - Método de pago (efectivo, transferencia, consignación, etc.)
  - Comprobante (opcional: imagen o PDF subido)
  - Observaciones (ej: "Pago por curso de manejo defensivo")

- **RF-07:** Solo después de registrar el pago, el Administrador podrá habilitar al conductor externo y asignarle cursos.

### 3.2. Gestión de Cursos

- **RF-08:** El administrador podrá crear cursos con los siguientes atributos:
  - Título
  - Descripción
  - Duración estimada (en horas)
  - Estado (activo/inactivo)
  - Material de apoyo (múltiples recursos: PDF, imágenes, videos vía URL)
  - Evaluación asociada (obligatoria, con al menos una pregunta)

- **RF-09:** Cada curso debe tener obligatoriamente una evaluación vinculada. No se permitirá publicar un curso sin evaluación.

- **RF-10:** Los cursos podrán activarse o desactivarse en cualquier momento, sin afectar los certificados ya emitidos.

### 3.3. Material de Apoyo Multimedia

- **RF-11:** El sistema permitirá adjuntar tres tipos de recursos como material de apoyo:
  - **PDF:** Archivo subido directamente al servidor o bucket de almacenamiento.
  - **Imágenes:** Archivos JPG o PNG subidos directamente.
  - **Videos:** No se subirán al servidor. Se integrarán mediante URL públicas de:
    - YouTube (formato estándar o acortado)
    - Google Drive (con permisos de "cualquiera con el enlace puede ver")
    - OneDrive (con permisos de visualización pública)

- **RF-12:** Al ingresar una URL de video, el sistema validará que pertenezca a uno de los servicios soportados y que el enlace sea accesible.

- **RF-13:** Si la URL es válida, el sistema generará un iframe seguro que permita la reproducción embebida del video dentro de la plataforma, sin redirigir al usuario a sitios externos.

- **RF-14:** Si la URL es inválida, caduca o no corresponde a los servicios permitidos, el sistema mostrará un mensaje claro: "Este video no está disponible. Por favor, contacte al administrador."

- **RF-15:** El administrador podrá editar o eliminar cualquier recurso en cualquier momento. Los cambios se reflejarán inmediatamente para todos los usuarios.

### 3.4. Evaluaciones

- **RF-16:** El sistema soportará cinco tipos de preguntas:
  - **Única respuesta:** El conductor selecciona una sola opción. Solo una es correcta.
  - **Respuesta múltiple:** El conductor puede seleccionar varias opciones. Se considera correcta solo si selecciona todas las respuestas correctas y ninguna incorrecta.
  - **Selección de imagen:** Se muestran varias imágenes; el conductor debe seleccionar la imagen correcta asociada al enunciado.
  - **Falso o Verdadero:** Dos opciones predefinidas: "Falso" / "Verdadero". Solo una es correcta.
  - **Sí o No:** Dos opciones predefinidas: "Sí" / "No". Solo una es correcta.

- **RF-17:** Al crear una pregunta, el administrador seleccionará el tipo, ingresará el enunciado, y definirá qué opciones son correctas (una o varias, según el tipo).

- **RF-18:** La calificación de la evaluación será automática y en tiempo real, inmediatamente después de responder la última pregunta.

- **RF-19:** El porcentaje mínimo de aprobación será configurable por curso (ej. 70%, 80%, etc.).

- **RF-20:** Si el conductor aprueba, se habilitará inmediatamente el botón "Descargar certificado".

- **RF-21:** Si reprueba, podrá reintentar la evaluación hasta el número de intentos permitidos (configurable por defecto en 2, pero modificable por curso).

### 3.5. Generación de Certificados

- **RF-22:** Al aprobar, el sistema generará automáticamente un certificado en formato PDF, listo para descarga.

- **RF-23:** El certificado incluirá:
  - Membrete institucional (imagen subida por el administrador)
  - Nombre completo del conductor
  - Número de documento de identidad
  - Nombre del curso aprobado
  - Fecha de emisión del certificado (puede ser retroactiva, según RF-26)
  - Nombre del capacitador responsable
  - Firma digital pre-cargada (imagen asociada al capacitador)
  - Código QR único y seguro

- **RF-24:** El código QR será generado a partir de un token único (UUID v4) y redirigirá a una URL pública de verificación: `https://plataforma.com/verificar/{token}`

### 3.6. Emisión de Certificados con Fecha Retroactiva

- **RF-25:** Solo el rol Administrador podrá emitir un certificado con fecha de emisión anterior a la fecha real de aprobación.

- **RF-26:** Esta funcionalidad estará deshabilitada por defecto y requerirá activación manual por cada caso.

- **RF-27:** Al activar la opción de fecha retroactiva, el sistema exigirá:
  - **Fecha de emisión deseada**, que debe cumplir:
    - Ser anterior o igual a la fecha actual
    - No ser anterior a 6 meses respecto a la fecha actual (este límite será configurable en el backend)
  - **Motivo justificado**, seleccionado de una lista predefinida o ingresado como texto libre:
    - "Capacitación presencial realizada con posterior registro"
    - "Reposición por error administrativo"
    - "Requisito regulatorio de empresa transportista"
    - "Otro (especificar)"

- **RF-28:** El certificado solo mostrará la fecha retroactiva en el documento público. La fecha real de aprobación no será visible para el conductor ni para verificadores externos.

- **RF-29:** El sistema registrará en un log de auditoría inmutable los siguientes datos:
  - ID del certificado
  - Nombre del conductor
  - Curso aprobado
  - Fecha real de aprobación (registro técnico)
  - Fecha retroactiva emitida
  - Motivo justificado
  - Nombre del administrador que autorizó el cambio
  - Fecha y hora de la autorización

- **RF-30:** Este log será accesible únicamente para el Administrador, con opción de exportar a PDF o CSV.

- **RF-31:** El portal de verificación pública mostrará la fecha retroactiva como fecha de emisión, manteniendo la apariencia de validez y coherencia temporal.

### 3.7. Verificación Externa de Certificados

- **RF-32:** Cualquier persona podrá acceder a la URL pública de verificación: `https://plataforma.com/verificar/{token}`

- **RF-33:** El portal mostrará:
  - Nombre completo del conductor
  - Número de documento
  - Nombre del curso
  - Fecha de emisión (la pública, incluso si es retroactiva)
  - Fecha de vencimiento (calculada a partir de la fecha de emisión)
  - Estado: VÁLIDO o VENCIDO

- **RF-34:** No se mostrará ninguna información técnica, de usuario, ni datos del administrador.

### 3.8. Gestión de Vigencias y Alertas

- **RF-35:** Cada curso tendrá un campo "Duración de vigencia" (en meses), configurable por el administrador.

- **RF-36:** La fecha de vencimiento del certificado se calculará como: fecha de emisión + duración de vigencia.

- **RF-37:** El sistema ejecutará diariamente una tarea programada que identifique certificados próximos a vencer y enviará correos electrónicos automáticos a:
  - El conductor
  - El representante de la empresa (cliente institucional)

- **RF-38:** Las alertas se enviarán:
  - 30 días antes del vencimiento
  - 7 días antes del vencimiento
  - El mismo día del vencimiento

- **RF-39:** El panel del cliente institucional incluirá un reporte dedicado: "Certificaciones próximas a vencer", con filtros y opción de exportación.

### 3.9. Reportes e Indicadores

- **RF-40:** El panel del cliente institucional permitirá generar reportes con filtros por:
  - Empresa (Solo listará los conductores y cursos pertenecientes a esta empresa)
  - Conductor
  - Curso
  - Estado (aprobado/reprobado)
  - Vigencia (activa/vencida/próxima a vencer)

- **RF-41:** El DashBoard institucional mostrará indicadores clave:
  - Porcentaje de cumplimiento total
  - Tasa de aprobación por curso
  - Cursos más asignados
  - Tiempo promedio de finalización

- **RF-42:** El administrador (IPS CONFIANZA) tendrá acceso a un reporte adicional: "Certificados emitidos con fecha retroactiva", con todos los campos del log de auditoría (RF-29).

### 3.10. Cumplimiento Normativo

- **RF-43:** Al registrarse, el conductor debe aceptar obligatoriamente dos documentos:
  - Política de tratamiento de datos personales
  - Términos y condiciones de uso

- **RF-44:** Ambos documentos serán configurables por el administrador y se mostrarán en formato de lectura obligatoria con checkbox de aceptación. (Validar opción de firma digital)

- **RF-45:** La plataforma cumplirá con los principios de la Ley 1581 de 2012 y el Decreto 1377 de 2013 de Colombia en el tratamiento de datos personales.

---

## 4. Requerimientos No Funcionales

### 4.1. Rendimiento
- El sistema debe soportar al menos 500 usuarios concurrentes sin degradación significativa del rendimiento.
- El tiempo de generación de certificados no debe exceder los 3 segundos.
- Las evaluaciones deben calificarse en tiempo real (menos de 1 segundo).

### 4.2. Escalabilidad
- La arquitectura debe permitir crecimiento horizontal para soportar incrementos en la demanda.
- El sistema debe ser capaz de gestionar al menos 10,000 usuarios registrados y 5,000 certificados activos.

### 4.3. Seguridad
- Todas las comunicaciones deben realizarse mediante HTTPS.
- Las contraseñas deben almacenarse con hash seguro (bcrypt o superior).
- Implementar tokens JWT para la gestión de sesiones.
- El log de auditoría debe ser inmutable y accesible solo por administradores.

### 4.4. Disponibilidad
- El sistema debe tener una disponibilidad mínima del 99% mensual.
- Se deben implementar respaldos automáticos diarios de la base de datos.

### 4.5. Usabilidad
- La interfaz debe ser responsive y funcionar correctamente en dispositivos móviles, tablets y desktop.
- El sistema debe ser intuitivo y no requerir capacitación técnica para los usuarios finales.

### 4.6. Compatibilidad
- Soporte para navegadores: Chrome, Firefox, Safari y Edge (últimas 2 versiones).
- Los certificados PDF deben ser compatibles con lectores estándar (Adobe Reader, navegadores).

---

## 5. Casos de Uso Clave

### 5.1. Conductor completa curso y descarga certificado

**Actor Principal:** Conductor

**Precondiciones:**
- El conductor está registrado y habilitado en el sistema
- Tiene un curso asignado
- El curso está activo

**Flujo Principal:**
1. El conductor inicia sesión en la plataforma
2. Accede al listado de cursos asignados
3. Selecciona el curso a realizar
4. Visualiza el material de apoyo (PDF, imágenes, videos)
5. Una vez revisado el material, accede a la evaluación
6. Responde todas las preguntas de la evaluación
7. El sistema califica automáticamente
8. Si aprueba (cumple el porcentaje mínimo), se habilita el botón "Descargar certificado"
9. El conductor descarga su certificado en formato PDF
10. El sistema registra la emisión del certificado

**Flujo Alternativo:**
- Si el conductor reprueba, puede reintentar según el número de intentos permitidos
- Si agota los intentos, debe contactar al administrador

---

### 5.2. Verificación externa del certificado

**Actor Principal:** Verificador externo (empleador, autoridad, tercero)

**Precondiciones:**
- El verificador tiene acceso al código QR o URL del certificado

**Flujo Principal:**
1. El verificador escanea el código QR o accede a la URL `https://plataforma.com/verificar/{token}`
2. El sistema valida el token
3. Si el token es válido, muestra la información del certificado:
   - Nombre del conductor
   - Número de documento
   - Nombre del curso
   - Fecha de emisión
   - Fecha de vencimiento
   - Estado (VÁLIDO o VENCIDO)
4. El verificador confirma la autenticidad del certificado

**Flujo Alternativo:**
- Si el token es inválido, el sistema muestra: "Certificado no encontrado o inválido"

---

### 5.3. Administrador emite certificado con fecha retroactiva

**Actor Principal:** Administrador

**Precondiciones:**
- Un conductor ha aprobado un curso
- Existe una justificación válida para emisión retroactiva

**Flujo Principal:**
1. El administrador accede al panel de gestión de certificados
2. Selecciona el certificado del conductor
3. Activa la opción "Emitir con fecha retroactiva"
4. Ingresa la fecha de emisión deseada (dentro del límite de 6 meses)
5. Selecciona o ingresa el motivo justificado
6. El sistema valida que la fecha cumpla las restricciones
7. El sistema registra la operación en el log de auditoría inmutable con:
   - Fecha real de aprobación
   - Fecha retroactiva emitida
   - Motivo
   - Usuario administrador
   - Timestamp de la operación
8. El sistema genera el certificado con la fecha retroactiva
9. El certificado queda disponible para descarga por el conductor

**Flujo Alternativo:**
- Si la fecha no cumple las restricciones, el sistema muestra un error y no permite continuar

---

### 5.4. Administrador crea conductor externo y asigna curso tras pago manual

**Actor Principal:** Administrador

**Precondiciones:**
- El administrador ha recibido un pago manual de un conductor independiente

**Flujo Principal:**
1. El administrador accede al panel de gestión de usuarios
2. Selecciona "Crear conductor externo"
3. Ingresa los datos del conductor:
   - Nombre completo
   - Número de documento
   - Correo electrónico
   - Teléfono
   - Empresa (opcional)
4. El sistema crea el usuario en estado "No habilitado"
5. El administrador accede a "Registrar pago manual"
6. Ingresa los datos del pago:
   - Fecha de pago
   - Valor pagado
   - Método de pago
   - Comprobante (opcional)
   - Observaciones
7. El sistema registra el pago con trazabilidad completa
8. El administrador habilita al conductor
9. El administrador asigna el/los curso(s) correspondiente(s)
10. El sistema envía correo al conductor con credenciales de acceso
11. El conductor puede iniciar sesión y acceder a sus cursos

**Flujo Alternativo:**
- Si no se registra el pago, el conductor no puede ser habilitado ni asignado a cursos

---

### 5.5. Cliente institucional habilita conductores y asigna cursos

**Actor Principal:** Cliente Institucional (Empresa de Transporte)

**Precondiciones:**
- La empresa está registrada y tiene conductores asociados
- Existen cursos activos en la plataforma

**Flujo Principal:**
1. El cliente institucional inicia sesión
2. Accede a "Gestión de conductores"
3. Puede registrar conductores de dos formas:
   - **Individual:** Ingresando datos manualmente
   - **Masiva:** Cargando archivo CSV con los datos
4. El sistema valida los datos y crea los usuarios conductores
5. El cliente institucional selecciona los conductores a habilitar
6. Asigna cursos específicos a cada conductor o grupo de conductores
7. El sistema envía notificaciones por correo a los conductores
8. Los conductores pueden acceder a sus cursos asignados

**Flujo Alternativo:**
- Si el archivo CSV tiene errores, el sistema muestra los registros con problemas y no los importa

---

## 6. Consideraciones de Seguridad y Privacidad

### 6.1. Protección de Videos Externos
- Las URLs de video deben ser públicas; el sistema no almacena ni descarga contenido externo.
- La reproducción de videos se realiza mediante iframes con atributos de sandboxing y CSP restrictivo.

### 6.2. Auditoría Inmutable
- El log de auditoría es inmutable: una vez registrado, no se puede editar ni eliminar.
- Solo el rol Administrador tiene acceso de lectura al log completo.

### 6.3. Verificación Segura
- El código QR no contiene datos sensibles; solo un token anónimo que consulta una base de datos con acceso controlado.
- Los tokens son UUID v4 únicos e imposibles de predecir.

### 6.4. Cumplimiento Legal
- La plataforma cumplirá con los estándares de protección de datos personales en Colombia, incluyendo consentimiento explícito y derecho de acceso, rectificación y eliminación.
- Implementación de la Ley 1581 de 2012 (Protección de Datos Personales).
- Cumplimiento del Decreto 1377 de 2013 (Reglamentario de la Ley 1581).

### 6.5. Trazabilidad de Pagos
- Los pagos manuales se registran con trazabilidad completa, pero no se almacenan datos financieros sensibles (solo valor, método y comprobante opcional).
- Los comprobantes de pago se almacenan de forma segura con acceso restringido.

### 6.6. Acceso y Autenticación
- Implementar autenticación de dos factores (2FA) para roles de Administrador y Cliente Institucional.
- Las sesiones deben expirar después de 30 minutos de inactividad.
- Registro de intentos fallidos de inicio de sesión con bloqueo temporal tras 5 intentos.

---

## 7. Tecnologías Sugeridas

### 7.1. Backend
- Framework: Nest.js
- Base de datos: MySQL
- Almacenamiento: AWS S3, Google Cloud Storage o similar para PDFs e imágenes

### 7.2. Frontend
- Framework: Vue.js + Quasar
- Diseño responsive: Quasar

### 7.3. Generación de PDF
- Librería: PDFKit (Node.js), ReportLab (Python), o DomPDF (PHP)

### 7.4. Gestión de tareas programadas
- Cron jobs para alertas de vencimiento
- Queue system: Redis + Bull (Node.js) o Celery (Python)

### 7.5. Notificaciones
- Servicio de email: SendGrid, AWS SES, o Mailgun

---

## 8. Entregables del Proyecto

1. Código fuente completo documentado
2. Base de datos con estructura y datos de prueba
3. Manual de usuario para cada rol (Administrador, Cliente Institucional, Conductor)
4. Manual técnico de instalación y configuración
5. Documentación de API (si aplica)
6. Plan de pruebas y casos de prueba ejecutados
7. Capacitación al equipo de IPS Confianza

---

## 9. Cronograma Estimado

### Fase 1: Análisis y Diseño (2 semanas)
- Validación de requerimientos
- Diseño de base de datos
- Wireframes y mockups de interfaz

### Fase 2: Desarrollo Core (6 semanas)
- Gestión de usuarios y roles
- Gestión de cursos y material multimedia
- Sistema de evaluaciones

### Fase 3: Certificación y Reportes (3 semanas)
- Generación de certificados
- Sistema de verificación externa
- Reportes y dashboards

### Fase 4: Funcionalidades Avanzadas (3 semanas)
- Fecha retroactiva y auditoría
- Sistema de alertas y vigencias
- Gestión de pagos manuales

### Fase 5: Pruebas y Ajustes (2 semanas)
- Pruebas funcionales
- Pruebas de seguridad
- Ajustes y correcciones

### Fase 6: Implementación y Capacitación (1 semana)
- Despliegue en producción
- Capacitación a usuarios
- Soporte post-lanzamiento

**Duración total estimada:** 17 semanas (aproximadamente 4 meses)

---

## 10. Contacto

**Cliente:**  
CONFIANZA IPS S.A.S.

**Desarrollador:**  
Appears S.A.S.

**Fecha de emisión:**  
18 de diciembre de 2025

---

*Documento sujeto a revisiones y actualizaciones según evolución del proyecto.*
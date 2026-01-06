# AUDITORÍA DE REQUERIMIENTOS - TIPOS DE CAPACITACIÓN

**Fecha:** 2025-01-XX  
**Versión:** 1.0  
**Estado:** Pendiente de Implementación  
**Auditor:** Ingeniería de Requerimientos

---

## RESUMEN EJECUTIVO

Se realizó una auditoría completa del sistema de capacitaciones para validar el cumplimiento de los requerimientos funcionales relacionados con los tres tipos de capacitación:

1. **Capacitación Estándar (STANDARD)**: Con evaluación y calificación, sin certificado
2. **Capacitación Certificada (CERTIFIED)**: Con evaluación, calificación y certificado automático
3. **Encuesta (SURVEY)**: Se guarda en tabla evaluaciones pero NO se califica, solo respuestas

### Hallazgos Principales

- ✅ **Funcionalidad Base Implementada**: Los tres tipos existen en el sistema y se pueden crear
- ❌ **Falencias Críticas Identificadas**: 3 problemas bloqueantes (P0)
- ⚠️ **Validaciones Faltantes**: 6 problemas de alta prioridad (P1)
- 📋 **Mejoras Recomendadas**: 3 mejoras de prioridad media (P2)

---

## 1. ESTADO ACTUAL POR TIPO DE CAPACITACIÓN

### 1.1. CAPACITACIÓN ESTÁNDAR (STANDARD)

**Requerimiento:** Evaluación con calificación, sin certificado.

**Estado Actual:**
- ✅ Se crea con evaluación (validado en `TrainingForm.vue`)
- ✅ Se califica automáticamente (`evaluation-scoring.service.ts`)
- ✅ No genera certificado automáticamente (validado en `intentos.repository.adapter.ts:338-340`)
- ⚠️ **FALENCIA**: Falta validación explícita en frontend que indique "sin certificado"

**Archivos Relevantes:**
- `training/src/presentation/trainings/components/TrainingForm.vue:1212-1216`
- `training_api/src/infrastructure/intentos/intentos.repository.adapter.ts:338-340`

### 1.2. CAPACITACIÓN CERTIFICADA (CERTIFIED)

**Requerimiento:** Evaluación con calificación y certificado automático al aprobar.

**Estado Actual:**
- ✅ Se crea con evaluación
- ✅ Se califica automáticamente
- ✅ Genera certificado automáticamente solo si `codigo === 'CERTIFIED'` (líneas 338-356 de `intentos.repository.adapter.ts`)
- ⚠️ **FALENCIA**: Falta validación en frontend al crear que requiera evaluación
- ⚠️ **FALENCIA**: Falta validación que impida crear sin evaluación

**Archivos Relevantes:**
- `training_api/src/infrastructure/intentos/intentos.repository.adapter.ts:327-361`
- `training_api/src/application/certificados/use-cases/create-certificado.use-case.ts`

### 1.3. ENCUESTA (SURVEY)

**Requerimiento:** Se guarda en tabla evaluaciones, NO se califica, solo respuestas.

**Estado Actual:**
- ❌ **CRÍTICO**: Se califica igual que las evaluaciones normales
- ❌ **CRÍTICO**: No hay diferenciación en el servicio de scoring
- ❌ **CRÍTICO**: No hay validación que deshabilite la calificación
- ❌ **CRÍTICO**: No hay indicador visual de "no calificable"
- ⚠️ Se guarda en la misma tabla, pero se procesa como evaluación normal

**Archivos Relevantes:**
- `training_api/src/infrastructure/shared/services/evaluation-scoring.service.ts`
- `training_api/src/infrastructure/intentos/intentos.repository.adapter.ts:181-390`

---

## 2. FALENCIAS CRÍTICAS IDENTIFICADAS

### 2.1. PRIORIDAD CRÍTICA (P0) - BLOQUEANTES

#### FAL-001: Encuestas se califican incorrectamente

**Ubicación:** 
- `training_api/src/infrastructure/shared/services/evaluation-scoring.service.ts`
- `training_api/src/infrastructure/intentos/intentos.repository.adapter.ts:260-264`

**Problema:** 
Las encuestas (SURVEY) se califican igual que las evaluaciones normales. El sistema calcula puntaje, porcentaje y determina si aprobó/reprobó, lo cual NO debe suceder según requerimientos.

**Impacto:** 
- No cumple el requerimiento de "solo respuestas, sin calificación"
- Datos incorrectos en base de datos (puntajes, porcentajes, aprobado)
- Confusión para usuarios y reportes incorrectos

**Solución Requerida:**
1. Validar tipo de capacitación antes de calificar
2. Si es SURVEY, no calcular puntaje ni marcar como aprobado/reprobado
3. Guardar respuestas sin puntaje, con `aprobado = null`, `puntajeObtenido = null`, `porcentaje = null`

**Esfuerzo Estimado:** 4 horas

---

#### FAL-002: Falta validación de tipo al crear capacitación

**Ubicación:** 
- `training/src/presentation/trainings/components/TrainingForm.vue`
- `training_api/src/application/capacitaciones/use-cases/create-capacitacion.use-case.ts`

**Problema:** 
No se valida que el tipo seleccionado en frontend corresponda correctamente con el tipo en base de datos. El frontend usa valores lowercase (`'standard'`, `'certified'`, `'survey'`) mientras el backend usa uppercase (`'STANDARD'`, `'CERTIFIED'`, `'SURVEY'`).

**Impacto:** 
- Posible inconsistencia entre frontend y backend
- Riesgo de crear capacitaciones con tipo incorrecto
- Dificulta debugging

**Solución Requerida:**
1. Crear función de mapeo centralizada frontend → backend
2. Validar en DTO que el `tipoCapacitacionId` sea válido
3. Agregar validación en frontend antes de enviar

**Esfuerzo Estimado:** 2 horas

---

#### FAL-003: No hay validación que encuestas no requieran calificación

**Ubicación:** 
- `training_api/src/infrastructure/shared/services/evaluation-scoring.service.ts`
- `training_api/src/application/intentos/use-cases/finish-intento.use-case.ts`
- `training_api/src/infrastructure/intentos/intentos.repository.adapter.ts:260-364`

**Problema:** 
El sistema intenta calificar encuestas igual que evaluaciones normales. No hay verificación del tipo de capacitación antes de ejecutar la lógica de calificación.

**Impacto:** 
- Encuestas muestran puntajes y estados de aprobación incorrectos
- Datos inconsistentes en base de datos
- Reportes incorrectos

**Solución Requerida:**
1. Verificar `capacitacion.tipoCapacitacion.codigo === 'SURVEY'` antes de calificar
2. Si es encuesta, guardar intento con:
   - `aprobado = null`
   - `puntajeObtenido = null`
   - `porcentaje = null`
   - `estado = 'completado'` (sin calificación)

**Esfuerzo Estimado:** 2 horas

---

### 2.2. PRIORIDAD ALTA (P1) - FUNCIONALIDAD INCOMPLETA

#### FAL-004: Falta UI diferenciada para encuestas

**Ubicación:** 
- `training/src/presentation/evaluations/pages/EvaluationTakePage.vue`
- `training/src/presentation/trainings/pages/TrainingDetailPage.vue`

**Problema:** 
No se diferencia visualmente una encuesta de una evaluación normal. Los usuarios no saben que están respondiendo una encuesta que no se calificará.

**Impacto:** 
- Confusión del usuario
- Expectativas incorrectas sobre resultados
- Mala experiencia de usuario

**Solución Requerida:**
1. Indicador visual "Encuesta" vs "Evaluación"
2. Ocultar puntajes y resultados de aprobación en encuestas
3. Mensaje claro: "Esta es una encuesta. Sus respuestas se guardarán pero no se calificarán"
4. Badge/etiqueta diferenciada en listados

**Esfuerzo Estimado:** 3 horas

---

#### FAL-005: Falta validación de certificado solo para CERTIFIED

**Ubicación:** 
- `training_api/src/infrastructure/certificados/certificados.controller.ts`
- `training_api/src/application/certificados/use-cases/create-certificado.use-case.ts:33-50`

**Problema:** 
No se valida explícitamente que solo las capacitaciones CERTIFIED puedan tener certificado. Aunque la generación automática valida esto, un administrador podría intentar crear un certificado manualmente para otros tipos.

**Impacto:** 
- Riesgo de generar certificados para tipos incorrectos manualmente
- Inconsistencia de datos
- Violación de reglas de negocio

**Solución Requerida:**
1. Validar en `CreateCertificadoUseCase` que `capacitacion.tipoCapacitacion.codigo === 'CERTIFIED'`
2. Lanzar `BadRequestException` si no es CERTIFIED
3. Agregar validación también en el controlador

**Esfuerzo Estimado:** 1 hora

---

#### FAL-006: Mapeo inconsistente de tipos entre frontend y backend

**Ubicación:** 
- `training/src/presentation/trainings/components/TrainingForm.vue:1212-1216`
- `training/src/infrastructure/http/trainings/trainings.service.ts`

**Problema:** 
Frontend usa valores lowercase (`'standard'`, `'certified'`, `'survey'`) mientras backend espera IDs numéricos que corresponden a códigos uppercase (`'STANDARD'`, `'CERTIFIED'`, `'SURVEY'`). El mapeo no está centralizado ni validado.

**Impacto:** 
- Posible error si el mapeo no es correcto
- Dificulta mantenimiento
- Riesgo de inconsistencias

**Solución Requerida:**
1. Crear función de mapeo centralizada en servicio
2. Validar mapeo en ambos sentidos (frontend → backend y backend → frontend)
3. Agregar constantes para tipos en lugar de strings mágicos

**Esfuerzo Estimado:** 1 hora

---

### 2.3. PRIORIDAD MEDIA (P2) - MEJORAS DE VALIDACIÓN

#### FAL-007: Falta validación de evaluación obligatoria según tipo

**Ubicación:** 
- `training_api/src/application/capacitaciones/use-cases/create-capacitacion.use-case.ts`
- `training/src/presentation/trainings/components/TrainingForm.vue`

**Problema:** 
RF-09 dice que todas las capacitaciones requieren evaluación, pero no se valida explícitamente por tipo. Se puede crear una capacitación sin evaluación.

**Impacto:** 
- Capacitaciones sin evaluación (viola RF-09)
- Inconsistencia de datos

**Solución Requerida:**
1. Validar que todos los tipos tengan evaluación al crear
2. Mensaje de error específico por tipo
3. Validación tanto en frontend como backend

**Esfuerzo Estimado:** 2 horas

---

#### FAL-008: Falta indicador de tipo en listados

**Ubicación:** 
- `training/src/presentation/trainings/pages/TrainingsListPage.vue`
- `training/src/presentation/trainings/pages/TrainingDetailPage.vue`

**Problema:** 
No se muestra claramente el tipo de capacitación en los listados y detalles. Dificulta identificar rápidamente qué tipo es cada capacitación.

**Impacto:** 
- Dificulta identificación rápida del tipo
- Mala experiencia de usuario

**Solución Requerida:**
1. Badge/etiqueta con el tipo en listados
2. Iconos diferenciados por tipo
3. Filtro por tipo en listados

**Esfuerzo Estimado:** 2 horas

---

#### FAL-009: Falta validación de mínimo de aprobación para encuestas

**Ubicación:** 
- `training/src/presentation/trainings/components/TrainingForm.vue`
- `training_api/src/application/capacitaciones/dto/create-evaluacion-inline.dto.ts`

**Problema:** 
Las encuestas no deberían tener `minimoAprobacion` configurable ya que no se califican. Actualmente se puede configurar este campo para encuestas.

**Impacto:** 
- Configuración innecesaria y confusa
- Datos inconsistentes

**Solución Requerida:**
1. Deshabilitar `minimoAprobacion` si tipo es SURVEY
2. Establecer `minimoAprobacion = null` para encuestas en backend
3. Ocultar campo en frontend si es encuesta

**Esfuerzo Estimado:** 1 hora

---

## 3. VALIDACIONES FALTANTES DETALLADAS

### 3.1. BACKEND

#### VAL-BE-001: Validar tipo antes de calificar

**Archivo:** `training_api/src/infrastructure/shared/services/evaluation-scoring.service.ts`

**Implementación:**
```typescript
/**
 * Verifica si la capacitación es de tipo encuesta (no calificable)
 */
isSurveyType(capacitacion: Capacitacion): boolean {
  return capacitacion?.tipoCapacitacion?.codigo === 'SURVEY';
}

/**
 * Calcula el puntaje obtenido para una pregunta específica
 * MODIFICAR: No calcular si es encuesta
 */
calculateQuestionScore(
  pregunta: Pregunta,
  respuestaEstudiante: RespuestaEstudiante,
  capacitacion?: Capacitacion, // Agregar parámetro
): number {
  // Si es encuesta, retornar 0 (no calificar)
  if (capacitacion && this.isSurveyType(capacitacion)) {
    return 0;
  }
  
  // ... resto de la lógica actual
}
```

---

#### VAL-BE-002: Validar tipo al finalizar intento

**Archivo:** `training_api/src/infrastructure/intentos/intentos.repository.adapter.ts`

**Línea:** ~260 (después de calcular porcentaje)

**Implementación:**
```typescript
// Determinar si aprobó (solo si NO es encuesta)
const capacitacion = await queryRunner.manager.findOne(Capacitacion, {
  where: { id: intento.inscripcion.capacitacion.id },
  relations: ['tipoCapacitacion'],
});

const esEncuesta = capacitacion?.tipoCapacitacion?.codigo === 'SURVEY';

let aprobado: boolean | null = null;
let puntajeObtenido: number | null = null;
let porcentaje: number | null = null;

if (esEncuesta) {
  // Encuesta: no calificar, solo guardar respuestas
  aprobado = null;
  puntajeObtenido = null;
  porcentaje = null;
  console.log('⚠ Encuesta detectada: no se calificará');
} else {
  // Evaluación normal: calificar
  aprobado = this.scoringService.isPassed(
    porcentaje,
    Number(intento.evaluacion.minimoAprobacion),
  );
  puntajeObtenido = puntajeObtenido;
  porcentaje = porcentaje;
}
```

---

#### VAL-BE-003: Validar tipo al crear certificado

**Archivo:** `training_api/src/application/certificados/use-cases/create-certificado.use-case.ts`

**Línea:** ~33 (después de validar inscripción)

**Implementación:**
```typescript
// Validar que la inscripción existe y está aprobada
const inscripcion = await this.inscripcionRepository.findOne({
  where: { id: createCertificadoDto.inscripcionId },
  relations: [
    'estudiante', 
    'capacitacion', 
    'capacitacion.instructor',
    'capacitacion.tipoCapacitacion', // Agregar relación
  ],
});

// ... validaciones existentes ...

// NUEVA VALIDACIÓN: Solo CERTIFIED puede generar certificado
if (inscripcion.capacitacion.tipoCapacitacion.codigo !== 'CERTIFIED') {
  throw new BadRequestException(
    `Solo las capacitaciones certificadas pueden generar certificados. ` +
    `Tipo actual: ${inscripcion.capacitacion.tipoCapacitacion.nombre}`
  );
}
```

---

#### VAL-BE-004: Validar mapeo de tipos

**Archivo:** `training_api/src/application/capacitaciones/dto/create-capacitacion.dto.ts`

**Implementación:**
```typescript
// Crear validador personalizado
@ValidatorConstraint({ name: 'isValidTipoCapacitacion', async: true })
export class TipoCapacitacionValidator implements ValidatorConstraintInterface {
  async validate(tipoCapacitacionId: number, args: ValidationArguments) {
    // Validar que el tipo existe y está activo
    const repository = args.object['tipoCapacitacionRepository'];
    const tipo = await repository.findOne({
      where: { id: tipoCapacitacionId, activo: true },
    });
    return !!tipo;
  }
}

// Aplicar en DTO
@Validate(TipoCapacitacionValidator)
@IsInt()
tipoCapacitacionId: number;
```

---

### 3.2. FRONTEND

#### VAL-FE-001: Validar tipo al crear capacitación

**Archivo:** `training/src/presentation/trainings/components/TrainingForm.vue`

**Implementación:**
```typescript
// Agregar computed properties
const isSurvey = computed(() => {
  const tipoId = form.tipoCapacitacionId;
  // Mapear ID a código (necesita función de mapeo)
  return getTipoCodigo(tipoId) === 'SURVEY';
});

const isCertified = computed(() => {
  return getTipoCodigo(form.tipoCapacitacionId) === 'CERTIFIED';
});

const isStandard = computed(() => {
  return getTipoCodigo(form.tipoCapacitacionId) === 'STANDARD';
});

// Deshabilitar minimoAprobacion si es encuesta
const disableMinAprobacion = computed(() => isSurvey.value);

// Validación en onSubmit
if (!hasEvaluation.value) {
  $q.notify({
    type: 'negative',
    message: 'Todas las capacitaciones requieren una evaluación',
    icon: 'error',
    position: 'top',
  });
  return;
}
```

---

#### VAL-FE-002: Mostrar UI diferenciada para encuestas

**Archivo:** `training/src/presentation/evaluations/pages/EvaluationTakePage.vue`

**Implementación:**
```vue
<template>
  <!-- Banner informativo para encuestas -->
  <q-banner 
    v-if="isSurvey" 
    class="bg-info text-white q-mb-md"
    rounded
  >
    <template #avatar>
      <q-icon name="info" color="white" />
    </template>
    <div class="text-body1">
      <strong>Esta es una encuesta</strong>
    </div>
    <div class="text-body2">
      Sus respuestas se guardarán pero no se calificarán. 
      No hay respuestas correctas o incorrectas.
    </div>
  </q-banner>

  <!-- Ocultar resultados de calificación si es encuesta -->
  <q-card v-if="!isSurvey && evaluationCompleted">
    <!-- Mostrar resultados solo si NO es encuesta -->
  </q-card>

  <!-- Mensaje para encuestas completadas -->
  <q-card v-if="isSurvey && evaluationCompleted" class="bg-positive text-white">
    <q-card-section>
      <div class="text-h6">¡Gracias por completar la encuesta!</div>
      <div class="text-body2">
        Sus respuestas han sido guardadas exitosamente.
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
// Agregar computed para detectar si es encuesta
const isSurvey = computed(() => {
  // Obtener tipo de capacitación desde la evaluación/capacitación
  return training.value?.type === 'survey' || 
         training.value?.tipoCapacitacion?.codigo === 'SURVEY';
});
</script>
```

---

#### VAL-FE-003: Ocultar resultados de calificación en encuestas

**Archivo:** `training/src/presentation/evaluations/pages/EvaluationTakePage.vue`

**Implementación:**
```vue
<!-- Result Card - Solo mostrar si NO es encuesta -->
<q-card v-if="!isSurvey && evaluationCompleted" flat bordered class="result-card">
  <q-card-section class="q-pa-xl text-center">
    <!-- Contenido de resultados existente -->
    <q-icon
      :name="passed ? 'check_circle' : 'cancel'"
      :color="passed ? 'positive' : 'negative'"
      size="120px"
    />
    <div class="text-h3">{{ passed ? '¡Felicidades!' : 'Evaluación no aprobada' }}</div>
    <div class="text-h5 q-mt-md">Puntaje: {{ finalScore }}/{{ evaluation.puntajeTotal }}</div>
    <div class="text-h5">Porcentaje: {{ finalPercentage }}%</div>
  </q-card-section>
</q-card>

<!-- Mensaje de agradecimiento para encuestas -->
<q-card v-else-if="isSurvey && evaluationCompleted" class="bg-positive text-white">
  <q-card-section class="q-pa-xl text-center">
    <q-icon name="check_circle" size="120px" class="q-mb-md" />
    <div class="text-h3">¡Gracias por completar la encuesta!</div>
    <div class="text-body1 q-mt-md">
      Sus respuestas han sido guardadas exitosamente.
    </div>
  </q-card-section>
</q-card>
```

---

#### VAL-FE-004: Validar evaluación obligatoria

**Archivo:** `training/src/presentation/trainings/components/TrainingForm.vue`

**Implementación:**
```typescript
// En la función onSubmit
async function onSubmit() {
  // Validar que tenga evaluación
  if (!hasEvaluation.value) {
    $q.notify({
      type: 'negative',
      message: 'Todas las capacitaciones requieren una evaluación',
      icon: 'error',
      position: 'top',
      timeout: 5000,
    });
    return;
  }

  // Validar que la evaluación tenga al menos una pregunta
  if (form.evaluationInline.preguntas.length === 0) {
    $q.notify({
      type: 'negative',
      message: 'La evaluación debe tener al menos una pregunta',
      icon: 'error',
      position: 'top',
    });
    return;
  }

  // Continuar con el envío...
}
```

---

## 4. PRIORIZACIÓN DE CORRECCIONES

### FASE 1: CORRECCIONES CRÍTICAS (P0) - 1-2 DÍAS

**Objetivo:** Corregir problemas bloqueantes que impiden cumplir requerimientos básicos.

#### Tarea 1.1: Implementar FAL-001 - Encuestas no se califican
- **Esfuerzo:** 4 horas
- **Archivos a modificar:**
  - `training_api/src/infrastructure/shared/services/evaluation-scoring.service.ts`
  - `training_api/src/infrastructure/intentos/intentos.repository.adapter.ts`
- **Descripción:** Modificar lógica de calificación para detectar encuestas y no calcular puntajes
- **Criterios de aceptación:**
  - Encuestas no calculan puntaje
  - Encuestas guardan `aprobado = null`, `puntajeObtenido = null`, `porcentaje = null`
  - Respuestas se guardan correctamente

#### Tarea 1.2: Implementar FAL-003 - Validar tipo antes de calificar
- **Esfuerzo:** 2 horas
- **Archivos a modificar:**
  - `training_api/src/application/intentos/use-cases/finish-intento.use-case.ts`
  - `training_api/src/infrastructure/intentos/intentos.repository.adapter.ts`
- **Descripción:** Agregar validación de tipo de capacitación antes de ejecutar lógica de calificación
- **Criterios de aceptación:**
  - Verificación de tipo antes de calificar
  - Encuestas no pasan por lógica de calificación
  - Logs informativos para debugging

#### Tarea 1.3: Implementar FAL-005 - Validar certificado solo para CERTIFIED
- **Esfuerzo:** 1 hora
- **Archivos a modificar:**
  - `training_api/src/application/certificados/use-cases/create-certificado.use-case.ts`
- **Descripción:** Agregar validación explícita que solo CERTIFIED puede generar certificados
- **Criterios de aceptación:**
  - Validación de tipo antes de crear certificado
  - Error claro si se intenta crear certificado para tipo incorrecto
  - Validación aplicada tanto en creación automática como manual

---

### FASE 2: MEJORAS DE UX Y VALIDACIONES (P1) - 2-3 DÍAS

**Objetivo:** Mejorar experiencia de usuario y agregar validaciones de seguridad.

#### Tarea 2.1: Implementar FAL-004 - UI diferenciada para encuestas
- **Esfuerzo:** 3 horas
- **Archivos a modificar:**
  - `training/src/presentation/evaluations/pages/EvaluationTakePage.vue`
  - `training/src/presentation/trainings/pages/TrainingDetailPage.vue`
  - `training/src/presentation/trainings/pages/TrainingsListPage.vue`
- **Descripción:** Agregar indicadores visuales y mensajes diferenciados para encuestas
- **Criterios de aceptación:**
  - Banner informativo visible en encuestas
  - Ocultación de resultados de calificación en encuestas
  - Badge/etiqueta diferenciada en listados
  - Mensaje de agradecimiento al completar encuesta

#### Tarea 2.2: Implementar FAL-002 - Validación de tipo al crear capacitación
- **Esfuerzo:** 2 horas
- **Archivos a modificar:**
  - `training/src/presentation/trainings/components/TrainingForm.vue`
  - `training_api/src/application/capacitaciones/use-cases/create-capacitacion.use-case.ts`
  - `training/src/infrastructure/http/trainings/trainings.service.ts`
- **Descripción:** Crear función de mapeo centralizada y validar tipos
- **Criterios de aceptación:**
  - Función de mapeo frontend → backend centralizada
  - Validación en DTO de tipo válido
  - Validación en frontend antes de enviar
  - Manejo de errores claro

#### Tarea 2.3: Implementar FAL-006 - Mapeo consistente de tipos
- **Esfuerzo:** 1 hora
- **Archivos a modificar:**
  - `training/src/infrastructure/http/trainings/trainings.service.ts`
  - `training/src/presentation/trainings/components/TrainingForm.vue`
- **Descripción:** Centralizar mapeo de tipos y usar constantes
- **Criterios de aceptación:**
  - Constantes para tipos en lugar de strings mágicos
  - Función de mapeo bidireccional
  - Validación de mapeo en ambos sentidos

---

### FASE 3: VALIDACIONES ADICIONALES (P2) - 1-2 DÍAS

**Objetivo:** Completar validaciones y mejoras de calidad.

#### Tarea 3.1: Implementar FAL-007 - Validación de evaluación obligatoria
- **Esfuerzo:** 2 horas
- **Archivos a modificar:**
  - `training_api/src/application/capacitaciones/use-cases/create-capacitacion.use-case.ts`
  - `training/src/presentation/trainings/components/TrainingForm.vue`
- **Descripción:** Validar que todas las capacitaciones tengan evaluación
- **Criterios de aceptación:**
  - Validación en backend al crear capacitación
  - Validación en frontend antes de enviar
  - Mensaje de error específico
  - Validación de al menos una pregunta

#### Tarea 3.2: Implementar FAL-008 - Indicador de tipo en listados
- **Esfuerzo:** 2 horas
- **Archivos a modificar:**
  - `training/src/presentation/trainings/pages/TrainingsListPage.vue`
  - `training/src/presentation/trainings/pages/TrainingDetailPage.vue`
- **Descripción:** Agregar badges y filtros por tipo
- **Criterios de aceptación:**
  - Badge visible con tipo de capacitación
  - Iconos diferenciados por tipo
  - Filtro por tipo en listados
  - Colores diferenciados por tipo

#### Tarea 3.3: Implementar FAL-009 - Validación de mínimo de aprobación para encuestas
- **Esfuerzo:** 1 hora
- **Archivos a modificar:**
  - `training/src/presentation/trainings/components/TrainingForm.vue`
  - `training_api/src/application/capacitaciones/dto/create-evaluacion-inline.dto.ts`
- **Descripción:** Deshabilitar/ocultar minimoAprobacion para encuestas
- **Criterios de aceptación:**
  - Campo deshabilitado si es encuesta
  - `minimoAprobacion = null` para encuestas en backend
  - Validación que no se envíe minimoAprobacion para encuestas

---

## 5. PLAN DE IMPLEMENTACIÓN DETALLADO

### 5.1. Cronograma Estimado

| Fase | Tareas | Esfuerzo Total | Duración Estimada |
|------|--------|----------------|-------------------|
| **Fase 1 (P0)** | 3 tareas críticas | 7 horas | 1-2 días |
| **Fase 2 (P1)** | 3 tareas de UX | 6 horas | 2-3 días |
| **Fase 3 (P2)** | 3 tareas de validación | 5 horas | 1-2 días |
| **TOTAL** | 9 tareas | 18 horas | 4-7 días |

### 5.2. Dependencias entre Tareas

```
FAL-001 (Encuestas no califican)
  └─> FAL-003 (Validar tipo antes de calificar)
      └─> FAL-004 (UI diferenciada)

FAL-002 (Validación de tipo)
  └─> FAL-006 (Mapeo consistente)
      └─> FAL-008 (Indicador de tipo)

FAL-005 (Validar certificado)
  └─> (Independiente)

FAL-007 (Evaluación obligatoria)
  └─> (Independiente)

FAL-009 (Minimo aprobación encuestas)
  └─> FAL-002 (Validación de tipo)
```

### 5.3. Orden Recomendado de Implementación

1. **Día 1:**
   - FAL-001: Encuestas no se califican (4h)
   - FAL-003: Validar tipo antes de calificar (2h)
   - FAL-005: Validar certificado solo CERTIFIED (1h)

2. **Día 2-3:**
   - FAL-002: Validación de tipo al crear (2h)
   - FAL-006: Mapeo consistente (1h)
   - FAL-004: UI diferenciada para encuestas (3h)

3. **Día 4-5:**
   - FAL-007: Validación evaluación obligatoria (2h)
   - FAL-008: Indicador de tipo en listados (2h)
   - FAL-009: Validación mínimo aprobación encuestas (1h)

---

## 6. CRITERIOS DE ACEPTACIÓN GENERALES

### 6.1. Para Todas las Tareas

- ✅ Código sigue principios SOLID y arquitectura hexagonal
- ✅ Tests unitarios para lógica crítica
- ✅ Validaciones tanto en frontend como backend
- ✅ Mensajes de error claros y descriptivos
- ✅ Logs informativos para debugging
- ✅ Documentación actualizada

### 6.2. Específicos por Tipo de Capacitación

#### Capacitación Estándar (STANDARD)
- ✅ Tiene evaluación obligatoria
- ✅ Se califica automáticamente
- ✅ NO genera certificado
- ✅ Muestra resultados de calificación
- ✅ Permite reintentos según configuración

#### Capacitación Certificada (CERTIFIED)
- ✅ Tiene evaluación obligatoria
- ✅ Se califica automáticamente
- ✅ Genera certificado automáticamente al aprobar
- ✅ Muestra resultados de calificación
- ✅ Botón de descarga de certificado visible
- ✅ Validación que solo este tipo puede tener certificado

#### Encuesta (SURVEY)
- ✅ Tiene evaluación (preguntas)
- ✅ NO se califica (sin puntaje, sin aprobado/reprobado)
- ✅ NO genera certificado
- ✅ Guarda todas las respuestas
- ✅ Muestra mensaje de agradecimiento
- ✅ NO muestra resultados de calificación
- ✅ Banner informativo visible
- ✅ `minimoAprobacion = null`

---

## 7. TESTING Y VALIDACIÓN

### 7.1. Casos de Prueba Críticos

#### TC-001: Encuesta no se califica
1. Crear capacitación tipo SURVEY con evaluación
2. Inscribir estudiante
3. Completar encuesta
4. **Verificar:** `aprobado = null`, `puntajeObtenido = null`, `porcentaje = null`
5. **Verificar:** Respuestas guardadas correctamente
6. **Verificar:** No se muestra puntaje ni resultado de aprobación

#### TC-002: Certificado solo para CERTIFIED
1. Crear capacitación tipo STANDARD
2. Aprobar evaluación
3. Intentar crear certificado manualmente
4. **Verificar:** Error "Solo CERTIFIED puede generar certificados"
5. Crear capacitación tipo CERTIFIED
6. Aprobar evaluación
7. **Verificar:** Certificado generado automáticamente

#### TC-003: UI diferenciada para encuestas
1. Acceder a encuesta (SURVEY)
2. **Verificar:** Banner informativo visible
3. Completar encuesta
4. **Verificar:** Mensaje de agradecimiento (no resultados de calificación)
5. Acceder a evaluación normal
6. **Verificar:** No muestra banner de encuesta
7. Completar evaluación
8. **Verificar:** Muestra resultados de calificación

#### TC-004: Validación de evaluación obligatoria
1. Intentar crear capacitación sin evaluación
2. **Verificar:** Error en frontend "Todas las capacitaciones requieren evaluación"
3. Intentar enviar al backend sin evaluación
4. **Verificar:** Error en backend rechazando creación

#### TC-005: Mapeo de tipos correcto
1. Crear capacitación tipo "standard" en frontend
2. **Verificar:** Se mapea correctamente a STANDARD en backend
3. Obtener capacitación desde backend
4. **Verificar:** Se mapea correctamente a "standard" en frontend
5. Repetir para "certified" y "survey"

---

## 8. RIESGOS Y MITIGACIONES

### 8.1. Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Datos existentes de encuestas con calificaciones incorrectas | Alta | Alto | Script de migración para limpiar datos |
| Inconsistencia en mapeo de tipos | Media | Medio | Tests exhaustivos y validación en ambos sentidos |
| Usuarios confundidos con cambios de UI | Media | Bajo | Banner informativo claro y documentación |
| Certificados generados incorrectamente antes del fix | Baja | Alto | Validación retroactiva y auditoría |

### 8.2. Script de Migración de Datos

**Necesario para:** Limpiar datos de encuestas que fueron calificadas incorrectamente.

```sql
-- Actualizar intentos de encuestas para limpiar calificaciones
UPDATE intentos_evaluacion ie
INNER JOIN evaluaciones e ON ie.evaluacion_id = e.id
INNER JOIN capacitaciones c ON e.capacitacion_id = c.id
INNER JOIN tipos_capacitacion tc ON c.tipo_capacitacion_id = tc.id
SET 
  ie.aprobado = NULL,
  ie.puntaje_obtenido = NULL,
  ie.porcentaje = NULL
WHERE 
  tc.codigo = 'SURVEY'
  AND ie.aprobado IS NOT NULL;
```

---

## 9. DOCUMENTACIÓN ADICIONAL REQUERIDA

### 9.1. Documentación Técnica

- [ ] Actualizar diagrama de flujo de tipos de capacitación
- [ ] Documentar función de mapeo de tipos
- [ ] Actualizar API documentation con nuevas validaciones
- [ ] Documentar cambios en base de datos (si aplica)

### 9.2. Documentación de Usuario

- [ ] Guía de creación de capacitaciones por tipo
- [ ] Explicación de diferencias entre tipos
- [ ] FAQ sobre encuestas vs evaluaciones
- [ ] Guía de certificados (solo CERTIFIED)

---

## 10. CONCLUSIÓN

Este documento presenta un plan completo para corregir las falencias identificadas en el sistema de tipos de capacitación. Las correcciones están priorizadas en tres fases:

1. **Fase 1 (P0)**: Correcciones críticas que bloquean cumplimiento de requerimientos
2. **Fase 2 (P1)**: Mejoras de UX y validaciones de seguridad
3. **Fase 3 (P2)**: Validaciones adicionales y mejoras de calidad

**Tiempo total estimado:** 4-7 días de desarrollo  
**Esfuerzo total:** 18 horas

**Próximos pasos:**
1. Revisar y aprobar este documento
2. Asignar recursos para Fase 1
3. Iniciar implementación siguiendo el orden recomendado
4. Ejecutar casos de prueba después de cada fase
5. Realizar migración de datos si es necesario

---

**Documento generado por:** Ingeniería de Requerimientos  
**Fecha:** 2025-01-XX  
**Versión:** 1.0  
**Estado:** Pendiente de Aprobación
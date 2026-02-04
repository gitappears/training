<template>
  <div class="certificate-config-editor">
    <!-- Secciones de configuración organizadas como en el HTML -->
    <q-expansion-item
      v-for="section in sections"
      :key="section.key"
      :label="section.title"
      :icon="section.icon"
      class="q-mb-sm"
      default-opened
    >
      <q-card flat class="q-pa-sm">
        <div class="row q-col-gutter-sm">
          <!-- Campos X e Y -->
          <template v-if="section.fields.includes('x') || section.fields.includes('y')">
            <div class="col-6" v-if="section.fields.includes('x')">
              <q-input
                :key="`${section.key}-x-${configKey}`"
                :model-value="getElementValue(section.key, 'x')"
                type="number"
                :label="section.xLabel || 'Posición X'"
                outlined
                dense
                step="0.1"
                @update:model-value="setElementValue(section.key, 'x', $event)"
                @blur="commitConfig"
                @keydown.enter="commitConfig"
              />
            </div>
            <div class="col-6" v-if="section.fields.includes('y')">
              <q-input
                :key="`${section.key}-y-${configKey}`"
                :model-value="getElementValue(section.key, 'y')"
                type="number"
                label="Posición Y"
                outlined
                dense
                step="0.1"
                @update:model-value="setElementValue(section.key, 'y', $event)"
                @blur="commitConfig"
                @keydown.enter="commitConfig"
              />
            </div>
          </template>

          <!-- Tamaño de Fuente -->
          <div class="col-6" v-if="section.fields.includes('fontSize')">
            <q-input
              :model-value="getElementValue(section.key, 'fontSize')"
              type="number"
              label="Tamaño de Fuente"
              outlined
              dense
              step="0.5"
              @update:model-value="setElementValue(section.key, 'fontSize', $event)"
              @blur="commitConfig"
              @keydown.enter="commitConfig"
            />
          </div>

          <!-- Negrita -->
          <div class="col-6" v-if="section.fields.includes('bold')">
            <q-toggle
              :model-value="getElementValue(section.key, 'bold', false)"
              label="Negrita"
              @update:model-value="setElementValue(section.key, 'bold', $event)"
              @blur="commitConfig"
            />
          </div>

          <!-- Color RGB -->
          <template v-if="section.fields.includes('color')">
            <div class="col-12">
              <div class="text-caption q-mb-xs">Color RGB</div>
              <div class="row q-col-gutter-xs items-center">
                <div class="col-auto">
                  <input
                    type="color"
                    :value="getColorHex(section.key)"
                    @input="
                      updateColorFromPicker(section.key, ($event.target as HTMLInputElement).value)
                    "
                    @blur="commitConfig"
                    style="
                      width: 50px;
                      height: 35px;
                      border: 1px solid #ddd;
                      border-radius: 4px;
                      cursor: pointer;
                    "
                  />
                </div>
                <div class="col">
                  <q-input
                    :model-value="getElementValue(section.key, 'color.0')"
                    type="number"
                    label="R"
                    outlined
                    dense
                    min="0"
                    max="255"
                    @update:model-value="setElementValue(section.key, 'color.0', $event)"
                    @blur="commitConfig"
                    @keydown.enter="commitConfig"
                  />
                </div>
                <div class="col">
                  <q-input
                    :model-value="getElementValue(section.key, 'color.1')"
                    type="number"
                    label="G"
                    outlined
                    dense
                    min="0"
                    max="255"
                    @update:model-value="setElementValue(section.key, 'color.1', $event)"
                    @blur="commitConfig"
                    @keydown.enter="commitConfig"
                  />
                </div>
                <div class="col">
                  <q-input
                    :model-value="getElementValue(section.key, 'color.2')"
                    type="number"
                    label="B"
                    outlined
                    dense
                    min="0"
                    max="255"
                    @update:model-value="setElementValue(section.key, 'color.2', $event)"
                    @blur="commitConfig"
                    @keydown.enter="commitConfig"
                  />
                </div>
              </div>
            </div>
          </template>

          <!-- Ancho y Alto (para imágenes) -->
          <div class="col-6" v-if="section.fields.includes('width')">
            <q-input
              :model-value="getElementValue(section.key, 'width')"
              type="number"
              label="Ancho"
              outlined
              dense
              step="0.1"
              @update:model-value="setElementValue(section.key, 'width', $event)"
              @blur="commitConfig"
              @keydown.enter="commitConfig"
            />
          </div>
          <div class="col-6" v-if="section.fields.includes('height')">
            <q-input
              :model-value="getElementValue(section.key, 'height')"
              type="number"
              label="Alto"
              outlined
              dense
              step="0.1"
              @update:model-value="setElementValue(section.key, 'height', $event)"
              @blur="commitConfig"
              @keydown.enter="commitConfig"
            />
          </div>

          <!-- Tamaño (para QR) -->
          <div class="col-6" v-if="section.fields.includes('size')">
            <q-input
              :model-value="getElementValue(section.key, 'size')"
              type="number"
              label="Tamaño"
              outlined
              dense
              step="1"
              @update:model-value="setElementValue(section.key, 'size', $event)"
              @blur="commitConfig"
              @keydown.enter="commitConfig"
            />
          </div>

          <!-- Espaciado de Línea -->
          <div class="col-6" v-if="section.fields.includes('lineSpacing')">
            <q-input
              :model-value="getElementValue(section.key, 'lineSpacing')"
              type="number"
              label="Espaciado entre Líneas"
              outlined
              dense
              step="0.5"
              @update:model-value="setElementValue(section.key, 'lineSpacing', $event)"
              @blur="commitConfig"
              @keydown.enter="commitConfig"
            />
          </div>
        </div>
      </q-card>
    </q-expansion-item>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';

interface Props {
  config: any;
  tipo: 'otros' | 'alimentos' | 'sustancias';
  defaultValues?: any;
}

interface Emits {
  (e: 'update:config', config: any): void;
  (e: 'update:pdf'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// const $q = useQuasar(); // No se usa actualmente

/** Clona la config inicial para no depender del orden de ejecución del watch */
function cloneConfig(config: Record<string, unknown> | null | undefined): Record<string, unknown> {
  if (!config || typeof config !== 'object') return {};
  try {
    return JSON.parse(JSON.stringify(config));
  } catch {
    return { ...config };
  }
}

const configElements = ref<any>(cloneConfig(props.config));
const configKey = ref(0); // Key para forzar re-render cuando cambia la config

/** Campos que se muestran como inputs en el editor (posición, fuente, color, etc.) */
const LAYOUT_FIELDS = [
  'x',
  'y',
  'fontSize',
  'bold',
  'color',
  'width',
  'height',
  'size',
  'lineSpacing',
] as const;

/** Claves que no son bloques de posición (ej. dataDinamica) y se excluyen del listado */
const SKIP_KEYS = new Set(['dataDinamica']);

/** Mapa key → título e icono para las secciones (el resto usa el key formateado) */
const SECTION_META: Record<string, { title: string; icon: string; xLabel?: string }> = {
  cursoNombre: {
    title: '📋 Nombre del Curso',
    icon: 'title',
    xLabel: 'Posición X (centrado = 396)',
  },
  nombreEstudiante: {
    title: '👤 Nombre del Estudiante',
    icon: 'person',
    xLabel: 'Posición X (centrado = 396)',
  },
  documento: { title: '🆔 Documento', icon: 'badge' },
  duracion: { title: '⏱️ Duración', icon: 'schedule' },
  fechaEmision: { title: '📅 Fecha de Emisión', icon: 'event' },
  fechaVencimiento: { title: '📅 Fecha de Vencimiento', icon: 'event' },
  qr: { title: '📱 Código QR', icon: 'qr_code' },
  instructorFirma: { title: '✍️ Firma del Instructor', icon: 'draw' },
  instructorNombre: {
    title: '✍️ Nombre del Instructor',
    icon: 'person',
    xLabel: 'Posición X (centrado = 235)',
  },
  instructorRol: {
    title: '👔 Rol del Instructor',
    icon: 'work',
    xLabel: 'Posición X (centrado = 217)',
  },
  representanteFirma: { title: '✍️ Firma del Representante', icon: 'draw' },
  representanteNombre: {
    title: '✍️ Nombre del Representante',
    icon: 'person',
    xLabel: 'Posición X (centrado = 565.5)',
  },
  representanteRol: {
    title: '👔 Rol del Representante',
    icon: 'work',
    xLabel: 'Posición X (centrado = 571)',
  },
  footer: {
    title: '📄 Pie de Página',
    icon: 'description',
    xLabel: 'Posición X (centrado = 396)',
  },
};

function formatKeyAsTitle(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

/** Secciones derivadas de configElements: una por clave con datos de posición/formato */
const sections = computed(() => {
  const config = configElements.value;
  if (!config || typeof config !== 'object') return [];

  const result: Array<{
    key: string;
    title: string;
    icon: string;
    fields: string[];
    xLabel?: string;
  }> = [];

  for (const key of Object.keys(config)) {
    if (SKIP_KEYS.has(key)) continue;

    const value = config[key];
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue;

    const fields = Object.keys(value).filter((f) =>
      (LAYOUT_FIELDS as readonly string[]).includes(f),
    );
    if (fields.length === 0) continue;

    const meta = SECTION_META[key];
    result.push({
      key,
      title: meta?.title ?? formatKeyAsTitle(key),
      icon: meta?.icon ?? 'tune',
      fields,
      ...(meta?.xLabel !== undefined && { xLabel: meta.xLabel }),
    });
  }

  return result;
});

// Sincronizar config con configElements: immediate para que la instancia recién montada
// (p. ej. al cambiar de tab o al cambiar la key) reciba ya la config del padre.
// No sobrescribir con objeto vacío si ya tenemos datos (evita parpadeos/limpiezas).
watch(
  () => props.config,
  (newConfig) => {
    const next = newConfig && typeof newConfig === 'object' ? newConfig : {};
    const hasNewData = Object.keys(next).length > 0;
    const hasCurrentData = Object.keys(configElements.value || {}).length > 0;
    if (hasNewData || !hasCurrentData) {
      configElements.value = cloneConfig(next);
    }
  },
  { immediate: true, deep: true },
);

// Aplicar defaultValues solo cuando la config del padre está vacía y tenemos defaults
watch(
  () => props.defaultValues,
  (newDefaults) => {
    if (!newDefaults || Object.keys(newDefaults).length === 0) return;
    const parentEmpty = !props.config || Object.keys(props.config).length === 0;
    const currentEmpty = !configElements.value || Object.keys(configElements.value).length === 0;
    if (parentEmpty && currentEmpty) {
      configElements.value = cloneConfig(newDefaults);
    }
  },
  { deep: true },
);

// Función helper para obtener valores de manera reactiva
function getElementValue(
  sectionKey: string,
  field: string,
  defaultValue: any = 0,
  category: 'otros' | 'alimentos' | 'sustancias' = 'otros',
): any {
  if (!configElements.value) {
    return defaultValue;
  }

  const elements = configElements.value;
  const element = elements[sectionKey];

  if (!element) {
    return defaultValue;
  }

  if (field.includes('.')) {
    const [key, index] = field.split('.');
    const arr = element[key];
    if (!Array.isArray(arr)) return defaultValue;
    const idx = parseInt(index);
    return arr[idx] !== undefined ? arr[idx] : defaultValue;
  }

  const value = element[field] !== undefined ? element[field] : defaultValue;

  // Convertir a número si es un campo numérico
  if (['x', 'y', 'fontSize', 'width', 'height', 'size', 'lineSpacing'].includes(field)) {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(numValue) ? numValue : defaultValue;
  }

  return value;
}

function setElementValue(sectionKey: string, field: string, value: any) {
  if (!configElements.value[sectionKey]) {
    configElements.value[sectionKey] = {};
  }

  if (field.includes('.')) {
    const [key, index] = field.split('.');
    if (!configElements.value[sectionKey][key]) {
      configElements.value[sectionKey][key] = [0, 0, 0];
    }
    const idx = parseInt(index);
    configElements.value[sectionKey][key][idx] = value;
  } else {
    configElements.value[sectionKey][field] = value;
  }
  // No emitir aquí: la carga del PDF se hace solo en commitConfig (Enter o blur)
}

/** Emite la config al padre y dispara la actualización del PDF (solo al pulsar Enter o al hacer blur). */
function commitConfig() {
  updateConfig();
}

function getColorHex(sectionKey: string): string {
  const color = getElementValue(sectionKey, 'color');
  if (!color || !Array.isArray(color) || color.length !== 3) {
    return '#292561';
  }
  const [r, g, b] = color;
  return `#${[r, g, b]
    .map((x) => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    })
    .join('')}`;
}

function updateColorFromPicker(sectionKey: string, hex: string) {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);

  if (!configElements.value[sectionKey]) {
    configElements.value[sectionKey] = {};
  }
  configElements.value[sectionKey].color = [r, g, b];
  // La actualización del PDF se dispara en commitConfig (blur del input color)
}

function updateConfig() {
  emit('update:config', { ...configElements.value });
  emit('update:pdf');
}
</script>

<style lang="scss" scoped>
.certificate-config-editor {
  .q-expansion-item {
    background: #f9f9f9;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    margin-bottom: 8px;
  }
}
</style>

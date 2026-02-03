<template>
  <div class="certificate-config-editor">
    <!-- Secciones de configuración organizadas como en el HTML -->
    <q-expansion-item
      v-for="(section, sectionKey) in sections"
      :key="sectionKey"
      :label="section.title"
      :icon="section.icon"
      class="q-mb-sm"
      default-opened
    >
      <q-card flat class="q-pa-sm">
        {{ section }}
        <div class="row q-col-gutter-sm">
          <!-- Campos X e Y -->
          <template v-if="section.fields.includes('x') || section.fields.includes('y')">
            <div class="col-6" v-if="section.fields.includes('x')">
              KEY {{ section.key }}
              <q-input
                :key="`${sectionKey}-x-${configKey}`"
                :model-value="getElementValue(sectionKey, 'x')"
                type="number"
                :label="section.xLabel || 'Posición X'"
                outlined
                dense
                step="0.1"
                @update:model-value="setElementValue(sectionKey, 'x', $event)"
              />
            </div>
            <div class="col-6" v-if="section.fields.includes('y')">
              <q-input
                :key="`${sectionKey}-y-${configKey}`"
                :model-value="getElementValue(sectionKey, 'y')"
                type="number"
                label="Posición Y"
                outlined
                dense
                step="0.1"
                @update:model-value="setElementValue(sectionKey, 'y', $event)"
              />
            </div>
          </template>

          <!-- Tamaño de Fuente -->
          <div class="col-6" v-if="section.fields.includes('fontSize')">
            <q-input
              :model-value="getElementValue(sectionKey, 'fontSize')"
              type="number"
              label="Tamaño de Fuente"
              outlined
              dense
              step="0.5"
              @update:model-value="setElementValue(sectionKey, 'fontSize', $event)"
            />
          </div>

          <!-- Negrita -->
          <div class="col-6" v-if="section.fields.includes('bold')">
            <q-toggle
              :model-value="getElementValue(sectionKey, 'bold', false)"
              label="Negrita"
              @update:model-value="setElementValue(sectionKey, 'bold', $event)"
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
                    :value="getColorHex(sectionKey)"
                    @input="
                      updateColorFromPicker(sectionKey, ($event.target as HTMLInputElement).value)
                    "
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
                    :model-value="getElementValue(sectionKey, 'color.0')"
                    type="number"
                    label="R"
                    outlined
                    dense
                    min="0"
                    max="255"
                    @update:model-value="setElementValue(sectionKey, 'color.0', $event)"
                  />
                </div>
                <div class="col">
                  <q-input
                    :model-value="getElementValue(sectionKey, 'color.1')"
                    type="number"
                    label="G"
                    outlined
                    dense
                    min="0"
                    max="255"
                    @update:model-value="setElementValue(sectionKey, 'color.1', $event)"
                  />
                </div>
                <div class="col">
                  <q-input
                    :model-value="getElementValue(sectionKey, 'color.2')"
                    type="number"
                    label="B"
                    outlined
                    dense
                    min="0"
                    max="255"
                    @update:model-value="setElementValue(sectionKey, 'color.2', $event)"
                  />
                </div>
              </div>
            </div>
          </template>

          <!-- Ancho y Alto (para imágenes) -->
          <div class="col-6" v-if="section.fields.includes('width')">
            <q-input
              :model-value="getElementValue(sectionKey, 'width')"
              type="number"
              label="Ancho"
              outlined
              dense
              step="0.1"
              @update:model-value="setElementValue(sectionKey, 'width', $event)"
            />
          </div>
          <div class="col-6" v-if="section.fields.includes('height')">
            <q-input
              :model-value="getElementValue(sectionKey, 'height')"
              type="number"
              label="Alto"
              outlined
              dense
              step="0.1"
              @update:model-value="setElementValue(sectionKey, 'height', $event)"
            />
          </div>

          <!-- Tamaño (para QR) -->
          <div class="col-6" v-if="section.fields.includes('size')">
            <q-input
              :model-value="getElementValue(sectionKey, 'size')"
              type="number"
              label="Tamaño"
              outlined
              dense
              step="1"
              @update:model-value="setElementValue(sectionKey, 'size', $event)"
            />
          </div>

          <!-- Espaciado de Línea -->
          <div class="col-6" v-if="section.fields.includes('lineSpacing')">
            <q-input
              :model-value="getElementValue(sectionKey, 'lineSpacing')"
              type="number"
              label="Espaciado entre Líneas"
              outlined
              dense
              step="0.5"
              @update:model-value="setElementValue(sectionKey, 'lineSpacing', $event)"
            />
          </div>
        </div>
      </q-card>
    </q-expansion-item>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, nextTick } from 'vue';

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

const configElements = ref<any>({});
const configKey = ref(0); // Key para forzar re-render cuando cambia la config

// Definir secciones según el tipo
const sections = computed(() => {
  const baseSections = [
    {
      key: 'cursoNombre',
      title: '📋 Nombre del Curso',
      icon: 'title',
      fields: ['x', 'y', 'fontSize', 'bold', 'color'],
      xLabel: 'Posición X (centrado = 396)',
    },
    {
      key: 'nombreEstudiante',
      title: '👤 Nombre del Estudiante',
      icon: 'person',
      fields: ['x', 'y', 'fontSize', 'bold', 'color'],
      xLabel: 'Posición X (centrado = 396)',
    },
    {
      key: 'documento',
      title: '🆔 Documento',
      icon: 'badge',
      fields: ['x', 'y', 'fontSize', 'bold'],
    },
    {
      key: 'duracion',
      title: '⏱️ Duración',
      icon: 'schedule',
      fields: ['x', 'y', 'fontSize', 'bold'],
    },
    {
      key: 'fechaEmision',
      title: '📅 Fecha de Emisión',
      icon: 'event',
      fields: ['x', 'y', 'fontSize', 'bold'],
    },
    {
      key: 'fechaVencimiento',
      title: '📅 Fecha de Vencimiento',
      icon: 'event',
      fields: ['x', 'y', 'fontSize', 'bold'],
    },
    {
      key: 'qr',
      title: '📱 Código QR',
      icon: 'qr_code',
      fields: ['x', 'y', 'size'],
    },
    {
      key: 'instructorFirma',
      title: '✍️ Firma del Instructor',
      icon: 'draw',
      fields: ['x', 'y', 'width', 'height'],
    },
    {
      key: 'instructorNombre',
      title: '✍️ Nombre del Instructor',
      icon: 'person',
      fields: ['x', 'y', 'fontSize', 'bold', 'color'],
      xLabel: 'Posición X (centrado = 235)',
    },
    {
      key: 'instructorRol',
      title: '👔 Rol del Instructor',
      icon: 'work',
      fields: ['x', 'y', 'fontSize', 'bold', 'lineSpacing', 'color'],
      xLabel: 'Posición X (centrado = 217)',
    },
    {
      key: 'representanteFirma',
      title: '✍️ Firma del Representante',
      icon: 'draw',
      fields: ['x', 'y', 'width', 'height'],
    },
    {
      key: 'representanteNombre',
      title: '✍️ Nombre del Representante',
      icon: 'person',
      fields: ['x', 'y', 'fontSize', 'bold', 'color'],
      xLabel: 'Posición X (centrado = 565.5)',
    },
    {
      key: 'representanteRol',
      title: '👔 Rol del Representante',
      icon: 'work',
      fields: ['x', 'y', 'fontSize', 'bold', 'color'],
      xLabel: 'Posición X (centrado = 571)',
    },
    {
      key: 'footer',
      title: '📄 Pie de Página',
      icon: 'description',
      fields: ['x', 'y', 'fontSize', 'bold', 'color'],
      xLabel: 'Posición X (centrado = 396)',
    },
  ];

  return baseSections;
});

// Sincronizar config con configElements
watch(
  () => props.config,
  (newConfig) => {
    configElements.value = newConfig;
  },
  { immediate: false, deep: true },
);

// También observar defaultValues por si cambian
watch(
  () => props.defaultValues,
  (newDefaults) => {
    if (newDefaults && Object.keys(newDefaults).length > 0) {
      // Solo aplicar defaults si no hay config o está vacía
      if (!props.config || Object.keys(props.config).length === 0) {
        const defaultsStr = JSON.stringify(newDefaults);
        const currentConfigStr = JSON.stringify(configElements.value);

        if (defaultsStr !== currentConfigStr) {
          console.log('[CertificateConfigEditor] Aplicando valores por defecto desde watch');
          configElements.value = JSON.parse(JSON.stringify(newDefaults));
        }
      }
    }
  },
  { deep: true },
);

// Función helper para obtener valores de manera reactiva
function getElementValue(sectionKey: string, field: string, defaultValue: any = 0): any {
  console.log('key', sectionKey);
  // Asegurar que configElements.value existe
  if (!configElements.value) {
    return defaultValue;
  }

  // Acceder a configElements.value para que Vue rastree la dependencia
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
  updateConfig();
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

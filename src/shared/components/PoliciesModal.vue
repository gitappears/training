<template>
  <q-dialog v-model="isOpen" maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card class="policies-modal">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-medium">
          {{
            policyType === 'datos'
              ? 'Política de Tratamiento de Datos Personales'
              : 'Términos y Condiciones de Uso'
          }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense @click="close" />
      </q-card-section>

      <q-card-section class="policy-content">
        <q-inner-loading :showing="loading" label="Cargando documento..." />

        <div v-if="!loading" class="policy-header q-mb-lg">
          <div class="text-subtitle1 text-weight-medium q-mb-sm">Versión {{ policyVersion }}</div>
          <div class="text-caption text-grey-7">Última actualización: {{ lastUpdateDate }}</div>
        </div>

        <q-scroll-area
          v-if="!loading"
          class="policy-scroll"
          :style="{ height: 'calc(100vh - 300px)' }"
        >
          <div class="policy-text" v-html="policyContent" />
        </q-scroll-area>
      </q-card-section>

      <q-card-actions v-if="showAcceptance" align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" color="grey-7" @click="close" />
        <q-btn color="primary" label="Cerrar" @click="accept" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import { useQuasar } from 'quasar';
import { documentosLegalesService } from '../../infrastructure/http/documentos-legales/documentos-legales.service';
import type { DocumentoLegal } from '../../application/documentos-legales/documentos-legales.repository.port';

interface Props {
  modelValue: boolean;
  policyType: 'datos' | 'terminos';
  showAcceptance?: boolean;
  documento?: DocumentoLegal | null; // Documento opcional que puede venir desde el padre
}

const props = withDefaults(defineProps<Props>(), {
  showAcceptance: false,
  documento: null,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  accepted: [];
  closed: [];
}>();

const $q = useQuasar();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const documento = ref<DocumentoLegal | null>(props.documento);
const loading = ref(true);

// Mapeo de tipos de política a tipos de documento en la BD
const tipoDocumentoMap: Record<string, string> = {
  datos: 'POLITICA_PRIVACIDAD',
  terminos: 'TERMINOS_CONDICIONES',
};

// Cargar documento desde la base de datos si no se proporciona
const cargarDocumento = async () => {
  if (props.documento) {
    documento.value = props.documento;
    return;
  }

  loading.value = true;
  try {
    const tipoDocumento = tipoDocumentoMap[props.policyType];
    if (!tipoDocumento) {
      documento.value = null;
      return;
    }

    const documentos = await documentosLegalesService.findByTipo(tipoDocumento, true);
    // Obtener el documento más reciente (última versión)
    if (documentos.length > 0) {
      const documentoMasReciente = documentos.sort(
        (a: DocumentoLegal, b: DocumentoLegal) =>
          new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime(),
      )[0];
      documento.value = documentoMasReciente || null;
    } else {
      // Fallback a contenido por defecto si no hay documento en BD
      documento.value = null;
    }
  } catch (error) {
    console.error('Error al cargar documento legal:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar el documento. Se mostrará contenido por defecto.',
      timeout: 3000,
    });
    documento.value = null;
  } finally {
    loading.value = false;
  }
};

const policyVersion = computed(() => {
  return documento.value?.version || '0.0';
});

const lastUpdateDate = computed(() => {
  if (documento.value?.fechaActualizacion) {
    return new Date(documento.value.fechaActualizacion).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  return new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

const policyContent = computed(() => {
  // Si hay documento desde BD, usar su contenido
  console.log('documento.value', documento.value);
  if (documento.value?.contenido) {
    return documento.value.contenido;
  }

  return 'No hemos podido cargar las políticas de tratamiento de datos personales o términos y condiciones de uso.';
});

function close() {
  isOpen.value = false;
  emit('closed');
}

function accept() {
  emit('accepted');
  close();
}

watch(isOpen, (newValue) => {
  if (newValue) {
    // Cargar documento cuando se abre el modal
    void cargarDocumento();

    // Scroll al inicio cuando se abre el modal
    setTimeout(() => {
      const scrollArea = document.querySelector('.policy-scroll');
      if (scrollArea) {
        scrollArea.scrollTop = 0;
      }
    }, 100);
  }
});

// Observar cambios en el prop documento
watch(
  () => props.documento,
  (newDocumento) => {
    if (newDocumento) {
      documento.value = newDocumento;
    }
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
.policies-modal {
  .policy-content {
    padding: 0;
    height: fit-content;
    width: 100%;
  }

  .policy-header {
    padding: 24px;
    background-color: rgba(0, 0, 0, 0.02);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .policy-scroll {
    padding: 24px;
  }

  .policy-text {
    max-width: 800px;
    margin: 0 auto;
    line-height: 1.8;

    h2 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-top: 2rem;
      margin-bottom: 1rem;
      color: var(--q-primary);
    }

    h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
    }

    p {
      margin-bottom: 1rem;
      text-align: justify;
    }

    ul {
      margin-left: 1.5rem;
      margin-bottom: 1rem;

      li {
        margin-bottom: 0.5rem;
      }
    }

    strong {
      font-weight: 600;
    }
  }
}

body.body--dark {
  .policies-modal {
    .policy-header {
      background-color: rgba(255, 255, 255, 0.05);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .policy-text {
      h2 {
        color: var(--q-primary);
      }
    }
  }
}
</style>

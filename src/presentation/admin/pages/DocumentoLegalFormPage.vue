<template>
  <q-page padding>
    <div class="q-pa-md">
      <!-- Header -->
      <div class="q-mb-md">
        <div class="row items-center q-mb-sm">
          <q-btn flat round icon="arrow_back" @click="volver" class="q-mr-sm" />
          <h4 class="text-h4 q-ma-none">
            {{ esEdicion ? '✏️ Editar Documento Legal' : '➕ Nuevo Documento Legal' }}
          </h4>
        </div>
        <p class="text-grey-7">
          {{
            esEdicion
              ? 'Modifica los datos del documento legal'
              : 'Crea un nuevo documento legal para el sistema'
          }}
        </p>
      </div>

      <!-- Formulario -->
      <q-card>
        <q-inner-loading :showing="loading">
          <q-spinner size="50px" color="primary">Cargando...</q-spinner>
        </q-inner-loading>

        <div v-if="loading" style="height: 200px; width: 100%" class="flex flex-center"></div>

        <transition
          appear
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
        >
          <q-form @submit="guardar" class="q-pa-md" v-if="!loading">
            <div class="row q-col-gutter-md">
              <!-- Tipo -->
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.tipo"
                  outlined
                  :options="tiposDocumento"
                  label="Tipo de Documento *"
                  :rules="[(val) => !!val || 'El tipo es requerido']"
                  emit-value
                  map-options
                  required
                />
              </div>

              <!-- Versión -->
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.version"
                  outlined
                  label="Versión *"
                  :rules="[
                    (val) => !!val || 'La versión es requerida',
                    (val) => /^\d+\.\d+$/.test(val) || 'Formato inválido (ej: 1.0, 2.1)',
                  ]"
                  hint="Formato: X.Y (ej: 1.0, 2.1)"
                  required
                />
              </div>

              <!-- Título -->
              <div class="col-12">
                <q-input
                  v-model="form.titulo"
                  label="Título *"
                  :rules="[(val) => !!val || 'El título es requerido']"
                  maxlength="200"
                  counter
                  outlined
                  required
                />
              </div>

              <!-- Requiere Firma Digital -->
              <div class="col-12 col-md-6">
                <q-toggle v-model="requiereFirmaDigitalToggle" label="Requiere Firma Digital" />
              </div>

              <!-- Activo -->
              <div class="col-12 col-md-6">
                <q-toggle v-model="activoToggle" label="Documento Activo" />
              </div>

              <!-- Contenido -->
              <div class="col-12" v-if="form.contenido">
                <q-editor
                  v-model="form.contenido"
                  min-height="8rem"
                  outlined
                  :dense="$q.screen.lt.md"
                  :toolbar="[
                    [
                      {
                        label: $q.lang.editor.align,
                        icon: $q.iconSet.editor.align,
                        fixedLabel: true,
                        list: 'only-icons',
                        options: ['left', 'center', 'right', 'justify'],
                      },
                      {
                        label: $q.lang.editor.align,
                        icon: $q.iconSet.editor.align,
                        fixedLabel: true,
                        options: ['left', 'center', 'right', 'justify'],
                      },
                    ],
                    ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript'],
                    ['token', 'hr', 'link', 'custom_btn'],
                    ['print', 'fullscreen'],
                    [
                      {
                        label: $q.lang.editor.formatting,
                        icon: $q.iconSet.editor.formatting,
                        list: 'no-icons',
                        options: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code'],
                      },
                      {
                        label: $q.lang.editor.fontSize,
                        icon: $q.iconSet.editor.fontSize,
                        fixedLabel: true,
                        fixedIcon: true,
                        list: 'no-icons',
                        options: [
                          'size-1',
                          'size-2',
                          'size-3',
                          'size-4',
                          'size-5',
                          'size-6',
                          'size-7',
                        ],
                      },
                      {
                        label: $q.lang.editor.defaultFont,
                        icon: $q.iconSet.editor.font,
                        fixedIcon: true,
                        list: 'no-icons',
                        options: [
                          'default_font',
                          'arial',
                          'arial_black',
                          'comic_sans',
                          'courier_new',
                          'impact',
                          'lucida_grande',
                          'times_new_roman',
                          'verdana',
                        ],
                      },
                      'removeFormat',
                    ],
                    ['quote', 'unordered', 'ordered', 'outdent', 'indent'],

                    ['undo', 'redo'],
                    ['viewsource'],
                  ]"
                  :fonts="{
                    arial: 'Arial',
                    arial_black: 'Arial Black',
                    comic_sans: 'Comic Sans MS',
                    courier_new: 'Courier New',
                    impact: 'Impact',
                    lucida_grande: 'Lucida Grande',
                    times_new_roman: 'Times New Roman',
                    verdana: 'Verdana',
                  }"
                />
              </div>
            </div>

            <!-- Botones de Acción -->
            <div class="row justify-end q-mt-lg q-gutter-sm">
              <q-btn flat label="Cancelar" color="grey-7" @click="volver" />
              <q-btn
                type="submit"
                label="Guardar"
                color="primary"
                :loading="guardando"
                icon="save"
              />
            </div>
          </q-form>
        </transition>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { documentosLegalesService } from '../../../infrastructure/http/documentos-legales/documentos-legales.service';
import type {
  CreateDocumentoLegalDto,
  UpdateDocumentoLegalDto,
} from '../../../application/documentos-legales/documentos-legales.repository.port';
import {
  DocumentosLegalesUseCasesFactory,
  CreateDocumentoLegalUseCase,
  UpdateDocumentoLegalUseCase,
  GetDocumentoLegalUseCase,
} from '../../../application/documentos-legales';
import { useBooleanNumberToggle } from '../../../shared/composables/useBooleanNumberToggle';

const router = useRouter();
const route = useRoute();
const $q = useQuasar();

// Use cases
const createDocumentoLegalUseCase: CreateDocumentoLegalUseCase =
  DocumentosLegalesUseCasesFactory.getCreateDocumentoLegalUseCase(documentosLegalesService);
const updateDocumentoLegalUseCase: UpdateDocumentoLegalUseCase =
  DocumentosLegalesUseCasesFactory.getUpdateDocumentoLegalUseCase(documentosLegalesService);
const getDocumentoLegalUseCase: GetDocumentoLegalUseCase =
  DocumentosLegalesUseCasesFactory.getGetDocumentoLegalUseCase(documentosLegalesService);

// Estado
const loading = ref(false);
const guardando = ref(false);

const esEdicion = computed(() => {
  return route.name === 'documento-legal-edit' && route.params.id;
});

const tiposDocumento = [
  { label: 'Términos y Condiciones', value: 'TERMINOS_CONDICIONES' },
  { label: 'Política de Privacidad', value: 'POLITICA_PRIVACIDAD' },
  { label: 'Política de Datos', value: 'POLITICA_DATOS' },
  { label: 'Otro', value: 'OTRO' },
];

// Formulario
const form = ref<CreateDocumentoLegalDto>({
  tipo: 'TERMINOS_CONDICIONES',
  titulo: '',
  contenido: '',
  version: '1.0',
  requiereFirmaDigital: false,
  activo: true,
});

// Computed refs para los toggles que convierten automáticamente entre boolean y number
// Estos toggles trabajan con boolean en el frontend, pero el backend espera números (1/0)
// El servicio HTTP se encarga de la conversión al enviar/recibir datos
const requiereFirmaDigitalToggle = useBooleanNumberToggle(
  () => form.value.requiereFirmaDigital,
  (value: boolean) => {
    form.value.requiereFirmaDigital = value;
  },
);

const activoToggle = useBooleanNumberToggle(
  () => form.value.activo,
  (value: boolean) => {
    form.value.activo = value;
  },
);

// Funciones
const cargarDocumento = async () => {
  if (!esEdicion.value) return;

  loading.value = true;
  try {
    const id = Number(route.params.id);
    const documento = await getDocumentoLegalUseCase.execute(id);

    if (!documento) {
      $q.notify({
        type: 'negative',
        message: 'Documento no encontrado',
        position: 'top',
      });
      volver();
      return;
    }

    form.value = {
      tipo: documento.tipo,
      titulo: documento.titulo,
      contenido: documento.contenido,
      version: documento.version,
      ...(documento.requiereFirmaDigital !== undefined && {
        requiereFirmaDigital: documento.requiereFirmaDigital,
      }),
      ...(documento.activo !== undefined && { activo: documento.activo }),
    };
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Error al cargar el documento',
      position: 'top',
    });
    volver();
  } finally {
    loading.value = false;
  }
};

const guardar = async () => {
  guardando.value = true;
  try {
    if (esEdicion.value) {
      const id = Number(route.params.id);
      const updateDto: UpdateDocumentoLegalDto = {
        tipo: form.value.tipo,
        titulo: form.value.titulo,
        contenido: form.value.contenido,
        ...(form.value.version !== undefined && { version: form.value.version }),
        ...(form.value.requiereFirmaDigital !== undefined && {
          requiereFirmaDigital: form.value.requiereFirmaDigital,
        }),
        ...(form.value.activo !== undefined && { activo: form.value.activo }),
      };
      await updateDocumentoLegalUseCase.execute(id, updateDto);
      $q.notify({
        type: 'positive',
        message: 'Documento actualizado correctamente',
        position: 'top',
      });
    } else {
      await createDocumentoLegalUseCase.execute(form.value);
      $q.notify({
        type: 'positive',
        message: 'Documento creado correctamente',
        position: 'top',
      });
    }
    volver();
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Error al guardar el documento',
      position: 'top',
    });
  } finally {
    guardando.value = false;
  }
};

const volver = () => {
  router.push('/admin/documentos-legales');
};

onMounted(() => {
  if (esEdicion.value) {
    void cargarDocumento();
  }
});
</script>

<style scoped>
.q-form {
  max-width: 100%;
}
</style>

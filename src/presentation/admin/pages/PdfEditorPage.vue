<template>
  <q-page
    class="pdf-editor-page"
    style="height: 100vh; display: flex; flex-direction: column; overflow: hidden"
  >
    <div style="display: flex; height: 100%; overflow: hidden">
      <!-- Sidebar con Editor -->
      <div
        class="editor-sidebar"
        style="
          width: 400px;
          min-width: 350px;
          max-width: 500px;
          background: white;
          border-right: 1px solid #e0e0e0;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          flex-shrink: 0;
        "
      >
        <!-- Header del Sidebar -->
        <div
          class="sidebar-header q-pa-md"
          style="
            background: linear-gradient(135deg, #292561 0%, #3d3a7d 100%);
            color: white;
            position: sticky;
            top: 0;
            z-index: 10;
          "
        >
          <h5 class="q-ma-none q-mb-md">📝 Editor de Certificados PDF</h5>
          <div class="row q-col-gutter-sm">
            <div class="col">
              <q-select
                v-model="certificateHash"
                filled
                dark
                dense
                use-input
                input-debounce="300"
                :options="certificateOptions"
                option-label="label"
                option-value="hash"
                @filter="filterCertificates"
                placeholder="Buscar certificado por hash, nombre o curso..."
                @update:model-value="onCertificateSelect"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      {{ loadingSearch ? 'Buscando...' : 'No se encontraron certificados' }}
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.caption }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-chip size="sm" color="primary" text-color="white">
                        {{ scope.opt.hash.substring(0, 8) }}...
                      </q-chip>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="col-auto">
              <q-btn color="positive" icon="search" @click="loadPDF" :loading="loadingPDF" />
            </div>
          </div>
        </div>

        <!-- Contenido del Editor -->
        <div class="editor-content q-pa-md" style="flex: 1; overflow-y: auto">
          <q-inner-loading :showing="loading">
            <q-spinner size="50px" color="primary" />
          </q-inner-loading>

          <!-- Sin PDF seleccionado: solo mensaje -->
          <div
            v-if="!hasPdfSelected"
            class="column items-center justify-center q-pa-xl text-center"
          >
            <q-icon name="picture_as_pdf" size="64px" color="grey-5" class="q-mb-md" />
            <div class="text-body1 text-grey-7 q-mb-sm">
              Seleccione un certificado (por hash o desde el buscador) y pulse el botón de cargar
              <q-icon name="search" size="sm" /> para editar la configuración del PDF.
            </div>
            <div class="text-caption text-grey-6">
              Los valores del formulario se cargarán después de cargar el certificado.
            </div>
          </div>

          <!-- Con PDF seleccionado: tabs y formulario -->
          <template v-else>
            <!-- Tabs -->
            <q-tabs
              v-model="activeTab"
              dense
              class="text-grey q-mb-md"
              active-color="primary"
              indicator-color="primary"
              align="justify"
            >
              <q-tab name="otros" label="Otros" icon="description" />
              <q-tab name="alimentos" label="Alimentos" icon="restaurant" />
              <q-tab name="sustancias" label="Sustancias" icon="warning" />
            </q-tabs>

            <q-tab-panels v-model="activeTab" animated>
              <!-- Tab: Otros -->
              <q-tab-panel name="otros" class="q-pa-none">
                <CertificateConfigEditor
                  :key="`otros-${configOtros ? JSON.stringify(configOtros) : 'empty'}`"
                  :config="configOtros || defaultValuesOtros"
                  :tipo="'otros'"
                  :default-values="defaultValuesOtros"
                  @update:config="handleConfigUpdate('otros', $event)"
                  @update:pdf="updatePDFPreview"
                />
              </q-tab-panel>

              <!-- Tab: Alimentos -->
              <q-tab-panel name="alimentos" class="q-pa-none">
                <CertificateConfigEditor
                  :key="`alimentos-${configAlimentos ? JSON.stringify(configAlimentos) : 'empty'}`"
                  :config="configAlimentos || defaultValuesAlimentos"
                  :tipo="'alimentos'"
                  :default-values="defaultValuesAlimentos"
                  @update:config="handleConfigUpdate('alimentos', $event)"
                  @update:pdf="updatePDFPreview"
                />
              </q-tab-panel>

              <!-- Tab: Sustancias -->
              <q-tab-panel name="sustancias" class="q-pa-none">
                <CertificateConfigEditor
                  :key="`sustancias-${configSustancias ? JSON.stringify(configSustancias) : 'empty'}`"
                  :config="configSustancias || defaultValuesSustancias"
                  :tipo="'sustancias'"
                  :default-values="defaultValuesSustancias"
                  @update:config="handleConfigUpdate('sustancias', $event)"
                  @update:pdf="updatePDFPreview"
                />
              </q-tab-panel>
            </q-tab-panels>

            <!-- Botones de Acción -->
            <div class="row q-col-gutter-sm q-mt-md">
              <div class="col">
                <q-btn
                  flat
                  label="Cargar desde BD"
                  color="info"
                  icon="cloud_download"
                  @click="cargarConfiguracion"
                  :loading="loading"
                  class="full-width"
                />
              </div>
              <div class="col">
                <q-btn
                  label="Guardar en BD"
                  color="primary"
                  icon="save"
                  @click="guardarTodo"
                  :loading="guardando"
                  class="full-width"
                />
              </div>
            </div>

            <!-- Upload de Fondo (solo con PDF seleccionado) -->
            <q-card v-if="hasPdfSelected" class="q-mt-md">
              <q-card-section>
                <div class="text-subtitle2 q-mb-sm">🎨 Fondo PNG</div>
                <q-file
                  v-model="backgroundFile"
                  label="Seleccionar archivo PNG"
                  accept=".png,image/png"
                  outlined
                  dense
                  @update:model-value="handleFileSelect"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                </q-file>
                <q-btn
                  v-if="backgroundFile"
                  label="Subir Fondo"
                  color="primary"
                  icon="cloud_upload"
                  class="q-mt-sm full-width"
                  :loading="uploading"
                  @click="uploadBackground"
                />
              </q-card-section>
            </q-card>
          </template>
        </div>
      </div>

      <!-- Vista Previa del PDF -->
      <div
        class="viewer-container"
        style="
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #e0e0e0;
          min-width: 0;
          overflow: hidden;
        "
      >
        <!-- Header del Viewer -->
        <div
          class="viewer-header q-pa-md"
          style="
            background: white;
            border-bottom: 1px solid #e0e0e0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
          "
        >
          <h6 class="q-ma-none text-primary">Vista Previa</h6>
          <div class="row q-col-gutter-sm items-center">
            <q-toggle
              v-model="autoRefresh"
              label="Auto-refresh (3s)"
              color="primary"
              @update:model-value="toggleAutoRefresh"
            />
            <q-btn flat dense icon="refresh" color="primary" label="Recargar" @click="reloadPDF" />
            <q-btn
              flat
              dense
              icon="restart_alt"
              color="negative"
              label="Reset"
              @click="resetValues"
            />
          </div>
        </div>

        <!-- Iframe del PDF -->
        <div style="position: relative; flex: 1; min-height: 0; overflow: auto">
          <q-inner-loading :showing="loadingPDF" style="z-index: 100">
            <q-spinner size="50px" color="primary" />
          </q-inner-loading>
          <iframe
            ref="pdfViewer"
            style="width: 100%; height: 100%; min-height: 800px; border: none; background: white"
            @load="onPDFLoad"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useQuasar } from 'quasar';
import { useRoute } from 'vue-router';
import { certificateFormatsService } from '../../../infrastructure/http/certificate-formats/certificate-formats.service';
import CertificateConfigEditor from '../components/CertificateConfigEditor.vue';
import { api } from '../../../boot/axios';
import { certificatesService } from '../../../infrastructure/http/certificates/certificates.service';

const $q = useQuasar();
const route = useRoute();

const loading = ref(false);
const guardando = ref(false);
const loadingPDF = ref(false);
const uploading = ref(false);
const loadingSearch = ref(false);
const activeTab = ref<'otros' | 'alimentos' | 'sustancias'>('otros');
const autoRefresh = ref(false);
const certificateHash = ref('');
const backgroundFile = ref<File | null>(null);
const certificateOptions = ref<Array<{ hash: string; label: string; caption: string }>>([]);
const allCertificates = ref<
  Array<{
    id: number;
    hashVerificacion: string;
    numeroCertificado: string;
    estudianteNombre: string;
    cursoNombre: string;
    fechaEmision: string;
  }>
>([]);

// Inicializar con valores por defecto en lugar de null para que el componente hijo los reciba
const configOtros = ref<any>({});
const configAlimentos = ref<any>({});
const configSustancias = ref<any>({});

const currentFormatId = ref<number | null>(null);
const pdfViewer = ref<HTMLIFrameElement | null>(null);
let autoRefreshInterval: NodeJS.Timeout | null = null;

// Valores por defecto para cada tipo
const defaultValuesOtros = {
  cursoNombre: { x: 396, y: 395, fontSize: 18, bold: true, color: [41, 37, 97] },
  nombreEstudiante: { x: 396, y: 290, fontSize: 18, bold: true, color: [41, 37, 97] },
  documento: { x: 450, y: 320, fontSize: 18, bold: false },
  duracion: { x: 445, y: 422, fontSize: 14, bold: false },
  fechaEmision: { x: 250, y: 437, fontSize: 14, bold: false },
  fechaVencimiento: { x: 550, y: 436, fontSize: 14, bold: false },
  qr: { x: 520, y: 377.6, size: 70 },
  instructorFirma: { x: 156, y: 450, width: 190, height: 80 },
  instructorNombre: { x: 150, y: 505, fontSize: 10, bold: true, color: [41, 37, 97] },
  instructorRol: {
    x: 150,
    y: 513,
    fontSize: 9.5,
    bold: false,
    lineSpacing: 12,
    color: [41, 37, 97],
  },
  representanteFirma: { x: 498.5, y: 455, width: 145, height: 61 },
  representanteNombre: { x: 485, y: 505, fontSize: 9.9, bold: true, color: [41, 37, 97] },
  representanteRol: { x: 515, y: 513, fontSize: 9.5, bold: false, color: [41, 37, 97] },
  footer: { x: 396, y: 590, fontSize: 7, bold: true, color: [41, 37, 97] },
};

const defaultValuesAlimentos = {
  cursoNombre: { x: 396, y: 395, fontSize: 18, bold: true, color: [255, 255, 255] },
  nombreEstudiante: { x: 396, y: 290, fontSize: 18, bold: true, color: [41, 37, 97] },
  documento: { x: 405, y: 323, fontSize: 18, bold: false },
  duracion: { x: 440, y: 422, fontSize: 14, bold: false },
  fechaEmision: { x: 310, y: 437, fontSize: 14, bold: false },
  fechaVencimiento: { x: 570, y: 436, fontSize: 14, bold: false },
  qr: { x: 688, y: 448.5, size: 70 },
  instructorFirma: { x: 178.5, y: 450, width: 145, height: 61 },
  instructorNombre: { x: 235, y: 495, fontSize: 10, bold: true, color: [41, 37, 97] },
  instructorRol: {
    x: 217,
    y: 513,
    fontSize: 9.5,
    bold: false,
    lineSpacing: 12,
    color: [41, 37, 97],
  },
  representanteFirma: { x: 498.5, y: 455, width: 145, height: 61 },
  representanteNombre: { x: 565.5, y: 495, fontSize: 9.9, bold: true, color: [41, 37, 97] },
  representanteRol: { x: 571, y: 513, fontSize: 9.5, bold: false, color: [41, 37, 97] },
  footer: { x: 396, y: 590, fontSize: 7, bold: true, color: [41, 37, 97] },
};

const defaultValuesSustancias = {
  cursoNombre: { x: 396, y: 395, fontSize: 18, bold: true, color: [255, 255, 255] },
  nombreEstudiante: { x: 396, y: 290, fontSize: 18, bold: true, color: [41, 37, 97] },
  documento: { x: 370, y: 320, fontSize: 18, bold: false },
  duracion: { x: 430, y: 422, fontSize: 14, bold: false },
  fechaEmision: { x: 240, y: 438, fontSize: 14, bold: false },
  fechaVencimiento: { x: 500, y: 438, fontSize: 14, bold: false },
  qr: { x: 688, y: 448.5, size: 70 },
  instructorFirma: { x: 160, y: 455, width: 145, height: 61 },
  instructorNombre: { x: 160, y: 505, fontSize: 10, bold: true, color: [41, 37, 97] },
  instructorRol: {
    x: 160,
    y: 513,
    fontSize: 9.5,
    bold: false,
    lineSpacing: 12,
    color: [41, 37, 97],
  },
  representanteFirma: { x: 498.5, y: 440, width: 145, height: 61 },
  representanteNombre: { x: 490, y: 505, fontSize: 9.9, bold: true, color: [41, 37, 97] },
  representanteRol: { x: 520, y: 513, fontSize: 9.5, bold: false, color: [41, 37, 97] },
  footer: { x: 396, y: 590, fontSize: 7, bold: true, color: [41, 37, 97] },
};

/** Solo hay valores en el formulario cuando el usuario ha seleccionado un certificado y se ha cargado */
const hasPdfSelected = computed(() => {
  const v = certificateHash.value;
  if (typeof v === 'string') return v.trim() !== '';
  return !!(v && typeof v === 'object' && (v as { hash?: string }).hash);
});

// Cargar hash desde URL si existe; no cargar config hasta que haya un PDF seleccionado
onMounted(async () => {
  // Cargar certificados por defecto (uno de cada categoría)
  await cargarCertificadosPorDefecto();

  // Si hay hash en la URL, cargar el certificado (y entonces sí se carga la config en el formulario)
  const hashFromUrl = route.query.hash as string;
  if (hashFromUrl) {
    certificateHash.value = hashFromUrl;
    await loadPDF();
  }
});

onUnmounted(() => {
  stopAutoRefresh();
});

async function cargarConfiguracion() {
  loading.value = true;
  try {
    console.log('[PdfEditor] Cargando configuración inicial...');
    const config = await certificateFormatsService.getActiveConfig();
    console.log('[PdfEditor] Configuración recibida en cargarConfiguracion:', config);

    if (config) {
      // Hacer merge profundo con valores por defecto
      if (config.otros) {
        configOtros.value = deepMerge(defaultValuesOtros, config.otros);
        console.log('[PdfEditor] Config OTROS aplicada:', configOtros.value);
      } else {
        configOtros.value = { ...defaultValuesOtros };
      }

      if (config.alimentos) {
        configAlimentos.value = deepMerge(defaultValuesAlimentos, config.alimentos);
        console.log('[PdfEditor] Config ALIMENTOS aplicada:', configAlimentos.value);
      } else {
        configAlimentos.value = { ...defaultValuesAlimentos };
      }

      if (config.sustancias) {
        configSustancias.value = deepMerge(defaultValuesSustancias, config.sustancias);
        console.log('[PdfEditor] Config SUSTANCIAS aplicada:', configSustancias.value);
      } else {
        configSustancias.value = { ...defaultValuesSustancias };
      }
    } else {
      console.log('[PdfEditor] No hay configuración en BD, usando valores por defecto');
      configOtros.value = { ...defaultValuesOtros };
      configAlimentos.value = { ...defaultValuesAlimentos };
      configSustancias.value = { ...defaultValuesSustancias };
    }

    const activeFormat = await certificateFormatsService.findActive();
    if (activeFormat) {
      currentFormatId.value = activeFormat.id || null;
    }

    // Actualizar preview si hay hash (solo si no se está cargando un certificado nuevo)
    if (certificateHash.value && typeof certificateHash.value === 'string') {
      const hash = certificateHash.value.trim();
      if (hash && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(hash)) {
        updatePDFPreview();
      }
    }
  } catch (error) {
    console.error('[PdfEditor] Error cargando configuración:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar la configuración',
      caption: error instanceof Error ? error.message : 'Error desconocido',
    });
  } finally {
    loading.value = false;
  }
}

function handleConfigUpdate(tipo: 'otros' | 'alimentos' | 'sustancias', config: any) {
  switch (tipo) {
    case 'otros':
      configOtros.value = config;
      break;
    case 'alimentos':
      configAlimentos.value = config;
      break;
    case 'sustancias':
      configSustancias.value = config;
      break;
  }
  // El PDF solo se refresca con @update:pdf (Enter o blur en el editor), no al escribir
}

function getConfig(): any {
  return {
    alimentos: configAlimentos.value,
    sustancias: configSustancias.value,
    otros: configOtros.value,
  };
}

/**
 * Carga certificados por defecto (uno de cada categoría)
 */
async function cargarCertificadosPorDefecto() {
  loadingSearch.value = true;
  try {
    // Buscar certificados recientes (sin filtro para obtener variedad)
    const results = await certificatesService.searchHashes('', 50);

    if (results.length > 0) {
      // Categorizar certificados
      const certificadosAlimentos: typeof results = [];
      const certificadosSustancias: typeof results = [];
      const certificadosOtros: typeof results = [];

      results.forEach((cert) => {
        const tipo = determineCertificateType(cert.cursoNombre);
        if (tipo === 'alimentos') {
          certificadosAlimentos.push(cert);
        } else if (tipo === 'sustancias') {
          certificadosSustancias.push(cert);
        } else {
          certificadosOtros.push(cert);
        }
      });

      // Seleccionar uno de cada categoría (el más reciente)
      const certificadosPorDefecto: typeof results = [];
      if (certificadosAlimentos.length > 0) {
        certificadosPorDefecto.push(certificadosAlimentos[0]);
      }
      if (certificadosSustancias.length > 0) {
        certificadosPorDefecto.push(certificadosSustancias[0]);
      }
      if (certificadosOtros.length > 0) {
        certificadosPorDefecto.push(certificadosOtros[0]);
      }

      // Actualizar lista de certificados
      allCertificates.value = results;

      // Configurar opciones por defecto
      certificateOptions.value = certificadosPorDefecto.map((cert) => ({
        hash: cert.hashVerificacion,
        label: `${cert.estudianteNombre} - ${cert.cursoNombre}`,
        caption: `Hash: ${cert.hashVerificacion.substring(0, 8)}... | ${new Date(cert.fechaEmision).toLocaleDateString()}`,
      }));
    }
  } catch (error) {
    console.error('Error cargando certificados por defecto:', error);
    // No mostrar error al usuario, solo log
  } finally {
    loadingSearch.value = false;
  }
}

async function filterCertificates(val: string, update: (callback: () => void) => void) {
  // Si el input está vacío o tiene menos de 2 caracteres, mostrar los certificados por defecto
  if (!val || val.length < 2) {
    // Si ya tenemos certificados por defecto cargados, mostrarlos
    if (certificateOptions.value.length > 0 && allCertificates.value.length > 0) {
      // Filtrar de los certificados ya cargados
      const certificadosFiltrados = allCertificates.value.filter((cert) => {
        const tipo = determineCertificateType(cert.cursoNombre);
        return tipo === 'alimentos' || tipo === 'sustancias' || tipo === 'otros';
      });

      // Seleccionar uno de cada categoría
      const certificadosAlimentos = certificadosFiltrados.filter(
        (c) => determineCertificateType(c.cursoNombre) === 'alimentos',
      );
      const certificadosSustancias = certificadosFiltrados.filter(
        (c) => determineCertificateType(c.cursoNombre) === 'sustancias',
      );
      const certificadosOtros = certificadosFiltrados.filter(
        (c) => determineCertificateType(c.cursoNombre) === 'otros',
      );

      const certificadosPorDefecto: typeof allCertificates.value = [];
      if (certificadosAlimentos.length > 0) certificadosPorDefecto.push(certificadosAlimentos[0]);
      if (certificadosSustancias.length > 0) certificadosPorDefecto.push(certificadosSustancias[0]);
      if (certificadosOtros.length > 0) certificadosPorDefecto.push(certificadosOtros[0]);

      update(() => {
        certificateOptions.value = certificadosPorDefecto.map((cert) => ({
          hash: cert.hashVerificacion,
          label: `${cert.estudianteNombre} - ${cert.cursoNombre}`,
          caption: `Hash: ${cert.hashVerificacion.substring(0, 8)}... | ${new Date(cert.fechaEmision).toLocaleDateString()}`,
        }));
      });
    } else {
      update(() => {
        certificateOptions.value = [];
      });
    }
    return;
  }

  loadingSearch.value = true;
  try {
    const results = await certificatesService.searchHashes(val, 20);
    allCertificates.value = results;
    update(() => {
      certificateOptions.value = results.map((cert) => ({
        hash: cert.hashVerificacion,
        label: `${cert.estudianteNombre} - ${cert.cursoNombre}`,
        caption: `Hash: ${cert.hashVerificacion.substring(0, 8)}... | ${new Date(cert.fechaEmision).toLocaleDateString()}`,
      }));
    });
  } catch (error) {
    console.error('Error buscando certificados:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al buscar certificados',
      caption: error instanceof Error ? error.message : 'Error desconocido',
    });
    update(() => {
      certificateOptions.value = [];
    });
  } finally {
    loadingSearch.value = false;
  }
}

async function onCertificateSelect(value: any) {
  if (value && typeof value === 'object' && value.hash) {
    certificateHash.value = value.hash;
    await loadPDF();
  } else if (typeof value === 'string') {
    certificateHash.value = value;
    await loadPDF();
  }
}

async function loadPDF() {
  let hash = '';

  if (typeof certificateHash.value === 'object' && certificateHash.value?.hash) {
    hash = certificateHash.value.hash;
  } else if (typeof certificateHash.value === 'string') {
    hash = certificateHash.value.trim();
  }

  if (!hash) {
    $q.notify({
      type: 'warning',
      message: 'Por favor selecciona o ingresa un hash de certificado válido',
    });
    return;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(hash)) {
    $q.notify({
      type: 'negative',
      message: 'El hash debe ser un UUID válido',
    });
    return;
  }

  // Asegurar que certificateHash.value sea el string del hash
  certificateHash.value = hash;

  // Recargar configuraciones desde BD y determinar el tipo de certificado
  await cargarConfiguracionYDeterminarTipo(hash);

  // Actualizar preview
  updatePDFPreview();
}

/**
 * Determina el tipo de certificado basándose en el título de la capacitación
 */
function determineCertificateType(cursoNombre: string): 'otros' | 'alimentos' | 'sustancias' {
  const tituloLower = (cursoNombre || '').toLowerCase().trim();

  const isAlimentos =
    (tituloLower.includes('alimentos') &&
      (tituloLower.includes('manipulación') || tituloLower.includes('manipulacion'))) ||
    (tituloLower.includes('primeros') && tituloLower.includes('auxilios'));

  const isSustanciasPeligrosas =
    tituloLower.includes('peligrosas') ||
    (tituloLower.includes('sustancias') && tituloLower.includes('peligrosas')) ||
    (tituloLower.includes('mercancías') && tituloLower.includes('peligrosas')) ||
    (tituloLower.includes('mercancias') && tituloLower.includes('peligrosas'));

  if (isAlimentos) {
    return 'alimentos';
  } else if (isSustanciasPeligrosas) {
    return 'sustancias';
  }
  return 'otros';
}

/**
 * Carga las configuraciones desde BD y determina el tipo de certificado
 */
async function cargarConfiguracionYDeterminarTipo(hash: string) {
  loading.value = true;
  try {
    console.log('[PdfEditor] Iniciando carga de configuración para hash:', hash);

    // 1. Obtener información del certificado para determinar el tipo
    let certificadoInfo = allCertificates.value.find((cert) => cert.hashVerificacion === hash);

    // Si no está en la lista, intentar buscarlo
    if (!certificadoInfo) {
      try {
        console.log('[PdfEditor] Certificado no encontrado en lista, buscando...');
        const results = await certificatesService.searchHashes(hash, 1);
        if (results.length > 0 && results[0].hashVerificacion === hash) {
          certificadoInfo = results[0];
          console.log('[PdfEditor] Certificado encontrado:', certificadoInfo.cursoNombre);
          // Agregar a la lista para futuras referencias
          if (!allCertificates.value.find((c) => c.hashVerificacion === hash)) {
            allCertificates.value.push(certificadoInfo);
          }
        }
      } catch (error) {
        console.warn('[PdfEditor] No se pudo obtener información del certificado:', error);
      }
    }

    // 2. Recargar configuraciones desde BD
    console.log('[PdfEditor] Obteniendo configuración activa desde BD...');
    const config = await certificateFormatsService.getActiveConfig();
    console.log('[PdfEditor] Configuración recibida:', config);

    if (config) {
      // Hacer merge profundo con valores por defecto
      if (config.otros) {
        console.log('[PdfEditor] Aplicando configuración OTROS desde BD:', config.otros);
        configOtros.value = deepMerge(defaultValuesOtros, config.otros);
        console.log('[PdfEditor] Config OTROS después del merge:', configOtros.value);
      } else {
        console.log('[PdfEditor] No hay configuración OTROS en BD, usando valores por defecto');
        configOtros.value = { ...defaultValuesOtros };
      }

      if (config.alimentos) {
        console.log('[PdfEditor] Aplicando configuración ALIMENTOS desde BD:', config.alimentos);
        configAlimentos.value = deepMerge(defaultValuesAlimentos, config.alimentos);
        console.log('[PdfEditor] Config ALIMENTOS después del merge:', configAlimentos.value);
      } else {
        console.log('[PdfEditor] No hay configuración ALIMENTOS en BD, usando valores por defecto');
        configAlimentos.value = { ...defaultValuesAlimentos };
      }

      if (config.sustancias) {
        console.log('[PdfEditor] Aplicando configuración SUSTANCIAS desde BD:', config.sustancias);
        configSustancias.value = deepMerge(defaultValuesSustancias, config.sustancias);
        console.log('[PdfEditor] Config SUSTANCIAS después del merge:', configSustancias.value);
      } else {
        console.log(
          '[PdfEditor] No hay configuración SUSTANCIAS en BD, usando valores por defecto',
        );
        configSustancias.value = { ...defaultValuesSustancias };
      }
    } else {
      console.log('[PdfEditor] No hay configuración activa en BD, usando valores por defecto');
      configOtros.value = { ...defaultValuesOtros };
      configAlimentos.value = { ...defaultValuesAlimentos };
      configSustancias.value = { ...defaultValuesSustancias };
    }

    const activeFormat = await certificateFormatsService.findActive();
    if (activeFormat) {
      currentFormatId.value = activeFormat.id || null;
      console.log('[PdfEditor] Formato activo ID:', currentFormatId.value);
    }

    // 3. Determinar y cambiar al tab correcto según el tipo de certificado
    if (certificadoInfo && certificadoInfo.cursoNombre) {
      const tipo = determineCertificateType(certificadoInfo.cursoNombre);
      activeTab.value = tipo;
      console.log('[PdfEditor] Tipo detectado:', tipo, 'para curso:', certificadoInfo.cursoNombre);

      $q.notify({
        type: 'info',
        message: `Certificado cargado: ${certificadoInfo.cursoNombre}`,
        caption: `Tipo detectado: ${tipo}`,
        timeout: 2000,
      });
    }

    // Forzar actualización de los componentes hijos
    await nextTick();
    console.log('[PdfEditor] Configuraciones aplicadas. Config actual:', {
      otros: configOtros.value,
      alimentos: configAlimentos.value,
      sustancias: configSustancias.value,
    });
  } catch (error) {
    console.error('[PdfEditor] Error cargando configuración:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar la configuración',
      caption: error instanceof Error ? error.message : 'Error desconocido',
    });
  } finally {
    loading.value = false;
  }
}

/**
 * Función auxiliar para hacer merge profundo de objetos
 * Asegura que todos los valores de source sobrescriban los de target
 */
function deepMerge(target: any, source: any): any {
  if (!isObject(target) || !isObject(source)) {
    return source || target;
  }

  const output = { ...target };

  Object.keys(source).forEach((key) => {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (
      isObject(sourceValue) &&
      isObject(targetValue) &&
      !Array.isArray(sourceValue) &&
      !Array.isArray(targetValue)
    ) {
      // Si ambos son objetos, hacer merge recursivo
      output[key] = deepMerge(targetValue, sourceValue);
    } else {
      // Si source tiene un valor (incluso null o undefined), usarlo
      output[key] = sourceValue !== undefined ? sourceValue : targetValue;
    }
  });

  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

function updatePDFPreview() {
  let hash = '';

  if (typeof certificateHash.value === 'object' && certificateHash.value?.hash) {
    hash = certificateHash.value.hash;
  } else if (typeof certificateHash.value === 'string') {
    hash = certificateHash.value.trim();
  }

  if (!hash) return;

  const config = getConfig();
  const configJson = encodeURIComponent(JSON.stringify(config));
  const timestamp = new Date().getTime();
  const baseUrl = api.defaults.baseURL || window.location.origin;
  const pdfUrl = `${baseUrl}/public/certificates/view/${hash}?config=${configJson}&t=${timestamp}`;

  if (pdfViewer.value) {
    loadingPDF.value = true;
    // Limpiar iframe primero
    pdfViewer.value.src = '';

    setTimeout(() => {
      if (pdfViewer.value) {
        pdfViewer.value.src = pdfUrl;
      }
    }, 100);
  }
}

function onPDFLoad() {
  loadingPDF.value = false;
}

function reloadPDF() {
  if (!certificateHash.value) {
    $q.notify({
      type: 'warning',
      message: 'Primero carga un certificado',
    });
    return;
  }
  updatePDFPreview();
}

function resetValues() {
  $q.dialog({
    title: 'Confirmar Reset',
    message: '¿Restaurar todos los valores por defecto?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    configOtros.value = { ...defaultValuesOtros };
    configAlimentos.value = { ...defaultValuesAlimentos };
    configSustancias.value = { ...defaultValuesSustancias };
    updatePDFPreview();
    $q.notify({
      type: 'positive',
      message: 'Valores restaurados',
    });
  });
}

function toggleAutoRefresh(enabled: boolean) {
  if (enabled) {
    startAutoRefresh();
  } else {
    stopAutoRefresh();
  }
}

function startAutoRefresh() {
  stopAutoRefresh();
  autoRefreshInterval = setInterval(() => {
    if (certificateHash.value) {
      updatePDFPreview();
    } else {
      stopAutoRefresh();
      autoRefresh.value = false;
    }
  }, 3000);
}

function stopAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
  }
}

function handleFileSelect(file: File | null) {
  if (file && !file.type.includes('image/png')) {
    $q.notify({
      type: 'negative',
      message: 'El archivo debe ser una imagen PNG',
    });
    backgroundFile.value = null;
  }
}

async function uploadBackground() {
  if (!backgroundFile.value) return;

  uploading.value = true;
  try {
    await certificateFormatsService.uploadBackground(activeTab.value, backgroundFile.value);
    $q.notify({
      type: 'positive',
      message: 'Fondo actualizado exitosamente',
    });
    backgroundFile.value = null;
    await cargarConfiguracion();
  } catch (error) {
    console.error('Error subiendo fondo:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al subir el fondo',
      caption: error instanceof Error ? error.message : 'Error desconocido',
    });
  } finally {
    uploading.value = false;
  }
}

async function guardarTodo() {
  guardando.value = true;
  try {
    if (currentFormatId.value) {
      await certificateFormatsService.update(currentFormatId.value, {
        configOtros: configOtros.value,
        configAlimentos: configAlimentos.value,
        configSustancias: configSustancias.value,
      });
    } else {
      const nuevo = await certificateFormatsService.create({
        tipo: 'otros',
        configOtros: configOtros.value,
        configAlimentos: configAlimentos.value,
        configSustancias: configSustancias.value,
      });
      currentFormatId.value = nuevo.id || null;
    }

    $q.notify({
      type: 'positive',
      message: 'Configuración guardada exitosamente',
    });
  } catch (error) {
    console.error('Error guardando configuración:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al guardar la configuración',
      caption: error instanceof Error ? error.message : 'Error desconocido',
    });
  } finally {
    guardando.value = false;
  }
}
</script>

<style lang="scss" scoped>
.pdf-editor-page {
  .sidebar-header {
    h5 {
      color: white;
    }
  }

  .editor-content {
    .q-tabs {
      border-bottom: 2px solid #e0e0e0;
    }
  }

  .viewer-header {
    h6 {
      color: #292561;
    }
  }
}
</style>

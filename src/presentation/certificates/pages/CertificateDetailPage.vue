<template>
  <q-page class="certificate-detail-page q-pa-xl">
    <q-inner-loading :showing="loading" />

    <!-- Header -->
    <div v-if="certificate" class="row items-center justify-between q-mb-xl">
      <div class="col">
        <div class="row items-center q-gutter-md q-mb-sm">
          <q-btn
            flat
            round
            icon="arrow_back"
            color="primary"
            @click="goBack"
          >
            <q-tooltip>Volver</q-tooltip>
          </q-btn>
          <div>
            <div class="text-h4 text-weight-bold text-primary q-mb-xs">
              Certificado de {{ certificate.courseName }}
            </div>
            <div class="text-body2 text-grey-7">
              Emitido el {{ formatDate(certificate.issuedDate) }}
            </div>
          </div>
        </div>
      </div>
      <div class="row q-gutter-sm lt-md">

        <q-btn
          color="primary"
          unelevated
          icon="download"
          label="Descargar PDF"
          @click="downloadPDF"
        />
      </div>
    </div>

    <!-- Contenido principal - Solo mostrar si el certificado está cargado -->
    <div v-if="certificate" class="row q-col-gutter-lg">
      <!-- Main Content -->
      <div class="col-12 col-md-8">
        <!-- Certificate Viewer -->
        <q-card flat bordered class="q-mb-lg">
          <q-card-section class="q-pa-none">
            <!-- PDF Viewer -->
            <div v-if="certificate" class="certificate-viewer-container">
              <div class="viewer-toolbar row items-center justify-between q-pa-md bg-grey-2">
                <div class="row items-center q-gutter-sm">
                  <q-btn
                    flat
                    dense
                    icon="zoom_out"
                    :disable="zoomLevel <= 0.5"
                    @click="zoomOut"
                  >
                    <q-tooltip>Alejar</q-tooltip>
                  </q-btn>
                  <div class="text-body2 text-weight-medium">{{ Math.round(zoomLevel * 100) }}%</div>
                  <q-btn
                    flat
                    dense
                    icon="zoom_in"
                    :disable="zoomLevel >= 2"
                    @click="zoomIn"
                  >
                    <q-tooltip>Acercar</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    dense
                    icon="fit_screen"
                    @click="resetZoom"
                  >
                    <q-tooltip>Ajustar a pantalla</q-tooltip>
                  </q-btn>
                </div>
                <div class="row items-center q-gutter-sm">
                  <q-btn
                    flat
                    dense
                    icon="fullscreen"
                    @click="toggleFullscreen"
                  >
                    <q-tooltip>Pantalla completa</q-tooltip>
                  </q-btn>
                </div>
              </div>
              <div
                ref="viewerContainer"
                class="certificate-viewer"
              >
                <!-- HTML Certificate View -->
               <div class="certificate-html-view" :style="{ backgroundImage: `url(${certificateBg})` }">
                  <div class="certificate-content">
                    <!-- Title usually in SVG, but adding if needed based on PDF generator -->
                    <div class="cert-title">CERTIFICADO DE CAPACITACIÓN</div>
                    
                    <div class="cert-body">
                      <p class="cert-text">Se certifica que:</p>
                      <h2 class="cert-student-name">{{ certificate.studentName }}</h2>
                      <p class="cert-text">Documento de Identidad: {{ certificate.documentNumber }}</p>
                      
                      <p class="cert-text q-mt-lg">Ha completado exitosamente la capacitación:</p>
                      <h3 class="cert-course-name">{{ certificate.courseName }}</h3>
                      
                      <p class="cert-text q-mt-md">Fecha de emisión: {{ formatDate(certificate.issuedDate) }}</p>
                      <p class="cert-text">Capacitador: {{ certificate.instructorName }}</p>
                    </div>

                    <div class="cert-footer">
                       <div class="cert-signature-section">
                          <img v-if="certificate.digitalSignature" :src="certificate.digitalSignature" class="cert-signature-img" />
                          <div v-else class="cert-signature-placeholder">
                            <div class="line"></div>
                            <div>Firma Digital</div>
                          </div>
                       </div>
                       
                       <div class="cert-qr-section">
                          <QRCodeDisplay
                            v-if="getQRValue"
                            :value="getQRValue"
                            :size="120"
                            :show-border="false"
                            :show-background="false"
                            :show-info="false"
                            :show-actions="false"
                          />
                          <div class="cert-verification-code">
                            Código: {{ certificate.verificationCode }}
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </q-card-section>
        </q-card>

        <!-- Certificate Information -->
        <q-card flat bordered>
          <q-card-section>
            <q-tabs
              v-model="tab"
              dense
              class="text-primary"
              active-color="primary"
              indicator-color="primary"
              align="left"
            >
              <q-tab name="info" label="Información" icon="info" />
              <q-tab name="verification" label="Verificación" icon="qr_code_scanner" />
              <q-tab name="history" label="Historial" icon="history" />
            </q-tabs>
            <q-separator />

            <q-tab-panels v-model="tab" animated class="q-mt-md">
              <!-- Info Tab -->
              <q-tab-panel name="info">
                <div class="row q-col-gutter-lg">
                  <div class="col-12 col-md-6">
                    <div class="text-subtitle2 q-mb-sm text-weight-medium">Información del Curso</div>
                    <q-list bordered separator class="rounded-borders">
                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="school" color="primary" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label caption>Curso</q-item-label>
                          <q-item-label>{{ certificate.courseName }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="person" color="primary" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label caption>Instructor</q-item-label>
                          <q-item-label>{{ certificate.instructorName }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="schedule" color="primary" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label caption>Duración</q-item-label>
                          <q-item-label>{{ certificate.durationHours ? certificate.durationHours + ' horas' : 'No especificada' }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </div>

                  <div class="col-12 col-md-6">
                    <div class="text-subtitle2 q-mb-sm text-weight-medium">Información del Certificado</div>
                    <q-list bordered separator class="rounded-borders">
                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="event" color="primary" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label caption>Fecha de Emisión</q-item-label>
                          <q-item-label>{{ formatDate(certificate.issuedDate) }}</q-item-label>
                          <q-item-label
                            v-if="certificate.isRetroactive"
                            caption
                            class="text-info q-mt-xs"
                          >
                            <q-icon name="history" size="14px" class="q-mr-xs" />
                            Fecha retroactiva
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="event_busy" color="primary" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label caption>Fecha de Vencimiento</q-item-label>
                          <q-item-label>
                            {{ formatDate(certificate.expiryDate) }}
                            <q-badge
                              :color="getValidityColor(certificate.expiryDate)"
                              outline
                              class="q-ml-sm"
                            >
                              {{ getValidityStatus(certificate.expiryDate) }}
                            </q-badge>
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="check_circle" color="primary" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label caption>Puntuación Obtenida</q-item-label>
                          <q-item-label>
                            <q-badge
                              :color="certificate.score >= certificate.minimumScore ? 'positive' : 'negative'"
                              outline
                            >
                              {{ certificate.score }}% (Mínimo: {{ certificate.minimumScore }}%)
                            </q-badge>
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </div>
                </div>

                <div class="q-mt-lg">
                  <div class="text-subtitle2 q-mb-sm text-weight-medium">Información del Estudiante</div>
                  <q-list bordered separator class="rounded-borders">
                    <q-item>
                      <q-item-section avatar>
                        <q-icon name="person" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label caption>Nombre Completo</q-item-label>
                        <q-item-label>{{ certificate.studentName }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section avatar>
                        <q-icon name="badge" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label caption>Número de Documento</q-item-label>
                        <q-item-label>{{ certificate.documentNumber }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </q-tab-panel>

              <!-- Verification Tab -->
              <q-tab-panel name="verification">
                <div class="column items-center q-gutter-md">
                  <div class="text-subtitle1 text-weight-medium">Código de Verificación</div>
                  <q-card flat bordered class="q-pa-lg">
                    <div v-if="certificate.verificationCode" class="row items-center q-gutter-md">
                      <code class="text-h6 text-primary">{{ certificate.verificationCode }}</code>
                      <q-btn
                        flat
                        dense
                        round
                        icon="content_copy"
                        color="primary"
                        @click="copyVerificationCode"
                      >
                          <q-tooltip>Copiar código</q-tooltip>
                        </q-btn>
                    </div>
                    <div v-else class="text-caption text-grey-6 text-center q-pa-sm">
                      Código de verificación no disponible
                    </div>
                  </q-card>

                  <div class="text-subtitle1 text-weight-medium q-mt-lg">Código QR</div>
                  <q-card flat bordered class="q-pa-lg">
                    <div class="row justify-center">
                      <QRCodeDisplay
                        v-if="getQRValue"
                        :value="getQRValue"
                        :size="250"
                      />
                      <div v-else class="text-negative text-center q-pa-md">
                        <q-icon name="error_outline" size="48px" class="q-mb-sm" />
                        <div class="text-caption">Error al generar el código QR.</div>
                      </div>
                    </div>
                    <div class="text-caption text-grey-6 text-center q-mt-md">
                      Escanea este código para verificar el certificado
                    </div>
                  </q-card>

                  <div class="text-body2 text-grey-7 q-mt-md text-center">
                    Comparte este código o escanea el QR para verificar la autenticidad del certificado
                  </div>

                  <div class="row q-gutter-sm q-mt-md">

                    <q-btn
                      flat
                      color="primary"
                      icon="open_in_new"
                      label="Abrir Verificación Pública"
                      @click="openPublicVerification"
                    />
                  </div>
                </div>
              </q-tab-panel>

              <!-- History Tab -->
              <q-tab-panel name="history">
                <div class="text-subtitle1 q-mb-md text-weight-medium">Historial de Verificaciones</div>
                <div v-if="verificationHistory.length === 0" class="q-mt-lg">
                  <EmptyState
                    icon="history"
                    title="No hay verificaciones registradas"
                    description="Este certificado aún no ha sido verificado públicamente."
                  />
                </div>
                <q-timeline v-else color="primary" layout="comfortable" side="right">
                  <q-timeline-entry
                    v-for="verification in verificationHistory"
                    :key="verification.id"
                    :title="`Verificación #${verification.id.substring(0, 8)}`"
                    :subtitle="formatDateTime(verification.verifiedAt)"
                    icon="qr_code_scanner"
                    color="primary"
                  >
                    <div class="text-body2">
                      Verificado desde {{ verification.verifiedBy || 'IP desconocida' }}
                    </div>
                    <div v-if="verification.userAgent" class="text-caption text-grey-6 q-mt-xs">
                      {{ verification.userAgent }}
                    </div>
                  </q-timeline-entry>
                </q-timeline>
              </q-tab-panel>
            </q-tab-panels>
          </q-card-section>
        </q-card>
      </div>

      <!-- Sidebar -->
      <div class="col-12 col-md-4">
        <q-card flat bordered class="sticky-sidebar">
          <q-card-section>
            <div class="text-subtitle1 q-mb-md text-weight-medium">Acciones Rápidas</div>
            <div class="column q-gutter-sm">
              <q-btn
                color="primary"
                unelevated
                icon="download"
                label="Descargar PDF"
                class="full-width"
                @click="downloadPDF"
              />

              <q-btn
                flat
                color="primary"
                icon="qr_code_scanner"
                label="Verificar Públicamente"
                class="full-width"
                @click="openPublicVerification"
              />
            </div>

            <q-separator class="q-my-md" />

            <div class="text-subtitle2 q-mb-sm text-weight-medium">Estado del Certificado</div>
            <q-card flat bordered class="q-pa-md bg-grey-1">
              <div class="row items-center q-gutter-sm q-mb-sm">
                <q-icon
                  :name="certificate.status === 'valid' ? 'check_circle' : 'cancel'"
                  :color="certificate.status === 'valid' ? 'positive' : 'negative'"
                  size="32px"
                />
                <div class="col">
                  <div class="text-body1 text-weight-medium">
                    {{ certificate.status === 'valid' ? 'Certificado Válido' : 'Certificado Vencido' }}
                  </div>
                  <div class="text-caption text-grey-6">
                    {{ getValidityMessage(certificate.expiryDate) }}
                  </div>
                </div>
              </div>
              <q-linear-progress
                :value="getValidityProgress(certificate.expiryDate)"
                rounded
                size="8px"
                :color="getValidityColor(certificate.expiryDate)"
                class="q-mt-sm"
              />
            </q-card>

            <q-separator class="q-my-md" />

            <div class="text-subtitle2 q-mb-sm text-weight-medium">Información Adicional</div>
            <q-list dense>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="verified" color="primary" size="20px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Certificado Digital</q-item-label>
                  <q-item-label>Verificable en línea</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="certificate.isRetroactive">
                <q-item-section avatar>
                  <q-icon name="history" color="info" size="20px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Fecha Retroactiva</q-item-label>
                  <q-item-label>{{ formatDate(certificate.retroactiveDate || certificate.issuedDate) }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="certificate.digitalSignature">
                <q-item-section avatar>
                  <q-icon name="lock" color="positive" size="20px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Firma Digital</q-item-label>
                  <q-item-label>Verificada</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>



  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import certificateBg from '../../../assets/certificado_svg.svg';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import type { Certificate, CertificateVerificationHistory } from '../../../domain/certificate/models';
import EmptyState from '../../../shared/components/EmptyState.vue';
import QRCodeDisplay from '../../../shared/components/QRCodeDisplay.vue';
import { useCertificates } from '../../../shared/composables/useCertificates';
import { certificatesService } from '../../../infrastructure/http/certificates/certificates.service';


const route = useRoute();
const router = useRouter();
const $q = useQuasar();

// Composable para gestión de certificados
const {
  loading,
  currentCertificate: certificate,
  loadCertificate,
  downloadCertificatePDF,
} = useCertificates();

// Estado local
const tab = ref<'info' | 'verification' | 'history'>('info');
const certificateId = route.params.id as string;
const zoomLevel = ref(1);
const isFullscreen = ref(false);
const viewerContainer = ref<HTMLElement | null>(null);

// URL del blob para mostrar el PDF en el iframe
const pdfViewerUrl = ref<string>('');
const loadingPDF = ref(false);

// Historial de verificaciones (mock por ahora, puede conectarse al backend después)
const verificationHistory = ref<CertificateVerificationHistory[]>([]);

// Funciones
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

function getValidityStatus(expiryDate: string): string {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) return 'Vencido';
  if (daysUntilExpiry <= 30) return 'Próximo a vencer';
  return 'Válido';
}

function getValidityColor(expiryDate: string): string {
  const status = getValidityStatus(expiryDate);
  if (status === 'Vencido') return 'negative';
  if (status === 'Próximo a vencer') return 'warning';
  return 'positive';
}

function getValidityMessage(expiryDate: string): string {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) {
    return `Vencido hace ${Math.abs(daysUntilExpiry)} día(s)`;
  }
  if (daysUntilExpiry <= 30) {
    return `Vence en ${daysUntilExpiry} día(s)`;
  }
  return `Válido hasta ${formatDate(expiryDate)}`;
}

function getValidityProgress(expiryDate: string): number {
  if (!certificate.value) return 0;
  const expiry = new Date(expiryDate);
  const issued = new Date(certificate.value.issuedDate);
  const now = new Date();

  const totalDays = (expiry.getTime() - issued.getTime()) / (1000 * 60 * 60 * 24);
  const remainingDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  if (remainingDays < 0) return 0;
  return Math.max(0, Math.min(1, remainingDays / totalDays));
}

function zoomIn() {
  if (zoomLevel.value < 2) {
    zoomLevel.value = Math.min(2, zoomLevel.value + 0.25);
  }
}

function zoomOut() {
  if (zoomLevel.value > 0.5) {
    zoomLevel.value = Math.max(0.5, zoomLevel.value - 0.25);
  }
}

function resetZoom() {
  zoomLevel.value = 1;
}

// Nota: El zoom ahora se maneja con CSS transform en el contenedor
// pero para PDFs en iframe, es mejor usar el zoom del navegador o el viewer

function toggleFullscreen() {
  if (!viewerContainer.value) return;

  if (!isFullscreen.value) {
    if (viewerContainer.value.requestFullscreen) {
      void viewerContainer.value.requestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      void document.exitFullscreen();
    }
  }
  isFullscreen.value = !isFullscreen.value;
}

async function downloadPDF() {
  if (!certificate.value) {
    $q.notify({
      type: 'negative',
      message: 'Certificado no disponible',
      position: 'top',
    });
    return;
  }

  try {
    await downloadCertificatePDF(certificate.value.id);
    $q.notify({
      type: 'positive',
      message: 'Certificado descargado exitosamente',
      position: 'top',
    });
  } catch (error) {
    console.error('Error al descargar certificado:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al descargar el certificado',
      position: 'top',
    });
  }
}





function copyVerificationCode() {
  if (!certificate.value) return;
  void navigator.clipboard.writeText(certificate.value.verificationCode);
  $q.notify({
    type: 'positive',
    message: 'Código de verificación copiado al portapapeles',
    position: 'top',
  });
}



function openPublicVerification() {
  if (!certificate.value) return;
  // Construir la URL completa si es relativa
  const url = certificate.value.publicVerificationUrl.startsWith('http')
    ? certificate.value.publicVerificationUrl
    : `${window.location.origin}${certificate.value.publicVerificationUrl}`;
  window.open(url, '_blank');
}

function goBack() {
  void router.push('/certificates');
}

// Computed para obtener el valor del QR
const getQRValue = computed(() => {
  if (!certificate.value) {
    console.log('🔍 getQRValue: certificate.value es null');
    return null;
  }
  
  console.log('🔍 getQRValue - Datos del certificado:', {
    tieneQRCodeUrl: !!certificate.value.qrCodeUrl,
    qrCodeUrlLength: certificate.value.qrCodeUrl?.length || 0,
    tieneVerificationCode: !!certificate.value.verificationCode,
    verificationCode: certificate.value.verificationCode,
    tienePublicVerificationUrl: !!certificate.value.publicVerificationUrl,
    publicVerificationUrl: certificate.value.publicVerificationUrl,
  });
  
  // Si tenemos el código QR base64 del backend, usarlo directamente
  if (certificate.value.qrCodeUrl) {
    console.log('✅ Usando qrCodeUrl del backend');
    return certificate.value.qrCodeUrl;
  }
  
  // Si no hay QR base64, generar uno desde la URL de verificación
  // Prioridad: verificationCode > publicVerificationUrl
  if (certificate.value.verificationCode) {
    // Si tenemos el código, construir la URL completa para el QR
    const baseUrl = window.location.origin;
    const verificationPath = certificate.value.publicVerificationUrl || `/verify/${certificate.value.verificationCode}`;
    const qrValue = verificationPath.startsWith('http') 
      ? verificationPath 
      : `${baseUrl}${verificationPath}`;
    console.log('✅ Generando QR desde verificationCode:', qrValue);
    return qrValue;
  }
  
  if (certificate.value.publicVerificationUrl) {
    const url = certificate.value.publicVerificationUrl;
    const qrValue = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    console.log('✅ Generando QR desde publicVerificationUrl:', qrValue);
    return qrValue;
  }
  
  console.warn('⚠️ No hay datos para generar el QR');
  return null;
});

/**
 * Carga el PDF del certificado como blob URL para visualización
 */
async function loadPDFForView() {
  if (!certificate.value) return;
  
  loadingPDF.value = true;
  try {
    // Obtener el PDF como blob usando el servicio autenticado
    const blob = await certificatesService.getPDFForView(certificate.value.id);
    
    // Crear blob URL para el iframe
    pdfViewerUrl.value = window.URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error al cargar PDF para visualización:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar el certificado para visualización',
      icon: 'error',
      position: 'top',
    });
  } finally {
    loadingPDF.value = false;
  }
}

// Lifecycle
onMounted(async () => {
  if (certificateId) {
    await loadCertificate(certificateId);
    // Cargar el PDF después de cargar el certificado
    await loadPDFForView();
  } else {
    $q.notify({
      type: 'negative',
      message: 'ID de certificado no válido',
      icon: 'error',
      position: 'top',
    });
    void router.push('/certificates');
  }
});

onUnmounted(() => {
  // Limpiar blob URL para liberar memoria
  if (pdfViewerUrl.value) {
    window.URL.revokeObjectURL(pdfViewerUrl.value);
  }
  
  if (isFullscreen.value && document.exitFullscreen) {
    void document.exitFullscreen();
  }
});
</script>

<style scoped lang="scss">
.certificate-detail-page {
  background: #f9fafb;
  transition: background-color 0.3s ease;
}

body.body--dark .certificate-detail-page {
  background: #0f172a;
}

.sticky-sidebar {
  position: sticky;
  top: 100px;
  z-index: 1;
}

.certificate-viewer-container {
  position: relative;
  overflow: hidden;
}

.viewer-toolbar {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

body.body--dark .viewer-toolbar {
  background: rgba(30, 27, 75, 0.8) !important;
  border-bottom: 1px solid rgba(79, 70, 229, 0.2);
}

.certificate-viewer {
  position: relative;
  overflow: auto;
  max-height: 70vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.pdf-iframe {
  width: 100%;
  min-height: 500px; // Ajustado para formato horizontal (landscape)
  height: 100vh;
  max-height: 70vh;
  border: none;
  background: #f5f5f5;
  aspect-ratio: 792 / 612; // Proporción del certificado horizontal (ancho/alto)
}

.certificate-image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px;
  min-height: 400px;
}

code {
  background: rgba(79, 70, 229, 0.1);
  padding: 8px 12px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

body.body--dark code {
  background: rgba(79, 70, 229, 0.2);
  color: #a78bfa;
}
</style>

<style lang="scss" scoped>
.certificate-html-view {
  width: 1056px; /* Reduced from 1122px (A4 landscape at 96dpi) to fit better or match aspect ratio */
  height: 816px; /* LETTER Landscape aspect ratio approx */
  background-size: cover; /* Or contain depending on SVG exact size */
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  color: #000;
  font-family: 'Helvetica', 'Arial', sans-serif;
  overflow: hidden;
  margin: 20px auto;
}

.certificate-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 180px; /* Adjust based on SVG header height */
  text-align: center;
}

.cert-title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #333;
}

.cert-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cert-text {
  font-size: 16px;
  margin: 5px 0;
}

.cert-student-name {
  font-size: 28px;
  font-weight: bold;
  margin: 15px 0;
  border-bottom: 2px solid #333;
  padding-bottom: 5px;
  min-width: 400px;
}

.cert-course-name {
  font-size: 24px;
  font-weight: bold;
  margin: 15px 0;
  color: #1976d2; /* Primary color */
}

.cert-footer {
  width: 100%;
  height: 200px; /* Adjust height for footer area */
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 80px 60px 80px; /* Margins to position elements inside boxes */
}

.cert-signature-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  width: 250px;
}

.cert-signature-img {
  max-width: 200px;
  max-height: 80px;
}

.cert-signature-placeholder .line {
  width: 200px;
  height: 1px;
  background-color: #000;
  margin-bottom: 5px;
}

.cert-qr-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* Position absolute if needed to match exact box in SVG */
  position: absolute;
  bottom: 80px; 
  right: 80px;
}

.cert-verification-code {
  font-size: 10px;
  margin-top: 4px;
}
</style>

<template>
  <q-page class="certificate-detail-page q-pa-xl">
    <q-inner-loading :showing="loading" />

    <!-- Header -->
    <div class="row items-center justify-between q-mb-xl">
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
      <div class="row q-gutter-sm">
        <q-btn
          flat
          color="primary"
          icon="share"
          label="Compartir"
          @click="showShareMenu"
        />
        <q-btn
          color="primary"
          unelevated
          icon="download"
          label="Descargar PDF"
          @click="downloadPDF"
        />
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <!-- Main Content -->
      <div class="col-12 col-md-8">
        <!-- Certificate Viewer -->
        <q-card flat bordered class="q-mb-lg">
          <q-card-section class="q-pa-none">
            <!-- PDF Viewer -->
            <div v-if="certificate.pdfUrl" class="certificate-viewer-container">
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
                :style="{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }"
              >
                <!-- PDF Viewer usando iframe (mock) -->
                <iframe
                  :src="certificate.pdfUrl"
                  class="pdf-iframe"
                  frameborder="0"
                />
                <!-- Alternativa: Mostrar imagen del certificado si no hay PDF -->
                <div v-if="!certificate.pdfUrl" class="certificate-image-placeholder">
                  <q-icon name="picture_as_pdf" size="64px" color="grey-4" class="q-mb-md" />
                  <div class="text-h6 text-grey-6">Vista previa del certificado</div>
                  <div class="text-body2 text-grey-6 q-mt-sm">
                    El certificado se generará al descargar el PDF
                  </div>
                </div>
              </div>
            </div>

            <!-- Certificate Info (si no hay PDF) -->
            <div v-else class="q-pa-xl text-center">
              <q-icon name="verified" size="80px" color="primary" class="q-mb-md" />
              <div class="text-h6 q-mb-sm">Certificado Válido</div>
              <div class="text-body2 text-grey-7">
                Este certificado puede ser verificado públicamente usando el código QR o el código de
                verificación.
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
                          <q-item-label>{{ certificate.durationHours || 'N/A' }} horas</q-item-label>
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
                    <div class="row items-center q-gutter-md">
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
                  </q-card>

                  <div class="text-subtitle1 text-weight-medium q-mt-lg">Código QR</div>
                  <q-card flat bordered class="q-pa-lg">
                    <q-img
                      v-if="certificate.qrCodeUrl"
                      :src="certificate.qrCodeUrl"
                      :ratio="1"
                      style="max-width: 250px"
                      class="rounded-borders"
                    />
                    <div v-else class="text-center q-pa-xl">
                      <q-icon name="qr_code" size="64px" color="grey-4" class="q-mb-md" />
                      <div class="text-body2 text-grey-6">QR Code no disponible</div>
                    </div>
                  </q-card>

                  <div class="text-body2 text-grey-7 q-mt-md text-center">
                    Comparte este código o escanea el QR para verificar la autenticidad del certificado
                  </div>

                  <div class="row q-gutter-sm q-mt-md">
                    <q-btn
                      color="primary"
                      unelevated
                      icon="share"
                      label="Compartir Enlace"
                      @click="shareVerificationLink"
                    />
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
                icon="share"
                label="Compartir"
                class="full-width"
                @click="showShareMenu"
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

    <!-- Share Menu -->
    <q-menu
      ref="shareMenu"
      :model-value="showShareMenuDialog"
      @update:model-value="showShareMenuDialog = $event"
    >
      <q-list>
        <q-item clickable v-close-popup @click="copyVerificationLink">
          <q-item-section avatar>
            <q-icon name="content_copy" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Copiar Enlace</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="copyVerificationCode">
          <q-item-section avatar>
            <q-icon name="qr_code" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Copiar Código</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="shareViaEmail">
          <q-item-section avatar>
            <q-icon name="email" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Compartir por Email</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="shareViaWhatsApp">
          <q-item-section avatar>
            <q-icon name="chat" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Compartir por WhatsApp</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import type { Certificate, CertificateVerificationHistory } from '../../../domain/certificate/models';
import EmptyState from '../../../shared/components/EmptyState.vue';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

// Estado
const loading = ref(false);
const tab = ref<'info' | 'verification' | 'history'>('info');
const certificateId = route.params.id as string;
const zoomLevel = ref(1);
const isFullscreen = ref(false);
const showShareMenuDialog = ref(false);
const viewerContainer = ref<HTMLElement | null>(null);
const shareMenu = ref();

const certificate = ref<Certificate>({
  id: certificateId,
  courseId: '1',
  courseName: 'Primeros Auxilios',
  studentId: '1',
  studentName: 'Juan Pérez',
  documentNumber: '12345678',
  instructor: '1',
  instructorName: 'Dr. María González',
  issuedDate: '2025-01-15',
  expiryDate: '2026-01-15',
  isRetroactive: false,
  score: 85,
  minimumScore: 70,
  status: 'valid',
  verificationCode: 'ABC123XYZ789',
  qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ABC123XYZ789',
  publicVerificationUrl: '/verify/ABC123XYZ789',
  pdfUrl: '/certificates/1.pdf',
  createdAt: '2025-01-15',
});

const verificationHistory = ref<CertificateVerificationHistory[]>([
  {
    id: 'v1',
    certificateId: certificateId,
    verifiedAt: '2025-01-20T10:30:00Z',
    verifiedBy: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
  },
  {
    id: 'v2',
    certificateId: certificateId,
    verifiedAt: '2025-01-18T14:20:00Z',
    verifiedBy: '192.168.1.2',
  },
]);

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

function downloadPDF() {
  // Aquí se llamaría al servicio HTTP para descargar el certificado PDF
  console.log('Descargar certificado PDF:', certificateId);
  $q.notify({
    type: 'positive',
    message: 'Certificado descargado exitosamente',
    position: 'top',
  });
}

function showShareMenu() {
  showShareMenuDialog.value = true;
}

function copyVerificationLink() {
  const link = `${window.location.origin}${certificate.value.publicVerificationUrl}`;
  void navigator.clipboard.writeText(link);
  $q.notify({
    type: 'positive',
    message: 'Enlace de verificación copiado al portapapeles',
    position: 'top',
  });
  showShareMenuDialog.value = false;
}

function copyVerificationCode() {
  void navigator.clipboard.writeText(certificate.value.verificationCode);
  $q.notify({
    type: 'positive',
    message: 'Código de verificación copiado al portapapeles',
    position: 'top',
  });
  showShareMenuDialog.value = false;
}

function shareVerificationLink() {
  copyVerificationLink();
}

function shareViaEmail() {
  const subject = encodeURIComponent(`Verificación de Certificado - ${certificate.value.courseName}`);
  const body = encodeURIComponent(
    `Te comparto mi certificado de ${certificate.value.courseName}.\n\nPuedes verificarlo en: ${window.location.origin}${certificate.value.publicVerificationUrl}`,
  );
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
  showShareMenuDialog.value = false;
}

function shareViaWhatsApp() {
  const text = encodeURIComponent(
    `Te comparto mi certificado de ${certificate.value.courseName}. Verifícalo aquí: ${window.location.origin}${certificate.value.publicVerificationUrl}`,
  );
  window.open(`https://wa.me/?text=${text}`, '_blank');
  showShareMenuDialog.value = false;
}

function openPublicVerification() {
  window.open(certificate.value.publicVerificationUrl, '_blank');
}

function goBack() {
  void router.push('/certificates');
}

// Lifecycle
onMounted(() => {
  loading.value = true;
  // Simular carga de datos
  setTimeout(() => {
    if (!certificate.value.durationHours) {
      certificate.value.durationHours = 8; // Valor por defecto
    }
    loading.value = false;
  }, 500);
});

onUnmounted(() => {
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
  transition: transform 0.3s ease;
}

.pdf-iframe {
  width: 100%;
  min-height: 800px;
  border: none;
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

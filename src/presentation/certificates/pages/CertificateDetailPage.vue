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
                    
                    <!-- LOGO DINAMICO -->
                    <div class="cert-logo-container">
                        <img :src="logoSrc" class="cert-logo-img" alt="Logo" />
                    </div>

                    <!-- 1. Main Title -->
                    <div class="cert-main-title">CERTIFICADO DE APROBACIÓN</div>

                    <!-- 2. Header Stack -->
                    <div class="cert-header-group">
                      <div class="cert-text-sm">Otorgado por</div>
                      <div class="cert-text-lg-bold">FORMAR360</div>
                    </div>
                    
                    <!-- 3. Certifica Que -->
                    <div class="cert-certifica-row">
                      <div class="cert-line"></div>
                      <div class="cert-text-gray">CERTIFICA QUE:</div>
                      <div class="cert-line"></div>
                    </div>

                    <!-- 4. Student Name -->
                    <h2 class="cert-student-name">{{ certificate.studentName.toUpperCase() }}</h2>
                    <p class="cert-text">Cédula de ciudadanía N.° {{ certificate.documentNumber }}</p>
                    
                    <!-- 5. Description -->
                    <p class="cert-description">Ha realizado y aprobado satisfactoriamente el curso de:</p>

                    <!-- 6. Course Name (Blue Box) -->
                    <div class="cert-course-box">
                      {{ certificate.courseName.toUpperCase() }}
                    </div>
                    
                    <!-- 7. Details -->
                    <div class="cert-details">
                      <p>Con una intensidad de {{ certificate.durationHours || 20 }} horas</p>
                      <p>Resolucion: 0000000000</p>
                    </div>

                    <div class="cert-push-bottom"></div>

                    <!-- 8. Footer -->
                    <div class="cert-footer-row">
                      
                      <!-- Left Sig: Anderson -->
                      <div class="cert-sig-col">
                         <svg class="cert-scribble" viewBox="0 0 150 60">
                           <path d="M10,40 C30,10 60,70 90,30 S140,50 140,40" stroke="#000066" stroke-width="2" fill="none" />
                         </svg>
                         <div class="cert-sig-line"></div>
                         <div class="cert-sig-name">Anderson Herrera Díaz</div>
                         <div class="cert-sig-role">Instructor / Entrenador<br>TSA REG 37544429<br>Licencia SST</div>
                      </div>

                      <!-- Right Sig: Edwin -->
                      <div class="cert-sig-col">
                         <svg class="cert-scribble" viewBox="0 0 150 60">
                            <path d="M20,40 C50,20 60,60 100,20 S130,50 130,30" stroke="#000066" stroke-width="2" fill="none" />
                         </svg>
                         <div class="cert-sig-line"></div>
                         <div class="cert-sig-name">Edwin Julian Parra Morales</div>
                         <div class="cert-sig-role">Representante Legal<br>ANDAR DEL LLANO</div>
                      </div>

                      <!-- QR Code -->
                       <div class="cert-qr-container">
                          <QRCodeDisplay
                            v-if="getQRValue"
                            :value="getQRValue"
                            :size="90"
                            :show-border="false"
                            :show-background="false"
                            :show-info="false"
                            :show-actions="false"
                          />
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
                    <div class="row q-col-gutter-sm justify-center q-mt-md no-print">
                    <div class="col-12 col-sm-auto">
                      <q-btn
                        color="primary"
                        icon="download"
                        label="Descargar PDF"
                        :href="getDownloadUrl(certificate)"
                        target="_blank"
                        unelevated
                      />
                    </div>
                    <div class="col-12 col-sm-auto">
                      <q-btn
                        outline
                        color="primary"
                        icon="qr_code"
                        label="Verificar"
                        @click="showQrDialog = true"
                      />
                    </div>
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
import logoAndar from '../../../assets/andar.png';
import logoSaroto from '../../../assets/saroto.jpeg';
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

// LOGICA DE LOGO DINAMICO
const logoSrc = computed(() => {
  if (!certificate.value) return logoAndar;
  
  const title = (certificate.value.courseName || '').toLowerCase().trim();
  // Misma validación que el backend
  const contieneSustancias = title.includes('sustancias');
  const contienePeligrosas = title.includes('peligrosas');

  if (contieneSustancias && contienePeligrosas) {
      return logoSaroto;
  }
  return logoAndar;
});

// Funciones
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getDownloadUrl = (cert: Certificate) => {
  // Si ya tiene la URL dinámica (generada por el backend nuevo)
  if (cert.pdfUrl && cert.pdfUrl.includes('/public/certificates/download/')) {
      return cert.pdfUrl;
  }
  
  // Fallback para certificados antiguos (zombies) o si la URL es estática/antigua
  // Forzamos el uso del nuevo endpoint dinámico usando el hash (verificationCode)
  return `${import.meta.env.VITE_API_URL}/public/certificates/download/${cert.verificationCode}`;
};

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
  if (daysUntilExpiry <= 30) {
    return `Vence en ${daysUntilExpiry} día(s)`;
  }
  return `Válido hasta ${formatDate(expiryDate)}`;
}

/**
 * Determina la URL base correcta.
 * - Si estamos en localhost, usa el origen local (dev).
 * - Si estamos en producción (no localhost), usa la variable de entorno configurada.
 * Esto permite probar en dev sin que te mande a producción, pero asegura que en prod
 * se usen los dominios correctos.
 */
function getBaseUrl(): string {
  const hostname = window.location.hostname;
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
  
  if (isLocal) {
    return window.location.origin;
  }
  
  return import.meta.env.VITE_FRONTEND_URL || window.location.origin;
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
  
  const baseUrl = getBaseUrl();
  const code = certificate.value.verificationCode;
  
  if (!code && certificate.value.publicVerificationUrl?.startsWith('http')) {
      window.open(certificate.value.publicVerificationUrl, '_blank');
      return;
  }
  
  if (code) {
    const routeLocation = router.resolve({ path: `/verify/${code}` });
    const href = routeLocation.href;
    
    // href es relativo al root del dominio (ej: "#/verify/..." o "/verify/...")
    // Usamos new URL para asegurar que se combina correctamente con el origen sin duplicar paths
    try {
      const finalUrl = new URL(href, baseUrl).href;
      console.log('🔗 Abriendo verificación:', finalUrl);
      window.open(finalUrl, '_blank');
    } catch (e) {
      console.error('Error constructing URL:', e);
      // Fallback seguro
      window.open(`${baseUrl}${href.startsWith('/') ? '' : '/'}${href}`, '_blank');
    }
  }
}

// ... (skipping goBack)

// Computed para obtener el valor del QR
const getQRValue = computed(() => {
  if (!certificate.value) return null;
  
  if (certificate.value.qrCodeUrl && certificate.value.qrCodeUrl.startsWith('data:')) {
    return certificate.value.qrCodeUrl;
  }
  
  if (certificate.value.verificationCode) {
      const code = certificate.value.verificationCode;
      const baseUrl = getBaseUrl();
      const routeLocation = router.resolve({ path: `/verify/${code}` });
      const href = routeLocation.href;
      
      try {
        const finalUrl = new URL(href, baseUrl).href;
        console.log('✅ QR Generado:', finalUrl);
        return finalUrl;
      } catch (e) {
         console.error('Error QR:', e);
         return `${baseUrl}${href.startsWith('/') ? '' : '/'}${href}`;
      }
  }
  
  if (certificate.value.publicVerificationUrl?.startsWith('http')) {
    return certificate.value.publicVerificationUrl;
  }
  
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
  width: 1056px; 
  height: 816px; 
  background-size: cover; 
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
  padding-top: 130px; 
  text-align: center;
}

/* Header Typography */
.cert-header-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 5px;
}
.cert-text-sm {
  font-size: 13px;
  color: #000;
  margin: 1px 0;
  line-height: 1.2;
}
.cert-text-lg-bold {
  font-size: 16px;
  font-weight: bold;
  color: #000;
  margin-bottom: 2px;
}
.cert-text-md-bold {
  font-size: 16px;
  font-weight: bold;
  color: #000;
  margin-bottom: 2px;
}

/* Main Title */
.cert-main-title {
  font-size: 30px;
  font-weight: bold;
  color: #0D47A1;
  margin-top: 15px;
  margin-bottom: 20px;
}

/* Certifica Que */
.cert-certifica-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  width: 100%;
  margin-bottom: 15px;
}
.cert-line {
  width: 50px;
  height: 1px;
  background-color: #999999;
}
.cert-text-gray {
  font-size: 12px;
  color: #666666;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Student */
.cert-student-name {
  font-size: 34px;
  font-weight: bold;
  color: #0D47A1;
  margin: 5px 0 10px 0;
  text-transform: uppercase;
  max-width: 850px;
  line-height: 1.1;
}

.cert-text {
  font-size: 14px;
  color: #000;
  margin: 5px 0;
}

/* Description */
.cert-description {
  font-size: 14px;
  color: #444;
  margin-top: 15px;
  margin-bottom: 15px;
}

/* Redesigned Course Box */
.cert-course-box {
  background-color: #0D47A1;
  color: white;
  font-size: 18px;
  font-weight: bold;
  padding: 8px 30px;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  display: inline-block;
  max-width: 80%;
}

.cert-details p {
  margin: 2px 0;
  font-size: 13px;
}

/* Spacer */
.cert-push-bottom {
  flex-grow: 1;
}

/* Footer Grid */
.cert-footer-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
  padding: 0 100px 70px 100px;
  position: relative;
}

.cert-sig-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  width: 200px;
}

.cert-scribble {
  position: absolute;
  bottom: 35px;
  width: 120px;
  height: 60px;
  z-index: 1;
  opacity: 0.8;
  pointer-events: none;
}

.cert-sig-line {
  width: 100%;
  height: 1px;
  background-color: #000;
  margin-bottom: 5px;
}

.cert-sig-name {
  font-size: 13px;
  font-weight: bold;
  text-align: center;
}

.cert-sig-role {
  font-size: 9px;
  text-align: center;
  line-height: 1.3;
  color: #333;
}

.cert-qr-container {
  position: absolute;
  bottom: 80px; 
  right: 45px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Logo Styles */
.cert-logo-container {
    display: flex;
    justify-content: center;
    margin-bottom: 5px; /* Adjust spacing as needed */
    z-index: 10;
}

.cert-logo-img {
    width: 120px;
    height: auto;
    object-fit: contain;
}
</style>

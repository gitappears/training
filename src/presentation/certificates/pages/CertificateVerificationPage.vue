<template>
  <q-page class="certificate-verification-page">
    <div class="verification-container">
      <!-- Header con Branding -->
      <div class="verification-header">
        <div class="brand-section">
          <q-icon name="verified" size="64px" color="primary" class="q-mb-md" />
          <div class="text-h4 text-weight-bold text-white q-mb-xs">Formar 360</div>
          <div class="text-subtitle1 text-white-7">Verificación de Certificados</div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="verification-content">
        <q-card class="verification-card" flat bordered>
          <q-inner-loading :showing="loading" />

          <!-- Search Section (si no hay certificado) -->
          <div v-if="!certificate && !loading" class="verification-search q-mb-lg">
            <div class="text-h6 text-weight-medium q-mb-md text-center">
              Verificar Certificado
            </div>
            <div class="text-body2 text-grey-7 q-mb-lg text-center">
              Ingresa el código de verificación o escanea el código QR del certificado
            </div>

            <div class="row q-col-gutter-md">
              <!-- Input de búsqueda -->
              <div class="col-12 col-md-8">
                <q-input
                  v-model="searchCode"
                  filled
                  label="Código de Verificación"
                  placeholder="Ej: ABC123XYZ789"
                  :disable="scanning"
                  @keyup.enter="verifyCertificate"
                >
                  <template #prepend>
                    <q-icon name="qr_code_scanner" />
                  </template>
                  <template #append>
                    <q-btn
                      v-if="searchCode"
                      flat
                      dense
                      round
                      icon="clear"
                      @click="searchCode = ''"
                    />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-4">
                <q-btn
                  color="primary"
                  unelevated
                  label="Verificar"
                  icon="search"
                  class="full-width"
                  :loading="verifying"
                  :disable="!searchCode || scanning"
                  @click="verifyCertificate"
                />
              </div>
            </div>

            <q-separator class="q-my-lg" />

            <!-- QR Scanner -->
            <div class="qr-scanner-section">
              <div class="text-subtitle2 text-weight-medium q-mb-md text-center">
                O escanea el código QR
              </div>
              <div class="row justify-center">
                <q-card flat bordered class="scanner-card">
                  <q-card-section class="text-center">
                    <div v-if="!scanning" class="scanner-placeholder">
                      <q-icon name="qr_code_scanner" size="64px" color="primary" class="q-mb-md" />
                      <q-btn
                        color="primary"
                        unelevated
                        label="Activar Escáner"
                        icon="camera_alt"
                        @click="startScanning"
                      />
                      <div class="text-caption text-grey-6 q-mt-md">
                        Permite el acceso a la cámara para escanear el código QR
                      </div>
                    </div>
                    <div v-else class="scanner-active">
                      <div class="scanner-viewfinder">
                        <div class="viewfinder-border"></div>
                        <div class="scanner-instructions">
                          <q-icon name="qr_code_scanner" size="48px" color="white" class="q-mb-sm" />
                          <div class="text-body2 text-white text-weight-medium">
                            Apunta la cámara al código QR
                          </div>
                        </div>
                      </div>
                      <q-btn
                        flat
                        color="negative"
                        label="Cancelar Escaneo"
                        icon="close"
                        class="q-mt-md"
                        @click="stopScanning"
                      />
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>

          <!-- Success State -->
          <div v-if="!loading && certificate" class="verification-result">
            <div class="result-icon q-mb-lg">
              <q-icon name="check_circle" size="120px" color="positive" />
            </div>
            <div class="text-h4 text-weight-bold text-positive q-mb-sm text-center">
              Certificado Verificado
            </div>
            <div class="text-body1 text-grey-7 text-center q-mb-xl">
              Este certificado es válido y ha sido emitido por nuestra plataforma de capacitación.
            </div>

            <!-- Certificate Details -->
            <q-separator class="q-mb-lg" />

            <div class="certificate-details">
              <div class="text-subtitle1 text-weight-medium q-mb-md">Información del Certificado</div>

              <div class="row q-col-gutter-lg">
                <div class="col-12 col-md-6">
                  <q-list bordered separator class="rounded-borders">
                    <q-item>
                      <q-item-section avatar>
                        <q-icon name="person" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label caption>Nombre Completo</q-item-label>
                        <q-item-label class="text-weight-medium">{{ certificate.studentName }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section avatar>
                        <q-icon name="badge" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label caption>Número de Documento</q-item-label>
                        <q-item-label class="text-weight-medium">{{ certificate.documentNumber }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section avatar>
                        <q-icon name="school" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label caption>Curso</q-item-label>
                        <q-item-label class="text-weight-medium">{{ certificate.courseName }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>

                <div class="col-12 col-md-6">
                  <q-list bordered separator class="rounded-borders">
                    <q-item>
                      <q-item-section avatar>
                        <q-icon name="event" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label caption>Fecha de Emisión</q-item-label>
                        <q-item-label class="text-weight-medium">
                          {{ formatDate(certificate.issuedDate) }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section avatar>
                        <q-icon name="event_busy" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label caption>Fecha de Vencimiento</q-item-label>
                        <q-item-label class="text-weight-medium">
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
                        <q-icon name="person" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label caption>Instructor</q-item-label>
                        <q-item-label class="text-weight-medium">{{ certificate.instructorName }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>

              <!-- QR Code Mejorado -->
              <div class="row justify-center q-mt-xl">
                <q-card flat bordered class="qr-card q-pa-lg">
                  <div class="text-subtitle2 text-weight-medium q-mb-md text-center">
                    Código de Verificación
                  </div>
                  <div class="row justify-center q-mb-md">
                    <QRCodeDisplay
                      :value="certificate.verificationCode || certificate.publicVerificationUrl"
                      :size="200"
                    />
                  </div>
                  <code class="verification-code">{{ certificate.verificationCode }}</code>
                  <div class="text-caption text-grey-6 text-center q-mt-md">
                    Escanea el código QR o usa el código de verificación para validar este certificado
                  </div>
                  <div class="row q-gutter-sm q-mt-md justify-center">
                    <q-btn
                      flat
                      dense
                      size="sm"
                      icon="content_copy"
                      label="Copiar Código"
                      @click="copyCode"
                    />
                    <q-btn
                      flat
                      dense
                      size="sm"
                      icon="share"
                      label="Compartir"
                      @click="shareVerification"
                    />
                  </div>
                </q-card>
              </div>

              <!-- Security Notice -->
              <q-banner rounded class="bg-info q-mt-lg">
                <template #avatar>
                  <q-icon name="security" color="white" />
                </template>
                <div class="text-body2 text-white">
                  <strong>Nota de Seguridad:</strong> Este certificado ha sido verificado digitalmente y
                  contiene una firma digital que garantiza su autenticidad. Cualquier modificación invalidará
                  el certificado.
                </div>
              </q-banner>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="!loading && !certificate" class="verification-result">
            <div class="result-icon q-mb-lg">
              <q-icon name="error" size="120px" color="negative" />
            </div>
            <div class="text-h4 text-weight-bold text-negative q-mb-sm text-center">
              Certificado No Encontrado
            </div>
            <div class="text-body1 text-grey-7 text-center q-mb-xl">
              El código de verificación no corresponde a un certificado válido en nuestro sistema.
            </div>

            <q-separator class="q-mb-lg" />

            <div class="text-center q-mt-xl">
              <div class="text-body2 text-grey-6 q-mb-md">
                Posibles razones:
              </div>
              <q-list bordered separator class="rounded-borders text-left">
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="info" color="grey-6" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>El código de verificación es incorrecto o ha sido modificado</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="info" color="grey-6" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>El certificado ha sido revocado o eliminado del sistema</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="info" color="grey-6" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>El certificado pertenece a otra plataforma o sistema</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>

              <div class="q-mt-xl">
                <q-btn
                  color="primary"
                  unelevated
                  label="Volver al Inicio"
                  icon="home"
                  @click="goHome"
                />
              </div>
            </div>
          </div>

          <!-- Support Contact -->
          <q-separator class="q-mt-xl" />
          <div class="support-section q-mt-lg">
            <div class="text-subtitle2 text-weight-medium q-mb-sm">¿Necesitas Ayuda?</div>
            <div class="text-body2 text-grey-7">
              Si tienes dudas sobre la verificación de este certificado o necesitas asistencia, contáctanos:
            </div>
            <div class="row q-gutter-md q-mt-md">
              <q-btn
                flat
                color="primary"
                icon="email"
                label="soporte@formar360.com"
                @click="sendEmail"
              />
              <q-btn
                flat
                color="primary"
                icon="phone"
                label="+57 1 234 5678"
                @click="callSupport"
              />
            </div>
          </div>
        </q-card>
      </div>

      <!-- Footer -->
      <div class="verification-footer">
        <div class="text-caption text-grey-6 text-center">
          © {{ new Date().getFullYear() }} Formar 360. Todos los derechos reservados.
        </div>
        <div class="text-caption text-grey-6 text-center q-mt-xs">
          Plataforma de Capacitación y Certificación
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import type { Certificate } from '../../../domain/certificate/models';
import QRCodeDisplay from '../../../shared/components/QRCodeDisplay.vue';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const verificationToken = route.params.token as string;

const certificate = ref<Certificate | null>(null);
const loading = ref(true);
const searchCode = ref('');
const verifying = ref(false);
const scanning = ref(false);
const scannerStream = ref<MediaStream | null>(null);

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

function goHome() {
  void router.push('/');
}

function sendEmail() {
  window.location.href = 'mailto:soporte@formar360.com?subject=Consulta sobre Verificación de Certificado';
}

function callSupport() {
  window.location.href = 'tel:+5712345678';
}

async function verifyCertificate() {
  if (!searchCode.value.trim()) {
    $q.notify({
      type: 'warning',
      message: 'Ingresa un código de verificación',
      position: 'top',
    });
    return;
  }

  verifying.value = true;
  loading.value = true;

  // Simular verificación
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (searchCode.value === 'ABC123XYZ789' || searchCode.value === 'ABC123XYZ') {
    certificate.value = {
      id: '1',
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
      verificationCode: searchCode.value,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${searchCode.value}`,
      publicVerificationUrl: `/verify/${searchCode.value}`,
      pdfUrl: '/certificates/1.pdf',
      createdAt: '2025-01-15',
    };
    $q.notify({
      type: 'positive',
      message: 'Certificado verificado correctamente',
      position: 'top',
    });
  } else {
    certificate.value = null;
    $q.notify({
      type: 'negative',
      message: 'Código de verificación no válido',
      position: 'top',
    });
  }

  verifying.value = false;
  loading.value = false;
}

async function startScanning() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
    });
    scannerStream.value = stream;
    scanning.value = true;
    // En una implementación completa, aquí se integraría una librería de escaneo QR
    // como jsQR o html5-qrcode
    $q.notify({
      type: 'info',
      message: 'Escáner activado. Apunta la cámara al código QR',
      position: 'top',
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'No se pudo acceder a la cámara. Verifica los permisos.',
      position: 'top',
    });
    console.error('Error accessing camera:', error);
  }
}

function stopScanning() {
  if (scannerStream.value) {
    scannerStream.value.getTracks().forEach((track) => track.stop());
    scannerStream.value = null;
  }
  scanning.value = false;
}

async function copyCode() {
  if (certificate.value?.verificationCode) {
    try {
      await navigator.clipboard.writeText(certificate.value.verificationCode);
      $q.notify({
        type: 'positive',
        message: 'Código copiado al portapapeles',
        position: 'top',
      });
    } catch {
      $q.notify({
        type: 'negative',
        message: 'Error al copiar el código',
        position: 'top',
      });
    }
  }
}

function shareVerification() {
  if (certificate.value?.publicVerificationUrl) {
    const url = `${window.location.origin}${certificate.value.publicVerificationUrl}`;
    if (navigator.share) {
      void navigator.share({
        title: 'Verificación de Certificado',
        text: `Verifica este certificado: ${certificate.value.courseName}`,
        url,
      });
    } else {
      void copyCode();
    }
  }
}

// Lifecycle
onMounted(async () => {
  // Si hay token en la URL, verificar automáticamente
  if (verificationToken && verificationToken !== 'undefined') {
    searchCode.value = verificationToken;
    await verifyCertificate();
  } else {
    loading.value = false;
  }
});

onUnmounted(() => {
  stopScanning();
});
</script>

<style scoped lang="scss">
.certificate-verification-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

body.body--dark .certificate-verification-page {
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
}

.verification-container {
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.verification-header {
  text-align: center;
  padding: 32px 24px;
}

.brand-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.verification-content {
  flex: 1;
}

.verification-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 32px;
}

body.body--dark .verification-card {
  background: rgba(30, 27, 75, 0.98);
}

.verification-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
}

.result-icon {
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.certificate-details {
  width: 100%;
}

.qr-card {
  background: rgba(79, 70, 229, 0.05);
  border-radius: 12px;
}

body.body--dark .qr-card {
  background: rgba(79, 70, 229, 0.15);
}

.verification-code {
  display: block;
  text-align: center;
  background: rgba(79, 70, 229, 0.1);
  padding: 12px 24px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 1.1em;
  font-weight: 600;
  color: #4f46e5;
  word-break: break-all;
}

body.body--dark .verification-code {
  background: rgba(79, 70, 229, 0.2);
  color: #a78bfa;
}

.verification-search {
  padding: 24px 0;
}

.qr-scanner-section {
  margin-top: 24px;
}

.scanner-card {
  max-width: 400px;
  width: 100%;
}

.scanner-placeholder {
  padding: 32px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.scanner-active {
  position: relative;
}

.scanner-viewfinder {
  position: relative;
  width: 100%;
  min-height: 300px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.viewfinder-border {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  border: 3px solid #4f46e5;
  border-radius: 12px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
}

.scanner-instructions {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 16px;
}

.support-section {
  padding: 24px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
}

body.body--dark .support-section {
  background: rgba(255, 255, 255, 0.02);
}

.verification-footer {
  text-align: center;
  padding: 24px;
}

// Responsive
@media (max-width: 600px) {
  .verification-card {
    padding: 16px;
  }

  .result-icon {
    :deep(.q-icon) {
      font-size: 80px !important;
    }
  }
}
</style>

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
          :loading="isDownloading"
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
                <!-- HTML Certificate View (Fixed Size 792x612 matching PDFKit Letter Landscape) -->
                <div class="certificate-scaler">
                  <div class="certificate-html-view" :style="{ backgroundImage: `url(${certificateBg})` }">
                    <div class="certificate-content">

                      <!-- 1. Student Name (Y ~230 based on code flow doc.y+=90 etc) -->
                      <!-- doc.y starts at 140. moves down. name is roughly at 230-240px -->
                      <div class="cert-element cert-student-name">
                        {{ certificate.studentName.toUpperCase() }}
                      </div>
                      
                      <div 
                        class="cert-element cert-document-id" 
                        :style="{ 
                          top: isCesaroto ? '304px' : '301px', 
                          left: isCesaroto ? '455px' : '85px',
                          textAlign: isCesaroto ? 'left' : 'center',
                          width: isCesaroto ? 'auto' : '100%'
                        }"
                      >
                        {{ certificate.documentNumber }}
                      </div>

                      <!-- 3. Course Name (Blue Box) Y ~350 -->
                      <!-- doc.y is calculated. Box is manually placed. -->
                      <div 
                        ref="courseBoxRef"
                        class="cert-element cert-course-box"
                        :style="{ fontSize: currentFontSize + 'pt' }"
                      >
                        <span ref="courseTextRef">{{ (certificate.courseName || '').toUpperCase() }}</span>
                      </div>

                    
                      <div 
                        class="cert-element cert-duration"
                        :style="{ left: isCesaroto ? '416px' : '418px', top: '406px' }"
                      >
                        {{ computedDuration }}
                      </div>

                      <!-- 5. Dates -->
                      <!-- Emission: X=-80, align center. Center shift left by 80. Real position ~316px -->
                      <div class="cert-element cert-date-mission">
                        {{ formattedIssuedDate }}
                      </div>

                      <!-- Expiration: X=186, align center. Center shift right by 186. Real position ~582px -->
                      <div v-if="formattedExpiryDate" class="cert-element cert-date-expiry">
                        {{ formattedExpiryDate }}.
                      </div>

                      <!-- 6. Signatures (Footer Y = 500) -->
                      <!-- Instructor (Col1 X = Center - 145 = 251) -->
                      <div class="cert-element cert-sig-instructor-image">
                          <!-- Image handling logic matching backend -->
                         <img :src="instructorDetails.signatureImage" style="max-height: 80px; max-width: 190px;" />
                      </div>
                      <div class="cert-element cert-sig-instructor-name">
                        {{ instructorDetails.name }}
                      </div>
                      <div class="cert-element cert-sig-instructor-role">
                        <span style="white-space: pre-line">{{ instructorDetails.role }}</span>
                      </div>
                    

                      <!-- Representative (Col2 X = Center + 115 = 511) -->
                      <div class="cert-element cert-sig-rep-image">
                          <img :src="representativeDetails.signatureImage" style="max-height: 61px; max-width: 145px;" />
                      </div>
                      <div class="cert-element cert-sig-rep-name">
                        {{ representativeDetails.name }}
                      </div>
                      <div class="cert-element cert-sig-rep-role">
                        Representante Legal
                      </div>
                   

                      <!-- 7. QR Code (X=688, Y=448.5) -->
                      <div class="cert-element cert-qr-code">
                         <QRCodeDisplay
                            v-if="getQRValue"
                            :value="getQRValue"
                            :size="70"
                            :show-border="false"
                            :show-background="false"
                            :show-info="false"
                            :show-actions="false"
                          />
                      </div>

                      <!-- 8. Footer Text (Y=576) -->
                      <div class="cert-element cert-footer-text">
                        Certificado emitido por <b>FORMAR360</b> en alianza con <b>{{ allianceCompany }}</b> La autenticidad de este documento puede verificarse escaneando el código QR.
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
                        :loading="isDownloading"
                        @click="downloadPDF"
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
                :loading="isDownloading"
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
                    {{
                      certificate.status === 'valid' ? 'Certificado Válido' :
                      certificate.status === 'revoked' ? 'Certificado Revocado' :
                      'Certificado Vencido'
                    }}
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

    <!-- Dialogo de Codigo QR -->
    <q-dialog v-model="showQrDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Verificar Certificado</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="column items-center">
            <QRCodeDisplay
              v-if="getQRValue"
              :value="getQRValue"
              :size="250"
            />
            <div class="text-caption text-grey-6 q-mt-md text-center">
              Escanea este código con tu celular para verificar la autenticidad del certificado.
            </div>

            <q-btn
              outline
              color="primary"
              label="Abrir enlace directo"
              icon="open_in_new"
              class="q-mt-md full-width"
              @click="openPublicVerification"
              v-close-popup
            />
        </q-card-section>
      </q-card>
    </q-dialog>

    <div class="cert-version-debug">v2026.01.21 - FIX OVERLAY</div>

    <!-- Download Progress Overlay - Custom Implementation -->
    <transition name="fade">
      <div v-if="isDownloading" class="download-overlay-container">
        <div class="overlay-content">
          <div class="training-loader">
            <div class="birrete-container">
              <q-icon name="school" size="100px" color="white" class="birrete-animation" />
            </div>
            <div class="book-loader q-mt-md">
              <div class="book-page"></div>
              <div class="book-page"></div>
              <div class="book-page"></div>
            </div>
          </div>
          <div class="text-h4 text-white text-weight-bold q-mt-xl text-center">
            Generando su Certificado...
          </div>
          <div class="text-subtitle1 text-white opacity-80 q-mt-sm text-center">
            Preparando material de capacitación profesional
          </div>
          
          <div class="progress-bar-container q-mt-xl">
            <q-linear-progress indeterminate color="white" rounded size="12px" />
          </div>
        </div>
      </div>
    </transition>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

import fondoAlimentos from '../../../assets/fondoAlimentos.svg';
import fondoSustanciasP from '../../../assets/fondoSustanciasP.svg';
import fondoGeneral from '../../../assets/fondoGeneral.svg'; // Same as default but explicit

import firmaVivianaRojas from '../../../assets/firma_viviana_rojas.png';
import firmaNiniPena from '../../../assets/firma_nini_pena.png';
import firmaAlfonsoVelasco from '../../../assets/firma_alfonso_velasco.png';
import firmaFrancyGonzalez from '../../../assets/firma_francy_gonzalez.png';

import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import type { CertificateVerificationHistory } from '../../../domain/certificate/models';
import EmptyState from '../../../shared/components/EmptyState.vue';
import QRCodeDisplay from '../../../shared/components/QRCodeDisplay.vue';
import { useCertificates } from '../../../shared/composables/useCertificates';
// import { certificatesService } from '../../../infrastructure/http/certificates/certificates.service';


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
const isFullscreen = ref(false);
const isDownloading = ref(false);

// URL del blob para mostrar el PDF en el iframe
const pdfViewerUrl = ref<string>('');
const showQrDialog = ref(false);

// Historial de verificaciones (mock por ahora, puede conectarse al backend después)
const verificationHistory = ref<CertificateVerificationHistory[]>([]);

// AUTO-AJUSTE DE TAMAÑO DE LETRA
const courseBoxRef = ref<HTMLElement | null>(null);
const courseTextRef = ref<HTMLElement | null>(null);
const currentFontSize = ref(20); // Base size in pt

const adjustFontSize = () => {
  if (!courseBoxRef.value || !courseTextRef.value) return;
  
  // Volvemos a 20pt como base
  currentFontSize.value = 18;
  
  setTimeout(() => {
    if (!courseBoxRef.value || !courseTextRef.value) return;
    
    let fontSize = 18;
    const maxWidth = 640; // Aumentamos el límite para que no se encoja tanto
    
    // Mientras el texto sea más ancho que el espacio permitido, se reduce la letra
    // Pero ponemos un límite mínimo de 10pt para que siga siendo legible
    while (courseTextRef.value.scrollWidth > maxWidth && fontSize > 12) {
      fontSize -= 0.5;
      currentFontSize.value = fontSize;
    }
  }, 0);
};

const isCesaroto = computed(() => {
  if (!certificate.value) return false;
  const title = (certificate.value.courseName || '').toLowerCase().trim();
  return (title.includes('transporte') && (title.includes('mercancias') || title.includes('mercancías')) && title.includes('peligrosas'));
});

// BACKGROUND DINAMICO
const certificateBg = computed(() => {
  if (!certificate.value) return fondoGeneral;

  const title = (certificate.value.courseName || '').toLowerCase().trim();

  // Logic: Alimentos -> Fondo Alimentos
  // Logic: Alimentos -> Fondo Alimentos
  if (
      ((title.includes('manipulacion') || title.includes('manipulación')) && title.includes('alimentos')) ||
      (title.includes('primeros') && title.includes('auxilios'))
  ) {
      return fondoAlimentos;
  }
  // Logic: Sustancias / Mercancías Peligrosas -> Fondo Sustancias
  else if (
      title.includes('transporte') &&
      (title.includes('mercancias') || title.includes('mercancías')) &&
      title.includes('peligrosas')
  ) {
       return fondoSustanciasP;
  }

  return fondoGeneral;
});

// LOGICA DE EMPRESA ALIADA
const allianceCompany = computed(() => {
  if (!certificate.value) return 'ANDAR DEL LLANO.';
  const title = (certificate.value.courseName || '').toLowerCase().trim();

  if (
      ((title.includes('manipulacion') || title.includes('manipulación')) && title.includes('alimentos')) ||
      (title.includes('primeros') && title.includes('auxilios'))
  ) {
      return 'IPS CONFIANZA.';
  } else if (
      (title.includes('curso') && (title.includes('basico') || title.includes('básico')) && title.includes('transporte') &&
      (title.includes('mercancias') || title.includes('mercancías')) &&
      title.includes('peligrosas')) || (title.includes('transporte') &&
      (title.includes('mercancias') || title.includes('mercancías')) &&
      title.includes('peligrosas'))
  ) {
      return 'CEASAROTO.';
  }
  return 'ANDAR DEL LLANO.';
});

const instructorDetails = computed(() => {
    let name = 'Viviana Paola Rojas Hincapie';
    let role = 'Instructor / Entrenador\nTSA REG xxxxxxxxx\nLicencia SST';
    let signatureImage = firmaVivianaRojas;

    if (!certificate.value) return { name, role, signatureImage };
    const title = (certificate.value.courseName || '').toLowerCase().trim();

     if (
        ((title.includes('manipulacion') || title.includes('manipulación')) && title.includes('alimentos')) ||
        (title.includes('primeros') && title.includes('auxilios'))
    ) {
         name = 'Nini Johana Peña Vanegaz';
         role = 'Instructor / Entrenador\nTSA REG xxxxxxxxx\nLicencia SST';
         signatureImage = firmaNiniPena;
    }
    return { name, role, signatureImage };
});

const representativeDetails = computed(() => {
    let name = 'Alfonso Alejandro Velasco Reyes';
    let signatureImage = firmaAlfonsoVelasco;

    if (!certificate.value) return { name, signatureImage };
    const title = (certificate.value.courseName || '').toLowerCase().trim();

    if (
        ((title.includes('manipulacion') || title.includes('manipulación')) && title.includes('alimentos')) ||
        (title.includes('primeros') && title.includes('auxilios'))
    ) {
         name = 'Francy Dayany Gonzalez Galindo';
         signatureImage = firmaFrancyGonzalez;
    }
    return { name, signatureImage };
});

const computedDuration = computed(() => {
    if (!certificate.value) return '20';
    const tituloForDuration = (certificate.value.courseName || '').toLowerCase().trim();

    if (
        tituloForDuration.includes('curso') &&
        (tituloForDuration.includes('basico') || tituloForDuration.includes('básico')) &&
        tituloForDuration.includes('transporte') &&
        (tituloForDuration.includes('mercancias') || tituloForDuration.includes('mercancías')) &&
        tituloForDuration.includes('peligrosas')
    ) {
        return '60';
    } else if (
        (tituloForDuration.includes('manipulacion') || tituloForDuration.includes('manipulación')) &&
        tituloForDuration.includes('alimentos')
    ) {
        return '10';
    }
    return '20';
});

const formattedIssuedDate = computed(() => {
    if (!certificate.value?.issuedDate) return '';
    const date = new Date(certificate.value.issuedDate);
    // Locale 'es-ES' with options specific to PDF
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: '2-digit' });
});

const formattedExpiryDate = computed(() => {
    if (!certificate.value?.expiryDate) return '';
    const date = new Date(certificate.value.expiryDate);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: '2-digit' });
});

// Funciones
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
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



/**
 * Determina la URL base correcta.
 * - Si estamos en localhost, usa el origen local (dev).
 * - Si estamos en producción (no localhost), usa la variable de entorno configurada.
 * Esto permite probar en dev sin que te mande a producción, pero asegura que en prod
 * se usen los dominios correctos.
 */
function getBaseUrl(): string {
  // Fix: Priorizar siempre la URL configurada (ej: Producción o Dev público)
  // Esto permite que los QRs generados en local sean escaneables por celurales (que no acceden a localhost)
  if (import.meta.env.VITE_FRONTEND_URL) {
    return import.meta.env.VITE_FRONTEND_URL;
  }

  const hostname = window.location.hostname;
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';

  if (isLocal) {
    return window.location.origin;
  }

  return window.location.origin;
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

  isDownloading.value = true;

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
  } finally {
    // Cerramos el overlay después de un pequeño retraso para transiciones suaves
    setTimeout(() => {
      isDownloading.value = false;
    }, 800);
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

  // Lógica robusta para evitar doble hash
  let cleanBaseUrl = baseUrl;
  if (baseUrl.includes('#')) {
    cleanBaseUrl = baseUrl.split('#')[0];
  }
  cleanBaseUrl = cleanBaseUrl.replace(/\/+$/, '');
  
  const url = `${cleanBaseUrl}/#/verify/${code}`;
  
  window.open(url, '_blank');
}

// Cargar datos al montar
onMounted(async () => {
  await loadCertificate(certificateId);
  adjustFontSize();
});
  

function getValidityStatus(expiryDate?: string) {
  if (!expiryDate) return 'Sin fecha';
  
  const expiry = new Date(expiryDate);
  const now = new Date();
  
  if (expiry < now) return 'Vencido';
  
  const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (days < 30) return 'Por Vencer';
  return 'Vigente';
}
  
function getValidityMessage(expiryDate?: string) {
  if (!expiryDate) return 'Sin fecha de vencimiento';
  
  const expiry = new Date(expiryDate);
  const now = new Date();
  
  if (expiry < now) return `Venció el ${formatDate(expiryDate)}`;
  
  const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return `Vence en ${days} días (${formatDate(expiryDate)})`;
}

function getValidityColor(expiryDate?: string) {
  if (!expiryDate) return 'grey';
  
  const expiry = new Date(expiryDate);
  const now = new Date();
  
  if (expiry < now) return 'negative';
  
  const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (days < 30) return 'warning';
  return 'positive';
}

function getValidityProgress(expiryDate?: string) {
  if (!expiryDate) return 0;
  
  // Logic: 100% is newly issued (e.g. 1 year ago), 0% is expired.
  // Ideally we need start date, but let's assume 1 year validity if not provided, or logic based on current date.
  // For now simpler: Status logic.
  // Let's rely on remaining days vs 365.
  
  const expiry = new Date(expiryDate);
  const now = new Date();
  
  if (expiry < now) return 1; // Full bar but red? Or 1 to show complete?
                              // If expired, maybe return 1 (100% time used)
  
  const daysRemaining = Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const totalDays = 365; // Assumption
  
  const progress = Math.max(0, 1 - (daysRemaining / totalDays));
  return progress;
}

function goBack() {
  // Intentar volver a la página anterior si hay historial
  if (window.history.length > 1) {
    router.back();
  } else {
    // Si no hay historial, redirigir a la lista de certificados
    void router.push('/certificates');
  }
}

// Computed para obtener el valor del QR
const getQRValue = computed(() => {
  if (!certificate.value) return null;

  if (certificate.value.qrCodeUrl && certificate.value.qrCodeUrl.startsWith('data:')) {
    return certificate.value.qrCodeUrl;
  }

  if (certificate.value.verificationCode) {
      const code = certificate.value.verificationCode;
      const baseUrl = getBaseUrl();


      try {
        // Lógica robusta para evitar doble hash
        let cleanBaseUrl = baseUrl;
        if (baseUrl.includes('#')) {
          cleanBaseUrl = baseUrl.split('#')[0];
        }
        cleanBaseUrl = cleanBaseUrl.replace(/\/+$/, '');
        
        const finalUrl = `${cleanBaseUrl}/#/verify/${code}`;

        console.log('✅ QR Generado (Final):', finalUrl);
        return finalUrl;
      } catch (e) {
         console.error('Error QR:', e);
         let cleanBaseUrl = baseUrl;
         if (baseUrl.includes('#')) {
           cleanBaseUrl = baseUrl.split('#')[0];
         }
         cleanBaseUrl = cleanBaseUrl.replace(/\/+$/, '');
         return `${cleanBaseUrl}/#/verify/${code}`;
      }
  }

  if (certificate.value.publicVerificationUrl?.startsWith('http')) {
    return certificate.value.publicVerificationUrl;
  }

  return null;
});



// Lifecycle
onMounted(async () => {
  if (certificateId) {
    await loadCertificate(certificateId);

    // Mock History Data for testing
    if (verificationHistory.value.length === 0 && certificateId) {
       verificationHistory.value = [
         {
           id: 'VER-' + Math.random().toString(36).substring(7).toUpperCase(),
           certificateId: certificateId,
           verifiedAt: new Date(Date.now() - 3600000).toISOString(),
           verifiedBy: '192.168.1.10',
           userAgent: 'Chrome on Windows',
         },
         {
           id: 'VER-' + Math.random().toString(36).substring(7).toUpperCase(),
           certificateId: certificateId,
           verifiedAt: new Date(Date.now() - 86400000).toISOString(),
           verifiedBy: '10.0.0.5',
           userAgent: 'Safari on iPhone',
         }
       ];
    }

    // Cargar el PDF después de cargar el certificado
    // await loadPDFForView(); // Removed unused call
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
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap');

.certificate-html-view {
  width: 1056px;
  height: 816px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  color: #292561 !important;
  font-family: 'Montserrat', sans-serif !important;
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
  color: #292561;
  margin: 1px 0;
  line-height: 1.2;
}
.cert-text-lg-bold {
  font-size: 16px;
  font-weight: bold;
  color: #292561;
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

.cert-footer-text-strip {
  position: absolute;
  bottom: 0px; /* Moved down to match PDF footer (approx Y=576 in 612 height doc) */
  left: 0;
  width: 100%;
  text-align: center;
  font-size: 9px; /* Slightly smaller to fit */
  color: #292561;
  font-family: 'Montserrat', sans-serif !important;
  padding-bottom: 30px; /* Padding for visual balance */
}

/* Logo Styles */
.cert-logos-row {
    position: absolute;
    top: 40px;   /* Adjusted to match PDF Y=30 (High Position for Confianza) */
    right: 33px; /* Match PDF rightAnchorX 767 */
    display: flex;
    justify-content: flex-end;
    align-items: flex-start; /* Permite alinear independientemente verticalmente */
    width: auto;
    margin: 0;
    padding: 0;
    z-index: 10;
}

/* Version Indicator */
.cert-version-debug {
  position: fixed;
  bottom: 0px;
  right: 0px;
  background: rgba(0,0,0,0.5);
  color: white;
  font-size: 8px;
  padding: 2px 5px;
  z-index: 9999;
  pointer-events: none;
  content: "v2026.01.21 - LAYOUT TWEAK 2";
}

/* Scoped styles for fixed layout */
.certificate-viewer-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden; /* Prevent scrollbars from scaling */
}

.viewer-toolbar {
  width: 100%;
}

.certificate-viewer {
  width: 100%;
  overflow: auto;
  background-color: #525659;
  padding: 20px;
  display: flex;
  justify-content: center;
}

/* Scaling Container */
.certificate-scaler {
  /* This container scales but keeps aspect ratio */
  /* We will let the parent flexbox handle centering */
}

/* The Fixed Canvas - Matches PDFKit Letter Landscape EXACTLY */
.certificate-html-view {
  width: 792px;  /* 11 inches * 72 points */
  height: 612px; /* 8.5 inches * 72 points */
  position: relative;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: white;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  /* Ensure fonts match PDF */
  font-family: 'Montserrat', sans-serif;
  color: #292561; /* Default blue color from backend */
  overflow: hidden;
}

/* Base class for all absolute elements */
.cert-element {
  position: absolute;
  text-align: center;
  /* border: 1px solid red; /* Debugging */
}

/* --- Coordinates Matching pdf-generator.service.ts --- */

/* Student Name: Y ~ 230px (Approximation based on flow)
   Backend: Y=140 + something. 
   Let's approximate visual placement or calculate precisely?
   PDF Header Y=140. Main Title.
   Then "Certifica Que".
   Then Name (Y += 90). So Name ~ 280-300? 
   Let's use visual placement from existing PDF or fine tune.
   Assuming Y=260px for Name based on "center" visual.
*/
/* Student Name: Y ~ 230px (Approximation based on flow)
   Backend: Y=140 + something. 
   Let's approximate visual placement or calculate precisely?
   PDF Header Y=140. Main Title.
   Then "Certifica Que".
   Then Name (Y += 90). So Name ~ 280-300? 
   Let's use visual placement from existing PDF or fine tune.
   Assuming Y=260px for Name based on "center" visual.
*/
.cert-student-name {
  top: 269px; /* Bajado un poco (antes 245px) */
  left: 0;
  width: 100%;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700; /* Bold */
  font-size: 18pt; /* Reducido un poco (antes 22pt) */
}

.cert-document-id {
  top: 295px; /* Bajado 10px (antes 285px) */
  left: 20px; /* Movido a la derecha 20px (antes 0) */
  width: 100%;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 14.5pt; 
}

/* Course Name Box 
   Backend: Y = doc.y - 68.5. Variable.
   Roughly halfway down? ~340px.
*/
.cert-course-box {
  top: 366px; /* Bajado 10px desde la posición anterior (358px) */
  left: 50%;
  transform: translateX(-50%);
  color: white; 
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  white-space: nowrap;
  
  /* Sin fondo ni sombra para usar el del SVG */
  width: 680px;
  height: 44px; /* Aumentado un poco el alto para dar aire a la letra de 20pt */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-sizing: border-box;
}

/* Duration 
   Backend: Y center - 3.5? No doc.y.
   Let's place it roughly. Y ~ 400px.
   Offset Right 47px from center.
   Center = 396. Left = 443. 
   Use left: 50%; margin-left: 47px; transform: translateX(-50%);
   
   Wait, if we use text-align center on width 100%, we can just shift content?
   Better: Left = 50% + 47px ? No.
   Center point is at 396 + 47 = 443px.
   So left: 443px; transform: translateX(-50%);
*/
.cert-duration {
  top: 406px; /* Visual approximation */
  left: 418px;
  transform: translateX(-50%);
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 11pt;
}

/* Dates */
/* Emission: Center - 80px = 316px */
.cert-date-mission {
  top: 423px; /* Below duration */
  left: 305.5px;
  transform: translateX(-50%);
  font-size: 10.5pt;
  font-family: 'Montserrat', sans-serif;
}

/* Expiry: Center + 186px = 582px */
.cert-date-expiry {
  top: 423px;
  left: 555px;
  transform: translateX(-50%);
  font-size: 10.5pt;
  font-family: 'Montserrat', sans-serif;
}

/* Signatures FooterY = 500 */
/* Instructor Col1 X = 251px */
.cert-sig-instructor-image {
  top: 450px; /* footerY - 45 + yOffset(-10) = 445 ~ 450 */
  left: 251px;
  transform: translateX(-50%); 
  /* Visual adjustment: viviana shifts 50px right? 
     Backend: ((col1X - 30) - (w/2)) + 50. 
     Center of image is shifted 50px right from col1 center?
     Let's handle specific offsets in computed props if needed or just center col1.
     User said "positions indicated". 
     I'll center on 251px for now.
  */
  display: flex;
  justify-content: center;
}

.cert-sig-instructor-name {
  top: 495px; /* footerY + 5 */
  left: 235px; /* Col 1 Center */
  width: 260px; /* Width from backend */
  transform: translateX(-50%);
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 10pt; /* Backend default? Font size not explicitly 22 here. 12? */
 
  padding-top: 3px;
}


.cert-sig-instructor-role {
  top: 513px; /* footerY + 20 */
  left: 217px; /* Backend: col1X - 110? No col1X is 251. 251 - 110 = 141 X pos?
     Wait, text(str, x, y). X = 251 - 110 = 141. Width 160.
     Center of text box = 141 + 80 = 221.
     So role is shifted left relative to name (251).
  */

  /* Let's stick closer to col1 center 251 */
  width: 200px;
  transform: translateX(-50%);
  font-size: 9.5pt;
}

/* Rep Col2 X = 511px */
.cert-sig-rep-image {
  top: 455px; /* footerY - 45 */
  left: 571px; /* Backend: (col2X + 60) ... wait. 
     Backend: "Adjust X to center over the name text box (col2X - 70 + 260/2 = col2X + 60)"
     Col2X = 511.
     Center of Rep Block = 511 + 60 = 571px.
     So Rep is NOT at Col2X starting point. It's shifted right.
  */
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
}

.cert-sig-rep-name {
  top: 495px;
  left: 565.5px; /* Center of Rep Block */
  width: 260px;
  transform: translateX(-50%);
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 9.9pt;
  padding-top: 3px;
}



.cert-sig-rep-role {
  top: 513px;
  left: 571px;
  transform: translateX(-50%);
  font-size: 9.5pt;
}

/* 7. QR Code: Fixed X=688, Y=448.5 */
.cert-qr-code {
  top: 432.5px;
  left: 671px;
  /* No transform translate because X is top-left corner in PDFKit usually? 
     "doc.image(..., qrX, qrY)". Yes, top-left.
     So left: 688px is correct.
  */
}

/* 8. Footer Text (Y=576) */
.cert-footer-text {
  top: 576px;
  left: 0;
  width: 100%;
  text-align: center; /* Backend calculates center logic manually, but CSS center works */
  font-size: 7pt;
}
/* Download Overlay Styles */
.download-overlay-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(20, 18, 55, 0.98); /* Más oscuro para centrar la atención */
  z-index: 10000;
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: all; /* Bloquea interacciones abajo */
}

.overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 500px;
  width: 90%;
}

.progress-bar-container {
  width: 100%;
  max-width: 400px;
}

.opacity-80 {
  opacity: 0.8;
}

/* Animations */
.birrete-animation {
  animation: graduate 1.5s infinite ease-in-out;
}

@keyframes graduate {
  0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
  50% { transform: translateY(-30px) rotate(8deg) scale(1.15); filter: drop-shadow(0 10px 15px rgba(255,255,255,0.3)); }
}

.book-loader {
  display: flex;
  gap: 12px;
}

.book-page {
  width: 18px;
  height: 30px;
  background: white;
  border-radius: 3px;
  animation: flip 1.2s infinite ease-in-out;
}

.book-page:nth-child(2) { animation-delay: 0.15s; }
.book-page:nth-child(3) { animation-delay: 0.3s; }

@keyframes flip {
  0%, 100% { transform: scaleY(1); opacity: 0.3; }
  50% { transform: scaleY(1.8); opacity: 1; }
}

/* Vue Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

<template>
  <q-page class="q-pa-xl column q-gutter-lg">
    <div class="row items-center justify-between">
      <div>
        <div class="heading-main q-mb-xs">Detalle de certificado</div>
        <div class="heading-sub">Información completa del certificado seleccionado.</div>
      </div>
      <q-btn flat label="Volver" icon="arrow_back" @click="goBack" />
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-8">
        <q-card class="q-pa-lg">
          <div class="text-h5 q-mb-md">{{ certificate.courseName }}</div>

          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-6">
              <div class="text-subtitle2 q-mb-sm">Información del curso</div>
              <q-list bordered separator>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Curso</q-item-label>
                    <q-item-label>{{ certificate.courseName }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Instructor</q-item-label>
                    <q-item-label>{{ certificate.instructor }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Duración</q-item-label>
                    <q-item-label>{{ certificate.durationHours }} horas</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <div class="col-12 col-md-6">
              <div class="text-subtitle2 q-mb-sm">Información del certificado</div>
              <q-list bordered separator>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Fecha de emisión</q-item-label>
                    <q-item-label>{{ certificate.issuedDate }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Fecha de vencimiento</q-item-label>
                    <q-item-label>
                      {{ certificate.expiryDate }}
                      <q-badge
                        :color="certificate.valid ? 'positive' : 'negative'"
                        outline
                        class="q-ml-sm"
                      >
                        {{ certificate.valid ? 'Válido' : 'Vencido' }}
                      </q-badge>
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Código de verificación</q-item-label>
                    <q-item-label>
                      <code class="text-primary">{{ certificate.verificationCode }}</code>
                      <q-btn
                        flat
                        dense
                        round
                        icon="content_copy"
                        size="sm"
                        class="q-ml-xs"
                        @click="copyCode"
                      />
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>

          <div class="q-mt-lg">
            <div class="text-subtitle2 q-mb-sm">Información del certificado</div>
            <q-list bordered separator>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Nombre completo</q-item-label>
                  <q-item-label>{{ certificate.studentName }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Número de documento</q-item-label>
                  <q-item-label>{{ certificate.documentNumber }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Puntuación obtenida</q-item-label>
                  <q-item-label>{{ certificate.score }}%</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <div class="row q-gutter-sm q-mt-lg">
            <q-btn
              color="primary"
              unelevated
              label="Descargar PDF"
              icon="download"
              @click="downloadPDF"
            />
            <q-btn
              flat
              label="Compartir"
              icon="share"
              @click="shareCertificate"
            />
            <q-btn
              flat
              label="Verificar públicamente"
              icon="qr_code_scanner"
              @click="openVerification"
            />
          </div>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="q-pa-lg text-center">
          <q-icon name="verified" color="primary" size="80px" class="q-mb-md" />
          <div class="text-h6 q-mb-sm">Certificado válido</div>
          <div class="text-caption text-grey-7 q-mb-md">
            Este certificado puede ser verificado públicamente usando el código QR o el código de
            verificación.
          </div>
          <q-img
            :src="certificate.qrCodeUrl"
            :ratio="1"
            class="q-mb-md"
            style="max-width: 200px; margin: 0 auto"
          />
          <q-btn
            flat
            label="Verificar en línea"
            color="primary"
            class="full-width"
            @click="openVerification"
          />
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const certificateId = route.params.id as string;

interface Certificate {
  id: string;
  courseName: string;
  instructor: string;
  durationHours: number;
  issuedDate: string;
  expiryDate: string;
  valid: boolean;
  verificationCode: string;
  studentName: string;
  documentNumber: string;
  score: number;
  qrCodeUrl: string;
}

const certificate = ref<Certificate>({
  id: certificateId,
  courseName: 'Primeros Auxilios',
  instructor: 'Dr. María González',
  durationHours: 8,
  issuedDate: '2025-01-15',
  expiryDate: '2026-01-15',
  valid: true,
  verificationCode: 'ABC123XYZ',
  studentName: 'Juan Pérez',
  documentNumber: '12345678',
  score: 85,
  qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ABC123XYZ',
});

function downloadPDF() {
  // Aquí se llamaría al servicio HTTP para descargar el certificado PDF
  console.log('Descargar certificado PDF:', certificateId);
  $q.notify({
    type: 'positive',
    message: 'Certificado descargado exitosamente',
  });
}

function shareCertificate() {
  // Aquí se implementaría la funcionalidad de compartir
  console.log('Compartir certificado:', certificateId);
  $q.notify({
    type: 'info',
    message: 'Enlace de verificación copiado al portapapeles',
  });
}

function openVerification() {
  // Abrir la página pública de verificación
  const verificationUrl = `/verify/${certificate.value.verificationCode}`;
  window.open(verificationUrl, '_blank');
}

async function copyCode() {
  try {
    await navigator.clipboard.writeText(certificate.value.verificationCode);
    $q.notify({
      type: 'positive',
      message: 'Código copiado al portapapeles',
    });
  } catch (error) {
    console.error('Error al copiar el código:', error);
  }
}

function goBack() {
  void router.push('/certificates');
}
</script>


<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="verification-page-biofile">
        <div class="biofile-card shadow-3">
          <!-- 1. Header -->
          <div class="biofile-header text-center q-py-md">
            <div class="text-subtitle1 text-grey-8">Validador de documentos</div>
          </div>

          <!-- 2. Logo / Branding -->
          <div class="biofile-branding text-center q-mb-lg">
             <!-- Simulating the Logo Layout: Icon + Text -->
             <div class="row justify-center items-center no-wrap">
                <q-icon name="school" color="primary" size="50px" class="q-mr-sm" />
                <div class="column items-start">
                   <div class="text-h4 text-weight-bold text-primary" style="line-height: 1">FORMAR360</div>
                   <div class="text-caption text-primary">Suite profesional para capacitación</div>
                </div>
             </div>
          </div>

          <q-inner-loading :showing="loading">
            <q-spinner-gears size="50px" color="primary" />
          </q-inner-loading>

          <!-- 3. Content - Only if Certificate Loaded -->
          <div v-if="certificate" class="biofile-content">
            
            <!-- Field 1: Código -->
            <div class="biofile-row">
              <div class="biofile-label">Código de seguridad:</div>
              <div class="biofile-value">{{ certificate.verificationCode }}</div>
            </div>

            <!-- Field 2: Centro Médico (Static as per request context) -->
            <div class="biofile-row">
              <div class="biofile-label">Centro de Formación:</div>
              <div class="biofile-value">{{ trainingCenterName }}</div>
            </div>

            <!-- Field 3: N Invoice/ID -->
            <div class="biofile-row">
              <div class="biofile-label">N°:</div>
              <div class="biofile-value">{{ certificate.courseId }}</div>
            </div>

            <!-- Field 4: Fecha y Hora -->
            <div class="biofile-row">
              <div class="biofile-label">Fecha y Hora:</div>
              <div class="biofile-value">{{ formatDateTime(certificate.issuedDate) }}</div>
            </div>

            <!-- Field 5: Lugar (Static) -->
            <div class="biofile-row">
              <div class="biofile-label">Lugar de Realización del Curso:</div>
              <div class="biofile-value">VILLAVICENCIO (META, COLOMBIA)</div>
            </div>

            <!-- Field 6: ID -->
            <div class="biofile-row">
              <div class="biofile-label">Nº de Identificación:</div>
              <div class="biofile-value">{{ certificate.documentNumber }}</div>
            </div>

            <!-- Field 7: Nombre -->
            <div class="biofile-row">
              <div class="biofile-label">Nombre Completo:</div>
              <div class="biofile-value text-uppercase">{{ certificate.studentName }}</div>
            </div>

            <!-- Field 8: Empresa (Mock/Placeholder if missing) -->
            <div class="biofile-row">
              <div class="biofile-label">Nombre de la Empresa:</div>
              <div class="biofile-value text-uppercase">PARTICULAR / INDEPENDIENTE</div>
            </div>

            <!-- Field 9: Misión (Mock) -->
            <div class="biofile-row">
              <div class="biofile-label">Empresa en Misión:</div>
              <div class="biofile-value text-uppercase">N/A</div>
            </div>

            <!-- Field 10: Producto -->
            <div class="biofile-row">
              <div class="biofile-label">Producto o Servicio:</div>
              <div class="biofile-value text-uppercase">{{ certificate.courseName }}</div>
            </div>

            <!-- Field 11: Diagnóstico/Estado -->
            <div class="biofile-row bg-blue-1">
              <div class="biofile-label">Estado del Certificado:</div>
              <div class="biofile-value text-uppercase text-weight-bold">
                 {{ getValidityStatus(certificate.expiryDate) }} - APROBADO
              </div>
            </div>

            <!-- 4. Footer Button -->
            <div class="q-mt-xl q-pb-md">
               <q-btn
                 label="¡Listo!"
                 color="positive"
                 class="full-width text-weight-bold textual-button"
                 size="lg"
                 icon="check_circle"
                 unelevated
                 style="border-radius: 8px;"
                 @click="goHome"
               />
            </div>

          </div>

          <!-- Error State -->
          <div v-else-if="!loading" class="text-center q-pa-md">
            <q-icon name="error_outline" size="64px" color="negative" />
            <div class="text-h6 text-negative q-mt-md">Certificado No Encontrado</div>
            <q-btn label="Volver" flat color="primary" class="q-mt-md" @click="goHome" />
          </div>

        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Certificate } from '../../../domain/certificate/models';
import { certificatesService } from '../../../infrastructure/http/certificates/certificates.service';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const certificate = ref<Certificate | null>(null);
const verificationToken = route.params.token as string;

const trainingCenterName = computed(() => {
  if (!certificate.value?.courseName) return 'FORMAR 360 - ANDAR DEL LLANO';
  
  const titulo = certificate.value.courseName.toLowerCase();
  
  if (
    (titulo.includes('manipulación') || titulo.includes('manipulacion')) && titulo.includes('alimentos') ||
    (titulo.includes('primeros') && titulo.includes('auxilios'))
  ) {
    return 'FORMAR 360 - IPS CONFIANZA';
  }
  
  if (
    titulo.includes('transporte') && (titulo.includes('mercancías') || titulo.includes('mercancias')) && titulo.includes('peligrosas')
  ) {
    return 'FORMAR 360 - CEASAROTO';
  }
  
  return 'FORMAR 360 - ANDAR DEL LLANO';
});

function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    // Format: "27 Sep 2025 a las 08:23:51"
    const day = date.getDate();
    const month = date.toLocaleString('es-ES', { month: 'short' });
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return `${day} ${month.charAt(0).toUpperCase() + month.slice(1)} ${year} a las ${time}`;
  } catch {
    return dateString;
  }
}

function getValidityStatus(expiryDate: string): string {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntilExpiry < 0) return 'VENCIDO';
  return 'VIGENTE';
}

function goHome() {
  void router.push('/');
}

onMounted(async () => {
  if (verificationToken) {
    try {
      const result = await certificatesService.verifyPublic(verificationToken);
      if (result.isValid && result.certificate) {
        certificate.value = result.certificate;
        // Ensure verification code is present
        if (!certificate.value.verificationCode) {
           certificate.value.verificationCode = verificationToken;
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      loading.value = false;
    }
  } else {
    loading.value = false;
  }
});
</script>

<style scoped lang="scss">
.verification-page-biofile {
  background-color: #0277BD; /* Darker blue background similar to surrounding app area if any */
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
  min-height: 100vh;
}

.biofile-card {
  background-color: white;
  width: 100%;
  max-width: 480px; /* Mobile width usually */
  border-radius: 12px;
  padding: 0 0px 20px 0px; /* Padding bottom for button */
  overflow: hidden;
  position: relative;
  min-height: 600px;
}

/* Header Line */
.biofile-header {
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 20px;
}

.biofile-content {
  padding: 0 20px;
}

/* Rows */
.biofile-row {
  border-bottom: 1px solid #e0e0e0;
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  background-color: #F1F8E9; /* Very light green/blue tint? Image looks mostly white/light blue */
}

/* Alternate row colors could be added if needed, but image looks flat */
.biofile-row:nth-child(even) {
  background-color: #F8FDFF; /* Slight blue tint */
}
.biofile-row:nth-child(odd) {
  background-color: #fff;
}

.biofile-label {
  color: #0277BD; /* Biofile Blue */
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 4px;
}

.biofile-value {
  color: #333;
  font-size: 15px;
  line-height: 1.2;
}

.textual-button {
  font-size: 18px;
  letter-spacing: 1px;
}

/* Override body dark mode */
body.body--dark .biofile-card {
  background-color: #fff; /* Keep it white even in dark mode for this specific design */
  color: #000;
}
</style>

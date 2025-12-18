<template>
  <q-page class="q-pa-xl">
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <q-card class="q-pa-lg text-center">
          <div class="q-mb-lg">
            <q-icon
              :name="certificate ? 'verified' : 'error'"
              :color="certificate ? 'positive' : 'negative'"
              size="80px"
              class="q-mb-md"
            />
            <div class="text-h4 q-mb-sm">
              {{ certificate ? 'Certificado Verificado' : 'Certificado No Encontrado' }}
            </div>
            <div class="text-body1 text-grey-7">
              {{
                certificate
                  ? 'Este certificado es válido y ha sido emitido por la plataforma.'
                  : 'El código de verificación no corresponde a un certificado válido.'
              }}
            </div>
          </div>

          <div v-if="certificate" class="column q-gutter-md">
            <q-separator />
            <div class="text-left">
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
                    <q-item-label caption>Curso</q-item-label>
                    <q-item-label>{{ certificate.courseName }}</q-item-label>
                  </q-item-section>
                </q-item>
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
                    <q-item-label caption>Instructor</q-item-label>
                    <q-item-label>{{ certificate.instructor }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <q-separator />

            <div class="text-caption text-grey-7">
              Este certificado fue emitido por la plataforma de capacitación y puede ser verificado
              públicamente usando este código: <code>{{ verificationToken }}</code>
            </div>
          </div>

          <div v-else class="q-mt-lg">
            <q-btn
              flat
              label="Volver"
              color="primary"
              @click="goHome"
            />
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const verificationToken = route.params.token as string;

interface Certificate {
  studentName: string;
  documentNumber: string;
  courseName: string;
  issuedDate: string;
  expiryDate: string;
  valid: boolean;
  instructor: string;
}

const certificate = ref<Certificate | null>(null);
const loading = ref(true);

onMounted(async () => {
  // Aquí se llamaría al servicio HTTP para verificar el certificado
  // Por ahora, simulamos una respuesta
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (verificationToken === 'ABC123XYZ') {
    certificate.value = {
      studentName: 'Juan Pérez',
      documentNumber: '12345678',
      courseName: 'Primeros Auxilios',
      issuedDate: '2025-01-15',
      expiryDate: '2026-01-15',
      valid: true,
      instructor: 'Dr. María González',
    };
  }

  loading.value = false;
});

function goHome() {
  void router.push('/');
}
</script>

<style scoped>
code {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}
</style>


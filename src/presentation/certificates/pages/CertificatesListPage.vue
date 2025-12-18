<template>
  <q-page class="q-pa-xl column q-gutter-lg">
    <div>
      <div class="heading-main q-mb-xs">Mis certificados</div>
      <div class="heading-sub">
        Visualiza y descarga todos tus certificados de capacitación obtenidos.
      </div>
    </div>

    <!-- Filtros -->
    <q-card class="q-pa-md">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <q-input
            v-model="filters.search"
            outlined
            dense
            placeholder="Buscar por curso..."
            clearable
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-md-3">
          <q-select
            v-model="filters.status"
            outlined
            dense
            :options="statusOptions"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            clearable
            placeholder="Filtrar por estado"
          />
        </div>
        <div class="col-12 col-md-3">
          <q-select
            v-model="filters.sortBy"
            outlined
            dense
            :options="sortOptions"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            placeholder="Ordenar por"
          />
        </div>
        <div class="col-12 col-md-2">
          <q-btn
            color="primary"
            unelevated
            label="Filtrar"
            class="full-width"
            @click="applyFilters"
          />
        </div>
      </div>
    </q-card>

    <!-- Lista de certificados -->
    <div class="row q-col-gutter-lg">
      <div
        v-for="certificate in certificates"
        :key="certificate.id"
        class="col-12 col-md-6 col-lg-4"
      >
        <q-card class="certificate-card">
          <q-card-section>
            <div class="row items-center justify-between q-mb-sm">
              <q-badge :color="certificate.valid ? 'positive' : 'negative'" outline>
                {{ certificate.valid ? 'Válido' : 'Vencido' }}
              </q-badge>
              <q-icon name="verified" color="primary" size="32px" />
            </div>
            <div class="text-subtitle1 text-weight-medium q-mb-xs">
              {{ certificate.courseName }}
            </div>
            <div class="text-caption text-grey-7 q-mb-sm">
              {{ certificate.instructor }}
            </div>
            <q-separator class="q-mb-sm" />
            <div class="column q-gutter-xs">
              <div class="text-caption">
                <q-icon name="event" size="14px" class="q-mr-xs" />
                Emitido: {{ certificate.issuedDate }}
              </div>
              <div class="text-caption">
                <q-icon name="schedule" size="14px" class="q-mr-xs" />
                Vence: {{ certificate.expiryDate }}
              </div>
              <div class="text-caption">
                <q-icon name="qr_code" size="14px" class="q-mr-xs" />
                Código: {{ certificate.verificationCode }}
              </div>
            </div>
          </q-card-section>
          <q-card-actions>
            <q-btn
              flat
              label="Ver detalles"
              color="primary"
              class="col"
              @click="viewCertificate(certificate.id)"
            />
            <q-btn
              flat
              label="Descargar"
              color="primary"
              icon="download"
              class="col"
              @click="downloadCertificate(certificate.id)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <q-card v-if="certificates.length === 0" class="q-pa-xl text-center">
      <q-icon name="verified" size="64px" color="grey-5" class="q-mb-md" />
      <div class="text-h6 text-grey-7">No tienes certificados aún</div>
      <div class="text-body2 text-grey-6 q-mt-sm">
        Completa las evaluaciones de tus cursos para obtener certificados.
      </div>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const router = useRouter();
const $q = useQuasar();

interface Certificate {
  id: string;
  courseName: string;
  instructor: string;
  issuedDate: string;
  expiryDate: string;
  valid: boolean;
  verificationCode: string;
}

const filters = ref({
  search: '',
  status: null as string | null,
  sortBy: 'date_desc',
});

const statusOptions = [
  { label: 'Válidos', value: 'valid' },
  { label: 'Vencidos', value: 'expired' },
];

const sortOptions = [
  { label: 'Fecha (más reciente)', value: 'date_desc' },
  { label: 'Fecha (más antiguo)', value: 'date_asc' },
  { label: 'Curso (A-Z)', value: 'course_asc' },
];

const certificates = ref<Certificate[]>([
  {
    id: '1',
    courseName: 'Primeros Auxilios',
    instructor: 'Dr. María González',
    issuedDate: '2025-01-15',
    expiryDate: '2026-01-15',
    valid: true,
    verificationCode: 'ABC123XYZ',
  },
  {
    id: '2',
    courseName: 'Manejo Defensivo',
    instructor: 'Ing. Carlos Rodríguez',
    issuedDate: '2024-12-10',
    expiryDate: '2025-12-10',
    valid: true,
    verificationCode: 'DEF456UVW',
  },
  {
    id: '3',
    courseName: 'Transporte de Mercancías Peligrosas',
    instructor: 'Lic. Ana Martínez',
    issuedDate: '2023-06-20',
    expiryDate: '2024-06-20',
    valid: false,
    verificationCode: 'GHI789RST',
  },
]);

function viewCertificate(id: string) {
  void router.push(`/certificates/${id}`);
}

function downloadCertificate(id: string) {
  // Aquí se llamaría al servicio HTTP para descargar el certificado PDF
  console.log('Descargar certificado:', id);
  $q.notify({
    type: 'positive',
    message: 'Certificado descargado exitosamente',
  });
}

function applyFilters() {
  // Aquí se aplicaría la lógica de filtrado
  console.log('Aplicando filtros:', filters.value);
}
</script>

<style scoped>
.certificate-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.certificate-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>


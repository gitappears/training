<template>
  <q-card
    class="certificate-card cursor-pointer"
    flat
    bordered
    @click="$emit('view', certificate.id)"
    @mouseenter="$emit('hover', certificate.id)"
    @mouseleave="$emit('hover', null)"
  >
    <!-- Preview on Hover -->
    <div
      v-if="isHovered"
      class="certificate-preview absolute-full flex flex-center"
    >
      <q-card class="preview-card q-pa-md">
        <q-icon name="verified" size="48px" color="primary" class="q-mb-sm" />
        <div class="text-subtitle2 text-weight-medium text-center">
          {{ certificate.courseName }}
        </div>
        <div class="text-caption text-grey-7 text-center q-mt-xs">
          Emitido: {{ formatDate(certificate.issuedDate) }}
        </div>
        <q-badge
          :color="certificate.status === 'valid' ? 'positive' : 'negative'"
          outline
          class="q-mt-sm"
        >
          {{ certificate.status === 'valid' ? 'Válido' : 'Vencido' }}
        </q-badge>
      </q-card>
    </div>

    <q-card-section class="q-pa-md">
      <div class="row items-center justify-between q-mb-sm">
        <q-badge
          :color="certificate.status === 'valid' ? 'positive' : 'negative'"
          outline
        >
          {{ certificate.status === 'valid' ? 'Válido' : 'Vencido' }}
        </q-badge>
        <q-icon name="verified" color="primary" size="32px" />
      </div>
      <div class="text-subtitle1 text-weight-medium q-mb-xs">
        {{ certificate.courseName }}
      </div>
      <div class="text-body2 text-grey-7 q-mb-sm">
        {{ certificate.instructorName }}
      </div>
      <q-separator class="q-mb-sm" />
      <div class="column q-gutter-xs">
        <div class="text-caption text-grey-6">
          <q-icon name="event" size="14px" class="q-mr-xs" />
          Emitido: {{ formatDate(certificate.issuedDate) }}
        </div>
        <div class="text-caption text-grey-6">
          <q-icon name="event_busy" size="14px" class="q-mr-xs" />
          Vence: {{ formatDate(certificate.expiryDate) }}
        </div>
        <div class="text-caption text-grey-6">
          <q-icon name="qr_code" size="14px" class="q-mr-xs" />
          {{ certificate.verificationCode.substring(0, 8) }}...
        </div>
        <div v-if="certificate.isRetroactive" class="q-mt-xs">
          <q-badge color="info" outline>
            <q-icon name="history" size="12px" class="q-mr-xs" />
            Retroactivo
          </q-badge>
        </div>
      </div>
    </q-card-section>
    <q-card-actions class="q-pa-md q-pt-none">
      <q-btn
        flat
        label="Ver detalles"
        color="primary"
        class="col"
        icon="visibility"
        @click.stop="$emit('view', certificate.id)"
      />
      <q-btn
        flat
        label="Descargar"
        color="primary"
        class="col"
        icon="download"
        @click.stop="$emit('download', certificate.id)"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import type { Certificate } from '../../../domain/certificate/models';
import { formatDate } from '../../../shared/utils/dateFormatter';

defineProps<{
  certificate: Certificate;
  isHovered: boolean;
}>();

defineEmits<{
  view: [id: string];
  download: [id: string];
  hover: [id: string | null];
}>();
</script>

<style scoped lang="scss">
.certificate-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.certificate-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

body.body--dark .certificate-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.certificate-preview {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 1;
  border-radius: 8px;
}

body.body--dark .certificate-preview {
  background: rgba(30, 27, 75, 0.95);
}

.preview-card {
  max-width: 200px;
  text-align: center;
}
</style>

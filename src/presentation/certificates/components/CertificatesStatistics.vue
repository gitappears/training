<template>
  <div class="row q-col-gutter-md q-mb-lg">
    <div class="col-12 col-sm-6 col-md-3">
      <q-card flat bordered class="stat-card">
        <q-card-section class="q-pa-md">
          <div class="row items-center q-gutter-sm">
            <q-avatar size="48px" color="primary" text-color="white" icon="verified" />
            <div class="col">
              <div class="text-caption text-grey-6">Total Certificados</div>
              <div class="text-h5 text-weight-bold">{{ statistics.total }}</div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
    <div class="col-12 col-sm-6 col-md-3">
      <q-card flat bordered class="stat-card">
        <q-card-section class="q-pa-md">
          <div class="row items-center q-gutter-sm">
            <q-avatar size="48px" color="positive" text-color="white" icon="check_circle" />
            <div class="col">
              <div class="text-caption text-grey-6">Válidos</div>
              <div class="text-h5 text-weight-bold">{{ statistics.valid }}</div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
    <div class="col-12 col-sm-6 col-md-3">
      <q-card flat bordered class="stat-card">
        <q-card-section class="q-pa-md">
          <div class="row items-center q-gutter-sm">
            <q-avatar size="48px" color="negative" text-color="white" icon="event_busy" />
            <div class="col">
              <div class="text-caption text-grey-6">Vencidos</div>
              <div class="text-h5 text-weight-bold">{{ statistics.expired }}</div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
    <div class="col-12 col-sm-6 col-md-3">
      <q-card flat bordered class="stat-card">
        <q-card-section class="q-pa-md">
          <div class="row items-center q-gutter-sm">
            <q-avatar size="48px" color="warning" text-color="white" icon="schedule" />
            <div class="col">
              <div class="text-caption text-grey-6">Próximos a vencer</div>
              <div class="text-h5 text-weight-bold">{{ statistics.expiringSoon }}</div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CertificateStatistics } from '../../../domain/certificate/models';

defineProps<{
  statistics: CertificateStatistics;
}>();
</script>

<style scoped lang="scss">
.stat-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

body.body--dark .stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
</style>

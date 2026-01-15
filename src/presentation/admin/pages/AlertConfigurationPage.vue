<template>
  <q-page padding>
    <div class="q-pa-md">
      <!-- Header -->
      <div class="q-mb-md">
        <h4 class="text-h4 q-ma-none">⚙️ Configuración de Alertas</h4>
        <p class="text-grey-7">Gestiona los días previos para enviar alertas de vencimiento</p>
      </div>

      <!-- Cards de Configuración -->
      <div class="relative-position configurations">
        <transition-group
          appear
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
          tag="div"
          class="row q-col-gutter-md"
        >
          <div class="col-12 col-md-4" v-for="config in configuraciones" :key="config.id">
            <q-card>
              <q-card-section class="bg-primary text-white">
                <div class="text-h6">
                  Alerta {{ config.diasAntesVencimiento }}
                  {{ config.diasAntesVencimiento === 1 ? 'día' : 'días' }}
                </div>
                <div>
                  {{
                    config.diasAntesVencimiento === 0
                      ? 'El mismo día del vencimiento'
                      : `${config.diasAntesVencimiento} días antes del vencimiento`
                  }}
                </div>
              </q-card-section>

              <q-separator />

              <q-card-section>
                <div class="row items-center">
                  <div class="col">
                    <div class="text-subtitle1 text-weight-medium">Estado</div>
                    <div class="text-caption text-grey-7">
                      {{
                        config.activo
                          ? 'Las alertas se enviarán automáticamente'
                          : 'Las alertas están desactivadas'
                      }}
                    </div>
                  </div>
                  <div class="col-auto">
                    <q-toggle
                      v-model="config.activo"
                      color="green"
                      @update:model-value="actualizarConfig(config)"
                      :disable="guardando"
                    />
                  </div>
                </div>
              </q-card-section>

              <q-separator />

              <q-card-section v-if="config.fechaCreacion">
                <div class="text-caption text-grey-7">
                  Creada: {{ formatearFecha(config.fechaCreacion) }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </transition-group>

        <q-inner-loading :showing="configuraciones.length === 0">
          <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
      </div>

      <!-- Información -->
      <q-banner rounded class="bg-blue-1 q-mt-lg">
        <template v-slot:avatar>
          <q-icon name="info" color="blue" />
        </template>
        <div class="text-subtitle1 text-weight-medium">¿Cómo funcionan las alertas?</div>
        <div class="q-mt-sm">
          <ul class="q-pl-md">
            <li>El sistema revisa diariamente a las 6:00 AM todos los certificados activos</li>
            <li>
              Se envían emails automáticos a los conductores cuando su certificado está por vencer
            </li>
            <li>Cada configuración activa enviará su alerta el día correspondiente</li>
            <li>Las alertas ya enviadas no se duplican</li>
          </ul>
        </div>
      </q-banner>

      <!-- Botón de Prueba -->
      <div class="q-mt-md" v-if="isDev">
        <q-btn
          color="amber"
          icon="play_arrow"
          label="Ejecutar Verificación Manual (Testing)"
          @click="ejecutarVerificacionManual"
          :loading="ejecutando"
          outline
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { certificatesService } from '../../../infrastructure/http/certificates/certificates.service';
import { CertificateUseCasesFactory } from '../../../application/certificate/certificate.use-cases.factory';

interface AlertConfiguration {
  id: number;
  diasAntesVencimiento: number;
  activo: boolean;
  fechaCreacion?: string;
}

const $q = useQuasar();

const isDev = import.meta.env.VITE_API_ENV == 'dev' ? true : false;

// Inicializar caso de uso para verificación manual
const checkExpirationsManuallyUseCase =
  CertificateUseCasesFactory.getCheckExpirationsManuallyUseCase(certificatesService);

const configuraciones = ref<AlertConfiguration[]>([]);
const guardando = ref(false);
const ejecutando = ref(false);

onMounted(() => {
  void cargarConfiguraciones();
});

const cargarConfiguraciones = async () => {
  try {
    const data = await certificatesService.getAlertConfigurations();
    configuraciones.value = data.map((config) => ({
      id: config.id,
      diasAntesVencimiento: config.diasAntesVencimiento,
      activo: config.activo, // El servicio ya convierte número a boolean
      // fechaCreacion no está disponible en la respuesta del servicio
    }));
  } catch (error) {
    console.error(error);
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Error al cargar configuraciones',
    });
  }
};

const actualizarConfig = async (config: AlertConfiguration) => {
  guardando.value = true;
  $q.loading.show({
    message: 'Actualizando configuración...',
  });
  try {
    // El servicio convierte automáticamente boolean a número (1/0) para el backend
    await certificatesService.updateAlertConfiguration(config.id, {
      diasAntesVencimiento: config.diasAntesVencimiento,
      activo: config.activo,
    });

    $q.notify({
      type: 'positive',
      message: `Configuración ${config.activo ? 'activada' : 'desactivada'} exitosamente`,
      icon: 'check_circle',
    });
  } catch (error) {
    console.error(error);
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Error al actualizar configuración',
    });
    // Revertir el cambio
    config.activo = !config.activo;
    await cargarConfiguraciones();
  } finally {
    guardando.value = false;
    $q.loading.hide();
  }
};

const ejecutarVerificacionManual = async () => {
  ejecutando.value = true;
  try {
    const result = await checkExpirationsManuallyUseCase.execute();

    $q.notify({
      type: 'positive',
      message: result.message || 'Verificación ejecutada correctamente',
      icon: 'check_circle',
    });
  } catch (error) {
    console.error(error);
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Error al ejecutar verificación',
    });
  } finally {
    ejecutando.value = false;
  }
};

const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
</script>

<style lang="sass" scoped>
.configurations
  border-radius: 10px;
  background-color: transparent !important;
  width: 100%;
  height: 200px;
</style>

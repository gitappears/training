<template>
  <q-page padding>
    <div class="q-pa-md">
      <!-- Header -->
      <div class="q-mb-md">
        <h4 class="text-h4 q-ma-none">⏱️ Configuración de Sesión</h4>
        <p class="text-grey-7">
          Configura las estrategias de cierre de sesión por inactividad y tiempo máximo
        </p>
      </div>

      <!-- Formulario de Configuración -->
      <q-card>
        <q-inner-loading :showing="loading">
          <q-spinner size="50px" color="primary" />
        </q-inner-loading>

        <q-form @submit="guardar" class="q-pa-md">
          <div class="row q-col-gutter-md">
            <!-- Tiempo de Inactividad -->
            <div class="col-12 col-md-6">
              <q-input
                v-model.number="form.tiempoInactividadMinutos"
                type="number"
                outlined
                label="Tiempo de Inactividad (minutos)"
                hint="Tiempo sin actividad antes de cerrar sesión (5-120 minutos)"
                :rules="[
                  (val) =>
                    val === null ||
                    val === undefined ||
                    (val >= 5 && val <= 120) ||
                    'Debe estar entre 5 y 120 minutos',
                ]"
                :min="5"
                :max="120"
              >
                <template v-slot:append>
                  <q-icon name="info" class="cursor-pointer">
                    <q-tooltip>
                      Si el usuario no interactúa con la aplicación durante este tiempo, se mostrará una advertencia y luego se cerrará la sesión.
                      Deje en blanco para deshabilitar.
                    </q-tooltip>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <!-- Tiempo Máximo de Sesión -->
            <div class="col-12 col-md-6">
              <q-input
                v-model.number="form.tiempoMaximoSesionMinutos"
                type="number"
                outlined
                label="Tiempo Máximo de Sesión (minutos)"
                hint="Tiempo máximo permitido de sesión activa (15-60 minutos, máximo 1 hora)"
                :rules="[
                  (val) =>
                    val === null ||
                    val === undefined ||
                    (val >= 15 && val <= 60) ||
                    'Debe estar entre 15 y 60 minutos (máximo 1 hora)',
                ]"
                :min="15"
                :max="60"
              >
                <template v-slot:append>
                  <q-icon name="info" class="cursor-pointer">
                    <q-tooltip>
                      Después de este tiempo, se mostrará una advertencia y el usuario podrá extender la sesión o cerrarla.
                      El tiempo máximo permitido es 60 minutos (1 hora).
                      Deje en blanco para deshabilitar.
                    </q-tooltip>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <!-- Activo -->
            <div class="col-12">
              <q-toggle
                v-model="activoToggle"
                label="Configuración Activa"
                color="primary"
              />
              <div class="text-caption text-grey-7 q-mt-xs">
                Si está desactivada, no se aplicarán las estrategias de cierre de sesión
              </div>
            </div>
          </div>

          <!-- Botones de Acción -->
          <div class="row justify-end q-mt-lg q-gutter-sm">
            <q-btn
              flat
              label="Cancelar"
              color="grey-7"
              @click="cargarConfiguracion"
            />
            <q-btn
              flat
              label="Probar Sesión"
              color="info"
              icon="play_arrow"
              @click="probarSesion"
              :disable="!form.activo"
            >
              <q-tooltip>
                Prueba las estrategias de cierre de sesión mostrando los diálogos de advertencia
              </q-tooltip>
            </q-btn>
            <q-btn
              type="submit"
              label="Guardar"
              color="primary"
              :loading="guardando"
              icon="save"
            />
          </div>
        </q-form>
      </q-card>

      <!-- Información Adicional -->
      <q-card class="q-mt-md">
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">ℹ️ Información</div>
          <ul class="q-pl-md">
            <li>
              <strong>Inactividad:</strong> Se detecta cuando el usuario no interactúa con la
              aplicación (movimientos de mouse, teclas, clics, scroll, etc.)
            </li>
            <li>
              <strong>Tiempo Máximo:</strong> Se cuenta desde el inicio de la sesión o desde la
              última extensión. El usuario puede extender la sesión refrescando el token.
            </li>
            <li>
              <strong>Advertencia:</strong> Se muestra 5 minutos antes del cierre automático,
              dando al usuario la opción de extender o cerrar la sesión.
            </li>
            <li>
              <strong>Extensión:</strong> Al extender, se refresca el token y se reinician los
              timers.
            </li>
          </ul>
        </q-card-section>
      </q-card>

      <!-- Diálogo de Prueba de Sesión -->
      <q-dialog v-model="showTestDialog">
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">🧪 Probar Estrategias de Sesión</div>
          </q-card-section>

          <q-card-section>
            <p class="text-body2">
              Seleccione qué estrategia desea probar. Se mostrará el diálogo de advertencia
              correspondiente.
            </p>
            <div class="q-mt-md q-gutter-sm">
              <q-btn
                v-if="form.tiempoInactividadMinutos"
                flat
                color="warning"
                label="Probar Inactividad"
                icon="timer_off"
                class="full-width"
                @click="probarInactividad"
              />
              <q-btn
                v-if="form.tiempoMaximoSesionMinutos"
                flat
                color="orange"
                label="Probar Tiempo Máximo"
                icon="schedule"
                class="full-width"
                @click="probarTiempoMaximo"
              />
              <q-btn
                v-if="!form.tiempoInactividadMinutos && !form.tiempoMaximoSesionMinutos"
                flat
                color="grey-7"
                label="No hay estrategias configuradas"
                class="full-width"
                disable
              />
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cerrar" color="grey-7" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Diálogos de Timeout de Sesión (para pruebas) -->
      <SessionTimeoutDialog
        :show-inactivity-dialog="showInactivityDialog"
        :show-max-session-dialog="showMaxSessionDialog"
        :warning-time="warningTime"
        @update:show-inactivity-dialog="(value) => (showInactivityDialog = value)"
        @update:show-max-session-dialog="(value) => (showMaxSessionDialog = value)"
        @extend="handleExtenderSesion"
        @close="handleCerrarSesion"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { api } from '../../../boot/axios';
import type { AxiosError } from 'axios';
import { useBooleanNumberToggle } from '../../../shared/composables/useBooleanNumberToggle';
import { booleanToNumber } from '../../../shared/utils/boolean-number-mapper';
import SessionTimeoutDialog from '../../../shared/components/SessionTimeoutDialog.vue';

interface ConfiguracionSesion {
  id?: number;
  tiempoInactividadMinutos: number | null;
  tiempoMaximoSesionMinutos: number | null;
  activo: boolean | number; // Puede ser boolean o number (1/0) del backend
}

const $q = useQuasar();

const loading = ref(false);
const guardando = ref(false);
const showTestDialog = ref(false);

// Estado local para los diálogos de prueba (no usar el composable global para evitar conflictos)
const showInactivityDialog = ref(false);
const showMaxSessionDialog = ref(false);
const warningTime = ref<number | null>(null);

const form = ref<ConfiguracionSesion>({
  tiempoInactividadMinutos: null,
  tiempoMaximoSesionMinutos: null,
  activo: true,
});

// Computed ref para el toggle que convierte automáticamente entre boolean y number
const activoToggle = useBooleanNumberToggle(
  () => form.value.activo,
  (value: boolean) => {
    form.value.activo = value;
  },
);

const cargarConfiguracion = async () => {
  loading.value = true;
  try {
    const response = await api.get<ConfiguracionSesion>('/configuracion-sesion/active');
    if (response.data) {
      const updateData: Partial<ConfiguracionSesion> = {
        tiempoInactividadMinutos: response.data.tiempoInactividadMinutos,
        tiempoMaximoSesionMinutos: response.data.tiempoMaximoSesionMinutos,
        activo: response.data.activo,
      };
      if (response.data.id !== undefined) {
        updateData.id = response.data.id;
      }
      form.value = {
        ...form.value,
        ...updateData,
      };
    }
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    if (axiosError.response?.status !== 404) {
      $q.notify({
        type: 'negative',
        message:
          axiosError.response?.data?.message ?? 'Error al cargar la configuración de sesión',
        position: 'top',
      });
    }
    // Si es 404, no hay configuración, usar valores por defecto
  } finally {
    loading.value = false;
  }
};

const guardar = async () => {
  guardando.value = true;
  try {
    // Convertir activo de boolean a número (1/0) para el backend
    const activoValue =
      typeof form.value.activo === 'boolean'
        ? booleanToNumber(form.value.activo)
        : form.value.activo;

    if (form.value.id) {
      // Actualizar
      await api.put(`/configuracion-sesion/${form.value.id}`, {
        tiempoInactividadMinutos: form.value.tiempoInactividadMinutos,
        tiempoMaximoSesionMinutos: form.value.tiempoMaximoSesionMinutos,
        activo: activoValue,
      });
      $q.notify({
        type: 'positive',
        message: 'Configuración actualizada correctamente',
        position: 'top',
      });
    } else {
      // Crear
      await api.post('/configuracion-sesion', {
        tiempoInactividadMinutos: form.value.tiempoInactividadMinutos,
        tiempoMaximoSesionMinutos: form.value.tiempoMaximoSesionMinutos,
        activo: activoValue,
      });
      $q.notify({
        type: 'positive',
        message: 'Configuración creada correctamente',
        position: 'top',
      });
    }
    await cargarConfiguracion();
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    $q.notify({
      type: 'negative',
      message:
        axiosError.response?.data?.message ?? 'Error al guardar la configuración de sesión',
      position: 'top',
    });
  } finally {
    guardando.value = false;
  }
};

const probarSesion = () => {
  if (!form.value.activo) {
    $q.notify({
      type: 'warning',
      message: 'La configuración debe estar activa para probar las estrategias',
      position: 'top',
    });
    return;
  }

  if (!form.value.tiempoInactividadMinutos && !form.value.tiempoMaximoSesionMinutos) {
    $q.notify({
      type: 'info',
      message: 'Configure al menos una estrategia (inactividad o tiempo máximo) para probar',
      position: 'top',
    });
    return;
  }

  showTestDialog.value = true;
};

const probarInactividad = () => {
  showTestDialog.value = false;
  warningTime.value = 5; // Simular 5 minutos restantes
  showInactivityDialog.value = true;

  $q.notify({
    type: 'info',
    message: 'Diálogo de inactividad mostrado. Puede extender o cerrar la sesión.',
    position: 'top',
    timeout: 3000,
  });
};

const probarTiempoMaximo = () => {
  showTestDialog.value = false;
  warningTime.value = 5; // Simular 5 minutos restantes
  showMaxSessionDialog.value = true;

  $q.notify({
    type: 'info',
    message: 'Diálogo de tiempo máximo mostrado. Puede extender o cerrar la sesión.',
    position: 'top',
    timeout: 3000,
  });
};

const handleExtenderSesion = () => {
  showInactivityDialog.value = false;
  showMaxSessionDialog.value = false;
  warningTime.value = null;

  $q.notify({
    type: 'positive',
    message: 'Sesión extendida (simulación)',
    position: 'top',
  });
};

const handleCerrarSesion = () => {
  showInactivityDialog.value = false;
  showMaxSessionDialog.value = false;
  warningTime.value = null;

  $q.notify({
    type: 'info',
    message: 'Sesión cerrada (simulación)',
    position: 'top',
  });
};

onMounted(() => {
  void cargarConfiguracion();
});
</script>

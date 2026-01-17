<template>
  <!-- Dialog de Inactividad -->
  <q-dialog :model-value="showInactivityDialog" @update:model-value="updateInactivityDialog" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="timer_off" color="warning" text-color="white" />
        <span class="q-ml-sm text-h6">Sesión por Inactividad</span>
      </q-card-section>

      <q-card-section>
        <p>
          Su sesión se cerrará en <strong>{{ warningTime }} minutos</strong> debido a inactividad.
        </p>
        <p class="text-caption text-grey-7">
          ¿Desea extender su sesión o cerrarla ahora?
        </p>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="Cerrar Sesión"
          color="negative"
          @click="handleCerrar"
        />
        <q-btn
          flat
          label="Extender Sesión"
          color="primary"
          @click="handleExtender"
          :loading="extending"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Dialog de Tiempo Máximo -->
  <q-dialog :model-value="showMaxSessionDialog" @update:model-value="updateMaxSessionDialog" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="schedule" color="orange" text-color="white" />
        <span class="q-ml-sm text-h6">Tiempo Máximo de Sesión</span>
      </q-card-section>

      <q-card-section>
        <p>
          Su sesión alcanzará el tiempo máximo permitido en <strong>{{ warningTime }} minutos</strong>.
        </p>
        <p class="text-caption text-grey-7">
          Puede extender su sesión hasta que expire el token o cerrarla ahora.
        </p>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="Cerrar Sesión"
          color="negative"
          @click="handleCerrar"
        />
        <q-btn
          flat
          label="Extender Sesión"
          color="primary"
          @click="handleExtender"
          :loading="extending"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  showInactivityDialog: boolean;
  showMaxSessionDialog: boolean;
  warningTime: number | null;
}

interface Emits {
  (e: 'extend'): void | Promise<void>;
  (e: 'close'): void;
  (e: 'update:showInactivityDialog', value: boolean): void;
  (e: 'update:showMaxSessionDialog', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const extending = ref(false);

const updateInactivityDialog = (value: boolean) => {
  emit('update:showInactivityDialog', value);
};

const updateMaxSessionDialog = (value: boolean) => {
  emit('update:showMaxSessionDialog', value);
};

const handleExtender = async () => {
  extending.value = true;
  try {
    await emit('extend');
  } finally {
    extending.value = false;
  }
};

const handleCerrar = () => {
  emit('close');
};

// Resetear loading cuando se cierran los diálogos
watch(
  () => [props.showInactivityDialog, props.showMaxSessionDialog],
  ([inactivity, maxSession]) => {
    if (!inactivity && !maxSession) {
      extending.value = false;
    }
  },
);
</script>

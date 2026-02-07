<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
    <q-card class="complete-trainings-progress-card" style="min-width: 320px">
      <q-card-section>
        <div class="text-h6 q-mb-md row items-center">
          <q-spinner color="primary" size="28px" class="q-mr-sm" />
          Habilitando para certificar
        </div>
        <p class="text-body2 text-grey-8 q-mb-md">
          <template v-if="userCount && userCount > 1">
            Completando capacitaciones para <strong>{{ userCount }} usuarios</strong>. Esto puede
            tardar unos segundos.
          </template>
          <template v-else>
            Completando capacitaciones, lecciones, evaluaciones y certificados para
            <strong>{{ userName }}</strong
            >. Esto puede tardar unos segundos.
          </template>
        </p>
        <q-linear-progress indeterminate color="primary" class="q-mt-sm" />
        <div class="q-mt-sm text-caption text-grey-6">
          Procesando inscripciones en el servidor...
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useDialogPluginComponent } from 'quasar';

const props = defineProps<{
  /** Nombre del usuario (modo un solo usuario). */
  userName?: string;
  /** Cantidad de usuarios (modo masivo). Si es > 1, se muestra "N usuarios". */
  userCount?: number;
  /** Cuando este ref pasa a true, se cierra el diálogo. */
  done?: { value: boolean };
}>();

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide } = useDialogPluginComponent();

watch(
  () => props.done?.value,
  (isDone) => {
    if (isDone) {
      onDialogHide();
    }
  },
);
</script>

<style scoped>
.complete-trainings-progress-card {
  border-radius: 8px;
}
</style>

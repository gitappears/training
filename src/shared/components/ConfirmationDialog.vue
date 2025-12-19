<template>
  <q-dialog
    :model-value="modelValue"
    :persistent="persistent"
    @update:model-value="handleUpdate"
  >
    <q-card
      :style="{ minWidth: `${minWidth}px` }"
      class="confirmation-dialog"
    >
      <q-card-section class="row items-center q-pb-none">
        <q-icon
          :name="icon"
          :color="iconColor"
          :size="iconSize"
          class="q-mr-sm"
        />
        <div class="text-h6">
          {{ title }}
        </div>
        <q-space />
        <q-btn
          v-if="showCloseButton"
          icon="close"
          flat
          round
          dense
          @click="handleCancel"
        />
      </q-card-section>

      <q-card-section>
        <div class="text-body1">
          {{ message }}
        </div>
        <div
          v-if="details"
          class="text-body2 text-grey-7 q-mt-sm"
        >
          {{ details }}
        </div>
      </q-card-section>

      <q-card-actions
        align="right"
        class="q-pa-md"
      >
        <q-btn
          flat
          :label="cancelLabel"
          :color="cancelColor"
          @click="handleCancel"
        />
        <q-btn
          :label="confirmLabel"
          :color="confirmColor"
          :loading="loading"
          @click="handleConfirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
  title: string;
  message: string;
  details?: string;
  icon?: string;
  iconColor?: string;
  iconSize?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string;
  cancelColor?: string;
  persistent?: boolean;
  showCloseButton?: boolean;
  loading?: boolean;
  minWidth?: number;
}

withDefaults(defineProps<Props>(), {
  icon: 'help_outline',
  iconColor: 'primary',
  iconSize: '32px',
  confirmLabel: 'Confirmar',
  cancelLabel: 'Cancelar',
  confirmColor: 'primary',
  cancelColor: 'grey-7',
  persistent: true,
  showCloseButton: true,
  loading: false,
  minWidth: 400,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
  cancel: [];
}>();

function handleUpdate(value: boolean) {
  emit('update:modelValue', value);
}

function handleConfirm() {
  emit('confirm');
}

function handleCancel() {
  emit('cancel');
  emit('update:modelValue', false);
}
</script>

<style scoped lang="scss">
.confirmation-dialog {
  .q-card-section {
    padding: 24px;
  }
}
</style>


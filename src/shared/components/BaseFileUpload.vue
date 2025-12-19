<template>
  <div class="base-file-upload">
    <q-file
      :model-value="modelValue"
      :label="label"
      :hint="hint"
      :error="hasError"
      :error-message="errorMessage"
      :required="required"
      :disable="disable"
      :readonly="readonly"
      :rules="rules"
      :lazy-rules="lazyRules"
      :outlined="outlined"
      :filled="filled"
      :dense="dense"
      :clearable="clearable"
      :placeholder="placeholder"
      :accept="accept"
      :max-file-size="maxFileSize"
      :max-total-size="maxTotalSize"
      :max-files="maxFiles"
      :filter="filter"
      :counter="counter"
      :use-chips="useChips"
      :display-value="displayValue"
      @update:model-value="handleUpdate"
      @rejected="handleRejected"
      @blur="handleBlur"
      @focus="handleFocus"
    >
      <template v-if="$slots.prepend" #prepend>
        <slot name="prepend" />
      </template>
      <template v-if="$slots.append" #append>
        <slot name="append" />
      </template>
    </q-file>

    <!-- Preview de archivos -->
    <div
      v-if="showPreview && previewFiles.length > 0"
      class="preview-container q-mt-md"
    >
      <div
        v-for="(file, index) in previewFiles"
        :key="index"
        class="preview-item q-mb-sm"
      >
        <!-- Preview de imagen -->
        <div
          v-if="isImage(file)"
          class="image-preview"
        >
          <q-img
            :src="getImageUrl(file)"
            :alt="file.name"
            style="max-width: 200px; max-height: 200px; border-radius: 8px;"
            @error="handleImageError"
          />
          <div class="preview-info q-mt-xs">
            <div class="text-caption text-grey-7">
              {{ file.name }}
            </div>
            <div class="text-caption text-grey-6">
              {{ formatFileSize(file.size) }}
            </div>
          </div>
        </div>

        <!-- Preview de PDF -->
        <div
          v-else-if="isPdf(file)"
          class="pdf-preview"
        >
          <q-icon
            name="picture_as_pdf"
            size="48px"
            color="red"
          />
          <div class="preview-info q-mt-xs">
            <div class="text-caption text-grey-7">
              {{ file.name }}
            </div>
            <div class="text-caption text-grey-6">
              {{ formatFileSize(file.size) }}
            </div>
          </div>
        </div>

        <!-- Preview genérico -->
        <div
          v-else
          class="generic-preview"
        >
          <q-icon
            name="insert_drive_file"
            size="48px"
            color="grey-6"
          />
          <div class="preview-info q-mt-xs">
            <div class="text-caption text-grey-7">
              {{ file.name }}
            </div>
            <div class="text-caption text-grey-6">
              {{ formatFileSize(file.size) }}
            </div>
          </div>
        </div>

        <!-- Botón para eliminar -->
        <q-btn
          v-if="allowRemove"
          flat
          dense
          round
          icon="close"
          size="sm"
          color="negative"
          class="remove-btn"
          @click="removeFile(index)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
  modelValue: File | File[] | null;
  label?: string;
  hint?: string;
  error?: boolean;
  errorMessage?: string;
  required?: boolean;
  disable?: boolean;
  readonly?: boolean;
  rules?: Array<(val: File | File[] | null) => boolean | string>;
  lazyRules?: boolean | 'ondemand';
  outlined?: boolean;
  filled?: boolean;
  dense?: boolean;
  clearable?: boolean;
  placeholder?: string;
  accept?: string;
  maxFileSize?: number | string;
  maxTotalSize?: number | string;
  maxFiles?: number;
  filter?: (files: File[]) => File[];
  counter?: boolean;
  useChips?: boolean;
  displayValue?: string;
  showPreview?: boolean;
  allowRemove?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  outlined: true,
  dense: false,
  lazyRules: 'ondemand',
  clearable: false,
  required: false,
  disable: false,
  readonly: false,
  showPreview: true,
  allowRemove: true,
});

const emit = defineEmits<{
  'update:modelValue': [value: File | File[] | null];
  rejected: [rejectedEntries: unknown[]];
  blur: [];
  focus: [];
}>();

const hasError = computed(() => {
  return props.error || (props.errorMessage !== undefined && props.errorMessage !== '');
});

const previewFiles = computed(() => {
  if (!props.modelValue) return [];
  if (Array.isArray(props.modelValue)) {
    return props.modelValue;
  }
  return [props.modelValue];
});

const imageError = ref(false);

function handleUpdate(value: File | File[] | null) {
  emit('update:modelValue', value);
}

function handleRejected(rejectedEntries: unknown[]) {
  emit('rejected', rejectedEntries);
}

function handleBlur() {
  emit('blur');
}

function handleFocus() {
  emit('focus');
}

function isImage(file: File): boolean {
  return file.type.startsWith('image/');
}

function isPdf(file: File): boolean {
  return file.type === 'application/pdf';
}

function getImageUrl(file: File): string {
  return URL.createObjectURL(file);
}

function handleImageError() {
  imageError.value = true;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`;
}

function removeFile(index: number) {
  if (Array.isArray(props.modelValue)) {
    const newFiles = [...props.modelValue];
    newFiles.splice(index, 1);
    emit('update:modelValue', newFiles.length > 0 ? newFiles : null);
  } else {
    emit('update:modelValue', null);
  }
}
</script>

<style scoped lang="scss">
.base-file-upload {
  .preview-container {
    .preview-item {
      position: relative;
      padding: 12px;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 8px;
      background-color: rgba(0, 0, 0, 0.02);

      .image-preview,
      .pdf-preview,
      .generic-preview {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .preview-info {
        text-align: center;
      }

      .remove-btn {
        position: absolute;
        top: 8px;
        right: 8px;
      }
    }
  }
}

.body--dark {
  .base-file-upload {
    .preview-container {
      .preview-item {
        border-color: rgba(255, 255, 255, 0.12);
        background-color: rgba(255, 255, 255, 0.05);
      }
    }
  }
}
</style>


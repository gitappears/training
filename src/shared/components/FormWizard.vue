<template>
  <div class="form-wizard">
    <!-- Indicador de pasos -->
    <q-stepper
      v-model="currentStep"
      :vertical="vertical"
      :contracted="contracted"
      :header-nav="headerNav"
      :color="color"
      :animated="animated"
      :flat="flat"
      :bordered="bordered"
      :alternative-labels="alternativeLabels"
      :keep-alive="keepAlive"
      class="wizard-stepper"
    >
      <q-step
        v-for="(step, index) in steps"
        :key="index"
        :name="index + 1"
        :title="step.title"
        :caption="step.caption"
        :icon="step.icon"
        :done="step.done !== undefined ? step.done : currentStep > index + 1"
        :error="step.error"
        :disable="step.disable"
      >
        <slot
          :name="`step-${index + 1}`"
          :step="index + 1"
          :isActive="currentStep === index + 1"
          :isFirst="index === 0"
          :isLast="index === steps.length - 1"
          :goNext="goNext"
          :goPrevious="goPrevious"
          :goToStep="goToStep"
        />
      </q-step>

      <template #navigation>
        <q-stepper-navigation>
          <q-btn
            v-if="currentStep > 1"
            flat
            :color="color"
            :label="backLabel"
            class="q-mr-sm"
            @click="goPrevious"
          />
          <q-space />
          <q-btn
            v-if="currentStep < steps.length"
            :color="color"
            :label="nextLabel"
            :loading="loading"
            :disable="loading || !canProceed"
            @click="goNext"
          />
          <q-btn
            v-else
            :color="color"
            :label="finishLabel"
            :loading="loading"
            :disable="loading || !canProceed"
            @click="handleFinish"
          />
        </q-stepper-navigation>
      </template>
    </q-stepper>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface WizardStep {
  title: string;
  caption?: string;
  icon?: string;
  done?: boolean;
  error?: boolean;
  disable?: boolean;
}

interface Props {
  steps: WizardStep[];
  modelValue?: number;
  vertical?: boolean;
  contracted?: boolean;
  headerNav?: boolean;
  color?: string;
  animated?: boolean;
  flat?: boolean;
  bordered?: boolean;
  alternativeLabels?: boolean;
  keepAlive?: boolean;
  backLabel?: string;
  nextLabel?: string;
  finishLabel?: string;
  loading?: boolean;
  canProceed?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 1,
  vertical: false,
  contracted: false,
  headerNav: true,
  color: 'primary',
  animated: true,
  flat: false,
  bordered: true,
  alternativeLabels: false,
  keepAlive: false,
  backLabel: 'Atrás',
  nextLabel: 'Siguiente',
  finishLabel: 'Finalizar',
  loading: false,
  canProceed: true,
});

const emit = defineEmits<{
  'update:modelValue': [step: number];
  'step-change': [step: number];
  'finish': [];
}>();

const currentStep = computed({
  get: () => props.modelValue || 1,
  set: (value: number) => {
    emit('update:modelValue', value);
    emit('step-change', value);
  },
});

function goNext() {
  if (currentStep.value < props.steps.length) {
    currentStep.value = currentStep.value + 1;
  }
}

function goPrevious() {
  if (currentStep.value > 1) {
    currentStep.value = currentStep.value - 1;
  }
}

function goToStep(step: number) {
  if (step >= 1 && step <= props.steps.length) {
    currentStep.value = step;
  }
}

function handleFinish() {
  emit('finish');
}
</script>

<style scoped lang="scss">
.form-wizard {
  .wizard-stepper {
    box-shadow: none;
  }
}
</style>


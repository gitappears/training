<template>
  <q-tabs
    :model-value="modelValue"
    :align="align"
    :breakpoint="breakpoint"
    :inline-label="inlineLabel"
    :dense="dense"
    :narrow-indicator="narrowIndicator"
    :no-caps="noCaps"
    :outside-arrows="outsideArrows"
    :mobile-arrows="mobileArrows"
    :switch-indicator="switchIndicator"
    :active-color="activeColor"
    :indicator-color="indicatorColor"
    :content-class="contentClass"
    class="tab-navigation"
    @update:model-value="handleUpdate"
  >
    <q-tab
      v-for="(tab, index) in tabs"
      :key="index"
      :name="tab.name"
      :label="tab.label"
      :icon="tab.icon"
      :disable="tab.disable"
      :alert="tab.alert"
      :alert-color="tab.alertColor"
      :content-class="tab.contentClass"
    >
      <q-badge
        v-if="tab.badge"
        :label="tab.badge"
        :color="tab.badgeColor"
        floating
      />
    </q-tab>
  </q-tabs>
</template>

<script setup lang="ts">
export interface TabItem {
  name: string;
  label: string;
  icon?: string;
  disable?: boolean;
  alert?: boolean;
  alertColor?: string;
  contentClass?: string;
  badge?: string | number;
  badgeColor?: string;
}

interface Props {
  modelValue: string | number;
  tabs: TabItem[];
  align?: 'left' | 'center' | 'right' | 'justify';
  breakpoint?: number;
  inlineLabel?: boolean;
  dense?: boolean;
  narrowIndicator?: boolean;
  noCaps?: boolean;
  outsideArrows?: boolean;
  mobileArrows?: boolean;
  switchIndicator?: boolean;
  activeColor?: string;
  indicatorColor?: string;
  contentClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  align: 'left',
  inlineLabel: false,
  dense: false,
  narrowIndicator: false,
  noCaps: false,
  outsideArrows: false,
  mobileArrows: false,
  switchIndicator: false,
  activeColor: 'primary',
  indicatorColor: 'primary',
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
  'tab-change': [tab: TabItem, index: number];
}>();

function handleUpdate(value: string | number) {
  emit('update:modelValue', value);
  const tab = props.tabs.find((t) => t.name === value);
  const index = props.tabs.findIndex((t) => t.name === value);
  if (tab) {
    emit('tab-change', tab, index);
  }
}
</script>

<style scoped lang="scss">
.tab-navigation {
  // Estilos adicionales si son necesarios
}
</style>


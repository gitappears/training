<template>
  <q-page class="assistant-quota-page q-pa-xl">
    <div class="row items-center justify-between q-mb-xl">
      <div>
        <div class="text-h4 text-weight-bold text-primary q-mb-xs">Cuotas del asistente</div>
        <div class="text-body1 text-grey-7">
          Gestione la cantidad de tokens del asistente por cliente institucional (empresa). Los
          usuarios verán cuántos tokens tienen disponibles y un mensaje para contactar al
          administrador si desean más.
        </div>
      </div>
    </div>

    <q-card flat bordered>
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="empresaId"
        :loading="loading"
        flat
        :rows-per-page-options="[10, 25, 50]"
      >
        <template #body-cell-razonSocial="props">
          <q-td :props="props">
            <span class="text-weight-medium">{{ props.row.razonSocial }}</span>
          </q-td>
        </template>

        <template #body-cell-tokenQuotaMonthly="props">
          <q-td :props="props">
            <template v-if="editingId === props.row.empresaId">
              <q-input
                v-model.number="editValue"
                type="number"
                min="0"
                dense
                outlined
                class="quota-input"
                @keydown.enter="saveQuota(props.row.empresaId)"
              />
            </template>
            <template v-else>
              <span v-if="props.row.tokenQuotaMonthly === null" class="text-grey-6">
                Sin asignar (límite global)
              </span>
              <span v-else>{{ props.row.tokenQuotaMonthly }}</span>
            </template>
          </q-td>
        </template>

        <template #body-cell-tokensUsed="props">
          <q-td :props="props">
            <q-badge :color="props.row.tokensUsed > 0 ? 'primary' : 'grey'" outline>
              {{ props.row.tokensUsed }}
            </q-badge>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props">
            <template v-if="editingId === props.row.empresaId">
              <q-btn
                flat
                dense
                color="primary"
                size="sm"
                label="Guardar"
                @click="saveQuota(props.row.empresaId)"
              />
              <q-btn
                flat
                dense
                color="grey"
                size="sm"
                label="Cancelar"
                class="q-ml-xs"
                @click="cancelEdit"
              />
            </template>
            <q-btn
              v-else
              flat
              dense
              icon="edit"
              color="primary"
              size="sm"
              @click="startEdit(props.row)"
            >
              <q-tooltip>Editar cuota</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width row flex-center q-pa-xl text-grey-6">
            No hay empresas activas o no se pudieron cargar las cuotas.
          </div>
        </template>

        <template #loading>
          <q-inner-loading showing color="primary" />
        </template>
      </q-table>
    </q-card>

    <p class="q-mt-md text-body2 text-grey-7">
      <q-icon name="info" size="18px" class="q-mr-xs vertical-middle" />
      Si la cuota está "Sin asignar", la empresa usa el límite global configurado en el servidor.
      Asigne 0 para desactivar el asistente para esa empresa.
    </p>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import {
  assistantService,
  type AssistantEmpresaQuotaItem,
} from '../../../infrastructure/http/assistant/assistant.service';
import type { QTableColumn } from 'quasar';

const $q = useQuasar();
const loading = ref(false);
const rows = ref<AssistantEmpresaQuotaItem[]>([]);
const editingId = ref<number | null>(null);
const editValue = ref<number>(0);

const columns: QTableColumn<AssistantEmpresaQuotaItem>[] = [
  {
    name: 'razonSocial',
    field: 'razonSocial',
    label: 'Empresa',
    align: 'left',
  },
  {
    name: 'tokenQuotaMonthly',
    field: 'tokenQuotaMonthly',
    label: 'Cuota mensual (tokens)',
    align: 'left',
  },
  {
    name: 'tokensUsed',
    field: 'tokensUsed',
    label: 'Usados este mes',
    align: 'center',
  },
  {
    name: 'actions',
    label: 'Acciones',
    align: 'center',
    field: () => '',
  },
];

async function load() {
  loading.value = true;
  try {
    rows.value = await assistantService.listQuotasEmpresas();
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las cuotas del asistente.',
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
}

function startEdit(row: AssistantEmpresaQuotaItem) {
  editingId.value = row.empresaId;
  editValue.value = row.tokenQuotaMonthly ?? 0;
}

function cancelEdit() {
  editingId.value = null;
}

async function saveQuota(empresaId: number) {
  const value = Math.max(0, Math.floor(editValue.value));
  try {
    await assistantService.setEmpresaQuota(empresaId, value);
    $q.notify({
      type: 'positive',
      message: 'Cuota actualizada correctamente.',
      position: 'top',
    });
    editingId.value = null;
    await load();
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar la cuota.',
      position: 'top',
    });
  }
}

onMounted(() => {
  void load();
});
</script>

<style scoped lang="scss">
.assistant-quota-page {
  background: #f9fafb;
}
body.body--dark .assistant-quota-page {
  background: #0f172a;
}
.quota-input {
  max-width: 120px;
}
</style>

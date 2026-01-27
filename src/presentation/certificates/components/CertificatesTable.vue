<template>
  <q-card flat bordered>
    <q-table
      v-model:selected="localSelected"
      :rows="certificates"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat
      selection="multiple"
      :pagination="{ rowsPerPage: 10 }"
    >
      <template #top>
        <div class="row items-center justify-between full-width">
          <div class="text-subtitle1 text-weight-medium">Lista de Certificados</div>
          <div class="row items-center q-gutter-sm">
            <q-btn
              v-if="localSelected.length > 0"
              flat
              dense
              icon="download"
              color="primary"
              :label="`Descargar ${localSelected.length}`"
              @click="$emit('bulk-download', localSelected)"
            />
            <q-btn
              flat
              dense
              icon="download"
              color="primary"
              label="Exportar"
            >
              <q-menu>
                <q-list>
                  <q-item clickable v-close-popup @click="$emit('export-csv', certificates)">
                    <q-item-section avatar>
                      <q-icon name="description" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Exportar a CSV</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="$emit('export-excel')">
                    <q-item-section avatar>
                      <q-icon name="table_chart" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Exportar a Excel</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </div>
      </template>

      <template #body-cell-status="props">
        <q-td :props="props">
          <q-badge
            :color="props.row.status === 'valid' ? 'positive' : 'negative'"
            outline
          >
            {{ props.row.status === 'valid' ? 'Válido' : 'Vencido' }}
          </q-badge>
        </q-td>
      </template>

      <template #body-cell-verificationCode="props">
        <q-td :props="props">
          <div class="row items-center q-gutter-xs">
            <code class="text-primary">{{ props.row.verificationCode.substring(0, 12) }}...</code>
            <q-btn
              flat
              dense
              round
              icon="content_copy"
              size="sm"
              @click="$emit('copy-code', props.row.verificationCode)"
            >
              <q-tooltip>Copiar código</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props">
          <div class="row q-gutter-xs">
            <q-btn
              flat
              dense
              round
              icon="visibility"
              color="primary"
              size="sm"
              @click="$emit('view', props.row.id)"
            >
              <q-tooltip>Ver detalles</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              round
              icon="download"
              color="primary"
              size="sm"
              @click="$emit('download', props.row.id)"
            >
              <q-tooltip>Descargar</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              round
              icon="share"
              color="primary"
              size="sm"
              @click="$emit('share', props.row.id)"
            >
              <q-tooltip>Compartir</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>

      <template #no-data>
        <EmptyState
          icon="verified"
          title="No hay certificados disponibles"
          description="No se encontraron certificados que coincidan con los filtros aplicados."
        >
          <template #actions>
            <q-btn
              v-if="hasActiveFilters"
              flat
              color="primary"
              label="Limpiar filtros"
              @click="$emit('clear-filters')"
            />
          </template>
        </EmptyState>
      </template>
    </q-table>
  </q-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { QTableColumn } from 'quasar';
import type { Certificate } from '../../../domain/certificate/models';
import EmptyState from '../../../shared/components/EmptyState.vue';
import { formatDate } from '../../../shared/utils/dateFormatter';

const props = defineProps<{
  certificates: Certificate[];
  loading: boolean;
  hasActiveFilters: boolean;
}>();

const emit = defineEmits<{
  'bulk-download': [certificates: Certificate[]];
  'export-csv': [certificates: Certificate[]];
  'export-excel': [];
  'copy-code': [code: string];
  'view': [id: string];
  'download': [id: string];
  'share': [id: string];
  'clear-filters': [];
  'update:selected': [certificates: Certificate[]];
}>();

const localSelected = ref<Certificate[]>([]);

watch(localSelected, (newVal) => {
  emit('update:selected', newVal);
}, { deep: true });

const columns: QTableColumn<Certificate>[] = [
  {
    name: 'courseName',
    field: 'courseName',
    label: 'Curso',
    align: 'left',
    sortable: true,
  },
  {
    name: 'issuedDate',
    field: 'issuedDate',
    label: 'Fecha de Emisión',
    align: 'left',
    sortable: true,
    format: (val: string) => formatDate(val),
  },
  {
    name: 'expiryDate',
    field: 'expiryDate',
    label: 'Fecha de Vencimiento',
    align: 'left',
    sortable: true,
    format: (val: string) => formatDate(val),
  },
  {
    name: 'status',
    field: 'status',
    label: 'Estado',
    align: 'center',
    sortable: true,
  },
  {
    name: 'verificationCode',
    field: 'verificationCode',
    label: 'Código de Verificación',
    align: 'left',
  },
  {
    name: 'actions',
    label: 'Acciones',
    align: 'center',
    field: () => '',
  },
];
</script>

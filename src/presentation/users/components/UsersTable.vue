<template>
  <q-card flat bordered>
    <q-table
      v-model:selected="selectedUsers"
      :rows="users"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :pagination="pagination"
      :pagination-label="paginationLabel"
      :rows-per-page-options="[10, 25, 50, 100]"
      selection="multiple"
      flat
      @request="onRequest"
    >
      <template #top>
        <div class="row items-center justify-between full-width">
          <div class="text-subtitle1 text-weight-medium">Lista de Usuarios</div>
          <div class="row items-center q-gutter-sm">
            <q-btn flat dense icon="download" color="primary" label="Exportar">
              <q-menu>
                <q-list>
                  <q-item clickable v-close-popup @click="$emit('export-csv')">
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

      <template #body-cell-role="props">
        <q-td :props="props">
          <q-badge :color="getRoleColor(props.row.role)" outline>
            {{ getRoleLabel(props.row.role) }}
          </q-badge>
        </q-td>
      </template>

      <template #body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="props.row.enabled ? 'positive' : 'negative'" outline>
            {{ props.row.enabled ? 'Habilitado' : 'Deshabilitado' }}
          </q-badge>
        </q-td>
      </template>

      <template #body-cell-type="props">
        <q-td :props="props">
          <q-badge :color="props.row.personType === 'juridica' ? 'blue' : 'green'" outline>
            {{ props.row.personType === 'juridica' ? 'Jurídica' : 'Natural' }}
          </q-badge>
          <q-badge v-if="props.row.isExternal" color="warning" outline class="q-ml-xs">
            Externo
          </q-badge>
        </q-td>
      </template>

      <template #body-cell-company="props">
        <q-td :props="props">
          <div v-if="props.row.company || props.row.companyName" class="text-body2">
            {{ props.row.company || props.row.companyName }}
          </div>
          <div v-else class="text-grey-5 text-italic">Sin empresa</div>
        </q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat dense round icon="more_vert" color="grey-7" size="sm">
            <q-menu anchor="top right" self="top left">
              <q-list style="min-width: 180px">
                <q-item clickable v-close-popup @click="$emit('view-user', props.row.id)">
                  <q-item-section avatar>
                    <q-icon name="visibility" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Ver detalles</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="$emit('edit-user', props.row)">
                  <q-item-section avatar>
                    <q-icon name="edit" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Editar</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup @click="$emit('toggle-status', props.row)">
                  <q-item-section avatar>
                    <q-icon
                      :name="props.row.enabled ? 'block' : 'check_circle'"
                      :color="props.row.enabled ? 'negative' : 'positive'"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>
                      {{ props.row.enabled ? 'Deshabilitar' : 'Habilitar' }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  :disable="acceptingTerms[props.row.id] === true"
                  @click="$emit('accept-terms', props.row)"
                >
                  <q-item-section avatar>
                    <q-icon
                      name="gavel"
                      color="info"
                      :class="{ 'q-spinner': acceptingTerms[props.row.id] === true }"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Aceptar términos</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item
                  v-if="isAdmin"
                  clickable
                  v-close-popup
                  :disable="completingTrainings[props.row.id] === true"
                  @click="$emit('complete-trainings', props.row)"
                >
                  <q-item-section avatar>
                    <q-icon
                      name="school"
                      color="secondary"
                      :class="{ 'q-spinner': completingTrainings[props.row.id] === true }"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Habilitar para certificar</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-td>
      </template>

      <template #no-data>
        <div class="row items-center justify-center full-width">
          <EmptyState
            icon="people"
            title="No hay usuarios disponibles"
            :description="noDataDescription"
          >
            <template #actions>
              <q-btn
                v-if="hasActiveFilters"
                flat
                color="primary"
                label="Limpiar filtros"
                @click="$emit('clear-filters')"
              />
              <q-btn
                color="primary"
                unelevated
                icon="add"
                label="Crear Usuario"
                @click="$emit('create-user')"
              />
            </template>
          </EmptyState>
        </div>
      </template>

      <template #loading>
        <q-inner-loading showing color="primary">
          <div class="column items-center q-gutter-md">
            <q-spinner color="primary" size="48px" />
            <div class="text-body2 text-grey-7">Cargando usuarios...</div>
          </div>
        </q-inner-loading>
      </template>
    </q-table>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { QTableProps } from 'quasar';
import type { User } from '../../../domain/user/models';
import { useUserRoles } from '../composables';
import EmptyState from '../../../shared/components/EmptyState.vue';

interface Props {
  users: User[];
  columns: QTableProps['columns'];
  loading: boolean;
  pagination: QTableProps['pagination'];
  selectedUsers: User[];
  hasActiveFilters?: boolean;
  acceptingTerms?: Record<string, boolean>;
  completingTrainings?: Record<string, boolean>;
  isAdmin?: boolean;
  noDataDescription?: string;
}

const props = withDefaults(defineProps<Props>(), {
  hasActiveFilters: false,
  acceptingTerms: () => ({}),
  completingTrainings: () => ({}),
  isAdmin: false,
  noDataDescription: 'No se encontraron usuarios que coincidan con los filtros aplicados.',
});

interface TableRequestProps {
  pagination: QTableProps['pagination'];
  filter?: string;
  getCellValue?: (col: unknown, row: unknown) => unknown;
}

const emit = defineEmits<{
  (e: 'update:selected', value: User[]): void;
  (e: 'request', props: TableRequestProps): void;
  (e: 'view-user', id: string): void;
  (e: 'edit-user', user: User): void;
  (e: 'toggle-status', user: User): void;
  (e: 'accept-terms', user: User): void;
  (e: 'complete-trainings', user: User): void;
  (e: 'export-csv'): void;
  (e: 'export-excel'): void;
  (e: 'clear-filters'): void;
  (e: 'create-user'): void;
}>();

const { getRoleLabel, getRoleColor } = useUserRoles();

/** Evita "1-0 de 0" cuando total=0. Si hay filas pero total aún no se actualizó, usa users.length. */
function paginationLabel(start: number, end: number, total: number): string {
  if (total === 0 && props.users.length > 0) {
    return `1-${props.users.length} de ${props.users.length}`;
  }
  if (total === 0) return '0-0 de 0';
  return `${start}-${end} de ${total}`;
}

const selectedUsers = computed({
  get: () => props.selectedUsers,
  set: (value) => emit('update:selected', value),
});

const acceptingTerms = computed(() => props.acceptingTerms || {});
const completingTrainings = computed(() => props.completingTrainings || {});

function onRequest(requestProps: TableRequestProps) {
  emit('request', requestProps);
}
</script>

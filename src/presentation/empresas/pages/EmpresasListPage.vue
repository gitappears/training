<template>
  <q-page class="empresas-list-page q-pa-xl">
    <div class="row items-center justify-between q-mb-xl">
      <div>
        <div class="text-h4 text-weight-bold text-primary q-mb-xs">Gestión de Empresas</div>
        <div class="text-body1 text-grey-7">Administra las empresas registradas en el sistema</div>
      </div>
      <q-btn
        color="primary"
        unelevated
        icon="add"
        label="Nueva Empresa"
        size="md"
        class="q-px-xl"
        no-caps
        @click="openCreateDialog"
      />
    </div>

    <q-card flat bordered>
      <q-table
        :rows="empresas"
        :columns="columns"
        :loading="loading"
        row-key="id"
        :pagination="pagination"
        flat
        class="empresas-table"
        @request="onRequest"
      >
        <template #top>
          <div class="row items-center q-gutter-md full-width">
            <div class="text-h6 text-weight-medium">Lista de Empresas</div>
            <q-select
              v-model="activoFilter"
              :options="activoOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              dense
              outlined
              style="min-width: 160px"
            />
            <q-input
              v-model="searchText"
              outlined
              dense
              placeholder="Buscar por razón social, documento o email..."
              clearable
              style="min-width: 300px"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </template>

        <template #body-cell-razonSocial="props">
          <q-td :props="props">
            <div class="text-weight-medium">{{ props.value }}</div>
            <div class="text-caption text-grey-6">{{ props.row.numeroDocumento }}</div>
          </q-td>
        </template>

        <template #body-cell-contacto="props">
          <q-td :props="props">
            <div v-if="props.row.email" class="text-body2">{{ props.row.email }}</div>
            <div v-if="props.row.telefono" class="text-caption text-grey-6">{{ props.row.telefono }}</div>
            <div v-if="!props.row.email && !props.row.telefono" class="text-grey-5">Sin contacto</div>
          </q-td>
        </template>

        <template #body-cell-activo="props">
          <q-td :props="props">
            <q-badge
              :color="props.row.eliminada ? 'grey' : (props.value ? 'positive' : 'negative')"
              :label="props.row.eliminada ? 'Eliminada' : (props.value ? 'Activa' : 'Inactiva')"
            />
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props">
            <div class="row q-gutter-xs">
              <q-btn flat round dense icon="edit" color="primary" size="sm" @click="openEditDialog(props.row)">
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                :icon="props.row.activo ? 'block' : 'check_circle'"
                :color="props.row.activo ? 'negative' : 'positive'"
                size="sm"
                @click="handleToggleStatus(props.row)"
              >
                <q-tooltip>{{ props.row.activo ? 'Desactivar' : 'Activar' }}</q-tooltip>
              </q-btn>
              <q-btn
                v-if="!props.row.eliminada"
                flat
                round
                dense
                icon="delete"
                color="negative"
                size="sm"
                @click="handleRemove(props.row)"
              >
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-6 q-gutter-sm q-pa-lg">
            <q-icon name="business" size="2em" />
            <span>{{ loading ? 'Cargando...' : 'No hay empresas registradas' }}</span>
          </div>
        </template>
      </q-table>
    </q-card>

    <EmpresaDialog v-model="dialogOpen" :empresa="empresaToEdit" @success="handleDialogSuccess" />
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useEmpresaList } from '../composables';
import EmpresaDialog from '../components/EmpresaDialog.vue';

const {
  loading,
  empresas,
  searchText,
  activoFilter,
  pagination,
  columns,
  dialogOpen,
  empresaToEdit,
  loadEmpresas,
  onRequest,
  openCreateDialog,
  openEditDialog,
  handleDialogSuccess,
  handleToggleStatus,
  handleRemove,
} = useEmpresaList();

const activoOptions = [
  { label: 'Todas', value: 'todos' },
  { label: 'Solo activas', value: 'activas' },
  { label: 'Inactivas', value: 'inactivas' },
  { label: 'Eliminadas', value: 'eliminadas' },
];

onMounted(() => {
  void loadEmpresas();
});
</script>

<style scoped lang="scss">
.empresas-list-page {
  background: #f9fafb;
  transition: background-color 0.3s ease;
}

body.body--dark .empresas-list-page {
  background: #0f172a;
}

.empresas-table {
  background: white;
}

body.body--dark .empresas-table {
  background: #1e293b;
}
</style>

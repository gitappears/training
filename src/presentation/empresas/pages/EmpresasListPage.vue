<template>
  <q-page class="empresas-list-page q-pa-xl">
    <!-- Header Section -->
    <div class="row items-center justify-between q-mb-xl">
      <div>
        <div class="text-h4 text-weight-bold text-primary q-mb-xs">Gestión de Empresas</div>
        <div class="text-body1 text-grey-7">
          Administra las empresas registradas en el sistema
        </div>
      </div>
      <q-btn
        color="primary"
        unelevated
        icon="add"
        label="Nueva Empresa"
        size="md"
        class="q-px-xl"
        @click="openCreateDialog"
        no-caps
      />
    </div>

    <!-- Empresas Table -->
    <q-card flat bordered>
      <q-table
        :rows="empresas"
        :columns="columns"
        :loading="loading"
        row-key="id"
        :pagination="pagination"
        @request="onRequest"
        flat
        class="empresas-table"
      >
        <template #top>
          <div class="row items-center justify-between full-width">
            <div class="text-h6 text-weight-medium">Lista de Empresas</div>
            <q-input
              v-model="search"
              outlined
              dense
              placeholder="Buscar por razón social, documento o email..."
              clearable
              class="q-ml-md"
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
            <div v-if="props.row.telefono" class="text-caption text-grey-6">
              {{ props.row.telefono }}
            </div>
            <div v-if="!props.row.email && !props.row.telefono" class="text-grey-5">
              Sin contacto
            </div>
          </q-td>
        </template>

        <template #body-cell-activo="props">
          <q-td :props="props">
            <q-badge
              :color="props.value ? 'positive' : 'negative'"
              :label="props.value ? 'Activa' : 'Inactiva'"
            />
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props">
            <div class="row q-gutter-xs">
              <q-btn
                flat
                round
                dense
                icon="edit"
                color="primary"
                size="sm"
                @click="openEditDialog(props.row)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                :icon="props.row.activo ? 'block' : 'check_circle'"
                :color="props.row.activo ? 'negative' : 'positive'"
                size="sm"
                @click="toggleStatus(props.row)"
              >
                <q-tooltip>{{ props.row.activo ? 'Desactivar' : 'Activar' }}</q-tooltip>
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

    <!-- Create/Edit Dialog -->
    <EmpresaDialog
      v-model="dialogOpen"
      :empresa="empresaToEdit"
      @success="handleDialogSuccess"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import type { QTableProps } from 'quasar';
import { empresasService, type Empresa } from '../../../infrastructure/http/empresas/empresas.service';
import EmpresaDialog from '../components/EmpresaDialog.vue';

const $q = useQuasar();

const empresas = ref<Empresa[]>([]);
const loading = ref(false);
const search = ref('');
const dialogOpen = ref(false);
const empresaToEdit = ref<Empresa | null>(null);

const pagination = ref<QTableProps['pagination']>({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

const columns: QTableProps['columns'] = [
  {
    name: 'razonSocial',
    required: true,
    label: 'Empresa',
    align: 'left',
    field: 'razonSocial',
    sortable: true,
  },
  {
    name: 'tipoDocumento',
    label: 'Tipo Doc.',
    align: 'center',
    field: 'tipoDocumento',
    sortable: true,
  },
  {
    name: 'contacto',
    label: 'Contacto',
    align: 'left',
    field: (row) => row.email || row.telefono || '',
  },
  {
    name: 'direccion',
    label: 'Dirección',
    align: 'left',
    field: 'direccion',
    format: (val) => val || '—',
  },
  {
    name: 'activo',
    label: 'Estado',
    align: 'center',
    field: 'activo',
    sortable: true,
  },
  {
    name: 'fechaCreacion',
    label: 'Fecha Creación',
    align: 'center',
    field: 'fechaCreacion',
    format: (val) => (val ? new Date(val).toLocaleDateString() : '—'),
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Acciones',
    align: 'center',
    field: () => '',
  },
];

async function loadEmpresas() {
  loading.value = true;
  try {
    const data = await empresasService.findAll();
    
    // Filtrar por búsqueda si existe
    let filteredData = data;
    if (search.value) {
      const searchLower = search.value.toLowerCase();
      filteredData = data.filter(
        (empresa) =>
          empresa.razonSocial.toLowerCase().includes(searchLower) ||
          empresa.numeroDocumento.toLowerCase().includes(searchLower) ||
          (empresa.email && empresa.email.toLowerCase().includes(searchLower)),
      );
    }

    empresas.value = filteredData;
    pagination.value = {
      ...pagination.value,
      rowsNumber: filteredData.length,
    };
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Error al cargar las empresas',
      icon: 'error',
    });
  } finally {
    loading.value = false;
  }
}

function onRequest(props: {
  pagination: QTableProps['pagination'];
  filter?: string;
}) {
  pagination.value = props.pagination;
  void loadEmpresas();
}

function openCreateDialog() {
  empresaToEdit.value = null;
  dialogOpen.value = true;
}

function openEditDialog(empresa: Empresa) {
  empresaToEdit.value = empresa;
  dialogOpen.value = true;
}

function handleDialogSuccess() {
  dialogOpen.value = false;
  empresaToEdit.value = null;
  void loadEmpresas();
}

async function toggleStatus(empresa: Empresa) {
  const action = empresa.activo ? 'desactivar' : 'activar';
  $q.dialog({
    title: 'Confirmar',
    message: `¿Está seguro de que desea ${action} la empresa "${empresa.razonSocial}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await empresasService.update(empresa.id, { activo: !empresa.activo });
      $q.notify({
        type: 'positive',
        message: `Empresa ${action}da exitosamente`,
        icon: 'check_circle',
      });
      void loadEmpresas();
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error instanceof Error ? error.message : `Error al ${action} la empresa`,
        icon: 'error',
      });
    }
  });
}

// Watch para búsqueda con debounce
let searchTimeout: ReturnType<typeof setTimeout> | null = null;
watch(search, () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    void loadEmpresas();
  }, 500);
});

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


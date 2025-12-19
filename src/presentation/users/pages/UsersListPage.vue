<template>
  <q-page class="users-list-page q-pa-xl">
    <!-- Header Section -->
    <div class="row items-center justify-between q-mb-xl">
      <div>
        <div class="text-h4 text-weight-bold text-primary q-mb-xs">Gestión de Usuarios</div>
        <div class="text-body1 text-grey-7">
          Administra conductores, empresas y administradores del sistema
        </div>
      </div>
      <q-btn
        color="primary"
        unelevated
        icon="add"
        label="Nuevo Usuario"
        size="md"
        class="q-px-xl"
        to="/users/new"
        no-caps
      />
    </div>

    <!-- Statistics Cards -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-gutter-sm">
              <q-avatar size="48px" color="primary" text-color="white" icon="people" />
              <div class="col">
                <div class="text-caption text-grey-6">Total Usuarios</div>
                <div class="text-h5 text-weight-bold">{{ statistics.total }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-gutter-sm">
              <q-avatar size="48px" color="positive" text-color="white" icon="check_circle" />
              <div class="col">
                <div class="text-caption text-grey-6">Habilitados</div>
                <div class="text-h5 text-weight-bold">{{ statistics.enabled }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-gutter-sm">
              <q-avatar size="48px" color="negative" text-color="white" icon="block" />
              <div class="col">
                <div class="text-caption text-grey-6">Deshabilitados</div>
                <div class="text-h5 text-weight-bold">{{ statistics.disabled }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-gutter-sm">
              <q-avatar size="48px" color="warning" text-color="white" icon="person_outline" />
              <div class="col">
                <div class="text-caption text-grey-6">Externos</div>
                <div class="text-h5 text-weight-bold">{{ statistics.external }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Filters Panel -->
    <FiltersPanel :active-filters-count="activeFiltersCount" @clear="clearAllFilters">
      <div class="col-12 col-md-4">
        <q-input
          v-model="filters.search"
          outlined
          dense
          placeholder="Buscar por nombre, email o documento..."
          clearable
          @update:model-value="debouncedSearch"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-2">
        <q-select
          v-model="filters.role"
          outlined
          dense
          :options="roleOptions"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          clearable
          placeholder="Rol"
        >
          <template #prepend>
            <q-icon name="badge" />
          </template>
        </q-select>
      </div>
      <div class="col-12 col-md-2">
        <q-select
          v-model="filters.status"
          outlined
          dense
          :options="statusOptions"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          clearable
          placeholder="Estado"
        >
          <template #prepend>
            <q-icon name="toggle_on" />
          </template>
        </q-select>
      </div>
      <div class="col-12 col-md-2">
        <q-select
          v-model="filters.personType"
          outlined
          dense
          :options="personTypeOptions"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          clearable
          placeholder="Tipo"
        >
          <template #prepend>
            <q-icon name="category" />
          </template>
        </q-select>
      </div>
      <div class="col-12 col-md-2">
        <q-toggle
          v-model="filters.isExternal"
          label="Solo externos"
          color="primary"
          :true-value="true"
          :false-value="null"
          :indeterminate-value="null"
        />
      </div>
    </FiltersPanel>

    <!-- Bulk Actions -->
    <q-card v-if="selectedUsers.length > 0" flat bordered class="q-mb-md q-pa-md">
      <div class="row items-center justify-between">
        <div class="text-body1 text-weight-medium">
          {{ selectedUsers.length }} usuario{{ selectedUsers.length > 1 ? 's' : '' }} seleccionado{{ selectedUsers.length > 1 ? 's' : '' }}
        </div>
        <div class="row q-gutter-sm">
          <q-btn
            flat
            color="positive"
            icon="check_circle"
            label="Habilitar"
            @click="bulkEnable"
          />
          <q-btn
            flat
            color="negative"
            icon="block"
            label="Deshabilitar"
            @click="bulkDisable"
          />
          <q-btn
            flat
            color="grey-7"
            icon="close"
            label="Deseleccionar"
            @click="clearSelection"
          />
        </div>
      </div>
    </q-card>

    <!-- Users Table -->
    <q-card flat bordered>
      <q-table
        v-model:selected="selectedUsers"
        :rows="filteredUsers"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        :rows-per-page-options="[10, 25, 50, 100]"
        selection="multiple"
        flat
        @request="onRequest"
      >
        <template #top>
          <div class="row items-center justify-between full-width">
            <div class="text-subtitle1 text-weight-medium">Lista de Usuarios</div>
            <div class="row items-center q-gutter-sm">
              <q-btn
                flat
                dense
                icon="download"
                color="primary"
                label="Exportar"
                @click="handleExport"
              >
                <q-menu>
                  <q-list>
                    <q-item clickable v-close-popup @click="exportToCSV">
                      <q-item-section avatar>
                        <q-icon name="description" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>Exportar a CSV</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="exportToExcel">
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
          <q-badge :color="getRoleColor(props.row.role)" outline>
            {{ getRoleLabel(props.row.role) }}
          </q-badge>
        </template>

        <template #body-cell-status="props">
          <q-badge :color="props.row.enabled ? 'positive' : 'negative'" outline>
            {{ props.row.enabled ? 'Habilitado' : 'Deshabilitado' }}
          </q-badge>
        </template>

        <template #body-cell-type="props">
          <q-badge :color="props.row.personType === 'juridica' ? 'blue' : 'green'" outline>
            {{ props.row.personType === 'juridica' ? 'Jurídica' : 'Natural' }}
          </q-badge>
          <q-badge
            v-if="props.row.isExternal"
            color="warning"
            outline
            class="q-ml-xs"
          >
            Externo
          </q-badge>
        </template>

        <template #body-cell-actions="props">
          <div class="row q-gutter-xs">
            <q-btn
              flat
              dense
              round
              icon="visibility"
              color="primary"
              size="sm"
              @click="viewUser(props.row.id)"
            >
              <q-tooltip>Ver detalles</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              round
              icon="edit"
              color="primary"
              size="sm"
              @click="editUser(props.row.id)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              flat
              dense
              round
              :icon="props.row.enabled ? 'block' : 'check_circle'"
              :color="props.row.enabled ? 'negative' : 'positive'"
              size="sm"
              @click="toggleUserStatus(props.row)"
            >
              <q-tooltip>
                {{ props.row.enabled ? 'Deshabilitar' : 'Habilitar' }}
              </q-tooltip>
            </q-btn>
          </div>
        </template>

        <template #no-data>
          <EmptyState
            icon="people"
            title="No hay usuarios disponibles"
            description="No se encontraron usuarios que coincidan con los filtros aplicados."
          >
            <template #actions>
              <q-btn
                v-if="hasActiveFilters"
                flat
                color="primary"
                label="Limpiar filtros"
                @click="clearAllFilters"
              />
              <q-btn
                color="primary"
                unelevated
                icon="add"
                label="Crear Usuario"
                to="/users/new"
              />
            </template>
          </EmptyState>
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
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { debounce } from 'quasar';
import type { QTableColumn, QTableProps } from 'quasar';
import type { User, UserFilters, UserStatistics } from '../../../domain/user/models';
import EmptyState from '../../../shared/components/EmptyState.vue';
import FiltersPanel from '../../../shared/components/FiltersPanel.vue';

const router = useRouter();
const $q = useQuasar();

// Estado
const loading = ref(false);
const users = ref<User[]>([]);
const selectedUsers = ref<User[]>([]);
const filters = ref<UserFilters>({
  search: '',
  role: null,
  status: null,
  personType: null,
  isExternal: null,
});

const pagination = ref<QTableProps['pagination']>({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

const statistics = ref<UserStatistics>({
  total: 0,
  enabled: 0,
  disabled: 0,
  external: 0,
  byRole: {
    admin: 0,
    institutional: 0,
    driver: 0,
  },
  byType: {
    natural: 0,
    juridica: 0,
  },
});

// Opciones de filtros
const roleOptions = [
  { label: 'Administrador', value: 'admin' },
  { label: 'Cliente Institucional', value: 'institutional' },
  { label: 'Conductor', value: 'driver' },
];

const statusOptions = [
  { label: 'Habilitado', value: 'enabled' },
  { label: 'Deshabilitado', value: 'disabled' },
];

const personTypeOptions = [
  { label: 'Persona Natural', value: 'natural' },
  { label: 'Persona Jurídica', value: 'juridica' },
];

// Columnas de la tabla
const columns: QTableColumn<User>[] = [
  {
    name: 'name',
    field: 'name',
    label: 'Nombre',
    align: 'left',
    sortable: true,
  },
  {
    name: 'email',
    field: 'email',
    label: 'Email',
    align: 'left',
    sortable: true,
  },
  {
    name: 'document',
    field: 'document',
    label: 'Documento',
    align: 'left',
  },
  {
    name: 'role',
    field: 'role',
    label: 'Rol',
    align: 'center',
    sortable: true,
  },
  {
    name: 'type',
    field: 'personType',
    label: 'Tipo',
    align: 'center',
  },
  {
    name: 'status',
    field: 'enabled',
    label: 'Estado',
    align: 'center',
    sortable: true,
  },
  {
    name: 'company',
    field: 'company',
    label: 'Empresa',
    align: 'left',
  },
  {
    name: 'actions',
    label: 'Acciones',
    align: 'center',
    field: () => '',
  },
];

// Computed
const filteredUsers = computed(() => {
  let result = [...users.value];

  // Filtro de búsqueda
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase();
    result = result.filter(
      (user) =>
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.document.includes(search),
    );
  }

  // Filtro por rol
  if (filters.value.role) {
    result = result.filter((user) => user.role === filters.value.role);
  }

  // Filtro por estado
  if (filters.value.status) {
    const enabled = filters.value.status === 'enabled';
    result = result.filter((user) => user.enabled === enabled);
  }

  // Filtro por tipo de persona
  if (filters.value.personType) {
    result = result.filter((user) => user.personType === filters.value.personType);
  }

  // Filtro por externo
  if (filters.value.isExternal !== null) {
    result = result.filter((user) => user.isExternal === filters.value.isExternal);
  }

  return result;
});

const activeFiltersCount = computed(() => {
  let count = 0;
  if (filters.value.search) count++;
  if (filters.value.role) count++;
  if (filters.value.status) count++;
  if (filters.value.personType) count++;
  if (filters.value.isExternal !== null) count++;
  return count;
});

const hasActiveFilters = computed(() => activeFiltersCount.value > 0);

// Funciones
function loadUsers() {
  loading.value = true;
  // Simular carga de datos (mock)
  setTimeout(() => {
    users.value = [
      {
        id: '1',
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        document: '12345678',
        documentType: 'CC',
        phone: '+57 300 123 4567',
        role: 'driver',
        personType: 'natural',
        enabled: true,
        isExternal: false,
        company: 'Transportes ABC',
        createdAt: '2025-01-15',
      },
      {
        id: '2',
        name: 'María González',
        email: 'maria.gonzalez@example.com',
        document: '87654321',
        documentType: 'CC',
        phone: '+57 300 987 6543',
        role: 'driver',
        personType: 'natural',
        enabled: true,
        isExternal: true,
        createdAt: '2025-01-10',
      },
      {
        id: '3',
        name: 'Empresa Transportes XYZ',
        email: 'contacto@transportesxyz.com',
        document: '900123456',
        documentType: 'NIT',
        phone: '+57 1 234 5678',
        role: 'institutional',
        personType: 'juridica',
        enabled: true,
        companyName: 'Transportes XYZ S.A.S.',
        createdAt: '2025-01-05',
      },
      {
        id: '4',
        name: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@example.com',
        document: '11223344',
        documentType: 'CC',
        phone: '+57 300 555 1234',
        role: 'driver',
        personType: 'natural',
        enabled: false,
        isExternal: false,
        createdAt: '2025-01-20',
      },
      {
        id: '5',
        name: 'Ana Martínez',
        email: 'ana.martinez@example.com',
        document: '55667788',
        documentType: 'CE',
        phone: '+57 300 777 8888',
        role: 'driver',
        personType: 'natural',
        enabled: true,
        isExternal: true,
        createdAt: '2025-01-18',
      },
    ];

    calculateStatistics();
    pagination.value = {
      ...pagination.value,
      rowsNumber: filteredUsers.value.length,
    };
    loading.value = false;
  }, 500);
}

function calculateStatistics() {
  statistics.value = {
    total: users.value.length,
    enabled: users.value.filter((u) => u.enabled).length,
    disabled: users.value.filter((u) => !u.enabled).length,
    external: users.value.filter((u) => u.isExternal).length,
    byRole: {
      admin: users.value.filter((u) => u.role === 'admin').length,
      institutional: users.value.filter((u) => u.role === 'institutional').length,
      driver: users.value.filter((u) => u.role === 'driver').length,
    },
    byType: {
      natural: users.value.filter((u) => u.personType === 'natural').length,
      juridica: users.value.filter((u) => u.personType === 'juridica').length,
    },
  };
}

const debouncedSearch = debounce(() => {
  pagination.value = {
    ...pagination.value,
    page: 1,
  };
}, 300);

function onRequest(props: { pagination: QTableProps['pagination'] }) {
  pagination.value = props.pagination;
  // Aquí se haría la petición al backend con los filtros y paginación
}

function clearAllFilters() {
  filters.value = {
    search: '',
    role: null,
    status: null,
    personType: null,
    isExternal: null,
  };
  pagination.value = {
    ...pagination.value,
    page: 1,
  };
}

function clearSelection() {
  selectedUsers.value = [];
}

function bulkEnable() {
  if (selectedUsers.value.length === 0) return;

  $q.dialog({
    title: 'Confirmar acción',
    message: `¿Está seguro de habilitar ${selectedUsers.value.length} usuario(s)?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    selectedUsers.value.forEach((user) => {
      user.enabled = true;
    });
    calculateStatistics();
    clearSelection();
    $q.notify({
      type: 'positive',
      message: `${selectedUsers.value.length} usuario(s) habilitado(s) exitosamente`,
      position: 'top',
    });
  });
}

function bulkDisable() {
  if (selectedUsers.value.length === 0) return;

  $q.dialog({
    title: 'Confirmar acción',
    message: `¿Está seguro de deshabilitar ${selectedUsers.value.length} usuario(s)?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    selectedUsers.value.forEach((user) => {
      user.enabled = false;
    });
    calculateStatistics();
    clearSelection();
    $q.notify({
      type: 'info',
      message: `${selectedUsers.value.length} usuario(s) deshabilitado(s) exitosamente`,
      position: 'top',
    });
  });
}

function toggleUserStatus(user: User) {
  const action = user.enabled ? 'deshabilitar' : 'habilitar';
  $q.dialog({
    title: 'Confirmar acción',
    message: `¿Está seguro de ${action} a ${user.name}?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    user.enabled = !user.enabled;
    calculateStatistics();
    $q.notify({
      type: 'positive',
      message: `Usuario ${action}do exitosamente`,
      position: 'top',
    });
  });
}

function viewUser(id: string) {
  void router.push(`/users/${id}`);
}

function editUser(id: string) {
  void router.push(`/users/${id}?edit=true`);
}

function handleExport() {
  // Placeholder para exportación
}

function exportToCSV() {
  const headers = ['Nombre', 'Email', 'Documento', 'Rol', 'Tipo', 'Estado', 'Empresa'];
  const rows = filteredUsers.value.map((user) => [
    user.name,
    user.email,
    user.document,
    getRoleLabel(user.role),
    user.personType === 'juridica' ? 'Jurídica' : 'Natural',
    user.enabled ? 'Habilitado' : 'Deshabilitado',
    user.company || '',
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();

  $q.notify({
    type: 'positive',
    message: 'Archivo CSV exportado exitosamente',
    position: 'top',
  });
}

function exportToExcel() {
  $q.notify({
    type: 'info',
    message: 'Exportación a Excel próximamente',
    position: 'top',
  });
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: 'Administrador',
    institutional: 'Cliente Institucional',
    driver: 'Conductor',
  };
  return labels[role] ?? role;
}

function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    admin: 'purple',
    institutional: 'blue',
    driver: 'green',
  };
  return colors[role] ?? 'grey';
}

// Watchers
watch(
  () => filters.value,
  () => {
    pagination.value = {
      ...pagination.value,
      page: 1,
    };
  },
  { deep: true },
);

// Lifecycle
onMounted(() => {
  loadUsers();
});
</script>

<style scoped lang="scss">
.users-list-page {
  background: #f9fafb;
  transition: background-color 0.3s ease;
}

body.body--dark .users-list-page {
  background: #0f172a;
}

.stat-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

body.body--dark .stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
</style>

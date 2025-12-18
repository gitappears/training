<template>
  <q-page class="q-pa-xl column q-gutter-lg">
    <div class="row items-center justify-between">
      <div>
        <div class="heading-main q-mb-xs">Gestión de usuarios</div>
        <div class="heading-sub">
          Administra conductores, empresas y administradores del sistema.
        </div>
      </div>
      <q-btn color="primary" unelevated icon="add" label="Nuevo usuario" to="/users/new" />
    </div>

    <!-- Filtros -->
    <q-card class="q-pa-md">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <q-input
            v-model="filters.search"
            outlined
            dense
            placeholder="Buscar por nombre, email o documento..."
            clearable
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-md-3">
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
            placeholder="Filtrar por rol"
          />
        </div>
        <div class="col-12 col-md-3">
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
            placeholder="Filtrar por estado"
          />
        </div>
        <div class="col-12 col-md-2">
          <q-btn
            color="primary"
            unelevated
            label="Filtrar"
            class="full-width"
            @click="applyFilters"
          />
        </div>
      </div>
    </q-card>

    <!-- Tabla de usuarios -->
    <q-card>
      <q-table
        :rows="users"
        :columns="columns"
        row-key="id"
        :loading="loading"
        flat
        :pagination="{ rowsPerPage: 10 }"
      >
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

        <template #body-cell-actions="props">
          <div class="row q-gutter-xs">
            <q-btn
              flat
              dense
              round
              icon="visibility"
              color="primary"
              @click="viewUser(props.row.id)"
            />
            <q-btn
              flat
              dense
              round
              icon="edit"
              color="primary"
              @click="editUser(props.row.id)"
            />
            <q-btn
              flat
              dense
              round
              :icon="props.row.enabled ? 'block' : 'check_circle'"
              :color="props.row.enabled ? 'negative' : 'positive'"
              @click="toggleUserStatus(props.row.id)"
            />
          </div>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { QTableColumn } from 'quasar';

const router = useRouter();

interface User {
  id: string;
  name: string;
  email: string;
  document: string;
  phone: string;
  role: 'admin' | 'institutional' | 'driver';
  enabled: boolean;
  company?: string;
  createdAt: string;
}

const loading = ref(false);
const filters = ref({
  search: '',
  role: null as string | null,
  status: null as string | null,
});

const roleOptions = [
  { label: 'Administrador', value: 'admin' },
  { label: 'Cliente Institucional', value: 'institutional' },
  { label: 'Conductor', value: 'driver' },
];

const statusOptions = [
  { label: 'Habilitado', value: 'enabled' },
  { label: 'Deshabilitado', value: 'disabled' },
];

const users = ref<User[]>([
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan.perez@example.com',
    document: '12345678',
    phone: '+57 300 123 4567',
    role: 'driver',
    enabled: true,
    company: 'Transportes ABC',
    createdAt: '2025-01-15',
  },
  {
    id: '2',
    name: 'María González',
    email: 'maria.gonzalez@example.com',
    document: '87654321',
    phone: '+57 300 987 6543',
    role: 'driver',
    enabled: true,
    createdAt: '2025-01-10',
  },
  {
    id: '3',
    name: 'Empresa Transportes XYZ',
    email: 'contacto@transportesxyz.com',
    document: '900123456',
    phone: '+57 1 234 5678',
    role: 'institutional',
    enabled: true,
    createdAt: '2025-01-05',
  },
  {
    id: '4',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@example.com',
    document: '11223344',
    phone: '+57 300 555 1234',
    role: 'driver',
    enabled: false,
    createdAt: '2025-01-20',
  },
]);

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
  },
  {
    name: 'status',
    field: 'enabled',
    label: 'Estado',
    align: 'center',
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

function viewUser(id: string) {
  void router.push(`/users/${id}`);
}

function editUser(id: string) {
  void router.push(`/users/${id}?edit=true`);
}

function toggleUserStatus(id: string) {
  const user = users.value.find((u) => u.id === id);
  if (user) {
    user.enabled = !user.enabled;
    // Aquí se llamaría al servicio HTTP para actualizar el estado
    console.log(`Usuario ${id} ${user.enabled ? 'habilitado' : 'deshabilitado'}`);
  }
}

function applyFilters() {
  // Aquí se aplicaría la lógica de filtrado
  console.log('Aplicando filtros:', filters.value);
}
</script>


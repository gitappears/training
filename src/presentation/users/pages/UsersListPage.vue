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
        @click="createUser"
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
          {{ selectedUsers.length }} usuario{{ selectedUsers.length > 1 ? 's' : '' }} seleccionado{{
            selectedUsers.length > 1 ? 's' : ''
          }}
        </div>
        <div class="row q-gutter-sm">
          <q-btn
            flat
            color="positive"
            icon="check_circle"
            label="Habilitar"
            @click="handleBulkEnable"
          />
          <q-btn
            flat
            color="negative"
            icon="block"
            label="Deshabilitar"
            @click="handleBulkDisable"
          />
          <q-btn flat color="grey-7" icon="close" label="Deseleccionar" @click="clearSelection" />
        </div>
      </div>
    </q-card>

    <!-- Users Table -->
    <q-card flat bordered>
      <q-table
        v-model:selected="selectedUsers"
        :rows="users"
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
              <q-btn flat dense icon="download" color="primary" label="Exportar">
                <q-menu>
                  <q-list>
                    <q-item clickable v-close-popup @click="handleExportToCSV">
                      <q-item-section avatar>
                        <q-icon name="description" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>Exportar a CSV</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="handleExportToExcel">
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
                @click="handleToggleUserStatus(props.row)"
              >
                <q-tooltip>
                  {{ props.row.enabled ? 'Deshabilitar' : 'Habilitar' }}
                </q-tooltip>
              </q-btn>
            </div>
          </q-td>
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
                @click="createUser"
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
import { onMounted } from 'vue';
import { useUserList, useUserRoles } from '../composables';
import EmptyState from '../../../shared/components/EmptyState.vue';
import FiltersPanel from '../../../shared/components/FiltersPanel.vue';

const {
  loading,
  users,
  statistics,
  filters,
  selectedUsers,
  pagination,
  columns,
  activeFiltersCount,
  hasActiveFilters,
  loadUsers,
  onRequest,
  clearAllFilters,
  clearSelection,
  handleToggleUserStatus,
  handleBulkEnable,
  handleBulkDisable,
  viewUser,
  editUser,
  createUser,
  handleExportToCSV,
  handleExportToExcel,
} = useUserList();

const { roleOptions, statusOptions, personTypeOptions, getRoleLabel, getRoleColor } =
  useUserRoles();

// Lifecycle
onMounted(() => {
  void loadUsers();
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
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

body.body--dark .stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
</style>

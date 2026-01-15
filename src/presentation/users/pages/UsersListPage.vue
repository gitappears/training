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
            color="primary"
            icon="school"
            label="Asignar Cursos"
            @click="openBulkAssignDialog"
          />
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
    <UsersTable
      v-model:selected="selectedUsers"
      :users="users"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      :selected-users="selectedUsers"
      :has-active-filters="hasActiveFilters"
      :accepting-terms="acceptingTerms"
      @request="onRequest"
      @view-user="viewUser"
      @edit-user="handleEditUser"
      @toggle-status="handleToggleUserStatus"
      @accept-terms="handleAcceptTerms"
      @export-csv="handleExportToCSV"
      @export-excel="handleExportToExcel"
      @clear-filters="clearAllFilters"
      @create-user="createUser"
    />

    <!-- Edit User Dialog -->
    <UserEditDialog v-model="editDialogOpen" :user="userToEdit" @success="handleEditSuccess" />

    <!-- Bulk Assign Courses Dialog -->
    <BulkAssignCoursesDialog
      v-model="bulkAssignDialogOpen"
      :selected-users="selectedUsers"
      @success="handleBulkAssignSuccess"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserList, useUserRoles } from '../composables';
import FiltersPanel from '../../../shared/components/FiltersPanel.vue';
import UsersTable from '../components/UsersTable.vue';
import UserEditDialog from '../components/UserEditDialog.vue';
import BulkAssignCoursesDialog from '../components/BulkAssignCoursesDialog.vue';
import type { User } from '../../../domain/user/models';

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
  acceptingTerms,
  loadUsers,
  onRequest,
  clearAllFilters,
  clearSelection,
  handleToggleUserStatus,
  handleBulkEnable,
  handleBulkDisable,
  handleAcceptTerms,
  viewUser,
  createUser,
  handleExportToCSV,
  handleExportToExcel,
} = useUserList();

const { roleOptions, statusOptions, personTypeOptions } = useUserRoles();

const editDialogOpen = ref(false);
const userToEdit = ref<User | null>(null);
const bulkAssignDialogOpen = ref(false);

function handleEditUser(user: User) {
  userToEdit.value = user;
  editDialogOpen.value = true;
}

function handleEditSuccess() {
  editDialogOpen.value = false;
  userToEdit.value = null;
  void loadUsers();
}

function openBulkAssignDialog() {
  bulkAssignDialogOpen.value = true;
}

function handleBulkAssignSuccess() {
  bulkAssignDialogOpen.value = false;
  clearSelection();
  void loadUsers();
}

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

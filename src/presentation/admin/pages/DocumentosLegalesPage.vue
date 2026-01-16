<template>
  <q-page padding>
    <div class="q-pa-md">
      <!-- Header -->
      <div class="row items-center justify-between q-mb-md">
        <div>
          <h4 class="text-h4 q-ma-none">📄 Documentos Legales</h4>
          <p class="text-grey-7">
            Gestiona los términos, políticas y documentos legales del sistema
          </p>
        </div>
        <q-btn color="primary" icon="add" label="Nuevo Documento" @click="navigateToCreate" />
      </div>

      <!-- Filtros -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-select
                v-model="filtroTipo"
                :options="tiposDocumento"
                label="Tipo de Documento"
                outlined
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="filtroActivo"
                :options="opcionesEstado"
                label="Estado"
                outlined
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-md-4 flex items-end">
              <q-btn
                flat
                color="grey-7"
                icon="refresh"
                label="Limpiar Filtros"
                @click="limpiarFiltros"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Tabla de Documentos -->
      <q-card>
        <q-inner-loading :showing="loading">
          <q-spinner size="50px" color="primary" />
        </q-inner-loading>

        <q-table
          :rows="documentosFiltrados"
          :columns="columnas"
          row-key="id"
          :loading="loading"
          :pagination="{ rowsPerPage: 10 }"
          flat
        >
          <template v-slot:body-cell-tipo="props">
            <q-td :props="props">
              <q-badge :color="getColorTipo(props.value)" :label="props.value" />
            </q-td>
          </template>

          <template v-slot:body-cell-activo="props">
            <q-td :props="props">
              <q-toggle
                :model-value="props.value"
                @update:model-value="toggleActivo(props.row.id, $event)"
                :disable="loading"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <q-btn
                flat
                round
                dense
                icon="visibility"
                color="info"
                @click="verDocumento(props.row)"
              >
                <q-tooltip>Ver Documento</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                icon="edit"
                color="primary"
                @click="editarDocumento(props.row.id)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                icon="delete"
                color="negative"
                @click="confirmarEliminar(props.row)"
              >
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- Dialog de Visualización de Documento -->
    <q-dialog v-model="showViewDialog" maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ documentoAVisualizar?.titulo }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-6">
              <div class="text-caption text-grey-7">Tipo</div>
              <q-badge
                :color="getColorTipo(documentoAVisualizar?.tipo || '')"
                :label="documentoAVisualizar?.tipo"
              />
            </div>
            <div class="col-12 col-md-6">
              <div class="text-caption text-grey-7">Versión</div>
              <div class="text-body1">{{ documentoAVisualizar?.version }}</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="text-caption text-grey-7">Estado</div>
              <q-badge :color="documentoAVisualizar?.activo ? 'positive' : 'negative'">
                {{ documentoAVisualizar?.activo ? 'Activo' : 'Inactivo' }}
              </q-badge>
            </div>
            <div class="col-12 col-md-6">
              <div class="text-caption text-grey-7">Fecha de Creación</div>
              <div class="text-body1">
                {{ documentoAVisualizar?.fechaCreacion.toLocaleDateString('es-CO') }}
              </div>
            </div>
            <div class="col-12" v-if="documentoAVisualizar?.requiereFirmaDigital">
              <q-badge color="orange" icon="verified_user"> Requiere Firma Digital </q-badge>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div class="text-subtitle2 q-mb-sm">Contenido del Documento</div>
          <div class="documento-contenido q-pa-md" v-html="documentoAVisualizar?.contenido" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="grey-7" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog de Confirmación de Eliminación -->
    <q-dialog v-model="showDeleteDialog">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm text-h6">Confirmar Eliminación</span>
        </q-card-section>

        <q-card-section>
          <p>
            ¿Está seguro de que desea eliminar el documento
            <strong>"{{ documentoAEliminar?.titulo }}"</strong>?
          </p>
          <p class="text-caption text-grey-7">Esta acción no se puede deshacer.</p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            flat
            label="Eliminar"
            color="negative"
            @click="eliminarDocumento"
            :loading="loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useDocumentosLegales } from '../composables/useDocumentosLegales';
import { useDocumentosLegalesTable } from '../composables/useDocumentosLegalesTable';

// Composables
const {
  documentos,
  loading,
  showDeleteDialog,
  documentoAEliminar,
  showViewDialog,
  documentoAVisualizar,
  filtroTipo,
  filtroActivo,
  tiposDocumento,
  opcionesEstado,
  documentosFiltrados,
  cargarDocumentos,
  toggleActivo,
  editarDocumento,
  navigateToCreate,
  confirmarEliminar,
  eliminarDocumento,
  limpiarFiltros,
  getColorTipo,
  verDocumento,
} = useDocumentosLegales();

const { columnas } = useDocumentosLegalesTable();

onMounted(() => {
  void cargarDocumentos();
});
</script>

<style scoped>
.q-table {
  min-height: 300px;
}

.documento-contenido {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  background-color: #fafafa;
  max-height: 60vh;
  overflow-y: auto;
}

.documento-contenido :deep(h1),
.documento-contenido :deep(h2),
.documento-contenido :deep(h3) {
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.documento-contenido :deep(p) {
  margin-bottom: 1em;
}

.documento-contenido :deep(ul),
.documento-contenido :deep(ol) {
  margin-left: 2em;
  margin-bottom: 1em;
}
</style>

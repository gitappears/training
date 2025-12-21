<template>
  <q-page padding>
    <div class="q-pa-md">
      <!-- Header -->
      <div class="row items-center q-mb-md">
        <div class="col">
          <h4 class="text-h4 q-ma-none">📋 Certificados Próximos a Vencer</h4>
          <p class="text-grey-7">Gestión de vigencias y renovaciones</p>
        </div>
        <div class="col-auto">
          <q-btn
            color="primary"
            icon="refresh"
            label="Actualizar"
            @click="cargarDatos"
            :loading="cargando"
          />
        </div>
      </div>

      <!-- Filtros -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-3">
              <q-input
                v-model="filtros.busqueda"
                label="Buscar"
                placeholder="Alumno, curso, certificado..."
                outlined
                dense
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-3">
              <q-select
                v-model="filtros.estado"
                :options="estadoOptions"
                label="Estado"
                outlined
                dense
                clearable
                emit-value
                map-options
              />
            </div>

            <div class="col-12 col-md-3">
              <q-input
                v-model="filtros.fechaDesde"
                label="Vence desde"
                type="date"
                outlined
                dense
                clearable
              />
            </div>

            <div class="col-12 col-md-3">
              <q-input
                v-model="filtros.fechaHasta"
                label="Vence hasta"
                type="date"
                outlined
                dense
                clearable
              />
            </div>
          </div>

          <div class="row q-mt-md">
            <q-btn
              color="primary"
              label="Aplicar Filtros"
              @click="aplicarFiltros"
              :disable="cargando"
            />
            <q-btn
              flat
              label="Limpiar"
              @click="limpiarFiltros"
              class="q-ml-sm"
            />
            <q-space />
            <q-btn
              color="green"
              icon="download"
              label="Exportar Excel"
              @click="exportarExcel"
              :disable="!certificados.length"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Tabla -->
      <q-card>
        <q-table
          :rows="certificados"
          :columns="columns"
          :loading="cargando"
          row-key="id"
          :pagination="paginacion"
          @request="onPaginacionChange"
        >
          <!-- Estado Badge -->
          <template v-slot:body-cell-estado="props">
            <q-td :props="props">
              <q-badge :color="getEstadoColor(props.row.diasRestantes)">
                {{ getEstadoLabel(props.row.diasRestantes) }}
              </q-badge>
            </q-td>
          </template>

          <!-- Días Restantes -->
          <template v-slot:body-cell-diasRestantes="props">
            <q-td :props="props">
              <div
                :class="[
                  'text-weight-bold',
                  'text-center',
                  getDiasClass(props.row.diasRestantes),
                ]"
              >
                {{
                  props.row.diasRestantes < 0
                    ? 'VENCIDO'
                    : `${props.row.diasRestantes} días`
                }}
              </div>
            </q-td>
          </template>

          <!-- Fecha Vencimiento -->
          <template v-slot:body-cell-fechaVencimiento="props">
            <q-td :props="props">
              {{ formatearFecha(props.row.fechaVencimiento) }}
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from 'boot/axios';
import { useQuasar } from 'quasar';

const $q = useQuasar();

const cargando = ref(false);
const certificados = ref([]);

const filtros = ref({
  busqueda: '',
  estado: null,
  fechaDesde: '',
  fechaHasta: '',
});

const paginacion = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

const estadoOptions = [
  { label: 'Activo', value: 'ACTIVE' },
  { label: 'Próximo a Vencer', value: 'EXPIRING_SOON' },
  { label: 'Vencido', value: 'EXPIRED' },
];

const columns = [
  {
    name: 'numeroCertificado',
    label: 'Nº Certificado',
    field: 'numeroCertificado',
    align: 'left',
    sortable: true,
  },
  {
    name: 'alumno',
    label: 'Alumno',
    field: (row: any) =>
      `${row.inscripcion?.alumno?.persona?.nombres || ''} ${row.inscripcion?.alumno?.persona?.apellidos || ''}`,
    align: 'left',
    sortable: true,
  },
  {
    name: 'curso',
    label: 'Curso',
    field: (row: any) => row.inscripcion?.capacitacion?.titulo || '',
    align: 'left',
    sortable: true,
  },
  {
    name: 'fechaVencimiento',
    label: 'Fecha Vencimiento',
    field: 'fechaVencimiento',
    align: 'center',
    sortable: true,
  },
  {
    name: 'diasRestantes',
    label: 'Días Restantes',
    field: 'diasRestantes',
    align: 'center',
    sortable: true,
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    align: 'center',
  },
];

onMounted(() => {
  cargarDatos();
});

const cargarDatos = async () => {
  cargando.value = true;
  try {
    const params: any = {
      pagina: paginacion.value.page,
      limite: paginacion.value.rowsPerPage,
    };

    if (filtros.value.busqueda) params.busqueda = filtros.value.busqueda;
    if (filtros.value.estado) params.estado = filtros.value.estado;
    if (filtros.value.fechaDesde) params.fechaVencimientoDesde = filtros.value.fechaDesde;
    if (filtros.value.fechaHasta) params.fechaVencimientoHasta = filtros.value.fechaHasta;

    const { data } = await api.get('/certificates/expiring-report', { params });

    certificados.value = data.certificados;
    paginacion.value.rowsNumber = data.total;
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar certificados',
    });
  } finally {
    cargando.value = false;
  }
};

const aplicarFiltros = () => {
  paginacion.value.page = 1;
  cargarDatos();
};

const limpiarFiltros = () => {
  filtros.value = {
    busqueda: '',
    estado: null,
    fechaDesde: '',
    fechaHasta: '',
  };
  aplicarFiltros();
};

const onPaginacionChange = (props: any) => {
  paginacion.value.page = props.pagination.page;
  paginacion.value.rowsPerPage = props.pagination.rowsPerPage;
  cargarDatos();
};

const getEstadoColor = (diasRestantes: number) => {
  if (diasRestantes < 0) return 'red';
  if (diasRestantes <= 7) return 'orange';
  if (diasRestantes <= 30) return 'amber';
  return 'green';
};

const getEstadoLabel = (diasRestantes: number) => {
  if (diasRestantes < 0) return 'Vencido';
  if (diasRestantes <= 7) return 'Urgente';
  if (diasRestantes <= 30) return 'Próximo';
  return 'Activo';
};

const getDiasClass = (diasRestantes: number) => {
  if (diasRestantes < 0) return 'text-red';
  if (diasRestantes <= 7) return 'text-orange';
  return 'text-amber';
};

const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const exportarExcel = () => {
  $q.notify({
    type: 'info',
    message: 'Exportación en desarrollo...',
  });
  // TODO: Implementar exportación con exceljs
};
</script>

<style scoped>
.text-red {
  color: #f44336;
}
.text-orange {
  color: #ff9800;
}
.text-amber {
  color: #ffc107;
}
</style>

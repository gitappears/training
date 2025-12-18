<template>
  <q-page class="q-pa-xl column q-gutter-lg">
    <div class="row items-center justify-between">
      <div>
        <div class="heading-main q-mb-xs">Detalle de usuario</div>
        <div class="heading-sub">Información completa del usuario seleccionado.</div>
      </div>
      <div class="row q-gutter-sm">
        <q-btn flat label="Volver" icon="arrow_back" @click="goBack" />
        <q-btn color="primary" unelevated label="Editar" icon="edit" @click="editMode = true" />
      </div>
    </div>

    <q-card class="q-pa-lg">
      <q-tabs
        v-model="tab"
        dense
        class="text-primary"
        active-color="primary"
        indicator-color="primary"
      >
        <q-tab name="info" label="Información" />
        <q-tab name="courses" label="Cursos asignados" />
        <q-tab name="certificates" label="Certificados" />
        <q-tab name="activity" label="Actividad" />
      </q-tabs>
      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="info">
          <div class="row q-col-gutter-lg q-mt-md">
            <div class="col-12 col-md-6">
              <div class="text-subtitle2 q-mb-sm">Datos personales</div>
              <q-list bordered separator>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Nombre completo</q-item-label>
                    <q-item-label>{{ user.name }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Documento</q-item-label>
                    <q-item-label>{{ user.document }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Email</q-item-label>
                    <q-item-label>{{ user.email }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Teléfono</q-item-label>
                    <q-item-label>{{ user.phone }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <div class="col-12 col-md-6">
              <div class="text-subtitle2 q-mb-sm">Información del sistema</div>
              <q-list bordered separator>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Rol</q-item-label>
                    <q-item-label>
                      <q-badge :color="getRoleColor(user.role)" outline>
                        {{ getRoleLabel(user.role) }}
                      </q-badge>
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Estado</q-item-label>
                    <q-item-label>
                      <q-badge :color="user.enabled ? 'positive' : 'negative'" outline>
                        {{ user.enabled ? 'Habilitado' : 'Deshabilitado' }}
                      </q-badge>
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item v-if="user.company">
                  <q-item-section>
                    <q-item-label caption>Empresa</q-item-label>
                    <q-item-label>{{ user.company }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Fecha de registro</q-item-label>
                    <q-item-label>{{ user.createdAt }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="courses">
          <div class="q-mt-md">
            <div class="text-subtitle1 q-mb-sm">Cursos asignados</div>
            <q-table
              :rows="assignedCourses"
              :columns="courseColumns"
              row-key="id"
              flat
              :pagination="{ rowsPerPage: 10 }"
            >
              <template #body-cell-status="props">
                <q-badge :color="getCourseStatusColor(props.row.status)" outline>
                  {{ props.row.status }}
                </q-badge>
              </template>
            </q-table>
          </div>
        </q-tab-panel>

        <q-tab-panel name="certificates">
          <div class="q-mt-md">
            <div class="text-subtitle1 q-mb-sm">Certificados obtenidos</div>
            <q-list bordered separator>
              <q-item
                v-for="certificate in certificates"
                :key="certificate.id"
                clickable
                @click="viewCertificate(certificate.id)"
              >
                <q-item-section avatar>
                  <q-icon name="verified" color="primary" size="32px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ certificate.courseName }}</q-item-label>
                  <q-item-label caption>
                    Emitido: {{ certificate.issuedDate }} · Vence: {{ certificate.expiryDate }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge :color="certificate.valid ? 'positive' : 'negative'" outline>
                    {{ certificate.valid ? 'Válido' : 'Vencido' }}
                  </q-badge>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-tab-panel>

        <q-tab-panel name="activity">
          <div class="q-mt-md">
            <div class="text-subtitle1 q-mb-sm">Actividad reciente</div>
            <q-timeline color="primary" layout="comfortable" side="right">
              <q-timeline-entry
                v-for="activity in activities"
                :key="activity.id"
                :title="activity.title"
                :subtitle="activity.date"
                :icon="activity.icon"
                :color="activity.color"
              >
                <div class="text-body2">{{ activity.description }}</div>
              </q-timeline-entry>
            </q-timeline>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { QTableColumn } from 'quasar';

const route = useRoute();
const router = useRouter();

const editMode = ref(false);
const tab = ref<'info' | 'courses' | 'certificates' | 'activity'>('info');

const userId = route.params.id as string;

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

const user = ref<User>({
  id: userId,
  name: 'Juan Pérez',
  email: 'juan.perez@example.com',
  document: '12345678',
  phone: '+57 300 123 4567',
  role: 'driver',
  enabled: true,
  company: 'Transportes ABC',
  createdAt: '2025-01-15',
});

const assignedCourses = ref([
  {
    id: '1',
    courseName: 'Manejo Defensivo',
    status: 'En progreso',
    progress: 65,
    enrolledDate: '2025-01-10',
  },
  {
    id: '2',
    courseName: 'Primeros Auxilios',
    status: 'Completado',
    progress: 100,
    enrolledDate: '2025-01-05',
  },
]);

const certificates = ref([
  {
    id: '1',
    courseName: 'Primeros Auxilios',
    issuedDate: '2025-01-15',
    expiryDate: '2026-01-15',
    valid: true,
  },
]);

const activities = ref([
  {
    id: '1',
    title: 'Curso completado',
    description: 'Completó el curso "Primeros Auxilios"',
    date: '2025-01-15',
    icon: 'check_circle',
    color: 'positive',
  },
  {
    id: '2',
    title: 'Inscripción',
    description: 'Se inscribió en el curso "Manejo Defensivo"',
    date: '2025-01-10',
    icon: 'school',
    color: 'primary',
  },
]);

const courseColumns: QTableColumn[] = [
  { name: 'courseName', field: 'courseName', label: 'Curso', align: 'left' },
  { name: 'status', field: 'status', label: 'Estado', align: 'center' },
  { name: 'progress', field: 'progress', label: 'Progreso', align: 'center' },
  { name: 'enrolledDate', field: 'enrolledDate', label: 'Fecha inscripción', align: 'left' },
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

function getCourseStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'En progreso': 'info',
    Completado: 'positive',
    Pendiente: 'warning',
  };
  return colors[status] ?? 'grey';
}

function viewCertificate(id: string) {
  void router.push(`/certificates/${id}`);
}

function goBack() {
  void router.push('/users');
}
</script>


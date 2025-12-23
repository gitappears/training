<template>
  <q-page class="user-detail-page q-pa-xl">
    <q-inner-loading :showing="loading" />

    <!-- Header -->
    <div class="row items-center justify-between q-mb-xl">
      <div class="col">
        <div class="row items-center q-gutter-md q-mb-sm">
          <q-btn
            flat
            round
            icon="arrow_back"
            color="primary"
            @click="goBack"
          >
            <q-tooltip>Volver</q-tooltip>
          </q-btn>
          <div>
            <div class="text-h4 text-weight-bold text-primary q-mb-xs">{{ user.name }}</div>
            <div class="text-body2 text-grey-7">
              {{ user.email }} · {{ user.document }}
            </div>
          </div>
        </div>
      </div>
      <div class="row q-gutter-sm">
        <q-btn
          flat
          :color="user.enabled ? 'negative' : 'positive'"
          :icon="user.enabled ? 'block' : 'check_circle'"
          :label="user.enabled ? 'Deshabilitar' : 'Habilitar'"
          @click="handleToggleUserStatus"
        />
        <q-btn
          flat
          color="primary"
          icon="edit"
          label="Editar"
          @click="editUser"
        />
        <q-btn
          color="primary"
          unelevated
          icon="person_add"
          label="Asignar Curso"
          @click="assignCourse"
        />
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-gutter-sm">
              <q-avatar size="40px" color="primary" text-color="white" icon="school" />
              <div class="col">
                <div class="text-caption text-grey-6">Cursos Asignados</div>
                <div class="text-h6 text-weight-bold">{{ assignedCourses.length }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-gutter-sm">
              <q-avatar size="40px" color="positive" text-color="white" icon="verified" />
              <div class="col">
                <div class="text-caption text-grey-6">Certificados</div>
                <div class="text-h6 text-weight-bold">{{ certificates.length }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-gutter-sm">
              <q-avatar size="40px" color="info" text-color="white" icon="trending_up" />
              <div class="col">
                <div class="text-caption text-grey-6">Progreso Promedio</div>
                <div class="text-h6 text-weight-bold">{{ averageProgress }}%</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="stat-card">
          <q-card-section class="q-pa-md">
            <div class="row items-center q-gutter-sm">
              <q-avatar
                size="40px"
                :color="user.enabled ? 'positive' : 'negative'"
                text-color="white"
                :icon="user.enabled ? 'check_circle' : 'block'"
              />
              <div class="col">
                <div class="text-caption text-grey-6">Estado</div>
                <div class="text-h6 text-weight-bold">
                  {{ user.enabled ? 'Habilitado' : 'Deshabilitado' }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Main Content -->
    <q-card flat bordered>
      <q-tabs
        v-model="tab"
        dense
        class="text-primary"
        active-color="primary"
        indicator-color="primary"
        align="left"
      >
        <q-tab name="info" label="Información" icon="person" />
        <q-tab name="courses" label="Cursos" icon="school" />
        <q-tab name="certificates" label="Certificados" icon="verified" />
        <q-tab name="activity" label="Actividad" icon="history" />
      </q-tabs>
      <q-separator />

      <q-tab-panels v-model="tab" animated class="q-pa-lg">
        <!-- Información Tab -->
        <q-tab-panel name="info">
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-6">
              <div class="text-subtitle1 q-mb-md text-weight-medium">Datos Personales</div>
              <q-list bordered separator class="rounded-borders">
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="badge" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>Tipo de Documento</q-item-label>
                    <q-item-label>{{ getDocumentTypeLabel(user.documentType) }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="credit_card" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>Número de Documento</q-item-label>
                    <q-item-label>{{ user.document }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="person" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>Nombre Completo</q-item-label>
                    <q-item-label>{{ user.name }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="email" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>Email</q-item-label>
                    <q-item-label>{{ user.email }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item v-if="user.phone">
                  <q-item-section avatar>
                    <q-icon name="phone" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>Teléfono</q-item-label>
                    <q-item-label>{{ user.phone }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <div class="col-12 col-md-6">
              <div class="text-subtitle1 q-mb-md text-weight-medium">Información del Sistema</div>
              <q-list bordered separator class="rounded-borders">
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="badge" color="primary" />
                  </q-item-section>
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
                  <q-item-section avatar>
                    <q-icon name="category" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>Tipo de Persona</q-item-label>
                    <q-item-label>
                      <q-badge :color="user.personType === 'juridica' ? 'blue' : 'green'" outline>
                        {{ user.personType === 'juridica' ? 'Persona Jurídica' : 'Persona Natural' }}
                      </q-badge>
                      <q-badge
                        v-if="user.isExternal"
                        color="warning"
                        outline
                        class="q-ml-xs"
                      >
                        Externo
                      </q-badge>
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="toggle_on" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>Estado</q-item-label>
                    <q-item-label>
                      <q-badge :color="user.enabled ? 'positive' : 'negative'" outline>
                        {{ user.enabled ? 'Habilitado' : 'Deshabilitado' }}
                      </q-badge>
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-item v-if="user.company || user.companyName">
                  <q-item-section avatar>
                    <q-icon name="business" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>Empresa</q-item-label>
                    <q-item-label>{{ user.company || user.companyName }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="calendar_today" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>Fecha de Registro</q-item-label>
                    <q-item-label>{{ formatDate(user.createdAt) }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item v-if="user.lastLoginAt">
                  <q-item-section avatar>
                    <q-icon name="login" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>Último Acceso</q-item-label>
                    <q-item-label>{{ formatDate(user.lastLoginAt) }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-tab-panel>

        <!-- Cursos Tab -->
        <q-tab-panel name="courses">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-subtitle1 text-weight-medium">Cursos Asignados</div>
            <q-btn
              color="primary"
              unelevated
              icon="add"
              label="Asignar Curso"
              @click="assignCourse"
            />
          </div>

          <div v-if="assignedCourses.length === 0" class="q-mt-lg">
            <EmptyState
              icon="school"
              title="No hay cursos asignados"
              description="Este usuario aún no tiene cursos asignados."
            >
              <template #actions>
                <q-btn
                  color="primary"
                  unelevated
                  icon="add"
                  label="Asignar Primer Curso"
                  @click="assignCourse"
                />
              </template>
            </EmptyState>
          </div>

          <div v-else class="column q-gutter-md">
            <q-card
              v-for="course in assignedCourses"
              :key="course.id"
              flat
              bordered
              class="course-card"
            >
              <q-card-section>
                <div class="row items-center justify-between">
                  <div class="col">
                    <div class="text-subtitle1 q-mb-xs">{{ course.courseName }}</div>
                    <div class="row items-center q-gutter-md">
                      <q-badge :color="getCourseStatusColor(course.status)" outline>
                        {{ course.status }}
                      </q-badge>
                      <span class="text-caption text-grey-6">
                        Inscrito: {{ formatDate(course.enrolledDate) }}
                      </span>
                    </div>
                  </div>
                  <div class="col-auto">
                    <div class="text-h6 text-weight-bold q-mb-xs">{{ course.progress }}%</div>
                    <q-linear-progress
                      :value="course.progress / 100"
                      rounded
                      size="12px"
                      color="primary"
                      class="q-mb-xs"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Progress Chart -->
          <q-card v-if="assignedCourses.length > 0" flat bordered class="q-mt-lg">
            <q-card-section>
              <div class="text-subtitle1 q-mb-md text-weight-medium">Progreso por Curso</div>
              <div class="progress-chart">
                <div
                  v-for="course in assignedCourses"
                  :key="course.id"
                  class="progress-item q-mb-md"
                >
                  <div class="row items-center justify-between q-mb-xs">
                    <div class="text-body2 text-weight-medium">{{ course.courseName }}</div>
                    <div class="text-body2">{{ course.progress }}%</div>
                  </div>
                  <q-linear-progress
                    :value="course.progress / 100"
                    rounded
                    size="20px"
                    color="primary"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-tab-panel>

        <!-- Certificados Tab -->
        <q-tab-panel name="certificates">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-subtitle1 text-weight-medium">Certificados Obtenidos</div>
            <q-badge color="primary" :label="`${certificates.length} certificado(s)`" />
          </div>

          <div v-if="certificates.length === 0" class="q-mt-lg">
            <EmptyState
              icon="verified"
              title="No hay certificados"
              description="Este usuario aún no ha obtenido certificados."
            />
          </div>

          <q-list v-else bordered separator class="rounded-borders">
            <q-item
              v-for="certificate in certificates"
              :key="certificate.id"
              clickable
              @click="viewCertificate(certificate.id)"
              class="certificate-item"
            >
              <q-item-section avatar>
                <q-avatar size="48px" color="primary" text-color="white" icon="verified" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">{{ certificate.courseName }}</q-item-label>
                <q-item-label caption>
                  <div class="row items-center q-gutter-sm">
                    <span>
                      <q-icon name="calendar_today" size="14px" class="q-mr-xs" />
                      Emitido: {{ formatDate(certificate.issuedDate) }}
                    </span>
                    <span>
                      <q-icon name="event_busy" size="14px" class="q-mr-xs" />
                      Vence: {{ formatDate(certificate.expiryDate) }}
                    </span>
                  </div>
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="column items-end q-gutter-xs">
                  <q-badge :color="certificate.valid ? 'positive' : 'negative'" outline>
                    {{ certificate.valid ? 'Válido' : 'Vencido' }}
                  </q-badge>
                  <q-btn
                    flat
                    dense
                    round
                    icon="download"
                    color="primary"
                    size="sm"
                    @click.stop="downloadCertificate()"
                  >
                    <q-tooltip>Descargar certificado</q-tooltip>
                  </q-btn>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-tab-panel>

        <!-- Actividad Tab -->
        <q-tab-panel name="activity">
          <div class="text-subtitle1 q-mb-md text-weight-medium">Timeline de Actividad</div>

          <div v-if="activities.length === 0" class="q-mt-lg">
            <EmptyState
              icon="history"
              title="No hay actividad registrada"
              description="Este usuario aún no tiene actividad registrada en el sistema."
            />
          </div>

          <q-timeline v-else color="primary" layout="comfortable" side="right">
            <q-timeline-entry
              v-for="activity in activities"
              :key="activity.id"
              :title="activity.title"
              :subtitle="formatDate(activity.date)"
              :icon="activity.icon"
              :color="activity.color"
            >
              <div class="text-body2 q-mb-xs">{{ activity.description }}</div>
              <div v-if="activity.meta" class="text-caption text-grey-6">{{ activity.meta }}</div>
            </q-timeline-entry>
          </q-timeline>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useUsers } from '../../../shared/composables';
import type { User } from '../../../domain/user/models';
import EmptyState from '../../../shared/components/EmptyState.vue';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const { loading, currentUser, getUser, toggleUserStatus, updateUser } = useUsers();

// Estado
const tab = ref<'info' | 'courses' | 'certificates' | 'activity'>('info');
const userId = route.params.id as string;

const user = computed(() => currentUser.value || ({} as User));

interface Course {
  id: string;
  courseName: string;
  status: string;
  progress: number;
  enrolledDate: string;
}

interface Certificate {
  id: string;
  courseName: string;
  issuedDate: string;
  expiryDate: string;
  valid: boolean;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: string;
  color: string;
  meta?: string;
}

const assignedCourses = ref<Course[]>([
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
  {
    id: '3',
    courseName: 'Transporte de Mercancías Peligrosas',
    status: 'Pendiente',
    progress: 0,
    enrolledDate: '2025-01-18',
  },
]);

const certificates = ref<Certificate[]>([
  {
    id: '1',
    courseName: 'Primeros Auxilios',
    issuedDate: '2025-01-15',
    expiryDate: '2026-01-15',
    valid: true,
  },
]);

const activities = ref<Activity[]>([
  {
    id: '1',
    title: 'Certificado obtenido',
    description: 'Completó y aprobó el curso "Primeros Auxilios"',
    date: '2025-01-15',
    icon: 'verified',
    color: 'positive',
    meta: 'Calificación: 85%',
  },
  {
    id: '2',
    title: 'Inscripción en curso',
    description: 'Se inscribió en el curso "Manejo Defensivo"',
    date: '2025-01-10',
    icon: 'school',
    color: 'primary',
  },
  {
    id: '3',
    title: 'Usuario creado',
    description: 'Usuario registrado en el sistema',
    date: '2025-01-05',
    icon: 'person_add',
    color: 'info',
  },
]);

// Computed
const averageProgress = computed(() => {
  if (assignedCourses.value.length === 0) return 0;
  const total = assignedCourses.value.reduce((sum, course) => sum + course.progress, 0);
  return Math.round(total / assignedCourses.value.length);
});

// Funciones
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

function getDocumentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    CC: 'Cédula de Ciudadanía',
    CE: 'Cédula de Extranjería',
    PA: 'Pasaporte',
    TI: 'Tarjeta de Identidad',
    NIT: 'NIT',
  };
  return labels[type] ?? type;
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

function getCourseStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'En progreso': 'info',
    Completado: 'positive',
    Pendiente: 'warning',
  };
  return colors[status] ?? 'grey';
}

async function handleToggleUserStatus() {
  if (!user.value.id) return;
  const action = user.value.enabled ? 'deshabilitar' : 'habilitar';
  $q.dialog({
    title: 'Confirmar acción',
    message: `¿Está seguro de ${action} a ${user.value.name}?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await toggleUserStatus(user.value.id, !user.value.enabled);
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  });
}

function editUser() {
  void router.push(`/users/${userId}?edit=true`);
}

function assignCourse() {
  $q.notify({
    type: 'info',
    message: 'Funcionalidad de asignación de cursos próximamente',
    position: 'top',
  });
}

function viewCertificate(id: string) {
  void router.push(`/certificates/${id}`);
}

function downloadCertificate() {
  $q.notify({
    type: 'info',
    message: 'Descarga de certificado próximamente',
    position: 'top',
  });
}

function goBack() {
  void router.push('/users');
}

// Lifecycle
onMounted(() => {
  void loadUser();
});

async function loadUser() {
  try {
    await getUser(userId);
  } catch (error) {
    console.error('Error loading user:', error);
  }
}
</script>

<style scoped lang="scss">
.user-detail-page {
  background: #f9fafb;
  transition: background-color 0.3s ease;
}

body.body--dark .user-detail-page {
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

.course-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.course-card:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

body.body--dark .course-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.certificate-item {
  transition: background-color 0.2s ease;
}

.certificate-item:hover {
  background: rgba(79, 70, 229, 0.05);
}

body.body--dark .certificate-item:hover {
  background: rgba(79, 70, 229, 0.15);
}

.progress-chart {
  min-height: 200px;
}

.progress-item {
  min-width: 300px;
}
</style>

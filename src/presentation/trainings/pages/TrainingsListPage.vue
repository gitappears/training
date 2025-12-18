<template>
  <q-page class="q-pa-xl column q-gutter-lg">
    <div class="row items-center justify-between">
      <div>
        <div class="heading-main q-mb-xs">Catálogo de capacitaciones</div>
        <div class="heading-sub">
          Explora cursos disponibles, similares a una experiencia tipo Udemy.
        </div>
      </div>
      <q-btn color="primary" unelevated icon="add" label="Nueva capacitación" to="/trainings/new" />
    </div>

    <div class="row q-col-gutter-lg q-mt-md">
      <div v-for="training in trainings" :key="training.id" class="col-12 col-md-4">
        <q-card class="cursor-pointer" @click="goDetail(training.id)">
          <q-img :src="training.coverImageUrl" :ratio="16 / 9">
            <div class="absolute-bottom q-pa-sm bg-black bg-opacity-60">
              <div class="text-subtitle2">{{ training.instructor }}</div>
            </div>
          </q-img>
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-xs">
              {{ training.title }}
            </div>
            <div class="text-caption text-grey-7 ellipsis-2-lines q-mb-sm">
              {{ training.description }}
            </div>
            <div class="row items-center justify-between">
              <div class="row items-center q-gutter-xs">
                <q-icon name="star" color="amber" size="18px" />
                <span class="text-caption">{{ training.averageRating.toFixed(1) }}</span>
                <span class="text-caption text-grey-6">({{ training.studentsCount }} alumnos)</span>
              </div>
              <div class="text-caption text-grey-7">
                {{ training.durationHours }} h · {{ getModalityLabel(training.modality) }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const modalityLabels: Record<string, string> = {
  online: 'Online',
  onsite: 'Presencial',
  hybrid: 'Mixta',
};

function getModalityLabel(modality: string): string {
  return modalityLabels[modality] ?? modality;
}

const trainings = computed(() =>
  [
    {
      id: '1',
      title: 'Onboarding nuevos colaboradores',
      description: 'Conoce la cultura, procesos y herramientas clave de la compañía.',
      type: 'standard' as const,
      modality: 'online' as const,
      coverImageUrl:
        'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
      promoVideoUrl: '',
      instructor: 'Equipo de Personas',
      area: 'RRHH',
      targetAudience: 'Todos los colaboradores',
      startDate: '2025-01-10',
      endDate: '2025-01-31',
      durationHours: 4,
      capacity: 200,
      studentsCount: 152,
      averageRating: 4.7,
      sections: [],
      attachments: [],
      images: [],
      students: [],
      reviews: [],
    },
    {
      id: '2',
      title: 'Liderazgo para mandos medios',
      description: 'Desarrolla habilidades de liderazgo y gestión de equipos de alto desempeño.',
      type: 'standard' as const,
      modality: 'hybrid' as const,
      coverImageUrl:
        'https://images.pexels.com/photos/1181352/pexels-photo-1181352.jpeg?auto=compress&cs=tinysrgb&w=800',
      promoVideoUrl: '',
      instructor: 'Consultora Externa',
      area: 'Desarrollo Organizacional',
      targetAudience: 'Jefaturas',
      startDate: '2025-02-01',
      endDate: '2025-02-20',
      durationHours: 12,
      capacity: 40,
      studentsCount: 28,
      averageRating: 4.9,
      sections: [],
      attachments: [],
      images: [],
      students: [],
      reviews: [],
    },
  ].map((t) => ({ ...t, modalityLabel: getModalityLabel(t.modality) })),
);

function goDetail(id: string) {
  void router.push(`/trainings/${id}`);
}
</script>

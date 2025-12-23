<template>
  <q-page class="q-pa-lg">
    <q-card class="q-pa-xl">
      <div class="text-center q-mb-lg">
        <q-icon name="gavel" size="64px" color="primary" class="q-mb-md" />
        <div class="text-h4 q-mb-xs">Aceptación de Términos y Políticas</div>
        <div class="text-body2 text-grey-7">
          Para continuar, debes aceptar los siguientes documentos legales
        </div>
      </div>

      <div v-if="loading" class="text-center q-pa-xl">
        <q-spinner color="primary" size="3em" />
        <div class="text-body2 q-mt-md text-grey-7">Cargando documentos...</div>
      </div>

      <div v-else-if="error" class="text-center q-pa-xl">
        <q-icon name="error" size="64px" color="negative" class="q-mb-md" />
        <div class="text-h6 q-mb-sm text-negative">{{ error }}</div>
        <q-btn color="primary" label="Reintentar" @click="loadDocuments" />
      </div>

      <div v-else-if="documents.length === 0" class="text-center q-pa-xl">
        <q-icon name="check_circle" size="64px" color="positive" class="q-mb-md" />
        <div class="text-h6 q-mb-sm">No hay documentos pendientes de aceptar</div>
        <q-btn color="primary" label="Continuar" @click="handleContinue" />
      </div>

      <div v-else class="q-gutter-md">
        <q-card
          v-for="document in documents"
          :key="document.id"
          class="document-card"
          flat
          bordered
        >
          <q-card-section>
            <div class="row items-center q-mb-md">
              <q-icon
                :name="getDocumentIcon(document.tipo)"
                size="32px"
                :color="acceptedDocuments.includes(document.id) ? 'positive' : 'primary'"
                class="q-mr-md"
              />
              <div class="col">
                <div class="text-h6 text-weight-medium">
                  {{ document.titulo }}
                </div>
                <div class="text-caption text-grey-7">
                  Versión {{ document.version }} •
                  {{ getDocumentTypeLabel(document.tipo) }}
                </div>
              </div>
              <q-checkbox
                v-model="acceptedDocuments"
                :val="document.id"
                color="positive"
                size="lg"
                :disable="submitting"
              />
            </div>

            <q-expansion-item
              :label="
                acceptedDocuments.includes(document.id)
                  ? 'Documento aceptado'
                  : 'Leer documento completo'
              "
              :icon="acceptedDocuments.includes(document.id) ? 'check_circle' : 'description'"
              :default-opened="false"
              class="q-mt-sm"
            >
              <q-card flat class="q-pa-md bg-grey-1">
                <div class="document-content" v-html="formatDocumentContent(document.contenido)" />
              </q-card>
            </q-expansion-item>
          </q-card-section>
        </q-card>

        <div class="q-mt-lg">
          <div v-if="!allDocumentsAccepted" class="text-negative text-body2 q-mb-md text-center">
            <q-icon name="warning" class="q-mr-xs" />
            Debes aceptar todos los documentos para continuar
          </div>

          <q-btn
            color="primary"
            size="lg"
            label="Aceptar y Continuar"
            class="full-width"
            :loading="submitting"
            :disable="!allDocumentsAccepted || submitting"
            @click="handleAccept"
          >
            <template #loading>
              <q-spinner class="on-left" />
              Procesando...
            </template>
          </q-btn>
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTerms } from '../../../shared/composables';

const router = useRouter();
const route = useRoute();

const {
  documents,
  acceptedDocuments,
  loading,
  submitting,
  error,
  allDocumentsAccepted,
  loadDocuments,
  acceptTerms,
  getDocumentIcon,
  formatDocumentContent,
  getDocumentTypeLabel,
} = useTerms();

async function handleAccept() {
  try {
    await acceptTerms();
  } catch (err) {
    // El error ya se maneja en el composable useTerms
  }
}

function handleContinue() {
  // Si no hay documentos, redirigir directamente
  const redirect = (route.query.redirect as string) || '/';
  void router.push(redirect);
}

onMounted(() => {
  void loadDocuments();
});
</script>

<style scoped lang="scss">
.document-card {
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.document-content {
  line-height: 1.8;
  max-height: 400px;
  overflow-y: auto;

  h2,
  h3 {
    margin-top: 1.5rem;
    margin-bottom: 1rem;
    color: var(--q-primary);
  }

  p {
    margin-bottom: 1rem;
    text-align: justify;
  }

  ul {
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }
}
</style>

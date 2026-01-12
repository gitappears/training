<template>
  <q-page class="q-pa-lg">
    <div class="row justify-center">
      <div class="col-12 col-md-6">
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
            <q-btn
              color="primary"
              label="Continuar"
              @click="handleContinue"
              :loading="redirecting"
            />
          </div>

          <!-- Loader de redirección -->
          <q-inner-loading :showing="redirecting" color="primary">
            <q-spinner size="50px" color="primary" />
            <div class="text-body1 q-mt-md">Redirigiendo al dashboard...</div>
          </q-inner-loading>

          <div class="q-gutter-md">
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
                    <div
                      class="document-content"
                      v-html="formatDocumentContent(document.contenido)"
                    />
                  </q-card>
                </q-expansion-item>
              </q-card-section>
            </q-card>

            <div class="q-mt-lg">
              <div
                v-if="!allDocumentsAccepted"
                class="text-negative text-body2 q-mb-md text-center"
              >
                <q-icon name="warning" class="q-mr-xs" />
                Debes aceptar todos los documentos para continuar
              </div>

              <div class="row justify-center">
                <div class="col-12 col-md-6">
                  <q-btn
                    color="primary"
                    size="md"
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
            </div>
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useTerms } from '../../../shared/composables';
import { useAuthStore } from '../../../stores/auth.store';
import type { LoginDto } from '../../../application/auth/auth.repository.port';

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const authStore = useAuthStore();

const redirecting = ref(false);

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
    const fromLogin = route.query.fromLogin === 'true';

    // Si venimos del login, usar el endpoint público con credenciales
    if (fromLogin) {
      const pendingLoginStr = sessionStorage.getItem('pendingLogin');
      if (pendingLoginStr) {
        try {
          const pendingLogin: LoginDto = JSON.parse(pendingLoginStr);

          // Aceptar términos usando el endpoint público con credenciales
          await acceptTerms(undefined, true, pendingLogin);

          // Después de aceptar términos, intentar hacer login
          try {
            await authStore.login(pendingLogin);

            // Limpiar las credenciales guardadas
            sessionStorage.removeItem('pendingLogin');

            $q.notify({
              type: 'positive',
              message: 'Términos aceptados e inicio de sesión exitoso',
              position: 'top',
            });

            // Mostrar loader de redirección
            redirecting.value = true;

            // Redirigir a la ruta original o al home
            const redirect = (route.query.redirect as string) || '/';
            await router.push(redirect);
            return;
          } catch (loginError) {
            console.error('Error al intentar login después de aceptar términos:', loginError);
            $q.notify({
              type: 'warning',
              message: 'Términos aceptados. Por favor, inicia sesión nuevamente.',
              position: 'top',
            });
            // Limpiar las credenciales y redirigir al login
            sessionStorage.removeItem('pendingLogin');
            void router.push({ name: 'login' });
            return;
          }
        } catch (err) {
          console.error('Error en el flujo de aceptación de términos:', err);
          $q.notify({
            type: 'negative',
            message: 'Error al procesar la aceptación de términos. Por favor, intente nuevamente.',
            position: 'top',
          });
          return;
        }
      }
    }

    // Si no venimos del login, aceptar términos normalmente (con autenticación)
    await acceptTerms(undefined, false);
  } catch (err) {
    // El error ya se maneja en el composable useTerms
    console.error('Error al aceptar términos:', err);
  }
}

async function handleContinue() {
  // Si no hay documentos, verificar si hay credenciales pendientes
  const fromLogin = route.query.fromLogin === 'true';
  if (fromLogin) {
    const pendingLoginStr = sessionStorage.getItem('pendingLogin');
    if (pendingLoginStr) {
      // Intentar hacer login automáticamente
      const pendingLogin: LoginDto = JSON.parse(pendingLoginStr);
      sessionStorage.removeItem('pendingLogin');

      try {
        await authStore.login(pendingLogin);

        // Mostrar loader de redirección
        redirecting.value = true;

        const redirect = (route.query.redirect as string) || '/';
        await router.push(redirect);
      } catch {
        void router.push({ name: 'login' });
      }
      return;
    }
  }

  // Si no hay documentos, redirigir directamente
  redirecting.value = true;
  const redirect = (route.query.redirect as string) || '/';
  await router.push(redirect);
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

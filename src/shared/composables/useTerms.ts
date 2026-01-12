import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { termsService } from '../../infrastructure/http/terms/terms.service';
import { TermsUseCasesFactory } from '../../application/terms/terms.use-cases.factory';
import type { DocumentoLegal } from '../../application/terms/terms.repository.port';

/**
 * Composable para manejar la lógica de términos y políticas
 * Centraliza la obtención, visualización y aceptación de documentos legales
 */
export function useTerms() {
  const router = useRouter();
  const route = useRoute();
  const $q = useQuasar();

  const documents = ref<DocumentoLegal[]>([]);
  const acceptedDocuments = ref<number[]>([]);
  const loading = ref(false);
  const submitting = ref(false);
  const error = ref<string | null>(null);

  const allDocumentsAccepted = computed(() => {
    if (documents.value.length === 0) return true;
    return documents.value.every((doc) => acceptedDocuments.value.includes(doc.id));
  });

  /**
   * Obtiene los documentos legales activos del backend
   */
  async function loadDocuments() {
    loading.value = true;
    error.value = null;
    try {
      const getActiveDocumentsUseCase = TermsUseCasesFactory.getGetActiveDocumentsUseCase(termsService);
      const activeDocuments = await getActiveDocumentsUseCase.execute();
      documents.value = activeDocuments;
      
      // Pre-marcar todos los documentos como aceptados para facilitar la UX
      // El usuario debe confirmar explícitamente
      acceptedDocuments.value = activeDocuments.map((doc) => doc.id);
    } catch (err) {
      console.error('Error loading documents:', err);
      error.value = err instanceof Error ? err.message : 'Error al cargar los documentos legales';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Acepta los términos y políticas seleccionados
   * @param documentIds - IDs de documentos a aceptar (opcional, usa acceptedDocuments por defecto)
   * @param skipRedirect - Si es true, no redirige automáticamente (útil cuando se maneja el redirect manualmente)
   * @param credentials - Credenciales opcionales para aceptar términos sin autenticación (cuando viene del login)
   */
  async function acceptTerms(
    documentIds?: number[],
    skipRedirect: boolean = false,
    credentials?: { username: string; password: string },
  ) {
    const idsToAccept = documentIds || acceptedDocuments.value;
    
    if (idsToAccept.length === 0) {
      $q.notify({
        type: 'negative',
        message: 'Debes aceptar todos los documentos para continuar',
      });
      return;
    }

    submitting.value = true;
    try {
      // Si se proporcionan credenciales, usar el endpoint público
      if (credentials) {
        await termsService.acceptTermsWithCredentials(
          credentials.username,
          credentials.password,
          idsToAccept,
        );
      } else {
        // Usar el endpoint normal con autenticación
        const acceptTermsUseCase = TermsUseCasesFactory.getAcceptTermsUseCase(termsService);
        await acceptTermsUseCase.execute(idsToAccept);
      }

      $q.notify({
        type: 'positive',
        message: 'Términos y políticas aceptados exitosamente',
      });

      // Redirigir a la ruta original o al home solo si no se solicita saltar el redirect
      if (!skipRedirect) {
        const redirect = (route.query.redirect as string) || '/';
        void router.push(redirect);
      }
    } catch (err) {
      console.error('Error accepting terms:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al aceptar los términos y políticas';
      $q.notify({
        type: 'negative',
        message: errorMessage,
      });
      throw err;
    } finally {
      submitting.value = false;
    }
  }

  /**
   * Verifica si el usuario ha aceptado todos los términos activos
   */
  async function verifyAcceptance(): Promise<boolean> {
    try {
      const verifyUseCase = TermsUseCasesFactory.getVerifyAcceptanceUseCase(termsService);
      const result = await verifyUseCase.execute();
      return result.aceptado;
    } catch (err) {
      // Si hay error (probablemente 401), significa que no ha aceptado
      console.error('Error verifying acceptance:', err);
      return false;
    }
  }

  /**
   * Obtiene el icono apropiado para un tipo de documento
   */
  function getDocumentIcon(tipo: string): string {
    if (tipo === 'TERMINOS_CONDICIONES') {
      return 'description';
    }
    return 'privacy_tip';
  }

  /**
   * Formatea el contenido del documento para visualización
   */
  function formatDocumentContent(content: string): string {
    // El contenido ya viene formateado del backend
    // Si necesita procesamiento adicional, se puede hacer aquí
    return content.replace(/\n/g, '<br>');
  }

  /**
   * Obtiene la etiqueta del tipo de documento
   */
  function getDocumentTypeLabel(tipo: string): string {
    if (tipo === 'TERMINOS_CONDICIONES') {
      return 'Términos y Condiciones';
    }
    return 'Política de Privacidad';
  }

  return {
    documents,
    acceptedDocuments,
    loading,
    submitting,
    error,
    allDocumentsAccepted,
    loadDocuments,
    acceptTerms,
    verifyAcceptance,
    getDocumentIcon,
    formatDocumentContent,
    getDocumentTypeLabel,
  };
}


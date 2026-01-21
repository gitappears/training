/**
 * Composable para acciones de certificados (ver, descargar, compartir, copiar)
 */

import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import type { Certificate } from '../../../domain/certificate/models';

export function useCertificateActions(
  downloadCertificatePDF: (id: string) => Promise<void>,
  certificates: () => Certificate[],
) {
  const router = useRouter();
  const $q = useQuasar();

  function viewCertificate(id: string) {
    void router.push(`/certificates/${id}`);
  }

  async function downloadCertificate(id: string) {
    try {
      await downloadCertificatePDF(id);
    } catch (error) {
      console.error('Error al descargar certificado:', error);
    }
  }

  function shareCertificate(id: string) {
    const certificate = certificates().find((c) => c.id === id);
    if (certificate) {
      const shareUrl = `${window.location.origin}${certificate.publicVerificationUrl}`;
      void navigator.clipboard.writeText(shareUrl);
      $q.notify({
        type: 'positive',
        message: 'Enlace de verificación copiado al portapapeles',
        position: 'top',
      });
    }
  }

  function copyCode(code: string) {
    void navigator.clipboard.writeText(code);
    $q.notify({
      type: 'positive',
      message: 'Código copiado al portapapeles',
      position: 'top',
    });
  }

  async function bulkDownload(selectedCertificates: Certificate[]) {
    if (selectedCertificates.length === 0) return;

    $q.dialog({
      title: 'Confirmar descarga',
      message: `¿Está seguro de descargar ${selectedCertificates.length} certificado(s)?`,
      cancel: true,
      persistent: true,
    }).onOk(async () => {
      try {
        // Descargar cada certificado
        for (const cert of selectedCertificates) {
          await downloadCertificatePDF(cert.id);
          // Pequeña pausa entre descargas
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
        $q.notify({
          type: 'positive',
          message: `${selectedCertificates.length} certificado(s) descargado(s) exitosamente`,
          position: 'top',
        });
      } catch (error) {
        console.error('Error en descarga masiva:', error);
        $q.notify({
          type: 'negative',
          message: 'Error al descargar algunos certificados',
          position: 'top',
        });
      }
    });
  }

  return {
    viewCertificate,
    downloadCertificate,
    shareCertificate,
    copyCode,
    bulkDownload,
  };
}

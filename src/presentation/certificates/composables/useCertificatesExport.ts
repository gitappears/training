/**
 * Composable para exportación de certificados
 */

import { useQuasar } from 'quasar';
import type { Certificate } from '../../../domain/certificate/models';

export function useCertificatesExport(formatDate: (date: string) => string) {
  const $q = useQuasar();

  function exportToCSV(certificates: Certificate[]) {
    const headers = ['Curso', 'Fecha Emisión', 'Fecha Vencimiento', 'Estado', 'Código Verificación'];
    const rows = certificates.map((cert) => [
      cert.courseName,
      formatDate(cert.issuedDate),
      formatDate(cert.expiryDate),
      cert.status === 'valid' ? 'Válido' : 'Vencido',
      cert.verificationCode,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `certificados_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    $q.notify({
      type: 'positive',
      message: 'Archivo CSV exportado exitosamente',
      position: 'top',
    });
  }

  function exportToExcel() {
    $q.notify({
      type: 'info',
      message: 'Exportación a Excel próximamente',
      position: 'top',
    });
  }

  return {
    exportToCSV,
    exportToExcel,
  };
}

/**
 * Composable para cálculo de estadísticas de certificados
 */

import { computed } from 'vue';
import type { Certificate, CertificateStatistics } from '../../../domain/certificate/models';

export function useCertificatesStatistics(certificates: () => Certificate[]) {
  const statistics = computed<CertificateStatistics>(() => {
    const certs = certificates();
    const stats: CertificateStatistics = {
      total: certs.length,
      valid: 0,
      expired: 0,
      revoked: 0,
      byCourse: {},
      expiringSoon: 0,
    };

    certs.forEach((cert) => {
      // Contar por estado
      if (cert.status === 'valid') stats.valid++;
      else if (cert.status === 'expired') stats.expired++;
      else if (cert.status === 'revoked') stats.revoked++;

      // Contar por curso
      if (cert.courseId) {
        if (!stats.byCourse[cert.courseId]) {
          stats.byCourse[cert.courseId] = 0;
        }
        stats.byCourse[cert.courseId] = (stats.byCourse[cert.courseId] || 0) + 1;
      }

      // Contar próximos a vencer (30 días)
      if (cert.expiryDate && cert.status === 'valid') {
        const expiry = new Date(cert.expiryDate);
        const now = new Date();
        const daysUntilExpiry = Math.ceil(
          (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
          stats.expiringSoon++;
        }
      }
    });

    return stats;
  });

  return {
    statistics,
  };
}

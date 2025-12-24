import { ref } from 'vue';
import { certificatesService } from '../../../infrastructure/http/certificates/certificates.service';
import type { Certificate } from '../../../domain/certificate/models';

export interface CertificateDisplay {
  id: string;
  courseName: string;
  issuedDate: string;
  expiryDate: string;
  valid: boolean;
}

/**
 * Mapea un certificado del dominio a formato de display
 */
function mapCertificateToDisplay(certificate: Certificate): CertificateDisplay {
  return {
    id: certificate.id,
    courseName: certificate.courseName,
    issuedDate: certificate.issuedDate,
    expiryDate: certificate.expiryDate,
    valid: certificate.status === 'valid',
  };
}

/**
 * Composable para manejar certificados de usuarios
 */
export function useUserCertificates() {
  const certificates = ref<CertificateDisplay[]>([]);
  const loading = ref(false);

  async function loadCertificates(personaId: string) {
    if (!personaId) return;
    
    loading.value = true;
    try {
      const backendCertificates = await certificatesService.findByUser(personaId);
      certificates.value = backendCertificates.map(mapCertificateToDisplay);
    } catch (error) {
      console.error('Error loading certificates:', error);
      certificates.value = [];
    } finally {
      loading.value = false;
    }
  }

  return {
    certificates,
    loading,
    loadCertificates,
  };
}


/**
 * Composable para funciones de formateo de datos de usuarios
 */
export function useUserFormatters() {
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

  function getCourseStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'En progreso': 'info',
      Completado: 'positive',
      Pendiente: 'warning',
    };
    return colors[status] ?? 'grey';
  }

  return {
    formatDate,
    getDocumentTypeLabel,
    getCourseStatusColor,
  };
}


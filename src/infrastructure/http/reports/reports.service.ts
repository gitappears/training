// Implementación HTTP del repositorio de reportes
// Adaptador que conecta la capa de aplicación con la API REST

// import { api } from '../../../boot/axios'; // TODO: Descomentar cuando backend esté listo
import type { AxiosError } from 'axios';
import type {
  IReportRepository,
  ReportFilters,
  ReportKPIs,
  CourseReport,
  UserReport,
  CertificateExpiryReport,
  TrendData,
} from '../../../application/report/report.repository.port';

/**
 * Servicio HTTP para reportes
 * Implementa el puerto IReportRepository usando axios
 * Por ahora usa datos mock, pero está listo para conectarse al backend
 */
export class ReportsService implements IReportRepository {
  private readonly baseUrl = '/reportes';

  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  async getKPIs(filters?: ReportFilters): Promise<ReportKPIs> {
    try {
      // Mock por ahora
      // Cuando el backend esté listo: const response = await api.get(`${this.baseUrl}/kpis`, { params: filters });
      
      return {
        complianceRate: 84,
        complianceTarget: 90,
        approvalRate: 76,
        approvalRateVariation: 5,
        certificatesIssued: 245,
        certificatesValid: 198,
        avgCompletionTime: 12.5,
        activeUsers: 342,
        activeCourses: 18,
        avgSatisfaction: 4.6,
        expiringSoon: 23,
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al obtener los KPIs',
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  async getCourseReports(filters?: ReportFilters): Promise<CourseReport[]> {
    try {
      // Mock por ahora
      return [
        {
          id: '1',
          courseName: 'Manejo Defensivo',
          enrolled: 152,
          completed: 118,
          approved: 92,
          completionRate: 78,
          approvalRate: 78,
        },
        {
          id: '2',
          courseName: 'Primeros Auxilios',
          enrolled: 128,
          completed: 109,
          approved: 93,
          completionRate: 85,
          approvalRate: 85,
        },
      ];
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al obtener el reporte por cursos',
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  async getUserReports(filters?: ReportFilters): Promise<UserReport[]> {
    try {
      // Mock por ahora
      return [
        {
          id: '1',
          userName: 'Juan Pérez',
          coursesAssigned: 3,
          coursesCompleted: 2,
          certificatesObtained: 2,
          avgScore: 85,
        },
        {
          id: '2',
          userName: 'María González',
          coursesAssigned: 2,
          coursesCompleted: 2,
          certificatesObtained: 2,
          avgScore: 90,
        },
      ];
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al obtener el reporte por usuarios',
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  async getExpiringCertificates(filters?: ReportFilters): Promise<CertificateExpiryReport[]> {
    try {
      // Mock por ahora
      return [
        {
          id: '1',
          userName: 'Juan Pérez',
          courseName: 'Manejo Defensivo',
          expiryDate: '2025-02-15',
          daysUntilExpiry: 30,
          status: 'Próximo a vencer',
        },
        {
          id: '2',
          userName: 'María González',
          courseName: 'Primeros Auxilios',
          expiryDate: '2025-02-20',
          daysUntilExpiry: 35,
          status: 'Próximo a vencer',
        },
      ];
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al obtener certificados próximos a vencer',
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  async getCompletionTrend(filters?: ReportFilters): Promise<TrendData[]> {
    try {
      // Mock por ahora
      return [
        { label: 'Jul', value: 65 },
        { label: 'Ago', value: 72 },
        { label: 'Sep', value: 68 },
        { label: 'Oct', value: 78 },
        { label: 'Nov', value: 82 },
        { label: 'Dic', value: 84 },
      ];
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al obtener la tendencia de completación',
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  async getCertificatesTrend(filters?: ReportFilters): Promise<TrendData[]> {
    try {
      // Mock por ahora
      return [
        { label: 'Jul', value: 45 },
        { label: 'Ago', value: 52 },
        { label: 'Sep', value: 48 },
        { label: 'Oct', value: 58 },
        { label: 'Nov', value: 62 },
        { label: 'Dic', value: 64 },
      ];
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al obtener la tendencia de certificados',
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  async exportToPDF(filters?: ReportFilters): Promise<Blob> {
    try {
      // Mock por ahora
      // Cuando el backend esté listo: const response = await api.post(`${this.baseUrl}/export/pdf`, filters, { responseType: 'blob' });
      
      const pdfContent = `%PDF-1.4\n... Reporte ...`;
      return new Blob([pdfContent], { type: 'application/pdf' });
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al exportar el reporte a PDF',
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  async exportToCSV(filters?: ReportFilters): Promise<Blob> {
    try {
      // Mock por ahora
      const csvContent = 'Curso,Inscritos,Completados,Aprobados\n';
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      return blob;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al exportar el reporte a CSV',
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  async exportToExcel(filters?: ReportFilters): Promise<Blob> {
    try {
      // Mock por ahora
      const excelContent = 'Reporte Excel';
      return new Blob([excelContent], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al exportar el reporte a Excel',
      );
    }
  }
}

// Exportar instancia singleton
export const reportsService = new ReportsService();


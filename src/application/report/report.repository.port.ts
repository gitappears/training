// Puerto (interface) para el repositorio de reportes
// Define el contrato que debe cumplir cualquier implementación

export interface ReportFilters {
  courseId?: string | null;
  userId?: string | null;
  status?: 'approved' | 'failed' | 'in_progress' | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  comparisonPeriod?: 'previous_month' | 'previous_year' | 'same_period_last_year' | null;
}

export interface ReportKPIs {
  complianceRate: number;
  complianceTarget: number;
  approvalRate: number;
  approvalRateVariation: number;
  certificatesIssued: number;
  certificatesValid: number;
  avgCompletionTime: number;
  activeUsers: number;
  activeCourses: number;
  avgSatisfaction: number;
  expiringSoon: number;
}

export interface CourseReport {
  id: string;
  courseName: string;
  enrolled: number;
  completed: number;
  approved: number;
  completionRate: number;
  approvalRate: number;
}

export interface UserReport {
  id: string;
  userName: string;
  coursesAssigned: number;
  coursesCompleted: number;
  certificatesObtained: number;
  avgScore: number;
}

export interface CertificateExpiryReport {
  id: string;
  userName: string;
  courseName: string;
  expiryDate: string;
  daysUntilExpiry: number;
  status: string;
}

export interface TrendData {
  label: string;
  value: number;
}

export interface IReportRepository {
  /**
   * Obtener KPIs principales (RF-41)
   */
  getKPIs(filters?: ReportFilters): Promise<ReportKPIs>;

  /**
   * Obtener reporte por cursos (RF-40, RF-41)
   */
  getCourseReports(filters?: ReportFilters): Promise<CourseReport[]>;

  /**
   * Obtener reporte por usuarios (RF-40, RF-41)
   */
  getUserReports(filters?: ReportFilters): Promise<UserReport[]>;

  /**
   * Obtener certificados próximos a vencer (RF-39)
   */
  getExpiringCertificates(filters?: ReportFilters): Promise<CertificateExpiryReport[]>;

  /**
   * Obtener tendencia de completación
   */
  getCompletionTrend(filters?: ReportFilters): Promise<TrendData[]>;

  /**
   * Obtener tendencia de certificados emitidos
   */
  getCertificatesTrend(filters?: ReportFilters): Promise<TrendData[]>;

  /**
   * Exportar reporte a PDF (RF-40, RF-42)
   */
  exportToPDF(filters?: ReportFilters): Promise<Blob>;

  /**
   * Exportar reporte a CSV (RF-40, RF-42)
   */
  exportToCSV(filters?: ReportFilters): Promise<Blob>;

  /**
   * Exportar reporte a Excel (RF-40, RF-42)
   */
  exportToExcel(filters?: ReportFilters): Promise<Blob>;
}


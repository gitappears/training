import { api } from '../../../boot/axios';

export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  courseId?: string; // string in frontend filters usually
  status?: string;
  comparisonPeriod?: string;
}

export interface TopCourse {
  id: number;
  name: string;
  short: string;
  assignments: number;
  completionRate: number;
  color: string;
}

export interface ApprovalByCourse {
  id: number;
  name: string;
  rate: number;
}

export interface Trend {
  label: string;
  value: number;
}

export interface CourseReport {
  id: number;
  courseName: string;
  enrolled: number;
  completed: number;
  approved: number;
  completionRate: number;
  approvalRate: number;
}

export interface UserReport {
  id: number;
  userName: string;
  coursesAssigned: number;
  coursesCompleted: number;
  certificatesObtained: number;
  avgScore: number;
}

export interface ExpiringCertificate {
  id: number;
  userName: string;
  courseName: string;
  expiryDate: string; // ISO Date string
  daysUntilExpiry: number;
  status: string;
}

// Define interfaces matching Backend response structure closely
export interface ReportsStats {
  kpis: {
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
  };
  clientDistribution: {
    labels: string[];
    series: number[];
  };
  topCourses: TopCourse[];
  approvalByCourse: ApprovalByCourse[];
  completionTrend: Trend[];
  certificatesTrend: Trend[];
  courseReports: CourseReport[];
  userReports: UserReport[];
  expiringCertificates: ExpiringCertificate[];
}

export class ReportsService {
  private baseUrl = '/reports';

  async getStats(filters: ReportFilters): Promise<ReportsStats> {
    const params: Record<string, string | number | undefined> = {};
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    if (filters.courseId) params.courseId = filters.courseId;
    if (filters.status) params.status = filters.status;

    const response = await api.get<ReportsStats>(`${this.baseUrl}/stats`, { params });
    return response.data;
  }
}

export const reportsService = new ReportsService();

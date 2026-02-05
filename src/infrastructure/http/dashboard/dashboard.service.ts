import { api } from '../../../boot/axios';

export interface KPIValue {
  value: number;
  variation?: number;
  target?: number;
}

export interface DashboardKPIs {
  activeCourses: KPIValue;
  enrolledUsers: KPIValue;
  completionRate: KPIValue;
  avgSatisfaction: KPIValue;
  certificatesIssued: KPIValue;
  evaluationsPending: KPIValue;
}

export interface UpcomingTraining {
  id: number;
  title: string;
  date: string;
  time: string;
  duration: string;
  modality: string;
  statusLabel: string;
  statusColor: string;
  color: string;
  short: string;
}

export interface AreaProgress {
  id: number;
  name: string;
  completed: number;
  total: number;
  remaining: number;
  completion: number;
  completionLabel: string;
  color: string;
  icon: string;
}

export interface CompletionTrend {
  label: string;
  value: number;
}

export interface DashboardStats {
  kpis: DashboardKPIs;
  upcomingTrainings: UpcomingTraining[];
  areaProgress: AreaProgress[];
  completionTrend: CompletionTrend[];
  notifications: unknown[];
  recentActivity: unknown[];
}

export class DashboardService {
  private baseUrl = '/dashboard';

  async getStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>(`${this.baseUrl}/stats`);
    return response.data;
  }
}

export const dashboardService = new DashboardService();

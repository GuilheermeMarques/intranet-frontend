export interface DashboardStat {
  title: string;
  value: string;
  icon: string;
  color: string;
  trend: string;
  trendValue: string;
}

export interface DashboardProgress {
  title: string;
  value: number;
  total: number;
  color: string;
  icon: string;
}

export interface DashboardActivity {
  action: string;
  user: string;
  time: string;
  type: string;
}

export interface DashboardSummary {
  stats: DashboardStat[];
  progress: DashboardProgress[];
  recentActivity: DashboardActivity[];
}

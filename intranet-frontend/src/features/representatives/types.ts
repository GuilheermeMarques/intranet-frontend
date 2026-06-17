export interface Representative {
  id: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  status: string;
  totalSales: number;
  monthlyGoal: number;
  clientsCount: number;
  lastActivity: string;
  avatar: string;
}

export interface RepresentativeStatusOption {
  value: string;
  label: string;
}

export interface RepresentativeFilters {
  name: string;
  region: string;
  status: string;
}

export interface RepresentativesData {
  representatives: Representative[];
  regions: string[];
  statusOptions: RepresentativeStatusOption[];
}

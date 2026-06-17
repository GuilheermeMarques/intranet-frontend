import { Representative } from '@/domain/sales/enterprise/entities/representative'

export class RepresentativePresenter {
  static toHTTP(representative: Representative) {
    return {
      id: representative.id.toString(),
      name: representative.name,
      email: representative.email,
      phone: representative.phone,
      region: representative.region,
      status: representative.status,
      totalSales: representative.totalSales,
      monthlyGoal: representative.monthlyGoal,
      clientsCount: representative.clientsCount,
      lastActivity: representative.lastActivity
        ? representative.lastActivity.toISOString()
        : null,
      avatar: representative.avatar ?? null,
    }
  }
}
